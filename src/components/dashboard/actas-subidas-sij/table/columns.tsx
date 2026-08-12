"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react"
import type { ActaSubidaSij } from "@/types/actaSubidaSij"

export const columns: ColumnDef<ActaSubidaSij>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "diasTranscurridos",
    header: "Días Transcurridos fech.aud - env.des",
    cell: ({ row }) => {
      const acta = row.original
      
      // Verificar si tenemos fecha de audiencia
      if (!acta.actaGenerada?.f_ini_prog) {
        return (
          <div className="text-gray-400 text-sm">
            Sin fecha audiencia
          </div>
        )
      }
      
      const fechaAudiencia = new Date(acta.actaGenerada.f_ini_prog as string)
      const fechaEnvio = acta.fEnvDespActa ? new Date(acta.fEnvDespActa) : null
      
      if (!fechaEnvio) {
        return (
          <Badge variant="outline" className="text-orange-600 bg-orange-50">
            Pendiente
          </Badge>
        )
      }
      
      // Calcular diferencia en días calendario
      const fechaAudienciaNormalizada = new Date(fechaAudiencia.getFullYear(), fechaAudiencia.getMonth(), fechaAudiencia.getDate())
      const fechaEnvioNormalizada = new Date(fechaEnvio.getFullYear(), fechaEnvio.getMonth(), fechaEnvio.getDate())
      const diferenciaMs = fechaEnvioNormalizada.getTime() - fechaAudienciaNormalizada.getTime()
      const diasTranscurridos = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))
      
      return (
        <div className="text-sm">
          <Badge 
            variant={diasTranscurridos <= 1 ? "default" : diasTranscurridos <= 3 ? "secondary" : "destructive"}
            className={
              diasTranscurridos <= 1 
                ? "bg-green-100 text-green-700" 
                : diasTranscurridos <= 3 
                ? "bg-yellow-100 text-yellow-700" 
                : "bg-red-100 text-red-700"
            }
          >
            {diasTranscurridos} día{diasTranscurridos !== 1 ? 's' : ''}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "lCantPaginas",
    header: "Páginas",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          {row.getValue("lCantPaginas")} págs
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "rangoPaginas",
    header: "Rango de Páginas",
    cell: ({ row }) => {
      const paginas = row.getValue("lCantPaginas") as number
      
      let rango = ""
      let colorClass = ""
      
      if (paginas <= 10) {
        rango = "1 a 10 páginas"
        colorClass = "bg-blue-100 text-blue-700"
      } else if (paginas <= 20) {
        rango = "11 a 20 páginas"
        colorClass = "bg-green-100 text-green-700"
      } else if (paginas <= 30) {
        rango = "21 a 30 páginas"
        colorClass = "bg-yellow-100 text-yellow-700"
      } else {
        rango = "Más de 30 páginas"
        colorClass = "bg-red-100 text-red-700"
      }
      
      return (
        <div className="flex justify-center">
          <Badge variant="secondary" className={colorClass}>
            {rango}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "tipoAudiencia",
    header: "Tipo de Audiencia",
    cell: ({ row }) => {
      const acta = row.original
      if (!acta.actaGenerada?.x_desc_audiencia) {
        return (
          <div className="text-gray-400 text-sm">
            Sin tipo
          </div>
        )
      }
      return (
        <div className="text-sm">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {acta.actaGenerada.x_desc_audiencia as string}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "creadoPor",
    header: "Creado por",
    cell: ({ row }) => {
      const acta = row.original
      if (!acta.actaGenerada?.creado_por_usuario) {
        return (
          <div className="text-gray-400 text-sm">
            Sin usuario
          </div>
        )
      }
      const usuario = acta.actaGenerada.creado_por_usuario as Record<string, unknown>
      const nombreCompleto = `${usuario.nombres} ${usuario.apellidos_paterno} ${usuario.apellidos_materno}`.toUpperCase()
      
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {nombreCompleto}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "fechaAudiencia",
    header: "Fecha de Audiencia",
    cell: ({ row }) => {
      const acta = row.original
      if (!acta.actaGenerada?.f_ini_prog) {
        return (
          <div className="text-gray-400 text-sm">
            Sin fecha
          </div>
        )
      }
      const fecha = new Date(acta.actaGenerada.f_ini_prog as string)
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {fecha.toLocaleDateString('es-ES')}
          </div>
          <div className="text-gray-500 text-xs">
            {fecha.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "fechaActaGenerada",
    header: "Fecha Acta Generada",
    cell: ({ row }) => {
      const acta = row.original
      if (!acta.actaGenerada?.updated_at) {
        return (
          <div className="text-gray-400 text-sm">
            Sin fecha
          </div>
        )
      }
      const fecha = new Date(acta.actaGenerada.updated_at as string)
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {fecha.toLocaleDateString('es-ES')}
          </div>
          <div className="text-gray-500 text-xs">
            {fecha.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "fCreaActa",
    header: "Fecha Creación",
    cell: ({ row }) => {
      const fecha = new Date(row.getValue("fCreaActa"))
      return (
        <div className="text-sm">
          <div className="font-medium">
            {fecha.toLocaleDateString('es-ES')}
          </div>
          <div className="text-gray-500">
            {fecha.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "fEnvDespActa",
    header: "Enviado a Despacho",
    cell: ({ row }) => {
      const fecha = row.getValue("fEnvDespActa") as string
      if (!fecha) {
        return (
          <Badge variant="outline" className="text-gray-500">
            No enviado
          </Badge>
        )
      }
      const fechaObj = new Date(fecha)
      return (
        <div className="text-sm">
          <div className="font-medium text-green-700">
            {fechaObj.toLocaleDateString('es-ES')}
          </div>
          <div className="text-gray-500">
            {fechaObj.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "fDescActa",
    header: "Descargado",
    cell: ({ row }) => {
      const fecha = row.getValue("fDescActa") as string
      if (!fecha) {
        return (
          <Badge variant="outline" className="text-gray-500">
            No descargado
          </Badge>
        )
      }
      const fechaObj = new Date(fecha)
      return (
        <div className="text-sm">
          <div className="font-medium text-blue-700">
            {fechaObj.toLocaleDateString('es-ES')}
          </div>
          <div className="text-gray-500">
            {fechaObj.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "lIndPdf",
    header: "PDF",
    cell: ({ row }) => {
      const indicador = row.getValue("lIndPdf") as string
      return (
        <Badge 
          variant={indicador === 'S' ? "default" : "secondary"}
          className={indicador === 'S' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
        >
          {indicador === 'S' ? 'Sí' : 'No'}
        </Badge>
      )
    },
  },
  // Columna de acciones comentada por ahora
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
  //           className="h-8 w-8 p-0"
  //           onClick={() => {
  //             // TODO: Implementar vista de detalles
  //             console.log('Ver detalles:', acta.id)
  //           }}
  //         >
  //           <IconEye className="h-4 w-4" />
  //         </Button>
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           className="h-8 w-8 p-0"
  //           onClick={() => {
  //             // TODO: Implementar edición
  //             console.log('Editar:', acta.id)
  //           }}
  //         >
  //           <IconEdit className="h-4 w-4" />
  //         </Button>
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
  //           onClick={() => {
  //             // TODO: Implementar eliminación
  //             console.log('Eliminar:', acta.id)
  //           }}
  //         >
  //           <IconTrash className="h-4 w-4" />
  //         </Button>
  //       </div>
  //     )
  //   },
  // },
]
