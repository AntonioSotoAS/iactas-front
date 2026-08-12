import { useMemo } from "react"
import { useFindByUsuarioQuery } from "@/store/api/actaGeneradaApi"
import { ActasGeneradasResponse } from "@/types/actaGenerada"
import { useUser } from "./use-user"

export const useActasGeneradas = (filters: {
  search: string
  estado: string
  expediente: string
}) => {
  const { user } = useUser()
  
  const {
    data: actasRaw,
    isLoading,
    isError,
    error,
    refetch,
  } = useFindByUsuarioQuery(user?.id || 0, {
    refetchOnMountOrArgChange: true,
    skip: !user?.id, // No hacer la petición si no hay usuario
  })

  // Aplicar filtros del lado del cliente
  const actas = useMemo(() => {
    if (!actasRaw?.data) return actasRaw

    let filteredData = [...actasRaw.data]

    // Filtro por búsqueda en markdown y expediente
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredData = filteredData.filter(acta => 
        acta.markdown_respuesta?.toLowerCase().includes(searchLower) ||
        acta.expediente?.toLowerCase().includes(searchLower) ||
        acta.transcripcion?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por estado
    if (filters.estado && filters.estado !== "todos") {
      filteredData = filteredData.filter(acta => acta.estado === filters.estado)
    }

    // Filtro por expediente
    if (filters.expediente) {
      const expedienteLower = filters.expediente.toLowerCase()
      filteredData = filteredData.filter(acta => 
        acta.expediente?.toLowerCase().includes(expedienteLower)
      )
    }

    return {
      ...actasRaw,
      data: filteredData,
      total: filteredData.length
    }
  }, [actasRaw, filters])

  // Console logs para debugging - solo ID enviado y respuesta


  return {
    actas: actas as ActasGeneradasResponse | undefined,
    isLoading,
    isError,
    error,
    refetch,
  }
}

