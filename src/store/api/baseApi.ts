// src/store/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { endpoint }) => {
    // Solo establecer Content-Type para endpoints que no sean uploads
    if (!endpoint.includes('upload')) {
      headers.set("Accept", "application/json")
      headers.set("Content-Type", "application/json")
    } else {
      // Para uploads, solo establecer Accept
      headers.set("Accept", "application/json")
      // NO establecer Content-Type para que el navegador lo establezca automáticamente
    }

    // Agregar token si existe
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    return headers
  },
})

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
  tagTypes: ["Auth", "Usuarios", "Expedientes", "Audiencias", "ModelosActa", "Sedes", "ActasGeneradas", "ActaSolicitud", "FavoritosModelos", "ActasPendientes"],
})
