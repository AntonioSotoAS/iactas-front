"use client"

import { useState } from "react"
import { useGetAudienciasQuery } from "@/store/api/audienciaApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GetAudienciasDto } from "@/types/audiencia"

export function AudienciasForm() {
  const [formData, setFormData] = useState<GetAudienciasDto>({
    dni: "",
    fecha: "",
  })
  const [shouldFetch, setShouldFetch] = useState(false)

  const { data: audienciasData, isLoading, error } = useGetAudienciasQuery(
    formData,
    { skip: !shouldFetch }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShouldFetch(true)
  }

  const handleInputChange = (field: keyof GetAudienciasDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consultar Audiencias</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => handleInputChange("dni", e.target.value)}
                  placeholder="Ej: 12345678"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Consultando..." : "Consultar Audiencias"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error al cargar las audiencias</p>
          </CardContent>
        </Card>
      )}

      {audienciasData && audienciasData.success && (
        <Card>
          <CardHeader>
            <CardTitle>
              Audiencias ({audienciasData.total} encontradas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audienciasData.data.length === 0 ? (
              <p className="text-gray-500">No se encontraron audiencias para esta fecha</p>
            ) : (
              <div className="space-y-4">
                {audienciasData.data.map((audiencia, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label className="font-semibold">Instancia:</Label>
                          <p>{audiencia.x_nom_instancia}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Tipo de Audiencia:</Label>
                          <p>{audiencia.x_desc_audiencia}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Expediente:</Label>
                          <p>{audiencia.x_formato}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Incidente:</Label>
                          <p>{audiencia.n_incidente}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Fecha:</Label>
                          <p>{audiencia.f_audiencia}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Horario:</Label>
                          <p>{audiencia.f_ini_prog} - {audiencia.f_fin_prog}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 