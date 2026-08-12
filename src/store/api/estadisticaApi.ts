import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseApi'
import type {
  RankingUsuariosResponse,
  RankingUsuariosFilters,
  EstadisticasGeneralesResponse,
  EstadisticasTipoActaResponse,
  EstadisticasTipoActaFilters
} from '@/types/estadisticas'

export const estadisticaApi = createApi({
  reducerPath: 'estadisticaApi',
  baseQuery,
  tagTypes: ['RankingUsuarios', 'EstadisticasGenerales', 'EstadisticasTipoActa'],
  endpoints: (builder) => ({
    // Obtener ranking de usuarios por número de actas generadas
    getRankingUsuarios: builder.query<RankingUsuariosResponse, RankingUsuariosFilters>({
      query: (filters) => {
        console.log('🔍 [EstadísticaApi] Filtros recibidos para ranking de usuarios:', filters)
        
        const params = new URLSearchParams()
        
        if (filters.sedeId) {
          params.append('sedeId', filters.sedeId.toString())
        }
        if (filters.fechaInicio) {
          params.append('fechaInicio', filters.fechaInicio)
        }
        if (filters.fechaFin) {
          params.append('fechaFin', filters.fechaFin)
        }
        if (filters.limit) {
          params.append('limit', filters.limit.toString())
        }

        const url = `estadisticas/actas/actas-generadas/ranking-usuarios?${params.toString()}`
        console.log('🌐 [EstadísticaApi] URL construida:', url)
        console.log('📋 [EstadísticaApi] Parámetros de consulta:', Object.fromEntries(params))

        return {
          url,
          method: 'GET',
        }
      },
      providesTags: ['RankingUsuarios'],
      transformResponse: (response: RankingUsuariosResponse) => {
        console.log('📊 [EstadísticaApi] Respuesta del servidor para ranking de usuarios:', response)
        return response
      },
      transformErrorResponse: (response) => {
        console.error('❌ [EstadísticaApi] Error en ranking de usuarios:', response)
        return response
      },
    }),

    // Obtener estadísticas generales del sistema
    getEstadisticasGenerales: builder.query<EstadisticasGeneralesResponse, void>({
      query: () => {
        console.log('🔍 [EstadísticaApi] Solicitando estadísticas generales del sistema')
        const url = 'estadisticas/actas/generales'
        console.log('🌐 [EstadísticaApi] URL para estadísticas generales:', url)
        
        return {
          url,
          method: 'GET',
        }
      },
      providesTags: ['EstadisticasGenerales'],
      transformResponse: (response: EstadisticasGeneralesResponse) => {
        console.log('📊 [EstadísticaApi] Respuesta del servidor para estadísticas generales:', response)
        return response
      },
      transformErrorResponse: (response) => {
        console.error('❌ [EstadísticaApi] Error en estadísticas generales:', response)
        return response
      },
    }),

    // Obtener estadísticas por tipo de acta
    getEstadisticasTipoActa: builder.query<EstadisticasTipoActaResponse, EstadisticasTipoActaFilters>({
      query: (filters) => {
        console.log('🔍 [EstadísticaApi] Filtros recibidos para estadísticas por tipo de acta:', filters)
        
        const params = new URLSearchParams()
        
        if (filters.sedeId) {
          params.append('sedeId', filters.sedeId.toString())
        }
        if (filters.fechaInicio) {
          params.append('fechaInicio', filters.fechaInicio)
        }
        if (filters.fechaFin) {
          params.append('fechaFin', filters.fechaFin)
        }

        const url = `estadisticas/actas/tipo-acta?${params.toString()}`
        console.log('🌐 [EstadísticaApi] URL construida para estadísticas por tipo de acta:', url)
        console.log('📋 [EstadísticaApi] Parámetros de consulta:', Object.fromEntries(params))

        return {
          url,
          method: 'GET',
        }
      },
      providesTags: ['EstadisticasTipoActa'],
      transformResponse: (response: EstadisticasTipoActaResponse) => {
        console.log('📊 [EstadísticaApi] Respuesta del servidor para estadísticas por tipo de acta:', response)
        return response
      },
      transformErrorResponse: (response) => {
        console.error('❌ [EstadísticaApi] Error en estadísticas por tipo de acta:', response)
        return response
      },
    }),
  }),
})

export const {
  useGetRankingUsuariosQuery,
  useGetEstadisticasGeneralesQuery,
  useGetEstadisticasTipoActaQuery,
} = estadisticaApi
