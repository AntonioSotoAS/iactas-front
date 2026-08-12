"use client"

import { ReactNode } from "react"
import { useRoles } from "@/hooks/use-roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconShield } from "@tabler/icons-react"

interface PermissionGuardProps {
  children: ReactNode
  role: string[] // Array de roles permitidos
  fallback?: ReactNode
}

export function PermissionGuard({ children, role, fallback }: PermissionGuardProps) {
  const { userRole } = useRoles()

  if (!role.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <IconShield className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta sección.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Tu rol actual es: <strong>{userRole}</strong>
              <br />
              Roles permitidos: <strong>{role.join(", ")}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
} 