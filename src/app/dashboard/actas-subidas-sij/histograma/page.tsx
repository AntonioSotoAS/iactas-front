"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconChartBar, IconAlertTriangle } from "@tabler/icons-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/lib/toast"
import { ActaSubidaSij } from "@/types/actaSubidaSij"

interface HistogramData {
  fecha: string
  cantidad: number
  fechaFormateada: string
  mismoDia: number
  unoADiezDias: number
  onceAVeinteDias: number
  masDeVeinteDias: number
  pendiente: number
  paginas1a10: number
  paginas11a20: number
  paginas21a30: number
  paginasMas30: number
}

export default function HistogramaPage() {
  const router = useRouter()
  const [actas, setActas] = useState<ActaSubidaSij[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllActas = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Obtener todos los registros (sin paginación)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/actas-subidas-sij?limit=10000`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Error al obtener los datos')
        }

        const data = await response.json()
        const allActas = data.data || []
        setActas(allActas)
      } catch (err) {
        console.error('Error al cargar actas:', err)
        setError('Error al cargar los datos del histograma')
        toast.error('Error al cargar los datos del histograma')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllActas()
  }, [])

  // Agrupar actas por día con categorías de días transcurridos y páginas
  const histogramData = useMemo<HistogramData[]>(() => {
    const groupedByDay: Record<string, {
      mismoDia: number
      unoADiezDias: number
      onceAVeinteDias: number
      masDeVeinteDias: number
      pendiente: number
      paginas1a10: number
      paginas11a20: number
      paginas21a30: number
      paginasMas30: number
    }> = {}

    actas.forEach((acta) => {
      if (acta.fCreaActa) {
        // Obtener solo la fecha (sin hora)
        const fecha = new Date(acta.fCreaActa)
        const fechaKey = format(fecha, 'yyyy-MM-dd')
        
        if (!groupedByDay[fechaKey]) {
          groupedByDay[fechaKey] = {
            mismoDia: 0,
            unoADiezDias: 0,
            onceAVeinteDias: 0,
            masDeVeinteDias: 0,
            pendiente: 0,
            paginas1a10: 0,
            paginas11a20: 0,
            paginas21a30: 0,
            paginasMas30: 0
          }
        }

        // Calcular días transcurridos
        const actaGenerada = acta.actaGenerada as Record<string, unknown> | undefined
        if (actaGenerada?.f_ini_prog) {
          const fechaAudiencia = new Date(actaGenerada.f_ini_prog as string)
          const fechaEnvio = acta.fEnvDespActa ? new Date(acta.fEnvDespActa) : null
          
          if (fechaEnvio) {
            const fechaAudienciaNormalizada = new Date(fechaAudiencia.getFullYear(), fechaAudiencia.getMonth(), fechaAudiencia.getDate())
            const fechaEnvioNormalizada = new Date(fechaEnvio.getFullYear(), fechaEnvio.getMonth(), fechaEnvio.getDate())
            const diferenciaMs = fechaEnvioNormalizada.getTime() - fechaAudienciaNormalizada.getTime()
            const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))
            
            if (dias === 0) {
              groupedByDay[fechaKey].mismoDia++
            } else if (dias >= 1 && dias <= 10) {
              groupedByDay[fechaKey].unoADiezDias++
            } else if (dias >= 11 && dias <= 20) {
              groupedByDay[fechaKey].onceAVeinteDias++
            } else {
              groupedByDay[fechaKey].masDeVeinteDias++
            }
          } else {
            groupedByDay[fechaKey].pendiente++
          }
        } else {
          groupedByDay[fechaKey].pendiente++
        }

        // Categorizar por número de páginas
        const paginas = Number(acta.lCantPaginas) || 0
        if (paginas <= 10) {
          groupedByDay[fechaKey].paginas1a10++
        } else if (paginas <= 20) {
          groupedByDay[fechaKey].paginas11a20++
        } else if (paginas <= 30) {
          groupedByDay[fechaKey].paginas21a30++
        } else {
          groupedByDay[fechaKey].paginasMas30++
        }
      }
    })

    // Convertir a array y ordenar por fecha
    const data: HistogramData[] = Object.entries(groupedByDay)
      .map(([fecha, categorias]) => ({
        fecha,
        cantidad: categorias.mismoDia + categorias.unoADiezDias + categorias.onceAVeinteDias + categorias.masDeVeinteDias + categorias.pendiente,
        fechaFormateada: format(new Date(fecha), 'dd/MM/yyyy', { locale: es }),
        ...categorias
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))

    return data
  }, [actas])

  const totalActas = actas.length
  const totalDias = histogramData.length

  // Calcular totales globales por categoría de días transcurridos
  const totalesGlobales = useMemo(() => {
    let mismoDiaTotal = 0
    let unoADiezDiasTotal = 0
    let onceAVeinteDiasTotal = 0
    let masDeVeinteDiasTotal = 0
    let pendienteTotal = 0

    actas.forEach((acta) => {
      const actaGenerada = acta.actaGenerada as Record<string, unknown> | undefined
      if (actaGenerada?.f_ini_prog) {
        const fechaAudiencia = new Date(actaGenerada.f_ini_prog as string)
        const fechaEnvio = acta.fEnvDespActa ? new Date(acta.fEnvDespActa) : null
        
        if (fechaEnvio) {
          const fechaAudienciaNormalizada = new Date(fechaAudiencia.getFullYear(), fechaAudiencia.getMonth(), fechaAudiencia.getDate())
          const fechaEnvioNormalizada = new Date(fechaEnvio.getFullYear(), fechaEnvio.getMonth(), fechaEnvio.getDate())
          const diferenciaMs = fechaEnvioNormalizada.getTime() - fechaAudienciaNormalizada.getTime()
          const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))
          
          if (dias === 0) {
            mismoDiaTotal++
          } else if (dias >= 1 && dias <= 10) {
            unoADiezDiasTotal++
          } else if (dias >= 11 && dias <= 20) {
            onceAVeinteDiasTotal++
          } else {
            masDeVeinteDiasTotal++
          }
        } else {
          pendienteTotal++
        }
      } else {
        pendienteTotal++
      }
    })

    return {
      mismoDia: mismoDiaTotal,
      unoADiezDias: unoADiezDiasTotal,
      onceAVeinteDias: onceAVeinteDiasTotal,
      masDeVeinteDias: masDeVeinteDiasTotal,
      pendiente: pendienteTotal
    }
  }, [actas])

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Histograma de Actas Subidas al SIJ</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando datos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Histograma de Actas Subidas al SIJ</h1>
          <Button onClick={() => router.back()} variant="outline">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Volver Atrás
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histograma de Actas Subidas al SIJ</h1>
          <p className="text-gray-600 mt-1">
            Distribución de actas subidas al SIJ por día
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Volver Atrás
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Actas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalActas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Días</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDias}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200 border-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <IconAlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6b7280]"></div>
                  <h3 className="font-semibold text-base text-yellow-900">Pendiente</h3>
                </div>
                <p className="text-sm font-medium text-yellow-800">
                  Actas sin fecha de envío al despacho
                </p>
                <p className="text-sm text-yellow-700">
                  Son actas que aún no han sido enviadas al despacho, por lo que no se puede calcular los días transcurridos entre la fecha de audiencia y el envío.
                </p>
                <p className="text-xs text-yellow-600 italic mt-1">
                  Incluye actas sin fecha de audiencia o sin fecha de envío registrada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Globales por Días Transcurridos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-[#10b981]">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
              Mismo día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalesGlobales.mismoDia}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#3b82f6]">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
              1 a 10 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalesGlobales.unoADiezDias}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#f59e0b]">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              11 a 20 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalesGlobales.onceAVeinteDias}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#ef4444]">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              Más de 20 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalesGlobales.masDeVeinteDias}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#6b7280]">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#6b7280]"></div>
              Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalesGlobales.pendiente}</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por Días Transcurridos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5" />
            Distribución por Días Transcurridos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {histogramData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No hay datos para mostrar</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={histogramData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fechaFormateada"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  label={{ value: 'Cantidad de Actas', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} actas`, '']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Legend />
                <Bar dataKey="mismoDia" stackId="dias" fill="#10b981" name="Mismo día" />
                <Bar dataKey="unoADiezDias" stackId="dias" fill="#3b82f6" name="1 a 10 días" />
                <Bar dataKey="onceAVeinteDias" stackId="dias" fill="#f59e0b" name="11 a 20 días" />
                <Bar dataKey="masDeVeinteDias" stackId="dias" fill="#ef4444" name="Más de 20 días" />
                <Bar dataKey="pendiente" stackId="dias" fill="#6b7280" name="Pendiente" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Histograma por Número de Páginas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5" />
            Distribución por Número de Páginas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {histogramData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No hay datos para mostrar</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={histogramData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fechaFormateada"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  label={{ value: 'Cantidad de Actas', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} actas`, '']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Legend />
                <Bar dataKey="paginas1a10" stackId="paginas" fill="#8b5cf6" name="1 a 10 páginas" />
                <Bar dataKey="paginas11a20" stackId="paginas" fill="#ec4899" name="11 a 20 páginas" />
                <Bar dataKey="paginas21a30" stackId="paginas" fill="#14b8a6" name="21 a 30 páginas" />
                <Bar dataKey="paginasMas30" stackId="paginas" fill="#f97316" name="Más de 30 páginas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

