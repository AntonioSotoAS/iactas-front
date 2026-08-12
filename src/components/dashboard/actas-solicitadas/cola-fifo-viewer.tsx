"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  IconRefresh, 
  IconClock, 
  IconPlayerPlay, 
  IconCheck, 
  IconAlertCircle,
  IconUsers,
  IconActivity
} from "@tabler/icons-react"
import { ColaFifoItem } from "@/types/actaSolicitud"

interface ColaFifoViewerProps {
  colaFifo: ColaFifoItem[]
  isLoading: boolean
  onRefresh: () => void
  isConnected?: boolean
}

export function ColaFifoViewer({ colaFifo, isLoading, onRefresh, isConnected = false }: ColaFifoViewerProps) {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // La lógica de polling por intervalo ha sido removida en favor de WebSockets.
  // Solo actualizamos la fecha de última actualización cuando cambian los props.
  useEffect(() => {
    setLastUpdate(new Date())
  }, [colaFifo])

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'URGENTE': return 'bg-red-100 text-red-800 border-red-200'
      case 'ALTA': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'NORMAL': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'BAJA': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'URGENTE': return <IconAlertCircle className="h-4 w-4" />
      case 'ALTA': return <IconActivity className="h-4 w-4" />
      case 'NORMAL': return <IconClock className="h-4 w-4" />
      case 'BAJA': return <IconClock className="h-4 w-4" />
      default: return <IconClock className="h-4 w-4" />
    }
  }

  const formatTiempoEstimado = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos} min`
    }
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}min`
  }

  const calcularProgresoCola = (posicion: number, total: number) => {
    if (total === 0) return 0
    return Math.round(((total - posicion + 1) / total) * 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Cola FIFO de Procesamiento
          </CardTitle>
          <CardDescription>
            Solicitudes pendientes ordenadas por prioridad y fecha de creación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando cola...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                Cola FIFO de Procesamiento
                <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>
                  {isConnected ? "En vivo" : "Desconectado"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Solicitudes pendientes ordenadas por prioridad y fecha de creación
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <IconRefresh className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}</span>
            <span>Total en cola: {colaFifo.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de solicitudes en cola */}
      <div className="space-y-3">
        {colaFifo.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <IconCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium">¡Cola vacía!</h3>
                <p className="text-muted-foreground">
                  No hay solicitudes pendientes de procesamiento
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          colaFifo.map((item) => (
            <Card key={item.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Posición en cola */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {item.posicion_cola}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">Posición</span>
                    </div>

                    {/* Información de la solicitud */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.titulo}</h4>
                        <Badge className={getPrioridadColor(item.prioridad)}>
                          {getPrioridadIcon(item.prioridad)}
                          <span className="ml-1">{item.prioridad}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">ID:</span>
                          <span className="ml-1 font-medium">#{item.id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Intentos:</span>
                          <span className="ml-1 font-medium">{item.intentos}/{item.max_intentos}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Creado:</span>
                          <span className="ml-1">
                            {new Date(item.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tiempo estimado:</span>
                          <span className="ml-1 font-medium text-blue-600">
                            {formatTiempoEstimado(item.tiempo_estimado_minutos)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progreso visual */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="w-24">
                      <Progress 
                        value={calcularProgresoCola(item.posicion_cola, colaFifo.length)} 
                        className="h-2"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {calcularProgresoCola(item.posicion_cola, colaFifo.length)}% completado
                    </span>
                  </div>
                </div>

                {/* Indicador de estado actual */}
                {item.estado === 'procesando' && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-800 animate-pulse">
                      <IconPlayerPlay className="h-3 w-3 mr-1" />
                      Procesando
                    </Badge>
                  </div>
                )}
                {item.estado === 'pendiente' && item.posicion_cola === 1 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      <IconClock className="h-3 w-3 mr-1" />
                      Siguiente
                    </Badge>
                  </div>
                )}
                {item.estado === 'error' && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-100 text-red-800">
                      <IconAlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Información adicional */}
      {colaFifo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de la Cola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Tiempo Total Estimado</div>
                <div className="text-lg font-bold text-blue-900">
                  {formatTiempoEstimado(
                    colaFifo.reduce((total, item) => total + item.tiempo_estimado_minutos, 0)
                  )}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">
                  {colaFifo.find(item => item.estado === 'procesando') ? 'Procesando Ahora' : 'Siguiente en Procesar'}
                </div>
                <div className="text-lg font-bold text-green-900">
                  {colaFifo.find(item => item.estado === 'procesando')?.titulo || colaFifo[0]?.titulo || 'N/A'}
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800">Prioridad Más Alta</div>
                <div className="text-lg font-bold text-orange-900">
                  {colaFifo[0]?.prioridad || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
