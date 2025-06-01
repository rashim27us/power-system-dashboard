"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Activity,
  Zap,
  Gauge,
  Cloud,
  Car,
  Power,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"
import PowerFlowDiagram from "@/components/power-flow-diagram"
import EfficiencyMeters from "@/components/efficiency-meters"
import WeatherOverlay from "@/components/weather-overlay"
import SystemVisualization3D from "@/components/system-visualization-3d"
import ChargingProfiles from "@/components/charging-profiles"

// Simulated real-time data generator
const generatePowerSystemData = () => {
  const baseTime = Date.now()
  const { generation, transmission, distribution, consumption } = (() => {
    const generation = 50 + Math.random() * 100
    // Apply transmission loss (2-5%)
    const transmissionLoss = 0.02 + Math.random() * 0.03
    const transmission = generation * (1 - transmissionLoss)

    // Apply distribution loss (3-7%)
    const distributionLoss = 0.03 + Math.random() * 0.04
    const distribution = transmission * (1 - distributionLoss)

    // Apply consumption loss (1-2%)
    const consumptionLoss = 0.01 + Math.random() * 0.01
    const consumption = distribution * (1 - consumptionLoss)

    return {
      generation,
      transmission,
      distribution,
      consumption,
    }
  })()

  return {
    timestamp: baseTime,
    powerFlow: {
      generation,
      transmission,
      distribution,
      consumption,
    },
    efficiency: {
      // Calculate actual efficiency percentages
      generation: 92 + Math.random() * 6,
      transmission: 95 + Math.random() * 3,
      overall: (consumption / generation) * 100, // Actual end-to-end efficiency
    },
    weather: {
      temperature: 22 + Math.random() * 10,
      windSpeed: 5 + Math.random() * 15,
      solarIrradiance: 600 + Math.random() * 400,
      humidity: 45 + Math.random() * 30,
    },
    alerts: Math.random() > 0.8 ? ["High transmission load detected"] : [],
  }
}

export default function PowerSystemDashboard() {
  const [data, setData] = useState(generatePowerSystemData())
  const [isRealTime, setIsRealTime] = useState(true)
  const [updateInterval, setUpdateInterval] = useState(30000) // Changed from 2000ms to 30000ms (30s)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isRealTime) return

    const interval = setInterval(() => {
      setData(generatePowerSystemData())
    }, updateInterval)

    return () => clearInterval(interval)
  }, [isRealTime, updateInterval])

  const handleRefresh = () => {
    setData(generatePowerSystemData())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Power System Dashboard</h1>
              </div>
              {data.alerts.length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {data.alerts.length} Alert{data.alerts.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Real-time</span>
                <Switch checked={isRealTime} onCheckedChange={setIsRealTime} />
                {isRealTime ? (
                  <Play className="h-4 w-4 text-green-500" />
                ) : (
                  <Pause className="h-4 w-4 text-slate-500" />
                )}
              </div>

              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Refresh
              </Button>

              <div className="text-sm text-slate-500">
                Last updated: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Generation</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.powerFlow.generation.toFixed(1)} kW
                  </p>
                </div>
                <Power className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">System Efficiency</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.efficiency.overall.toFixed(1)}%
                  </p>
                </div>
                <Gauge className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Weather Impact</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.weather.temperature.toFixed(1)}°C
                  </p>
                </div>
                <Cloud className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Loads</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.floor(data.powerFlow.consumption / 10)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="powerflow">Power Flow</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="charging">Charging</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Power Flow Overview</span>
                  </CardTitle>
                  <CardDescription>Real-time power generation and distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <PowerFlowDiagram data={data.powerFlow} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5" />
                    <span>System Efficiency</span>
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <EfficiencyMeters data={data.efficiency} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>3D System Visualization</span>
                </CardTitle>
                <CardDescription>Interactive 3D representation of the power system</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemVisualization3D data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="powerflow">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Power Flow Analysis</CardTitle>
                <CardDescription>
                  Comprehensive view of power generation, transmission, and distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PowerFlowDiagram data={data.powerFlow} detailed={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Monitoring</CardTitle>
                <CardDescription>Real-time efficiency metrics and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <EfficiencyMeters data={data.efficiency} detailed={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather">
            <Card>
              <CardHeader>
                <CardTitle>Weather Impact Analysis</CardTitle>
                <CardDescription>Environmental conditions affecting power system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherOverlay data={data.weather} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charging">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>EV Charging Profiles</span>
                </CardTitle>
                <CardDescription>Electric vehicle charging patterns and energy consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <ChargingProfiles />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Panel */}
        {isRealTime && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Real-time Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Update Interval: {(updateInterval/1000).toFixed(0)}s
                </span>
                <Slider
                  value={[updateInterval]}
                  onValueChange={(value) => setUpdateInterval(value[0])}
                  max={60000} // 60 seconds (1 minute)
                  min={30000} // 30 seconds
                  step={5000}  // 5 second increments
                  className="flex-1 max-w-xs"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
