export interface GetAudienciasDto {
  dni: string
  fecha: string
}

export interface AudienciaData {
  x_nom_instancia: string
  n_unico: number
  n_incidente: number
  x_formato: string
  expediente_unico: number
  expediente_incidente: number
  f_audiencia: string
  f_ini_prog: string
  f_fin_prog: string
  n_sala: number
  c_audiencia: number
  n_programacion: number
  x_desc_audiencia: string
}

export interface Audiencia {
  x_nom_instancia: string
  n_unico: number
  n_incidente: number
  x_formato: string
  expediente_unico: number
  expediente_incidente: number
  f_audiencia: string
  f_ini_prog: string
  f_fin_prog: string
  n_sala: number
  c_audiencia: number
  n_programacion: number
  x_desc_audiencia: string
}

export interface CreateAudienciaDto {
  instancia: string
  tipoAudiencia: string
  expediente: string
  fechaAudiencia: string
  horaInicio: string
  horaFin: string
  numeroUnico?: string
  tipoExpediente?: string
}

export interface UpdateAudienciaDto {
  id: number
  instancia?: string
  tipoAudiencia?: string
  expediente?: string
  fechaAudiencia?: string
  horaInicio?: string
  horaFin?: string
  estado?: 'completada' | 'pendiente' | 'procesando'
  numeroUnico?: string
  tipoExpediente?: string
}

export interface AudienciasResponse {
  success: boolean
  message: string
  data: AudienciaData[]
  total: number
}

export interface AudienciaSummary {
  total: number
  completadas: number
  pendientes: number
  procesando: number
} 