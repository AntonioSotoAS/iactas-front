"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconDownload, IconFileText, IconFile, IconX } from "@tabler/icons-react"
import { ActaGenerada } from "@/types/actaGenerada"
import { useDownloadFileByUriMutation } from "@/store/api/uploadApi"
import { toast } from "sonner"

interface VisualizarActaModalProps {
  acta: ActaGenerada | null
  isOpen: boolean
  onClose: () => void
  initialTab?: 'acta' | 'modelo' | 'transcripcion'
}

export function VisualizarActaModal({ acta, isOpen, onClose, initialTab = 'acta' }: VisualizarActaModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(false)
  
  const [downloadFileByUri] = useDownloadFileByUriMutation()

  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  const handleDownload = async (uri: string, tipo: string, expediente: string) => {
    if (!uri) {
      toast.error("No hay archivo disponible para descargar")
      return
    }

    try {
      setIsLoading(true)
      const result = await downloadFileByUri(uri)
      
      if (result.data) {
        const blobUrl = window.URL.createObjectURL(result.data)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `${expediente}-${tipo}.docx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        
        toast.success("Archivo descargado exitosamente")
      }
    } catch (error) {
      console.error(`Error al descargar ${tipo}:`, error)
      toast.error(`Error al descargar ${tipo}`)
    } finally {
      setIsLoading(false)
    }
  }


  if (!acta) return null

  const hasActaGenerada = !!acta.acta_generada_uri
  const hasModelo = !!acta.modelo_uri
  const hasTranscripcion = !!acta.transcripcion_uri

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Visualizar Acta - {acta.expediente}
          </DialogTitle>
          <DialogDescription>
            Visualiza y descarga el modelo, transcripción y acta generada
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'acta' | 'modelo' | 'transcripcion')} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="acta" disabled={!hasActaGenerada}>
                <IconFileText className="h-4 w-4 mr-2" />
                Acta Generada
              </TabsTrigger>
              <TabsTrigger value="modelo" disabled={!hasModelo}>
                <IconFile className="h-4 w-4 mr-2" />
                Modelo
              </TabsTrigger>
              <TabsTrigger value="transcripcion" disabled={!hasTranscripcion}>
                <IconFileText className="h-4 w-4 mr-2" />
                Transcripción
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              {/* Acta Generada */}
              <TabsContent value="acta" className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Acta Generada</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(acta.acta_generada_uri!, "acta-generada", acta.expediente)}
                      disabled={!hasActaGenerada || isLoading}
                    >
                      <IconDownload className="h-4 w-4 mr-2" />
                      {isLoading ? "Descargando..." : "Descargar"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 border rounded-lg p-4 overflow-auto bg-gray-50">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {hasActaGenerada 
                      ? "Haz clic en 'Descargar' para obtener el archivo"
                      : "No hay acta generada disponible"
                    }
                  </div>
                </div>
              </TabsContent>

              {/* Modelo */}
              <TabsContent value="modelo" className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Modelo</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(acta.modelo_uri!, "modelo", acta.expediente)}
                      disabled={!hasModelo || isLoading}
                    >
                      <IconDownload className="h-4 w-4 mr-2" />
                      {isLoading ? "Descargando..." : "Descargar"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 border rounded-lg p-4 overflow-auto bg-gray-50">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {hasModelo 
                      ? "Haz clic en 'Descargar' para obtener el archivo"
                      : "No hay modelo disponible"
                    }
                  </div>
                </div>
              </TabsContent>

              {/* Transcripción */}
              <TabsContent value="transcripcion" className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Transcripción</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(acta.transcripcion_uri!, "transcripcion", acta.expediente)}
                      disabled={!hasTranscripcion || isLoading}
                    >
                      <IconDownload className="h-4 w-4 mr-2" />
                      {isLoading ? "Descargando..." : "Descargar"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 border rounded-lg p-4 overflow-auto bg-gray-50">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {hasTranscripcion 
                      ? "Haz clic en 'Descargar' para obtener el archivo"
                      : "No hay transcripción disponible"
                    }
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <IconX className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
