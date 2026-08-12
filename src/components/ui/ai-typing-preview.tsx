"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { IconBrain, IconSparkles } from "@tabler/icons-react"

interface AITypingPreviewProps {
    content: string
    isTyping: boolean
    onTypingComplete?: () => void
    onProgressChange?: (progress: number) => void
    wordsPerStep?: number // Configuración de palabras por paso
}

export function AITypingPreview({ 
    content, 
    isTyping, 
    onTypingComplete, 
    onProgressChange,
    wordsPerStep = 6 // Aumentado a 6 palabras por paso
}: AITypingPreviewProps) {
    const [displayedContent, setDisplayedContent] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const [progress, setProgress] = useState(0)
    const animationFrameRef = useRef<number | null>(null)
    const currentWordIndexRef = useRef(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const lastUpdateTimeRef = useRef(0)

    // Dividir el contenido en palabras
    const words = content.split(/\s+/)

    // Handle cursor blinking
    useEffect(() => {
        if (!isTyping) return

        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 500)

        return () => clearInterval(cursorInterval)
    }, [isTyping])



    // Handle typing animation with auto-scroll (por palabras)
    useEffect(() => {
        
        // Clear any existing animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }

        if (!isTyping) {
            // Si no está escribiendo, mostrar todo el contenido
            setDisplayedContent(content)
            setProgress(100)
            currentWordIndexRef.current = words.length
            return
        }

        // Reset for new typing session
        setDisplayedContent("")
        setProgress(0)
        currentWordIndexRef.current = 0
        lastUpdateTimeRef.current = 0

        const animate = (currentTime: number) => {
            // Check if enough time has passed (150ms between batches for faster typing)
            if (currentTime - lastUpdateTimeRef.current >= 150) {
                if (currentWordIndexRef.current >= words.length) {
                    // Typing complete
                    setDisplayedContent(content)
                    setProgress(100)
                    onProgressChange?.(100)
                    onTypingComplete?.()
                    return
                }

                // Agregar palabras por lotes
                const endIndex = Math.min(currentWordIndexRef.current + wordsPerStep, words.length)
                const newWords = words.slice(0, endIndex)
                setDisplayedContent(newWords.join(" "))
                currentWordIndexRef.current = endIndex
                lastUpdateTimeRef.current = currentTime
                
                // Reportar progreso
                const currentProgress = Math.round((currentWordIndexRef.current / words.length) * 100)
                setProgress(currentProgress)
                onProgressChange?.(currentProgress)
                
                // Auto-scroll to bottom
                if (scrollRef.current) {
                    setTimeout(() => {
                        if (scrollRef.current) {
                            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
                        }
                    }, 10)
                }
            }

            // Continue animation
            if (currentWordIndexRef.current < words.length) {
                animationFrameRef.current = requestAnimationFrame(animate)
            }
        }

        // Start animation
        animationFrameRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
        }
    }, [isTyping, content, onTypingComplete, onProgressChange, wordsPerStep, words])

    return (
        <div className="relative">
            {/* AI Typing Indicator */}
            {isTyping && (
                <div className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-purple-200">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <IconBrain className="w-4 h-4 text-purple-600 animate-pulse" />
                            <IconSparkles className="absolute -top-1 -right-1 w-2 h-2 text-yellow-500 animate-spin" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                            IA escribiendo
                        </span>
                        <div className="flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Preview with Auto-scroll */}
            <div 
                ref={scrollRef}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 max-h-[600px] overflow-y-auto shadow-inner scroll-smooth"
            >
                <div className="prose max-w-none prose-headings:mt-4 prose-p:leading-7 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayedContent}
                    </ReactMarkdown>
                </div>
                
                {/* Typing Cursor */}
                {isTyping && showCursor && (
                    <span className="inline-block w-0.5 h-5 bg-purple-500 animate-pulse ml-1"></span>
                )}
            </div>

            {/* Progress Indicator */}
            {isTyping && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Progreso de escritura</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    )
}
