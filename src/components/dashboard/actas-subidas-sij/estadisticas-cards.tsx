"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconClock, IconSend, IconFileText, IconTrendingUp } from "@tabler/icons-react"
import { useActasSubidasSij } from "@/hooks/use-actas-subidas-sij"
import { Skeleton } from "@/components/ui/skeleton"

interface EstadisticasCardsProps {
  className?: string
}

export function EstadisticasCards({ className = "" }: EstadisticasCardsProps) {
  const { actas, total, isLoading, error } = useActasSubidasSij()

  // Console logs para debugging
  console.log('📊 [EstadisticasCards] Actas recibidas:', actas)
  console.log('📊 [EstadisticasCards] Total:', total)
  console.log('⏳ [EstadisticasCards] Loading:', isLoading)
  console.log('❌ [EstadisticasCards] Error:', error)
  
  // Log detallado de la primera acta para verificar estructura
  if (actas && actas.length > 0) {
    console.log('🔍 [EstadisticasCards] Primera acta completa:', actas[0])
    console.log('🔍 [EstadisticasCards] ActaGenerada de la primera acta:', actas[0].actaGenerada)
  }

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    console.error('Error en estadísticas:', error)
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        <Card className="col-span-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error al cargar estadísticas</p>
            <p className="text-xs text-gray-500 mt-2">
              Verifica la conexión con el servidor
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular estadísticas básicas desde los datos disponibles
  const totalRegistros = total || 0
  const registrosConPDF = actas?.filter(acta => acta.lIndPdf === 'S').length || 0
  const registrosSinPDF = actas?.filter(acta => acta.lIndPdf === 'N').length || 0
  const registrosEnviados = actas?.filter(acta => acta.fEnvDespActa).length || 0

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total de Registros */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <IconFileText className="h-4 w-4" />
            Total de Registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {totalRegistros}
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Actas subidas al SIJ
          </p>
        </CardContent>
      </Card>

      {/* Registros con PDF */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <IconTrendingUp className="h-4 w-4" />
            Con PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {registrosConPDF}
          </div>
          <p className="text-xs text-green-600 mt-1">
            Generados con PDF
          </p>
        </CardContent>
      </Card>

      {/* Registros sin PDF */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
            <IconClock className="h-4 w-4" />
            Sin PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900">
            {registrosSinPDF}
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Pendientes de PDF
          </p>
        </CardContent>
      </Card>

      {/* Registros Enviados */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
            <IconSend className="h-4 w-4" />
            Enviados a Despacho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {registrosEnviados}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Procesados
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
