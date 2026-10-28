"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconSend, IconFileText, IconRobot } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { FileUploader } from "@/components/ui/file-uploader"
import { useUploadToPathMutation, UploadFileResponse } from "@/store/api/uploadApi"
import { useCreateActaSolicitudMutation } from "@/store/api/actaSolicitudApi"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { AILoadingModal } from "@/components/ui/ai-loading-modal"
import { PrioridadSolicitud } from "@/types/actaSolicitud"
import { AudienciaData } from "@/types/audiencia"

import { toast } from "react-hot-toast"
import packageJson from "../../../../package.json"

export default function GenerarActaAutomaticoV2Page() {
    const router = useRouter()
    const { user } = useUser()
    const [uploadToPath] = useUploadToPathMutation()
    const [createActaSolicitud] = useCreateActaSolicitudMutation()

    const [modeloFile, setModeloFile] = useState<File | null>(null)
    const [transcripcionFile, setTranscripcionFile] = useState<File | null>(null)
    const [expediente, setExpediente] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)
    const isProcessingRef = useRef(false)
    const [processingMessage, setProcessingMessage] = useState<string>("")

    // Estado para los datos de audiencia usando el tipo correcto
    const [audienciaData, setAudienciaData] = useState<AudienciaData | null>(null)

    // Leer datos de audiencia desde sessionStorage al cargar la página
    useEffect(() => {
        try {
            const audienciaDataFromStorage = sessionStorage.getItem('audienciaData')

            if (audienciaDataFromStorage) {
                const audienciaData: AudienciaData = JSON.parse(audienciaDataFromStorage)

                // Setear el expediente automáticamente con x_formato
                if (audienciaData.x_formato) {
                    setExpediente(audienciaData.x_formato)
                }

                // Usar directamente los datos de audiencia sin mapeo
                setAudienciaData(audienciaData)

                // Limpiar sessionStorage después de leer los datos
                sessionStorage.removeItem('audienciaData')
            }
        } catch (error) {
            console.warn('Error al leer datos de audiencia desde sessionStorage:', error)
            toast.error('Error al cargar los datos de la audiencia.')
        }
    }, [])

    const handleModeloUpload = (file: File) => {
        setModeloFile(file)
    }

    const handleTranscripcionUpload = (file: File) => {
        setTranscripcionFile(file)
    }


    const handleGenerarActa = async (): Promise<void> => {
        if (isProcessingRef.current) return;

        if (!modeloFile || !transcripcionFile) {
            toast.error("Por favor sube tanto el modelo como la transcripción")
            return
        }

        // Validar tipos de archivo - ambos deben ser DOCX
        const modeloExtension = modeloFile.name.toLowerCase().split('.').pop()
        const transcripcionExtension = transcripcionFile.name.toLowerCase().split('.').pop()

        if (modeloExtension !== 'docx') {
            toast.error("El modelo debe ser un archivo DOCX")
            return
        }

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
        setProcessingMessage("")

        let isSuccess = false

        try {

            // Declarar variables para los resultados de upload
            let modeloUploadResult: UploadFileResponse
            let transcripcionUploadResult: UploadFileResponse

            // PASO 1: Subir archivo modelo
            setProcessingMessage("Subiendo archivo modelo...")

            try {
                modeloUploadResult = await uploadToPath({
                    file: modeloFile,
                    uploadToPathDto: {
                        ruta: `acta_solicitud/${expediente}/modelo`,
                        nombre_personalizado: `modelo_${expediente}`,
                        descripcion: `Modelo de acta para expediente ${expediente}`
                    }
                }).unwrap()

                if (!modeloUploadResult.success || !modeloUploadResult.upload) {
                    throw new Error("Error al subir el archivo modelo")
                }

                toast.success("✅ Archivo modelo subido correctamente")

            } catch (error) {
                console.error("❌ Error al subir modelo:", error)
                toast.error("❌ Error al subir el archivo modelo. Inténtalo de nuevo.")
                throw error
            }

            // PASO 2: Subir archivo transcripción
            setProcessingMessage("Subiendo archivo transcripción...")

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
                    throw new Error("Error al subir el archivo transcripción")
                }

                toast.success("✅ Archivo transcripción subido correctamente")

            } catch (error) {
                console.error("❌ Error al subir transcripción:", error)
                toast.error("❌ Error al subir el archivo transcripción. Inténtalo de nuevo.")
                throw error
            }

            // PASO 3: Crear acta solicitud con las URLs
            setProcessingMessage("Creando solicitud de acta...")

            try {
                // Limpiar metadata para remover valores undefined
                const metadata: Record<string, string | number> = {
                    expediente: expediente
                }

                // Solo agregar campos que tengan valores válidos si hay datos de audiencia
                if (audienciaData) {
                    if (audienciaData.n_unico) {
                        metadata.numero_unico = audienciaData.n_unico
                    }
                    if (audienciaData.x_formato) {
                        metadata.formato_expediente = audienciaData.x_formato
                    }
                    if (audienciaData.f_audiencia) {
                        metadata.fecha_audiencia = audienciaData.f_audiencia
                    }
                    if (audienciaData.x_desc_audiencia) {
                        metadata.tipo_audiencia = audienciaData.x_desc_audiencia
                    }
                    if (audienciaData.f_ini_prog) {
                        metadata.hora_inicio = audienciaData.f_ini_prog
                    }
                    if (audienciaData.f_fin_prog) {
                        metadata.hora_fin = audienciaData.f_fin_prog
                    }
                    if (audienciaData.x_nom_instancia) {
                        metadata.instancia = audienciaData.x_nom_instancia
                    }
                    if (audienciaData.n_incidente) {
                        metadata.incidente = audienciaData.n_incidente
                    }
                }

                const actaSolicitudData = {
                    titulo: `${expediente}`,
                    descripcion: `Solicitud de generación automática de acta para el expediente ${expediente}`,
                    url_modelo: modeloUploadResult.upload.url_publica,
                    url_transcripcion: transcripcionUploadResult.upload.url_publica,
                    prioridad: PrioridadSolicitud.NORMAL,
                    metadata: metadata,
                    // Campos de audiencia para persistir en la base de datos - convertir a números explícitamente
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


                // Validar que las URLs no estén vacías
                if (!modeloUploadResult.upload.url_publica || !transcripcionUploadResult.upload.url_publica) {
                    throw new Error("Las URLs de los archivos no están disponibles")
                }

                const actaSolicitudResult = await createActaSolicitud(actaSolicitudData).unwrap()

                if (actaSolicitudResult.success) {
                    isSuccess = true
                    toast.success("🎉 ¡Solicitud de acta creada exitosamente! Redirigiendo a tus actas...")
                    setProcessingMessage("¡Solicitud creada! Redirigiendo a mis actas generadas...")
                    router.push("/dashboard/mis-actas-generadas")
                    return
                } else {
                    throw new Error("Error al crear la solicitud de acta")
                }

            } catch (error: unknown) {
                // Solo loggear errores inesperados, no errores de validación esperados
                if (error && typeof error === 'object' && 'data' in error) {
                    const errorObj = error as { data?: unknown; status?: unknown; message?: unknown }

                    // Solo mostrar logs detallados para errores del servidor (500+)
                    if (errorObj.status && typeof errorObj.status === 'number' && errorObj.status >= 500) {
                        console.error("❌ Error del servidor al crear acta solicitud:", error)
                        if (errorObj.data) {
                            console.error("❌ Detalles del error del servidor:", errorObj.data)
                        }
                    }
                }

                // Mostrar mensaje de error más específico
                let errorMessage = "❌ Error al crear la solicitud de acta. Los archivos se subieron correctamente pero no se pudo crear la solicitud."

                if (error && typeof error === 'object' && 'data' in error) {
                    const errorObj = error as { data?: unknown; message?: unknown }
                    if (errorObj.data && typeof errorObj.data === 'object' && 'message' in errorObj.data) {
                        const dataObj = errorObj.data as { message?: unknown }
                        if (typeof dataObj.message === 'string') {
                            errorMessage = `❌ Error del servidor: ${dataObj.message}`
                        }
                    } else if (typeof errorObj.message === 'string') {
                        errorMessage = `❌ Error: ${errorObj.message}`
                    }
                }

                toast.error(errorMessage)
                throw error
            }

        } catch (error) {
            // Solo loggear errores críticos, no errores de validación normales
            if (error instanceof Error && !error.message.includes("Error al crear la solicitud de acta")) {
                console.error("❌ Error crítico en el proceso:", error)
            }

            // Determinar el tipo de error y mostrar mensaje apropiado
            if (error instanceof Error) {
                if (error.message.includes("modelo")) {
                    toast.error("❌ Error al subir el archivo modelo. Verifica que el archivo sea válido.")
                } else if (error.message.includes("transcripción")) {
                    toast.error("❌ Error al subir el archivo transcripción. Verifica que el archivo sea válido.")
                } else if (error.message.includes("solicitud")) {
                    toast.error("❌ Error al crear la solicitud de acta. Contacta con soporte técnico.")
                } else {
                    toast.error(`❌ Error: ${error.message}`)
                }
            } else {
                toast.error("❌ Error desconocido. Inténtalo de nuevo o contacta con soporte técnico.")
            }
        } finally {
            if (!isSuccess) {
                isProcessingRef.current = false
                setIsProcessing(false)
                setProcessingMessage("")
            }
        }
    }


    return (
        <div className="container mx-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <IconRobot className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold tracking-tight">Generar Acta Automático</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Genera actas de audiencia automáticamente usando IA - Versión {packageJson.version}
                    </p>
                </div>

                {/* Formulario Principal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <IconFileText className="w-5 h-5" />
                            <span>Información del Acta</span>
                        </CardTitle>
                        <CardDescription>
                            Sube el modelo de acta (DOCX) y la transcripción (DOCX) para crear una solicitud de procesamiento automático.
                            <br />
                            <strong>Nuevo flujo:</strong> Los archivos se suben al servidor y se crea una solicitud que será procesada automáticamente por el sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Número de Expediente */}
                        <div>
                            <label htmlFor="expediente" className="block text-sm font-medium mb-2">
                                Número de Expediente *
                            </label>
                            <Input
                                id="expediente"
                                value={expediente}
                                onChange={(e) => setExpediente(e.target.value)}
                                placeholder="Ej: 001-2024"
                                className="w-full"
                                disabled={audienciaData !== null}
                            />
                            {audienciaData && (
                                <p className="text-sm text-green-600 font-medium mt-1 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                                    ✓ Expediente cargado automáticamente desde la audiencia seleccionada
                                </p>
                            )}
                        </div>

                        {/* Upload de Modelo */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Modelo de Acta (DOCX) *
                            </label>
                            <FileUploader
                                onFileUpload={handleModeloUpload}
                                acceptedFileTypes={[".docx"]}
                                maxFileSize={50 * 1024 * 1024} // 50MB
                                placeholder="Arrastra o haz clic para subir el modelo de acta (DOCX)"
                            />
                            {modeloFile && (
                                <div className="mt-2 text-sm text-green-600">
                                    ✓ {modeloFile.name} seleccionado
                                </div>
                            )}
                        </div>

                        {/* Upload de Transcripción */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Transcripción de la Audiencia (DOCX) *
                            </label>
                            <FileUploader
                                onFileUpload={handleTranscripcionUpload}
                                acceptedFileTypes={[".docx"]}
                                maxFileSize={50 * 1024 * 1024} // 50MB
                                placeholder="Arrastra o haz clic para subir la transcripción (DOCX)"
                            />
                            {transcripcionFile && (
                                <div className="mt-2 text-sm text-green-600">
                                    ✓ {transcripcionFile.name} seleccionado
                                </div>
                            )}
                        </div>


                        {/* Botón Generar */}
                        <Button
                            onClick={handleGenerarActa}
                            disabled={!modeloFile || !transcripcionFile || !expediente.trim() || isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{processingMessage || "Procesando solicitud..."}</span>
                                </>
                            ) : (
                                <>
                                    <IconSend className="w-5 h-5" />
                                    <span>Crear Solicitud de Acta</span>
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Modal de Procesamiento */}
                <AILoadingModal
                    isOpen={isProcessing}
                    message={processingMessage}
                    onClose={() => {
                        if (!isProcessingRef.current) {
                            setIsProcessing(false)
                        }
                    }}
                />
            </div>
        </div>
    )
}