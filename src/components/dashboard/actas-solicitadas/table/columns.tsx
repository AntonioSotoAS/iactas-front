"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  IconEye, 
  IconX, 
  IconCheck, 
  IconAlertCircle,
  IconClock,
  IconPlayerPlay
} from "@tabler/icons-react"
import { ActaSolicitud } from "@/types/actaSolicitud"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Componente para mostrar detalles de la solicitud
function SolicitudDetailsModal({ solicitud }: { solicitud: ActaSolicitud }) {
  const [showModal, setShowModal] = useState(false)

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'procesando': return 'bg-blue-100 text-blue-800'
      case 'completada': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'cancelada': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'urgente': return 'bg-red-100 text-red-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'baja': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowModal(true)}
      >
        <IconEye className="h-4 w-4 mr-2" />
        Ver Detalles
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de generación de acta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Título</p>
                    <p className="font-medium">{solicitud.titulo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="font-medium">#{solicitud.id}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                  <p className="text-sm">{solicitud.descripcion || 'Sin descripción'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge className={getEstadoColor(solicitud.estado)}>
                      {solicitud.estado}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prioridad</p>
                    <Badge className={getPrioridadColor(solicitud.prioridad)}>
                      {solicitud.prioridad}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URLs de archivos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Archivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modelo de Acta</p>
                  <p className="text-sm break-all text-blue-600">
                    {solicitud.url_modelo || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transcripción</p>
                  <p className="text-sm break-all text-blue-600">
                    {solicitud.url_transcripcion || 'No especificado'}
                  </p>
                </div>
                {solicitud.url_acta_generada && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acta Generada</p>
                    <p className="text-sm break-all text-green-600">
                      {solicitud.url_acta_generada}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de procesamiento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Procesamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Intentos</p>
                    <p className="font-medium">{solicitud.intentos}/{solicitud.max_intentos}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                    <p className="font-medium">{solicitud.usuario?.nombres || 'Desconocido'}</p>
                  </div>
                </div>

                {solicitud.error_message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error</p>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {solicitud.error_message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Creado</p>
                    <p className="text-sm">
                      {new Date(solicitud.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Actualizado</p>
                    <p className="text-sm">
                      {new Date(solicitud.updated_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>

                {solicitud.fecha_procesamiento && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inicio de Procesamiento</p>
                    <p className="text-sm">
                      {new Date(solicitud.fecha_procesamiento).toLocaleString('es-ES')}
                    </p>
                  </div>
                )}

                {solicitud.fecha_completado && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completado</p>
                    <p className="text-sm">
                      {new Date(solicitud.fecha_completado).toLocaleString('es-ES')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function createColumns(): ColumnDef<ActaSolicitud>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            #{row.getValue("id")}
          </div>
        )
      },
    },
    {
      accessorKey: "titulo",
      header: "TÍTULO",
      cell: ({ row }) => {
        const titulo = row.getValue("titulo") as string
        return (
          <div className="max-w-[200px]">
            <p className="font-medium truncate" title={titulo}>
              {titulo}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "estado",
      header: "ESTADO",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as string
        const getEstadoColor = (estado: string) => {
          switch (estado.toLowerCase()) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800'
            case 'procesando': return 'bg-blue-100 text-blue-800'
            case 'completada': return 'bg-green-100 text-green-800'
            case 'error': return 'bg-red-100 text-red-800'
            case 'cancelada': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
          }
        }
        
        const getEstadoIcon = (estado: string) => {
          switch (estado.toLowerCase()) {
            case 'pendiente': return <IconClock className="h-3 w-3" />
            case 'procesando': return <IconPlayerPlay className="h-3 w-3" />
            case 'completada': return <IconCheck className="h-3 w-3" />
            case 'error': return <IconAlertCircle className="h-3 w-3" />
            case 'cancelada': return <IconX className="h-3 w-3" />
            default: return <IconClock className="h-3 w-3" />
          }
        }

        return (
          <Badge className={`${getEstadoColor(estado)} flex items-center gap-1`}>
            {getEstadoIcon(estado)}
            {estado}
          </Badge>
        )
      },
    },
    {
      accessorKey: "prioridad",
      header: "PRIORIDAD",
      cell: ({ row }) => {
        const prioridad = row.getValue("prioridad") as string
        const getPrioridadColor = (prioridad: string) => {
          switch (prioridad.toLowerCase()) {
            case 'urgente': return 'bg-red-100 text-red-800'
            case 'alta': return 'bg-orange-100 text-orange-800'
            case 'normal': return 'bg-blue-100 text-blue-800'
            case 'baja': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
          }
        }

        return (
          <Badge className={getPrioridadColor(prioridad)}>
            {prioridad}
          </Badge>
        )
      },
    },
    {
      accessorKey: "usuario",
      header: "USUARIO",
      cell: ({ row }) => {
        const solicitud = row.original
        return (
          <div>
            <p className="font-medium">{solicitud.usuario?.nombres || 'Desconocido'}</p>
            <p className="text-xs text-muted-foreground">{solicitud.usuario?.correo}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "intentos",
      header: "INTENTOS",
      cell: ({ row }) => {
        const solicitud = row.original
        return (
          <div className="text-center">
            <p className="font-medium">{solicitud.intentos}/{solicitud.max_intentos}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "FECHA CREACIÓN",
      cell: ({ row }) => {
        const fecha = row.getValue("created_at") as string
        return (
          <div>
            <p className="text-sm">
              {new Date(fecha).toLocaleDateString('es-ES')}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(fecha).toLocaleTimeString('es-ES')}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "ACCIONES",
      cell: ({ row }) => {
        const solicitud = row.original

        return (
          <div className="flex items-center space-x-2">
            <SolicitudDetailsModal solicitud={solicitud} />
          </div>
        )
      },
    },
  ]
}
