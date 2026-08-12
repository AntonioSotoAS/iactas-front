export enum EstadoActa {
  PENDIENTE = 'pendiente',
  GENERADA = 'generada',
  SUBIDA_SIJ = 'subida_sij',
  ERROR = 'error',
  AGREGAR = 'agregar',
  CONTENIDO_PROHIBIDO = 'contenido_prohibido'
}

export interface ActaGenerada {
  id: number
  expediente: string
  transcripcion: string
  markdown_respuesta?: string
  estado: EstadoActa
  modelo_uri?: string
  transcripcion_uri?: string
  acta_generada_uri?: string
  acta_subida_al_sij: boolean
  creado_por_usuario_id: number
  acta_solicitud_id?: number
  creado_por_usuario?: {
    id: number
    nombres: string
    apellidos_paterno: string
    apellidos_materno: string
    correo: string
  }
  acta_solicitud?: {
    id: number
    estado: string
    intentos: number
    max_intentos: number
  }
  created_at: string
  updated_at: string
}

export interface CreateActaGeneradaDto {
  expediente: string
  transcripcion: string
  markdown_respuesta?: string
  estado?: EstadoActa
  modelo_uri?: string
  transcripcion_uri?: string
  acta_generada_uri?: string
  acta_subida_al_sij?: boolean
  creado_por_usuario_id: number
  numero_unico?: number
  formato_expediente?: string
  fecha_audiencia?: string
  tipo_expediente?: string
  hora_inicio?: Date
  hora_fin?: Date
  instancia?: string
}

export interface UpdateActaGeneradaDto {
  expediente?: string
  transcripcion?: string
  markdown_respuesta?: string
  estado?: EstadoActa
  modelo_uri?: string
  transcripcion_uri?: string
  acta_generada_uri?: string
  acta_subida_al_sij?: boolean
}

export interface FilterActaGeneradaDto {
  limit?: number
  offset?: number
  search?: string
  search_markdown?: string
  estado?: EstadoActa
  expediente?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export interface ActaGeneradaResponse {
  acta: ActaGenerada
  success: boolean
  error?: string
}

export interface ActasGeneradasResponse {
  data: ActaGenerada[]
  total: number
  limit: number
  offset: number
  success: boolean
  error?: string
}

export interface EstadisticasResponse {
  total_actas: number
  actas_borrador: number
  actas_en_revision: number
  actas_aprobadas: number
  actas_rechazadas: number
  actas_finalizadas: number
  actas_subidas_sij: number
  success: boolean
  error?: string
}

export interface EstadisticasContenidoResponse {
  total_palabras: number
  promedio_palabras_por_acta: number
  acta_mas_larga: {
    id: number
    expediente: string
    total_palabras: number
  }
  acta_mas_corta: {
    id: number
    expediente: string
    total_palabras: number
  }
  success: boolean
  error?: string
}

export interface MarkdownResponse {
  markdown: string
  success: boolean
  error?: string
}

