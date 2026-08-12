import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface TranscriptionSegment {
  id: string
  text: string
  timestamp: number
  confidence: number
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: Array<{
    isFinal: boolean
    0: { transcript: string }
  }>
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface UseTranscriptionReturn {
  isRecording: boolean
  isPaused: boolean
  transcription: TranscriptionSegment[]
  currentText: string
  recordingTime: number
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  clearTranscription: () => void
  formatTime: (seconds: number) => string
}

export function useTranscription(): UseTranscriptionReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([])
  const [currentText, setCurrentText] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<unknown>(null)

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as unknown as { webkitSpeechRecognition: new() => SpeechRecognition }).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'es-ES'
      
             recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          const newSegment: TranscriptionSegment = {
            id: Date.now().toString(),
            text: finalTranscript,
            timestamp: recordingTime,
            confidence: 0.9
          }
          setTranscription(prev => [...prev, newSegment])
          setCurrentText("")
        } else {
          setCurrentText(interimTranscript)
        }
      }
      
             recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Error en reconocimiento de voz:', event.error)
        if (event.error !== 'no-speech') {
          toast.error('Error en el reconocimiento de voz')
        }
      }
      
      recognition.onend = () => {
        // Reiniciar reconocimiento si aún está grabando
        if (isRecording && !isPaused && recognitionRef.current) {
          try {
            (recognitionRef.current as SpeechRecognition).start()
          } catch (error) {
            console.error('Error al reiniciar reconocimiento:', error)
          }
        }
      }
      
      recognitionRef.current = recognition
    } else {
      toast.error('El reconocimiento de voz no está disponible en este navegador')
    }
  }, [recordingTime, isRecording, isPaused])

  // Manejar el tiempo de grabación
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording, isPaused])

  const startRecording = useCallback(async () => {
    try {
      // Verificar si el navegador soporta getDisplayMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast.error('Tu navegador no soporta captura de audio del sistema. Usa Chrome, Firefox o Edge.')
        return
      }

      let stream: MediaStream

      // Intentar diferentes configuraciones para capturar audio del sistema
      try {
        // Primera opción: getDisplayMedia con audio específico
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100,
            channelCount: 2
          },
          video: false
        })
             } catch (error: unknown) {
         if (error instanceof Error && error.name === 'NotSupportedError') {
           // Segunda opción: getDisplayMedia con audio simple
           try {
             stream = await navigator.mediaDevices.getDisplayMedia({ 
               audio: true,
               video: false
             })
           } catch (error2: unknown) {
             if (error2 instanceof Error && error2.name === 'NotSupportedError') {
               // Tercera opción: getDisplayMedia sin especificar audio
               try {
                 stream = await navigator.mediaDevices.getDisplayMedia({ 
                   video: false
                 })
               } catch {
                 // Cuarta opción: getUserMedia como fallback
                 toast.info('Intentando capturar audio del micrófono como alternativa...')
                 stream = await navigator.mediaDevices.getUserMedia({ 
                   audio: {
                     echoCancellation: true,
                     noiseSuppression: true,
                     autoGainControl: true
                   }
                 })
               }
             } else {
               throw error2
             }
           }
         } else {
           throw error
         }
       }
      
      // Verificar que el stream tenga tracks de audio
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) {
        toast.error('No se detectó audio del sistema. Asegúrate de que haya audio reproduciéndose.')
        return
      }

      // Intentar diferentes formatos de audio
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav'
          }
        }
      }
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined
      })
      
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        void new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      }
      
      recorder.start(1000) // Capturar datos cada segundo
      setMediaRecorder(recorder)
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      setTranscription([])
      setCurrentText("")
      
      // Iniciar reconocimiento de voz
      if (recognitionRef.current) {
        try {
          (recognitionRef.current as SpeechRecognition).start()
        } catch (recognitionError) {
          console.warn('Error al iniciar reconocimiento de voz:', recognitionError)
          // Continuar con la grabación aunque falle el reconocimiento
        }
      }
      
      toast.success('Grabación iniciada correctamente')
    } catch (error: unknown) {
      console.error('Error al iniciar grabación:', error)
      
      // Mensajes de error más específicos
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          toast.error('No se encontró audio del sistema. Asegúrate de que haya audio reproduciéndose en tu computadora.')
        } else if (error.name === 'NotAllowedError') {
          toast.error('Permisos de captura denegados. Selecciona "Compartir audio" cuando se te solicite.')
        } else if (error.name === 'NotReadableError') {
          toast.error('El audio del sistema está siendo usado por otra aplicación.')
        } else if (error.name === 'OverconstrainedError') {
          toast.error('El audio del sistema no cumple con los requisitos.')
        } else if (error.name === 'NotSupportedError') {
          toast.error('Tu navegador no soporta captura de audio del sistema. El transcriptor intentará usar el micrófono.')
        } else {
          toast.error(`Error al capturar audio: ${error.message || 'Error desconocido'}`)
        }
      } else {
        toast.error('Error al capturar audio: Error desconocido')
      }
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
      setIsPaused(true)
      
      if (recognitionRef.current) {
        (recognitionRef.current as SpeechRecognition).stop()
      }
      
      toast.info('Grabación pausada')
    }
  }, [mediaRecorder])

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
      setIsPaused(false)
      
      if (recognitionRef.current) {
        (recognitionRef.current as SpeechRecognition).start()
      }
      
      toast.info('Grabación reanudada')
    }
  }, [mediaRecorder])

  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setMediaRecorder(null)
      setIsRecording(false)
      setIsPaused(false)
      
      if (recognitionRef.current) {
        (recognitionRef.current as SpeechRecognition).stop()
      }
      
      toast.success('Grabación finalizada')
    }
  }, [mediaRecorder])

  const clearTranscription = useCallback(() => {
    setTranscription([])
    setCurrentText("")
    setRecordingTime(0)
    toast.info('Transcripción limpiada')
  }, [])

  return {
    isRecording,
    isPaused,
    transcription,
    currentText,
    recordingTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearTranscription,
    formatTime
  }
}
