"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  IconMicrophone, 
  IconPlayerPlay, 
  IconPlayerPause, 
  IconPlayerStop,
  IconDownload,
  IconTrash
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useTranscription } from "@/hooks/use-transcription"
import { AudioDiagnostics } from "@/components/audio-diagnostics"

export default function TranscriptorPage() {
  const {
    isRecording,
    isPaused,
    transcription,
    currentText,
    recordingTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearTranscription,
    formatTime
  } = useTranscription()

  const generateDocx = async () => {
    if (transcription.length === 0) {
      toast.error('No hay transcripción para generar el documento')
      return
    }

    try {
      const { Document, Packer, Paragraph, TextRun } = await import('docx')
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "TRANSCRIPCIÓN DE AUDIO",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Duración: ${formatTime(recordingTime)}`,
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),
            ...transcription.map(segment => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[${formatTime(segment.timestamp)}] `,
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: segment.text,
                    size: 24,
                  }),
                ],
                spacing: { after: 200 },
              })
            ),
          ],
        }],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transcripcion_${new Date().toISOString().split('T')[0]}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Documento DOCX generado exitosamente')
    } catch (error) {
      console.error('Error al generar DOCX:', error)
      toast.error('Error al generar el documento')
    }
  }

  return (
    <div className="space-y-6">
             <div>
         <h1 className="text-3xl font-bold tracking-tight">Transcriptor de Audio del Sistema</h1>
         <p className="text-muted-foreground">
           Captura el audio que se reproduce en tu computadora y genera transcripciones automáticas
         </p>
       </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel de Control */}
        <Card>
          <CardHeader>
                         <CardTitle className="flex items-center gap-2">
               <IconMicrophone className="h-5 w-5" />
               Control de Captura
             </CardTitle>
             <CardDescription>
               Controla la captura de audio del sistema y transcripción
             </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Indicador de tiempo */}
            <div className="text-center">
              <div className="text-3xl font-mono font-bold">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">
                      {isPaused ? 'Pausado' : 'Grabando...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de control */}
            <div className="flex justify-center gap-2">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <IconPlayerPlay className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button 
                      onClick={resumeRecording}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <IconPlayerPlay className="h-4 w-4 mr-2" />
                      Reanudar
                    </Button>
                  ) : (
                    <Button 
                      onClick={pauseRecording}
                      className="bg-yellow-600 hover:bg-yellow-700"
                      size="lg"
                    >
                      <IconPlayerPause className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                  )}
                  <Button 
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    <IconPlayerStop className="h-4 w-4 mr-2" />
                    Terminar
                  </Button>
                </>
              )}
            </div>

            {/* Acciones */}
            <Separator />
            <div className="flex gap-2">
              <Button 
                onClick={generateDocx}
                disabled={transcription.length === 0}
                variant="outline"
                className="flex-1"
              >
                <IconDownload className="h-4 w-4 mr-2" />
                Generar DOCX
              </Button>
              <Button 
                onClick={clearTranscription}
                disabled={transcription.length === 0}
                variant="outline"
                className="flex-1"
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Transcripción */}
        <Card>
          <CardHeader>
            <CardTitle>Transcripción</CardTitle>
            <CardDescription>
              Texto transcrito en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Texto actual */}
              {currentText && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    Transcribiendo...
                  </div>
                  <div className="text-sm text-blue-800">
                    {currentText}
                  </div>
                </div>
              )}

              {/* Transcripción final */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transcription.map((segment, index) => (
                  <div key={segment.id} className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatTime(segment.timestamp)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm">{segment.text}</p>
                  </div>
                ))}
              </div>

              {transcription.length === 0 && !currentText && (
                <div className="text-center py-8 text-muted-foreground">
                  <IconMicrophone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Inicia la grabación para ver la transcripción aquí</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas */}
      {transcription.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{transcription.length}</div>
                <div className="text-sm text-muted-foreground">Segmentos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatTime(recordingTime)}</div>
                <div className="text-sm text-muted-foreground">Duración</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {transcription.reduce((acc, seg) => acc + seg.text.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Caracteres</div>
              </div>
            </div>
                     </CardContent>
         </Card>
       )}

       {/* Diagnóstico de Audio */}
       <AudioDiagnostics />
     </div>
   )
 }
