'use client'

import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'


interface QrWithLogoProps {
  url: string
  logoSrc?: string
  meetLogoSrc?: string
  width?: number
  height?: number
  showTitle?: boolean
  showMeetLogo?: boolean

}

const QrWithLogo: React.FC<QrWithLogoProps> = ({
  url,
  logoSrc = '/img/qr/logo_corte.png',
  meetLogoSrc = '/img/qr/meet_logo.png',
  width = 200,
  height = 200,
  showTitle = false,
  showMeetLogo = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateQrWithLogo = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

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

      // QR
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, url, {
        errorCorrectionLevel: 'H',
        width: qrSize,
        margin: 0,
      })
      ctx.drawImage(qrCanvas, 0, padding + titleHeight, qrSize, qrSize)

      // Logo central
      if (logoSrc) {
        const logo = new Image()
        logo.crossOrigin = 'anonymous'
        logo.src = logoSrc
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
      }

      // Logo Meet inferior (solo si showMeetLogo es true)
      if (meetLogoSrc && showMeetLogo) {
        const meetLogo = new Image()
        meetLogo.crossOrigin = 'anonymous'
        meetLogo.src = meetLogoSrc
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

      // Ya no llamamos automáticamente al callback de descarga
      // Solo se llamará cuando el usuario haga clic en el botón
    }

    generateQrWithLogo()
  }, [url, logoSrc, meetLogoSrc, width, height, showTitle, showMeetLogo])



  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas 
        ref={canvasRef} 
        className="border border-gray-200 rounded-lg shadow-sm"
      />
    </div>
  )
}

export default QrWithLogo 