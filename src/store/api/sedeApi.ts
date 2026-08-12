// src/store/api/sedeApi.ts
import { baseApi } from "./baseApi"
import { toast } from "react-hot-toast"
import {
  CreateSedeDto,
  UpdateSedeDto,
  SedeResponse,
  SedesResponse,
  SedeFilters,
} from "@/types/sede"

export const sedeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener lista de sedes
    getSedes: builder.query<
      SedesResponse,
      SedeFilters
    >({
      query: (params) => ({
        url: "/sedes",
        params,
      }),
      providesTags: ["Sedes"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { error?: string })?.error 
            : "Error al cargar sedes"
          toast.error(message || "Error al cargar sedes")
        }
      },
    }),

    // Obtener sede por ID
    getSede: builder.query<
      SedeResponse,
      number
    >({
      query: (id) => `/sedes/${id}`,
      providesTags: (result, error, id) => [{ type: "Sedes", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { error?: string })?.error 
            : "Error al cargar sede"
          toast.error(message || "Error al cargar sede")
        }
      },
    }),

    // Crear sede
    createSede: builder.mutation<
      SedeResponse,
      CreateSedeDto
    >({
      query: (body) => ({
        url: "/sedes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sedes"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            toast.success("Sede creada exitosamente")
          } else {
            toast.error(data.error || "Error al crear sede")
          }
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { error?: string })?.error 
            : "Error al crear sede"
          toast.error(message || "Error al crear sede")
        }
      },
    }),

    // Actualizar sede
    updateSede: builder.mutation<
      SedeResponse,
      UpdateSedeDto
    >({
      query: ({ id, ...body }) => ({
        url: `/sedes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sedes", id },
        "Sedes"
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            toast.success("Sede actualizada exitosamente")
          } else {
            toast.error(data.error || "Error al actualizar sede")
          }
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { error?: string })?.error 
            : "Error al actualizar sede"
          toast.error(message || "Error al actualizar sede")
        }
      },
    }),

    // Eliminar sede
    deleteSede: builder.mutation<
      SedeResponse,
      number
    >({
      query: (id) => ({
        url: `/sedes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sedes"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            toast.success("Sede eliminada exitosamente")
          } else {
            toast.error(data.error || "Error al eliminar sede")
          }
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { error?: string })?.error 
            : "Error al eliminar sede"
          toast.error(message || "Error al eliminar sede")
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSedesQuery,
  useGetSedeQuery,
  useCreateSedeMutation,
  useUpdateSedeMutation,
  useDeleteSedeMutation,
} = sedeApi
