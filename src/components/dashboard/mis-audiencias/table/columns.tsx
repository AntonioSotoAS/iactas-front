"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { IconFileText } from "@tabler/icons-react"
import { formatearHora } from "@/lib/utils"
import { Audiencia } from "@/types/audiencia"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

// Interface no utilizada - comentada para evitar warnings
// interface ColumnsProps {
//   onGenerarActa: (audienciaId: number) => void
// }

// Componente separado para el modal
function GenerarActaModal({ audiencia }: { audiencia: Audiencia }) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()


  const handleGenerarActa = () => {
    setShowModal(true)
  }

  const handleSeleccionarTipo = () => {
    setShowModal(false)
    
    // Pasar datos como props usando los nombres exactos de la API
    const audienciaData = {
      x_nom_instancia: audiencia.x_nom_instancia,
      n_unico: audiencia.n_unico,
      n_incidente: audiencia.n_incidente,
      x_formato: audiencia.x_formato,
      expediente_unico: audiencia.expediente_unico,
      expediente_incidente: audiencia.expediente_incidente,
      f_audiencia: audiencia.f_audiencia,
      f_ini_prog: audiencia.f_ini_prog,
      f_fin_prog: audiencia.f_fin_prog,
      n_sala: audiencia.n_sala,
      c_audiencia: audiencia.c_audiencia,
      n_programacion: audiencia.n_programacion,
      x_desc_audiencia: audiencia.x_desc_audiencia
    }
    
    // Guardar datos en sessionStorage para que estén disponibles en la página de destino
    sessionStorage.setItem('audienciaData', JSON.stringify(audienciaData))
    
    router.push('/dashboard/generar-acta')
  }

  return (
    <>
      <Button
        size="sm"
        onClick={handleGenerarActa}
      >
        <IconFileText className="h-4 w-4 mr-2" />
        Generar Acta
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generar Acta</DialogTitle>
            <DialogDescription>
              Selecciona el método para generar el acta
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center mt-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary w-full max-w-md"
              onClick={handleSeleccionarTipo}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <IconFileText className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Generación Automática</CardTitle>
                <CardDescription>
                  Genera el acta automáticamente con IA
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Proceso rápido y eficiente para todas las audiencias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function createColumns(): ColumnDef<Audiencia>[] {
  return [
    {
      accessorKey: "x_nom_instancia",
      header: "INSTANCIA",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue("x_nom_instancia")}
          </div>
        )
      },
    },
    {
      accessorKey: "x_desc_audiencia",
      header: "TIPO",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("x_desc_audiencia")}
          </div>
        )
      },
    },
    {
      accessorKey: "x_formato",
      header: "EXPEDIENTE",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("x_formato")}
          </div>
        )
      },
    },
    {
      accessorKey: "f_audiencia",
      header: "FECHA AUDIENCIA",
      cell: ({ row }) => {
        const fecha = row.getValue("f_audiencia") as string
        return (
          <div>
            {fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES') : '-'}
          </div>
        )
      },
    },
    {
      accessorKey: "f_ini_prog",
      header: "HORA INICIO",
      cell: ({ row }) => {
        const horaInicio = row.getValue("f_ini_prog") as string
        return (
          <div className="font-medium text-center">
            {horaInicio ? formatearHora(horaInicio) : '-'}
          </div>
        )
      },
    },
    {
      accessorKey: "f_fin_prog",
      header: "HORA FIN",
      cell: ({ row }) => {
        const horaFin = row.getValue("f_fin_prog") as string
        return (
          <div className="font-medium text-center">
            {horaFin ? formatearHora(horaFin) : '-'}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "GENERAR ACTA",
      cell: ({ row }) => {
        const audiencia = row.original

        return (
          <div className="flex items-center space-x-2">
            <GenerarActaModal audiencia={audiencia} />
          </div>
        )
      },
    },
  ]
} 