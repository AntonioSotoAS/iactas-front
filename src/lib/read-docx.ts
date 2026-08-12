import mammoth from 'mammoth'

/**
 * Verifica si un archivo DOCX es válido
 */
function isValidDocxFile(arrayBuffer: ArrayBuffer): boolean {
  try {
    const view = new Uint8Array(arrayBuffer)
    
    // Verificar tamaño mínimo
    if (view.length < 100) {
      return false
    }
    
    // Verificar firma ZIP (DOCX es un ZIP)
    const zipSignature = [0x50, 0x4B, 0x03, 0x04] // PK\x03\x04
    const hasValidSignature = zipSignature.every((byte, index) => view[index] === byte)
    
    if (!hasValidSignature) {
      return false
    }
    
    // Verificar que contenga archivos típicos de DOCX
    const bufferString = new TextDecoder().decode(view.slice(0, 1000))
    const hasDocxFiles = bufferString.includes('word/') || 
                        bufferString.includes('[Content_Types].xml') ||
                        bufferString.includes('_rels/.rels')
    
    return hasDocxFiles
    
  } catch (error) {
    console.error('❌ Error al validar archivo DOCX:', error)
    return false
  }
}

/**
 * Función de prueba para verificar archivos DOCX sin usar mammoth
 */
export async function testDocxFile(file: File): Promise<{ isValid: boolean; details: string }> {
  try {
    
    // Verificar tamaño
    if (file.size === 0) {
      return { isValid: false, details: 'Archivo vacío' }
    }
    
    // Verificar extensión
    const extension = file.name.toLowerCase().split('.').pop()
    if (extension !== 'docx') {
      return { isValid: false, details: `Extensión incorrecta: .${extension}` }
    }
    
    // Leer buffer
    const arrayBuffer = await file.arrayBuffer()
    
    if (arrayBuffer.byteLength < 100) {
      return { isValid: false, details: 'Buffer demasiado pequeño' }
    }
    
    // Verificar firma ZIP
    const view = new Uint8Array(arrayBuffer)
    const zipSignature = [0x50, 0x4B, 0x03, 0x04]
    const hasValidSignature = zipSignature.every((byte, index) => view[index] === byte)
    
    if (!hasValidSignature) {
      return { isValid: false, details: 'Firma ZIP incorrecta' }
    }
    
    // Verificar contenido DOCX
    const bufferString = new TextDecoder().decode(view.slice(0, 1000))
    const hasWordFolder = bufferString.includes('word/')
    const hasContentTypes = bufferString.includes('[Content_Types].xml')
    const hasRels = bufferString.includes('_rels/.rels')
    
    const isValidDocx = hasWordFolder || hasContentTypes || hasRels
    
    if (!isValidDocx) {
      return { isValid: false, details: 'No contiene archivos típicos de DOCX' }
    }
    
    // Intentar con mammoth para ver si falla
    try {
      const result = await mammoth.extractRawText({ arrayBuffer })
      const hasText = result.value && result.value.trim().length > 0

      return { 
        isValid: true, 
        details: `Archivo válido. Texto extraído: ${result.value?.length || 0} caracteres${hasText ? '' : ' (sin texto legible)'}` 
      }
      
    } catch (mammothError) {
      console.error('❌ Error de mammoth:', mammothError)
      return { 
        isValid: false, 
        details: `Archivo ZIP válido pero mammoth falló: ${mammothError instanceof Error ? mammothError.message : 'Error desconocido'}` 
      }
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error)
    return { 
      isValid: false, 
      details: `Error general: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }
  }
}

/**
 * Función para diagnosticar archivos DOCX de manera detallada
 */
export async function diagnoseDocxFile(file: File): Promise<{
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
}> {
  const diagnostics = {
    fileSize: file.size,
    hasCorrectExtension: file.name.toLowerCase().endsWith('.docx'),
    hasZipSignature: false,
    zipStructure: [] as string[],
    contentTypes: [] as string[],
    wordDocument: false,
    mammothError: undefined as string | undefined
  }

  try {
    // 1. Verificar firma ZIP
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    const zipSignature = [0x50, 0x4B, 0x03, 0x04] // PK\x03\x04
    
    diagnostics.hasZipSignature = zipSignature.every((byte, index) => uint8Array[index] === byte)
    
    if (!diagnostics.hasZipSignature) {
      return {
        isValid: false,
        details: 'El archivo no tiene la firma ZIP válida (PK\x03\x04)',
        diagnostics
      }
    }

    // 2. Intentar leer como ZIP para ver la estructura
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(buffer)
      
      // Obtener lista de archivos en el ZIP
      diagnostics.zipStructure = Object.keys(zipContent.files)
      
      // Verificar archivos típicos de DOCX
      const requiredFiles = [
        '[Content_Types].xml',
        '_rels/.rels',
        'word/document.xml'
      ]
      
      const hasRequiredFiles = requiredFiles.every(file => 
        diagnostics.zipStructure.some(zipFile => zipFile.includes(file))
      )
      
      diagnostics.wordDocument = hasRequiredFiles
      
      // Verificar Content_Types.xml
      if (zipContent.files['[Content_Types].xml']) {
        try {
          const contentTypesXml = await zipContent.files['[Content_Types].xml'].async('string')
          diagnostics.contentTypes = contentTypesXml.split('\n')
            .filter(line => line.includes('ContentType'))
            .map(line => line.trim())
        } catch {
          // No se pudo leer [Content_Types].xml
        }
      }
      
    } catch (zipError) {
      console.error('❌ Error al leer como ZIP:', zipError)
      return {
        isValid: false,
        details: `Error al leer estructura ZIP: ${zipError instanceof Error ? zipError.message : 'Error desconocido'}`,
        diagnostics
      }
    }

    // 3. Intentar con mammoth para ver el error específico
    try {
      await mammoth.extractRawText({ arrayBuffer: buffer })
    } catch (mammothError) {
      diagnostics.mammothError = mammothError instanceof Error ? mammothError.message : 'Error desconocido'
      console.error('❌ Error específico de mammoth:', diagnostics.mammothError)
    }

    // 4. Evaluar resultado
    if (!diagnostics.wordDocument) {
      return {
        isValid: false,
        details: 'El archivo ZIP no contiene la estructura típica de un documento Word',
        diagnostics
      }
    }

    if (diagnostics.mammothError) {
      return {
        isValid: false,
        details: `El archivo tiene estructura DOCX válida pero mammoth no puede leerlo: ${diagnostics.mammothError}`,
        diagnostics
      }
    }

    return {
      isValid: true,
      details: 'Archivo DOCX válido y legible',
      diagnostics
    }

  } catch (error) {
    return {
      isValid: false,
      details: `Error general en diagnóstico: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      diagnostics
    }
  }
}

export async function readDocxFile(file: File): Promise<string> {
  try {
    
    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      throw new Error('El archivo está vacío')
    }

    // Validar extensión
    const fileExtension = file.name.toLowerCase().split('.').pop()
    if (fileExtension !== 'docx') {
      throw new Error(`El archivo debe ser .docx, recibido: .${fileExtension}`)
    }

    // Obtener buffer y validar
    const arrayBuffer = await file.arrayBuffer()
    
    if (arrayBuffer.byteLength < 100) {
      throw new Error('El archivo es demasiado pequeño para ser un DOCX válido')
    }

    // Verificar integridad del archivo
    if (!isValidDocxFile(arrayBuffer)) {
      throw new Error('El archivo no es un DOCX válido o está corrupto')
    }

    // Intentar extraer texto con mammoth
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    if (!result.value) {
      throw new Error('No se pudo extraer texto del documento')
    }

    const text = result.value.trim()
    
    if (text.length === 0) {
      throw new Error('El documento no contiene texto')
    }

    return text

  } catch (error) {
    console.error('❌ Error al leer archivo DOCX con mammoth:', error)
    
    // Si mammoth falla, intentar con método alternativo
    try {
      return await readDocxFileAlternative(file)
    } catch (alternativeError) {
      console.error('❌ Error en método alternativo:', alternativeError)
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('Can\'t find end of central directory')) {
          throw new Error('El archivo DOCX está corrupto o no es un archivo válido. Verifica que el archivo se haya descargado correctamente.')
        }
        if (error.message.includes('Invalid file signature')) {
          throw new Error('El archivo no es un documento Word válido (.docx)')
        }
        throw new Error(`Error al procesar el archivo: ${error.message}`)
      }
      
      throw new Error('Error desconocido al procesar el archivo DOCX')
    }
  }
}

/**
 * Método alternativo para leer archivos DOCX usando una aproximación diferente
 */
async function readDocxFileAlternative(file: File): Promise<string> {
  try {
    
    // Crear un nuevo File object para evitar problemas de referencia
    const newFile = new File([file], file.name, { type: file.type })
    
    // Intentar con diferentes opciones de mammoth
    const arrayBuffer = await newFile.arrayBuffer()
    
    // Opción 1: Sin opciones adicionales
    try {
      const result = await mammoth.extractRawText({ arrayBuffer })
      if (result.value && result.value.trim()) {
        return result.value.trim()
      }
    } catch {
      // Opción 1 falló, intentando opción 2
    }
    
    // Opción 2: Con opciones básicas
    try {
      const result = await mammoth.extractRawText({ 
        arrayBuffer
      })
      if (result.value && result.value.trim()) {
        return result.value.trim()
      }
    } catch {
      // Opción 2 falló, intentando opción 3
    }
    
    // Opción 3: Convertir a HTML primero
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer })
      if (result.value && result.value.trim()) {
        // Convertir HTML a texto plano
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = result.value
        const text = tempDiv.textContent || tempDiv.innerText || ''
        if (text.trim()) {
          return text.trim()
        }
      }
    } catch {
      // Opción 3 falló
    }
    
    throw new Error('No se pudo extraer texto del documento con ningún método')
    
  } catch (error) {
    console.error('❌ Error en método alternativo:', error)
    throw error
  }
}
