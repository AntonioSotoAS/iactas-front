"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconSearch, IconRefresh, IconFilter } from "@tabler/icons-react"
import { DataTable } from "@/components/dashboard/mis-actas-generadas/table/data-table"
import { createColumns } from "@/components/dashboard/mis-actas-generadas/table/columns"
import { useActasGeneradas } from "@/hooks/use-actas-generadas"
import { useUser } from "@/hooks/use-user"
import { useSocketSolicitudes } from "@/hooks/use-socket-solicitudes"
import { EstadoActa } from "@/types/actaGenerada"
import { MiColaProcesamiento } from "@/components/dashboard/mis-actas-generadas/mi-cola-procesamiento"

export default function MisActasGeneradasPage() {
  const [filters, setFilters] = useState({
    search: "",
    estado: "todos",
    expediente: "",
  })

  const { user } = useUser()

  const {
    actas,
    isLoading,
    isError,
    error,
    refetch
  } = useActasGeneradas(filters)

  const { isConnected } = useSocketSolicitudes({
    userId: user?.id,
    enabled: Boolean(user?.id),
  })

  const hasActasProcesando =
    actas?.data?.some((acta) => acta.estado === EstadoActa.PENDIENTE) || false

  const handleSearch = () => {
    refetch()
  }

  const handleRefresh = () => {
    setFilters({
      search: "",
      estado: "todos",
      expediente: "",
    })
    refetch()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Crear columnas dinámicamente
  const columns = createColumns()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mis Actas Generadas</h1>
          <Button disabled>
            <IconRefresh className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando actas generadas...</p>
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
          <h1 className="text-2xl font-bold">Mis Actas Generadas</h1>
          <Button onClick={() => window.location.reload()} variant="outline">
            <IconRefresh className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Error al cargar actas generadas</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error && typeof error === 'object' && 'data' in error
                  ? (error.data as { message?: string })?.message
                  : "Ha ocurrido un error inesperado"}
              </p>
              <Button onClick={() => window.location.reload()}>
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
          <h1 className="text-2xl font-bold">Mis Actas Generadas</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Gestiona y consulta tus actas generadas
            </p>
            {hasActasProcesando && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1" />
                Actualización en tiempo real
              </span>
            )}
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <IconRefresh className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>

      <MiColaProcesamiento
        actas={actas?.data || []}
        isConnected={isConnected}
      />

      {/* Sección de filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra las actas generadas por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar en contenido</label>
              <Input
                placeholder="Buscar en markdown..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filters.estado} onValueChange={(value) => handleFilterChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value={EstadoActa.PENDIENTE}>Pendiente</SelectItem>
                  <SelectItem value={EstadoActa.GENERADA}>Generada</SelectItem>
                  <SelectItem value={EstadoActa.SUBIDA_SIJ}>Subida al SIJ</SelectItem>
                  <SelectItem value={EstadoActa.ERROR}>Error</SelectItem>
                  <SelectItem value={EstadoActa.AGREGAR}>Agregar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expediente</label>
              <Input
                placeholder="Número de expediente..."
                value={filters.expediente}
                onChange={(e) => handleFilterChange("expediente", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch} disabled={isLoading}>
              <IconSearch className="h-4 w-4 mr-2" />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de actas generadas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Actas Generadas</CardTitle>
          <CardDescription>
            {actas?.total ? `${actas.total} actas encontradas` : "No se encontraron actas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={actas?.data || []} />
        </CardContent>
      </Card>
    </div>
  )
}
