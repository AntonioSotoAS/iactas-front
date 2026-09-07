"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { IconSend, IconFileText, IconRobot, IconSearch, IconCheck, IconBrackets, IconSparkles, IconFileSpreadsheet, IconEye } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { FileUploader } from "@/components/ui/file-uploader"
import { useUploadToPathMutation, UploadFileResponse } from "@/store/api/uploadApi"
import { useCreateActaSolicitudMutation } from "@/store/api/actaSolicitudApi"
import { useGetModelosActaQuery } from "@/store/api/modeloActaApi"
import { ModeloActaData } from "@/types/modeloActa"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { AILoadingModal } from "@/components/ui/ai-loading-modal"
import { ModeloDetailDialog } from "@/components/plantillas/modelo-detail-dialog"
import { PrioridadSolicitud } from "@/types/actaSolicitud"
import { AudienciaData } from "@/types/audiencia"
import { socketService } from "@/lib/socket"
import { SOLICITUD_WS_EVENTS, WsCambioEstadoPayload } from "@/types/ws-events"
import { toast } from "react-hot-toast"
import packageJson from "../../../../package.json"

export default function GenerarActaPorModeloPage() {
    const router = useRouter()
    const { user } = useUser()
    const userId = user?.id || 1

    const { data: modelosResponse, isLoading: loadingModelos } = useGetModelosActaQuery()
    const [uploadToPath] = useUploadToPathMutation()
    const [createActaSolicitud] = useCreateActaSolicitudMutation()

    const [selectedModelo, setSelectedModelo] = useState<ModeloActaData | null>(null)
    const [previewModelo, setPreviewModelo] = useState<ModeloActaData | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [transcripcionFile, setTranscripcionFile] = useState<File | null>(null)
    const [expediente, setExpediente] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)
    const isProcessingRef = useRef(false)
    const [processingMessage, setProcessingMessage] = useState<string>("")

    // Estado para los datos de audiencia si vienen de sessionStorage
    const [audienciaData, setAudienciaData] = useState<AudienciaData | null>(null)

    useEffect(() => {
        try {
            const audienciaDataFromStorage = sessionStorage.getItem('audienciaData')
            if (audienciaDataFromStorage) {
                const audienciaData: AudienciaData = JSON.parse(audienciaDataFromStorage)
                if (audienciaData.x_formato) {
                    setExpediente(audienciaData.x_formato)
                }
                setAudienciaData(audienciaData)
                sessionStorage.removeItem('audienciaData')
            }
        } catch (error) {
            console.warn('Error al leer datos de audiencia desde sessionStorage:', error)
        }
    }, [])

    const modelosList: ModeloActaData[] = Array.isArray(modelosResponse)
        ? modelosResponse
        : (modelosResponse?.data || [])

    // Preseleccionar modelo si viene desde la sección "Modelos de Actas"
    useEffect(() => {
        try {
            const selectedModeloIdFromStorage = sessionStorage.getItem('selectedModeloId')
            if (selectedModeloIdFromStorage && modelosList.length > 0) {
                const found = modelosList.find(m => m.id === Number(selectedModeloIdFromStorage))
                if (found) {
                    setSelectedModelo(found)
                    toast.success(`Modelo "${found.titulo}" seleccionado`)
                }
                sessionStorage.removeItem('selectedModeloId')
            }
        } catch (error) {
            console.warn('Error al leer modelo preseleccionado:', error)
        }
    }, [modelosList])

    const filteredModelos = modelosList.filter((m) => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return true
        const matchTitulo = m.titulo?.toLowerCase().includes(term)
        const matchDesc = m.descripcion?.toLowerCase().includes(term)
        return Boolean(matchTitulo || matchDesc)
    })

    const handleTranscripcionUpload = (file: File) => {
        setTranscripcionFile(file)
    }

    const handleGenerarActa = async (): Promise<void> => {
        if (isProcessingRef.current) return

        if (!selectedModelo) {
            toast.error("Por favor selecciona un Modelo de Acta de la lista")
            return
        }

        if (!transcripcionFile) {
            toast.error("Por favor sube el archivo de transcripción de la audiencia")
            return
        }

        const transcripcionExtension = transcripcionFile.name.toLowerCase().split('.').pop()
        if (transcripcionExtension !== 'docx') {
            toast.error("La transcripción debe ser un archivo DOCX")
            return
        }

        if (!expediente.trim()) {
            toast.error("Por favor ingresa el número de expediente")
            return
        }

        if (!user) {
            toast.error("No se pudo obtener la información del usuario")
            return
        }

        isProcessingRef.current = true
        setIsProcessing(true)
        setProcessingMessage("Iniciando proceso...")

        try {
            let transcripcionUploadResult: UploadFileResponse

            // PASO 1: Subir archivo transcripción
            setProcessingMessage("Subiendo archivo de transcripción...")
            try {
                transcripcionUploadResult = await uploadToPath({
                    file: transcripcionFile,
                    uploadToPathDto: {
                        ruta: `acta_solicitud/${expediente}/transcripcion`,
                        nombre_personalizado: `transcripcion_${expediente}`,
                        descripcion: `Transcripción de audiencia para expediente ${expediente}`
                    }
                }).unwrap()

                if (!transcripcionUploadResult.success || !transcripcionUploadResult.upload) {
                    throw new Error("Error al subir el archivo de transcripción")
                }
                toast.success("✅ Transcripción subida correctamente")
            } catch (error) {
                console.error("❌ Error al subir transcripción:", error)
                toast.error("❌ Error al subir la transcripción. Inténtalo de nuevo.")
                throw error
            }

            // PASO 2: Crear solicitud de acta con el modelo seleccionado
            setProcessingMessage("Creando solicitud con el Modelo Estandarizado...")

            // Preparar la URL del modelo (usar la URL del modelo guardado o un fallback)
            const modeloDocxUrl = selectedModelo.docxUrl || transcripcionUploadResult.upload.url_publica

            const metadata: Record<string, unknown> = {
                expediente: expediente,
                modelo_id: selectedModelo.id,
                modelo_titulo: selectedModelo.titulo,
                instrucciones_ia: selectedModelo.instruccionesIa || '',
                json_schema: selectedModelo.jsonSchema || '',
                variables: selectedModelo.variables || [],
            }

            if (audienciaData) {
                if (audienciaData.n_unico) metadata.numero_unico = audienciaData.n_unico
                if (audienciaData.x_formato) metadata.formato_expediente = audienciaData.x_formato
                if (audienciaData.f_audiencia) metadata.fecha_audiencia = audienciaData.f_audiencia
                if (audienciaData.x_desc_audiencia) metadata.tipo_audiencia = audienciaData.x_desc_audiencia
                if (audienciaData.f_ini_prog) metadata.hora_inicio = audienciaData.f_ini_prog
                if (audienciaData.f_fin_prog) metadata.hora_fin = audienciaData.f_fin_prog
                if (audienciaData.x_nom_instancia) metadata.instancia = audienciaData.x_nom_instancia
                if (audienciaData.n_incidente) metadata.incidente = audienciaData.n_incidente
            }

            const actaSolicitudData = {
                titulo: `${expediente} - ${selectedModelo.titulo}`,
                descripcion: `Generación automática basada en modelo "${selectedModelo.titulo}" para expediente ${expediente}`,
                url_modelo: modeloDocxUrl,
                url_transcripcion: transcripcionUploadResult.upload.url_publica,
                prioridad: PrioridadSolicitud.NORMAL,
                metadata: metadata,
                x_nom_instancia: audienciaData?.x_nom_instancia,
                n_unico: audienciaData?.n_unico ? Number(audienciaData.n_unico) : undefined,
                n_incidente: audienciaData?.n_incidente ? Number(audienciaData.n_incidente) : undefined,
                x_formato: audienciaData?.x_formato,
                expediente_unico: audienciaData?.expediente_unico ? Number(audienciaData.expediente_unico) : undefined,
                expediente_incidente: audienciaData?.expediente_incidente ? Number(audienciaData.expediente_incidente) : undefined,
                f_audiencia: audienciaData?.f_audiencia,
                f_ini_prog: audienciaData?.f_ini_prog,
                f_fin_prog: audienciaData?.f_fin_prog,
                n_sala: audienciaData?.n_sala ? Number(audienciaData.n_sala) : undefined,
                c_audiencia: audienciaData?.c_audiencia ? Number(audienciaData.c_audiencia) : undefined,
                n_programacion: audienciaData?.n_programacion ? Number(audienciaData.n_programacion) : undefined,
                x_desc_audiencia: audienciaData?.x_desc_audiencia
            }

            const actaSolicitudResult = await createActaSolicitud(actaSolicitudData).unwrap()

            if (actaSolicitudResult.success) {
                toast.success("🎉 ¡Solicitud creada exitosamente con tu Modelo Estandarizado!")
                setIsProcessing(false)
                router.push("/dashboard/mis-actas-generadas")
            } else {
                throw new Error("Error al crear la solicitud de acta")
            }

        } catch (error: unknown) {
            console.error("❌ Error en la generación por modelo:", error)
            toast.error("❌ Ocurrió un error al procesar el acta. Inténtalo nuevamente.")
        } finally {
            isProcessingRef.current = false
            setIsProcessing(false)
            setProcessingMessage("")
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                    <IconRobot className="w-9 h-9 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Generar Acta por Modelo</h1>
                </div>
                <p className="text-muted-foreground text-base">
                    Selecciona un Modelo Estandarizado guardado y sube únicamente la transcripción para generar tu acta.
                </p>
            </div>

            {/* PASO 1: SELECCIONAR MODELO GUARDADO */}
            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <IconFileText className="w-5 h-5 text-primary" />
                            1. Selecciona un Modelo de Acta Estandarizado *
                        </span>
                        {selectedModelo && (
                            <Badge variant="default" className="bg-green-600 flex items-center gap-1 text-xs">
                                <IconCheck className="w-3.5 h-3.5" /> Modelo Seleccionado
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Busca y selecciona el modelo de acta preconfigurado que deseas aplicar.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Buscador de Modelos */}
                    <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar modelo de acta por nombre o palabras clave..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Lista / Grid de Modelos */}
                    {loadingModelos ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">Cargando modelos de actas...</div>
                    ) : filteredModelos.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground border rounded-lg bg-muted/20 space-y-2">
                            {searchTerm.trim() ? (
                                <>
                                    <p>No se encontraron modelos que coincidan con &quot;<span className="font-semibold">{searchTerm}</span>&quot;.</p>
                                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                                        Limpiar filtro de búsqueda
                                    </Button>
                                </>
                            ) : (
                                <p>No se encontraron modelos registrados. Asegúrate de crear modelos en la sección &quot;Modelos de Actas&quot;.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                            {filteredModelos.map((modelo) => {
                                const isSelected = selectedModelo?.id === modelo.id
                                return (
                                    <div
                                        key={modelo.id}
                                        onClick={() => setSelectedModelo(modelo)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${isSelected
                                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 bg-white dark:bg-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-sm line-clamp-1">{modelo.titulo}</h4>
                                            {isSelected && <IconCheck className="w-4 h-4 text-primary shrink-0" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[2rem]">
                                            {modelo.descripcion || 'Sin descripción'}
                                        </p>
                                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t text-[11px] text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1">
                                                    <IconFileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                                                    {modelo.docxUrl ? 'Word DOCX' : 'Standard'}
                                                </span>
                                                {modelo.variables && modelo.variables.length > 0 && (
                                                    <span className="font-mono text-primary font-medium">
                                                        {modelo.variables.length} var(s)
                                                    </span>
                                                )}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPreviewModelo(modelo)
                                                }}
                                                className="h-6 text-[11px] px-2 flex items-center gap-1 border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                                title="Previsualizar PDF del modelo"
                                            >
                                                <IconEye className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Previsualizar</span>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Previsualización del Modelo Seleccionado */}
                    {selectedModelo && (
                        <div className="p-4 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                                    Modelo Activo: {selectedModelo.titulo}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreviewModelo(selectedModelo)}
                                        className="h-6 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-100 flex items-center gap-1"
                                    >
                                        <IconEye className="w-3.5 h-3.5 text-emerald-600" />
                                        Previsualizar PDF
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedModelo(null)}
                                        className="h-6 text-xs text-blue-700 hover:text-blue-900"
                                    >
                                        Cambiar
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-slate-700 dark:text-slate-300">
                                <div>• Plantilla Word: {selectedModelo.docxUrl ? 'Cargada' : 'Predeterminada'}</div>
                                <div>• JSON Schema: {selectedModelo.jsonSchema ? 'Personalizado' : 'Estándar'}</div>
                                <div>• Prompt IA: {selectedModelo.instruccionesIa ? 'Personalizado' : 'Estándar'}</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PASO 2 Y 3: EXPEDIENTE Y TRANSCRIPCIÓN */}
            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <IconFileText className="w-5 h-5 text-primary" />
                        2. Datos del Expediente y Transcripción
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Número de Expediente */}
                    <div>
                        <label htmlFor="expediente" className="block text-sm font-semibold mb-2">
                            Número de Expediente *
                        </label>
                        <Input
                            id="expediente"
                            value={expediente}
                            onChange={(e) => setExpediente(e.target.value)}
                            placeholder="Ej: 00123-2024-0-1801-JR-PE-01"
                            className="w-full h-11"
                            disabled={audienciaData !== null}
                        />
                        {audienciaData && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                                ✓ Expediente cargado automáticamente desde la audiencia seleccionada
                            </p>
                        )}
                    </div>

                    {/* Upload de Transcripción */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Transcripción de la Audiencia (DOCX) *
                        </label>
                        <FileUploader
                            onFileUpload={handleTranscripcionUpload}
                            acceptedFileTypes={[".docx"]}
                            maxFileSize={50 * 1024 * 1024}
                            placeholder="Haz clic o arrastra aquí la transcripción en formato Word (.docx)"
                        />
                        {transcripcionFile && (
                            <div className="mt-2 text-sm text-green-600 font-medium">
                                ✓ {transcripcionFile.name} cargado correctamente
                            </div>
                        )}
                    </div>

                    {/* Botón Generar */}
                    <Button
                        onClick={handleGenerarActa}
                        disabled={!selectedModelo || !transcripcionFile || !expediente.trim() || isProcessing}
                        className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold flex items-center justify-center space-x-2 rounded-xl shadow-md"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Procesando con Modelo Estandarizado...</span>
                            </>
                        ) : (
                            <>
                                <IconSend className="w-5 h-5" />
                                <span>Generar Acta Estandarizada</span>
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Modal de Procesamiento */}
            <AILoadingModal
                isOpen={isProcessing}
                message={processingMessage}
                onClose={() => setIsProcessing(false)}
            />

            {/* Modal de Previsualización PDF Exclusivo */}
            <ModeloDetailDialog
                open={!!previewModelo}
                onOpenChange={(open) => !open && setPreviewModelo(null)}
                modelo={previewModelo}
                pdfOnly={true}
            />
        </div>
    )
}
