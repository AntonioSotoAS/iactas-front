"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Autocomplete } from "@/components/ui/autocomplete"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react"
import { RolUsuario } from "@/types/usuario"
import { useGetSedesQuery } from "@/store/api/sedeApi"

interface FiltrosUsuariosProps {
  onSearch: (search: string) => void
  onRolChange: (rol: RolUsuario | undefined) => void
  onSedeChange: (sede_id: number | undefined) => void
  onClearFilters: () => void
  currentSearch: string
  currentRol?: RolUsuario
  currentSedeId?: number
}

export function FiltrosUsuarios({
  onSearch,
  onRolChange,
  onSedeChange,
  onClearFilters,
  currentSearch,
  currentRol,
  currentSedeId,
}: FiltrosUsuariosProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: sedesResponse } = useGetSedesQuery({ limit: 100 })

  const hasActiveFilters = currentSearch || currentRol || currentSedeId

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                <IconX className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <IconFilter className="h-4 w-4 mr-2" />
              {isExpanded ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Búsqueda */}
          <div className="grid gap-2">
            <Label htmlFor="search">Buscar usuarios</Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Buscar por nombre, correo, DNI..."
                value={currentSearch}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros por rol y sede */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por rol */}
            <div className="grid gap-2">
              <Label htmlFor="rol-filter">Rol</Label>
              <Select
                value={currentRol || "all"}
                onValueChange={(value) => onRolChange(value === "all" ? undefined : value as RolUsuario)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value={RolUsuario.SUPERADMIN}>Super Administrador</SelectItem>
                  <SelectItem value={RolUsuario.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={RolUsuario.ESPECIALISTA_AUDIENCIA}>Especialista de Audiencia</SelectItem>
                  <SelectItem value={RolUsuario.COORDINADOR_ESPECIALISTA}>Coordinador Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por sede */}
            <div className="grid gap-2">
              <Label htmlFor="sede-filter">Sede</Label>
              <Autocomplete
                options={[
                  { value: "all", label: "Todas las sedes" },
                  { value: "none", label: "Sin sede" },
                  ...(sedesResponse?.sedes?.map((sede) => ({
                    value: sede.id.toString(),
                    label: sede.nombre,
                  })) || [])
                ]}
                value={currentSedeId?.toString() || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    onSedeChange(undefined)
                  } else if (value === "none") {
                    onSedeChange(-1) // Usar -1 para representar "sin sede"
                  } else {
                    const sedeId = parseInt(value)
                    onSedeChange(sedeId)
                  }
                }}
                placeholder="Todas las sedes"
              />
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {currentSearch && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Búsqueda: &quot;{currentSearch}&quot;
                </span>
              )}
              {currentRol && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Rol: {currentRol}
                </span>
              )}
              {currentSedeId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Sede: {currentSedeId === -1 ? 'Sin sede' : sedesResponse?.sedes?.find(s => s.id === currentSedeId)?.nombre || 'ID: ' + currentSedeId}
                </span>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
