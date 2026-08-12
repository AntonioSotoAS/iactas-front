'use client'

import { useState } from 'react'
import { diagnoseDocxFile } from '@/lib/read-docx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function TestDocxPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{
    isValid: boolean
    details: string
    diagnostics: {
      fileSize: number
      hasCorrectExtension: boolean
      hasZipSignature: boolean
      zipStructure: string[]
      contentTypes: string[]
      wordDocument: boolean
      mammothError?: string
    }
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleTest = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    try {
      console.log('🧪 Iniciando diagnóstico detallado del archivo DOCX...')
      const testResult = await diagnoseDocxFile(file)
      setResult(testResult)
      
      if (testResult.isValid) {
        toast.success('Archivo DOCX válido')
      } else {
        toast.error(`Archivo inválido: ${testResult.details}`)
      }
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error)
      toast.error(`Error en diagnóstico: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔬 Diagnóstico Detallado de Archivos DOCX</CardTitle>
          <CardDescription>
            Analiza archivos DOCX para identificar problemas específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Seleccionar archivo DOCX</Label>
            <Input
              id="file"
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {file && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Archivo seleccionado:</h3>
              <p><strong>Nombre:</strong> {file.name}</p>
              <p><strong>Tamaño:</strong> {file.size} bytes</p>
              <p><strong>Tipo:</strong> {file.type}</p>
            </div>
          )}

          <Button 
            onClick={handleTest} 
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? 'Diagnosticando...' : 'Diagnosticar Archivo'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.isValid ? '✅ Archivo Válido' : '❌ Archivo Inválido'}
              </h3>
              <p className="text-sm mb-4">{result.details}</p>
              
              <div className="text-xs space-y-2">
                <h4 className="font-semibold">📊 Diagnóstico Detallado:</h4>
                <p><strong>Tamaño:</strong> {result.diagnostics.fileSize} bytes</p>
                <p><strong>Extensión correcta:</strong> {result.diagnostics.hasCorrectExtension ? '✅' : '❌'}</p>
                <p><strong>Firma ZIP:</strong> {result.diagnostics.hasZipSignature ? '✅' : '❌'}</p>
                <p><strong>Estructura Word:</strong> {result.diagnostics.wordDocument ? '✅' : '❌'}</p>
                
                {result.diagnostics.zipStructure.length > 0 && (
                  <div>
                    <p><strong>Archivos en ZIP:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      {result.diagnostics.zipStructure.slice(0, 10).map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                      {result.diagnostics.zipStructure.length > 10 && (
                        <li>... y {result.diagnostics.zipStructure.length - 10} más</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {result.diagnostics.mammothError && (
                  <p><strong>Error de Mammoth:</strong> {result.diagnostics.mammothError}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 