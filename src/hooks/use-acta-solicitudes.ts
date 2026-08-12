import { useMemo } from "react"
import { ActaSolicitud, ColaFifoItem, ColaFifoStats, CreateActaSolicitudDto } from "@/types/actaSolicitud"
import { useGetActaSolicitudesQuery, useGetColaFifoQuery, useGetColaFifoStatsQuery, useCreateActaSolicitudMutation } from "@/store/api/actaSolicitudApi"

interface UseActaSolicitudesReturn {
  solicitudes: ActaSolicitud[]
  colaFifo: ColaFifoItem[]
  estadisticasCola: ColaFifoStats | null
  isLoading: boolean
  isError: boolean
  error: unknown
  isLoadingCola: boolean
  isErrorCola: boolean
  errorCola: unknown
  refreshSolicitudes: () => void
  refreshCola: () => void
  createSolicitud: (data: CreateActaSolicitudDto) => Promise<{ success: boolean; message?: string }>
  isCreating: boolean
}

export function useActaSolicitudes(): UseActaSolicitudesReturn {
  // Queries para obtener datos
  const { 
    data: solicitudesData, 
    isLoading: isLoadingSolicitudes, 
    isError: isErrorSolicitudes, 
    error: errorSolicitudes,
    refetch: refetchSolicitudes
  } = useGetActaSolicitudesQuery({ page: 1, limit: 100, estado: undefined }) // Todas las solicitudes

  const { 
    data: colaFifoData, 
    isLoading: isLoadingColaFifo, 
    isError: isErrorColaFifo, 
    error: errorColaFifo,
    refetch: refetchColaFifo
  } = useGetColaFifoQuery()

  const { 
    data: statsData, 
    isLoading: isLoadingStats, 
    isError: isErrorStats, 
    error: errorStats,
    refetch: refetchStats
  } = useGetColaFifoStatsQuery()

  // Mutation para crear solicitud
  const [createSolicitudMutation, { isLoading: isCreating }] = useCreateActaSolicitudMutation()

  // Derivar datos directamente desde RTK Query sin duplicar estado
  const solicitudes = useMemo(() => solicitudesData?.data || [], [solicitudesData])
  const colaFifo = useMemo(() => Array.isArray(colaFifoData) ? colaFifoData : [], [colaFifoData])
  const estadisticasCola = useMemo(() => statsData || null, [statsData])

  const refreshSolicitudes = () => {
    refetchSolicitudes()
  }

  const refreshCola = () => {
    refetchColaFifo()
    refetchStats()
  }

  const createSolicitud = async (data: CreateActaSolicitudDto) => {
    try {
      const result = await createSolicitudMutation(data).unwrap()
      
      if (result.success) {
        // Refrescar datos después de crear
        refreshSolicitudes()
        refreshCola()
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message || "Error al crear la solicitud" }
      }
    } catch (error: unknown) {
      console.error("Error al crear solicitud:", error)
      return { 
        success: false, 
        message: error && typeof error === 'object' && 'data' in error 
          ? (error.data as { message?: string })?.message || "Error al crear la solicitud"
          : "Error al crear la solicitud" 
      }
    }
  }

  return {
    solicitudes,
    colaFifo,
    estadisticasCola,
    isLoading: isLoadingSolicitudes,
    isError: isErrorSolicitudes,
    error: errorSolicitudes,
    isLoadingCola: isLoadingColaFifo || isLoadingStats,
    isErrorCola: isErrorColaFifo || isErrorStats,
    errorCola: errorColaFifo || errorStats,
    refreshSolicitudes,
    refreshCola,
    createSolicitud,
    isCreating,
  }
}
