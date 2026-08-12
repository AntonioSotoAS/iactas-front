import { useState, useEffect, useCallback } from "react"
import {
  useGetUsuariosQuery,
  useGetUsuarioQuery,
  useCreateUsuarioMutation,
  useUpdateUsuarioMutation,
  useDeleteUsuarioMutation,
} from "@/store/api/usuarioApi"
import {
  type CreateUsuarioDto,
  type UpdateUsuarioDto,
  type UsuarioFilters,
  type RolUsuario,
  type Usuario,
} from "@/types/usuario"

export function useUsuarios() {
  const [filters, setFilters] = useState<UsuarioFilters>({
    page: 1,
    limit: 10,
    offset: 0,
    search: '',
    rol: undefined,
    sede_id: undefined,
  })

  // Estado para el debounce de búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || '')
    }, 500) // 500ms de delay

    return () => clearTimeout(timer)
  }, [filters.search])

  // Debug: Log de cambios en filtros
  useEffect(() => {
    // Log de cambios en filtros para debugging
  }, [filters, debouncedSearch])

  // Calcular offset basado en la página - SIN usar search del backend
  const queryFilters = {
    ...filters,
    search: undefined, // No enviar search al backend
    offset: ((filters.page || 1) - 1) * (filters.limit || 10),
  }



  const {
    data: usuariosData,
    isLoading: isLoadingUsuarios,
    isError: isErrorUsuarios,
    error: errorUsuarios,
    refetch: refetchUsuarios,
  } = useGetUsuariosQuery(queryFilters, {
    // Solo hacer la petición si hay al menos un filtro válido o es la primera carga
    skip: false,
  })

  const [createUsuario, { isLoading: isCreating }] = useCreateUsuarioMutation()
  const [updateUsuario, { isLoading: isUpdating }] = useUpdateUsuarioMutation()
  const [deleteUsuario, { isLoading: isDeleting }] = useDeleteUsuarioMutation()

  const handleCreateUsuario = async (data: CreateUsuarioDto) => {
    try {
      await createUsuario(data).unwrap()
      return { success: true, message: "Usuario creado exitosamente" }
    } catch (error: unknown) {
      return { 
        success: false, 
        message: error && typeof error === 'object' && 'data' in error 
          ? (error.data as { message?: string })?.message || "Error al crear usuario"
          : "Error al crear usuario" 
      }
    }
  }

  const handleUpdateUsuario = async (data: UpdateUsuarioDto) => {
    try {
      await updateUsuario(data).unwrap()
      return { success: true, message: "Usuario actualizado exitosamente" }
    } catch (error: unknown) {
      return { 
        success: false, 
        message: error && typeof error === 'object' && 'data' in error 
          ? (error.data as { message?: string })?.message || "Error al actualizar usuario"
          : "Error al actualizar usuario" 
      }
    }
  }

  const handleDeleteUsuario = async (id: number) => {
    try {
      await deleteUsuario(id).unwrap()
      return { success: true, message: "Usuario eliminado exitosamente" }
    } catch (error: unknown) {
      return { 
        success: false, 
        message: error && typeof error === 'object' && 'data' in error 
          ? (error.data as { message?: string })?.message || "Error al eliminar usuario"
          : "Error al eliminar usuario" 
      }
    }
  }

  const updateFilters = (newFilters: Partial<UsuarioFilters>) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters, 
      page: 1, // Resetear a la primera página cuando se cambian los filtros
      offset: 0 // Resetear offset
    }))
  }

  const setLimit = (limit: number) => {
    setFilters(prev => ({ 
      ...prev, 
      limit,
      page: 1, // Resetear a la primera página cuando se cambia el límite
      offset: 0 // Resetear offset
    }))
  }

  const nextPage = () => {
    const currentPage = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit
    
    if (endIndex < totalFiltrado) {
      setFilters(prev => ({ 
        ...prev, 
        page: currentPage + 1,
        offset: currentPage * limit
      }))
    }
  }

  const prevPage = () => {
    const currentPage = filters.page || 1
    if (currentPage > 1) {
      setFilters(prev => ({ 
        ...prev, 
        page: currentPage - 1,
        offset: (currentPage - 2) * (prev.limit || 10)
      }))
    }
  }

  // Función para filtrar usuarios en el frontend
  const filtrarUsuarios = useCallback((usuarios: Usuario[], searchTerm: string) => {
    if (!searchTerm || !searchTerm.trim()) {
      return usuarios
    }

    const termino = searchTerm.toLowerCase().trim()
    return usuarios.filter(usuario => {
      const nombreCompleto = `${usuario.nombres || ''} ${usuario.apellidos_paterno || ''} ${usuario.apellidos_materno || ''}`.toLowerCase()
      const correo = (usuario.correo || '').toLowerCase()
      const dni = (usuario.dni || '').toLowerCase()
      
      return nombreCompleto.includes(termino) || 
             correo.includes(termino) || 
             dni.includes(termino)
    })
  }, [])

  // Aplicar filtros del frontend
  const usuariosFiltrados = filtrarUsuarios(usuariosData?.data || [], debouncedSearch)
  const totalFiltrado = usuariosFiltrados.length

  // Función para reintentar la petición
  const retry = useCallback(() => {
    refetchUsuarios()
  }, [refetchUsuarios])

  return {
    // Datos
    usuarios: usuariosFiltrados,
    total: totalFiltrado,
    page: filters.page || 1,
    limit: filters.limit || 10,
    totalPages: Math.ceil(totalFiltrado / (filters.limit || 10)),
    
    // Estados
    isLoading: isLoadingUsuarios,
    isError: isErrorUsuarios,
    error: errorUsuarios,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Filtros
    filters,
    updateFilters,
    
    // Funciones específicas de filtrado
    setSearch: (search: string) => updateFilters({ search }),
    setRol: (rol: RolUsuario | undefined) => updateFilters({ rol }),
    setSedeId: (sede_id: number | undefined) => updateFilters({ sede_id }),
    setLimit,
    clearFilters: () => updateFilters({ search: '', rol: undefined, sede_id: undefined }),
    
    // Paginación
    nextPage,
    prevPage,
    hasNextPage: usuariosData ? usuariosData.data.length === filters.limit : false,
    hasPrevPage: filters.page && filters.page > 1,
    
    // Acciones
    createUsuario: handleCreateUsuario,
    updateUsuario: handleUpdateUsuario,
    deleteUsuario: handleDeleteUsuario,
    retry,
  }
}

export function useUsuario(id: number) {
  const {
    data: usuarioData,
    isLoading,
    isError,
    error,
  } = useGetUsuarioQuery(id, {
    skip: !id,
  })

  return {
    usuario: usuarioData,
    isLoading,
    isError,
    error,
  }
} 