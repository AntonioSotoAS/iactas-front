import { baseApi } from "./baseApi"

export interface ActaPendiente {
  x_nom_usuario: string;
  c_dni: string;
  x_nom_instancia: string;
  n_unico: string;
  n_incidente: string;
  x_formato: string;
  n_sala: string;
  c_audiencia: string;
  n_programacion: string;
  f_inicio_aud: string;
  x_resolucion: string;
  f_descargo: string;
  f_ult_registro: string;
  x_observacion: string;
  acta_generada_id?: number | null;
  estado_acta?: string | null;
  modelo_uri?: string | null;
  transcripcion_uri?: string | null;
  acta_generada_uri?: string | null;
}

export const actasPendientesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActasPendientes: builder.query<ActaPendiente[], string>({
      query: (dni) => `/actas-pendientes/${dni}`,
      providesTags: ["ActasPendientes" as never],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetActasPendientesQuery,
} = actasPendientesApi;
