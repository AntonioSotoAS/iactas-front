import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { UsuarioRanking, TipoActaEstadistica } from '@/types/estadisticas'

// Extender el tipo de jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF
  }
}

export interface PDFReportOptions {
  title: string
  subtitle?: string
  filters?: {
    sedeId?: number
    fechaInicio?: string
    fechaFin?: string
    limit?: number
  }
  generatedAt: Date
}

export class PDFReportGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    
    // Configurar autoTable en la instancia de jsPDF
    this.doc.autoTable = (options: Record<string, unknown>) => {
      autoTable(this.doc, options)
      return this.doc
    }
  }

  private addHeader(options: PDFReportOptions) {
    // Logo o título principal
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Sistema de Gestión de Actas', this.margin, this.currentY)
    this.currentY += 10

    // Título del reporte
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(options.title, this.margin, this.currentY)
    this.currentY += 8

    // Subtítulo si existe
    if (options.subtitle) {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(options.subtitle, this.margin, this.currentY)
      this.currentY += 8
    }

    // Información de filtros
    if (options.filters) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(100, 100, 100)
      
      let filterText = 'Filtros aplicados: '
      const filterParts = []
      
      if (options.filters.sedeId) {
        filterParts.push(`Sede ID: ${options.filters.sedeId}`)
      }
      if (options.filters.fechaInicio) {
        const fechaInicio = new Date(options.filters.fechaInicio).toLocaleDateString('es-ES')
        filterParts.push(`Desde: ${fechaInicio}`)
      }
      if (options.filters.fechaFin) {
        const fechaFin = new Date(options.filters.fechaFin).toLocaleDateString('es-ES')
        filterParts.push(`Hasta: ${fechaFin}`)
      }
      if (options.filters.limit) {
        filterParts.push(`Límite: ${options.filters.limit}`)
      }
      
      if (filterParts.length > 0) {
        filterText += filterParts.join(' | ')
        this.doc.text(filterText, this.margin, this.currentY)
        this.currentY += 6
      }
    }

    // Fecha de generación
    this.doc.setFontSize(10)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(
      `Generado el: ${options.generatedAt.toLocaleString('es-ES')}`,
      this.margin,
      this.currentY
    )
    this.currentY += 15

    // Línea separadora
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }

  private checkPageBreak(neededSpace: number = 20) {
    if (this.currentY + neededSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
      return true
    }
    return false
  }

  generateRankingReport(
    data: UsuarioRanking[],
    options: PDFReportOptions
  ): jsPDF {
    this.addHeader(options)

    // Título de la sección
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Ranking de Usuarios por Actas Generadas', this.margin, this.currentY)
    this.currentY += 10

    if (data.length === 0) {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(100, 100, 100)
      this.doc.text('No hay datos disponibles para mostrar.', this.margin, this.currentY)
      return this.doc
    }

    // Preparar datos para la tabla
    const tableData = data.map((user) => [
      user.posicion.toString(),
      `${user.nombre} ${user.apellidos}`,
      user.email,
      user.totalActas.toString()
    ])

    // Generar tabla
    this.doc.autoTable({
      head: [['Posición', 'Nombre Completo', 'Email', 'Total Actas']],
      body: tableData,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Azul
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Gris muy claro
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 }, // Posición
        1: { cellWidth: 60 }, // Nombre
        2: { cellWidth: 70 }, // Email
        3: { halign: 'center', cellWidth: 30 }, // Total Actas
      },
      didDrawPage: (data: { cursor: { y: number } }) => {
        this.currentY = data.cursor.y + 10
      }
    })

    // Estadísticas adicionales
    this.currentY += 10
    this.checkPageBreak(30)

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Resumen Estadístico', this.margin, this.currentY)
    this.currentY += 8

    const totalActas = data.reduce((sum, user) => sum + user.totalActas, 0)
    const promedioActas = data.length > 0 ? totalActas / data.length : 0
    const usuarioTop = data[0]

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`• Total de usuarios: ${data.length}`, this.margin, this.currentY)
    this.currentY += 5
    this.doc.text(`• Total de actas generadas: ${totalActas}`, this.margin, this.currentY)
    this.currentY += 5
    this.doc.text(`• Promedio de actas por usuario: ${promedioActas.toFixed(1)}`, this.margin, this.currentY)
    this.currentY += 5
    if (usuarioTop) {
      this.doc.text(`• Usuario con más actas: ${usuarioTop.nombre} ${usuarioTop.apellidos} (${usuarioTop.totalActas} actas)`, this.margin, this.currentY)
    }

    return this.doc
  }

  generateTipoAudienciaReport(
    data: TipoActaEstadistica[],
    options: PDFReportOptions
  ): jsPDF {
    this.addHeader(options)

    // Título de la sección
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Estadísticas por Tipo de Audiencia', this.margin, this.currentY)
    this.currentY += 10

    if (data.length === 0) {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(100, 100, 100)
      this.doc.text('No hay datos disponibles para mostrar.', this.margin, this.currentY)
      return this.doc
    }

    // Preparar datos para la tabla
    const tableData = data.map((tipo, index) => [
      (index + 1).toString(),
      tipo.tipo_audiencia,
      tipo.total_actas.toString(),
      `${tipo.porcentaje.toFixed(1)}%`
    ])

    // Generar tabla
    this.doc.autoTable({
      head: [['#', 'Tipo de Audiencia', 'Total Actas', 'Porcentaje']],
      body: tableData,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [34, 197, 94], // Verde
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Gris muy claro
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // #
        1: { cellWidth: 80 }, // Tipo de Audiencia
        2: { halign: 'center', cellWidth: 30 }, // Total Actas
        3: { halign: 'center', cellWidth: 25 }, // Porcentaje
      },
      didDrawPage: (data: { cursor: { y: number } }) => {
        this.currentY = data.cursor.y + 10
      }
    })

    // Estadísticas adicionales
    this.currentY += 10
    this.checkPageBreak(30)

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Resumen Estadístico', this.margin, this.currentY)
    this.currentY += 8

    const totalActas = data.reduce((sum, tipo) => sum + tipo.total_actas, 0)
    const tipoMasComun = data.reduce((prev, current) => 
      prev.total_actas > current.total_actas ? prev : current
    )

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`• Total de tipos de audiencia: ${data.length}`, this.margin, this.currentY)
    this.currentY += 5
    this.doc.text(`• Total de actas generadas: ${totalActas}`, this.margin, this.currentY)
    this.currentY += 5
    this.doc.text(`• Tipo más común: ${tipoMasComun.tipo_audiencia} (${tipoMasComun.total_actas} actas - ${tipoMasComun.porcentaje.toFixed(1)}%)`, this.margin, this.currentY)
    this.currentY += 5

    // Distribución de porcentajes
    this.doc.text('• Distribución de porcentajes:', this.margin, this.currentY)
    this.currentY += 5
    
    data.forEach((tipo) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage()
        this.currentY = this.margin
      }
      this.doc.text(`  - ${tipo.tipo_audiencia}: ${tipo.porcentaje.toFixed(1)}%`, this.margin + 10, this.currentY)
      this.currentY += 4
    })

    return this.doc
  }

  download(filename: string) {
    this.doc.save(filename)
  }
}

// Funciones de conveniencia para generar reportes
export const generateRankingPDF = (
  data: UsuarioRanking[],
  options: PDFReportOptions
) => {
  const generator = new PDFReportGenerator()
  generator.generateRankingReport(data, options)
  const filename = `ranking-usuarios-${new Date().toISOString().split('T')[0]}.pdf`
  generator.download(filename)
}

export const generateTipoAudienciaPDF = (
  data: TipoActaEstadistica[],
  options: PDFReportOptions
) => {
  const generator = new PDFReportGenerator()
  generator.generateTipoAudienciaReport(data, options)
  const filename = `estadisticas-tipo-audiencia-${new Date().toISOString().split('T')[0]}.pdf`
  generator.download(filename)
}
