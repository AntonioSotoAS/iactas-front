"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconRefresh } from "@tabler/icons-react"
import { DataTable } from "@/components/dashboard/actas-pendientes/table/data-table"
import { columns } from "@/components/dashboard/actas-pendientes/table/columns"
import { useUser } from "@/hooks/use-user"
import { useGetActasPendientesQuery } from "@/store/api/actasPendientesApi"

export default function ActasPendientesPage() {
  const { user } = useUser()

  // Asumiendo que el DNI está en user?.dni
  const dni = user?.dni || ""

  const {
    data: actas,
    isLoading,
    isError,
    error,
    refetch
  } = useGetActasPendientesQuery(dni, {
    skip: !dni,
    // Evitar actualizaciones automáticas a cada rato
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Actas Pendientes en el SIJ</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Consultando actas pendientes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Actas Pendientes en el SIJ</h1>
          <Button onClick={() => refetch()} variant="outline">
            <IconRefresh className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Error al cargar actas pendientes</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error && typeof error === 'object' && 'data' in error
                  ? (error.data as { message?: string })?.message
                  : "No se pudo conectar con la base de datos externa."}
              </p>
              <Button onClick={() => refetch()}>
                <IconRefresh className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Actas Pendientes en el SIJ</h1>
          <p className="text-muted-foreground">
            Consulta las actas pendientes de atención registradas en el sistema estadístico.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <IconRefresh className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Actas Pendientes en el SIJ</CardTitle>
          <CardDescription>
            {actas?.length ? `${actas.length} actas encontradas para el DNI ${dni}` : "No se encontraron actas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={actas || []} />
        </CardContent>
      </Card>
    </div>
  )
}
