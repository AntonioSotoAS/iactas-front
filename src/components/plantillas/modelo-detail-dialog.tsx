'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ModeloActaData } from '@/types/modeloActa'
import { downloadFileDirectly } from '@/store/api/uploadApi'
import {
  IconEye,
  IconDownload,
  IconCopy,
  IconCheck,
  IconFileText,
  IconBrackets,
  IconRobot,
  IconEdit,
  IconFileSpreadsheet
} from '@tabler/icons-react'
import { toast } from 'react-hot-toast'

interface ModeloDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelo: ModeloActaData | null
  onEdit?: (modelo: ModeloActaData) => void
}

export function ModeloDetailDialog({
  open,
  onOpenChange,
  modelo,
  onEdit,
}: ModeloDetailDialogProps) {
  const [copiedJson, setCopiedJson] = React.useState(false)
  const [copiedPrompt, setCopiedPrompt] = React.useState(false)

  if (!modelo) return null

  const handleDownloadDocx = async () => {
    if (!modelo.docxUrl) {
      toast.error('Este modelo no tiene un archivo Word (.docx) asignado')
      return
    }
    const filename = `${modelo.titulo.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`
    const toastId = toast.loading('Descargando archivo Word...')

    try {
      await downloadFileDirectly(modelo.docxUrl, filename)
      toast.success('Descarga iniciada exitosamente', { id: toastId })
    } catch (err) {
      console.error('Error en descarga directa de DOCX:', err)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009/api/v1'
        const origin = baseUrl.replace(/\/api(\/v\d+)?\/?$/, '')
        const fullUrl = modelo.docxUrl.startsWith('http')
          ? modelo.docxUrl
          : `${origin}/${modelo.docxUrl.replace(/^\//, '')}`
        window.open(fullUrl, '_blank')
        toast.success('Descarga iniciada en nueva pestaña', { id: toastId })
      } catch (fallbackErr) {
        console.error('Error en fallback de descarga:', fallbackErr)
        toast.error('No se pudo descargar el archivo Word', { id: toastId })
      }
    }
  }

  const handleCopyJson = () => {
    if (!modelo.jsonSchema) return
    const text = typeof modelo.jsonSchema === 'string' ? modelo.jsonSchema : JSON.stringify(modelo.jsonSchema, null, 2)
    navigator.clipboard.writeText(text)
    setCopiedJson(true)
    toast.success('JSON Schema copiado al portapapeles')
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const handleCopyPrompt = () => {
    if (!modelo.instruccionesIa) return
    navigator.clipboard.writeText(modelo.instruccionesIa)
    setCopiedPrompt(true)
    toast.success('Prompt de IA copiado al portapapeles')
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const formattedJson = modelo.jsonSchema
    ? typeof modelo.jsonSchema === 'string'
      ? modelo.jsonSchema
      : JSON.stringify(modelo.jsonSchema, null, 2)
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col overflow-hidden p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-8 py-5 border-b bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 rounded-xl text-blue-600">
                <IconEye className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {modelo.titulo}
                  <Badge variant={modelo.activo !== false ? 'default' : 'secondary'} className="text-xs">
                    {modelo.activo !== false ? 'Activo' : 'Inactivo'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-slate-500">
                  {modelo.descripcion || 'Sin descripción especificada'}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
          {/* SECCIÓN 1: ARCHIVO DOCX */}
          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                  <IconFileText className="w-4 h-4 text-blue-600" />
                  <span>1. Archivo Plantilla Word (.docx)</span>
                </div>
                {modelo.docxUrl && (
                  <Button
                    type="button"
                    onClick={handleDownloadDocx}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
                  >
                    <IconDownload className="w-4 h-4" />
                    Descargar Archivo Word (.docx)
                  </Button>
                )}
              </div>

              {modelo.docxUrl ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
                  <IconFileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {modelo.docxUrl.split('/').pop() || 'plantilla.docx'}
                    </p>
                    <p className="text-muted-foreground text-[11px]">Disponible para descarga e inyección automática</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No se ha subido ningún archivo DOCX específico.</p>
              )}

              {modelo.variables && modelo.variables.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Variables detectadas ({modelo.variables.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {modelo.variables.map((v, idx) => (
                      <Badge key={idx} variant="secondary" className="font-mono text-[11px] px-2 py-0.5">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECCIÓN 2: ESTRUCTURA JSON SCHEMA */}
          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                  <IconBrackets className="w-4 h-4 text-purple-600" />
                  <span>2. Estructura JSON (JSON Schema de Salida)</span>
                </div>
                {modelo.jsonSchema && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyJson}
                    className="text-xs flex items-center gap-1"
                  >
                    {copiedJson ? <IconCheck className="w-3.5 h-3.5 text-green-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                    {copiedJson ? 'Copiado' : 'Copiar JSON'}
                  </Button>
                )}
              </div>

              {formattedJson ? (
                <pre className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-60">
                  {formattedJson}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sin JSON Schema definido.</p>
              )}
            </CardContent>
          </Card>

          {/* SECCIÓN 3: PROMPT E INSTRUCCIONES IA */}
          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                  <IconRobot className="w-4 h-4 text-green-600" />
                  <span>3. Instrucciones / Prompt Personalizado para la IA (Gemini)</span>
                </div>
                {modelo.instruccionesIa && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="text-xs flex items-center gap-1"
                  >
                    {copiedPrompt ? <IconCheck className="w-3.5 h-3.5 text-green-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                    {copiedPrompt ? 'Copiado' : 'Copiar Prompt'}
                  </Button>
                )}
              </div>

              {modelo.instruccionesIa ? (
                <div className="font-sans text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                  {modelo.instruccionesIa}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sin instrucciones de IA personalizadas.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <DialogFooter className="px-8 py-4 border-t bg-white dark:bg-slate-900 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>

          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onEdit(modelo)
              }}
              className="flex items-center gap-1.5"
            >
              <IconEdit className="w-4 h-4" />
              Editar Este Modelo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
