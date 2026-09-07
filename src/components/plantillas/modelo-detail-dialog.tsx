'use client'

import React, { useState, useEffect } from 'react'
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
  IconFileSpreadsheet,
  IconExternalLink,
  IconInfoCircle,
  IconSparkles,
  IconAlertCircle,
  IconLoader2
} from '@tabler/icons-react'
import { toast } from 'react-hot-toast'

interface ModeloDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelo: ModeloActaData | null
  onEdit?: (modelo: ModeloActaData) => void
  pdfOnly?: boolean
}

export function ModeloDetailDialog({
  open,
  onOpenChange,
  modelo,
  onEdit,
  pdfOnly = false,
}: ModeloDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'pdf' | 'config'>('pdf')
  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  // Estado para la carga segura de PDF como Blob URL
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const effectivePdfUrl = modelo?.pdfUrl || (modelo?.id && typeof window !== 'undefined' ? localStorage.getItem(`iactas_pdf_modelo_${modelo.id}`) : null)

  const getFullUrl = (url: string) => {
    const defaultUrl = typeof window !== 'undefined' && window.location.hostname
      ? `http://${window.location.hostname}:3009/api/v1`
      : 'http://172.17.78.59:3009/api/v1'
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || defaultUrl
    const origin = baseUrl.replace(/\/api(\/v\d+)?\/?$/, '')
    return url.startsWith('http') ? url : `${origin}/${url.replace(/^\//, '')}`
  }

  const fullPdfUrl = effectivePdfUrl ? getFullUrl(effectivePdfUrl) : null

  // Abrir PDF en pestaña completa usando el Blob URL generado o la URL resuelta válida
  const handleOpenFullTab = () => {
    const targetUrl = pdfBlobUrl || resolvedPdfUrl || fullPdfUrl
    if (targetUrl) {
      window.open(targetUrl, '_blank')
    } else {
      toast.error('No se pudo abrir el PDF en una nueva pestaña')
    }
  }

  // Cargar el PDF mediante fetch seguro y generar un objeto Blob URL para el iframe
  useEffect(() => {
    if (!effectivePdfUrl || !open) {
      setPdfBlobUrl(null)
      setResolvedPdfUrl(null)
      return
    }

    let isMounted = true
    setLoadingPdf(true)
    setPdfError(null)

    const fetchPdfBlob = async () => {
      try {
        const defaultUrl = typeof window !== 'undefined' && window.location.hostname
          ? `http://${window.location.hostname}:3009/api/v1`
          : 'http://172.17.78.59:3009/api/v1'
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || defaultUrl
        const origin = baseUrl.replace(/\/api(\/v\d+)?\/?$/, '')
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const cleanUri = effectivePdfUrl.replace(/^\//, '')

        const candidateUrls: string[] = []

        if (effectivePdfUrl.startsWith('http')) {
          candidateUrls.push(effectivePdfUrl)
        }

        // Endpoints de descarga por API del backend
        candidateUrls.push(
          `${baseUrl}/uploads/download-file?uri=${encodeURIComponent(cleanUri)}`,
          `${baseUrl}/upload/download-file?uri=${encodeURIComponent(cleanUri)}`
        )

        // Rutas estáticas con prefijos posibles en NestJS (uploads/, media/, etc.)
        if (!cleanUri.startsWith('uploads/')) {
          candidateUrls.push(`${origin}/uploads/${cleanUri}`)
        }
        if (!cleanUri.startsWith('media/')) {
          candidateUrls.push(`${origin}/media/${cleanUri}`)
        }
        candidateUrls.push(`${origin}/${cleanUri}`)

        let foundBlobUrl: string | null = null
        let successfulCandidate: string | null = null

        for (const candidate of candidateUrls) {
          try {
            const res = await fetch(candidate, { headers })
            const contentType = res.headers.get('content-type') || ''
            if (res.ok && !contentType.includes('application/json')) {
              const blob = await res.blob()
              // Validar si el blob es realmente un PDF (comprobar tipo o magic bytes %PDF)
              const headerText = await blob.slice(0, 4).text()
              if (blob.type.includes('pdf') || headerText === '%PDF') {
                foundBlobUrl = URL.createObjectURL(blob)
                successfulCandidate = candidate
                break
              }
            }
          } catch (e) {
            console.warn('Falló candidato PDF:', candidate, e)
          }
        }

        if (isMounted) {
          if (foundBlobUrl) {
            setPdfBlobUrl(foundBlobUrl)
            setResolvedPdfUrl(successfulCandidate)
            setPdfError(null)
          } else {
            setPdfBlobUrl(null)
            setResolvedPdfUrl(null)
            setPdfError('No se encontró el archivo PDF o el servidor devolvió un formato no válido.')
          }
          setLoadingPdf(false)
        }
      } catch (err) {
        console.error('Error al cargar PDF:', err)
        if (isMounted) {
          setPdfBlobUrl(null)
          setResolvedPdfUrl(null)
          setPdfError('Error de red al intentar cargar el PDF.')
          setLoadingPdf(false)
        }
      }
    }

    fetchPdfBlob()

    return () => {
      isMounted = false
    }
  }, [effectivePdfUrl, open])

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
        const fullUrl = getFullUrl(modelo.docxUrl)
        window.open(fullUrl, '_blank')
        toast.success('Descarga iniciada en nueva pestaña', { id: toastId })
      } catch (fallbackErr) {
        console.error('Error en fallback de descarga:', fallbackErr)
        toast.error('No se pudo descargar el archivo Word', { id: toastId })
      }
    }
  }

  const handleDownloadPdf = async () => {
    if (!effectivePdfUrl) return
    const filename = `${modelo.titulo.replace(/[^a-zA-Z0-9_-]/g, '_')}_previsualizacion.pdf`
    const toastId = toast.loading('Descargando PDF previsualizador...')

    try {
      await downloadFileDirectly(effectivePdfUrl, filename)
      toast.success('Descarga iniciada exitosamente', { id: toastId })
    } catch (err) {
      console.error('Error en descarga directa de PDF:', err)
      if (fullPdfUrl) window.open(fullPdfUrl, '_blank')
      toast.dismiss(toastId)
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
      <DialogContent className="sm:max-w-6xl w-[95vw] h-[92vh] max-h-[920px] flex flex-col overflow-hidden p-0 gap-0">
        {/* Header Modal */}
        <DialogHeader className="px-8 py-4 border-b bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
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

            {/* Selector de Pestañas (Oculto si es pdfOnly) */}
            {!pdfOnly && (
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('pdf')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'pdf'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                  <IconFileText className="w-4 h-4" />
                  Previsualizador PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('config')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'config'
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                  <IconBrackets className="w-4 h-4" />
                  Configuración & Variables
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/5 dark:bg-slate-950/40">
          {/* PESTAÑA 1: PREVISUALIZADOR PDF EMBEBIDO */}
          {activeTab === 'pdf' && (
            <div className="h-full flex flex-col space-y-3 animate-in fade-in-50 duration-200">
              {effectivePdfUrl ? (
                <div className="flex-1 flex flex-col space-y-3">
                  {/* Barra de Controles del PDF */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border shadow-xs">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 flex items-center gap-1">
                        <IconFileText className="w-3.5 h-3.5" /> PDF Modelo Oficial
                      </Badge>
                      <span className="font-mono text-muted-foreground truncate max-w-xs">
                        {effectivePdfUrl.split('/').pop() || 'previsualizacion.pdf'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenFullTab}
                        className="text-xs h-8 flex items-center gap-1.5"
                      >
                        <IconExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        Abrir en Pestaña Completa
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleDownloadPdf}
                        className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                      >
                        <IconDownload className="w-3.5 h-3.5" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>

                  {/* Visor PDF Interactivo Embebido */}
                  <div className="flex-1 min-h-[560px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-lg bg-slate-900 relative flex items-center justify-center">
                    {loadingPdf ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-300 py-20">
                        <IconLoader2 className="w-10 h-10 animate-spin text-emerald-500" />
                        <p className="text-sm font-medium">Cargando previsualizador PDF...</p>
                      </div>
                    ) : pdfBlobUrl ? (
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=1`}
                        className="w-full h-full min-h-[560px] border-0"
                        title={`Previsualización PDF de ${modelo.titulo}`}
                      />
                    ) : pdfError ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-300 p-8 text-center">
                        <IconAlertCircle className="w-10 h-10 text-amber-500" />
                        <p className="text-sm font-medium text-amber-400">{pdfError}</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          El archivo fue guardado pero la ruta del servidor no es accesible directamente. Puedes intentar abrirlo en una nueva pestaña.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOpenFullTab}
                          className="mt-2 text-xs text-white border-slate-700 hover:bg-slate-800"
                        >
                          <IconExternalLink className="w-4 h-4 mr-1 text-blue-400" />
                          Abrir enlace directo
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                /* Estado cuando NO hay PDF subido */
                <Card className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 my-auto">
                  <CardContent className="flex flex-col items-center justify-center gap-3 p-0">
                    <div className="p-4 bg-amber-100 dark:bg-amber-950/60 rounded-full text-amber-600">
                      <IconAlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                      Sin PDF de Previsualización
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md">
                      Este modelo de acta no cuenta con una plantilla PDF de muestra cargada.
                    </p>
                    {onEdit && (
                      <Button
                        type="button"
                        onClick={() => {
                          onOpenChange(false)
                          onEdit(modelo)
                        }}
                        className="mt-2 text-xs bg-primary hover:bg-primary/90 flex items-center gap-1.5"
                      >
                        <IconEdit className="w-4 h-4" />
                        Editar Modelo y Adjuntar PDF
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* PESTAÑA 2: CONFIGURACIÓN TÉCNICA */}
          {activeTab === 'config' && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* SECCIÓN 1: ARCHIVO DOCX */}
              <Card className="border shadow-xs">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                      <IconFileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span>Plantilla Word (.docx) con Inyección de Variables</span>
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
                      <IconFileSpreadsheet className="w-8 h-8 text-blue-600 shrink-0" />
                      <div className="text-xs min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {modelo.docxUrl.split('/').pop() || 'plantilla.docx'}
                        </p>
                        <p className="text-muted-foreground text-[11px]">Plantilla Word lista para inyección automática</p>
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
                          <Badge key={idx} variant="secondary" className="font-mono text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SECCIÓN 2: ESTRUCTURA JSON SCHEMA */}
              <Card className="border shadow-xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                      <IconBrackets className="w-4 h-4 text-purple-600" />
                      <span>Estructura JSON (Esquema de Salida de la IA)</span>
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
              <Card className="border shadow-xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                      <IconRobot className="w-4 h-4 text-green-600" />
                      <span>Instrucciones / Prompt Personalizado para la IA (Gemini)</span>
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
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-8 py-4 border-t bg-white dark:bg-slate-900 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>

          {!pdfOnly && onEdit && (
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
