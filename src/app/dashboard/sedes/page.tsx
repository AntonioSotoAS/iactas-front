"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconBuilding, IconRefresh } from "@tabler/icons-react"
import { DataTable } from "@/components/dashboard/sedes/table/data-table"
import { createColumns } from "@/components/dashboard/sedes/table/columns"
import { NuevaSedeForm } from "@/components/dashboard/sedes/nueva-sede-form"
import { useGetSedesQuery, useDeleteSedeMutation } from "@/store/api/sedeApi"
import { SedeFilters } from "@/types/sede"
import { toast } from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SedesPage() {
  const [filters] = useState<SedeFilters>({
    page: 1,
    limit: 10,
  })
  
  const [deleteSedeId, setDeleteSedeId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: sedesResponse, isLoading, refetch } = useGetSedesQuery(filters)
  const [deleteSede, { isLoading: isDeleting }] = useDeleteSedeMutation()

  const sedes = sedesResponse?.sedes || []
  const total = sedesResponse?.total || 0

  const handleDelete = (id: number) => {
    setDeleteSedeId(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deleteSedeId) return

    try {
      await deleteSede(deleteSedeId).unwrap()
      toast.success("Sede eliminada exitosamente")
      setShowDeleteDialog(false)
      setDeleteSedeId(null)
    } catch (error) {
      console.error("Error al eliminar sede:", error)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setDeleteSedeId(null)
  }

  const columns = createColumns({
    onDelete: handleDelete,
    onCancel: () => {},
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sedes</h1>
          <p className="text-muted-foreground">
            Gestiona las sedes del sistema judicial
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <IconRefresh className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>
          <NuevaSedeForm onCancel={() => refetch()} />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sedes</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Sedes registradas en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedes Activas</CardTitle>
            <IconBuilding className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sedes.filter(sede => sede.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sedes disponibles para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedes Inactivas</CardTitle>
            <IconBuilding className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {sedes.filter(sede => !sede.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sedes deshabilitadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Sedes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Sedes</CardTitle>
          <CardDescription>
            Todas las sedes registradas en el sistema con sus detalles y opciones de gestión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <DataTable columns={columns} data={sedes} />
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la sede
              y todos los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
