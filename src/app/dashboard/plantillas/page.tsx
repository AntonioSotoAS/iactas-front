'use client'

import React, { useState } from 'react'
import {
  useGetModelosActaQuery,
  useDeleteModeloActaMutation,
  useCreateModeloActaMutation
} from '@/store/api/modeloActaApi'
import { ModeloActaData } from '@/types/modeloActa'
import { PlantillaFormDialog } from '@/components/plantillas/plantilla-form-dialog'
import { ModeloDetailDialog } from '@/components/plantillas/modelo-detail-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  IconPlus,
  IconSearch,
  IconFileCode,
  IconEdit,
  IconTrash,
  IconCopy,
  IconFileText,
  IconRobot,
  IconBrackets,
  IconAlertTriangle,
  IconEye
} from '@tabler/icons-react'
import { toast } from 'react-hot-toast'
import { useUser } from '@/hooks/use-user'

export default function PlantillasPage() {
  const { user } = useUser()
  const userId = user?.id || 1

  const { data: response, isLoading, refetch } = useGetModelosActaQuery({ userId })
  const [deleteModeloActa, { isLoading: isDeleting }] = useDeleteModeloActaMutation()
  const [createModeloActa] = useCreateModeloActaMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPlantilla, setSelectedPlantilla] = useState<ModeloActaData | null>(null)

  // Estado para el modal de detalle y eliminación
  const [detailPlantilla, setDetailPlantilla] = useState<ModeloActaData | null>(null)
  const [plantillaToDelete, setPlantillaToDelete] = useState<ModeloActaData | null>(null)

  const plantillas = response?.data || []

  const filteredPlantillas = plantillas.filter((p) =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateNew = () => {
    setSelectedPlantilla(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (plantilla: ModeloActaData) => {
    setSelectedPlantilla(plantilla)
    setIsDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!plantillaToDelete) return

    try {
      await deleteModeloActa(plantillaToDelete.id).unwrap()
      toast.success(`Modelo "${plantillaToDelete.titulo}" eliminado exitosamente`)
      setPlantillaToDelete(null)
      refetch()
    } catch (err) {
      console.error('Error al eliminar modelo de acta:', err)
      toast.error('Error al eliminar el modelo de acta')
    }
  }

  const handleDuplicate = async (plantilla: ModeloActaData) => {
    try {
      await createModeloActa({
        titulo: `${plantilla.titulo} (Copia)`,
        descripcion: plantilla.descripcion || '',
        userId,
        docxUrl: plantilla.docxUrl,
        jsonSchema: plantilla.jsonSchema,
        instruccionesIa: plantilla.instruccionesIa,
        variables: plantilla.variables,
      }).unwrap()
      toast.success('Modelo de acta duplicado exitosamente')
      refetch()
    } catch (err) {
      console.error('Error al duplicar modelo de acta:', err)
      toast.error('Error al duplicar el modelo de acta')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconFileCode className="w-7 h-7 text-primary" />
            Modelos de Actas
          </h1>
          <p className="text-sm text-muted-foreground">
            Crea y administra modelos de actas personalizados con documentos Word (.docx), esquemas JSON y prompts para la Inteligencia Artificial.
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <IconPlus className="w-4 h-4" />
          Nuevo Modelo
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar modelo por nombre o descripción..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Modelos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/40" />
          ))}
        </div>
      ) : filteredPlantillas.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <IconFileCode className="w-12 h-12 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg">No se encontraron modelos de actas</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchTerm
                ? 'No hay modelos que coincidan con tu búsqueda.'
                : 'Aún no has creado ningún modelo de acta personalizado. Haz clic en "Nuevo Modelo" para comenzar.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateNew} size="sm" className="mt-2">
                <IconPlus className="w-4 h-4 mr-1" />
                Crear Mi Primer Modelo
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantillas.map((plantilla) => (
            <Card key={plantilla.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold line-clamp-1">
                    {plantilla.titulo}
                  </CardTitle>
                  <Badge variant={plantilla.activo !== false ? 'default' : 'secondary'} className="text-xs">
                    {plantilla.activo !== false ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-xs min-h-[2.5rem]">
                  {plantilla.descripcion || 'Sin descripción'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 pb-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                    <IconFileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{plantilla.docxUrl ? 'Modelo DOCX' : 'Sin DOCX'}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                    <IconBrackets className="w-3.5 h-3.5 text-purple-600" />
                    <span>{plantilla.jsonSchema ? 'JSON Schema' : 'Sin JSON'}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                    <IconRobot className="w-3.5 h-3.5 text-green-600" />
                    <span>{plantilla.instruccionesIa ? 'Prompt IA' : 'Sin Prompt'}</span>
                  </div>
                </div>

                {plantilla.variables && plantilla.variables.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Variables ({plantilla.variables.length}): </span>
                    {plantilla.variables.slice(0, 4).map((v) => `{{${v}}}`).join(', ')}
                    {plantilla.variables.length > 4 && '...'}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(plantilla.fechaCreacion || Date.now()).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Ver Detalle"
                    onClick={() => setDetailPlantilla(plantilla)}
                  >
                    <IconEye className="w-4 h-4 text-emerald-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Editar"
                    onClick={() => handleEdit(plantilla)}
                  >
                    <IconEdit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Duplicar"
                    onClick={() => handleDuplicate(plantilla)}
                  >
                    <IconCopy className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Eliminar"
                    onClick={() => setPlantillaToDelete(plantilla)}
                  >
                    <IconTrash className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <PlantillaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        plantillaToEdit={selectedPlantilla}
        onSuccess={() => refetch()}
      />

      {/* Modal de Detalle */}
      <ModeloDetailDialog
        open={!!detailPlantilla}
        onOpenChange={(open) => !open && setDetailPlantilla(null)}
        modelo={detailPlantilla}
        onEdit={(modelo) => handleEdit(modelo)}
      />

      {/* Modal de Confirmación de Eliminación */}
      <AlertDialog open={!!plantillaToDelete} onOpenChange={(open) => !open && setPlantillaToDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-red-600 mb-1">
              <div className="p-2 bg-red-100 rounded-full">
                <IconAlertTriangle className="w-6 h-6" />
              </div>
              <AlertDialogTitle className="text-lg">¿Eliminar modelo de acta?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm pt-2">
              ¿Estás seguro de que deseas eliminar el modelo <strong className="text-foreground">"{plantillaToDelete?.titulo}"</strong>?
              <br />
              Esta acción no se puede deshacer de forma inmediata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Modelo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
