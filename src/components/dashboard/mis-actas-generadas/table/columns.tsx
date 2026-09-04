"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IconDownload, IconRefresh, IconAlertCircle, IconSparkles, IconCopy, IconCheck } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ActaGenerada, EstadoActa } from "@/types/actaGenerada"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useDownloadFileByUriMutation } from "@/store/api/uploadApi"
import { useRetryActaSolicitudMutation } from "@/store/api/actaSolicitudApi"

const getEstadoBadge = (estado: EstadoActa) => {
  const estados: Record<EstadoActa, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
    [EstadoActa.PENDIENTE]: { label: "Pendiente", variant: "outline", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    [EstadoActa.GENERADA]: { label: "Generada", variant: "outline", className: "bg-green-100 text-green-800 border-green-200" },
    [EstadoActa.SUBIDA_SIJ]: { label: "Subida al SIJ", variant: "outline", className: "bg-green-100 text-green-800 border-green-200" },
    [EstadoActa.ERROR]: { label: "Error", variant: "destructive" },
    [EstadoActa.CONTENIDO_PROHIBIDO]: { label: "Contenido Prohibido", variant: "destructive" },
    [EstadoActa.AGREGAR]: { label: "Agregar", variant: "outline", className: "bg-blue-100 text-blue-800 border-blue-200" },
  }

  const estadoInfo = estados[estado] || { label: estado, variant: "secondary" as const }

  return (
    <Badge variant={estadoInfo.variant} className={estadoInfo.className}>
      {estadoInfo.label}
    </Badge>
  )
}

// Componente para botón y modal de Resumen Ejecutivo IA
const ResumenModalButton = ({ acta }: { acta: ActaGenerada }) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const resumenText = acta.markdown_respuesta || 'No se generó un resumen ejecutivo para este registro.'

  const handleCopy = () => {
    navigator.clipboard.writeText(resumenText)
    setCopied(true)
    toast.success('Resumen copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1.5"
        title="Ver Resumen Ejecutivo de la Audiencia"
      >
        <IconSparkles className="h-3.5 w-3.5 text-purple-600" />
        Ver Resumen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
              <IconSparkles className="h-5 w-5 text-purple-600" />
              Resumen Ejecutivo IA - {acta.expediente}
            </DialogTitle>
            <DialogDescription>
              Síntesis ejecutiva de la audiencia para lectura rápida por parte del especialista legal.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border text-xs whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
            {resumenText}
          </div>

          <DialogFooter className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs flex items-center gap-1">
              {copied ? <IconCheck className="h-4 w-4 text-green-600" /> : <IconCopy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar Resumen'}
            </Button>

            <Button variant="default" size="sm" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Componente para mostrar estado con opción de reintentar
const EstadoActaCell = ({ row }: { row: { getValue: (key: string) => EstadoActa; original: ActaGenerada } }) => {
  const estadoOriginal = row.getValue("estado") as EstadoActa
  const acta = row.original as ActaGenerada
  const [retryActaSolicitud, { isLoading: isRetryingMutation }] = useRetryActaSolicitudMutation()
  const [isOptimisticRetrying, setIsOptimisticRetrying] = useState(false)
  const [retrySuccess, setRetrySuccess] = useState(false)

  // Actuar visualmente como pendiente tras el éxito para "ganarle" a la latencia de la base de datos
  const estado = retrySuccess ? EstadoActa.PENDIENTE : estadoOriginal

  // Desactivar el loading interno en cuanto notemos que el estado general de este registro cambia en RTK Query
  useEffect(() => {
    if (estadoOriginal !== EstadoActa.ERROR) {
      setIsOptimisticRetrying(false)
      setRetrySuccess(false)
    }
  }, [estadoOriginal])

  // Mantener el indicador cargando mientras transcurre la petición HTTP o mientras esperamos el refetch
  const isRetrying = isRetryingMutation || isOptimisticRetrying

  const isMaxRetriesReached = acta.acta_solicitud && acta.acta_solicitud.intentos >= acta.acta_solicitud.max_intentos

  // Se retiró !isRetrying para que el componente no desaparezca durante la recarga y en su lugar muestre el spinner
  const canRetry = 
    estado === EstadoActa.ERROR && 
    acta.acta_solicitud_id &&
    !isMaxRetriesReached

  const handleRetry = async () => {
    if (!acta.acta_solicitud_id || isRetrying) return
    
    setIsOptimisticRetrying(true)
    try {
      await retryActaSolicitud(acta.acta_solicitud_id).unwrap()
      // Ocultar botón permanentemente y forzar la UI de la celda a Pendiente
      setRetrySuccess(true)
      setIsOptimisticRetrying(false)
    } catch (error) {
      console.error('Error al reintentar:', error)
      setIsOptimisticRetrying(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {estado === EstadoActa.PENDIENTE ? (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-600 border-t-transparent"></div>
            Pendiente
          </Badge>
        ) : (
          getEstadoBadge(estado)
        )}
      </div>
      <div className="flex items-center gap-2">
        {acta.acta_subida_al_sij && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            Subida al SIJ
          </Badge>
        )}
        {canRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            title="Reintentar procesamiento"
            className={`text-xs ${isRetrying ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
          >
            {isRetrying ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
            ) : (

              <IconRefresh className="h-3 w-3 mr-1" />
            )}
            Reintentar
          </Button>
        )}
        {estado === EstadoActa.ERROR && isMaxRetriesReached && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200 cursor-help">
                  <IconAlertCircle className="h-3 w-3 mr-1" />
                  Límite de intentos
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-center">
                <p>Se alcanzó el límite de intentos ({acta.acta_solicitud?.max_intentos}) para procesar esta acta.</p>
                <p className="font-semibold mt-1">Por favor comuníquese con el área de informática.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

// Componente para botón de descarga desde URI
const DownloadUriButton = ({ uri, tipo, expediente }: { uri: string; tipo: 'modelo' | 'transcripcion' | 'acta'; expediente: string }) => {
  const [downloadFileByUri, { isLoading }] = useDownloadFileByUriMutation()

  const handleDownload = async () => {
    if (!uri) return
    
    try {
      // Usar el hook del API para descargar el archivo
      const result = await downloadFileByUri(uri)
      
      if (result.data) {
        // Crear URL temporal para el blob
        const blobUrl = window.URL.createObjectURL(result.data)
        
        // Crear enlace temporal para descargar
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `${expediente}-${tipo === 'modelo' ? 'modelo' : tipo === 'transcripcion' ? 'transcripcion' : 'acta-generada'}.docx`
        document.body.appendChild(link)
        link.click()
        
        // Limpiar
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }
      
    } catch (error) {
      console.error(`Error al descargar ${tipo}:`, error)
      // Aquí podrías agregar una notificación de error al usuario
    }
  }

  if (!uri) {
    return <span className="text-muted-foreground">No disponible</span>
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleDownload}
      disabled={isLoading}
      title={`Descargar ${tipo === 'modelo' ? 'Modelo' : tipo === 'transcripcion' ? 'Transcripción' : 'Acta Generada'} desde URI`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <>
          <IconDownload className="h-4 w-4 mr-2" />
          Descargar
        </>
      )}
    </Button>
  )
}

export const createColumns = (): ColumnDef<ActaGenerada>[] => [
  {
    accessorKey: "expediente",
    header: "Expediente",
    cell: ({ row }) => {
      const expediente = row.getValue("expediente") as string
      return (
        <div className="font-medium">
          {expediente}
        </div>
      )
    },
  },
  {
    accessorKey: "acta_generada_uri",
    header: "Acta Generada",
    cell: ({ row }) => {
      const acta = row.original
      const actaGeneradaUri = acta.acta_generada_uri

      if (!actaGeneradaUri) {
        return <span className="text-muted-foreground">No disponible</span>
      }

      return <DownloadUriButton uri={actaGeneradaUri} tipo="acta" expediente={acta.expediente} />
    },
  },
  {
    accessorKey: "modelo_uri",
    header: "Modelo",
    cell: ({ row }) => {
      const acta = row.original
      const modeloUri = acta.modelo_uri

      return <DownloadUriButton uri={modeloUri || ''} tipo="modelo" expediente={acta.expediente} />
    },
  },
  {
    accessorKey: "transcripcion_uri",
    header: "Transcripción",
    cell: ({ row }) => {
      const acta = row.original
      const transcripcionUri = acta.transcripcion_uri

      return <DownloadUriButton uri={transcripcionUri || ''} tipo="transcripcion" expediente={acta.expediente} />
    },
  },
  {
    id: "resumen",
    header: "Resumen IA",
    cell: ({ row }) => {
      const acta = row.original
      return <ResumenModalButton acta={acta} />
    },
  },
  {
    accessorKey: "estado",
    header: "Estado del Acta",
    cell: (cellContext) => <EstadoActaCell row={cellContext.row} />,
  },
  {
    accessorKey: "creado_por_usuario",
    header: "Creado por",
    cell: ({ row }) => {
      const usuario = row.getValue("creado_por_usuario") as {
        nombres: string
        apellidos_paterno: string
        apellidos_materno: string
      } | undefined

      if (!usuario) {
        return <span className="text-muted-foreground">N/A</span>
      }

      return (
        <div className="text-sm">
          {`${usuario.nombres} ${usuario.apellidos_paterno} ${usuario.apellidos_materno}`}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Acta Generada",
    cell: ({ row }) => {
      const fecha = row.getValue("created_at") as string
      if (!fecha) return <span className="text-muted-foreground">N/A</span>
      
      try {
        const fechaObj = new Date(fecha)
        return (
          <div className="text-sm">
            {format(fechaObj, "dd/MM/yyyy HH:mm", { locale: es })}
          </div>
        )
      } catch {
        return <span className="text-muted-foreground">Fecha inválida</span>
      }
    },
  },
  // {
  //   id: "actions",
  //   header: "Acciones",
  //   cell: ({ row }) => {
  //     const acta = row.original

  //     return (
  //       <div className="flex items-center gap-2">
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           onClick={() => {
  //             // Aquí puedes implementar la lógica para ver el acta
  //             console.log("Ver acta:", acta.id)
  //           }}
  //           title="Ver acta"
  //         >
  //           <IconEye className="h-4 w-4 mr-2" />
  //           Ver Acta
  //         </Button>
          
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           onClick={() => {
  //             // Aquí puedes implementar la lógica para descargar el acta
  //             console.log("Descargar acta:", acta.id)
  //           }}
  //           title="Descargar acta"
  //         >
  //           <IconDownload className="h-4 w-4 mr-2" />
  //           Descargar Acta
  //         </Button>

  //         {acta.acta_subida_al_sij && (
  //           <Button
  //             variant="ghost"
  //             size="sm"
  //             onClick={() => {
  //               // Aquí puedes implementar la lógica para abrir en SIJ
  //               console.log("Abrir en SIJ:", acta.id)
  //             }}
  //             title="Abrir en SIJ"
  //           >
  //             <IconExternalLink className="h-4 w-4 mr-2" />
  //             Abrir en SIJ
  //           </Button>
  //         )}
  //       </div>
  //     )
  //   },
  // },
]
