import { useState, useEffect } from "react"
import { Audiencia, AudienciaSummary, CreateAudienciaDto, UpdateAudienciaDto, AudienciaData } from "@/types/audiencia"
import { useGetAudienciasQuery } from "@/store/api/audienciaApi"

interface UseAudienciasReturn {
  audiencias: Audiencia[]
  summary: AudienciaSummary
  total: number
  isLoading: boolean
  isError: boolean
  error: unknown
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: () => void
  prevPage: () => void
  searchByDate: (date: string) => Promise<void>
  createAudiencia: (data: CreateAudienciaDto) => Promise<{ success: boolean; message?: string }>
  updateAudiencia: (data: UpdateAudienciaDto) => Promise<{ success: boolean; message?: string }>
  deleteAudiencia: (id: number) => Promise<{ success: boolean; message?: string }>
  isCreating: boolean
  isUpdating: boolean
}

export function useAudiencias(): UseAudienciasReturn {
  const [searchParams, setSearchParams] = useState<{ dni: string; fecha: string } | null>(null)
  const [audiencias, setAudiencias] = useState<Audiencia[]>([])
  const [summary, setSummary] = useState<AudienciaSummary>({
    total: 0,
    completadas: 0,
    pendientes: 0,
    procesando: 0
  })
  const [total, setTotal] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Usar la nueva API de audiencias
  const { data: audienciasData, isLoading, isError, error } = useGetAudienciasQuery(
    searchParams!,
    { skip: !searchParams }
  )

  // Actualizar datos cuando cambie la respuesta de la API
  useEffect(() => {
    if (audienciasData?.success) {
      // Convertir AudienciaData[] a Audiencia[] usando los campos correctos de la API
      const convertedAudiencias: Audiencia[] = audienciasData.data.map((item: AudienciaData) => ({
        x_nom_instancia: item.x_nom_instancia,
        n_unico: item.n_unico,
        n_incidente: item.n_incidente,
        x_formato: item.x_formato,
        expediente_unico: item.expediente_unico,
        expediente_incidente: item.expediente_incidente,
        f_audiencia: item.f_audiencia,
        f_ini_prog: item.f_ini_prog,
        f_fin_prog: item.f_fin_prog,
        n_sala: item.n_sala,
        c_audiencia: item.c_audiencia,
        n_programacion: item.n_programacion,
        x_desc_audiencia: item.x_desc_audiencia,
      }))

      setAudiencias(convertedAudiencias)
      setTotal(audienciasData.total)
      
      // Actualizar resumen
      setSummary({
        total: audienciasData.total,
        completadas: 0, // Por ahora 0, se puede calcular si hay campo de estado
        pendientes: audienciasData.total,
        procesando: 0
      })
    }
  }, [audienciasData])

  const searchByDate = async (date: string) => {
    // Obtener DNI del usuario desde localStorage o contexto
    const userData = localStorage.getItem('user_data')
    let dni = "41125304" // DNI por defecto para pruebas
    
    if (userData) {
      try {
        const user = JSON.parse(userData)
        dni = user.dni || "41125304"
      } catch (error) {
        console.error("Error al parsear datos del usuario:", error)
      }
    }

    setSearchParams({ dni, fecha: date })
  }

  const createAudiencia = async (_data: CreateAudienciaDto) => {
    void _data;
    setIsCreating(true)
    try {
      // Aquí irá la lógica de creación cuando la implementes
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    } catch {
      return { success: false, message: "Error al crear la audiencia" }
    } finally {
      setIsCreating(false)
    }
  }

  const updateAudiencia = async (_data: UpdateAudienciaDto) => {
    void _data;
    setIsUpdating(true)
    try {
      // Aquí irá la lógica de actualización cuando la implementes
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    } catch {
      return { success: false, message: "Error al actualizar la audiencia" }
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteAudiencia = async (_id: number) => {
    void _id;
    try {
      // Aquí irá la lógica de eliminación cuando la implementes
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    } catch {
      return { success: false, message: "Error al eliminar la audiencia" }
    }
  }

  const nextPage = () => {
    // Implementar navegación a la siguiente página
  }

  const prevPage = () => {
    // Implementar navegación a la página anterior
  }

  return {
    audiencias,
    summary,
    total,
    isLoading,
    isError,
    error,
    hasNextPage: false, // Por ahora false, se puede implementar paginación
    hasPrevPage: false, // Por ahora false, se puede implementar paginación
    nextPage,
    prevPage,
    searchByDate,
    createAudiencia,
    updateAudiencia,
    deleteAudiencia,
    isCreating,
    isUpdating,
  }
} 