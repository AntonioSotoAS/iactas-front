import { baseApi } from './baseApi'
import { 
  CreateModeloActaDto, 
  UpdateModeloActaDto, 
  ModeloActaResponse, 
  ModeloActaListResponse 
} from '@/types/modeloActa'
import { toast } from 'react-hot-toast'

export const modeloActaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Crear modelo de acta
    createModeloActa: builder.mutation<ModeloActaResponse, CreateModeloActaDto>({
      query: (body) => ({ url: '/modelo-acta', method: 'POST', body }),
      invalidatesTags: ['ModelosActa'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success('Modelo de acta creado exitosamente')
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : 'Error al crear el modelo de acta'
          toast.error(message || 'Error al crear el modelo de acta')
        }
      },
    }),

    // Obtener todos los modelos de acta
    getModelosActa: builder.query<ModeloActaListResponse, { userId?: number }>({
      query: (params) => ({ 
        url: '/modelo-acta', 
        method: 'GET', 
        params: params.userId ? { userId: params.userId } : {} 
      }),
      providesTags: ['ModelosActa'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : 'Error al obtener los modelos de acta'
          toast.error(message || 'Error al obtener los modelos de acta')
        }
      },
    }),

    // Obtener un modelo de acta por ID
    getModeloActaById: builder.query<ModeloActaResponse, number>({
      query: (id) => ({ url: `/modelo-acta/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'ModelosActa', id }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : 'Error al obtener el modelo de acta'
          toast.error(message || 'Error al obtener el modelo de acta')
        }
      },
    }),

    // Actualizar modelo de acta
    updateModeloActa: builder.mutation<ModeloActaResponse, { id: number; data: UpdateModeloActaDto }>({
      query: ({ id, data }) => ({ url: `/modelo-acta/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error, { id }) => [
        'ModelosActa',
        { type: 'ModelosActa', id }
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success('Modelo de acta actualizado exitosamente')
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : 'Error al actualizar el modelo de acta'
          toast.error(message || 'Error al actualizar el modelo de acta')
        }
      },
    }),

    // Eliminar modelo de acta
    deleteModeloActa: builder.mutation<ModeloActaResponse, number>({
      query: (id) => ({ url: `/modelo-acta/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ModelosActa'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success('Modelo de acta eliminado exitosamente')
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : 'Error al eliminar el modelo de acta'
          toast.error(message || 'Error al eliminar el modelo de acta')
        }
      },
    }),
  }),
})

export const {
  useCreateModeloActaMutation,
  useGetModelosActaQuery,
  useGetModeloActaByIdQuery,
  useUpdateModeloActaMutation,
  useDeleteModeloActaMutation,
} = modeloActaApi 