import { ColumnDef } from "@tanstack/react-table"
import { Sede } from "@/types/sede"
import { Actions } from "./actions"

interface ColumnsProps {
  onDelete?: (id: number) => void
  onCancel?: () => void
}

export const createColumns = ({ onDelete, onCancel }: ColumnsProps): ColumnDef<Sede>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <div className="font-medium">{row.getValue("nombre")}</div>,
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => <div>{row.getValue("direccion")}</div>,
  },
  {
    accessorKey: "usuarios",
    header: "Usuarios",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.original.usuarios?.length || 0} usuarios
      </div>
    ),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.getValue("activo") 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {row.getValue("activo") ? "Activa" : "Inactiva"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Actions
        sede={row.original}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    ),
  },
]
