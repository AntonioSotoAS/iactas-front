'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  IconCheck,
  IconStar,
  IconMessageDots,
  IconInfoCircle,
} from '@tabler/icons-react'
import { toast } from 'react-hot-toast'
import { ActaGenerada } from '@/types/actaGenerada'

// SVGs de Caritas a Color (Estilo Likert con círculos rellenos a color)
export const FacePesima = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#EF4444" />
    <circle cx="16" cy="18" r="3" fill="white" />
    <circle cx="32" cy="18" r="3" fill="white" />
    <path d="M15 33C17.5 27.5 30.5 27.5 33 33" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
)

export const FaceMala = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#F97316" />
    <circle cx="16" cy="18" r="3" fill="white" />
    <circle cx="32" cy="18" r="3" fill="white" />
    <path d="M16 31.5C18.5 28 29.5 28 32 31.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
)

export const FaceNeutral = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#EAB308" />
    <circle cx="16" cy="18" r="3" fill="white" />
    <circle cx="32" cy="18" r="3" fill="white" />
    <path d="M16 30.5H32" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
)

export const FaceBuena = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#84CC16" />
    <circle cx="16" cy="18" r="3" fill="white" />
    <circle cx="32" cy="18" r="3" fill="white" />
    <path d="M16 28C18.5 32.5 29.5 32.5 32 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
)

export const FaceExcelente = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#10B981" />
    <circle cx="16" cy="17" r="3" fill="white" />
    <circle cx="32" cy="17" r="3" fill="white" />
    <path d="M15 27.5C15 27.5 18 34.5 24 34.5C30 34.5 33 27.5 33 27.5H15Z" fill="white" />
  </svg>
)

export interface CalificacionData {
  actaId: number
  puntuacion: number // 1 a 5 (Escala Likert)
  etiqueta: string // PÉSIMA, MALA, NEUTRAL, BUENA, EXCELENTE
  comentario: string
  fechaActualizacion: string
}

export const CALIFICACIONES_OPTIONS = [
  {
    valor: 1,
    etiqueta: 'PÉSIMA',
    icon: FacePesima,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50/80 dark:bg-red-950/40',
    borderColor: 'border-red-400 dark:border-red-800',
  },
  {
    valor: 2,
    etiqueta: 'MALA',
    icon: FaceMala,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50/80 dark:bg-orange-950/40',
    borderColor: 'border-orange-400 dark:border-orange-800',
  },
  {
    valor: 3,
    etiqueta: 'NEUTRAL',
    icon: FaceNeutral,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50/80 dark:bg-amber-950/40',
    borderColor: 'border-amber-400 dark:border-amber-800',
  },
  {
    valor: 4,
    etiqueta: 'BUENA',
    icon: FaceBuena,
    color: 'text-lime-700 dark:text-lime-400',
    bgColor: 'bg-lime-50/80 dark:bg-lime-950/40',
    borderColor: 'border-lime-400 dark:border-lime-800',
  },
  {
    valor: 5,
    etiqueta: 'EXCELENTE',
    icon: FaceExcelente,
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-400 dark:border-emerald-800',
  },
]

interface CalificarActaModalProps {
  acta: ActaGenerada | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (calificacion: CalificacionData) => void
  readOnly?: boolean
}

export function CalificarActaModal({
  acta,
  open,
  onOpenChange,
  onSuccess,
  readOnly = false,
}: CalificarActaModalProps) {
  const [puntuacion, setPuntuacion] = useState<number | null>(null)
  const [comentario, setComentario] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasExistingCalificacion, setHasExistingCalificacion] = useState(false)

  // Cargar calificación existente desde localStorage
  useEffect(() => {
    if (open && acta?.id) {
      try {
        const stored = localStorage.getItem(`iactas_calificacion_acta_${acta.id}`)
        if (stored) {
          const parsed: CalificacionData = JSON.parse(stored)
          setPuntuacion(parsed.puntuacion)
          setComentario(parsed.comentario || '')
          setHasExistingCalificacion(true)
        } else {
          setPuntuacion(null)
          setComentario('')
          setHasExistingCalificacion(false)
        }
      } catch (e) {
        console.warn('Error al leer calificación guardada:', e)
        setPuntuacion(null)
        setComentario('')
        setHasExistingCalificacion(false)
      }
    }
  }, [open, acta])

  if (!acta) return null

  const isReadOnly = readOnly || hasExistingCalificacion

  const handleSubmit = async () => {
    if (isReadOnly) return
    if (!puntuacion) {
      toast.error('Por favor selecciona una valoración entre Pésima y Excelente')
      return
    }

    setIsSubmitting(true)

    const selectedOption = CALIFICACIONES_OPTIONS.find((opt) => opt.valor === puntuacion)
    const calificacionData: CalificacionData = {
      actaId: acta.id,
      puntuacion,
      etiqueta: selectedOption?.etiqueta || 'EVALUADA',
      comentario: comentario.trim(),
      fechaActualizacion: new Date().toISOString(),
    }

    try {
      // Guardar en localStorage para persistencia instantánea
      localStorage.setItem(`iactas_calificacion_acta_${acta.id}`, JSON.stringify(calificacionData))

      // Despachar evento global para actualizar celdas de tabla
      window.dispatchEvent(
        new CustomEvent('iactas_calificacion_updated', { detail: calificacionData })
      )

      toast.success('¡Gracias por tu valoración! Tu opinión ayuda a mejorar la IA.')
      onOpenChange(false)
      if (onSuccess) onSuccess(calificacionData)
    } catch (e) {
      console.error('Error al guardar valoración:', e)
      toast.error('Ocurrió un error al guardar tu calificación')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] p-6 space-y-5 rounded-2xl">
        <DialogHeader className="text-center space-y-2 pb-2 border-b">
          <div className={`mx-auto p-3 rounded-full w-fit ${isReadOnly ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-500'}`}>
            {isReadOnly ? (
              <IconCheck className="w-8 h-8 text-emerald-600" />
            ) : (
              <IconStar className="w-8 h-8 fill-amber-400" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">
            {isReadOnly ? 'Valoración Registrada' : '¿Qué te pareció la calidad del acta generada?'}
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-slate-500 max-w-md mx-auto">
            Expediente: <span className="font-semibold text-slate-700 dark:text-slate-300">{acta.expediente}</span>
            <br />
            {isReadOnly
              ? 'Esta acta ya cuenta con una valoración enviada. A continuación se muestran los detalles:'
              : 'Tu evaluación y observaciones nos permiten ajustar y mejorar continuamente la generación de este tipo de actas.'}
          </DialogDescription>
        </DialogHeader>

        {/* 5 Botones de Calificación Likert */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 py-2">
          {CALIFICACIONES_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isSelected = puntuacion === opt.valor

            return (
              <button
                key={opt.valor}
                type="button"
                disabled={isReadOnly}
                onClick={() => !isReadOnly && setPuntuacion(opt.valor)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer'
                  } ${isSelected
                    ? `${opt.borderColor} ${opt.bgColor} shadow-md scale-105 ring-2 ring-offset-1 ring-primary/40 font-bold`
                    : isReadOnly
                      ? 'border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 opacity-30 grayscale-[0.4]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 hover:bg-slate-50 opacity-80 hover:opacity-100'
                  }`}
              >
                <Icon className={`w-9 h-9 sm:w-10 sm:h-10 mb-1.5 transition-transform ${isSelected ? 'scale-110 drop-shadow-sm' : 'opacity-85'}`} />
                <span className={`text-[11px] sm:text-xs tracking-wider font-extrabold ${isSelected ? opt.color : 'text-slate-600 dark:text-slate-400'}`}>
                  {opt.etiqueta}
                </span>
              </button>
            )
          })}
        </div>

        {/* Comentario u Observación Opcional */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="comentario" className="text-xs font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <IconMessageDots className="w-4 h-4 text-blue-600" />
              {isReadOnly ? 'Comentario u observaciones enviadas' : 'Comentario u observaciones para mejorar el acta (Opcional)'}
            </Label>
            {!isReadOnly && <span className="text-[10px] text-muted-foreground">Recomendado</span>}
          </div>
          <Textarea
            id="comentario"
            value={comentario}
            disabled={isReadOnly}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            placeholder={
              isReadOnly
                ? 'Sin comentarios ingresados.'
                : 'Escribe aquí tu comentario sobre el acta generada (ej: faltaron algunos datos del juez, el formato fue excelente)...'
            }
            className={`text-xs bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 focus-visible:ring-primary ${isReadOnly ? 'opacity-90 cursor-not-allowed bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-medium' : ''
              }`}
          />
          <div className={`flex items-center gap-1.5 text-[11px] p-2.5 rounded-lg border ${isReadOnly
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
            : 'text-slate-500 bg-blue-50/60 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900'
            }`}>
            {isReadOnly ? (
              <>
                <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Esta valoración ya fue registrada correctamente.</span>
              </>
            ) : (
              <>
                <IconInfoCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Tus comentarios nos sirven directamente para mejorar la generación automática y realizar ajustes continuos en nuestras plantillas y prompts.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t flex flex-col sm:flex-row items-center justify-end gap-2">
          {isReadOnly ? (
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-xs px-6 font-semibold"
            >
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto text-xs"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!puntuacion || isSubmitting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 px-6 h-10 shadow-md"
              >
                <IconCheck className="w-4 h-4" />
                {isSubmitting ? 'Guardando...' : 'Enviar valoración'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
