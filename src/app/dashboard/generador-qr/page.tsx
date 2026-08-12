"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconQrcode, IconDownload, IconTrash } from "@tabler/icons-react"
import QrWithLogo from "@/components/qr-with-logo"
import QRCode from 'qrcode'

export default function QrDemoPage() {
    const [url, setUrl] = useState("")
    const [width, setWidth] = useState(200)
    const [height, setHeight] = useState(200)
    const [showTitle, setShowTitle] = useState(false)
    const [showMeetLogo, setShowMeetLogo] = useState(false)
    const [generatedQr, setGeneratedQr] = useState<string>("")

    const handleGenerateQr = () => {
        if (url.trim()) {
            setGeneratedQr(url)
        }
    }

    const handleDownloadQr = (canvas: HTMLCanvasElement) => {
        const link = document.createElement('a')
        link.download = `qr_${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDownloadClick = async () => {
        // Crear un canvas temporal para descargar
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const qrSize = Math.min(width, height)
        const padding = showTitle ? 20 : 0
        const titleHeight = showTitle ? 30 : 0
        const meetLogoHeight = showMeetLogo ? 40 : 0
        const totalHeight = qrSize + padding * 2 + titleHeight + meetLogoHeight

        canvas.width = width
        canvas.height = totalHeight

        // Fondo blanco
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Texto superior (solo si showTitle es true)
        if (showTitle) {
            ctx.fillStyle = 'black'
            ctx.font = '20px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('Video de Audiencia:', width / 2, padding)
        }

        // Generar QR en un canvas separado
        const qrCanvas = document.createElement('canvas')
        await QRCode.toCanvas(qrCanvas, generatedQr, {
            errorCorrectionLevel: 'H',
            width: qrSize,
            margin: 0,
        })
        ctx.drawImage(qrCanvas, 0, padding + titleHeight, qrSize, qrSize)

        // Logo central (logo_corte.png)
        const logo = new Image()
        logo.crossOrigin = 'anonymous'
        logo.src = '/img/qr/logo_corte.png'
        await new Promise<void>((resolve) => {
            logo.onload = () => {
                // Logo siempre 30% del tamaño del QR para mantener proporción
                const logoSize = qrSize * 0.3
                const x = (qrSize - logoSize) / 2
                const y = padding + titleHeight + (qrSize - logoSize) / 2
                ctx.drawImage(logo, x, y, logoSize, logoSize)
                resolve()
            }
            logo.onerror = () => {
                console.warn('No se pudo cargar el logo central')
                resolve()
            }
        })

        // Logo Meet inferior (solo si showMeetLogo es true)
        if (showMeetLogo) {
            const meetLogo = new Image()
            meetLogo.crossOrigin = 'anonymous'
            meetLogo.src = '/img/qr/meet_logo.png'
            await new Promise<void>((resolve) => {
                meetLogo.onload = () => {
                    // Logo Meet proporcional al tamaño del QR
                    const logoWidth = qrSize * 0.5  // 50% del ancho del QR
                    const logoHeight = qrSize * 0.15 // 15% del alto del QR
                    const x = (qrSize - logoWidth) / 2
                    const y = padding + titleHeight + qrSize + 10
                    ctx.drawImage(meetLogo, x, y, logoWidth, logoHeight)
                    resolve()
                }
                meetLogo.onerror = () => {
                    console.warn('No se pudo cargar el logo de Meet')
                    resolve()
                }
            })
        }

        // Descargar el canvas completo con logos
        handleDownloadQr(canvas)
    }

    const handleClear = () => {
        setGeneratedQr("")
        setUrl("")
        setWidth(200)
        setHeight(200)
        setShowTitle(false)
        setShowMeetLogo(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Generador de QR con Logo</h1>
                <p className="text-muted-foreground">
                    Prueba el generador de códigos QR con logos personalizados
                </p>
            </div>

            {/* Configuración */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <IconQrcode className="w-6 h-6" />
                        <CardTitle>Configuración del QR</CardTitle>
                    </div>
                    <CardDescription>
                        Ingresa una URL para generar el código QR con logos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                        <Input
                            placeholder="Aquí pon tu URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1"
                        />
                        <Button 
                            onClick={handleGenerateQr}
                            disabled={!url.trim()}
                        >
                            Generar QR
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleDownloadClick}
                            disabled={!generatedQr}
                        >
                            <IconDownload className="w-4 h-4 mr-2" />
                            Descargar QR
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleClear}
                            disabled={!generatedQr}
                        >
                            <IconTrash className="w-4 h-4 mr-2" />
                            Limpiar
                        </Button>
                    </div>
                    
                    {/* Controles de tamaño */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ancho (px)</label>
                            <Input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                min="100"
                                max="500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Alto (px)</label>
                            <Input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                min="100"
                                max="500"
                            />
                        </div>
                    </div>
                    
                    {/* Opciones */}
                    <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showTitle}
                                onChange={(e) => setShowTitle(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Mostrar título &quot;Video de Audiencia&quot;</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showMeetLogo}
                                onChange={(e) => setShowMeetLogo(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Mostrar logo de Meet</span>
                        </label>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        <p>URLs de ejemplo:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>https://meet.google.com/abc-defg-hij</li>
                            <li>https://zoom.us/j/123456789</li>
                            <li>https://teams.microsoft.com/l/meetup-join/...</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* QR Generado */}
            {generatedQr && (
                <Card>
                    <CardHeader>
                        <CardTitle>QR Generado</CardTitle>
                        <CardDescription>
                            Código QR con logo de la corte y logo de Meet
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center">
                            <QrWithLogo 
                                url={generatedQr}
                                logoSrc="/img/qr/logo_corte.png"
                                meetLogoSrc="/img/qr/meet_logo.png"
                                width={width}
                                height={height}
                                showTitle={showTitle}
                                showMeetLogo={showMeetLogo}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    )
} 