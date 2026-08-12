"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils" // Asegúrate de tener esta utilidad instalada (estándar en shadcn)
import {
  IconClock,
  IconListNumbers,
  IconPlayerPlay,
  IconActivity,
} from "@tabler/icons-react"
import { ActaGenerada, EstadoActa } from "@/types/actaGenerada"
import { EstadoSolicitud } from "@/types/actaSolicitud"
import {
  useGetColaFifoQuery,
  useGetColaFifoStatsQuery,
} from "@/store/api/actaSolicitudApi"

// --- COMPONENTE DE PROGRESO ANIMADO LOCAL ---
// shadcn por defecto no anima el llenado determinate.
// Definimos una variante local que aplica transición suave al indicator.
const AnimatedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      // La clave es 'transition-all duration-500 ease-in-out' aquí
      className="h-full w-full flex-1 bg-red-600 transition-all duration-500 ease-in-out dark:bg-red-400"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
AnimatedProgress.displayName = ProgressPrimitive.Root.displayName
// ---------------------------------------------

function formatTiempo(minutos: number): string {
  if (minutos < 60) return `${Math.round(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const mins = Math.round(minutos % 60)
  return `${horas}h ${mins}min`
}

interface MiColaProcesamientoProps {
  actas: ActaGenerada[]
  isConnected?: boolean
}

export function MiColaProcesamiento({
  actas,
  isConnected = false,
}: MiColaProcesamientoProps) {

  const { data: colaFifo = [], isLoading: isLoadingCola } = useGetColaFifoQuery()
  const { data: estadisticas } = useGetColaFifoStatsQuery()

  const itemsEnCola = useMemo(() => {
    return actas
      .filter(
        (acta) =>
          acta.estado === EstadoActa.PENDIENTE && acta.acta_solicitud_id != null,
      )
      .map((acta) => {
        const solicitudId = acta.acta_solicitud_id!
        const estadoSolicitud = acta.acta_solicitud?.estado
        const itemCola = colaFifo.find((c) => c.id === solicitudId)

        if (estadoSolicitud === EstadoSolicitud.PROCESANDO) {
          return {
            acta,
            modo: "procesando" as const,
            posicion: null as number | null,
            tiempoEstimadoMinutos:
              itemCola?.tiempo_estimado_minutos ??
              estadisticas?.tiempo_promedio_minutos ??
              3,
          }
        }

        if (itemCola) {
          return {
            acta,
            modo: "en_cola" as const,
            posicion: itemCola.posicion_cola,
            tiempoEstimadoMinutos: itemCola.tiempo_estimado_minutos,
          }
        }

        return {
          acta,
          modo: "pendiente" as const,
          posicion: null as number | null,
          tiempoEstimadoMinutos: estadisticas?.tiempo_promedio_minutos ?? 3,
        }
      })
  }, [actas, colaFifo, estadisticas])

  if (itemsEnCola.length === 0) {
    return null
  }

  const tiempoPromedioGlobal = estadisticas?.tiempo_promedio_minutos

  return (
    <Card className="border-red-100 shadow-sm bg-gradient-to-br from-red-50/40 to-white dark:from-red-950/20 dark:to-zinc-950">
      <CardHeader className="pb-4 border-b border-red-50/50 dark:border-red-950/30 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-zinc-800 dark:text-zinc-100">
              <IconActivity className="h-5 w-5 text-red-600" />
              Estado de procesamiento en tiempo real
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-1">
              Posición en la cola y tiempo estimado para tus actas en generación
            </CardDescription>
          </div>
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className={isConnected ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "shadow-sm"}
          >
            {isConnected ? "En vivo" : "Desconectado"}
          </Badge>
        </div>
        {tiempoPromedioGlobal != null && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
            Tiempo medio de procesamiento (últimos 30 días):{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {formatTiempo(tiempoPromedioGlobal)}
            </span>{" "}
            por acta
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingCola && (
          <p className="text-xs text-zinc-400 animate-pulse">Actualizando cola…</p>
        )}
        {itemsEnCola.map(({ acta, modo, posicion, tiempoEstimadoMinutos }) => (
          <div
            key={acta.id}
            className="rounded-xl border border-zinc-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-4 shadow-sm transition-all hover:shadow-md space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{acta.expediente}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Solicitud #{acta.acta_solicitud_id}
                </p>
              </div>
              {modo === "procesando" && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 animate-pulse shadow-sm dark:bg-red-900/40 dark:text-red-300 dark:border-red-800">
                  <IconPlayerPlay className="h-3 w-3 mr-1.5" />
                  Procesando ahora
                </Badge>
              )}
              {modo === "en_cola" && posicion != null && (
                <Badge variant="outline" className="bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                  <IconListNumbers className="h-3 w-3 mr-1.5" />
                  Posición {posicion}
                  {colaFifo.length > 0 && ` de ${colaFifo.length}`}
                </Badge>
              )}
              {modo === "pendiente" && (
                <Badge variant="outline" className="text-zinc-500 border-zinc-200 dark:border-zinc-700">
                  En cola (calculando...)
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
              {posicion != null && colaFifo.length > 0 && (
                <div className="flex items-center gap-3">
                  {/* --- USO DEL COMPONENTE ANIMADO --- */}
                  <AnimatedProgress
                    value={Math.round(
                      ((colaFifo.length - posicion + 1) / colaFifo.length) * 100,
                    )}
                    className="flex-1"
                  />
                  {/* --------------------------------- */}
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    Avance
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 sm:justify-end">
                <IconClock className="h-4 w-4 shrink-0" />
                <span>
                  Tiempo estimado de espera:{" "}
                  <strong className="font-semibold">{formatTiempo(tiempoEstimadoMinutos)}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}