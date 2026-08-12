"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { IconEdit, IconX, IconDeviceFloppy } from "@tabler/icons-react"
import { ActaGenerada, EstadoActa, UpdateActaGeneradaDto } from "@/types/actaGenerada"
import { useUpdateActaGeneradaMutation } from "@/store/api/actaGeneradaApi"
import { toast } from "sonner"

interface EditarActaModalProps {
  acta: ActaGenerada | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditarActaModal({ acta, isOpen, onClose, onSuccess }: EditarActaModalProps) {
  const [formData, setFormData] = useState<UpdateActaGeneradaDto>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const [updateActaGenerada] = useUpdateActaGeneradaMutation()

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (acta && isOpen) {
      setFormData({
        expediente: acta.expediente,
        transcripcion: acta.transcripcion,
        markdown_respuesta: acta.markdown_respuesta,
        estado: acta.estado,
        acta_subida_al_sij: acta.acta_subida_al_sij,
      })
    }
  }, [acta, isOpen])

  const handleInputChange = (field: keyof UpdateActaGeneradaDto, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acta) return

    try {
      setIsLoading(true)
      await updateActaGenerada({
        id: acta.id,
        data: formData
      }).unwrap()

      toast.success("Acta actualizada exitosamente")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error al actualizar acta:", error)
      toast.error("Error al actualizar el acta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({})
    onClose()
  }

  if (!acta) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit className="h-5 w-5" />
            Editar Acta - {acta.expediente}
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del acta generada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expediente">Expediente</Label>
              <Input
                id="expediente"
                value={formData.expediente || ""}
                onChange={(e) => handleInputChange("expediente", e.target.value)}
                placeholder="Número de expediente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado || ""}
                onValueChange={(value) => handleInputChange("estado", value as EstadoActa)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoActa.PENDIENTE}>Pendiente</SelectItem>
                  <SelectItem value={EstadoActa.GENERADA}>Generada</SelectItem>
                  <SelectItem value={EstadoActa.SUBIDA_SIJ}>Subida al SIJ</SelectItem>
                  <SelectItem value={EstadoActa.ERROR}>Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcripcion">Transcripción</Label>
            <Textarea
              id="transcripcion"
              value={formData.transcripcion || ""}
              onChange={(e) => handleInputChange("transcripcion", e.target.value)}
              placeholder="Transcripción del acta"
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markdown_respuesta">Markdown Respuesta</Label>
            <Textarea
              id="markdown_respuesta"
              value={formData.markdown_respuesta || ""}
              onChange={(e) => handleInputChange("markdown_respuesta", e.target.value)}
              placeholder="Contenido en markdown"
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acta_subida_al_sij"
              checked={formData.acta_subida_al_sij || false}
              onCheckedChange={(checked) => handleInputChange("acta_subida_al_sij", checked)}
            />
            <Label htmlFor="acta_subida_al_sij">
              Acta subida al SIJ
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              <IconX className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
