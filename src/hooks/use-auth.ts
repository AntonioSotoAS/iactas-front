import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLoginMutation, useLogoutMutation } from "@/store/api/authApi"
import { socketService } from "@/lib/socket"

export function useAuth() {
  const router = useRouter()
  const [login] = useLoginMutation()
  const [logout] = useLogoutMutation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si hay token al cargar
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    setIsAuthenticated(!!token && !!userData)
    setIsLoading(false)
  }, [])

  const handleLogin = async (correo: string, password: string) => {
    try {
      const result = await login({ correo, password }).unwrap()
      if (result.success) {
        setIsAuthenticated(true)
        // Redirigir automáticamente después del login exitoso
        router.push("/dashboard")
        return { success: true }
      }
      return { success: false, error: result.message }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : "Error al iniciar sesión"
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const handleLogout = async () => {
    try {
      socketService.forceDisconnect()
      await logout().unwrap()
      setIsAuthenticated(false)
      router.push("/login")
      return { success: true }
    } catch (error: unknown) {
      socketService.forceDisconnect()
      // Aún así limpiar datos locales
      setIsAuthenticated(false)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_data')
      router.push("/login")
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : "Error al cerrar sesión"
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    const authenticated = !!token && !!userData
    setIsAuthenticated(authenticated)
    return authenticated
  }

  return {
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    checkAuth,
  }
} 