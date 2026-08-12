import { usePerfilQuery } from "@/store/api/authApi"
import { PerfilResponse } from "@/types/auth"
import { useEffect, useState } from "react"

export function useUser() {
  const { data: perfilData, isLoading, isError, error } = usePerfilQuery()
  const [localUser, setLocalUser] = useState<PerfilResponse | null>(null)

  // Cargar datos del usuario desde localStorage al inicio
  useEffect(() => {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as PerfilResponse
        setLocalUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        localStorage.removeItem('user_data')
      }
    }
  }, [])

  // Usar datos del API si están disponibles, sino usar datos locales
  const user = perfilData?.user || localUser
  
  const fullName = user 
    ? `${user.nombres} ${user.apellidos_paterno || ""} ${user.apellidos_materno || ""}`.trim()
    : ""
  
  const initials = fullName
    .split(" ")
    .map(name => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Si tenemos datos locales pero no del API, no mostrar loading
  const isActuallyLoading = isLoading && !localUser

  return {
    user,
    fullName,
    initials,
    isLoading: isActuallyLoading,
    isError,
    error,
    isAuthenticated: !!user && !isError,
    // Datos adicionales del usuario
    userData: user ? {
      id: user.id,
      correo: user.correo,
      nombres: user.nombres,
      apellidos_paterno: user.apellidos_paterno,
      apellidos_materno: user.apellidos_materno,
      dni: user.dni,
      telefono: user.telefono,
      rol: user.rol,
      activo: user.activo,
    } : null,
  }
} 