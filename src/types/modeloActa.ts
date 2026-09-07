export interface EstructuraSeccionDto {
  id: string
  titulo: string
  descripcion: string
  ejemplo: string
  contenido: unknown
  orden: number
  tipo: string
}

export interface CreateModeloActaDto {
  titulo: string
  descripcion: string
  estructura?: EstructuraSeccionDto[]
  userId: number
  docxUrl?: string
  pdfUrl?: string
  jsonSchema?: string
  instruccionesIa?: string
  variables?: string[]
}

export interface UpdateModeloActaDto {
  titulo?: string
  descripcion?: string
  estructura?: EstructuraSeccionDto[]
  activo?: boolean
  docxUrl?: string
  pdfUrl?: string
  jsonSchema?: string
  instruccionesIa?: string
  variables?: string[]
}

export interface ModeloActaData {
  id: number
  titulo: string
  descripcion: string
  estructura?: EstructuraSeccionDto[]
  userId: number
  fechaCreacion: string
  fechaActualizacion: string
  activo: boolean
  docxUrl?: string
  pdfUrl?: string
  jsonSchema?: string
  instruccionesIa?: string
  variables?: string[]
}

export interface ModeloActaResponse {
  success: boolean
  message: string
  data: ModeloActaData
}

export interface ModeloActaListResponse {
  success: boolean
  message: string
  data: ModeloActaData[]
  total: number
} 