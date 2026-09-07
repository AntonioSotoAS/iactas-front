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
    }),

    // Obtener todos los modelos de acta
    getModelosActa: builder.query<ModeloActaListResponse, void>({
      query: () => ({
        url: '/modelo-acta',
        method: 'GET'
      }),
      providesTags: ['ModelosActa'],
    }),

    // Obtener un modelo de acta por ID
    getModeloActaById: builder.query<ModeloActaResponse, number>({
      query: (id) => ({ url: `/modelo-acta/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'ModelosActa', id }],
    }),

    // Actualizar modelo de acta
    updateModeloActa: builder.mutation<ModeloActaResponse, { id: number; data: UpdateModeloActaDto }>({
      query: ({ id, data }) => ({ url: `/modelo-acta/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error, { id }) => [
        'ModelosActa',
        { type: 'ModelosActa', id }
      ],
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

    // Obtener IDs de modelos favoritos por usuario
    getFavoritosByUser: builder.query<{ success: boolean; data: number[] } | number[], number>({
      query: (userId) => ({
        url: `/modelo-acta/favoritos?userId=${userId}`,
        method: 'GET',
      }),
      providesTags: ['FavoritosModelos'],
    }),

    // Alternar (toggle) favorito
    toggleFavorito: builder.mutation<{ success?: boolean; isFavorite?: boolean; message?: string }, { userId: number; modeloActaId: number }>({
      query: (body) => ({
        url: '/modelo-acta/favoritos/toggle',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FavoritosModelos'],
    }),
  }),
})

export const {
  useCreateModeloActaMutation,
  useGetModelosActaQuery,
  useGetModeloActaByIdQuery,
  useUpdateModeloActaMutation,
  useDeleteModeloActaMutation,
  useGetFavoritosByUserQuery,
  useToggleFavoritoMutation,
} = modeloActaApi 