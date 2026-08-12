"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconSettings, IconShield, IconDatabase, IconKey } from "@tabler/icons-react"
import { PermissionGuard } from "@/components/permission-guard"

export default function ConfiguracionPage() {
  return (
    <PermissionGuard role={["superadmin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Configuración avanzada del sistema (solo Super Admin)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración de Seguridad */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <IconShield className="w-6 h-6 text-red-600" />
                <CardTitle>Seguridad</CardTitle>
              </div>
              <CardDescription>
                Configuración de seguridad y autenticación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Tiempo de sesión (minutos)</Label>
                <Input id="session-timeout" type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Intentos máximos de login</Label>
                <Input id="max-login-attempts" type="number" defaultValue={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-min-length">Longitud mínima de contraseña</Label>
                <Input id="password-min-length" type="number" defaultValue={8} />
              </div>
              <Button className="w-full">
                Guardar Configuración de Seguridad
              </Button>
            </CardContent>
          </Card>

          {/* Configuración de Base de Datos */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <IconDatabase className="w-6 h-6 text-blue-600" />
                <CardTitle>Base de Datos</CardTitle>
              </div>
              <CardDescription>
                Configuración de conexión y respaldos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frecuencia de respaldo</Label>
                <select 
                  id="backup-frequency" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="daily"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention-days">Días de retención</Label>
                <Input id="retention-days" type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Tamaño máximo de archivo (MB)</Label>
                <Input id="max-file-size" type="number" defaultValue={10} />
              </div>
              <Button className="w-full">
                Guardar Configuración de BD
              </Button>
            </CardContent>
          </Card>

          {/* Configuración de API */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <IconKey className="w-6 h-6 text-green-600" />
                <CardTitle>API y Servicios</CardTitle>
              </div>
              <CardDescription>
                Configuración de APIs externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-api-key">API Key de Gemini</Label>
                <Input id="gemini-api-key" type="password" placeholder="••••••••••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-timeout">Timeout de API (segundos)</Label>
                <Input id="api-timeout" type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-requests">Máximo de requests por minuto</Label>
                <Input id="max-requests" type="number" defaultValue={100} />
              </div>
              <Button className="w-full">
                Guardar Configuración de API
              </Button>
            </CardContent>
          </Card>

          {/* Configuración del Sistema */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <IconSettings className="w-6 h-6 text-purple-600" />
                <CardTitle>Sistema General</CardTitle>
              </div>
              <CardDescription>
                Configuración general del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">Nombre del sistema</Label>
                <Input id="system-name" defaultValue="Sistema PJ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-mode">Modo mantenimiento</Label>
                <select 
                  id="maintenance-mode" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="disabled"
                >
                  <option value="disabled">Deshabilitado</option>
                  <option value="enabled">Habilitado</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-level">Nivel de logs</Label>
                <select 
                  id="log-level" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="info"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <Button className="w-full">
                Guardar Configuración General
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Acciones del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones del Sistema</CardTitle>
            <CardDescription>
              Acciones administrativas avanzadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex flex-col items-center space-y-2 p-4">
                <IconDatabase className="w-8 h-8" />
                <span>Crear Respaldo</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 p-4">
                <IconShield className="w-8 h-8" />
                <span>Limpiar Logs</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 p-4">
                <IconSettings className="w-8 h-8" />
                <span>Reiniciar Sistema</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  )
} 