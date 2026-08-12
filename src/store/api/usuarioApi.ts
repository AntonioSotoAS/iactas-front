// src/store/api/usuarioApi.ts
import { baseApi } from "./baseApi"
import { toast } from "react-hot-toast"
import {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  UsuariosResponse,
  UsuarioFilters,
  RolUsuario,
} from "@/types/usuario"
import { ActaGenerada } from "@/types/actaGenerada"

export const usuarioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener lista de usuarios
    getUsuarios: builder.query<
      UsuariosResponse,
      UsuarioFilters
    >({
      query: (params) => {
        // Construir los parámetros de consulta
        const queryParams: Record<string, string | number> = {}
        
        // Parámetros de paginación
        if (params.limit) queryParams.limit = params.limit
        if (params.offset) queryParams.offset = params.offset
        if (params.page) queryParams.page = params.page
        
        // Parámetros de filtrado
        if (params.search && params.search.trim()) {
          queryParams.search = params.search.trim()
        }
        if (params.rol) queryParams.rol = params.rol
        if (params.sede_id !== undefined) {
          if (params.sede_id === -1) {
            queryParams.sin_sede = "true" // Parámetro especial para usuarios sin sede
          } else {
            queryParams.sede_id = params.sede_id
          }
        }
        
        console.log("🔍 API REQUEST - getUsuarios:")
        console.log("📡 URL:", "/usuarios")
        console.log("📦 Parámetros:", JSON.stringify(queryParams, null, 2))

        return {
          url: "/usuarios",
          params: queryParams,
        }
      },
      providesTags: ["Usuarios"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          console.error("❌ ERROR - getUsuarios:", error)
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cargar usuarios"
          console.error("❌ Error message:", message)
          toast.error(message || "Error al cargar usuarios")
        }
      },
    }),

    // Obtener usuario por ID
    getUsuario: builder.query<
      Usuario,
      number
    >({
      query: (id) => `/usuarios/${id}`,
      providesTags: (result, error, id) => [{ type: "Usuarios", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cargar usuario"
          toast.error(message || "Error al cargar usuario")
        }
      },
    }),

    // Crear usuario
    createUsuario: builder.mutation<
      Usuario,
      CreateUsuarioDto
    >({
      query: (body) => ({
        url: "/usuarios",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Usuarios"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Usuario creado exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al crear usuario"
          toast.error(message || "Error al crear usuario")
        }
      },
    }),

    // Actualizar usuario
    updateUsuario: builder.mutation<
      Usuario,
      UpdateUsuarioDto
    >({
      query: ({ id, ...body }) => ({
        url: `/usuarios/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Usuarios", id },
        "Usuarios"
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Usuario actualizado exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al actualizar usuario"
          toast.error(message || "Error al actualizar usuario")
        }
      },
    }),

    // Eliminar usuario
    deleteUsuario: builder.mutation<
      Usuario,
      number
    >({
      query: (id) => ({
        url: `/usuarios/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Usuarios"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Usuario eliminado exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al eliminar usuario"
          toast.error(message || "Error al eliminar usuario")
        }
      },
    }),

    // Obtener roles visibles para un usuario
    getRolesVisibles: builder.query<
      RolUsuario[],
      number
    >({
      query: (id) => `/usuarios/${id}/roles-visibles`,
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cargar roles visibles"
          toast.error(message || "Error al cargar roles visibles")
        }
      },
    }),

    // Test endpoint para verificar sede
    testSede: builder.query<
      { sede: { id: number; nombre: string } | null; existe: boolean },
      number
    >({
      query: (id) => `/usuarios/test/sede/${id}`,
    }),

    // Test endpoint para verificar usuario
    testUsuario: builder.query<
      { 
        usuario: Usuario | null; 
        sede: { id: number; nombre: string } | null;
        existe: boolean 
      },
      number
    >({
      query: (id) => `/usuarios/test/usuario/${id}`,
    }),

    // Obtener estadísticas de peticiones
    getEstadisticasPeticiones: builder.query<
      {
        peticiones_hoy: number;
        peticiones_semana: number;
        peticiones_mes: number;
        limite_diario: number;
        puede_hacer_peticion: boolean;
      },
      number
    >({
      query: (id) => `/usuarios/${id}/estadisticas-peticiones`,
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cargar estadísticas de peticiones"
          toast.error(message || "Error al cargar estadísticas de peticiones")
        }
      },
    }),

    // Incrementar petición
    incrementarPeticion: builder.mutation<
      { message: string },
      number
    >({
      query: (id) => ({
        url: `/usuarios/${id}/incrementar-peticion`,
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Petición incrementada correctamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al incrementar petición"
          toast.error(message || "Error al incrementar petición")
        }
      },
    }),

    // Resetear peticiones diarias
    resetearPeticionesDiarias: builder.mutation<
      { message: string },
      void
    >({
      query: () => ({
        url: "/usuarios/resetear-peticiones-diarias",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Peticiones diarias reseteadas correctamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al resetear peticiones diarias"
          toast.error(message || "Error al resetear peticiones diarias")
        }
      },
    }),

    // Verificar si puede hacer petición
    puedeHacerPeticion: builder.query<
      { puede_hacer_peticion: boolean },
      number
    >({
      query: (id) => `/usuarios/${id}/puede-hacer-peticion`,
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al verificar si puede hacer petición"
          toast.error(message || "Error al verificar si puede hacer petición")
        }
      },
    }),

    // Cambiar contraseña (usuario autenticado)
    cambiarPassword: builder.mutation<
      { success: boolean; message: string },
      { id: number; password_actual: string; nueva_password: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/usuarios/${id}/cambiar-password`,
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Contraseña cambiada exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cambiar contraseña"
          toast.error(message || "Error al cambiar contraseña")
        }
      },
    }),

    // Resetear contraseña (solo administradores)
    resetearPassword: builder.mutation<
      { success: boolean; message: string },
      { id: number; nueva_password: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/usuarios/${id}/resetear-password`,
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Contraseña reseteada exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al resetear contraseña"
          toast.error(message || "Error al resetear contraseña")
        }
      },
    }),

    // Cambiar contraseña por superadmin
    cambiarPasswordSuperadmin: builder.mutation<
      { success: boolean; message: string },
      { id: number; nueva_password: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/usuarios/${id}/cambiar-password-superadmin`,
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Contraseña del usuario cambiada exitosamente por superadmin")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cambiar contraseña del usuario"
          toast.error(message || "Error al cambiar contraseña del usuario")
        }
      },
    }),

    // Hash passwords existentes (solo superadmin)
    hashPasswordsExistentes: builder.mutation<
      { success: boolean; message: string; usuarios_actualizados: number },
      void
    >({
      query: () => ({
        url: "/usuarios/hash-passwords-existentes",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          toast.success(`Contraseñas hasheadas correctamente. ${data.usuarios_actualizados} usuarios actualizados`)
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al hashear contraseñas existentes"
          toast.error(message || "Error al hashear contraseñas existentes")
        }
      },
    }),

    // Obtener actas generadas de un usuario específico
    getActasGeneradasByUsuario: builder.query<
      ActaGenerada[],
      number
    >({
      query: (id) => `/usuarios/${id}/actas-generadas`,
      providesTags: (result, error, id) => [{ type: "ActasGeneradas", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error 
            ? (error.data as { message?: string })?.message 
            : "Error al cargar actas generadas del usuario"
          toast.error(message || "Error al cargar actas generadas del usuario")
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsuariosQuery,
  useGetUsuarioQuery,
  useCreateUsuarioMutation,
  useUpdateUsuarioMutation,
  useDeleteUsuarioMutation,
  useGetRolesVisiblesQuery,
  useTestSedeQuery,
  useTestUsuarioQuery,
  useGetEstadisticasPeticionesQuery,
  useIncrementarPeticionMutation,
  useResetearPeticionesDiariasMutation,
  usePuedeHacerPeticionQuery,
  useCambiarPasswordMutation,
  useResetearPasswordMutation,
  useCambiarPasswordSuperadminMutation,
  useHashPasswordsExistentesMutation,
  useGetActasGeneradasByUsuarioQuery,
} = usuarioApi 