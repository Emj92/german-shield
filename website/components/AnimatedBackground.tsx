'use client'

import { useEffect, useRef } from 'react'

interface Shape {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  speedX: number
  speedY: number
  type: 'circle' | 'triangle' | 'square'
  color: string
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas-Größe setzen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Farben: Türkis und Pink
    const colors = ['#22D6DD', '#EC4899']

    // Shapes generieren
    const shapes: Shape[] = []
    const shapeCount = 15

    for (let i = 0; i < shapeCount; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 80 + 40, // 40-120px
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        type: ['circle', 'triangle', 'square'][Math.floor(Math.random() * 3)] as Shape['type'],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Zeichenfunktionen
    const drawCircle = (shape: Shape) => {
      ctx.beginPath()
      ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2)
      ctx.fillStyle = shape.color
      ctx.fill()
    }

    const drawTriangle = (shape: Shape) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.rotate(shape.rotation)
      ctx.beginPath()
      ctx.moveTo(0, -shape.size / 2)
      ctx.lineTo(shape.size / 2, shape.size / 2)
      ctx.lineTo(-shape.size / 2, shape.size / 2)
      ctx.closePath()
      ctx.fillStyle = shape.color
      ctx.fill()
      ctx.restore()
    }

    const drawSquare = (shape: Shape) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.rotate(shape.rotation)
      ctx.fillStyle = shape.color
      ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)
      ctx.restore()
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 0.08 // 8% Sichtbarkeit (etwas weniger als Portal)

      shapes.forEach((shape) => {
        // Position aktualisieren
        shape.x += shape.speedX
        shape.y += shape.speedY
        shape.rotation += shape.rotationSpeed

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size

        // Zeichnen
        switch (shape.type) {
          case 'circle':
            drawCircle(shape)
            break
          case 'triangle':
            drawTriangle(shape)
            break
          case 'square':
            drawSquare(shape)
            break
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: 'transparent', zIndex: 1 }}
    />
  )
}

