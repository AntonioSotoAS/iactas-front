"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconTrash, IconX, IconAlertTriangle } from "@tabler/icons-react"
import { ActaGenerada } from "@/types/actaGenerada"
import { useDeleteActaGeneradaMutation } from "@/store/api/actaGeneradaApi"
import { toast } from "sonner"

interface EliminarActaModalProps {
  acta: ActaGenerada | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EliminarActaModal({ acta, isOpen, onClose, onSuccess }: EliminarActaModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const [deleteActaGenerada] = useDeleteActaGeneradaMutation()

  const handleDelete = async () => {
    if (!acta) return

    try {
      setIsLoading(true)
      await deleteActaGenerada(acta.id).unwrap()

      toast.success("Acta eliminada exitosamente")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error al eliminar acta:", error)
      toast.error("Error al eliminar el acta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!acta) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <IconAlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el acta y todos sus datos asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IconTrash className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-red-900">Acta a eliminar:</h4>
                <div className="text-sm text-red-700">
                  <p><strong>ID:</strong> {acta.id}</p>
                  <p><strong>Expediente:</strong> {acta.expediente}</p>
                  <p><strong>Estado:</strong> {acta.estado}</p>
                  <p><strong>Creado por:</strong> {acta.creado_por_usuario ? 
                    `${acta.creado_por_usuario.nombres} ${acta.creado_por_usuario.apellidos_paterno} ${acta.creado_por_usuario.apellidos_materno}`.trim() 
                    : 'No disponible'
                  }</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            <IconX className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            <IconTrash className="h-4 w-4 mr-2" />
            {isLoading ? "Eliminando..." : "Eliminar Acta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
