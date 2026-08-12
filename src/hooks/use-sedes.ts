// src/hooks/use-sedes.ts
import { useState } from "react"
import { useGetSedesQuery, useCreateSedeMutation, useUpdateSedeMutation, useDeleteSedeMutation } from "@/store/api/sedeApi"
import { CreateSedeDto, UpdateSedeDto, SedeFilters } from "@/types/sede"
import { toast } from "react-hot-toast"

export function useSedes() {
  const [filters, setFilters] = useState<SedeFilters>({
    page: 1,
    limit: 10,
  })

  const { data: sedesResponse, isLoading, refetch } = useGetSedesQuery(filters)
  const [createSede, { isLoading: isCreating }] = useCreateSedeMutation()
  const [updateSede, { isLoading: isUpdating }] = useUpdateSedeMutation()
  const [deleteSede, { isLoading: isDeleting }] = useDeleteSedeMutation()

  const sedes = sedesResponse?.sedes || []
  const total = sedesResponse?.total || 0

  const handleCreateSede = async (data: CreateSedeDto) => {
    try {
      await createSede(data).unwrap()
      toast.success("Sede creada exitosamente")
      refetch()
      return true
    } catch (error) {
      console.error("Error al crear sede:", error)
      return false
    }
  }

  const handleUpdateSede = async (data: UpdateSedeDto) => {
    try {
      await updateSede(data).unwrap()
      toast.success("Sede actualizada exitosamente")
      refetch()
      return true
    } catch (error) {
      console.error("Error al actualizar sede:", error)
      return false
    }
  }

  const handleDeleteSede = async (id: number) => {
    try {
      await deleteSede(id).unwrap()
      toast.success("Sede eliminada exitosamente")
      refetch()
      return true
    } catch (error) {
      console.error("Error al eliminar sede:", error)
      return false
    }
  }

  const updateFilters = (newFilters: Partial<SedeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return {
    // Data
    sedes,
    total,
    filters,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Actions
    refetch,
    handleCreateSede,
    handleUpdateSede,
    handleDeleteSede,
    updateFilters,
  }
}
