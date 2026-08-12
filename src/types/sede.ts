// src/types/sede.ts

export interface Sede {
  id: number
  nombre: string
  direccion: string
  activo: boolean
  usuarios?: {
    id: number
    nombres: string
    apellidos_paterno: string
    apellidos_materno: string
    correo: string
  }[]
}

export interface CreateSedeDto {
  nombre: string
  direccion: string
  activo?: boolean
}

export interface UpdateSedeDto extends Partial<CreateSedeDto> {
  id: number
}

export interface SedeResponse {
  sede: Sede | null
  success: boolean
  error?: string
}

export interface SedesResponse {
  sedes: Sede[]
  total: number
  page: number
  limit: number
  success: boolean
  error?: string
}

// Tipos para filtros y paginación
export interface SedeFilters {
  page?: number
  limit?: number
  nombre?: string
  direccion?: string
  activo?: boolean
}
