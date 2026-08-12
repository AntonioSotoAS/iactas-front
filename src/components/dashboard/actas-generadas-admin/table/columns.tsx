"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ActaGenerada, EstadoActa } from "@/types/actaGenerada"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconFileText, IconChevronDown, IconEye, IconFile, IconFileText as IconFileTextIcon } from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
