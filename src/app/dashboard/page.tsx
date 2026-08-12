"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { IActasLimitationsCard } from "@/components/iactas-limitations-card"
import { ArrowRight, Video, HourglassIcon, BarChart3Icon } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { useGetActasPendientesQuery } from "@/store/api/actasPendientesApi"
import { useFindByUsuarioQuery } from "@/store/api/actaGeneradaApi"

export default function DashboardPage() {
  const { user } = useUser()
  const dni = user?.dni || ""
  const userId = user?.id || 0

  const { data: actasPendientes, isLoading: isActasPendientesLoading } = useGetActasPendientesQuery(dni, {
    skip: !dni,
  })

  const { data: actasGeneradas, isLoading: isActasGeneradasLoading } = useFindByUsuarioQuery(userId, {
    skip: !userId,
  })

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleDateString('es-ES', { month: 'long' })
  const currentYear = currentDate.getFullYear()
  const monthYearCapitalized = `${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} ${currentYear}`

  // Filter actas generadas for the current month
  const actasEsteMes = actasGeneradas?.data?.filter((acta) => {
    const fechaActa = new Date(acta.created_at)
    return fechaActa.getMonth() === currentDate.getMonth() && fechaActa.getFullYear() === currentDate.getFullYear()
  })?.length || 0

  return (
    <div className="space-y-6 pb-10">
      {/* Row 1: Actas Pendientes (Full Width Dark Red) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6e0c25] to-[#4c0516] p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">

        {/* Decoración de fondo (opcional) */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none bg-[url('/scale-of-justice.svg')] bg-no-repeat bg-right bg-contain" />

        {/* Lado Izquierdo */}
        <div className="z-10 w-full md:w-auto">
          <span className="inline-block rounded-full border border-white/20 px-4 py-1 text-xs font-semibold tracking-wider text-white/90 mb-4">
            PRIORIDAD ALTA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Actas pendientes en el SIJ</h2>
          <p className="text-white/80 mb-8 max-w-sm">
            Actas pendientes de revisión y aprobación judicial.
          </p>

          <Link href="/dashboard/actas-pendientes" className="block w-full">
            <button className="w-full md:w-[400px] flex items-center justify-center rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-[#6e0c25] transition-all hover:bg-slate-100 active:scale-[0.98]">
              Ver Actas Pendientes <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </Link>
        </div>

        {/* Lado Derecho */}
        <div className="z-10 flex flex-col items-end mt-8 md:mt-0 w-full md:w-auto">
          <span className="inline-flex items-center rounded-full bg-black/20 border border-white/10 px-3 py-1.5 text-xs font-bold text-white mb-6">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#fca5a5] shadow-[0_0_8px_rgba(252,165,165,0.8)] animate-pulse"></span>
            REQUIERE FIRMA
          </span>

          <div className="relative flex h-36 w-36 flex-col items-center justify-center mr-4">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <span className="text-[4rem] font-bold leading-none">
              {isActasPendientesLoading ? (
                <span className="inline-block h-16 w-12 animate-pulse rounded bg-white/20"></span>
              ) : (
                actasPendientes?.length || 0
              )}
            </span>
            <span className="absolute bottom-6 text-[9px] font-bold tracking-[0.2em] text-white/70">
              PENDIENTES
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: 2 Columnas (Resumen Mensual y Video) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Resumen Mensual */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 tracking-wider">
              RESUMEN MENSUAL DE ACTAS GENERADAS
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {monthYearCapitalized}
            </span>
          </div>

          <div className="flex-1">
            <div className="text-[5rem] font-bold tracking-tight text-[#0f172a] leading-none mb-4">
              {isActasGeneradasLoading ? (
                <span className="inline-block h-[72px] w-16 animate-pulse rounded bg-slate-200/50"></span>
              ) : (
                actasEsteMes
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Actas generadas y consolidadas exitosamente este mes.
            </p>
          </div>

          <Link href="/dashboard/mis-actas-generadas" className="mt-auto">
            <button className="w-full inline-flex items-center justify-center rounded-lg bg-[#0a1128] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#152042] active:scale-[0.98]">
              Ver Histórico Completo
            </button>
          </Link>
        </div>

        {/* Video Tutorial */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col p-6">
          <h2 className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Revisa el video tutorial de iActas y todo lo que ofrece.
          </p>

          <div className="relative flex-1 w-full overflow-hidden rounded-xl bg-black group cursor-pointer h-full min-h-[200px]">
            <video
              controls
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              src="/tutorial/tutorial.mp4"
              preload="metadata"
              poster="/tutorial/thumbnail.jpg"
            >
              Tu navegador no soporta el elemento de video.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
              <h3 className="text-white font-bold text-lg leading-tight mb-1">Guía Rápida iActas</h3>
              <p className="text-white/80 text-xs">Aprende a revisar, generar y aprobar actas paso a paso.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Novedades en tu pantalla de inicio */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            🚀 Novedades en tu pantalla de inicio
          </h2>
          <span className="rounded-full bg-[#7a1329] px-3 py-1 text-xs font-bold text-white shadow-sm">
            v2.4 (2026)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Columna Izquierda */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
              <span className="text-lg">⏳</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Ver actas pendientes del SIJ</h3>
              <p className="text-sm text-slate-600 mb-3">
                Consulta y gestiona las audiencias pendientes de acta en un solo lugar:
              </p>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 marker:text-slate-400">
                <li><strong className="text-slate-800 font-semibold">Generar acta:</strong> Inicia el proceso adjuntando la transcripción y el modelo correspondientes.</li>
                <li><strong className="text-slate-800 font-semibold">Opción "Ver":</strong> Tras generar el acta, puedes revisar y descargar la transcripción, el modelo y el borrador final.</li>
                <li><strong className="text-slate-800 font-semibold">Validación automática:</strong> Al enviar el acta al despacho del juez vía SIJ, se remueve automáticamente de la lista.</li>
              </ul>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Ver actas generadas totales</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 marker:text-slate-400 mt-3">
                <li><strong className="text-slate-800 font-semibold">Métrica consolidada:</strong> Visualiza en tiempo real la cantidad total de actas generadas con la plataforma.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Aviso Importante (Bottom) */}
      <IActasLimitationsCard className="rounded-2xl" />
    </div>
  )
}
