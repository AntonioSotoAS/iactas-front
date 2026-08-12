"use client"

import { usePerfilQuery } from "@/store/api/authApi"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasToken, setHasToken] = useState(false)
  const { isLoading, isError } = usePerfilQuery(undefined, {
    skip: !hasToken, // No hacer petición si no hay token
  })

  // Verificar token al cargar
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setHasToken(true)
    } else {
      // Si no hay token, redirigir inmediatamente
      router.replace("/login")
    }
  }, [router])

  useEffect(() => {
    if (hasToken && !isLoading && isError) {
      // Limpiar token si hay error de autenticación
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_data')
      router.replace("/login")
    }
  }, [hasToken, isLoading, isError, router])

  // Si no hay token, mostrar loading
  if (!hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  // Si hay error, no mostrar nada (se redirige)
  if (isError) {
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
