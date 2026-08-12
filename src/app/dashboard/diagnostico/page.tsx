"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconCheck, IconX, IconRefresh, IconAlertTriangle } from "@tabler/icons-react"
import { DiagnosticUtils, DiagnosticResult } from "@/utils/diagnostic"
import { toast } from "react-hot-toast"

export default function DiagnosticoPage() {
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState<{
        environment: DiagnosticResult[]
        gemini: DiagnosticResult
        backend: DiagnosticResult
    } | null>(null)

    const runDiagnostic = async () => {
        setIsRunning(true)
        try {
            const diagnosticResults = await DiagnosticUtils.runFullDiagnostic()
            setResults(diagnosticResults)
            toast.success("Diagnóstico completado")
        } catch (error) {
            toast.error("Error al ejecutar diagnóstico")
            console.error("Error en diagnóstico:", error)
        } finally {
            setIsRunning(false)
        }
    }

    useEffect(() => {
        runDiagnostic()
    }, [])

    const getStatusIcon = (success: boolean) => {
        return success ? (
            <IconCheck className="w-5 h-5 text-green-600" />
        ) : (
            <IconX className="w-5 h-5 text-red-600" />
        )
    }

    const getStatusBadge = (success: boolean) => {
        return success ? (
            <Badge className="bg-green-100 text-green-800">Correcto</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-800">Error</Badge>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Diagnóstico del Sistema</h1>
                    <p className="text-muted-foreground">
                        Verifica la configuración y conectividad del sistema
                    </p>
                </div>
                <Button
                    onClick={runDiagnostic}
                    disabled={isRunning}
                    className="flex items-center space-x-2"
                >
                    <IconRefresh className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}</span>
                </Button>
            </div>

            {results && (
                <div className="space-y-6">
                    {/* Variables de Entorno */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <IconAlertTriangle className="w-5 h-5" />
                                <span>Variables de Entorno</span>
                            </CardTitle>
                            <CardDescription>
                                Verificación de configuración de variables de entorno
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {results.environment.map((result, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(result.success)}
                                            <div>
                                                <p className="font-medium">{result.message}</p>
                                                {result.details && (
                                                    <p className="text-sm text-gray-600">
                                                        {typeof result.details === 'string' ? result.details : JSON.stringify(result.details)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {getStatusBadge(result.success)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* API de Gemini */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                {getStatusIcon(results.gemini.success)}
                                <span>API de Gemini</span>
                            </CardTitle>
                            <CardDescription>
                                Verificación de conectividad con la API de Google Gemini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(results.gemini.success)}
                                    <div>
                                        <p className="font-medium">{results.gemini.message}</p>
                                        {results.gemini.details && (
                                            <p className="text-sm text-gray-600">
                                                {typeof results.gemini.details === 'string' ? results.gemini.details : JSON.stringify(results.gemini.details)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {getStatusBadge(results.gemini.success)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Backend API */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                {getStatusIcon(results.backend.success)}
                                <span>Backend API</span>
                            </CardTitle>
                            <CardDescription>
                                Verificación de conectividad con el backend
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(results.backend.success)}
                                    <div>
                                        <p className="font-medium">{results.backend.message}</p>
                                        {results.backend.details && (
                                            <p className="text-sm text-gray-600">
                                                {typeof results.backend.details === 'string' ? results.backend.details : JSON.stringify(results.backend.details)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {getStatusBadge(results.backend.success)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resumen */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen del Diagnóstico</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {results.environment.filter(r => r.success).length}/{results.environment.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Variables de Entorno</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {results.gemini.success ? 1 : 0}/1
                                        </div>
                                        <div className="text-sm text-gray-600">API de Gemini</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {results.backend.success ? 1 : 0}/1
                                        </div>
                                        <div className="text-sm text-gray-600">Backend API</div>
                                    </div>
                                </div>

                                {/* Recomendaciones */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Recomendaciones:</h4>
                                    <ul className="space-y-2 text-sm">
                                        {!results.environment.every(r => r.success) && (
                                            <li className="flex items-start space-x-2">
                                                <IconAlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                <span>Configura las variables de entorno faltantes en el archivo .env.local</span>
                                            </li>
                                        )}
                                        {!results.gemini.success && (
                                            <li className="flex items-start space-x-2">
                                                <IconAlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                <span>Verifica tu API key de Gemini en Google AI Studio</span>
                                            </li>
                                        )}
                                        {!results.backend.success && (
                                            <li className="flex items-start space-x-2">
                                                <IconAlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                <span>Asegúrate de que el backend esté corriendo en el puerto correcto</span>
                                            </li>
                                        )}
                                        {results.environment.every(r => r.success) && 
                                         results.gemini.success && 
                                         results.backend.success && (
                                            <li className="flex items-start space-x-2">
                                                <IconCheck className="w-4 h-4 text-green-600 mt-0.5" />
                                                <span>¡Todo está configurado correctamente! Puedes usar la generación de actas.</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!results && !isRunning && (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-600">Haz clic en Ejecutar Diagnóstico para comenzar</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

