'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGetModelosActaQuery,
  useDeleteModeloActaMutation,
  useCreateModeloActaMutation,
  useGetFavoritosByUserQuery,
  useToggleFavoritoMutation
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
  IconEye,
  IconStar,
  IconStarFilled,
  IconArrowRight,
  IconX,
  IconCheck,
  IconSparkles
} from '@tabler/icons-react'
import { toast } from 'react-hot-toast'
import { useUser } from '@/hooks/use-user'
import { useRoles } from '@/hooks/use-roles'

export default function PlantillasPage() {
  const router = useRouter()
  const { user } = useUser()
  const { isSuperAdmin, isAdmin } = useRoles()
  const canManageModelos = isSuperAdmin || isAdmin
  const userId = user?.id || 1

  const { data: response, isLoading, refetch } = useGetModelosActaQuery()
  const { data: dbFavoritosResponse } = useGetFavoritosByUserQuery(userId, { skip: !userId })
  const [toggleFavoritoMutation] = useToggleFavoritoMutation()
  const [deleteModeloActa, { isLoading: isDeleting }] = useDeleteModeloActaMutation()
  const [createModeloActa] = useCreateModeloActaMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPlantilla, setSelectedPlantilla] = useState<ModeloActaData | null>(null)

  // Estado para el modal de detalle y eliminación
  const [detailPlantilla, setDetailPlantilla] = useState<ModeloActaData | null>(null)
  const [plantillaToDelete, setPlantillaToDelete] = useState<ModeloActaData | null>(null)

  // Cargar favoritos guardados en localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('iactas_favoritos_modelos')
      if (stored) {
        setFavoriteIds(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Error al cargar favoritos locales:', e)
    }
  }, [])

  // Sincronizar favoritos de la Base de Datos si la API responde
  useEffect(() => {
    if (dbFavoritosResponse) {
      const favList: number[] = Array.isArray(dbFavoritosResponse)
        ? dbFavoritosResponse
        : (dbFavoritosResponse.data || [])
      if (favList.length > 0) {
        setFavoriteIds(favList)
        localStorage.setItem('iactas_favoritos_modelos', JSON.stringify(favList))
      }
    }
  }, [dbFavoritosResponse])

  // Alternar favorito (Backend BD con fallback optimista a LocalStorage)
  const toggleFavorite = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()

    const isCurrentlyFav = favoriteIds.includes(id)
    const updatedFavs = isCurrentlyFav
      ? favoriteIds.filter((favId) => favId !== id)
      : [...favoriteIds, id]

    setFavoriteIds(updatedFavs)
    localStorage.setItem('iactas_favoritos_modelos', JSON.stringify(updatedFavs))

    if (isCurrentlyFav) {
      toast.success('Modelo quitado de tus favoritos')
    } else {
      toast.success('⭐ Modelo añadido a tus favoritos')
    }

    try {
      await toggleFavoritoMutation({ userId, modeloActaId: id }).unwrap()
    } catch (err) {
      // Fallback transparente si el backend aún no ha desplegado el endpoint
      console.warn('Endpoint DB favoritos no disponible, guardado en almacenamiento local:', err)
    }
  }

  const plantillas: ModeloActaData[] = Array.isArray(response)
    ? response
    : (response?.data || [])

  const favoritesCount = plantillas.filter((p) => favoriteIds.includes(p.id)).length
  const docxCount = plantillas.filter((p) => Boolean(p.docxUrl)).length

  const filteredPlantillas = plantillas.filter((p) => {
    const isFav = favoriteIds.includes(p.id)
    if (activeTab === 'favorites' && !isFav) return false

    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      p.titulo.toLowerCase().includes(term) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term))
    )
  })

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

  const handleCopiarNombre = async (plantilla: ModeloActaData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const textToCopy = plantilla.titulo
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      toast.success(`¡Copiado con éxito! "${textToCopy}"`)
    } catch (err) {
      console.error('Error al copiar el nombre:', err)
      try {
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success(`¡Copiado con éxito! "${textToCopy}"`)
      } catch (fallbackErr) {
        toast.error('No se pudo copiar al portapapeles')
      }
    }
  }




  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <IconFileCode className="w-8 h-8 text-primary" />
            Catálogo de Modelos de Actas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explora, busca y previsualiza los modelos estandarizados de actas judiciales. Selecciona el modelo que necesites o márcalo como favorito para un acceso rápido.
          </p>
        </div>

        {/* Solo administradores pueden crear nuevos modelos */}
        {canManageModelos && (
          <Button onClick={handleCreateNew} className="flex items-center gap-2 font-medium shadow-sm">
            <IconPlus className="w-4 h-4" />
            Nuevo Modelo
          </Button>
        )}
      </div>

      {/* Tarjetas Informativas / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center gap-2 border shadow-xs">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
            <IconFileCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{plantillas.length}</p>
            <p className="text-xs text-muted-foreground font-medium">Modelos Totales en Catálogo</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center gap-2 border shadow-xs">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
            <IconStarFilled className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{favoritesCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Mis Favoritos Guardados</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center gap-2 border shadow-xs">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <IconFileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{docxCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Modelos con Plantilla Word (.docx)</p>
          </div>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {/* Tabs de Filtro */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl w-fit border text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'all'
              ? 'bg-background shadow-xs text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <IconFileCode className="w-4 h-4" />
            Todos los Modelos ({plantillas.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'favorites'
              ? 'bg-background shadow-xs text-amber-600 font-semibold dark:text-amber-400'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <IconStarFilled className="w-4 h-4 text-amber-500" />
            Mis Favoritos ({favoritesCount})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative max-w-md w-full">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modelo por título o palabras clave..."
            className="pl-9 pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid de Modelos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-56 bg-muted/40" />
          ))}
        </div>
      ) : filteredPlantillas.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center justify-center gap-3">
            {activeTab === 'favorites' ? (
              <IconStar className="w-12 h-12 text-amber-400 opacity-60" />
            ) : (
              <IconFileCode className="w-12 h-12 text-muted-foreground/50" />
            )}
            <h3 className="font-semibold text-lg">
              {activeTab === 'favorites'
                ? 'Aún no has agregado modelos a tus favoritos'
                : 'No se encontraron modelos de actas'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {activeTab === 'favorites'
                ? 'Haz clic en la estrella (⭐) en cualquier modelo para guardarlo aquí y acceder a él rápidamente.'
                : searchTerm
                  ? `No hay modelos que coincidan con "${searchTerm}".`
                  : 'Aún no se ha registrado ningún modelo de acta en el sistema.'}
            </p>
            {activeTab === 'favorites' ? (
              <Button variant="outline" size="sm" onClick={() => setActiveTab('all')} className="mt-2">
                Ver todos los modelos
              </Button>
            ) : searchTerm ? (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="mt-2">
                Limpiar búsqueda
              </Button>
            ) : canManageModelos ? (
              <Button onClick={handleCreateNew} size="sm" className="mt-2">
                <IconPlus className="w-4 h-4 mr-1" />
                Crear Mi Primer Modelo
              </Button>
            ) : null}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantillas.map((plantilla) => {
            const isFav = favoriteIds.includes(plantilla.id)
            return (
              <Card
                key={plantilla.id}
                className={`flex flex-col justify-between transition-all hover:shadow-lg border-2 ${isFav ? 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10' : 'hover:border-primary/40'
                  }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold line-clamp-1 flex-1" title={plantilla.titulo}>
                      {plantilla.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-100/50 dark:hover:bg-amber-950/40"
                        title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        onClick={(e) => toggleFavorite(plantilla.id, e)}
                      >
                        {isFav ? (
                          <IconStarFilled className="w-5 h-5 text-amber-500" />
                        ) : (
                          <IconStar className="w-5 h-5 text-muted-foreground hover:text-amber-500" />
                        )}
                      </Button>
                      <Badge variant={plantilla.activo !== false ? 'default' : 'secondary'} className="text-xs">
                        {plantilla.activo !== false ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs min-h-[2.5rem] leading-relaxed">
                    {plantilla.descripcion || 'Sin descripción especificada'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 pb-4">
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <IconFileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{plantilla.docxUrl ? 'Modelo Word (.docx)' : 'Sin Word'}</span>
                    </div>
                  </div>


                </CardContent>

                <CardFooter className="pt-3 border-t bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-2.5">
                  {/* Botón Principal: Copiar nombre */}
                  <Button
                    onClick={(e) => handleCopiarNombre(plantilla, e)}
                    size="sm"
                    variant="outline"
                    className="w-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <IconCopy className="w-4 h-4 text-blue-600" />
                    Copiar nombre
                  </Button>

                  {/* Acciones Secundarias */}
                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-1">
                    <span className="text-[11px]">{new Date(plantilla.fechaCreacion || Date.now()).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      {/* Previsualizar/Ver Detalle (para todos los usuarios) */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] px-2 flex items-center gap-1 border-slate-300 dark:border-slate-700"
                        title="Previsualizar Modelo"
                        onClick={() => setDetailPlantilla(plantilla)}
                      >
                        <IconEye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Previsualizar</span>
                      </Button>

                      {/* Solo Administradores / Superadmin ven Edición/Duplicación/Eliminación */}
                      {canManageModelos && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Editar Modelo"
                            onClick={() => handleEdit(plantilla)}
                          >
                            <IconEdit className="w-3.5 h-3.5 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Duplicar Modelo"
                            onClick={() => handleDuplicate(plantilla)}
                          >
                            <IconCopy className="w-3.5 h-3.5 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Eliminar Modelo"
                            onClick={() => setPlantillaToDelete(plantilla)}
                          >
                            <IconTrash className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Creación / Edición (Solo Admin/Superadmin) */}
      {canManageModelos && (
        <PlantillaFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          plantillaToEdit={selectedPlantilla}
          onSuccess={() => refetch()}
        />
      )}

      {/* Modal de Detalle / Previsualización Completa (Para todos) */}
      <ModeloDetailDialog
        open={!!detailPlantilla}
        onOpenChange={(open) => !open && setDetailPlantilla(null)}
        modelo={detailPlantilla}
        onEdit={canManageModelos ? (modelo) => handleEdit(modelo) : undefined}
      />

      {/* Modal de Confirmación de Eliminación (Solo Admin/Superadmin) */}
      {canManageModelos && (
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
      )}
    </div>
  )
}
