"use client"

import { useState } from "react"
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
import { IconDeviceFloppy, IconPlus } from "@tabler/icons-react"
import { CreateSedeDto } from "@/types/sede"
import { useCreateSedeMutation } from "@/store/api/sedeApi"

interface NuevaSedeFormProps {
  onCancel: () => void
  trigger?: React.ReactNode
}

export function NuevaSedeForm({ onCancel, trigger }: NuevaSedeFormProps) {
  const [open, setOpen] = useState(false)
  const [createSede, { isLoading }] = useCreateSedeMutation()
  
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    activo: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

    const submitData: CreateSedeDto = {
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      activo: formData.activo,
    }

    try {
      await createSede(submitData).unwrap()
      setOpen(false)
      resetForm()
      onCancel()
    } catch (error) {
      console.error("Error al crear sede:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      direccion: "",
      activo: true,
    })
    setErrors({})
  }

  const handleCancel = () => {
    setOpen(false)
    resetForm()
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center space-x-2">
            <IconPlus className="h-4 w-4" />
            <span>Nueva Sede</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Sede</DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva sede en el sistema.
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
            <span>{isLoading ? "Creando..." : "Crear Sede"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
