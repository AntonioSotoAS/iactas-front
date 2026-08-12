'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconDownload, IconQrcode } from "@tabler/icons-react"
import QrWithLogo from "./qr-with-logo"

interface QrCodesSectionProps {
    videoUrls: string[]
    qrCodes: string[]
    // onDownloadQr?: (qrCode: string, index: number) => void
}

const QrCodesSection: React.FC<QrCodesSectionProps> = ({
    videoUrls,
    qrCodes,
    // onDownloadQr
}) => {
    if (!videoUrls.length || !qrCodes.length) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <IconQrcode className="w-6 h-6" />
                    <CardTitle>Códigos QR de Videos</CardTitle>
                </div>
                <CardDescription>
                    Códigos QR generados para acceder a los videos de la audiencia
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoUrls.map((url, index) => {
                        if (!url.trim()) return null
                        
                        return (
                            <div key={index} className="flex flex-col items-center space-y-4">
                                <div className="text-center">
                                    <h4 className="font-semibold text-gray-800 mb-2">
                                        Video {index + 1}
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4 break-all">
                                        {url}
                                    </p>
                                </div>
                                
                                {/* QR Code con logo */}
                                <QrWithLogo 
                                    url={url}
                                    logoSrc="/img/qr/logo_corte.png"
                                    meetLogoSrc="/img/qr/meet_logo.png"
                                />
                                
                                {/* Botones adicionales */}
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                // Generar QR con logo usando la función de ActaApi
                                                const { ActaApi } = await import('@/store/api/actaApi')
                                                const qrWithLogo = await ActaApi['generarQRConLogo'](url)
                                                
                                                // Descargar el QR con logo
                                                const link = document.createElement('a')
                                                link.download = `qr_video_${index + 1}_${Date.now()}.png`
                                                link.href = qrWithLogo
                                                document.body.appendChild(link)
                                                link.click()
                                                document.body.removeChild(link)
                                            } catch (error) {
                                                console.error('Error al generar QR con logo:', error)
                                            }
                                        }}
                                    >
                                        <IconDownload className="w-4 h-4 mr-2" />
                                        Descargar QR
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(url, '_blank')}
                                    >
                                        Ver Video
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default QrCodesSection 