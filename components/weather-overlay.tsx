"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Thermometer, Wind, Sun, Droplets } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface WeatherData {
  temperature: number
  windSpeed: number
  solarIrradiance: number
  humidity: number
}

interface WeatherOverlayProps {
  data: WeatherData
}

export default function WeatherOverlay({ data }: WeatherOverlayProps) {
  const mapCanvasRef = useRef<HTMLCanvasElement>(null)
  const [updateInterval, setUpdateInterval] = useState(30000) // 30 seconds instead of 2000ms

  useEffect(() => {
    const canvas = mapCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw simplified weather map
    const width = rect.width
    const height = rect.height

    // Background gradient based on temperature
    const tempGradient = ctx.createLinearGradient(0, 0, width, 0)
    const tempIntensity = (data.temperature - 15) / 20 // Normalize 15-35°C to 0-1
    tempGradient.addColorStop(0, `rgba(59, 130, 246, ${0.3})`) // Blue for cold
    tempGradient.addColorStop(1, `rgba(239, 68, 68, ${tempIntensity * 0.5})`) // Red for hot

    ctx.fillStyle = tempGradient
    ctx.fillRect(0, 0, width, height)

    // Draw wind patterns
    ctx.strokeStyle = `rgba(34, 197, 94, ${data.windSpeed / 20})`
    ctx.lineWidth = 2

    for (let i = 0; i < 10; i++) {
      const x = (width / 10) * i + 20
      const y = height / 2 + Math.sin(i * 0.5) * 30
      const windLength = data.windSpeed * 2

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + windLength, y - 10)
      ctx.stroke()

      // Arrow head
      ctx.beginPath()
      ctx.moveTo(x + windLength, y - 10)
      ctx.lineTo(x + windLength - 5, y - 15)
      ctx.moveTo(x + windLength, y - 10)
      ctx.lineTo(x + windLength - 5, y - 5)
      ctx.stroke()
    }

    // Draw solar irradiance overlay
    const solarIntensity = data.solarIrradiance / 1000
    ctx.fillStyle = `rgba(251, 191, 36, ${solarIntensity * 0.3})`
    ctx.fillRect(0, 0, width, height)

    // Draw weather stations
    const stations = [
      { x: width * 0.2, y: height * 0.3, temp: data.temperature + Math.random() * 4 - 2 },
      { x: width * 0.5, y: height * 0.6, temp: data.temperature + Math.random() * 4 - 2 },
      { x: width * 0.8, y: height * 0.4, temp: data.temperature + Math.random() * 4 - 2 },
    ]

    stations.forEach((station) => {
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(station.x, station.y, 6, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = "#1e293b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${station.temp.toFixed(1)}°C`, station.x, station.y - 15)
    })
  }, [data])

  return (
    <div className="space-y-6">
      {/* Weather Map */}
      <div className="relative">
        <canvas
          ref={mapCanvasRef}
          className="w-full h-64 rounded-lg border"
          style={{ width: "100%", height: "256px" }}
        />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-2">
          <h3 className="font-semibold text-sm">Weather Overlay</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Real-time environmental conditions</p>
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Thermometer className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Temperature</p>
                <p className="text-xl font-bold">{data.temperature.toFixed(1)}°C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Wind className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Wind Speed</p>
                <p className="text-xl font-bold">{data.windSpeed.toFixed(1)} m/s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Sun className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Solar Irradiance</p>
                <p className="text-xl font-bold">{data.solarIrradiance.toFixed(0)} W/m²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Droplets className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Humidity</p>
                <p className="text-xl font-bold">{data.humidity.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Interval Slider */}
      <div>
        <h3 className="font-semibold mb-2">Update Interval</h3>
        <Slider
          value={[updateInterval]}
          onValueChange={(value) => setUpdateInterval(value[0])}
          max={60000} // 1 minute
          min={30000} // 30 seconds
          step={5000} // 5 second increments
        />
      </div>

      {/* Impact Analysis */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Weather Impact Analysis</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Solar Generation Impact:</span>
              <span className={data.solarIrradiance > 700 ? "text-green-600" : "text-yellow-600"}>
                {data.solarIrradiance > 700 ? "Optimal" : "Reduced"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Wind Generation Impact:</span>
              <span className={data.windSpeed > 10 ? "text-green-600" : "text-yellow-600"}>
                {data.windSpeed > 10 ? "High Output" : "Moderate Output"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cooling Load:</span>
              <span className={data.temperature > 25 ? "text-red-600" : "text-green-600"}>
                {data.temperature > 25 ? "Increased" : "Normal"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
