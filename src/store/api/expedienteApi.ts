// src/store/api/expedienteApi.ts
import { baseApi } from "./baseApi"
import { GetExpedienteDto, ExpedienteResponse } from "@/types/expediente"
import { toast } from "react-hot-toast"

export const expedienteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpediente: builder.query<ExpedienteResponse, GetExpedienteDto>({
      query: (body) => ({
        url: "/expedientes/obtener",
        method: "POST",
        body,
      }),
      providesTags: ["Expedientes"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al obtener el expediente"
          toast.error(message || "Error al obtener el expediente")
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetExpedienteQuery,
} = expedienteApi