import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseApi'
import type { 
  // ActaSubidaSij, 
  CreateActaSubidaSijDto, 
  UpdateActaSubidaSijDto, 
  GetActasSubidasSijDto,
  ActaSubidaSijResponse,
  ActasSubidasSijResponse,
  SincronizacionResponse,
  EstadisticasDuplicadosResponse
} from '@/types/actaSubidaSij'

export const actaSubidaSijApi = createApi({
  reducerPath: 'actaSubidaSijApi',
  baseQuery,
  tagTypes: ['ActaSubidaSij', 'ActasSubidasSij'],
  endpoints: (builder) => ({
    // Crear nueva acta subida al SIJ
    createActaSubidaSij: builder.mutation<ActaSubidaSijResponse, CreateActaSubidaSijDto>({
      query: (data) => ({
        url: 'actas-subidas-sij',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ActasSubidasSij'],
    }),

    // Obtener todas las actas subidas al SIJ con filtros
    getActasSubidasSij: builder.query<ActasSubidasSijResponse, GetActasSubidasSijDto>({
      query: (params) => {
        console.log('🔍 [ActaSubidaSijApi] Parámetros recibidos:', params)
        
        const searchParams = new URLSearchParams()
        
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.idActaGenerado) searchParams.append('idActaGenerado', params.idActaGenerado.toString())
        if (params.lIndPdf) searchParams.append('lIndPdf', params.lIndPdf)
        if (params.fechaDesde) searchParams.append('fechaDesde', params.fechaDesde)
        if (params.fechaHasta) searchParams.append('fechaHasta', params.fechaHasta)

        const queryString = searchParams.toString()
        const url = `actas-subidas-sij${queryString ? `?${queryString}` : ''}`
        
        console.log('🌐 [ActaSubidaSijApi] URL construida:', url)
        console.log('📋 [ActaSubidaSijApi] Parámetros de consulta:', Object.fromEntries(searchParams))
        console.log('🔍 [ActaSubidaSijApi] Parámetros originales:', params)
        
        return url
      },
      providesTags: ['ActasSubidasSij'],
      transformResponse: (response: ActasSubidasSijResponse) => {
        console.log('📊 [ActaSubidaSijApi] Respuesta del servidor:', response)
        return response
      },
      transformErrorResponse: (response) => {
        console.error('❌ [ActaSubidaSijApi] Error en la consulta:', response)
        console.error('❌ [ActaSubidaSijApi] Error data:', response.data)
        console.error('❌ [ActaSubidaSijApi] Error status:', response.status)
        return response
      },
    }),

    // Obtener acta subida al SIJ por ID
    getActaSubidaSijById: builder.query<ActaSubidaSijResponse, number>({
      query: (id) => `actas-subidas-sij/${id}`,
      providesTags: (result, error, id) => [{ type: 'ActaSubidaSij', id }],
    }),

    // Actualizar acta subida al SIJ
    updateActaSubidaSij: builder.mutation<ActaSubidaSijResponse, { id: number; data: UpdateActaSubidaSijDto }>({
      query: ({ id, data }) => ({
        url: `actas-subidas-sij/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ActaSubidaSij', id },
        'ActasSubidasSij'
      ],
    }),

    // Eliminar acta subida al SIJ
    deleteActaSubidaSij: builder.mutation<ActaSubidaSijResponse, number>({
      query: (id) => ({
        url: `actas-subidas-sij/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ActaSubidaSij', id },
        'ActasSubidasSij'
      ],
    }),

    // Sincronizar actas desde ODBC
    sincronizarDesdeODBC: builder.mutation<SincronizacionResponse, void>({
      query: () => ({
        url: 'actas-subidas-sij/sincronizar',
        method: 'POST',
      }),
      invalidatesTags: ['ActasSubidasSij'],
    }),

    // Sincronizar actas con matching desde ODBC
    sincronizarConMatching: builder.mutation<SincronizacionResponse, void>({
      query: () => ({
        url: 'actas-subidas-sij/sincronizar-con-matching',
        method: 'POST',
      }),
      invalidatesTags: ['ActasSubidasSij'],
    }),

    // Probar configuración de cron jobs
    probarConfiguracionCron: builder.query<{ success: boolean; message: string; timestamp: string }, void>({
      query: () => 'actas-subidas-sij/probar-configuracion',
    }),

    // Obtener estadísticas de duplicados
    getEstadisticasDuplicados: builder.query<EstadisticasDuplicadosResponse, void>({
      query: () => 'actas-subidas-sij/estadisticas-duplicados',
    }),
  }),
})

export const {
  useCreateActaSubidaSijMutation,
  useGetActasSubidasSijQuery,
  useGetActaSubidaSijByIdQuery,
  useUpdateActaSubidaSijMutation,
  useDeleteActaSubidaSijMutation,
  useSincronizarDesdeODBCMutation,
  useSincronizarConMatchingMutation,
  useProbarConfiguracionCronQuery,
  useGetEstadisticasDuplicadosQuery,
} = actaSubidaSijApi
