// Tipos para las estadísticas del sistema
export interface UsuarioRanking {
  id: number
  nombre: string
  apellidos: string
  email: string
  totalActas: number
  avatar?: string
  posicion: number
}

export interface RankingUsuariosResponse {
  success: boolean
  data: UsuarioRanking[]
  total: number
  message: string
  filtros: {
    sedeId?: number
    fechaInicio?: string
    fechaFin?: string
    limit: number
  }
}

export interface RankingUsuariosFilters {
  sedeId?: number
  fechaInicio?: string
  fechaFin?: string
  limit?: number
}

export interface EstadisticasGenerales {
  total_usuarios: number
  usuarios_activos: number
  total_actas: number
  promedio_actas_por_usuario: number
}

export interface EstadisticasGeneralesResponse {
  success: boolean
  data: EstadisticasGenerales
  message: string
}

export interface TipoActaEstadistica {
  tipo_audiencia: string
  total_actas: number
  porcentaje: number
}

export interface EstadisticasTipoActaResponse {
  success: boolean
  data: TipoActaEstadistica[]
  total: number
  message: string
  filtros: {
    sedeId?: number
    fechaInicio?: string
    fechaFin?: string
  }
}

export interface EstadisticasTipoActaFilters {
  sedeId?: number
  fechaInicio?: string
  fechaFin?: string
}