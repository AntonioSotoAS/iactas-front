import { useUploadFileMutation, useGetUploadsQuery, useDeleteUploadMutation, useLazyDownloadUploadQuery } from '@/store/api/uploadApi'
import { UploadFileDto, FilterUploadDto } from '@/store/api/uploadApi'
import { toast } from 'sonner'

export const useUpload = () => {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
  const [deleteUpload, { isLoading: isDeleting }] = useDeleteUploadMutation()
  const [downloadUpload] = useLazyDownloadUploadQuery()

  const uploadFileWithToast = async (file: File, uploadFileDto?: UploadFileDto) => {
    try {
      
      
      
      const result = await uploadFile({ file, uploadFileDto }).unwrap()
      
      if (result.success && result.upload) {

        toast.success(`Archivo "${result.upload.nombre_original}" subido exitosamente`)
        return result.upload
      } else {

        toast.error(`Error al subir archivo: ${result.error || 'Error desconocido'}`)
        return null
      }
    } catch (error) {

      toast.error(`Error al subir archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      return null
    }
  }

  const deleteUploadWithToast = async (id: number) => {
    try {

      
      const result = await deleteUpload(id).unwrap()
      
      if (result.success) {

        toast.success('Archivo eliminado exitosamente')
        return true
      } else {

        toast.error(`Error al eliminar archivo: ${result.error || 'Error desconocido'}`)
        return false
      }
    } catch (error) {

      toast.error(`Error al eliminar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      return false
    }
  }

  const downloadUploadWithToast = async (id: number, filename?: string) => {
    try {

      
      const blob = await downloadUpload(id).unwrap()
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob)
      
      // Crear elemento de descarga
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `archivo-${id}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Liberar URL
      window.URL.revokeObjectURL(url)
      

      toast.success('Archivo descargado exitosamente')
      return true
    } catch (error) {

      toast.error(`Error al descargar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      return false
    }
  }

  return {
    uploadFile: uploadFileWithToast,
    deleteUpload: deleteUploadWithToast,
    downloadUpload: downloadUploadWithToast,
    isUploading,
    isDeleting,
  }
}

export const useUploads = (filterDto?: FilterUploadDto) => {
  const { data, isLoading, isError, error, refetch } = useGetUploadsQuery(filterDto || {})

  return {
    uploads: data?.uploads || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    isError,
    error: data?.error || error,
    refetch,
    success: data?.success || false,
  }
} 