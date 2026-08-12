import { useState, useEffect } from "react"

export type UserRole = "superadmin" | "admin" | "coordinador_especialista" | "especialista_audiencia"

interface UseRolesReturn {
  userRole: UserRole
  isSuperAdmin: boolean
  isAdmin: boolean
  isCoordinadorEspecialista: boolean
  isEspecialistaAudiencia: boolean
  hasPermission: (permission: string) => boolean
}

export function useRoles(): UseRolesReturn {
  const [userRole, setUserRole] = useState<UserRole>("especialista_audiencia")

  useEffect(() => {
    const getUserRole = (): UserRole => {
      if (typeof window === "undefined") return "especialista_audiencia"
      
      try {
        const userData = localStorage.getItem('user_data')
        if (userData) {
          const user = JSON.parse(userData)
          return user.rol || "especialista_audiencia"
        }
      } catch (error) {
        console.error("Error al obtener rol del usuario:", error)
      }
      
      return "especialista_audiencia"
    }

    setUserRole(getUserRole())
  }, [])

  const isSuperAdmin = userRole === "superadmin"
  const isAdmin = userRole === "admin"
  const isCoordinadorEspecialista = userRole === "coordinador_especialista"
  const isEspecialistaAudiencia = userRole === "especialista_audiencia"

  // Función para verificar permisos específicos
  const hasPermission = (permission: string): boolean => {
    switch (permission) {
      case "manage_users":
        return isSuperAdmin || isAdmin
      case "access_config":
        return isSuperAdmin
      case "manage_audiencias":
        return isSuperAdmin || isAdmin || isCoordinadorEspecialista
      case "create_actas":
        return isSuperAdmin || isAdmin || isCoordinadorEspecialista || isEspecialistaAudiencia
      case "view_reports":
        return isSuperAdmin || isAdmin || isCoordinadorEspecialista
      case "system_backup":
        return isSuperAdmin
      case "manage_roles":
        return isSuperAdmin
      default:
        return false
    }
  }

  return {
    userRole,
    isSuperAdmin,
    isAdmin,
    isCoordinadorEspecialista,
    isEspecialistaAudiencia,
    hasPermission,
  }
} 