export interface GetExpedienteDto {
  expediente: string
  incidente: string
  fecha_expediente?: string
}

export interface ExpedienteData {
  expediente: string
  instancia: string
  juez: string
  especialista: string
  ministerio_publico: string
  imputado: string
  agraviado: string
  delito: string
  fecha_expediente: string
}

export interface ExpedienteResponse {
  success: boolean
  message: string
  data: ExpedienteData
} 