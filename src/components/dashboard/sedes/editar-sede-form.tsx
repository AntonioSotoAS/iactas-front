"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconDeviceFloppy, IconEdit } from "@tabler/icons-react"
import { Sede, UpdateSedeDto } from "@/types/sede"
import { useUpdateSedeMutation } from "@/store/api/sedeApi"

interface EditarSedeFormProps {
  sede: Sede
  onCancel: () => void
  trigger?: React.ReactNode
}

export function EditarSedeForm({ sede, onCancel, trigger }: EditarSedeFormProps) {
  const [open, setOpen] = useState(false)
  const [updateSede, { isLoading }] = useUpdateSedeMutation()
  
  const [formData, setFormData] = useState({
    nombre: sede.nombre,
    direccion: sede.direccion,
    activo: sede.activo,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Actualizar formData cuando cambie la sede
  useEffect(() => {
    setFormData({
      nombre: sede.nombre,
      direccion: sede.direccion,
      activo: sede.activo,
    })
  }, [sede])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData: UpdateSedeDto = {
      id: sede.id,
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      activo: formData.activo,
    }

    try {
      await updateSede(submitData).unwrap()
      setOpen(false)
      onCancel()
    } catch (error) {
      console.error("Error al actualizar sede:", error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    // Resetear a los valores originales
    setFormData({
      nombre: sede.nombre,
      direccion: sede.direccion,
      activo: sede.activo,
    })
    setErrors({})
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title="Editar sede"
          >
            <IconEdit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Sede</DialogTitle>
          <DialogDescription>
            Modifica la información de la sede.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Sede *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Sede Central"
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej: Av. Principal 123, Ciudad"
              className={errors.direccion ? "border-red-500" : ""}
            />
            {errors.direccion && (
              <p className="text-sm text-red-500">{errors.direccion}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, activo: checked as boolean })
              }
            />
            <Label htmlFor="activo">Sede Activa</Label>
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <IconDeviceFloppy className="h-4 w-4" />
            <span>{isLoading ? "Actualizando..." : "Actualizar Sede"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
