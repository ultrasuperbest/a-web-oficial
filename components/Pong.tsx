// components/Pong.tsx (versión corregida)
'use client'

import { useEffect, useRef } from 'react'

interface PongProps {
  onClose: () => void
}

export default function Pong({ onClose }: PongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const w = canvas.width = 800
    const h = canvas.height = 400
    
    // Estado del juego
    let ball = { x: w/2, y: h/2, dx: 5, dy: 3, r: 6 }
    let p1 = 30, p2 = w - 50, paddleH = 80
    let score1 = 0, score2 = 0
    
    const keys = new Set<string>()
    
    // CORREGIDO: Funciones con un solo parámetro
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      keys.add(e.key)
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      keys.delete(e.key)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    const gameLoop = setInterval(() => {
      // Movimiento palas
      if (keys.has('w') || keys.has('W')) p1 = Math.max(0, p1 - 8)
      if (keys.has('s') || keys.has('S')) p1 = Math.min(h - paddleH, p1 + 8)
      if (keys.has('ArrowUp')) p2 = Math.max(0, p2 - 8)
      if (keys.has('ArrowDown')) p2 = Math.min(h - paddleH, p2 + 8)
      
      // Física bola
      ball.x += ball.dx
      ball.y += ball.dy
      
      // Rebotes paredes
      if (ball.y < 0 || ball.y > h) ball.dy *= -1
      
      // Colisiones palas
      if (ball.x < 50 && ball.y > p1 && ball.y < p1 + paddleH) ball.dx = Math.abs(ball.dx)
      if (ball.x > w - 70 && ball.y > p2 && ball.y < p2 + paddleH) ball.dx = -Math.abs(ball.dx)
      
      // Puntos y reset
      if (ball.x < 0) { 
        score2++; 
        ball = { x: w/2, y: h/2, dx: 5, dy: 3, r: 6 }
      }
      if (ball.x > w) { 
        score1++; 
        ball = { x: w/2, y: h/2, dx: -5, dy: 3, r: 6 }
      }
      
      // Render
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 48px monospace'
      ctx.fillText(`${score1}  ${score2}`, w/2-70, 70)
      ctx.fillRect(20, p1, 10, paddleH)
      ctx.fillRect(w-30, p2, 10, paddleH)
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2)
      ctx.fill()
      ctx.setLineDash([10, 15])
      ctx.beginPath()
      ctx.moveTo(w/2, 0)
      ctx.lineTo(w/2, h)
      ctx.strokeStyle = '#fff'
      ctx.stroke()
    }, 1000/60)
    
    return () => {
      clearInterval(gameLoop)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white text-xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
        >
          ✕
        </button>
        <canvas ref={canvasRef} className="border border-white/20 rounded-lg shadow-2xl" />
        <div className="flex justify-between text-white/40 mt-4 text-sm font-mono px-2">
          <span>J1: W/S</span>
          <span>J2: ↑/↓</span>
        </div>
      </div>
    </div>
  )
}