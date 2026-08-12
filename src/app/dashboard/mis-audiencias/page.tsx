"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IconSearch, IconRefresh, IconCalendar } from "@tabler/icons-react"
import { DataTable } from "@/components/dashboard/mis-audiencias/table/data-table"
import { createColumns } from "@/components/dashboard/mis-audiencias/table/columns"
import { useAudiencias } from "@/hooks/use-audiencias"
import { es } from "date-fns/locale"
// import { useRouter } from "next/navigation"

const formatDate = (date: Date | undefined) => {
  if (!date) return ""
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export default function MisAudienciasPage() {
  // const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateValue, setDateValue] = useState(formatDate(new Date()))
  
  const { 
    audiencias, 
    isLoading, 
    isError, 
    error, 
    searchByDate,
  } = useAudiencias()

  // Console log para ver las audiencias
  console.log("🔍 Audiencias cargadas:", audiencias)
  console.log("📊 Estado de carga:", { isLoading, isError, error })

  const handleSearch = async () => {
    if (!selectedDate) {
      alert("Por favor selecciona una fecha")
      return
    }
    
    // Convertir Date a string en formato YYYY-MM-DD
    const fechaString = selectedDate.toISOString().split('T')[0]
    console.log("🔍 Buscando audiencias para la fecha:", fechaString)
    console.log("📅 Fecha seleccionada:", selectedDate)
    
    await searchByDate(fechaString)
    
    console.log("✅ Búsqueda completada. Audiencias encontradas:", audiencias)
  }

  const handleRefresh = () => {
    const today = new Date()
    setSelectedDate(today)
    setDateValue(formatDate(today))
    // Limpiar los datos de audiencias
    window.location.reload()
  }


  // Crear columnas dinámicamente
  const columns = createColumns()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mis Audiencias</h1>
          <Button disabled>
            <IconRefresh className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando audiencias...</p>
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
          <h1 className="text-2xl font-bold">Mis Audiencias</h1>
          <Button onClick={() => window.location.reload()} variant="outline">
            <IconRefresh className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Error al cargar audiencias</p>
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
          <h1 className="text-2xl font-bold">Mis Audiencias</h1>
          <p className="text-muted-foreground">
            Gestiona y consulta tus audiencias programadas
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <IconRefresh className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {/* Sección de búsqueda por fecha */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Audiencias</CardTitle>
          <CardDescription>
            Selecciona una fecha para consultar las audiencias programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Indicador visual de fecha seleccionada */}
          {selectedDate && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <IconCalendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Fecha de búsqueda seleccionada
                  </h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatDate(selectedDate)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Se mostrarán las audiencias programadas para esta fecha
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                id="date"
                value={dateValue}
                placeholder="Selecciona fecha"
                className="w-48 pr-10"
                onChange={(e) => {
                  setDateValue(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setOpen(true)
                  }
                }}
              />
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="date-picker"
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                  >
                    <IconCalendar className="size-3.5" />
                    <span className="sr-only">Seleccionar fecha</span>
                  </Button>
                </DropdownMenuTrigger>
                                 <DropdownMenuContent className="w-auto overflow-hidden p-0" align="start">
                   <Calendar
                     mode="single"
                     selected={selectedDate}
                     captionLayout="dropdown"
                     locale={es}
                     onSelect={(date) => {
                       setSelectedDate(date)
                       setDateValue(formatDate(date))
                       setOpen(false)
                     }}
                   />
                 </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button 
              onClick={handleSearch} 
              disabled={!selectedDate || isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <IconSearch className="h-4 w-4 mr-2" />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Tabla de audiencias */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Audiencias</CardTitle>
          <CardDescription>
            Audiencias programadas para la fecha seleccionada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <DataTable columns={columns} data={audiencias} />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Selecciona una fecha en el calendario para ver las audiencias
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 