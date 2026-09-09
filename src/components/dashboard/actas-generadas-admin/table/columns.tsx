"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ActaGenerada, EstadoActa } from "@/types/actaGenerada"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconFileText, IconChevronDown, IconEye, IconFile, IconFileText as IconFileTextIcon, IconSparkles, IconStar } from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalificarActaModal, CalificacionData, CALIFICACIONES_OPTIONS } from "@/components/dashboard/calificar-acta-modal"

// Componente para celda de Calificación de Acta en Admin
const CalificarActaAdminCell = ({ acta }: { acta: ActaGenerada }) => {
  const [openModal, setOpenModal] = useState(false)
  const [calificacion, setCalificacion] = useState<CalificacionData | null>(null)

  const loadCalificacion = () => {
    try {
      const stored = localStorage.getItem(`iactas_calificacion_acta_${acta.id}`)
      if (stored) {
        setCalificacion(JSON.parse(stored))
      } else {
        setCalificacion(null)
      }
    } catch {
      setCalificacion(null)
    }
  }

  useEffect(() => {
    loadCalificacion()

    const handleUpdate = (e: Event) => {
      const customEv = e as CustomEvent<CalificacionData>
      if (customEv.detail && customEv.detail.actaId === acta.id) {
        setCalificacion(customEv.detail)
      }
    }

    window.addEventListener('iactas_calificacion_updated', handleUpdate)
    return () => {
      window.removeEventListener('iactas_calificacion_updated', handleUpdate)
    }
  }, [acta.id])

  const option = calificacion
    ? CALIFICACIONES_OPTIONS.find((opt) => opt.valor === calificacion.puntuacion)
    : null

  return (
    <>
      {calificacion && option ? (
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${option.bgColor} ${option.borderColor} ${option.color} hover:opacity-90 shadow-2xs`}
          title={calificacion.comentario ? `Comentario: "${calificacion.comentario}"` : "Clic para ver valoración"}
        >
          <option.icon className="w-4 h-4" />
          <span>{option.etiqueta}</span>
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenModal(true)}
          className="text-xs flex items-center gap-1.5 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-2xs font-semibold"
        >
          <IconStar className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
          <span>Calificar</span>
        </Button>
      )}

      <CalificarActaModal
        acta={acta}
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={(nuevaCalific) => setCalificacion(nuevaCalific)}
      />
    </>
  )
}

interface ViewCallbacks {
  onViewActa: (acta: ActaGenerada) => void
  onViewModelo: (acta: ActaGenerada) => void
  onViewTranscripcion: (acta: ActaGenerada) => void
}

export const createColumns = (callbacks: ViewCallbacks): ColumnDef<ActaGenerada>[] => [
  {
    accessorKey: "id",
    header: "N°",
    cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
  },
  {
    accessorKey: "expediente",
    header: "Expediente",
    cell: ({ row }) => <div className="font-medium">{row.getValue("expediente")}</div>,
  },
  {
    id: "tipo_generacion",
    header: "Tipo",
    cell: ({ row }) => {
      const acta = row.original as ActaGenerada & { tipo_generacion?: string; tipo?: string; nombre_modelo?: string }
      const tipo = (acta.tipo_generacion || acta.tipo || "").toLowerCase()

      if (tipo === 'modelo' || tipo === 'por_modelo' || tipo === 'por modelo') {
        const nombreModelo = acta.nombre_modelo || ''
        const etiqueta = nombreModelo ? `Por Modelo: ${nombreModelo}` : 'Por Modelo'

        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 text-xs font-semibold flex items-center gap-1 w-fit max-w-[220px]"
            title={nombreModelo ? `Modelo de acta: ${nombreModelo}` : 'Generado por Modelo'}
          >
            <IconFileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">{etiqueta}</span>
          </Badge>
        )
      }

      if (tipo === 'automatico' || tipo === 'automático') {
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 text-xs font-semibold flex items-center gap-1 w-fit">
            <IconSparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Automático</span>
          </Badge>
        )
      }

      return <span className="text-muted-foreground text-xs font-medium px-2 py-0.5">-</span>
    },
  },
  {
    id: "calificacion",
    header: "Calificación",
    cell: ({ row }) => <CalificarActaAdminCell acta={row.original} />,
  },
  {
    accessorKey: "creado_por_usuario",
    header: "Creado por",
    cell: ({ row }) => {
      const usuario = row.getValue("creado_por_usuario") as { nombres?: string; apellidos_paterno?: string; apellidos_materno?: string; correo?: string } | null
      if (usuario) {
        const nombres = usuario.nombres || ""
        const apellidosPaterno = usuario.apellidos_paterno || ""
        const apellidosMaterno = usuario.apellidos_materno || ""

        const nombreCompleto = `${nombres} ${apellidosPaterno} ${apellidosMaterno}`.trim()

        return (
          <div className="flex flex-col">
            <span className="font-medium">{nombreCompleto}</span>
            <span className="text-sm text-muted-foreground">{usuario.correo}</span>
          </div>
        )
      }
      return <span className="text-muted-foreground">No disponible</span>
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as EstadoActa
      const getEstadoColor = (estado: EstadoActa) => {
        switch (estado) {
          case EstadoActa.PENDIENTE:
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          case EstadoActa.GENERADA:
            return "bg-green-100 text-green-800 hover:bg-green-100"
          case EstadoActa.SUBIDA_SIJ:
            return "bg-blue-100 text-blue-800 hover:bg-blue-100"
          case EstadoActa.ERROR:
            return "bg-red-100 text-red-800 hover:bg-red-100"
          case EstadoActa.CONTENIDO_PROHIBIDO:
            return "bg-red-100 text-red-800 hover:bg-red-100"
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
      }

      const getEstadoLabel = (estado: EstadoActa) => {
        switch (estado) {
          case EstadoActa.PENDIENTE:
            return "Pendiente"
          case EstadoActa.GENERADA:
            return "Generada"
          case EstadoActa.SUBIDA_SIJ:
            return "Subida al SIJ"
          case EstadoActa.ERROR:
            return "Error"
          default:
            return estado
        }
      }

      return (
        <Badge className={getEstadoColor(estado)}>
          {getEstadoLabel(estado)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ row }) => {
      const fecha = row.getValue("created_at") as string
      if (fecha) {
        try {
          const fechaFormateada = format(new Date(fecha), "dd/MM/yyyy HH:mm", {
            locale: es,
          })
          return <div>{fechaFormateada}</div>
        } catch {
          return <div className="text-muted-foreground">Fecha inválida</div>
        }
      }
      return <div className="text-muted-foreground">No disponible</div>
    },
  },
  {
    accessorKey: "updated_at",
    header: "Última Actualización",
    cell: ({ row }) => {
      const fecha = row.getValue("updated_at") as string
      if (fecha) {
        try {
          const fechaFormateada = format(new Date(fecha), "dd/MM/yyyy HH:mm", {
            locale: es,
          })
          return <div>{fechaFormateada}</div>
        } catch {
          return <div className="text-muted-foreground">Fecha inválida</div>
        }
      }
      return <div className="text-muted-foreground">No disponible</div>
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const acta = row.original
      const hasActa = !!acta.acta_generada_uri
      const hasModelo = !!acta.modelo_uri
      const hasTranscripcion = !!acta.transcripcion_uri

      return (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconEye className="h-4 w-4 mr-2" />
                Ver
                <IconChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => callbacks.onViewActa(acta)}
                disabled={!hasActa}
                className="flex items-center gap-2"
              >
                <IconFileTextIcon className="h-4 w-4" />
                Ver Acta Generada
                {!hasActa && <span className="text-xs text-muted-foreground ml-auto">(No disponible)</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => callbacks.onViewModelo(acta)}
                disabled={!hasModelo}
                className="flex items-center gap-2"
              >
                <IconFile className="h-4 w-4" />
                Ver Modelo
                {!hasModelo && <span className="text-xs text-muted-foreground ml-auto">(No disponible)</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => callbacks.onViewTranscripcion(acta)}
                disabled={!hasTranscripcion}
                className="flex items-center gap-2"
              >
                <IconFileText className="h-4 w-4" />
                Ver Transcripción
                {!hasTranscripcion && <span className="text-xs text-muted-foreground ml-auto">(No disponible)</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
