"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconRefresh, IconDatabase, IconSettings, IconDownload, IconChartBar, IconFilter } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EstadisticasCards } from "@/components/dashboard/actas-subidas-sij/estadisticas-cards"
import { DataTable } from "@/components/dashboard/actas-subidas-sij/table/data-table"
import { columns } from "@/components/dashboard/actas-subidas-sij/table/columns"
import { ConfirmarSincronizacionModal } from "@/components/dashboard/actas-subidas-sij/confirmar-sincronizacion-modal"
import { useActasSubidasSij } from "@/hooks/use-actas-subidas-sij"
import { useSincronizacion } from "@/hooks/use-actas-subidas-sij"
import { toast } from "@/lib/toast"
import { ActaSubidaSij } from "@/types/actaSubidaSij"
import * as XLSX from 'xlsx'

type FiltroDiasTranscurridos = "todos" | "mismoDia" | "unoADiezDias" | "onceAVeinteDias" | "masDeVeinteDias" | "pendiente"

export default function ActasSubidasSijPage() {
  const router = useRouter()
  const [filters] = useState({
    lIndPdf: undefined as string | undefined,
    fechaDesde: undefined as string | undefined,
    fechaHasta: undefined as string | undefined,
  })
  const [filtroDiasTranscurridos, setFiltroDiasTranscurridos] = useState<FiltroDiasTranscurridos>("todos")
  const [allActas, setAllActas] = useState<ActaSubidaSij[]>([])
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const {
    actas: actasRaw,
    total: totalRaw,
    totalPages,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize
  } = useActasSubidasSij(filters)

  // Cargar todos los datos cuando se aplica un filtro de días transcurridos
  useEffect(() => {
    if (filtroDiasTranscurridos !== "todos") {
      const fetchAllActas = async () => {
        try {
          setIsLoadingAll(true)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/actas-subidas-sij?limit=10000`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (response.ok) {
            const data = await response.json()
            setAllActas(data.data || [])
          }
        } catch (err) {
          console.error('Error al cargar todas las actas:', err)
        } finally {
          setIsLoadingAll(false)
        }
      }
      fetchAllActas()
    } else {
      setAllActas([])
      setCurrentPage(1) // Resetear a la primera página cuando se quita el filtro
    }
  }, [filtroDiasTranscurridos, setCurrentPage])

  // Filtrar actas por días transcurridos en el frontend
  const actasFiltradas = useMemo(() => {
    const datosAFiltrar = filtroDiasTranscurridos !== "todos" && allActas.length > 0 ? allActas : actasRaw
    
    return datosAFiltrar.filter((acta) => {
      if (filtroDiasTranscurridos === "todos") return true

      const actaGenerada = acta.actaGenerada as Record<string, unknown> | undefined
      if (!actaGenerada?.f_ini_prog) {
        return filtroDiasTranscurridos === "pendiente"
      }

      const fechaAudiencia = new Date(actaGenerada.f_ini_prog as string)
      const fechaEnvio = acta.fEnvDespActa ? new Date(acta.fEnvDespActa) : null

      if (!fechaEnvio) {
        return filtroDiasTranscurridos === "pendiente"
      }

      const fechaAudienciaNormalizada = new Date(fechaAudiencia.getFullYear(), fechaAudiencia.getMonth(), fechaAudiencia.getDate())
      const fechaEnvioNormalizada = new Date(fechaEnvio.getFullYear(), fechaEnvio.getMonth(), fechaEnvio.getDate())
      const diferenciaMs = fechaEnvioNormalizada.getTime() - fechaAudienciaNormalizada.getTime()
      const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))

      switch (filtroDiasTranscurridos) {
        case "mismoDia":
          return dias === 0
        case "unoADiezDias":
          return dias >= 1 && dias <= 10
        case "onceAVeinteDias":
          return dias >= 11 && dias <= 20
        case "masDeVeinteDias":
          return dias > 20
        case "pendiente":
          return false
        default:
          return true
      }
    })
  }, [filtroDiasTranscurridos, actasRaw, allActas])

  // Paginar los datos filtrados
  const actas = useMemo(() => {
    if (filtroDiasTranscurridos === "todos") {
      return actasRaw
    }
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return actasFiltradas.slice(startIndex, endIndex)
  }, [actasFiltradas, actasRaw, filtroDiasTranscurridos, currentPage, pageSize])

  const total = filtroDiasTranscurridos === "todos" ? totalRaw : actasFiltradas.length
  const totalPagesFiltered = filtroDiasTranscurridos === "todos" ? totalPages : Math.ceil(actasFiltradas.length / pageSize)

  

  const {
    sincronizarConMatching,
    isLoadingMatching
  } = useSincronizacion()

  const handleAbrirModal = () => {
    setIsModalOpen(true)
  }

  const handleCerrarModal = () => {
    setIsModalOpen(false)
  }

  const handleConfirmarSincronizacion = async () => {
    try {
      const result = await sincronizarConMatching()
      toast.success(`Sincronización con matching completada: ${result.registrosProcesados} registros procesados`)
      refetch()
    } catch (error) {
      toast.error('Error al sincronizar con matching')
      throw error // Re-lanzar para que el modal maneje el error
    }
  }

  const handleRefresh = () => {
    refetch()
    toast.success('Datos actualizados')
  }

  const handleDownloadExcel = async () => {
    try {
      setIsDownloadingExcel(true)
      
      // Hacer consulta completa para obtener todos los registros
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/actas-subidas-sij?limit=10000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener los datos')
      }

      const data = await response.json()
      const allActas = data.data || []

      if (allActas.length === 0) {
        toast.error('No hay datos para exportar')
        return
      }

      // Preparar los datos para Excel con las mismas columnas de la tabla
      const excelData = allActas.map((acta: Record<string, unknown>) => {
        // Calcular días transcurridos
        let diasTranscurridos = 'Sin fecha audiencia'
        if ((acta.actaGenerada as Record<string, unknown>)?.f_ini_prog) {
          const fechaAudiencia = new Date((acta.actaGenerada as Record<string, unknown>).f_ini_prog as string)
          const fechaEnvio = acta.fEnvDespActa ? new Date(acta.fEnvDespActa as string) : null
          
          if (fechaEnvio) {
            const fechaAudienciaNormalizada = new Date(fechaAudiencia.getFullYear(), fechaAudiencia.getMonth(), fechaAudiencia.getDate())
            const fechaEnvioNormalizada = new Date(fechaEnvio.getFullYear(), fechaEnvio.getMonth(), fechaEnvio.getDate())
            const diferenciaMs = fechaEnvioNormalizada.getTime() - fechaAudienciaNormalizada.getTime()
            const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))
            diasTranscurridos = dias === 0 ? 'Mismo día' : `${dias} día${dias !== 1 ? 's' : ''}`
          } else {
            diasTranscurridos = 'Pendiente'
          }
        }

        // Calcular rango de páginas
        let rangoPaginas = ''
        const paginas = Number(acta.lCantPaginas) || 0
        if (paginas <= 10) {
          rangoPaginas = '1 a 10 páginas'
        } else if (paginas <= 20) {
          rangoPaginas = '11 a 20 páginas'
        } else if (paginas <= 30) {
          rangoPaginas = '21 a 30 páginas'
        } else {
          rangoPaginas = 'Más de 30 páginas'
        }

        // Formatear fechas
        const formatDate = (dateString: string) => {
          if (!dateString) return 'Sin fecha'
          const date = new Date(dateString)
          return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }

        // Usuario creador
        let creadoPor = 'Sin usuario'
        if ((acta.actaGenerada as Record<string, unknown>)?.creado_por_usuario) {
          const usuario = (acta.actaGenerada as Record<string, unknown>).creado_por_usuario as Record<string, unknown>
          creadoPor = `${usuario.nombres} ${usuario.apellidos_paterno} ${usuario.apellidos_materno}`.toUpperCase()
        }

        return {
          'ID': acta.id,
          'Días Transcurridos': diasTranscurridos,
          'Páginas': `${acta.lCantPaginas || 0} págs`,
          'Rango de Páginas': rangoPaginas,
          'Tipo de Audiencia': (acta.actaGenerada as Record<string, unknown>)?.x_desc_audiencia || 'Sin tipo',
          'Creado por': creadoPor,
          'Fecha de Audiencia': (acta.actaGenerada as Record<string, unknown>)?.f_ini_prog ? formatDate((acta.actaGenerada as Record<string, unknown>).f_ini_prog as string) : 'Sin fecha',
          'Fecha Acta Generada': (acta.actaGenerada as Record<string, unknown>)?.updated_at ? formatDate((acta.actaGenerada as Record<string, unknown>).updated_at as string) : 'Sin fecha',
          'Fecha Creación': formatDate(acta.fCreaActa as string),
          'Enviado a Despacho': acta.fEnvDespActa ? formatDate(acta.fEnvDespActa as string) : 'No enviado',
          'Descargado': acta.fDescActa ? formatDate(acta.fDescActa as string) : 'No descargado',
          'PDF': acta.lIndPdf === 'S' ? 'Sí' : 'No'
        }
      })

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new()
      
      // Crear hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      // Configurar ancho de columnas para que cada una tenga su tamaño apropiado
      const columnWidths = [
        { wch: 12 },  // ID - un poco más ancho para números largos
        { wch: 18 },  // Días Transcurridos - para texto como "Mismo día", "Pendiente"
        { wch: 12 },  // Páginas - para "X págs"
        { wch: 20 },  // Rango de Páginas - para "1 a 10 páginas", "Más de 30 páginas"
        { wch: 25 },  // Tipo de Audiencia - nombres largos de audiencias
        { wch: 30 },  // Creado por - nombres completos de usuarios
        { wch: 22 },  // Fecha de Audiencia - formato fecha y hora
        { wch: 22 },  // Fecha Acta Generada - formato fecha y hora
        { wch: 18 },  // Fecha Creación - formato fecha y hora
        { wch: 20 },  // Enviado a Despacho - formato fecha y hora o "No enviado"
        { wch: 18 },  // Descargado - formato fecha y hora o "No descargado"
        { wch: 10 }   // PDF - "Sí" o "No"
      ]
      
      worksheet['!cols'] = columnWidths
      
      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Actas Subidas SIJ')
      
      // Generar archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      
      // Crear y descargar archivo
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `actas-subidas-sij-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Archivo Excel descargado exitosamente')
    } catch (error) {
      console.error('Error al descargar archivo:', error)
      toast.error('Error al descargar el archivo')
    } finally {
      setIsDownloadingExcel(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actas Subidas al SIJ</h1>
          <p className="text-gray-600 mt-1">
            Gestión y monitoreo de actas sincronizadas con el Sistema Integrado Judicial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/actas-subidas-sij/histograma')}
          >
            <IconChartBar className="h-4 w-4 mr-2" />
            Ver Histograma
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadExcel}
            disabled={isDownloadingExcel || isLoading}
          >
            <IconDownload className="h-4 w-4 mr-2" />
            {isDownloadingExcel ? 'Descargando...' : 'Descargar Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasCards />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Días Transcurridos</label>
              <Select
                value={filtroDiasTranscurridos}
                onValueChange={(value) => setFiltroDiasTranscurridos(value as FiltroDiasTranscurridos)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="mismoDia">Mismo día</SelectItem>
                  <SelectItem value="unoADiezDias">1 a 10 días</SelectItem>
                  <SelectItem value="onceAVeinteDias">11 a 20 días</SelectItem>
                  <SelectItem value="masDeVeinteDias">Más de 20 días</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones de Sincronización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabase className="h-5 w-5" />
            Sincronización con SIJ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleAbrirModal}
              disabled={isLoadingMatching}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <IconSettings className="h-4 w-4 mr-2" />
              {isLoadingMatching ? 'Sincronizando...' : 'Sincronizar con Matching'}
            </Button>
            <Badge variant="outline" className="text-sm">
              Total: {total} registros
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Actas */}
      <DataTable
        columns={columns}
        data={actas}
        isLoading={isLoading || isLoadingAll}
        total={total}
        page={currentPage}
        limit={pageSize}
        totalPages={totalPagesFiltered}
        onPageChange={setCurrentPage}
        onLimitChange={setPageSize}
      />

      {/* Información adicional */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <IconRefresh className="h-4 w-4" />
              <span>Error al cargar los datos. Intenta actualizar la página.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmación */}
      <ConfirmarSincronizacionModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onConfirm={handleConfirmarSincronizacion}
        isLoading={isLoadingMatching}
      />
    </div>
  )
}
