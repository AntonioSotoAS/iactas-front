// src/store/api/authApi.ts
import { baseApi } from "./baseApi"
import { PerfilResponse } from "@/types/auth"
import { toast } from "react-hot-toast"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { message: string; success: boolean; access_token: string }, 
      { correo: string; password: string }  
    >({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            // Guardar token en localStorage
            localStorage.setItem('access_token', data.access_token)
            toast.success(data.message || "Inicio de sesión exitoso")
          }
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al iniciar sesión"
          toast.error(message || "Error al iniciar sesión")
        }
      },
    }),

    logout: builder.mutation<
      { message: string; success: boolean },
      void
    >({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            // Limpiar token y datos del usuario del localStorage
            localStorage.removeItem('access_token')
            localStorage.removeItem('user_data')
            toast.success(data.message || "Sesión cerrada exitosamente")
          }
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cerrar sesión"
          toast.error(message || "Error al cerrar sesión")
        }
      },
    }),

    perfil: builder.query<
      { user: PerfilResponse; success: boolean },
      void
    >({
      query: () => "/auth/perfil",
      providesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            // Guardar datos del usuario en localStorage
            localStorage.setItem('user_data', JSON.stringify(data.user))
          }
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cargar el perfil"
          toast.error(message || "Error al cargar el perfil")
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useLogoutMutation,
  usePerfilQuery,
} = authApi
