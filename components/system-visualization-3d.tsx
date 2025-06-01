"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"

interface SystemData {
  powerFlow: {
    generation: number
    transmission: number
    distribution: number
    consumption: number
  }
}

interface SystemVisualization3DProps {
  data: SystemData
}

export default function SystemVisualization3D({ data }: SystemVisualization3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })

  const draw3DSystem = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2

      // Apply transformations
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(zoom, zoom)

      // Draw 3D grid
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 1

      for (let i = -5; i <= 5; i++) {
        const offset = i * 30
        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(-150, offset)
        ctx.lineTo(150, offset)
        ctx.stroke()

        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(offset, -150)
        ctx.lineTo(offset, 150)
        ctx.stroke()
      }

      // Draw power system components in 3D perspective
      const components = [
        {
          name: "Generator 1",
          x: -100,
          y: -50,
          z: 0,
          size: 20,
          color: "#3b82f6",
          value: data.powerFlow.generation * 0.6,
        },
        {
          name: "Generator 2",
          x: -100,
          y: 50,
          z: 0,
          size: 20,
          color: "#3b82f6",
          value: data.powerFlow.generation * 0.4,
        },
        {
          name: "Transformer",
          x: 0,
          y: 0,
          z: 10,
          size: 15,
          color: "#10b981",
          value: data.powerFlow.transmission,
        },
        {
          name: "Distribution",
          x: 100,
          y: -30,
          z: 0,
          size: 12,
          color: "#f59e0b",
          value: data.powerFlow.distribution,
        },
        {
          name: "Load Center",
          x: 100,
          y: 30,
          z: 0,
          size: 12,
          color: "#ef4444",
          value: data.powerFlow.consumption,
        },
      ]

      // Sort components by z-index for proper 3D rendering
      components.sort((a, b) => a.z - b.z)

      components.forEach((component) => {
        // Apply 3D rotation (simplified)
        const rotatedX = component.x * Math.cos(rotation.y) - component.z * Math.sin(rotation.y)
        const rotatedZ = component.x * Math.sin(rotation.y) + component.z * Math.cos(rotation.y)
        const rotatedY = component.y * Math.cos(rotation.x) - rotatedZ * Math.sin(rotation.x)

        // Project to 2D
        const perspective = 300 / (300 + rotatedZ)
        const projectedX = rotatedX * perspective
        const projectedY = rotatedY * perspective

        // Draw component
        const intensity = Math.min(component.value / 500, 1)
        ctx.fillStyle = component.color
        ctx.globalAlpha = 0.3 + intensity * 0.7

        ctx.beginPath()
        ctx.arc(projectedX, projectedY, component.size * perspective, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = component.color
        ctx.lineWidth = 2
        ctx.globalAlpha = 1
        ctx.stroke()

        // Draw label
        ctx.fillStyle = "#1e293b"
        ctx.font = `${10 * perspective}px sans-serif`
        ctx.textAlign = "center"
        ctx.fillText(component.name, projectedX, projectedY - component.size * perspective - 10)
        ctx.fillText(`${component.value.toFixed(1)} MW`, projectedX, projectedY + component.size * perspective + 15)
      })

      // Draw connections
      ctx.strokeStyle = "#6b7280"
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.6

      const connections = [
        [0, 2], // Gen1 to Transformer
        [1, 2], // Gen2 to Transformer
        [2, 3], // Transformer to Distribution
        [2, 4], // Transformer to Load Center
      ]

      connections.forEach(([fromIdx, toIdx]) => {
        const from = components[fromIdx]
        const to = components[toIdx]

        // Apply same 3D transformations
        const fromRotatedX = from.x * Math.cos(rotation.y) - from.z * Math.sin(rotation.y)
        const fromRotatedZ = from.x * Math.sin(rotation.y) + from.z * Math.cos(rotation.y)
        const fromRotatedY = from.y * Math.cos(rotation.x) - fromRotatedZ * Math.sin(rotation.x)
        const fromPerspective = 300 / (300 + fromRotatedZ)
        const fromProjectedX = fromRotatedX * fromPerspective
        const fromProjectedY = fromRotatedY * fromPerspective

        const toRotatedX = to.x * Math.cos(rotation.y) - to.z * Math.sin(rotation.y)
        const toRotatedZ = to.x * Math.sin(rotation.y) + to.z * Math.cos(rotation.y)
        const toRotatedY = to.y * Math.cos(rotation.x) - toRotatedZ * Math.sin(rotation.x)
        const toPerspective = 300 / (300 + toRotatedZ)
        const toProjectedX = toRotatedX * toPerspective
        const toProjectedY = toRotatedY * toPerspective

        ctx.beginPath()
        ctx.moveTo(fromProjectedX, fromProjectedY)
        ctx.lineTo(toProjectedX, toProjectedY)
        ctx.stroke()
      })

      ctx.restore()
    },
    [data, rotation, zoom]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    draw3DSystem(ctx, rect.width, rect.height)
  }, [draw3DSystem])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMouse.x
    const deltaY = e.clientY - lastMouse.y

    setRotation((prev) => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01,
    }))

    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetView = () => {
    setRotation({ x: 0, y: 0 })
    setZoom(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Interactive 3D System View</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-grab active:cursor-grabbing"
          style={{ width: "100%", height: "384px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-sm">
          <p className="font-medium">Controls:</p>
          <p>• Drag to rotate</p>
          <p>• Use zoom buttons to scale</p>
          <p>• Component intensity shows load</p>
        </div>
      </div>
    </div>
  )
}
