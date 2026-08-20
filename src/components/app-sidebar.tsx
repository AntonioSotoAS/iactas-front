"use client"

import * as React from "react"
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconGavel,
  IconFileText,
  IconRobot,
  IconQrcode,
  IconSettings,
  IconShield,
  IconCrown,
  IconUserCheck,
  IconUser,
  IconClock,
  IconChartBar,
  IconDatabase,
  IconAlertTriangle,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useRoles } from "@/hooks/use-roles"
import { useApiKey } from "@/hooks/use-api-key"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Navegación simplificada enfocada en Acta Generada
const navigationItems = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: IconDashboard,
    role: ["superadmin", "admin", "especialista_audiencia"]
  },
  {
    title: "Generar Acta",
    url: "/dashboard/generar-acta",
    icon: IconRobot,
    role: ["superadmin", "admin", "coordinador_especialista"]
  },
  {
    title: "Actas Solicitadas",
    url: "/dashboard/actas-solicitadas",
    icon: IconClock,
    role: ["superadmin"]
  },
  {
    title: "Mis Actas Pendientes SIJ",
    url: "/dashboard/actas-pendientes",
    icon: IconClock,
    role: ["superadmin", "admin", "especialista_audiencia", "coordinador_especialista"]
  },
  {
    title: "Mis Actas Generadas",
    url: "/dashboard/mis-actas-generadas",
    icon: IconFileText,
    role: ["superadmin", "admin", "especialista_audiencia", "coordinador_especialista"]
  },
  {
    title: "Actas Generadas Admin",
    url: "/dashboard/actas-generadas-admin",
    icon: IconFileText,
    role: ["superadmin", "admin"]
  },
  {
    title: "Actas Subidas al SIJ",
    url: "/dashboard/actas-subidas-sij",
    icon: IconDatabase,
    role: ["superadmin",]
  },
  {
    title: "Estadísticas",
    url: "/dashboard/estadisticas",
    icon: IconChartBar,
    role: ["superadmin"]
  },
  {
    title: "Mis Audiencias",
    url: "/dashboard/mis-audiencias",
    icon: IconGavel,
    role: ["superadmin", "admin", "especialista_audiencia"]
  },
  {
    title: "Generador QR",
    url: "/dashboard/generador-qr",
    icon: IconQrcode,
    role: ["superadmin", "admin", "especialista_audiencia"]
  },
  {
    title: "Usuarios",
    url: "/dashboard/usuarios",
    icon: IconUsers,
    role: ["superadmin"]
  },
  {
    title: "Sedes",
    url: "/dashboard/sedes",
    icon: IconBuilding,
    role: ["superadmin"]
  },
  {
    title: "Requisitorias",
    url: "/dashboard/requisitorias",
    icon: IconAlertTriangle,
    role: ["superadmin", "admin", "especialista_audiencia"]
  },
  {
    title: "Configuración",
    url: "/dashboard/configuracion",
    icon: IconSettings,
    role: ["superadmin"]
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userRole, isSuperAdmin, isAdmin, isCoordinadorEspecialista } = useRoles()
  const { hasApiKey } = useApiKey()

  // Filtrar items según el rol del usuario y API key
  const navItems = navigationItems.filter(item => {
    const hasRole = item.role && item.role.includes(userRole)

    // Si no tiene API key, deshabilitar funcionalidades de IA
    if (!hasApiKey && (
      item.title === "Acta Generada"
    )) {
      return false
    }

    return hasRole
  })

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
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconDashboard className="!size-5" />
                <span className="text-base font-semibold">IActas CSJS</span>
                {(isSuperAdmin || isAdmin || isCoordinadorEspecialista) && (
                  <div className="ml-auto">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor()}`}>
                      {getRoleIcon()}
                      <span className="ml-1">{getRoleLabel()}</span>
                    </span>
                  </div>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />

        {/* Alerta de API Key si no la tiene */}
        {!hasApiKey && (
          <div className="p-4 mx-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium">API Key Requerida</span>
            </div>
            <p className="text-red-700 text-xs">
              Contacte con Informática para obtener su API Key y poder usar las funcionalidades de IA.
            </p>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
