import { baseApi } from './baseApi'
import {
  // ActaSolicitud,
  CreateActaSolicitudDto,
  UpdateActaSolicitudDto,
  QueryActaSolicitudDto,
  ColaFifoResponseDto,
  ColaFifoStatsDto,
  ActaSolicitudResponse,
  ActaSolicitudesResponse,
  // ColaFifoResponse,
  // ColaFifoStatsResponse,
  NextToProcessResponse,
  MarkCompletedDto,
  MarkErrorDto,
  CleanupResponse
} from '@/types/actaSolicitud'

export const actaSolicitudApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Crear nueva solicitud de acta
    createActaSolicitud: builder.mutation<ActaSolicitudResponse, CreateActaSolicitudDto>({
      query: (data) => ({
        url: '/acta-solicitud',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ActaSolicitud'],
    }),

    // Obtener todas las solicitudes con filtros y paginación
    getActaSolicitudes: builder.query<ActaSolicitudesResponse, QueryActaSolicitudDto>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        
        if (params.estado) searchParams.append('estado', params.estado)
        if (params.prioridad) searchParams.append('prioridad', params.prioridad)
        if (params.user_id) searchParams.append('user_id', params.user_id.toString())
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.sortBy) searchParams.append('sortBy', params.sortBy)
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

        return `/acta-solicitud?${searchParams.toString()}`
      },
      providesTags: ['ActaSolicitud'],
    }),

    // Obtener cola FIFO de solicitudes (La caché se invalida globalmente vía WebSockets)
    getColaFifo: builder.query<ColaFifoResponseDto[], void>({
      query: () => '/acta-solicitud/cola-fifo',
      providesTags: ['ActaSolicitud'],
    }),

    // Obtener estadísticas de la cola FIFO
    getColaFifoStats: builder.query<ColaFifoStatsDto, void>({
      query: () => '/acta-solicitud/cola-fifo/stats',
      providesTags: ['ActaSolicitud'],
    }),

    // Obtener siguiente solicitud para procesar
    getNextToProcess: builder.query<NextToProcessResponse, void>({
      query: () => '/acta-solicitud/next-to-process',
      providesTags: ['ActaSolicitud'],
    }),

    // Obtener solicitud por ID
    getActaSolicitudById: builder.query<ActaSolicitudResponse, number>({
      query: (id) => `/acta-solicitud/${id}`,
      providesTags: (result, error, id) => [{ type: 'ActaSolicitud', id }],
    }),

    // Actualizar solicitud
    updateActaSolicitud: builder.mutation<ActaSolicitudResponse, { id: number; data: UpdateActaSolicitudDto }>({
      query: ({ id, data }) => ({
        url: `/acta-solicitud/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ActaSolicitud', id },
        'ActaSolicitud'
      ],
    }),

    // Reintentar solicitud
    retryActaSolicitud: builder.mutation<ActaSolicitudResponse, number>({
      query: (id) => ({
        url: `/acta-solicitud/${id}/retry`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ActaSolicitud', id },
        'ActaSolicitud'
      ],
    }),

    // Cancelar solicitud
    cancelActaSolicitud: builder.mutation<ActaSolicitudResponse, number>({
      query: (id) => ({
        url: `/acta-solicitud/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ActaSolicitud', id },
        'ActaSolicitud'
      ],
    }),

    // Marcar solicitud como completada
    markActaSolicitudCompleted: builder.mutation<{ message: string; success: boolean }, { id: number; data: MarkCompletedDto }>({
      query: ({ id, data }) => ({
        url: `/acta-solicitud/${id}/mark-completed`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ActaSolicitud', id },
        'ActaSolicitud'
      ],
    }),

    // Marcar solicitud como error
    markActaSolicitudError: builder.mutation<{ message: string; success: boolean }, { id: number; data: MarkErrorDto }>({
      query: ({ id, data }) => ({
        url: `/acta-solicitud/${id}/mark-error`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ActaSolicitud', id },
        'ActaSolicitud'
      ],
    }),

    // Eliminar solicitud
    deleteActaSolicitud: builder.mutation<void, number>({
      query: (id) => ({
        url: `/acta-solicitud/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ActaSolicitud', id },
        'ActaSolicitud'
      ],
    }),

    // Limpiar solicitudes completadas antiguas
    cleanupActaSolicitudes: builder.mutation<CleanupResponse, { days?: number }>({
      query: ({ days }) => ({
        url: `/acta-solicitud/cleanup${days ? `?days=${days}` : ''}`,
        method: 'POST',
      }),
      invalidatesTags: ['ActaSolicitud'],
    }),

    // Obtener estado del procesador
    getEstadoProcesador: builder.query<{
      message: string;
      data: {
        isProcessing: boolean;
        isPausedForOverload: boolean;
        overloadPauseUntil: string | null;
        remainingPauseMinutes: number | null;
        timestamp: string;
      };
      success: boolean;
    }, void>({
      query: () => '/acta-solicitud/estado-procesador',
      providesTags: ['ActaSolicitud'],
    }),
  }),
})

export const {
  useCreateActaSolicitudMutation,
  useGetActaSolicitudesQuery,
  useGetColaFifoQuery,
  useGetColaFifoStatsQuery,
  useGetNextToProcessQuery,
  useGetActaSolicitudByIdQuery,
  useUpdateActaSolicitudMutation,
  useRetryActaSolicitudMutation,
  useCancelActaSolicitudMutation,
  useMarkActaSolicitudCompletedMutation,
  useMarkActaSolicitudErrorMutation,
  useDeleteActaSolicitudMutation,
  useCleanupActaSolicitudesMutation,
  useGetEstadoProcesadorQuery,
} = actaSolicitudApi
