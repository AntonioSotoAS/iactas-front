// Script de diagnóstico para identificar problemas de configuración

export interface DiagnosticResult {
  success: boolean
  message: string
  details?: string | Record<string, unknown>
}

export class DiagnosticUtils {
  static async checkEnvironmentVariables(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    // Verificar API Key de Gemini
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!geminiKey) {
      results.push({
        success: false,
        message: "API Key de Gemini no configurada",
        details: "Crea un archivo .env.local con NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key"
      })
    } else if (geminiKey === "your_gemini_api_key_here") {
      results.push({
        success: false,
        message: "API Key de Gemini no válida",
        details: "Reemplaza 'your_gemini_api_key_here' con tu API key real"
      })
    } else {
      results.push({
        success: true,
        message: "API Key de Gemini configurada correctamente"
      })
    }

    // Verificar URL de API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      results.push({
        success: false,
        message: "URL de API no configurada",
        details: "Crea un archivo .env.local con NEXT_PUBLIC_API_URL=http://localhost:3001/api"
      })
    } else {
      results.push({
        success: true,
        message: "URL de API configurada correctamente",
        details: apiUrl
      })
    }

    return results
  }

  static async checkGeminiAPI(): Promise<DiagnosticResult> {
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!geminiKey || geminiKey === "your_gemini_api_key_here") {
      return {
        success: false,
        message: "API Key de Gemini no válida"
      }
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: "Hola, esto es una prueba." }]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          message: "Error al conectar con Gemini API",
          details: `Status: ${response.status}, Error: ${errorText}`
        }
      }

      const data = await response.json()
      if (data.error) {
        return {
          success: false,
          message: "Error en respuesta de Gemini",
          details: data.error
        }
      }

      return {
        success: true,
        message: "Conexión con Gemini API exitosa"
      }
    } catch (error) {
      return {
        success: false,
        message: "Error de red al conectar con Gemini",
        details: error instanceof Error ? error.message : "Error desconocido"
      }
    }
  }

  static async checkBackendAPI(): Promise<DiagnosticResult> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      return {
        success: false,
        message: "URL de API no configurada"
      }
    }

    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })

      if (!response.ok) {
        return {
          success: false,
          message: "Backend no responde correctamente",
          details: `Status: ${response.status}`
        }
      }

      return {
        success: true,
        message: "Backend responde correctamente"
      }
    } catch (error) {
      return {
        success: false,
        message: "No se puede conectar al backend",
        details: error instanceof Error ? error.message : "Error desconocido"
      }
    }
  }

  static async runFullDiagnostic(): Promise<{
    environment: DiagnosticResult[]
    gemini: DiagnosticResult
    backend: DiagnosticResult
  }> {
    const environment = await this.checkEnvironmentVariables()
    const gemini = await this.checkGeminiAPI()
    const backend = await this.checkBackendAPI()

    return {
      environment,
      gemini,
      backend
    }
  }
}

