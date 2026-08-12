"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { IconUpload, IconFileText, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number
  placeholder?: string
  description?: string
  className?: string
}

export function FileUploader({
  onFileUpload,
  acceptedFileTypes = [".docx", ".doc", ".pdf"],
  maxFileSize = 10 * 1024 * 1024, // 10MB por defecto
  placeholder = "Arrastra tu archivo aquí",
  description = "o haz clic para seleccionar",
  className = ""
}: FileUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUploadedFile(file)
      onFileUpload(file)
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: false
  })

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <div className={`w-full ${className}`}>
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <IconUpload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {placeholder}
              </p>
              <p className="text-sm text-gray-500">
                {description}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Tipos permitidos: {acceptedFileTypes.join(", ")}
              </p>
              <p className="text-xs text-gray-400">
                Tamaño máximo: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconFileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <IconX className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
