"use client"

import { Card, CardContent } from "@/components/ui/card"

interface IActasLimitationsCardProps {
  className?: string
}

export function IActasLimitationsCard({ className = "" }: IActasLimitationsCardProps) {
  return (
    <Card className={`bg-white/80 backdrop-blur-sm  shadow-lg ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">🚫</span>
          </div>
          <p className="font-bold text-amber-800 text-lg">
            Limitaciones de IACTAS
          </p>
        </div>
        <p className="text-sm leading-relaxed mb-3">
          Por políticas de seguridad, <strong className="text-red-600">no se pueden generar automáticamente</strong> las actas de audiencias relacionadas con:
        </p>
        <div className="bg-red-50 p-3 rounded-xl border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="font-semibold text-red-700 text-sm">
              Tocamientos indebidos contra menores de edad o cualquier delito sexual involucrando a menores de edad
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
