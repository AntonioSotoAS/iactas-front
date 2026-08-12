"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconDatabase, IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react"

interface ConfirmarSincronizacionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmarSincronizacionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: ConfirmarSincronizacionModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error en sincronización:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <IconAlertTriangle className="h-5 w-5" />
            Confirmar Sincronización con SIJ
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Esta acción realizará una sincronización con matching desde la base de datos ODBC 
            del Sistema Integrado Judicial (SIJ).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IconDatabase className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800">
                  ¿Qué hace esta sincronización?
                </p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Consulta la base de datos ODBC del SIJ</li>
                  <li>• Hace matching con actas generadas usando n_sala, c_audiencia y n_programacion</li>
                  <li>• Actualiza registros existentes si encuentra duplicados</li>
                  <li>• Crea nuevos registros para actas no sincronizadas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IconAlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Advertencia
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Esta operación puede tomar varios minutos dependiendo de la cantidad de datos. 
                  No cierres esta ventana hasta que se complete.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isConfirming}
            className="flex items-center gap-2"
          >
            <IconX className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isConfirming}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {isLoading || isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Sincronizando...
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4" />
                Sí, Sincronizar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
