import { ColumnDef } from "@tanstack/react-table"
import { Usuario } from "@/types/usuario"
import { Actions } from "./actions"

interface ColumnsProps {
  onDelete?: (id: number) => void
  onCancel?: () => void
}

export const createColumns = ({ onDelete, onCancel }: ColumnsProps): ColumnDef<Usuario>[] => [
  {
    accessorKey: "correo",
    header: "Correo",
    cell: ({ row }) => <div className="font-medium">{row.getValue("correo")}</div>,
  },
  {
    accessorKey: "nombres",
    header: "Nombres",
    cell: ({ row }) => <div>{row.getValue("nombres")}</div>,
  },
  {
    accessorKey: "apellidos_paterno",
    header: "Apellido Paterno",
    cell: ({ row }) => <div>{row.getValue("apellidos_paterno")}</div>,
  },
  {
    accessorKey: "apellidos_materno",
    header: "Apellido Materno",
    cell: ({ row }) => <div>{row.getValue("apellidos_materno")}</div>,
  },
  {
    accessorKey: "rol",
    header: "Rol",
    cell: ({ row }) => <div>{row.getValue("rol")}</div>,
  },
  {
    accessorKey: "sede.nombre",
    header: "Sede",
    cell: ({ row }) => <div>{row.original.sede?.nombre || "Sin sede"}</div>,
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
        {row.getValue("activo") ? "Activo" : "Inactivo"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
          cell: ({ row }) => (
        <Actions
          usuario={row.original}
          onDelete={onDelete}
          onCancel={onCancel}
        />
      ),
  },
]
