"use client"

import { Button } from "@/components/ui/button"
import { IconTrash, IconEye } from "@tabler/icons-react"
import { Sede } from "@/types/sede"
import { EditarSedeForm } from "@/components/dashboard/sedes/editar-sede-form"
import { SedeProfileModal } from "@/components/dashboard/sedes/sede-profile-modal"

interface ActionsProps {
  sede: Sede
  onDelete?: (id: number) => void
  onCancel?: () => void
}

export function Actions({ sede, onDelete, onCancel }: ActionsProps) {
  return (
    <div className="flex space-x-2">
      <SedeProfileModal 
        sede={sede} 
        onClose={() => {}} 
        trigger={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title="Ver sede"
          >
            <IconEye className="h-4 w-4" />
          </Button>
        }
      />
      <EditarSedeForm sede={sede} onCancel={onCancel || (() => {})} />
      {onDelete && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(sede.id)} 
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          title="Eliminar sede"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
