import { useState } from 'react'
import { 
  useGetActasSubidasSijQuery,
  useGetActaSubidaSijByIdQuery,
  useCreateActaSubidaSijMutation,
  useUpdateActaSubidaSijMutation,
  useDeleteActaSubidaSijMutation,
  useSincronizarDesdeODBCMutation,
  useSincronizarConMatchingMutation,
  useProbarConfiguracionCronQuery,
  useGetEstadisticasDuplicadosQuery
} from '@/store/api/actaSubidaSijApi'
import type { 
  GetActasSubidasSijDto, 
  CreateActaSubidaSijDto, 
  UpdateActaSubidaSijDto 
} from '@/types/actaSubidaSij'

export function useActasSubidasSij(filters?: GetActasSubidasSijDto) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...filters
  }


  const {
    data: actasData,
    isLoading,
    error,
    refetch
  } = useGetActasSubidasSijQuery(queryParams)

  
  // Log detallado del error
  if (error) {
    console.error('🚨 [useActasSubidasSij] Error completo:', JSON.stringify(error, null, 2))
    if ('data' in error && error.data) {
      console.error('🚨 [useActasSubidasSij] Error data:', error.data)
    }
  }

  return {
    actas: actasData?.data || [],
    total: actasData?.total || 0,
    page: actasData?.page || 1,
    limit: actasData?.limit || 10,
    totalPages: actasData?.totalPages || 0,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize
  }
}

export function useActaSubidaSij(id: number) {
  const {
    data: actaData,
    isLoading,
    error,
    refetch
  } = useGetActaSubidaSijByIdQuery(id)

  return {
    acta: actaData?.data,
    isLoading,
    error,
    refetch
  }
}

export function useCreateActaSubidaSij() {
  const [createActa, { isLoading, error }] = useCreateActaSubidaSijMutation()

  const handleCreate = async (data: CreateActaSubidaSijDto) => {
    try {
      const result = await createActa(data).unwrap()
      return result
    } catch (err) {
      throw err
    }
  }

  return {
    createActa: handleCreate,
    isLoading,
    error
  }
}

export function useUpdateActaSubidaSij() {
  const [updateActa, { isLoading, error }] = useUpdateActaSubidaSijMutation()

  const handleUpdate = async (id: number, data: UpdateActaSubidaSijDto) => {
    try {
      const result = await updateActa({ id, data }).unwrap()
      return result
    } catch (err) {
      throw err
    }
  }

  return {
    updateActa: handleUpdate,
    isLoading,
    error
  }
}

export function useDeleteActaSubidaSij() {
  const [deleteActa, { isLoading, error }] = useDeleteActaSubidaSijMutation()

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteActa(id).unwrap()
      return result
    } catch (err) {
      throw err
    }
  }

  return {
    deleteActa: handleDelete,
    isLoading,
    error
  }
}

export function useSincronizacion() {
  const [sincronizarDesdeODBC, { isLoading: isLoadingODBC, error: errorODBC }] = useSincronizarDesdeODBCMutation()
  const [sincronizarConMatching, { isLoading: isLoadingMatching, error: errorMatching }] = useSincronizarConMatchingMutation()

  const handleSincronizarDesdeODBC = async () => {
    try {
      const result = await sincronizarDesdeODBC().unwrap()
      return result
    } catch (err) {
      throw err
    }
  }

  const handleSincronizarConMatching = async () => {
    try {
      const result = await sincronizarConMatching().unwrap()
      return result
    } catch (err) {
      throw err
    }
  }

  return {
    sincronizarDesdeODBC: handleSincronizarDesdeODBC,
    sincronizarConMatching: handleSincronizarConMatching,
    isLoadingODBC,
    isLoadingMatching,
    errorODBC,
    errorMatching
  }
}

export function useConfiguracionCron() {
  const {
    data: configData,
    isLoading,
    error,
    refetch
  } = useProbarConfiguracionCronQuery()

  return {
    configuracion: configData,
    isLoading,
    error,
    refetch
  }
}

export function useEstadisticasDuplicados() {
  const {
    data: estadisticasData,
    isLoading,
    error,
    refetch
  } = useGetEstadisticasDuplicadosQuery()

  return {
    estadisticas: estadisticasData,
    isLoading,
    error,
    refetch
  }
}
