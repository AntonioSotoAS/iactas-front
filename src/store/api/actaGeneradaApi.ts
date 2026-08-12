import { baseApi } from "./baseApi"
import { toast } from "react-hot-toast"
import { 
  ActaGenerada, 
  CreateActaGeneradaDto, 
  UpdateActaGeneradaDto, 
  FilterActaGeneradaDto,
  ActaGeneradaResponse,
  ActasGeneradasResponse,
  EstadisticasResponse,
  EstadisticasContenidoResponse,
  MarkdownResponse,
  EstadoActa
} from "@/types/actaGenerada"

export const actaGeneradaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener todas las actas generadas con filtros
    getActasGeneradas: builder.query<ActasGeneradasResponse, FilterActaGeneradaDto>({
      query: (filters) => ({
        url: "/actas-generadas",
        method: "GET",
        params: filters,
      }),
      providesTags: ["ActasGeneradas"],
    }),

    // Obtener una acta por ID
    getActaGenerada: builder.query<ActaGeneradaResponse, number>({
      query: (id) => ({
        url: `/actas-generadas/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ActasGeneradas", id }],
    }),

    // Crear nueva acta
    createActaGenerada: builder.mutation<ActaGeneradaResponse, CreateActaGeneradaDto>({
      query: (body) => {
        
        return {
          url: "/actas-generadas",
          method: "POST",
          body,
        }
      },
      invalidatesTags: ["ActasGeneradas"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Acta generada exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : "Error al generar el acta"
          toast.error(message || "Error al generar el acta")
        }
      },
    }),

    // Actualizar acta
    updateActaGenerada: builder.mutation<ActaGeneradaResponse, { id: number; data: UpdateActaGeneradaDto }>({
      query: ({ id, data }) => ({
        url: `/actas-generadas/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ActasGeneradas", id }, "ActasGeneradas"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Acta actualizada exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : "Error al actualizar el acta"
          toast.error(message || "Error al actualizar el acta")
        }
      },
    }),

    // Eliminar acta
    deleteActaGenerada: builder.mutation<ActaGeneradaResponse, number>({
      query: (id) => ({
        url: `/actas-generadas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ActasGeneradas"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Acta eliminada exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : "Error al eliminar el acta"
          toast.error(message || "Error al eliminar el acta")
        }
      },
    }),

    // Cambiar estado del acta
    cambiarEstadoActa: builder.mutation<ActaGeneradaResponse, { id: number; estado: EstadoActa }>({
      query: ({ id, estado }) => ({
        url: `/actas-generadas/${id}/estado`,
        method: "PATCH",
        body: { estado },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ActasGeneradas", id }, "ActasGeneradas"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Estado del acta actualizado exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : "Error al actualizar el estado del acta"
          toast.error(message || "Error al actualizar el estado del acta")
        }
      },
    }),

    // Marcar como subida al SIJ
    marcarSubidaSIJ: builder.mutation<ActaGeneradaResponse, number>({
      query: (id) => ({
        url: `/actas-generadas/${id}/marcar-subida-sij`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "ActasGeneradas", id }, "ActasGeneradas"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Acta marcada como subida al SIJ")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : "Error al marcar el acta como subida al SIJ"
          toast.error(message || "Error al marcar el acta como subida al SIJ")
        }
      },
    }),

    // Actualizar markdown
    actualizarMarkdown: builder.mutation<ActaGeneradaResponse, { id: number; markdown: string }>({
      query: ({ id, markdown }) => ({
        url: `/actas-generadas/${id}/markdown`,
        method: "PATCH",
        body: { markdown },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ActasGeneradas", id }, "ActasGeneradas"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled
          toast.success("Markdown actualizado exitosamente")
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : "Error al actualizar el markdown"
          toast.error(message || "Error al actualizar el markdown")
        }
      },
    }),

    // Obtener markdown
    getMarkdown: builder.query<MarkdownResponse, number>({
      query: (id) => ({
        url: `/actas-generadas/${id}/markdown`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ActasGeneradas", id }],
    }),

    // Obtener estadísticas
    getEstadisticas: builder.query<EstadisticasResponse, void>({
      query: () => ({
        url: "/actas-generadas/estadisticas",
        method: "GET",
      }),
      providesTags: ["ActasGeneradas"],
    }),

    // Obtener estadísticas de contenido
    getEstadisticasContenido: builder.query<EstadisticasContenidoResponse, void>({
      query: () => ({
        url: "/actas-generadas/estadisticas-contenido",
        method: "GET",
      }),
      providesTags: ["ActasGeneradas"],
    }),

    // Buscar por expediente
    findByExpediente: builder.query<ActasGeneradasResponse, string>({
      query: (expediente) => ({
        url: `/actas-generadas/expediente/${expediente}`,
        method: "GET",
      }),
      providesTags: ["ActasGeneradas"],
    }),

    // Buscar en markdown
    buscarEnMarkdown: builder.query<ActasGeneradasResponse, string>({
      query: (texto) => ({
        url: `/actas-generadas/buscar-markdown/${texto}`,
        method: "GET",
      }),
      providesTags: ["ActasGeneradas"],
    }),

    // Buscar por usuario
    findByUsuario: builder.query<ActasGeneradasResponse, number>({
      query: (usuarioId) => {

        return {
          url: `/actas-generadas/usuario/${usuarioId}`,
          method: "GET",
        }
      },
      transformResponse: (response: ActaGenerada[] | ActasGeneradasResponse) => {

        
        // Si la respuesta es un array, convertirlo al formato esperado
        if (Array.isArray(response)) {
          const formattedResponse = {
            data: response,
            total: response.length,
            limit: response.length,
            offset: 0,
            success: true
          }
  
          return formattedResponse
        }
        
        // Si ya viene con la estructura correcta, devolverla tal como está
        if (response && typeof response === 'object' && 'data' in response) {
  
          return response
        }
        
        // Si viene como objeto con 'actas', convertirlo
        if (response && typeof response === 'object' && 'actas' in response) {
          const actasArray = (response as { actas: ActaGenerada[] }).actas
          const formattedResponse = {
            data: actasArray,
            total: actasArray.length,
            limit: actasArray.length,
            offset: 0,
            success: true
          }
  
          return formattedResponse
        }
        

        return response
      },
      providesTags: ["ActasGeneradas"],
    }),

    // Descargar contenido (transcripción o markdown)
    descargarContenido: builder.mutation<Blob, { id: number; tipo: 'transcripcion' | 'markdown'; nombreArchivo?: string }>({
      query: ({ id, tipo }) => ({
        url: `/actas-generadas/${id}/descargar/${tipo}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
      // No invalidar tags para evitar que se almacene en el estado
      invalidatesTags: [],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const blob = await queryFulfilled
          
          // Crear URL del blob y descargar
          const url = window.URL.createObjectURL(blob.data)
          const link = document.createElement('a')
          link.href = url
          link.download = arg.nombreArchivo || `acta-${arg.tipo}-${Date.now()}.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          toast.success(`Archivo ${arg.tipo} descargado exitosamente`)
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'data' in error
            ? (error.data as { message?: string })?.message
            : "Error al descargar el archivo"
          toast.error(message || "Error al descargar el archivo")
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetActasGeneradasQuery,
  useGetActaGeneradaQuery,
  useCreateActaGeneradaMutation,
  useUpdateActaGeneradaMutation,
  useDeleteActaGeneradaMutation,
  useCambiarEstadoActaMutation,
  useMarcarSubidaSIJMutation,
  useActualizarMarkdownMutation,
  useGetMarkdownQuery,
  useGetEstadisticasQuery,
  useGetEstadisticasContenidoQuery,
  useFindByExpedienteQuery,
  useBuscarEnMarkdownQuery,
  useFindByUsuarioQuery,
  useDescargarContenidoMutation,
} = actaGeneradaApi
