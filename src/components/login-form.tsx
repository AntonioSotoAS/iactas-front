"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLoginMutation } from "@/store/api/authApi"
import { toast } from "react-hot-toast"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()
  const [formData, setFormData] = useState({
    correo: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await login(formData).unwrap()
      
      if (result.success) {
        toast.success("¡Inicio de sesión exitoso!")
        router.push("/dashboard")
      } else {
        toast.error(result.message || "Error en el inicio de sesión")
      }
    } catch (error: unknown) {
      console.error("Error de login:", error)
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message || "Error en el inicio de sesión"
        : "Error en el inicio de sesión"
      toast.error(errorMessage)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Ingresa tu correo electrónico para acceder a tu cuenta
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="correo">Correo Electrónico</Label>
          <Input 
            id="correo" 
            name="correo"
            type="email" 
            placeholder="usuario@ejemplo.com" 
            value={formData.correo}
            onChange={handleInputChange}
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={formData.password}
            onChange={handleInputChange}
            required 
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </div>
    </form>
  )
}
