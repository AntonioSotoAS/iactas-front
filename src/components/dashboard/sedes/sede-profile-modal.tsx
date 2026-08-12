"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconBuilding, IconMapPin, IconUsers, IconCalendar } from "@tabler/icons-react"
import { Sede } from "@/types/sede"

interface SedeProfileModalProps {
  sede: Sede
  onClose: () => void
  trigger: React.ReactNode
}

export function SedeProfileModal({ sede, onClose, trigger }: SedeProfileModalProps) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <IconBuilding className="h-5 w-5" />
            <span>Información de la Sede</span>
          </DialogTitle>
          <DialogDescription>
            Detalles completos de la sede seleccionada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconBuilding className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{sede.nombre}</h3>
                <Badge variant={sede.activo ? "default" : "secondary"}>
                  {sede.activo ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IconMapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dirección</p>
                  <p className="text-sm text-gray-600">{sede.direccion}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <IconUsers className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Usuarios Asignados</p>
                  <p className="text-sm text-gray-600">
                    {sede.usuarios?.length || 0} usuarios
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <IconCalendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">ID de Sede</p>
                  <p className="text-sm text-gray-600">#{sede.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de usuarios si existen */}
          {sede.usuarios && sede.usuarios.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Usuarios en esta sede:</h4>
              <div className="space-y-2">
                {sede.usuarios.map((usuario) => (
                  <div key={usuario.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {usuario.nombres.charAt(0)}{usuario.apellidos_paterno.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {usuario.nombres} {usuario.apellidos_paterno} {usuario.apellidos_materno}
                      </p>
                      <p className="text-xs text-gray-500">{usuario.correo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado de la sede */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Estado de la sede:</span>
              <Badge variant={sede.activo ? "default" : "secondary"}>
                {sede.activo ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {sede.activo 
                ? "Esta sede está activa y puede ser utilizada por los usuarios." 
                : "Esta sede está inactiva y no puede ser utilizada por los usuarios."
              }
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
