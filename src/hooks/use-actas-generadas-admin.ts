import { useState, useEffect, useMemo } from "react"
import { useGetActasGeneradasQuery } from "@/store/api/actaGeneradaApi"
import { FilterActaGeneradaDto, EstadoActa } from "@/types/actaGenerada"

export const useActasGeneradasAdmin = (
  filters: {
    estado: string
    expediente: string
    fechaDesde: string
    fechaHasta: string
  },
  applyDateFilters: boolean = false
) => {
  const [filterParams, setFilterParams] = useState<FilterActaGeneradaDto>({
    // No enviar limit ni offset para traer TODOS los registros
    // Inicialmente sin filtros para cargar todos los datos
  })

  // Actualizar filtros automáticamente cuando cambien (estado y expediente)
  // Las fechas solo se aplican cuando applyDateFilters es true
  useEffect(() => {
    const newFilters: FilterActaGeneradaDto = {
      // No enviar limit ni offset - traer todos los registros
    }

    if (filters.estado && filters.estado !== "todos") {
      newFilters.estado = filters.estado as EstadoActa
    }

    if (filters.expediente && filters.expediente.trim() !== "") {
      newFilters.expediente = filters.expediente.trim()
    }

    // Enviar filtros de fecha al backend solo si applyDateFilters es true
    if (applyDateFilters) {
      if (filters.fechaDesde) {
        newFilters.fecha_desde = filters.fechaDesde
      }

      if (filters.fechaHasta) {
        newFilters.fecha_hasta = filters.fechaHasta
      }
    }
    
    setFilterParams(newFilters)
  }, [filters.estado, filters.expediente, filters.fechaDesde, filters.fechaHasta, applyDateFilters])

  // Usar siempre el endpoint principal con todos los filtros
  const {
    data: actasRaw,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetActasGeneradasQuery(filterParams, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  })

  // Los filtros se aplican en el backend
  // Solo retornamos los datos tal como vienen del backend
  const actas = useMemo(() => {
    if (!actasRaw) return actasRaw
    return actasRaw
  }, [actasRaw])

  return {
    actas,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  }
}
