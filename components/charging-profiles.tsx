"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Car, Battery, Clock, Zap } from "lucide-react"

interface ChargingStation {
  id: string
  name: string
  status: "charging" | "available" | "offline"
  currentPower: number
  maxPower: number
  vehicleType: string
  chargeLevel: number
  timeRemaining: number
}

export default function ChargingProfiles() {
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate mock charging station data
  useEffect(() => {
    const generateStations = () => {
      const stations: ChargingStation[] = []
      for (let i = 1; i <= 12; i++) {
        const isCharging = Math.random() > 0.3
        const isOffline = Math.random() > 0.9

        stations.push({
          id: `CS-${i.toString().padStart(3, "0")}`,
          name: `Station ${i}`,
          status: isOffline ? "offline" : isCharging ? "charging" : "available",
          currentPower: isCharging ? 20 + Math.random() * 130 : 0,
          maxPower: 150,
          vehicleType: ["Tesla Model 3", "BMW i3", "Nissan Leaf", "Audi e-tron"][Math.floor(Math.random() * 4)],
          chargeLevel: isCharging ? 20 + Math.random() * 60 : 0,
          timeRemaining: isCharging ? Math.floor(Math.random() * 180) : 0,
        })
      }
      return stations
    }

    setChargingStations(generateStations())

    const interval = setInterval(() => {
      setChargingStations((prev) =>
        prev.map((station) => {
          if (station.status === "charging") {
            const newChargeLevel = Math.min(station.chargeLevel + Math.random() * 2, 100)
            const newTimeRemaining = Math.max(station.timeRemaining - 1, 0)

            return {
              ...station,
              chargeLevel: newChargeLevel,
              timeRemaining: newTimeRemaining,
              currentPower: newChargeLevel < 80 ? station.currentPower : station.currentPower * 0.8,
              status: newChargeLevel >= 100 ? "available" : "charging",
            }
          }
          return station
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Draw charging profile chart
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

    // Draw charging profile over 24 hours
    const width = rect.width
    const height = rect.height
    const padding = 40

    // Draw axes
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw grid
    for (let i = 0; i <= 24; i += 4) {
      const x = padding + (i / 24) * (width - 2 * padding)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()

      // Hour labels
      ctx.fillStyle = "#64748b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${i}:00`, x, height - padding + 15)
    }

    // Generate charging profile data
    const profileData = []
    for (let hour = 0; hour < 24; hour++) {
      let demand = 0

      // Peak hours: 7-9 AM and 5-8 PM
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
        demand = 800 + Math.random() * 400
      } else if (hour >= 22 || hour <= 6) {
        // Night charging (cheaper rates)
        demand = 1200 + Math.random() * 600
      } else {
        demand = 200 + Math.random() * 300
      }

      profileData.push(demand)
    }

    // Draw charging demand curve
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.beginPath()

    profileData.forEach((demand, hour) => {
      const x = padding + (hour / 24) * (width - 2 * padding)
      const y = height - padding - (demand / 2000) * (height - 2 * padding)

      if (hour === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Fill area under curve
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    profileData.forEach((demand, hour) => {
      const x = padding + (hour / 24) * (width - 2 * padding)
      const y = height - padding - (demand / 2000) * (height - 2 * padding)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Y-axis labels
    ctx.fillStyle = "#64748b"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "right"
    for (let i = 0; i <= 2000; i += 500) {
      const y = height - padding - (i / 2000) * (height - 2 * padding)
      ctx.fillText(`${i} kW`, padding - 10, y + 3)
    }

    // Title
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("24-Hour Charging Demand Profile", width / 2, 25)
  }, [chargingStations])

  const totalPower = chargingStations.reduce((sum, station) => sum + station.currentPower, 0)
  const activeStations = chargingStations.filter((s) => s.status === "charging").length
  const availableStations = chargingStations.filter((s) => s.status === "available").length
  const offlineStations = chargingStations.filter((s) => s.status === "offline").length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Power</p>
                <p className="text-2xl font-bold">{totalPower.toFixed(1)} kW</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeStations}</p>
              </div>
              <Battery className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Available</p>
                <p className="text-2xl font-bold text-blue-600">{availableStations}</p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Offline</p>
                <p className="text-2xl font-bold text-red-600">{offlineStations}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Demand Profile</TabsTrigger>
          <TabsTrigger value="stations">Station Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Charging Demand Profile</CardTitle>
              <CardDescription>24-hour charging demand pattern showing peak and off-peak usage</CardDescription>
            </CardHeader>
            <CardContent>
              <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chargingStations.map((station) => (
              <Card key={station.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{station.name}</CardTitle>
                    <Badge
                      variant={
                        station.status === "charging"
                          ? "default"
                          : station.status === "available"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {station.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">ID: {station.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {station.status === "charging" && (
                    <>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Vehicle: {station.vehicleType}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Charge Level</span>
                          <span>{station.chargeLevel.toFixed(1)}%</span>
                        </div>
                        <Progress value={station.chargeLevel} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Power Output</span>
                          <span>{station.currentPower.toFixed(1)} kW</span>
                        </div>
                        <Progress value={(station.currentPower / station.maxPower) * 100} className="h-2" />
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Time remaining: {Math.floor(station.timeRemaining / 60)}h {station.timeRemaining % 60}m
                      </div>
                    </>
                  )}

                  {station.status === "available" && (
                    <div className="text-center py-4 text-slate-500">
                      <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ready for charging</p>
                    </div>
                  )}

                  {station.status === "offline" && (
                    <div className="text-center py-4 text-red-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Station offline</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Utilization Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Station Utilization</span>
                    <span>{((activeStations / chargingStations.length) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(activeStations / chargingStations.length) * 100} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Power Utilization</span>
                    <span>{((totalPower / (chargingStations.length * 150)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(totalPower / (chargingStations.length * 150)) * 100} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Charge Level</span>
                    <span>
                      {(
                        chargingStations
                          .filter((s) => s.status === "charging")
                          .reduce((sum, s) => sum + s.chargeLevel, 0) / activeStations || 0
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      chargingStations
                        .filter((s) => s.status === "charging")
                        .reduce((sum, s) => sum + s.chargeLevel, 0) / activeStations || 0
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{((totalPower * 24) / 1000).toFixed(1)} MWh</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Projected daily consumption</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Peak demand (estimated):</span>
                    <span>{(totalPower * 1.5).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Off-peak demand:</span>
                    <span>{(totalPower * 0.6).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average session time:</span>
                    <span>2.5 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
