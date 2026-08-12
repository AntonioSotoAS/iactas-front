"use client"

import { useUsuarios } from "@/hooks/use-usuarios"
import { DataTable } from "@/components/dashboard/usuarios/table/data-table"
import { createColumns } from "@/components/dashboard/usuarios/table/columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconPlus, IconRefresh } from "@tabler/icons-react"
import { NuevoUsuarioForm } from "@/components/dashboard/usuarios/nuevo-usuario-form"
import { FiltrosUsuarios } from "@/components/dashboard/usuarios/filtros-usuarios"

import { PermissionGuard } from "@/components/permission-guard"

export default function UsuariosPage() {
  const {
    usuarios,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    isError,
    error,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    deleteUsuario,
    filters,
    setSearch,
    setRol,
    setSedeId,
    setLimit,
    clearFilters,
    retry,
  } = useUsuarios()



  const handleCancel = () => {
    // No necesitamos hacer nada aquí ya que los formularios manejan su propio estado
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      const result = await deleteUsuario(id)
      if (!result.success) {
        alert(result.message)
      }
    }
  }

  // Crear columnas dinámicamente
  const columns = createColumns({
    onDelete: handleDelete,
    onCancel: handleCancel,
  })

  return (
    <PermissionGuard role={["superadmin", "admin"]}>
      <div className="space-y-4">
        {isLoading ? (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Usuarios</h1>
              <Button disabled>
                <IconPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : isError ? (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Usuarios</h1>
              <Button onClick={retry} variant="outline">
                <IconRefresh className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-destructive mb-2">Error al cargar usuarios</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error && typeof error === 'object' && 'data' in error
                      ? (error.data as { message?: string })?.message
                      : "Ha ocurrido un error inesperado"}
                  </p>
                  <div className="space-y-2">
                    <Button onClick={retry}>
                      <IconRefresh className="h-4 w-4 mr-2" />
                      Reintentar
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Si el problema persiste, verifica la conexión con el servidor
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : !usuarios || usuarios.length === 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Usuarios</h1>
                <p className="text-muted-foreground">
                  Gestiona los usuarios del sistema
                </p>
              </div>
              <NuevoUsuarioForm
                onCancel={handleCancel}
                trigger={
                  <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Crear Primer Usuario
                  </Button>
                }
              />
            </div>

            {/* Filtros */}
            <FiltrosUsuarios
              onSearch={setSearch}
              onRolChange={setRol}
              onSedeChange={setSedeId}
              onClearFilters={clearFilters}
              currentSearch={filters.search || ''}
              currentRol={filters.rol}
              currentSedeId={filters.sede_id}
            />

            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No hay usuarios disponibles</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comienza creando el primer usuario del sistema
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Usuarios</h1>
                <p className="text-muted-foreground">
                  Gestiona los usuarios del sistema ({total} usuarios)
                </p>
              </div>
              <NuevoUsuarioForm
                onCancel={handleCancel}
                trigger={
                  <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                }
              />
            </div>

            {/* Filtros */}
            <FiltrosUsuarios
              onSearch={setSearch}
              onRolChange={setRol}
              onSedeChange={setSedeId}
              onClearFilters={clearFilters}
              currentSearch={filters.search || ''}
              currentRol={filters.rol}
              currentSedeId={filters.sede_id}
            />

            <Card>
              <CardHeader>
                <CardTitle>Lista de Usuarios</CardTitle>
                <CardDescription>
                  Usuarios registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={usuarios}
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={limit}
                  total={total}
                  hasNextPage={hasNextPage || false}
                  hasPrevPage={hasPrevPage || false}
                  onPageSizeChange={setLimit}
                  onNextPage={nextPage}
                  onPrevPage={prevPage}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PermissionGuard>
  )
}
