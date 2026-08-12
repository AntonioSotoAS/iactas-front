"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCambiarPasswordSuperadminMutation } from "@/store/api/usuarioApi"
import { Usuario } from "@/types/usuario"
import { IconLock } from "@tabler/icons-react"

interface CambiarPasswordModalProps {
  usuario: Usuario
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CambiarPasswordModal({ 
  usuario, 
  open, 
  onOpenChange 
}: CambiarPasswordModalProps) {
  const [nuevaPassword, setNuevaPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [error, setError] = useState("")

  const [cambiarPassword, { isLoading }] = useCambiarPasswordSuperadminMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!nuevaPassword.trim()) {
      setError("La nueva contraseña es requerida")
      return
    }

    if (nuevaPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    try {
      await cambiarPassword({
        id: usuario.id,
        nueva_password: nuevaPassword
      }).unwrap()

      // Limpiar formulario y cerrar modal
      setNuevaPassword("")
      setConfirmarPassword("")
      setError("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
    }
  }

  const handleCancel = () => {
    setNuevaPassword("")
    setConfirmarPassword("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconLock className="h-5 w-5" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription>
            Cambiar la contraseña del usuario{" "}
            <span className="font-semibold">{usuario.nombres} {usuario.apellidos_paterno} {usuario.apellidos_materno}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nueva-password">Nueva Contraseña</Label>
            <Input
              id="nueva-password"
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Ingrese la nueva contraseña"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmar-password">Confirmar Contraseña</Label>
            <Input
              id="confirmar-password"
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Confirme la nueva contraseña"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
