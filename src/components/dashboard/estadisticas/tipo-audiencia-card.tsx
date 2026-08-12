"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Autocomplete } from "@/components/ui/autocomplete"
import { Progress } from "@/components/ui/progress"
import { 
  IconChartBar, 
  IconFilter, 
  IconCalendar, 
  IconSearch, 
  IconRefresh, 
  IconFileText,
  IconTrendingUp,
  IconPercentage,
  IconDownload
} from "@tabler/icons-react"
import { useGetSedesQuery } from "@/store/api/sedeApi"
import { useGetEstadisticasTipoActaQuery } from "@/store/api/estadisticaApi"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { EstadisticasTipoActaFilters } from "@/types/estadisticas"
import { generateTipoAudienciaPDF } from "@/utils/pdf-generator"

interface TipoAudienciaFilters {
  sedeId?: number
  fechaInicio?: Date
  fechaFin?: Date
}

const getTipoAudienciaColor = (index: number) => {
  const colors = [
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-green-500 to-green-600", 
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-orange-500 to-orange-600",
    "bg-gradient-to-r from-pink-500 to-pink-600",
    "bg-gradient-to-r from-indigo-500 to-indigo-600",
    "bg-gradient-to-r from-teal-500 to-teal-600",
    "bg-gradient-to-r from-red-500 to-red-600",
    "bg-gradient-to-r from-yellow-500 to-yellow-600",
    "bg-gradient-to-r from-cyan-500 to-cyan-600"
  ]
  return colors[index % colors.length]
}

const getTipoAudienciaTextColor = (index: number) => {
  const textColors = [
    "text-blue-600",
    "text-green-600",
    "text-purple-600", 
    "text-orange-600",
    "text-pink-600",
    "text-indigo-600",
    "text-teal-600",
    "text-red-600",
    "text-yellow-600",
    "text-cyan-600"
  ]
  return textColors[index % textColors.length]
}

export function TipoAudienciaCard() {
  // Configurar fechas por defecto para el mes actual
  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { firstDay, lastDay }
  }

  const { firstDay, lastDay } = getCurrentMonthDates()

  const [filters, setFilters] = useState<TipoAudienciaFilters>({
    fechaInicio: firstDay,
    fechaFin: lastDay
  })
  const [showFilters, setShowFilters] = useState(false)

  // Obtener sedes para el autocomplete
  const { 
    data: sedesData, 
    isLoading: isLoadingSedes, 
    isError: isErrorSedes, 
    error: errorSedes 
  } = useGetSedesQuery({})

  // Preparar filtros para la API
  const apiFilters: EstadisticasTipoActaFilters = {
    sedeId: filters.sedeId,
    fechaInicio: filters.fechaInicio?.toISOString(),
    fechaFin: filters.fechaFin?.toISOString()
  }

  // Obtener estadísticas por tipo de acta desde la API
  const {
    data: tipoActaData,
    isLoading: isLoadingTipoActa,
    isError: isErrorTipoActa,
    error: errorTipoActa,
    refetch: refetchTipoActa
  } = useGetEstadisticasTipoActaQuery(apiFilters)

  // Debug: Log para verificar el estado de la carga de sedes
  console.log("🔍 Estado de sedes:", {
    isLoadingSedes,
    isErrorSedes,
    errorSedes,
    sedesData,
    sedesCount: sedesData?.sedes?.length,
    apiUrl: process.env.NEXT_PUBLIC_API_URL
  })

  // Usar datos de la API
  const tipoAudienciaData = tipoActaData?.data || []
  const isLoading = isLoadingTipoActa
  const isError = isErrorTipoActa

  // Debug: Log para verificar el estado de las estadísticas por tipo de acta
  console.log("🔍 Estado de estadísticas por tipo de acta:", {
    isLoadingTipoActa,
    isErrorTipoActa,
    errorTipoActa,
    tipoActaData,
    apiFilters
  })

  // Debug: Log para verificar datos de tipos de audiencia
  console.log("📊 Datos de tipos de audiencia:", tipoAudienciaData.map(tipo => ({
    tipo_audiencia: tipo.tipo_audiencia,
    total_actas: tipo.total_actas,
    porcentaje: tipo.porcentaje
  })))

  const handleFilterChange = (key: keyof TipoAudienciaFilters, value: number | Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = () => {
    // Refetch con los nuevos filtros
    refetchTipoActa()
    console.log("Filtros aplicados:", filters)
  }

  const handleClearFilters = () => {
    setFilters({
      fechaInicio: firstDay,
      fechaFin: lastDay
    })
  }

  const handleGeneratePDF = () => {
    if (tipoAudienciaData.length === 0) {
      console.warn('No hay datos para generar el PDF')
      return
    }

    const reportOptions = {
      title: 'Estadísticas por Tipo de Audiencia',
      subtitle: 'Sistema de Gestión de Actas - Reporte de Estadísticas',
      filters: {
        sedeId: filters.sedeId,
        fechaInicio: filters.fechaInicio?.toISOString(),
        fechaFin: filters.fechaFin?.toISOString()
      },
      generatedAt: new Date()
    }

    generateTipoAudienciaPDF(tipoAudienciaData, reportOptions)
  }

  // Calcular total de actas para el cálculo de porcentajes
  const totalActas = tipoAudienciaData.reduce((sum, tipo) => sum + tipo.total_actas, 0)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <IconChartBar className="h-6 w-6 text-green-600" />
              Estadísticas por Tipo de Audiencia
            </CardTitle>
            <CardDescription className="mt-1">
              Distribución de actas generadas por tipo de audiencia
              <span className="block text-xs text-green-600 mt-1">
                📅 Filtrado por defecto: {format(firstDay, "dd/MM/yyyy", { locale: es })} - {format(lastDay, "dd/MM/yyyy", { locale: es })}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              <IconFileText className="h-3 w-3 mr-1" />
              {isLoading ? "Cargando..." : `${tipoAudienciaData.length} tipos`}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePDF}
              disabled={isLoading || tipoAudienciaData.length === 0}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Generar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <IconFilter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Sección de Filtros */}
      {showFilters && (
        <div className="border-b bg-muted/30 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de Sede */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sede</Label>
              {isErrorSedes ? (
                <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  Error al cargar sedes: {errorSedes && typeof errorSedes === 'object' && 'data' in errorSedes 
                    ? (errorSedes.data as { message?: string })?.message 
                    : 'Error desconocido'}
                </div>
              ) : (
                <Autocomplete
                  placeholder={isLoadingSedes ? "Cargando sedes..." : "Seleccionar sede..."}
                  value={filters.sedeId ? sedesData?.sedes.find(s => s.id === filters.sedeId)?.nombre : ""}
                  onValueChange={(value) => {
                    const sede = sedesData?.sedes.find(s => s.nombre === value)
                    handleFilterChange("sedeId", sede?.id)
                  }}
                  options={sedesData?.sedes.map(sede => ({
                    value: sede.nombre,
                    label: sede.nombre,
                    id: sede.id
                  })) || []}
                />
              )}
            </div>

            {/* Filtro de Fecha Inicio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {filters.fechaInicio ? format(filters.fechaInicio, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fechaInicio}
                    onSelect={(date) => handleFilterChange("fechaInicio", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de Fecha Fin */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {filters.fechaFin ? format(filters.fechaFin, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fechaFin}
                    onSelect={(date) => handleFilterChange("fechaFin", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <IconSearch className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button onClick={handleClearFilters} variant="outline">
                <IconRefresh className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando estadísticas por tipo de audiencia...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <IconChartBar className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Error al cargar las estadísticas</p>
              <p className="text-xs text-muted-foreground mt-1">
                {errorTipoActa && typeof errorTipoActa === 'object' && 'data' in errorTipoActa
                  ? (errorTipoActa.data as { message?: string })?.message
                  : 'Error desconocido'}
              </p>
            </div>
            <Button onClick={() => refetchTipoActa()} variant="outline" size="sm">
              <IconRefresh className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : tipoAudienciaData.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <IconChartBar className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">No hay datos disponibles</p>
              <p className="text-xs text-muted-foreground mt-1">
                No se encontraron actas generadas en el rango de fechas seleccionado
              </p>
            </div>
            <Button onClick={() => refetchTipoActa()} variant="outline" size="sm">
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {tipoAudienciaData.map((tipo, index) => (
                <div
                  key={tipo.tipo_audiencia}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Indicador de color */}
                      <div className={`w-4 h-4 rounded-full ${getTipoAudienciaColor(index)}`}></div>

                      {/* Información del tipo de audiencia */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${getTipoAudienciaTextColor(index)}`}>
                          {tipo.tipo_audiencia}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <IconFileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {tipo.total_actas} actas
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconPercentage className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {tipo.porcentaje.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-32">
                      <Progress 
                        value={tipo.porcentaje} 
                        className="h-2"
                      />
                    </div>

                    {/* Estadísticas numéricas */}
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1">
                        <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-lg">{tipo.total_actas}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">actas</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con estadísticas adicionales */}
            <div className="bg-muted/30 px-4 py-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <IconFileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Total: {totalActas} actas
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconChartBar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {tipoAudienciaData.length} tipos de audiencia
                    </span>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  Período: {format(filters.fechaInicio || new Date(), "dd/MM/yyyy", { locale: es })} - {format(filters.fechaFin || new Date(), "dd/MM/yyyy", { locale: es })}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
