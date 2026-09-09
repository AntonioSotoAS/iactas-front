// src/types/usuario.ts

export enum RolUsuario {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  ESPECIALISTA_AUDIENCIA = 'especialista_audiencia',
  COORDINADOR_ESPECIALISTA = 'coordinador_especialista',
}

export interface Usuario {
  id: number
  correo: string
  nombres: string
  apellidos_paterno: string
  apellidos_materno: string
  dni: string
  telefono: string
  password: string
  rol: RolUsuario
  sede?: {
    id: number
    nombre: string
  }
  activo: boolean
  api_key?: string
}

export interface CreateUsuarioDto {
  correo: string
  nombres: string
  apellidos_paterno: string
  apellidos_materno: string
  dni: string
  telefono: string
  password: string
  rol: RolUsuario
  activo?: boolean
  sede_id?: number
  api_key?: string
}

export interface UpdateUsuarioDto extends Partial<CreateUsuarioDto> {
  id: number
}

// Estructura de respuesta para listado de usuarios (según el backend)
export interface UsuariosResponse {
  data: Usuario[]
  total: number
  limit: number
  offset: number
  page?: number
  totalPages?: number
}

// Tipos para filtros y paginación
export interface UsuarioFilters {
  limit?: number
  offset?: number
  page?: number
  search?: string
  rol?: RolUsuario
  sede_id?: number
}

// Tipos para operaciones específicas
export interface ToggleUsuarioEstadoDto {
  id: number
  activo: boolean
}

export interface ChangePasswordDto {
  id: number
  password: string
  confirmPassword: string
} 