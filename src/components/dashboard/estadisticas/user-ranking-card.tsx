"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Autocomplete } from "@/components/ui/autocomplete"
import { IconTrophy, IconMedal, IconAward, IconUser, IconFileText, IconFilter, IconCalendar, IconSearch, IconRefresh, IconDownload, IconAlertCircle } from "@tabler/icons-react"
import { useGetSedesQuery } from "@/store/api/sedeApi"
import { useGetRankingUsuariosQuery } from "@/store/api/estadisticaApi"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { RankingUsuariosFilters } from "@/types/estadisticas"
import { generateRankingPDF } from "@/utils/pdf-generator"

interface RankingFilters {
  sedeId?: number
  fechaInicio?: Date
  fechaFin?: Date
  limit?: number
}


const getPositionIcon = (position: number) => {
  switch (position) {
    case 1:
      return <IconTrophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <IconMedal className="h-5 w-5 text-gray-400" />
    case 3:
      return <IconAward className="h-5 w-5 text-amber-600" />
    default:
      return <IconUser className="h-4 w-4 text-muted-foreground" />
  }
}

const getPositionBadgeColor = (position: number) => {
  switch (position) {
    case 1:
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
    case 2:
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
    case 3:
      return "bg-gradient-to-r from-amber-500 to-amber-700 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getInitials = (nombre: string, apellidos: string) => {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
}

export function UserRankingCard() {
  // Configurar fechas por defecto para el mes actual
  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { firstDay, lastDay }
  }

  const { firstDay, lastDay } = getCurrentMonthDates()

  const [filters, setFilters] = useState<RankingFilters>({
    limit: 1000,
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
  const apiFilters: RankingUsuariosFilters = {
    sedeId: filters.sedeId,
    fechaInicio: filters.fechaInicio?.toISOString(),
    fechaFin: filters.fechaFin?.toISOString(),
    limit: filters.limit
  }

  // Obtener ranking de usuarios desde la API
  const {
    data: rankingData,
    isLoading: isLoadingRanking,
    isError: isErrorRanking,
    error: errorRanking,
    refetch: refetchRanking
  } = useGetRankingUsuariosQuery(apiFilters)

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
  const userRankingData = rankingData?.data || []
  const isLoading = isLoadingRanking
  const isError = isErrorRanking

  // Debug: Log para verificar el estado del ranking
  console.log("🔍 Estado del ranking:", {
    isLoadingRanking,
    isErrorRanking,
    errorRanking,
    rankingData,
    apiFilters
  })

  // Debug: Log para verificar datos de usuarios y avatares
  console.log("👤 Datos de usuarios en ranking:", userRankingData.map(user => ({
    id: user.id,
    nombre: user.nombre,
    apellidos: user.apellidos,
    email: user.email,
    avatar: user.avatar,
    totalActas: user.totalActas,
    posicion: user.posicion
  })))

  const handleFilterChange = (key: keyof RankingFilters, value: number | Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = () => {
    // Refetch con los nuevos filtros
    refetchRanking()
    console.log("Filtros aplicados:", filters)
  }

  const handleClearFilters = () => {
    setFilters({
      limit: 1000,
      fechaInicio: firstDay,
      fechaFin: lastDay
    })
  }

  const handleGeneratePDF = () => {
    if (userRankingData.length === 0) {
      console.warn('No hay datos para generar el PDF')
      return
    }

    const reportOptions = {
      title: 'Ranking de Usuarios por Actas Generadas',
      subtitle: 'Sistema de Gestión de Actas - Reporte de Estadísticas',
      filters: {
        sedeId: filters.sedeId,
        fechaInicio: filters.fechaInicio?.toISOString(),
        fechaFin: filters.fechaFin?.toISOString(),
        limit: filters.limit
      },
      generatedAt: new Date()
    }

    generateRankingPDF(userRankingData, reportOptions)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <IconTrophy className="h-6 w-6 text-blue-600" />
              Ranking de Usuarios
            </CardTitle>
            <CardDescription className="mt-1">
              Usuarios que han generado más actas en el sistema
              <span className="block text-xs text-blue-600 mt-1">
                📅 Filtrado por defecto: {format(firstDay, "dd/MM/yyyy", { locale: es })} - {format(lastDay, "dd/MM/yyyy", { locale: es })}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              <IconFileText className="h-3 w-3 mr-1" />
              {isLoading ? "Cargando..." : `Top ${userRankingData.length}`}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePDF}
              disabled={isLoading || userRankingData.length === 0}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando ranking de usuarios...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <IconFileText className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Error al cargar el ranking</p>
              <p className="text-xs text-muted-foreground mt-1">
                {errorRanking && typeof errorRanking === 'object' && 'data' in errorRanking
                  ? (errorRanking.data as { message?: string })?.message
                  : 'Error desconocido'}
              </p>
            </div>
            <Button onClick={() => refetchRanking()} variant="outline" size="sm">
              <IconRefresh className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : userRankingData.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <IconTrophy className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">No hay datos disponibles</p>
              <p className="text-xs text-muted-foreground mt-1">
                No se encontraron usuarios con actas generadas en el rango de fechas seleccionado
              </p>
            </div>
            <Button onClick={() => refetchRanking()} variant="outline" size="sm">
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {userRankingData.map((user, index) => (
                <div
                  key={user.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    user.totalActas === 0 
                      ? 'bg-red-50 border-l-4 border-red-400' 
                      : index < 3 
                        ? 'bg-gradient-to-r from-muted/30 to-transparent' 
                        : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Posición */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-muted">
                        <Badge 
                          className={`w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs font-bold ${getPositionBadgeColor(user.posicion)}`}
                        >
                          {user.posicion}
                        </Badge>
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage 
                          src={user.avatar || undefined} 
                          alt={`${user.nombre} ${user.apellidos}`} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getInitials(user.nombre, user.apellidos)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Información del usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold text-sm truncate ${
                            user.totalActas === 0 ? 'text-red-600' : ''
                          }`}>
                            {user.nombre} {user.apellidos}
                          </h4>
                          {user.totalActas === 0 ? (
                            <IconAlertCircle className="h-4 w-4 text-red-500" />
                          ) : user.posicion <= 3 ? (
                            getPositionIcon(user.posicion)
                          ) : null}
                        </div>
                        <p className={`text-xs truncate ${
                          user.totalActas === 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          {user.email}
                        </p>
                        {user.totalActas === 0 && (
                          <p className="text-xs text-red-500 font-medium mt-1">
                            Sin actas generadas
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <IconFileText className={`h-4 w-4 ${
                            user.totalActas === 0 ? 'text-red-500' : 'text-muted-foreground'
                          }`} />
                          <span className={`font-bold text-lg ${
                            user.totalActas === 0 ? 'text-red-600' : ''
                          }`}>
                            {user.totalActas}
                          </span>
                        </div>
                        <p className={`text-xs ${
                          user.totalActas === 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          actas generadas
                        </p>
                      </div>
                      
                      {/* Barra de progreso visual */}
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            user.totalActas === 0 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                            user.posicion === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            user.posicion === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                            user.posicion === 3 ? 'bg-gradient-to-r from-amber-500 to-amber-700' :
                            'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}
                          style={{ 
                            width: `${user.totalActas === 0 ? 100 : userRankingData.length > 0 ? (user.totalActas / userRankingData[0].totalActas) * 100 : 0}%` 
                          }}
                        />
                      </div>
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
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                    <span className="text-muted-foreground">1er lugar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-500"></div>
                    <span className="text-muted-foreground">2do lugar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-700"></div>
                    <span className="text-muted-foreground">3er lugar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600"></div>
                    <span className="text-muted-foreground">Sin actas</span>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  Total: {userRankingData.length > 0 ? userRankingData.reduce((sum, user) => sum + user.totalActas, 0) : 0} actas
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
