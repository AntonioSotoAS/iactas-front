"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconRefresh, IconClock, IconList } from "@tabler/icons-react"
import { DataTable } from "@/components/dashboard/actas-solicitadas/table/data-table"
import { createColumns } from "@/components/dashboard/actas-solicitadas/table/columns"
import { useActaSolicitudes } from "@/hooks/use-acta-solicitudes"
import { useSocketSolicitudes } from "@/hooks/use-socket-solicitudes"
import { ColaFifoViewer } from "@/components/dashboard/actas-solicitadas/cola-fifo-viewer"
import { EstadisticasCola } from "@/components/dashboard/actas-solicitadas/estadisticas-cola"

export default function ActasSolicitadasPage() {
  const [activeTab, setActiveTab] = useState("solicitudes")
  
  const { 
    solicitudes, 
    isLoading, 
    isError, 
    error, 
    refreshSolicitudes,
    colaFifo,
    estadisticasCola,
    isLoadingCola,
    refreshCola
  } = useActaSolicitudes()


  const { status } = useSocketSolicitudes()

  const handleRefresh = () => {
    refreshSolicitudes()
    refreshCola()
  }


  // Crear columnas dinámicamente
  const columns = createColumns()

  if (isLoading && solicitudes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Actas Solicitadas</h1>
          <Button disabled>
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando solicitudes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Actas Solicitadas</h1>
          <Button onClick={handleRefresh} variant="outline">
            <IconRefresh className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Error al cargar solicitudes</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error && typeof error === 'object' && 'data' in error 
                  ? (error.data as { message?: string })?.message 
                  : "Ha ocurrido un error inesperado"}
              </p>
              <Button onClick={handleRefresh}>
                <IconRefresh className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Actas Solicitadas</h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de generación de actas y monitorea la cola de procesamiento
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <IconRefresh className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>


      {/* Estadísticas de la cola */}
      <EstadisticasCola estadisticas={estadisticasCola} isLoading={isLoadingCola} />

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solicitudes" className="flex items-center gap-2">
            <IconList className="h-4 w-4" />
            Historial Completo
          </TabsTrigger>
          <TabsTrigger value="cola" className="flex items-center gap-2">
            <IconClock className="h-4 w-4" />
            Cola FIFO
          </TabsTrigger>
        </TabsList>

        {/* Tab: Todas las solicitudes */}
        <TabsContent value="solicitudes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Solicitudes</CardTitle>
              <CardDescription>
                Todas las solicitudes de generación de actas (pendientes, procesando, completadas, con error)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={solicitudes} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cola FIFO */}
        <TabsContent value="cola" className="space-y-4">
          <ColaFifoViewer 
            colaFifo={colaFifo} 
            isLoading={isLoadingCola}
            onRefresh={refreshCola}
            isConnected={status === 'connected'}
          />
        </TabsContent>

      </Tabs>

    </div>
  )
}
