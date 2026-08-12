"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRoles } from "@/hooks/use-roles"
import { useUser } from "@/hooks/use-user"
import { IconShield, IconUser, IconCrown, IconUserCheck, IconAlertTriangle, IconDownload } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
// import { IActasLimitationsCard } from "@/components/iactas-limitations-card"

// Definir el tipo para BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function SiteHeader() {
  const { isSuperAdmin, isAdmin, isCoordinadorEspecialista } = useRoles()
  const { user } = useUser()

  // Estados para PWA
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  // Verificar si el usuario tiene API key
  const hasApiKey = user?.api_key && user.api_key.trim() !== ""

  // Manejar instalación PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
      toast.success('¡IACTAS v2 ha sido instalada exitosamente!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        const promptEvent = deferredPrompt as BeforeInstallPromptEvent
        promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice
        
        if (outcome === 'accepted') {
          toast.success('¡Instalación iniciada!')
        } else {
          toast.error('Instalación cancelada')
        }
      } catch (error) {
        console.error('Error al instalar:', error)
        toast.error('Error al instalar la aplicación')
      } finally {
        setDeferredPrompt(null)
        setShowInstallButton(false)
      }
    }
  }

  const getRoleIcon = () => {
    if (isSuperAdmin) return <IconCrown className="w-4 h-4 text-yellow-600" />
    if (isAdmin) return <IconShield className="w-4 h-4 text-blue-600" />
    if (isCoordinadorEspecialista) return <IconUserCheck className="w-4 h-4 text-green-600" />
    return <IconUser className="w-4 h-4 text-gray-600" />
  }

  const getRoleLabel = () => {
    if (isSuperAdmin) return "Super Admin"
    if (isAdmin) return "Admin"
    if (isCoordinadorEspecialista) return "Coordinador"
    return "Especialista"
  }

  const getRoleColor = () => {
    if (isSuperAdmin) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (isAdmin) return "bg-blue-100 text-blue-800 border-blue-200"
    if (isCoordinadorEspecialista) return "bg-green-100 text-green-800 border-green-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {/* Limitaciones de IACTAS - Parte izquierda */}
        <div className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border bg-red-600 text-white ">
          <span className="text-white font-bold">🚫</span>
          <span>Restricciones de IACTAS: Delitos sexuales contra menores</span>
        </div>
        
        {/* Advertencia de API Key - Pegada a la izquierda */}
        {!hasApiKey && (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
            <IconAlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">Contacte con Informática para poder usar IActas - Falta API Key</span>
            <span className="sm:hidden">Falta API Key</span>
          </div>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          {/* Botón de Instalación PWA */}
          {showInstallButton && (
            <Button 
              onClick={handleInstallClick}
              variant="outline" 
              size="sm" 
              className="hidden sm:flex bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
          )}
          
          {/* Indicador de Rol */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor()}`}>
            {getRoleIcon()}
            <span className="hidden sm:inline">{getRoleLabel()}</span>
          </div>
          
          <Button 
            variant="default" 
            size="sm" 
            className="hidden sm:flex"
            data-tally-open="n0W72Z" 
            data-tally-width="400" 
            data-tally-align-left="1" 
            data-tally-emoji-text="👋" 
            data-tally-emoji-animation="wave" 
            data-tally-auto-close="1000" 
            data-tally-form-events-forwarding="1"
          >
            Sugerencias
          </Button>
        </div>
      </div>
    </header>
  )
}
