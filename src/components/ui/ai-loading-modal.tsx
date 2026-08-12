"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { IconBrain, IconSparkles, IconWand } from "@tabler/icons-react"

interface AILoadingModalProps {
    isOpen: boolean
    message: string
    onClose?: () => void
}

export function AILoadingModal({ isOpen, onClose }: AILoadingModalProps) {
    const [dots, setDots] = useState("")
    const [currentStep, setCurrentStep] = useState(0)
    const [typingText, setTypingText] = useState("")
    
    const steps = useMemo(() => [
        "Cargando...",
        "Cargando...",
        "Cargando...",
        "Cargando...",
        "Cargando..."
    ], [])

    useEffect(() => {
        if (!isOpen) return

        // Animated dots
        const dotsInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? "" : prev + ".")
        }, 500)

        // Step progression
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % steps.length)
        }, 2000)

        return () => {
            clearInterval(dotsInterval)
            clearInterval(stepInterval)
        }
    }, [isOpen, steps.length])

    useEffect(() => {
        if (!isOpen) {
            setTypingText("")
            setCurrentStep(0)
            return
        }

        // Typing effect for current step
        const currentStepText = steps[currentStep]
        let index = 0
        setTypingText("")

        const typingInterval = setInterval(() => {
            if (index < currentStepText.length) {
                setTypingText(prev => prev + currentStepText[index])
                index++
            } else {
                clearInterval(typingInterval)
            }
        }, 50)

        return () => clearInterval(typingInterval)
    }, [currentStep, isOpen, steps])

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogTitle className="sr-only">
                    IA Procesando Acta Judicial
                </DialogTitle>
                <Card className="border-0 shadow-none">
                    <CardContent className="p-6">
                        <div className="text-center space-y-6">
                            {/* AI Brain Animation */}
                            <div className="relative">
                                <div className="w-20 h-20 mx-auto relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                        <IconBrain className="w-10 h-10 text-purple-600 animate-bounce" />
                                    </div>
                                    <div className="absolute -top-2 -right-2">
                                        <IconSparkles className="w-6 h-6 text-yellow-500 animate-spin" />
                                    </div>
                                    <div className="absolute -bottom-2 -left-2">
                                        <IconWand className="w-6 h-6 text-blue-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    IA Procesando tu Modelo
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Tu asistente judicial está trabajando
                                </p>
                            </div>

                            {/* Current Step */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {typingText}
                                        <span className="animate-pulse">{dots}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                ></div>
                            </div>

                            {/* Progress Text */}
                            <div className="text-xs text-gray-500">
                                Cargando...
                            </div>

                            {/* Animated Elements */}
                            <div className="flex justify-center space-x-2">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.2}s` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}
