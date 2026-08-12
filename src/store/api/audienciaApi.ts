// src/store/api/audienciaApi.ts
import { baseApi } from "./baseApi"
import { GetAudienciasDto, AudienciasResponse } from "@/types/audiencia"
import { toast } from "react-hot-toast"

export const audienciaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudiencias: builder.query<
      AudienciasResponse,
      GetAudienciasDto
    >({
      query: (params) => ({
        url: "/audiencias",
        method: "GET",
        params,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            toast.success(data.message || "Audiencias obtenidas exitosamente")
          }
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al obtener las audiencias"
          toast.error(message || "Error al obtener las audiencias")
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAudienciasQuery,
} = audienciaApi 