'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUpload } from '@/hooks/use-upload'
import { UploadFileDto, UploadResponse } from '@/store/api/uploadApi'

interface UploadFileProps {
  onUploadSuccess?: (upload: UploadResponse) => void
  tipo?: UploadFileDto['tipo']
  descripcion?: string
  ruta_personalizada?: string
  nombre_personalizado?: string
  className?: string
}

export function UploadFile({
  onUploadSuccess,
  tipo = 'documento',
  descripcion,
  ruta_personalizada,
  nombre_personalizado,
  className
}: UploadFileProps) {
  const [file, setFile] = useState<File | null>(null)
  const { uploadFile, isUploading } = useUpload()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      return
    }

    const uploadFileDto: UploadFileDto = {
      tipo,
      descripcion,
      ruta_personalizada,
      nombre_personalizado,
    }

    const result = await uploadFile(file, uploadFileDto)
    
    if (result) {
      onUploadSuccess?.(result)
      setFile(null)
      // Limpiar el input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>📤 Subir Archivo</CardTitle>
        <CardDescription>
          Selecciona un archivo para subirlo al servidor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-input">Seleccionar archivo</Label>
          <Input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
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
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? 'Subiendo...' : 'Subir Archivo'}
        </Button>
      </CardContent>
    </Card>
  )
} 