"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  IconCheck, 
  IconX, 
  IconAlertTriangle,
  IconVolume,
  IconSettings
} from "@tabler/icons-react"
import { toast } from "sonner"

interface AudioDevice {
  deviceId: string
  label: string
  kind: string
}

interface DiagnosticResult {
  browserSupport: boolean
  permissions: 'granted' | 'denied' | 'prompt' | 'unknown'
  devices: AudioDevice[]
  getUserMedia: boolean
  mediaRecorder: boolean
  speechRecognition: boolean
}

export function AudioDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [testStream, setTestStream] = useState<MediaStream | null>(null)

  const runDiagnostics = async () => {
    setIsRunning(true)
    
    try {
      const results: DiagnosticResult = {
        browserSupport: false,
        permissions: 'unknown',
        devices: [],
        getUserMedia: false,
        mediaRecorder: false,
        speechRecognition: false
      }

      // Verificar soporte del navegador
      results.browserSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
      results.getUserMedia = !!navigator.mediaDevices?.getDisplayMedia
      results.mediaRecorder = !!window.MediaRecorder
      results.speechRecognition = !!((window as unknown as { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown }).webkitSpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown }).SpeechRecognition)

      // Verificar permisos (para getDisplayMedia no hay permisos predefinidos)
      results.permissions = 'unknown'

      // Para getDisplayMedia, no podemos enumerar dispositivos de antemano
      // Solo verificamos si el navegador soporta la API
      results.devices = []

      setDiagnostics(results)
      
      if (results.devices.length === 0) {
        toast.error('No se detectaron dispositivos de audio')
      } else {
        toast.success('Diagnóstico completado')
      }
    } catch (error) {
      console.error('Error en diagnóstico:', error)
      toast.error('Error al ejecutar diagnóstico')
    } finally {
      setIsRunning(false)
    }
  }

  const testAudioCapture = async () => {
    try {
      let stream: MediaStream
      
      // Intentar diferentes configuraciones
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          audio: true,
          video: false 
        })
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'NotSupportedError') {
          // Intentar con configuración más simple
          try {
            stream = await navigator.mediaDevices.getDisplayMedia({ 
              video: false
            })
          } catch {
            // Fallback a micrófono
            toast.info('Probando con micrófono como alternativa...')
            stream = await navigator.mediaDevices.getUserMedia({ 
              audio: true
            })
          }
        } else {
          throw error
        }
      }
      
      setTestStream(stream)
      toast.success('Captura de audio funcionando correctamente')
      
      // Detener el stream después de 3 segundos
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop())
        setTestStream(null)
      }, 3000)
    } catch (error: unknown) {
      console.error('Error al probar captura de audio:', error)
      
      if (error instanceof Error) {
        if (error.name === 'NotSupportedError') {
          toast.error('Tu navegador no soporta captura de audio del sistema. Intenta con Chrome o Edge.')
        } else if (error.name === 'NotAllowedError') {
          toast.error('Permisos denegados. Asegúrate de permitir el acceso al audio.')
        } else {
          toast.error(`Error al probar captura de audio: ${error.message}`)
        }
      } else {
        toast.error('Error al probar captura de audio: Error desconocido')
      }
    }
  }

  const requestPermissions = async () => {
    try {
      let stream: MediaStream
      
      // Intentar diferentes configuraciones
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          audio: true,
          video: false 
        })
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'NotSupportedError') {
          // Intentar con configuración más simple
          try {
            stream = await navigator.mediaDevices.getDisplayMedia({ 
              video: false
            })
          } catch {
            // Fallback a micrófono
            toast.info('Solicitando permisos de micrófono como alternativa...')
            stream = await navigator.mediaDevices.getUserMedia({ 
              audio: true
            })
          }
        } else {
          throw error
        }
      }
      
      // Detener el stream inmediatamente
      stream.getTracks().forEach(track => track.stop())
      toast.success('Permisos concedidos')
      runDiagnostics() // Re-ejecutar diagnóstico
    } catch (error: unknown) {
      console.error('Error al solicitar permisos:', error)
      
      if (error instanceof Error) {
        if (error.name === 'NotSupportedError') {
          toast.error('Tu navegador no soporta esta funcionalidad. Intenta con Chrome o Edge.')
        } else if (error.name === 'NotAllowedError') {
          toast.error('Permisos denegados. Asegúrate de permitir el acceso al audio.')
        } else {
          toast.error('Error al solicitar permisos')
        }
      } else {
        toast.error('Error al solicitar permisos: Error desconocido')
      }
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <IconCheck className="h-4 w-4 text-green-600" />
    ) : (
      <IconX className="h-4 w-4 text-red-600" />
    )
  }

  const getPermissionBadge = (permission: string) => {
    const variants = {
      granted: 'bg-green-100 text-green-800 border-green-200',
      denied: 'bg-red-100 text-red-800 border-red-200',
      prompt: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unknown: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return (
      <Badge variant="secondary" className={variants[permission as keyof typeof variants]}>
        {permission === 'granted' && 'Concedido'}
        {permission === 'denied' && 'Denegado'}
        {permission === 'prompt' && 'Pendiente'}
        {permission === 'unknown' && 'Desconocido'}
      </Badge>
    )
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSettings className="h-5 w-5" />
          Diagnóstico de Audio
        </CardTitle>
        <CardDescription>
          Verifica la configuración de tu micrófono y navegador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
          </Button>
          
          {diagnostics?.permissions === 'prompt' && (
            <Button 
              onClick={requestPermissions}
              variant="outline"
              size="sm"
            >
              Solicitar Permisos
            </Button>
          )}
          
                     {diagnostics?.getUserMedia && (
             <Button 
               onClick={testAudioCapture}
               disabled={!!testStream}
               variant="outline"
               size="sm"
             >
               {testStream ? 'Probando...' : 'Probar Captura de Audio'}
             </Button>
           )}
        </div>

        {diagnostics && (
          <div className="space-y-4">
            <Separator />
            
            {/* Soporte del navegador */}
                         <div>
               <h4 className="font-medium mb-2">Soporte del Navegador</h4>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <span className="text-sm">getDisplayMedia API</span>
                   {getStatusIcon(diagnostics.getUserMedia)}
                 </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">MediaRecorder API</span>
                  {getStatusIcon(diagnostics.mediaRecorder)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Speech Recognition</span>
                  {getStatusIcon(diagnostics.speechRecognition)}
                </div>
              </div>
            </div>

            <Separator />

                         {/* Permisos */}
             <div>
               <h4 className="font-medium mb-2">Permisos de Captura</h4>
               <div className="flex items-center justify-between">
                 <span className="text-sm">Estado</span>
                 {getPermissionBadge(diagnostics.permissions)}
               </div>
             </div>

            <Separator />

                         {/* Información del Sistema */}
             <div>
               <h4 className="font-medium mb-2">Audio del Sistema</h4>
               <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                 <IconVolume className="h-4 w-4 text-blue-600" />
                 <span className="text-sm flex-1">Captura el audio que se reproduce en tu computadora</span>
               </div>
               <div className="mt-2 text-xs text-muted-foreground">
                 <p>• Reproduce audio en cualquier aplicación (YouTube, Spotify, etc.)</p>
                 <p>• Haz clic en &quot;Iniciar&quot; para comenzar la captura</p>
                 <p>• Selecciona &quot;Compartir audio&quot; cuando se te solicite</p>
               </div>
             </div>

            {/* Recomendaciones */}
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Recomendaciones</h4>
                             <div className="space-y-2 text-sm text-muted-foreground">
                 {!diagnostics.getUserMedia && (
                   <div className="flex items-start gap-2">
                     <IconX className="h-4 w-4 text-red-600 mt-0.5" />
                     <span>Tu navegador no soporta captura de audio del sistema. Usa Chrome, Firefox o Edge.</span>
                   </div>
                 )}
                 
                 {diagnostics.getUserMedia && (
                   <div className="flex items-start gap-2">
                     <IconCheck className="h-4 w-4 text-green-600 mt-0.5" />
                     <span>Tu navegador soporta captura de audio del sistema. Puedes usar el transcriptor.</span>
                   </div>
                 )}
                 
                 <div className="flex items-start gap-2">
                   <IconAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                   <span>Si tienes problemas, el transcriptor intentará usar el micrófono como alternativa.</span>
                 </div>
                 
                 <div className="flex items-start gap-2">
                   <IconAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                   <span>Asegúrate de que haya audio reproduciéndose en tu computadora antes de iniciar la grabación.</span>
                 </div>
                 
                 <div className="flex items-start gap-2">
                   <IconAlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                   <span>En algunos navegadores, es posible que necesites permitir el acceso al audio cuando se te solicite.</span>
                 </div>
               </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
