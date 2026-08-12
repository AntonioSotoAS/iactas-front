import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseApi'


export interface UploadFileDto {
  tipo?: 'acta' | 'modelo' | 'transcripcion' | 'documento' | 'imagen' | 'video' | 'otro'
  descripcion?: string
  ruta_personalizada?: string
  nombre_personalizado?: string
  carpeta_personalizada?: string
  expediente_id?: string
}

export interface ConvertMarkdownDto {
  markdown: string
}

export interface ConvertMarkdownResponse {
  success: boolean
  error?: string
}

export interface UploadToPathDto {
  ruta: string
  nombre_personalizado?: string
  descripcion?: string
}

export interface UploadStatsResponse {
  total: number
  documentos: number
  imagenes: number
  videos: number
  otros: number
  success: boolean
  error?: string
}

export interface UploadResponse {
  id: number
  nombre_original: string
  nombre_archivo: string
  ruta_completa: string
  mimetype: string
  tamaño: number
  tipo: string
  url_publica: string
  descripcion?: string
  activo: boolean
  user_id: number
  created_at: string
  updated_at: string
  usuario?: {
    id: number
    nombre: string
    email: string
  }
}

export interface UploadFileResponse {
  upload: UploadResponse | null
  success: boolean
  error?: string
  ruta_creada?: string
}

export interface ListUploadsResponse {
  uploads: UploadResponse[]
  total: number
  page: number
  limit: number
  success: boolean
  error?: string
}

export interface GetUploadResponse {
  upload: UploadResponse | null
  success: boolean
  error?: string
}

export interface DeleteUploadResponse {
  success: boolean
  error?: string
}

export interface FilterUploadDto {
  page?: number
  limit?: number
  nombre_original?: string
  tipo?: string
  user_id?: number
  activo?: boolean
}

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery,
  tagTypes: ['Upload'],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadFileResponse, { file: File; uploadFileDto?: UploadFileDto }>({
      query: ({ file, uploadFileDto }) => {
        const formData = new FormData()
        formData.append('archivo', file)
        
        if (uploadFileDto) {
          if (uploadFileDto.tipo) {
            formData.append('tipo', uploadFileDto.tipo)
          }
          if (uploadFileDto.descripcion) {
            formData.append('descripcion', uploadFileDto.descripcion)
          }
          if (uploadFileDto.ruta_personalizada) {
            formData.append('ruta_personalizada', uploadFileDto.ruta_personalizada)
          }
          if (uploadFileDto.nombre_personalizado) {
            formData.append('nombre_personalizado', uploadFileDto.nombre_personalizado)
          }
          if (uploadFileDto.carpeta_personalizada) {
            formData.append('carpeta_personalizada', uploadFileDto.carpeta_personalizada)
          }
          if (uploadFileDto.expediente_id) {
            formData.append('expediente_id', uploadFileDto.expediente_id)
          }
        }

        return {
          url: '/uploads',
          method: 'POST',
          body: formData,
          // No incluir Content-Type para que el navegador lo establezca automáticamente con el boundary
        }
      },
      invalidatesTags: ['Upload'],
    }),

    uploadToPath: builder.mutation<UploadFileResponse, { file: File; uploadToPathDto: UploadToPathDto }>({
      query: ({ file, uploadToPathDto }) => {
        const formData = new FormData()
        formData.append('archivo', file)
        formData.append('ruta', uploadToPathDto.ruta)
        
        if (uploadToPathDto.nombre_personalizado) {
          formData.append('nombre_personalizado', uploadToPathDto.nombre_personalizado)
        }
        if (uploadToPathDto.descripcion) {
          formData.append('descripcion', uploadToPathDto.descripcion)
        }

        return {
          url: '/uploads/upload',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['Upload'],
    }),

    getUploadStats: builder.query<UploadStatsResponse, void>({
      query: () => ({
        url: '/uploads/stats',
        method: 'GET',
      }),
      providesTags: ['Upload'],
    }),

    convertMarkdownToDocx: builder.mutation<Blob, ConvertMarkdownDto>({
      query: (convertDto) => ({
        url: '/uploads/convert-markdown',
        method: 'POST',
        body: convertDto,
        responseHandler: (response) => response.blob(),
      }),
      // No invalidar tags para evitar que se almacene en el estado
      invalidatesTags: [],
    }),

    getUploads: builder.query<ListUploadsResponse, FilterUploadDto>({
      query: (params) => ({
        url: '/uploads',
        method: 'GET',
        params,
      }),
      providesTags: ['Upload'],
    }),

    getUpload: builder.query<GetUploadResponse, number>({
      query: (id) => ({
        url: `/uploads/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Upload', id }],
    }),

    deleteUpload: builder.mutation<DeleteUploadResponse, number>({
      query: (id) => ({
        url: `/uploads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Upload'],
    }),

    downloadUpload: builder.query<Blob, number>({
      query: (id) => ({
        url: `/uploads/${id}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

  }),
})

// Función de descarga directa que no usa Redux para evitar problemas de serialización
export const downloadFileDirectly = async (uri: string, filename?: string): Promise<void> => {
  try {
    const response = await fetch(`/api/upload/download-file?uri=${encodeURIComponent(uri)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `archivo-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw error;
  }
};

// API separado para descarga de archivos (mantenido para compatibilidad)
export const downloadApi = createApi({
  reducerPath: 'downloadApi',
  baseQuery, // Usar el mismo baseQuery que funciona para otros endpoints
  endpoints: (builder) => ({
    downloadFileByUri: builder.mutation<Blob, string>({
      query: (uri) => ({
        url: `/upload/download-file?uri=${encodeURIComponent(uri)}`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
      // No invalidar tags para evitar almacenar en el estado
      invalidatesTags: [],
    }),
  }),
})

export const {
  useUploadFileMutation,
  useUploadToPathMutation,
  useGetUploadStatsQuery,
  useConvertMarkdownToDocxMutation,
  useGetUploadsQuery,
  useGetUploadQuery,
  useDeleteUploadMutation,
  useLazyDownloadUploadQuery,
} = uploadApi

export const {
  useDownloadFileByUriMutation,
} = downloadApi 