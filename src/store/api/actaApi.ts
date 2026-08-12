// ActaApi.ts
import {
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle
} from "docx"
import { marked } from "marked"

type TextRunOpts = { bold?: boolean; italics?: boolean }

export class ActaApi {
  // Método público para generar QR con logo
  static async generarQRConLogo(url: string): Promise<string> {
    try {
      const QRCode = await import('qrcode')

      // Crear canvas para el QR con logo
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo obtener contexto del canvas')

      const qrSize = 200
      const padding = 20
      const titleHeight = 30
      const meetLogoHeight = 40
      const totalHeight = qrSize + padding * 2 + titleHeight + meetLogoHeight

      canvas.width = 200
      canvas.height = totalHeight

      // Fondo blanco
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Texto superior
      ctx.fillStyle = 'black'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Video de Audiencia:', 200 / 2, padding)

      // Generar QR
      const qrCanvas = await QRCode.toCanvas(url, {
        errorCorrectionLevel: 'H',
        width: qrSize,
        margin: 0,
      })
      ctx.drawImage(qrCanvas, 0, padding + titleHeight, qrSize, qrSize)

      // Logo central
      const logo = new Image()
      logo.crossOrigin = 'anonymous'
      logo.src = '/img/qr/logo_corte.png'
      await new Promise<void>((resolve) => {
        logo.onload = () => {
          const logoSize = qrSize * 0.3
          const x = (qrSize - logoSize) / 2
          const y = padding + titleHeight + (qrSize - logoSize) / 2
          ctx.drawImage(logo, x, y, logoSize, logoSize)
          resolve()
        }
        logo.onerror = () => resolve()
      })

      // Logo Meet inferior
      const meetLogo = new Image()
      meetLogo.crossOrigin = 'anonymous'
      meetLogo.src = '/img/qr/meet_logo.png'
      await new Promise<void>((resolve) => {
        meetLogo.onload = () => {
          const logoWidth = qrSize * 0.5
          const logoHeight = qrSize * 0.15
          const x = (qrSize - logoWidth) / 2
          const y = padding + titleHeight + qrSize + 10
          ctx.drawImage(meetLogo, x, y, logoWidth, logoHeight)
          resolve()
        }
        meetLogo.onerror = () => resolve()
      })

      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error generando QR con logo:', error)
      throw error
    }
  }
}

export class AiApi {
  /**
   * Convierte texto markdown a elementos docx con buen espaciado.
   * - Interlineado ~1.15
   * - Espacio antes/después de párrafos
   */
  static parseMarkdownToDocx(
    markdownText: string,
    fuenteUniforme: string = "Arial"
  ): Paragraph[] {
    const elements: Paragraph[] = []
    const tokens = marked.lexer(markdownText)

    // Estándar de espaciado "bonito" (en twips)
    // 240 = 12pt. 276 ≈ 1.15x
    const BASE_SPACING = { before: 120, after: 280, line: 276 as number }

    const paragraph = (children: TextRun[]) =>
      new Paragraph({
        children,
        // 👇 espaciado por párrafo
        spacing: { ...BASE_SPACING, lineRule: "auto" },
        alignment: AlignmentType.JUSTIFIED,
        contextualSpacing: false, // evita que Word "colapse" el espacio entre párrafos del mismo estilo
      })

    const textRun = (text: string, opts?: TextRunOpts) =>
      new TextRun({ text, font: fuenteUniforme, ...opts })

    // Función auxiliar para headings con más aire
    const headingPara = (text: string, depth: number) => {
      const headingMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
      }
      return new Paragraph({
        children: [new TextRun({
          text: text.toUpperCase(),
          font: fuenteUniforme,
          bold: true
        })],
        heading: headingMap[depth] ?? HeadingLevel.HEADING_3,
        alignment: depth === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 360, after: 240 }, // más aire para títulos
      })
    }

    for (const token of tokens) {
      switch (token.type) {
        case "heading": {
          const headingToken = token as { text: string; depth: number }
          elements.push(headingPara(headingToken.text, headingToken.depth ?? 2))
          break
        }

        case "paragraph": {
          // Soportar **negritas** y *cursivas* simples
          const runs: TextRun[] = []
          const paragraphToken = token as { text: string }
          const raw = paragraphToken.text

          // Mejorar el parsing de markdown para ser más robusto
          // Manejar múltiples formatos: **bold**, __bold__, *italic*, _italic_
          const segments = raw.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g)
          for (const segment of segments) {
            if (!segment) continue

            // Bold con ** o __
            if ((segment.startsWith("**") && segment.endsWith("**")) ||
              (segment.startsWith("__") && segment.endsWith("__"))) {
              const text = segment.slice(2, -2)
              runs.push(textRun(text, { bold: true }))
            }
            // Italic con * o _ (pero no si es parte de bold)
            else if ((segment.startsWith("*") && segment.endsWith("*") && !segment.startsWith("**")) ||
              (segment.startsWith("_") && segment.endsWith("_") && !segment.startsWith("__"))) {
              const text = segment.slice(1, -1)
              runs.push(textRun(text, { italics: true }))
            }
            else {
              // También respeta saltos de línea simples convirtiéndolos en TextRuns con break
              const parts = segment.split(/\n/)
              parts.forEach((p, idx) => {
                if (idx > 0) runs.push(new TextRun({ break: 1 }))
                if (p) runs.push(textRun(p))
              })
            }
          }

          elements.push(paragraph(runs.length ? runs : [textRun(raw)]))
          break
        }

        case "list": {
          const listToken = token as { items: { text: string }[]; ordered: boolean }
          for (const item of listToken.items) {
            // Items también con formato inline básico - usar el mismo parsing mejorado
            const itemRuns: TextRun[] = []
            const itemSegments = item.text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g)
            for (const segment of itemSegments) {
              if (!segment) continue

              // Bold con ** o __
              if ((segment.startsWith("**") && segment.endsWith("**")) ||
                (segment.startsWith("__") && segment.endsWith("__"))) {
                const text = segment.slice(2, -2)
                itemRuns.push(textRun(text, { bold: true }))
              }
              // Italic con * o _ (pero no si es parte de bold)
              else if ((segment.startsWith("*") && segment.endsWith("*") && !segment.startsWith("**")) ||
                (segment.startsWith("_") && segment.endsWith("_") && !segment.startsWith("__"))) {
                const text = segment.slice(1, -1)
                itemRuns.push(textRun(text, { italics: true }))
              }
              else {
                itemRuns.push(textRun(segment))
              }
            }

            elements.push(
              new Paragraph({
                children: itemRuns.length ? itemRuns : [textRun(item.text)],
                numbering: {
                  reference: listToken.ordered ? "numbered-list" : "bulleted-list",
                  level: 0,
                },
                spacing: { ...BASE_SPACING, after: 120 },
              })
            )
          }
          break
        }

        case "blockquote": {
          const blockquoteToken = token as { text: string }
          elements.push(
            new Paragraph({
              children: [textRun(blockquoteToken.text, { italics: true })],
              border: {
                left: { style: BorderStyle.SINGLE, size: 6, color: "999999" },
              },
              spacing: { before: 160, after: 280, line: 276 },
            })
          )
          break
        }

        case "code": {
          const codeToken = token as { text: string }
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: codeToken.text, font: fuenteUniforme })],
              spacing: { before: 120, after: 280, line: 276 },
            })
          )
          break
        }

        default: {
          const defaultToken = token as { text?: string }
          const t = defaultToken.text
          if (typeof t === "string" && t.trim()) {
            elements.push(paragraph([textRun(t)]))
          }
          break
        }
      }
    }

    return elements
  }
}
