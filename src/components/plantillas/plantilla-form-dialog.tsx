'use client'

import React, { useState, useEffect } from 'react'
import PizZip from 'pizzip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import {
  IconFileCode,
  IconUpload,
  IconRobot,
  IconCheck,
  IconAlertCircle,
  IconBrackets,
  IconSparkles,
  IconChevronRight,
  IconChevronLeft,
  IconFileText,
  IconInfoCircle,
  IconCircleCheck,
  IconTrash,
  IconFileSpreadsheet
} from '@tabler/icons-react'
import {
  useCreateModeloActaMutation,
  useUpdateModeloActaMutation
} from '@/store/api/modeloActaApi'
import { useUploadToPathMutation } from '@/store/api/uploadApi'
import { ModeloActaData } from '@/types/modeloActa'
import { useUser } from '@/hooks/use-user'

interface PlantillaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plantillaToEdit?: ModeloActaData | null
  onSuccess?: () => void
}

const DEFAULT_JSON_SCHEMA = JSON.stringify(
  {
    imputado: "Nombre completo del imputado o procesado",
    delito: "Delito imputado",
    agraviado: "Nombre de la víctima o agraviado",
    fiscal: "Nombre del fiscal a cargo",
    abogadoDefensor: "Nombre del abogado defensor",
    juez: "Nombre del Juez",
    resolucion: "Síntesis de la resolución tomada por el juez",
    puntosClave: ["Punto relevante 1", "Punto relevante 2"]
  },
  null,
  2
)

const DEFAULT_IA_INSTRUCTIONS = `Analiza la transcripción / audio de la audiencia adjunta y extrae la información requerida cumpliendo rigurosamente con el formato JSON especificado.

Instrucciones Específicas:
1. Extrae únicamente datos reales verificables en la transcripción.
2. Si un dato no se encuentra disponible, coloca "No especificado".
3. Mantén un tono formal e imparcial, adecuado para actas del Poder Judicial.`

const STEPS = [
  { id: 1, label: 'Datos Generales', icon: IconFileText, desc: 'Nombre y descripción' },
  { id: 2, label: 'Modelo Word', icon: IconUpload, desc: 'Archivo .docx y variables' },
  { id: 3, label: 'Estructura JSON', icon: IconBrackets, desc: 'Esquema de salida' },
  { id: 4, label: 'Prompt IA & Resumen', icon: IconRobot, desc: 'Instrucciones y confirmación' },
]

export function PlantillaFormDialog({
  open,
  onOpenChange,
  plantillaToEdit,
  onSuccess,
}: PlantillaFormDialogProps) {
  const { user } = useUser()
  const userId = user?.id || 1

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')

  // Manejo de archivo local antes de subir al servidor
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docxUrl, setDocxUrl] = useState('')
  const [docxFileName, setDocxFileName] = useState('')
  const [detectedVariables, setDetectedVariables] = useState<string[]>([])

  const [jsonSchema, setJsonSchema] = useState(DEFAULT_JSON_SCHEMA)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [instruccionesIa, setInstruccionesIa] = useState(DEFAULT_IA_INSTRUCTIONS)
  const [uploadingDocx, setUploadingDocx] = useState(false)

  const [createModeloActa, { isLoading: isCreating }] = useCreateModeloActaMutation()
  const [updateModeloActa, { isLoading: isUpdating }] = useUpdateModeloActaMutation()
  const [uploadToPath] = useUploadToPathMutation()

  useEffect(() => {
    if (plantillaToEdit) {
      setTitulo(plantillaToEdit.titulo || '')
      setDescripcion(plantillaToEdit.descripcion || '')
      setDocxUrl(plantillaToEdit.docxUrl || '')
      setDocxFileName(plantillaToEdit.docxUrl ? plantillaToEdit.docxUrl.split('/').pop() || 'modelo.docx' : '')
      setSelectedFile(null)
      setJsonSchema(
        plantillaToEdit.jsonSchema
          ? typeof plantillaToEdit.jsonSchema === 'string'
            ? plantillaToEdit.jsonSchema
            : JSON.stringify(plantillaToEdit.jsonSchema, null, 2)
          : DEFAULT_JSON_SCHEMA
      )
      setInstruccionesIa(plantillaToEdit.instruccionesIa || DEFAULT_IA_INSTRUCTIONS)
      setDetectedVariables(plantillaToEdit.variables || [])
    } else {
      setTitulo('')
      setDescripcion('')
      setDocxUrl('')
      setDocxFileName('')
      setSelectedFile(null)
      setJsonSchema(DEFAULT_JSON_SCHEMA)
      setInstruccionesIa(DEFAULT_IA_INSTRUCTIONS)
      setDetectedVariables([])
    }
    setCurrentStep(1)
  }, [plantillaToEdit, open])

  // Extraer variables {{variable}} desde un archivo docx procesándolo con PizZip
  const processDocxVariables = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const documentXml = zip.file('word/document.xml')?.asText() || ''

      const cleanText = documentXml.replace(/<[^>]+>/g, '')
      const matches = cleanText.match(/\{\{([^}]+)\}\}/g)

      if (matches) {
        const uniqueVars = Array.from(
          new Set(
            matches.map((m) => m.replace(/[\{\}]/g, '').trim()).filter((v) => v.length > 0)
          )
        )
        setDetectedVariables(uniqueVars)
        toast.success(`Se detectaron ${uniqueVars.length} variable(s) en el modelo DOCX`)
      } else {
        setDetectedVariables([])
      }
    } catch (err) {
      console.warn('No se pudieron extraer automáticamente las variables del DOCX:', err)
    }
  }

  // Selección local de archivo DOCX (sin subir aún al servidor)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Por favor selecciona un archivo con extensión .docx')
      return
    }

    setSelectedFile(file)
    setDocxFileName(file.name)
    await processDocxVariables(file)
  }

  // Quitar el archivo seleccionado
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setDocxFileName('')
    setDocxUrl('')
    setDetectedVariables([])
    toast.success('Archivo removido del modelo')
  }

  // Validar JSON Schema en tiempo real
  const handleJsonChange = (text: string) => {
    setJsonSchema(text)
    try {
      JSON.parse(text)
      setJsonError(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setJsonError(err.message)
      } else {
        setJsonError('Sintaxis JSON inválida')
      }
    }
  }

  // Generar JSON Schema automático desde las variables detectadas en el DOCX
  const generateJsonFromVariables = () => {
    if (detectedVariables.length === 0) {
      toast.error('No se han detectado variables en el archivo DOCX seleccionado')
      return
    }
    const schemaObj: Record<string, string> = {}
    detectedVariables.forEach((v) => {
      schemaObj[v] = `Descripción / Valor esperado para ${v}`
    })
    setJsonSchema(JSON.stringify(schemaObj, null, 2))
    setJsonError(null)
    toast.success('JSON Schema generado a partir de las variables del modelo DOCX')
  }

  // Navegación de pasos
  const handleNextStep = () => {
    if (currentStep === 1 && !titulo.trim()) {
      toast.error('Por favor ingresa el nombre del modelo')
      return
    }
    if (currentStep === 3 && jsonError) {
      toast.error('Corrige el error de sintaxis en el JSON antes de continuar')
      return
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Guardar modelo de acta (sube el archivo al servidor ÚNICAMENTE al guardar)
  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error('Ingresa un título para el modelo de acta')
      setCurrentStep(1)
      return
    }

    if (jsonError) {
      toast.error('Corrige el error de sintaxis en la Estructura JSON antes de guardar')
      setCurrentStep(3)
      return
    }

    setUploadingDocx(true)
    let finalDocxUrl = docxUrl

    try {
      // 1. Si hay un archivo local seleccionado, subirlo al servidor ahora
      if (selectedFile) {
        toast.loading('Subiendo archivo Word al servidor...', { id: 'upload-toast' })
        const res = await uploadToPath({
          file: selectedFile,
          uploadToPathDto: {
            ruta: 'modelo_acta/plantillas',
            nombre_personalizado: `modelo_${Date.now()}`,
            descripcion: `Modelo DOCX para ${titulo}`,
          },
        }).unwrap()

        if (res.success && (res.upload?.url_publica || res.ruta_creada)) {
          finalDocxUrl = res.upload?.url_publica || res.ruta_creada || ''
        } else if (res.upload?.url_publica) {
          finalDocxUrl = res.upload.url_publica
        }
        toast.dismiss('upload-toast')
      }

      // 2. Guardar o Actualizar el modelo en el backend
      if (plantillaToEdit) {
        await updateModeloActa({
          id: plantillaToEdit.id,
          data: {
            titulo,
            descripcion,
            docxUrl: finalDocxUrl,
            jsonSchema,
            instruccionesIa,
            variables: detectedVariables,
          },
        }).unwrap()
      } else {
        await createModeloActa({
          titulo,
          descripcion,
          userId,
          docxUrl: finalDocxUrl,
          jsonSchema,
          instruccionesIa,
          variables: detectedVariables,
        }).unwrap()
      }

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error al guardar el modelo de acta:', err)
      toast.error('Error al guardar el modelo de acta')
    } finally {
      setUploadingDocx(false)
      toast.dismiss('upload-toast')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[95vw] h-[90vh] max-h-[900px] flex flex-col overflow-hidden p-0 gap-0">
        {/* Header Modal */}
        <DialogHeader className="px-8 py-5 border-b bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
                <IconFileCode className="w-7 h-7 text-primary" />
                {plantillaToEdit ? 'Editar Modelo de Acta' : 'Crear Nuevo Modelo de Acta'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Asistente paso a paso para configurar tu modelo de acta personalizado (DOCX, JSON e IA).
              </DialogDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-800">
              Paso {currentStep} de 4
            </Badge>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isActive = currentStep === step.id

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep || (step.id === 2 && titulo.trim()) || step.id === currentStep) {
                      setCurrentStep(step.id)
                    }
                  }}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${isActive
                    ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                    : isCompleted
                      ? 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 text-slate-700 dark:text-slate-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 opacity-70'
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : ''}`} />
                      {step.id}. {step.label}
                    </span>
                    {isCompleted && <IconCheck className="w-4 h-4 text-green-600" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground line-clamp-1 font-normal">
                    {step.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-slate-50/50 dark:bg-slate-950/20">
          {/* PASO 1: DATOS GENERALES */}
          {currentStep === 1 && (
            <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 pb-2 border-b">
                <IconFileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Paso 1: Información General del Modelo de Acta</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="font-semibold text-sm">
                    Nombre o Título del Modelo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Ej. Modelo de Acta de Audiencia de Prisión Preventiva"
                    className="h-11 text-base"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Utiliza un nombre claro que te permita identificar este modelo al generar actas.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="font-semibold text-sm">
                    Descripción / Propósito del Modelo (Opcional)
                  </Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe para qué tipo de juicios o audiencias está diseñado este modelo de acta..."
                    rows={5}
                    className="text-sm"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: PLANTILLA DOCX */}
          {currentStep === 2 && (
            <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 pb-2 border-b">
                <IconUpload className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Paso 2: Carga de Archivo Word (.docx)</h3>
              </div>

              {!docxFileName && !selectedFile ? (
                /* Dropzone cuando NO hay archivo seleccionado */
                <Card className="border-2 border-dashed hover:border-primary transition-all">
                  <CardContent className="p-10 text-center relative cursor-pointer">
                    <input
                      type="file"
                      accept=".docx"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-primary/10 rounded-full text-primary">
                        <IconUpload className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">
                          Haz clic o arrastra tu archivo Word (.docx) aquí
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          El archivo Word debe contener los campos a reemplazar entre corchetes dobles, ejemplo: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-primary">{`{{imputado}}`}</code>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Tarjeta de Archivo Seleccionado con opción de Eliminar */
                <Card className="border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-blue-600 text-white rounded-lg">
                        <IconFileSpreadsheet className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {docxFileName}
                          {selectedFile && (
                            <Badge variant="secondary" className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              Pendiente de subir al guardar
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedFile
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB • Archivo seleccionado`
                            : 'Archivo guardado en el modelo'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".docx"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="sm" className="text-xs">
                          Cambiar Archivo
                        </Button>
                      </label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-xs flex items-center gap-1"
                        title="Eliminar archivo seleccionado"
                      >
                        <IconTrash className="w-4 h-4" />
                        Quitar Archivo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {detectedVariables.length > 0 && (
                <div className="p-5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCircleCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                        {detectedVariables.length} variable(s) detectada(s) automáticamente:
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateJsonFromVariables}
                      className="text-xs flex items-center gap-1.5 bg-white dark:bg-slate-900"
                    >
                      <IconSparkles className="w-4 h-4 text-purple-600" />
                      Generar JSON Schema
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detectedVariables.map((v, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-white dark:bg-slate-900 border">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: ESTRUCTURA JSON */}
          {currentStep === 3 && (
            <div className="h-full flex flex-col space-y-4 w-full max-w-5xl mx-auto animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <IconBrackets className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Paso 3: Estructura JSON (Esquema de Salida de la IA)</h3>
                </div>
                {jsonError ? (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                    <IconAlertCircle className="w-3.5 h-3.5" /> Error en JSON
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 flex items-center gap-1 text-xs">
                    <IconCheck className="w-3.5 h-3.5" /> Sintaxis JSON Válida
                  </Badge>
                )}
              </div>

              <Textarea
                value={jsonSchema}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="font-mono text-xs flex-1 min-h-[340px] bg-slate-950 text-emerald-400 p-4 rounded-xl border-slate-800 shadow-inner"
                placeholder="Ingresa la estructura JSON en la que deseas que la IA devuelva los datos extraídos..."
              />

              {jsonError && (
                <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200">
                  {jsonError}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Tip: Esta estructura JSON le indica a Gemini exactamente qué llaves extraer del audio o transcripción.
              </p>
            </div>
          )}

          {/* PASO 4: PROMPT IA & RESUMEN */}
          {currentStep === 4 && (
            <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 pb-2 border-b">
                <IconRobot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Paso 4: Instrucción Personalizada para la IA y Resumen</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="instruccionesIa" className="font-semibold text-sm">
                    Prompt / Instrucciones para Gemini
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setInstruccionesIa(DEFAULT_IA_INSTRUCTIONS)}
                    className="text-xs text-muted-foreground"
                  >
                    Restaurar por defecto
                  </Button>
                </div>
                <Textarea
                  id="instruccionesIa"
                  rows={5}
                  className="font-sans text-sm"
                  value={instruccionesIa}
                  onChange={(e) => setInstruccionesIa(e.target.value)}
                  placeholder="Instrucciones para la IA..."
                />
              </div>

              {/* Resumen Final */}
              <Card className="bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <IconInfoCircle className="w-4 h-4 text-primary" />
                    Resumen de Configuración del Modelo de Acta
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground">Título del Modelo:</span>
                    <p className="font-medium text-foreground">{titulo || 'Sin título'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Archivo Word DOCX:</span>
                    <p className="font-medium text-foreground">{docxFileName || 'No seleccionado'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Variables Detectadas:</span>
                    <p className="font-medium text-foreground">{detectedVariables.length} variable(s)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Estado JSON:</span>
                    <p className={`font-medium ${jsonError ? 'text-red-500' : 'text-green-600'}`}>
                      {jsonError ? 'Con errores de sintaxis' : 'Válido y Listo'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="px-8 py-4 border-t bg-white dark:bg-slate-900 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handlePrevStep}
            className="flex items-center gap-1"
          >
            {currentStep > 1 && <IconChevronLeft className="w-4 h-4" />}
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <Button type="button" onClick={handleNextStep} className="flex items-center gap-1">
                Siguiente
                <IconChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating || uploadingDocx}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 px-6"
              >
                <IconCheck className="w-4 h-4" />
                {isCreating || isUpdating || uploadingDocx
                  ? 'Guardando y Subiendo...'
                  : plantillaToEdit
                    ? 'Actualizar Modelo'
                    : 'Crear Modelo'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
