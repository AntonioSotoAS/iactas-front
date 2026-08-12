"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatearHora } from "@/lib/utils"

export function HoraFormatoEjemplo() {
  const ejemplosHoras = [
    "2025-07-09 11:00:00.0000",
    "2025-07-09 14:30:00.0000",
    "2025-07-09 09:15:00.0000",
    "2025-07-09 18:45:00.0000",
    "2025-07-09 00:00:00.0000",
    "2025-07-09 23:59:00.0000",
    "11:00:00",
    "14:30:00",
    "09:15:00",
    "18:45:00"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ejemplos de Formateo de Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Formato Original</h3>
              <div className="space-y-2">
                {ejemplosHoras.map((hora, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {hora}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Formato AM/PM</h3>
              <div className="space-y-2">
                {ejemplosHoras.map((hora, index) => (
                  <div key={index} className="text-sm font-medium bg-blue-100 p-2 rounded">
                    {formatearHora(hora)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Casos de Uso:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>11:00:00</strong> → <strong>11:00 AM</strong></li>
              <li>• <strong>14:30:00</strong> → <strong>2:30 PM</strong></li>
              <li>• <strong>09:15:00</strong> → <strong>9:15 AM</strong></li>
              <li>• <strong>18:45:00</strong> → <strong>6:45 PM</strong></li>
              <li>• <strong>00:00:00</strong> → <strong>12:00 AM</strong></li>
              <li>• <strong>23:59:00</strong> → <strong>11:59 PM</strong></li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 