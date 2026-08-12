export interface LoginDto {
    correo: string
    password: string
  }
  
  export interface LoginResponse {
    message: string
  }
  
  export interface PerfilResponse {
  id: number
  correo: string
  password: string
  nombres: string
  apellidos_paterno: string
  apellidos_materno: string
  dni: string
  telefono: string
  rol: "admin" | "juez" | "superadmin"
  activo: boolean
  api_key?: string
}
  