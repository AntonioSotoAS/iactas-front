export interface ActaGenerada {
  id: number
  n_sala: number
  c_audiencia: number
  n_programacion: number
  fecha_audiencia: string
  // Agregar otros campos según la estructura real de acta_generada
  [key: string]: unknown
}

export interface ActaSubidaSij {
  id: number
  idActaGenerado: number
  actaGenerada?: ActaGenerada
  lCantPaginas: number
  fCreaActa: string
  fEnvDespActa: string
  fDescActa: string
  lIndPdf: string
  createdAt: string
  updatedAt: string
}

export interface CreateActaSubidaSijDto {
  idActaGenerado: number
  lCantPaginas: number
  fCreaActa: string
  fEnvDespActa: string
  fDescActa: string
  lIndPdf: string
}

export interface UpdateActaSubidaSijDto {
  idActaGenerado?: number
  lCantPaginas?: number
  fCreaActa?: string
  fEnvDespActa?: string
  fDescActa?: string
  lIndPdf?: string
}

export interface GetActasSubidasSijDto {
  page?: number
  limit?: number
  idActaGenerado?: number
  lIndPdf?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface ActaSubidaSijResponse {
  success: boolean
  message: string
  data: ActaSubidaSij
}

export interface ActasSubidasSijResponse {
  success: boolean
  message: string
  data: ActaSubidaSij[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SincronizacionResponse {
  success: boolean
  message: string
  registrosProcesados: number
  matchesEncontrados?: number
  duplicadosActualizados?: number
  duplicadosEnActaGenerada?: number
  erroresEncontrados?: number
}

export interface EstadisticasDuplicadosResponse {
  success: boolean
  message: string
  totalRegistros: number
  registrosUnicos: number
  posiblesDuplicados: number
  ultimaSincronizacion: string
}
