import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una hora que viene en formato datetime a formato AM/PM
 * @param horaString - Hora en formato "2025-07-09 11:00:00.0000" o "11:00:00"
 * @returns Hora formateada como "11:00 AM" o "2:30 PM"
 */
export function formatearHora(horaString: string): string {
  if (!horaString) return '-'
  
  try {
    // Si viene en formato datetime completo, extraer solo la hora
    let hora = horaString
    if (horaString.includes(' ')) {
      hora = horaString.split(' ')[1]
    }
    
    // Si viene con milisegundos, removerlos
    if (hora.includes('.')) {
      hora = hora.split('.')[0]
    }
    
    // Crear un objeto Date para formatear
    const [horas, minutos, segundos] = hora.split(':').map(Number)
    const fecha = new Date()
    fecha.setHours(horas, minutos, segundos)
    
    // Formatear a AM/PM
    return fecha.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formateando hora:', error)
    return horaString // Devolver original si hay error
  }
}
