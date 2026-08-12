"use client"

import { UserRankingCard } from "@/components/dashboard/estadisticas/user-ranking-card"
import { TipoAudienciaCard } from "@/components/dashboard/estadisticas/tipo-audiencia-card"

export default function EstadisticasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estadísticas del Sistema</h1>
        <p className="text-muted-foreground">
          Análisis y métricas del sistema de gestión de actas
        </p>
      </div>

      <div className="grid gap-6">
        {/* Ranking de Usuarios */}
        <UserRankingCard />
        
        {/* Estadísticas por Tipo de Audiencia */}
        <TipoAudienciaCard />
        
        {/* Aquí se agregarán más cards de estadísticas */}
      </div>
    </div>
  )
}
