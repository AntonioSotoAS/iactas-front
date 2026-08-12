export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  COMPLETADA = 'completada',
  ERROR = 'error',
  CANCELADA = 'cancelada'
}

export enum PrioridadSolicitud {
  BAJA = 'baja',
  NORMAL = 'normal',
  ALTA = 'alta',
  URGENTE = 'urgente'
}

export interface ActaSolicitud {
  id: number
  titulo: string
  descripcion?: string
  url_modelo: string
  url_transcripcion: string
  estado: EstadoSolicitud
  prioridad: PrioridadSolicitud
  intentos: number
  max_intentos: number
  error_message?: string
  url_acta_generada?: string
  metadata?: Record<string, unknown>
  fecha_procesamiento?: string
  fecha_completado?: string
  user_id: number
  usuario?: {
    id: number
    nombres: string
    apellidos_paterno: string
    apellidos_materno: string
    correo: string
  }
  // Campos de audiencia
  x_nom_instancia?: string
  n_unico?: number
  n_incidente?: number
  x_formato?: string
  expediente_unico?: number
  expediente_incidente?: number
  f_audiencia?: string
  f_ini_prog?: string
  f_fin_prog?: string
  n_sala?: number
  c_audiencia?: number
  n_programacion?: number
  x_desc_audiencia?: string
  created_at: string
  updated_at: string
}

export interface CreateActaSolicitudDto {
  titulo: string
  descripcion?: string
  url_modelo: string
  url_transcripcion: string
  prioridad?: PrioridadSolicitud
  metadata?: Record<string, unknown>
  // Campos de audiencia (opcionales)
  x_nom_instancia?: string
  n_unico?: number
  n_incidente?: number
  x_formato?: string
  expediente_unico?: number
  expediente_incidente?: number
  f_audiencia?: string
  f_ini_prog?: string
  f_fin_prog?: string
  n_sala?: number
  c_audiencia?: number
  n_programacion?: number
  x_desc_audiencia?: string
}

export interface UpdateActaSolicitudDto {
  titulo?: string
  descripcion?: string
  url_modelo?: string
  url_transcripcion?: string
  prioridad?: PrioridadSolicitud
  metadata?: Record<string, unknown>
  // Campos de audiencia (opcionales)
  x_nom_instancia?: string
  n_unico?: number
  n_incidente?: number
  x_formato?: string
  expediente_unico?: number
  expediente_incidente?: number
  f_audiencia?: string
  f_ini_prog?: string
  f_fin_prog?: string
  n_sala?: number
  c_audiencia?: number
  n_programacion?: number
  x_desc_audiencia?: string
}

export interface QueryActaSolicitudDto {
  estado?: EstadoSolicitud
  prioridad?: PrioridadSolicitud
  user_id?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface ColaFifoResponseDto {
  id: number
  titulo: string
  estado: EstadoSolicitud
  prioridad: PrioridadSolicitud
  intentos: number
  max_intentos: number
  created_at: string
  posicion_cola: number
  tiempo_estimado_minutos: number
}

export type ColaFifoItem = ColaFifoResponseDto

export interface ColaFifoStatsDto {
  total_en_cola: number
  pendientes: number
  procesando: number
  completadas_hoy: number
  con_error: number
  tiempo_promedio_minutos: number
}

export type ColaFifoStats = ColaFifoStatsDto

export interface ActaSolicitudResponse {
  message: string
  data: ActaSolicitud
  success: boolean
}

export interface ActaSolicitudesResponse {
  data: ActaSolicitud[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ColaFifoResponse {
  data: ColaFifoResponseDto[]
  success: boolean
}

export interface ColaFifoStatsResponse {
  data: ColaFifoStatsDto
  success: boolean
}

export interface NextToProcessResponse {
  message: string
  data: ActaSolicitud | null
  success: boolean
}

export interface MarkCompletedDto {
  url_acta_generada: string
}

export interface MarkErrorDto {
  error_message: string
}

export interface CleanupResponse {
  message: string
  deleted_count: number
  success: boolean
}
