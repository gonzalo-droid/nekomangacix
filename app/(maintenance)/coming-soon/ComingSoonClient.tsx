'use client'

import { useEffect, useState } from 'react'

interface Props {
  launchDate: string
}

interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 }
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    minutos: Math.floor((diff % 3600000) / 60000),
    segundos: Math.floor((diff % 60000) / 1000),
  }
}

export default function ComingSoonClient({ launchDate }: Props) {
  const target = new Date(launchDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [launchDate])

  const units = [
    { label: 'Días', value: timeLeft.dias },
    { label: 'Horas', value: timeLeft.horas },
    { label: 'Minutos', value: timeLeft.minutos },
    { label: 'Segundos', value: timeLeft.segundos },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 gap-10">
      {/* Logo / título */}
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">🐱</span>
        <h1 className="text-3xl font-bold tracking-tight text-white">NEKO MANGA CIX</h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Chiclayo · Perú</p>
      </div>

      {/* Mensaje */}
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Estamos trabajando en algo increíble</h2>
        <p className="text-gray-400">
          Nuestra tienda online está en construcción. Muy pronto podrás comprar manga y
          coleccionables directo desde aquí.
        </p>
      </div>

      {/* Countdown */}
      <div className="flex gap-4 sm:gap-8">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-4xl sm:text-5xl font-mono font-bold tabular-nums text-purple-400">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Redes sociales */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-500 text-sm">Síguenos mientras tanto</p>
        <div className="flex gap-6">
          <a
            href="https://www.instagram.com/nekomangacix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/nekomangacix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
          >
            Facebook
          </a>
          <a
            href="https://www.tiktok.com/@nekomangacix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            TikTok
          </a>
          <a
            href="https://wa.me/51924462641"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-colors text-sm"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
