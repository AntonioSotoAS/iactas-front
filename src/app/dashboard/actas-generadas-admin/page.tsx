"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconRefresh, IconFilter, IconFileSpreadsheet, IconFileText, IconSearch } from "@tabler/icons-react"
import { DataTable } from "@/components/dashboard/actas-generadas-admin/table/data-table"
import { EstadoActa, ActaGenerada } from "@/types/actaGenerada"
import { useActasGeneradasAdmin } from "@/hooks/use-actas-generadas-admin"
import { createColumns } from "@/components/dashboard/actas-generadas-admin/table/columns"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useUser } from "@/hooks/use-user"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from "@/lib/toast"
import { VisualizarActaModal } from "@/components/dashboard/actas-generadas-admin/visualizar-acta-modal"

export default function ActasGeneradasAdminPage() {
  const { user } = useUser()
  const [filters, setFilters] = useState({
    estado: "todos",
    expediente: "",
    fechaDesde: "",
    fechaHasta: "",
  })
  const [applyDateFilters, setApplyDateFilters] = useState(false)
  const [selectedActa, setSelectedActa] = useState<ActaGenerada | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialTab, setModalInitialTab] = useState<'acta' | 'modelo' | 'transcripcion'>('acta')

  const {
    actas,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useActasGeneradasAdmin(filters, applyDateFilters)

  // Rastrear cambios en los filtros y mostrar toast cuando termine la carga
  const prevIsFetchingRef = useRef(isFetching)
  const filtersChangedRef = useRef(false)
  const prevFiltersRef = useRef(filters)

  // Detectar cuando cambian los filtros (estado y expediente se aplican automáticamente)
  // Las fechas solo se consideran cuando applyDateFilters es true
  const prevApplyDateFiltersRef = useRef(applyDateFilters)
  useEffect(() => {
    const estado = filters.estado
    const expediente = filters.expediente
    const fechaDesde = filters.fechaDesde
    const fechaHasta = filters.fechaHasta

    // Solo considerar cambios en estado y expediente para filtros automáticos
    // Las fechas se consideran solo cuando applyDateFilters cambia a true
    const filtersChanged = 
      prevFiltersRef.current.estado !== estado ||
      prevFiltersRef.current.expediente !== expediente ||
      (applyDateFilters && (
        prevFiltersRef.current.fechaDesde !== fechaDesde ||
        prevFiltersRef.current.fechaHasta !== fechaHasta ||
        !prevApplyDateFiltersRef.current // Si applyDateFilters cambió a true
      ))

    if (filtersChanged) {
      filtersChangedRef.current = true
      prevFiltersRef.current = { estado, expediente, fechaDesde, fechaHasta }
    }
    prevApplyDateFiltersRef.current = applyDateFilters
  }, [filters.estado, filters.expediente, filters.fechaDesde, filters.fechaHasta, applyDateFilters])

  // Mostrar toast cuando termine la carga después de cambiar filtros
  useEffect(() => {
    // Si estaba fetching, ahora no está fetching, y los filtros cambiaron
    if (prevIsFetchingRef.current && !isFetching && filtersChangedRef.current) {
      filtersChangedRef.current = false
      // Pequeño delay para asegurar que los datos estén actualizados
      setTimeout(() => {
        // Mostrar toast cuando termine la carga
        if (actas?.data && actas.data.length > 0) {
          toast.success(`Filtrado con éxito - ${actas.data.length} actas encontradas`)
        } else if (actas?.data && actas.data.length === 0) {
          toast("No se encontraron actas con los filtros aplicados", {
            icon: "ℹ️",
            duration: 3000,
          })
        }
      }, 200)
    }
    prevIsFetchingRef.current = isFetching
  }, [isFetching, actas?.data])

  const handleSearch = () => {
    // Activar los filtros de fecha
    setApplyDateFilters(true)
  }

  const handleClear = () => {
    // Limpiar todos los filtros y desactivar filtros de fecha
    setFilters({
      estado: "todos",
      expediente: "",
      fechaDesde: "",
      fechaHasta: "",
    })
    setApplyDateFilters(false)
  }

  const handleRefresh = () => {
    // Refrescar sin cambiar filtros
    refetch()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleViewActa = (acta: ActaGenerada) => {
    setSelectedActa(acta)
    setModalInitialTab('acta')
    setIsModalOpen(true)
  }

  const handleViewModelo = (acta: ActaGenerada) => {
    setSelectedActa(acta)
    setModalInitialTab('modelo')
    setIsModalOpen(true)
  }

  const handleViewTranscripcion = (acta: ActaGenerada) => {
    setSelectedActa(acta)
    setModalInitialTab('transcripcion')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedActa(null)
  }


  const exportToExcel = () => {
    if (!actas?.data?.length) {
      toast.error("No hay datos para exportar")
      return
    }



    try {
      // Preparar datos para Excel con verificación
      const excelData = actas.data.map((acta) => {


        const nombreCompleto = acta.creado_por_usuario ?
          `${acta.creado_por_usuario.nombres} ${acta.creado_por_usuario.apellidos_paterno} ${acta.creado_por_usuario.apellidos_materno}`.trim() :
          'No disponible'

        const rowData = {
          'N°': actas.data.indexOf(acta) + 1,
          'Expediente': acta.expediente || 'N/A',
          'Estado': acta.estado || 'N/A',
          'Subida al SIJ': acta.acta_subida_al_sij ? 'Sí' : 'No',
          'Creado por': nombreCompleto,
          'Email': acta.creado_por_usuario?.correo || 'No disponible',
          'Fecha de Creación': acta.created_at ? format(new Date(acta.created_at), "dd/MM/yyyy HH:mm", { locale: es }) : 'N/A',
          'Última Actualización': acta.updated_at ? format(new Date(acta.updated_at), "dd/MM/yyyy HH:mm", { locale: es }) : 'N/A',
          'Transcripción': acta.transcripcion ? (acta.transcripcion.substring(0, 100) + '...') : 'No disponible',
          'Markdown': acta.markdown_respuesta ? (acta.markdown_respuesta.substring(0, 100) + '...') : 'No disponible'
        }


        return rowData
      })



      // Crear hoja de metadatos
      const metadata = [
        ['REPORTE DE ACTAS GENERADAS'],
        [''],
        ['Fecha del Reporte:', format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })],
        ['Generado por:', user?.nombres || 'Usuario'],
        ['Total de Actas:', actas.data.length],
        ['Filtros aplicados:', Object.values(filters).filter(f => f && f !== "todos").length],
        [''],
        ['FILTROS APLICADOS:'],
        ['Estado:', filters.estado === 'todos' ? 'Todos' : filters.estado],
        ['Expediente:', filters.expediente || 'Ninguno'],
        ['Fecha Desde:', filters.fechaDesde || 'Ninguna'],
        ['Fecha Hasta:', filters.fechaHasta || 'Ninguna'],
        [''],
        ['DETALLES DE ACTAS:']
      ]

      // Crear workbook
      const wb = XLSX.utils.book_new()

      // Hoja de metadatos
      const wsMetadata = XLSX.utils.aoa_to_sheet(metadata)
      XLSX.utils.book_append_sheet(wb, wsMetadata, 'Metadatos')

      // Hoja de datos
      const wsData = XLSX.utils.json_to_sheet(excelData)

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 5 },   // N°
        { wch: 15 },  // Expediente
        { wch: 10 },  // Estado
        { wch: 12 },  // Subida al SIJ
        { wch: 25 },  // Creado por
        { wch: 25 },  // Email
        { wch: 20 },  // Fecha de Creación
        { wch: 20 },  // Última Actualización
        { wch: 30 },  // Transcripción
        { wch: 30 }   // Markdown
      ]
      wsData['!cols'] = columnWidths

      XLSX.utils.book_append_sheet(wb, wsData, 'Actas Generadas')

      // Generar archivo
      const fileName = `actas-generadas-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`
      XLSX.writeFile(wb, fileName)


      toast.success(`Excel exportado exitosamente: ${fileName}`)
    } catch (error) {
      console.error("Error al exportar Excel:", error)
      toast.error("Error al exportar Excel. Inténtalo de nuevo.")
    }
  }

  const exportToPDF = async () => {
    if (!actas?.data?.length) {
      toast.error("No hay datos para exportar")
      return
    }



    try {
      // Crear un iframe temporal para aislar completamente los estilos
      const iframe = document.createElement('iframe')
      iframe.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        height: 1200px;
        border: none;
        background: white;
      `
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error("No se pudo acceder al documento del iframe")
      }



      // Crear el contenido HTML completo con estilos inline
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #333333;
              background-color: #ffffff;
              padding: 20px;
              width: 800px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #9D0C11;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #9D0C11;
              margin-bottom: 10px;
              font-size: 24px;
              margin-top: 0;
            }
            .header p {
              color: #6b7280;
              margin: 0;
              font-size: 14px;
            }
            .info-section {
              margin-bottom: 30px;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #9D0C11;
            }
            .info-section.blue {
              background-color: #f1f5f9;
            }
            .info-section.yellow {
              background-color: #fef3c7;
              border-left-color: #f59e0b;
            }
            .info-section h3 {
              color: #9D0C11;
              margin-bottom: 15px;
              font-size: 16px;
              margin-top: 0;
            }
            .info-section.yellow h3 {
              color: #92400e;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              font-size: 12px;
            }
            .table-section h3 {
              color: #9D0C11;
              margin-bottom: 15px;
              font-size: 16px;
              margin-top: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 11px;
            }
            th {
              background-color: #9D0C11;
              color: #ffffff;
              border: 1px solid #cccccc;
              padding: 8px;
              text-align: left;
              font-weight: bold;
            }
            td {
              border: 1px solid #cccccc;
              padding: 8px;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:nth-child(odd) {
              background-color: #ffffff;
            }
            .footer {
              margin-top: 30px;
              padding: 15px;
              background-color: #dbeafe;
              border-radius: 8px;
              text-align: center;
              border-left: 4px solid #9D0C11;
            }
            .footer p {
              margin: 0;
              color: #9D0C11;
              font-size: 12px;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
            }
            .user-info {
              font-weight: bold;
            }
            .user-email {
              font-size: 10px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE DE ACTAS GENERADAS</h1>
            <!-- <p>Sistema de IActas - Poder Judicial CSJS</p> -->
            <p>Sistema de Gestión de Actas - Poder Judicial</p>
          </div>
          
          <div class="info-section blue">
            <h3>INFORMACIÓN DEL REPORTE</h3>
            <div class="info-grid">
              <div><strong>Fecha del Reporte:</strong> ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}</div>
              <div><strong>Generado por:</strong> ${user?.nombres ? `${user.nombres} ${user.apellidos_paterno || ''} ${user.apellidos_materno || ''}`.trim() : 'Usuario'}</div>
              <div><strong>Total de Actas:</strong> ${actas.data.length}</div>
              <div><strong>Filtros aplicados:</strong> ${Object.values(filters).filter(f => f && f !== "todos").length}</div>
            </div>
          </div>
          
          <div class="info-section yellow">
            <h3>FILTROS APLICADOS</h3>
            <div class="info-grid">
              <div><strong>Estado:</strong> ${filters.estado === 'todos' ? 'Todos' : filters.estado}</div>
              <div><strong>Expediente:</strong> ${filters.expediente || 'Ninguno'}</div>
              <div><strong>Fecha Desde:</strong> ${filters.fechaDesde || 'Ninguna'}</div>
              <div><strong>Fecha Hasta:</strong> ${filters.fechaHasta || 'Ninguna'}</div>
            </div>
          </div>
          
          <div class="table-section">
            <h3>LISTA DE ACTAS GENERADAS (${actas.data.length} actas)</h3>
            <table>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Expediente</th>
                  <th>Estado</th>
                  <th>Creado por</th>
                  <th>Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                ${actas.data.map((acta) => {
        const nombreCompleto = acta.creado_por_usuario ?
          `${acta.creado_por_usuario.nombres} ${acta.creado_por_usuario.apellidos_paterno || ''} ${acta.creado_por_usuario.apellidos_materno || ''}`.trim() :
          'No disponible'

        const estadoClass = acta.estado === 'generada' ? 'background-color: #10b981' :
          acta.estado === 'pendiente' ? 'background-color: #f59e0b' :
            acta.estado === 'subida_sij' ? 'background-color: #3b82f6' :
              acta.estado === 'error' ? 'background-color: #ef4444' :
                'background-color: #6b7280'

        return `
                    <tr>
                      <td style="font-weight: bold;">${actas.data.indexOf(acta) + 1}</td>
                      <td>${acta.expediente}</td>
                      <td>
                        <span class="badge" style="${estadoClass}; color: #ffffff; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">${acta.estado}</span>
                      </td>
                      <td>
                        <div class="user-info">${nombreCompleto}</div>
                        <div class="user-email">${acta.creado_por_usuario?.correo || 'No disponible'}</div>
                      </td>
                      <td>${format(new Date(acta.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</td>
                    </tr>
                  `
      }).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <!-- <p>Reporte generado automáticamente por el Sistema de Sistema de IActas - Poder Judicial CSJS</p> -->
            <p>Reporte generado automáticamente por el Sistema de Gestión de Actas</p>
          </div>
        </body>
        </html>
      `

      // Escribir el contenido en el iframe
      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()

      // Esperar a que el contenido se cargue
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Convertir el iframe a canvas
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: iframeDoc.body.scrollHeight,
        logging: false,
        removeContainer: true
      })

      // Remover el iframe
      document.body.removeChild(iframe)

      // Crear PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Descargar PDF
      const fileName = `actas-generadas-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`
      pdf.save(fileName)


      toast.success(`PDF exportado exitosamente: ${fileName}`)
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar el PDF. Inténtalo de nuevo.")
    }
  }

  // Crear columnas dinámicamente
  const columns = createColumns({
    onViewActa: handleViewActa,
    onViewModelo: handleViewModelo,
    onViewTranscripcion: handleViewTranscripcion
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Actas Generadas - Administración</h1>
          <Button disabled>
            <IconRefresh className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando actas generadas...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Actas Generadas - Administración</h1>
          <Button onClick={() => window.location.reload()} variant="outline">
            <IconRefresh className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Error al cargar actas generadas</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error && typeof error === 'object' && 'data' in error
                  ? (error.data as { message?: string })?.message
                  : "Ha ocurrido un error inesperado"}
              </p>
              <Button onClick={() => window.location.reload()}>
                <IconRefresh className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Actas Generadas - Administración</h1>
          <p className="text-muted-foreground">
            Gestiona y consulta todas las actas generadas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <IconRefresh className="h-4 w-4 mr-2" />
            {isLoading ? "Actualizando..." : "Actualizar"}
          </Button>
          <Button onClick={exportToExcel} variant="outline" disabled={!actas?.data?.length}>
            <IconFileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={exportToPDF} variant="outline" disabled={!actas?.data?.length}>
            <IconFileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleClear} variant="outline">
            <IconRefresh className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Sección de filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra las actas generadas por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filters.estado} onValueChange={(value) => handleFilterChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value={EstadoActa.PENDIENTE}>Pendiente</SelectItem>
                  <SelectItem value={EstadoActa.GENERADA}>Generada</SelectItem>
                  <SelectItem value={EstadoActa.SUBIDA_SIJ}>Subida al SIJ</SelectItem>
                  <SelectItem value={EstadoActa.ERROR}>Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expediente</label>
              <Input
                placeholder="Número de expediente..."
                value={filters.expediente}
                onChange={(e) => handleFilterChange("expediente", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Desde</label>
              <Input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Hasta</label>
              <Input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleClear} variant="outline" disabled={isLoading || isFetching}>
              <IconRefresh className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button onClick={handleSearch} disabled={isLoading || isFetching}>
              <IconSearch className="h-4 w-4 mr-2" />
              {isFetching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información del reporte */}
      {actas?.data && actas.data.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Total de Actas:</span>
                <span className="ml-2 text-blue-600">{actas?.total || 0}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Fecha del Reporte:</span>
                <span className="ml-2 text-blue-600">
                  {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Generado por:</span>
                <span className="ml-2 text-blue-600">{user?.nombres || "Usuario"}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Filtros aplicados:</span>
                <span className="ml-2 text-blue-600">
                  {Object.values(filters).filter(f => f && f !== "todos").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de actas generadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Actas Generadas</CardTitle>
              <CardDescription>
                {actas?.data?.length ? `Mostrando ${actas.data.length} de ${actas.total || 0} actas encontradas` : "No se encontraron actas"}
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <IconRefresh className="h-4 w-4 mr-2" />
              {isLoading ? "Cargando..." : "Actualizar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={actas?.data || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Modal para visualizar acta */}
      <VisualizarActaModal
        acta={selectedActa}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialTab={modalInitialTab}
      />

    </div>
  )
}
