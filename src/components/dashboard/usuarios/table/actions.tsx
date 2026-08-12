"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconTrash, IconEye, IconLock } from "@tabler/icons-react"
import { Usuario } from "@/types/usuario"
import { EditarUsuarioForm } from "../editar-usuario-form"
import { UsuarioProfileModal } from "../usuario-profile-modal"
import { CambiarPasswordModal } from "../cambiar-password-modal"

interface ActionsProps {
  usuario: Usuario
  onDelete?: (id: number) => void
  onCancel?: () => void
}

export function Actions({ usuario, onDelete, onCancel }: ActionsProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  return (
    <>
      <div className="flex space-x-2">
        <UsuarioProfileModal 
          usuario={usuario} 
          onClose={() => {}} 
          trigger={
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              title="Ver perfil"
            >
              <IconEye className="h-4 w-4" />
            </Button>
          }
        />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowPasswordModal(true)} 
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
          title="Cambiar contraseña"
        >
          <IconLock className="h-4 w-4" />
        </Button>
        
        <EditarUsuarioForm usuario={usuario} onCancel={onCancel} />
        
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(usuario.id)} 
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            title="Eliminar usuario"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CambiarPasswordModal
        usuario={usuario}
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </>
  )
} 