"use client"

import { useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"

interface EfficiencyData {
  generation: number
  transmission: number
  overall: number
}

interface EfficiencyMetersProps {
  data: EfficiencyData
  detailed?: boolean
}

export default function EfficiencyMeters({ data, detailed = false }: EfficiencyMetersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawGauge = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    value: number,
    label: string,
  ) => {
    const startAngle = Math.PI * 1.2
    const endAngle = Math.PI * 1.8
    const valueAngle = startAngle + (endAngle - startAngle) * (value / 100)

    // Background arc
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(x, y, radius, startAngle, endAngle)
    ctx.stroke()

    // Value arc
    const color = value > 90 ? "#10b981" : value > 75 ? "#f59e0b" : "#ef4444"
    ctx.strokeStyle = color
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(x, y, radius, startAngle, valueAngle)
    ctx.stroke()

    // Center text
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${value.toFixed(1)}%`, x, y - 5)

    ctx.font = "12px sans-serif"
    ctx.fillText(label, x, y + 15)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, rect.width, rect.height)

    if (detailed) {
      // Draw three gauges
      const gaugeRadius = 40
      const gaugeY = rect.height / 2

      drawGauge(ctx, rect.width * 0.2, gaugeY, gaugeRadius, data.generation, "Generation")
      drawGauge(ctx, rect.width * 0.5, gaugeY, gaugeRadius, data.transmission, "Transmission")
      drawGauge(ctx, rect.width * 0.8, gaugeY, gaugeRadius, data.overall, "Overall")
    } else {
      // Draw single overall gauge
      drawGauge(ctx, rect.width / 2, rect.height / 2, 50, data.overall, "System Efficiency")
    }
  }, [data, detailed])

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full h-32" style={{ width: "100%", height: detailed ? "200px" : "128px" }} />

      {detailed && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Generation Efficiency</span>
              <span>{data.generation.toFixed(1)}%</span>
            </div>
            <Progress value={data.generation} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Transmission Efficiency</span>
              <span>{data.transmission.toFixed(1)}%</span>
            </div>
            <Progress value={data.transmission} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall System Efficiency</span>
              <span>{data.overall.toFixed(1)}%</span>
            </div>
            <Progress value={data.overall} className="h-2" />
          </div>
        </div>
      )}
    </div>
  )
}
