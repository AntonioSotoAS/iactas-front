"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { IconSparkles } from "@tabler/icons-react"
import Link from "next/link"
import { IActasLimitationsCard } from "@/components/iactas-limitations-card"
import { ArrowRightIcon, FileTextIcon, SearchIcon, SettingsIcon, CheckCircle2 } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { useGetActasPendientesQuery } from "@/store/api/actasPendientesApi"

export default function DashboardPage() {
  const { user } = useUser()
  const dni = user?.dni || ""

  const { data: actasPendientes, isLoading: isActasPendientesLoading } = useGetActasPendientesQuery(dni, {
    skip: !dni,
  })

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleDateString('es-ES', { month: 'long' })
  const currentYear = currentDate.getFullYear()
  const monthYearCapitalized = `${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} ${currentYear}`

  return (
    <div className="space-y-6">
      {/* Aviso Importante (Top) */}
      <IActasLimitationsCard className="rounded-2xl" />

      {/* Fila 1: 2 Columnas (Actas Pendientes, Actas Generadas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Actas Pendientes (Foco principal) */}
        <div className="overflow-hidden rounded-xl border border-orange-200 bg-orange-50/30 shadow-sm transition-all hover:shadow-md flex flex-col">
          <div className="p-6 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600 ring-1 ring-inset ring-orange-500/20">
                  ⚠️ ATENCIÓN REQUERIDA
                </span>
                <span className="text-sm font-medium text-slate-500">{monthYearCapitalized}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                Actas Pendientes de Revisión
              </h3>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-bold tracking-tight text-orange-600">
                  {isActasPendientesLoading ? (
                    <span className="inline-block h-12 w-12 animate-pulse rounded bg-orange-200"></span>
                  ) : (
                    actasPendientes?.length || 0
                  )}
                </span>
                <span className="text-sm font-medium text-slate-600">actas pendientes</span>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Transcripciones procesadas listas para tu validación y firma final.
              </p>
            </div>

            <Link href="/dashboard/actas-pendientes" className="mt-auto">
              <button className="w-full inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-700 active:scale-95">
                Ver Actas Pendientes
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* 2. Actas Generadas */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md flex flex-col">
          <div className="p-6 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                  ✅ RESUMEN MENSUAL
                </span>
                <span className="text-sm font-medium text-slate-500">{monthYearCapitalized}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                Actas Generadas con Éxito
              </h3>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-bold tracking-tight text-slate-900">
                  128
                </span>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Actas judicialmente estructuradas y archivadas este mes.
              </p>
            </div>

            <Link href="/dashboard/mis-actas-generadas" className="mt-auto">
              <button className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-800 active:scale-95">
                Ver Mi Histórico
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* Fila 2: Video Tutorial */}
      <div className="grid grid-cols-1 gap-6">

        {/* Tutorial Card (Ocupa todo el ancho) */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all flex flex-col">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🎓</span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Aprende a usar el Sistema — Video Tutorial
              </h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Aprende cómo deslizar y comparar la transcripción previa contra el acta judicial estructurada generada por IA.
            </p>

            <div className="relative flex-1 w-full overflow-hidden rounded-lg bg-black shadow-inner border border-slate-200 aspect-video">
              <video
                controls
                className="absolute inset-0 h-full w-full object-contain"
                src="/tutorial/tutorial.mp4"
                preload="metadata"
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
