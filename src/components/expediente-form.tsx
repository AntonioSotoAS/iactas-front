"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GetExpedienteDto } from "@/types/expediente"
import { ExpedienteData } from "@/types/expediente"

export function ExpedienteForm() {
  const [formData, setFormData] = useState<GetExpedienteDto>({
    expediente: "",
    incidente: "",
    fecha_expediente: "",
  })
  const [expedienteData] = useState<ExpedienteData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Removed expediente API call - no longer using useGetExpedienteMutation

  }

  const handleInputChange = (field: keyof GetExpedienteDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consultar Expediente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expediente">Número de Expediente</Label>
                <Input
                  id="expediente"
                  type="text"
                  value={formData.expediente}
                  onChange={(e) => handleInputChange("expediente", e.target.value)}
                  placeholder="Ej: 2025034812501437"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="incidente">Incidente</Label>
                <Input
                  id="incidente"
                  type="text"
                  value={formData.incidente}
                  onChange={(e) => handleInputChange("incidente", e.target.value)}
                  placeholder="Ej: 0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fecha_expediente">Fecha (Opcional)</Label>
                <Input
                  id="fecha_expediente"
                  type="date"
                  value={formData.fecha_expediente}
                  onChange={(e) => handleInputChange("fecha_expediente", e.target.value)}
                />
              </div>
            </div>
            
            <Button type="submit">
              Consultar Expediente
            </Button>
          </form>
        </CardContent>
      </Card>

      {expedienteData && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del Expediente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Expediente:</Label>
                <p>{expedienteData.expediente}</p>
              </div>
              <div>
                <Label className="font-semibold">Instancia:</Label>
                <p>{expedienteData.instancia}</p>
              </div>
              <div>
                <Label className="font-semibold">Juez:</Label>
                <p>{expedienteData.juez}</p>
              </div>
              <div>
                <Label className="font-semibold">Especialista:</Label>
                <p>{expedienteData.especialista}</p>
              </div>
              <div>
                <Label className="font-semibold">Ministerio Público:</Label>
                <p>{expedienteData.ministerio_publico}</p>
              </div>
              <div>
                <Label className="font-semibold">Imputado:</Label>
                <p>{expedienteData.imputado}</p>
              </div>
              <div>
                <Label className="font-semibold">Agraviado:</Label>
                <p>{expedienteData.agraviado}</p>
              </div>
              <div>
                <Label className="font-semibold">Delito:</Label>
                <p>{expedienteData.delito}</p>
              </div>
              <div>
                <Label className="font-semibold">Fecha del Expediente:</Label>
                <p>{expedienteData.fecha_expediente}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 