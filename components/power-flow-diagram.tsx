"use client"

import { useEffect, useRef } from "react"

interface PowerFlowData {
  generation: number
  transmission: number
  distribution: number
  consumption: number
}

interface PowerFlowDiagramProps {
  data: PowerFlowData
  detailed?: boolean
}

export default function PowerFlowDiagram({ data, detailed = false }: PowerFlowDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw power flow diagram
    const width = rect.width
    const height = rect.height
    const centerY = height / 2

    // Define positions
    const positions = {
      generation: { x: 50, y: centerY },
      transmission: { x: width * 0.35, y: centerY },
      distribution: { x: width * 0.65, y: centerY },
      consumption: { x: width - 50, y: centerY },
    }

    // Draw connections
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3

    const connections = [
      ["generation", "transmission"],
      ["transmission", "distribution"],
      ["distribution", "consumption"],
    ]

    connections.forEach(([from, to]) => {
      const fromPos = positions[from as keyof typeof positions]
      const toPos = positions[to as keyof typeof positions]

      ctx.beginPath()
      ctx.moveTo(fromPos.x + 30, fromPos.y)
      ctx.lineTo(toPos.x - 30, toPos.y)
      ctx.stroke()

      // Draw flow animation (simplified)
      const flowValue = data[from as keyof PowerFlowData]
      const intensity = Math.min(flowValue / 1000, 1)

      ctx.fillStyle = `rgba(59, 130, 246, ${intensity})`
      const flowX = fromPos.x + 30 + (toPos.x - fromPos.x - 60) * 0.5
      ctx.beginPath()
      ctx.arc(flowX, fromPos.y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw nodes
    Object.entries(positions).forEach(([key, pos]) => {
      const value = data[key as keyof PowerFlowData]
      const intensity = Math.min(value / 1000, 1)

      // Node circle
      ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Node label
      ctx.fillStyle = "#1e293b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), pos.x, pos.y - 35)

      // Value
      ctx.font = "bold 10px sans-serif"
      ctx.fillText(`${value.toFixed(1)} kW`, pos.x, pos.y + 45)
    })

    if (detailed) {
      // Draw efficiency indicators
      ctx.fillStyle = "#10b981"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      const efficiency = ((data.consumption / data.generation) * 100).toFixed(1)
      ctx.fillText(`Overall Efficiency: ${efficiency}%`, width / 2, height - 20)
    }
  }, [data, detailed])

  return (
    <div className="relative w-full h-64">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
