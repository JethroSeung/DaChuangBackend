'use client'

import React, { useMemo, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useChartData } from '@/stores/dashboard-store'
import { chartColors } from '@/lib/utils'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Lazy load chart components for better performance
const LazyLineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), {
  ssr: false,
  loading: () => <ChartSkeleton />
})

const LazyAreaChart = dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })), {
  ssr: false,
  loading: () => <ChartSkeleton />
})

const LazyBarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), {
  ssr: false,
  loading: () => <ChartSkeleton />
})

const LazyPieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), {
  ssr: false,
  loading: () => <ChartSkeleton />
})

// Import other recharts components dynamically
const LazyResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false })
const LazyLine = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false })
const LazyArea = dynamic(() => import('recharts').then(mod => ({ default: mod.Area })), { ssr: false })
const LazyBar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false })
const LazyPie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false })
const LazyCell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false })
const LazyXAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false })
const LazyYAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false })
const LazyCartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false })
const LazyTooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false })
const LazyLegend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend })), { ssr: false })

// Chart skeleton component for loading states
function ChartSkeleton() {
  return (
    <div className="h-80 w-full">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  )
}

// Error fallback component
function ChartErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="h-80 w-full flex items-center justify-center">
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="mt-2">
          <p className="mb-2">Failed to load chart: {error.message}</p>
          <Button onClick={retry} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Mock data for demonstration
const mockFlightTrends = [
  { time: '00:00', flights: 2, completed: 2 },
  { time: '04:00', flights: 1, completed: 1 },
  { time: '08:00', flights: 5, completed: 4 },
  { time: '12:00', flights: 8, completed: 7 },
  { time: '16:00', flights: 6, completed: 5 },
  { time: '20:00', flights: 3, completed: 3 },
]

const mockBatteryLevels = [
  { uavId: 1, rfidTag: 'UAV-001', batteryLevel: 85, status: 'HEALTHY' },
  { uavId: 2, rfidTag: 'UAV-002', batteryLevel: 92, status: 'HEALTHY' },
  { uavId: 3, rfidTag: 'UAV-003', batteryLevel: 15, status: 'LOW' },
  { uavId: 4, rfidTag: 'UAV-004', batteryLevel: 67, status: 'HEALTHY' },
  { uavId: 5, rfidTag: 'UAV-005', batteryLevel: 8, status: 'CRITICAL' },
  { uavId: 6, rfidTag: 'UAV-006', batteryLevel: 78, status: 'HEALTHY' },
]

const mockSystemLoad = [
  { timestamp: '10:00', cpuUsage: 45, memoryUsage: 62, networkUsage: 23 },
  { timestamp: '10:15', cpuUsage: 52, memoryUsage: 65, networkUsage: 28 },
  { timestamp: '10:30', cpuUsage: 48, memoryUsage: 68, networkUsage: 31 },
  { timestamp: '10:45', cpuUsage: 55, memoryUsage: 71, networkUsage: 25 },
  { timestamp: '11:00', cpuUsage: 42, memoryUsage: 69, networkUsage: 22 },
  { timestamp: '11:15', cpuUsage: 38, memoryUsage: 66, networkUsage: 19 },
]

const mockStatusDistribution = [
  { name: 'Authorized', value: 18, color: chartColors.success },
  { name: 'Unauthorized', value: 6, color: chartColors.danger },
  { name: 'Hibernating', value: 8, color: chartColors.secondary },
  { name: 'Maintenance', value: 2, color: chartColors.warning },
]

export function DashboardCharts() {
  const { data: chartData, isLoading, error, refetch } = useChartData()

  // Memoize processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    return {
      flightTrends: chartData?.flightTrends || mockFlightTrends,
      batteryLevels: chartData?.batteryLevels || mockBatteryLevels,
      systemLoad: chartData?.systemLoad || mockSystemLoad,
    }
  }, [chartData])

  // Memoize battery color function to prevent recreation on every render
  const getBatteryColor = useCallback((level: number) => {
    if (level > 50) return chartColors.success
    if (level > 20) return chartColors.warning
    return chartColors.danger
  }, [])

  // Memoize battery levels with colors to prevent recalculation
  const batteryLevelsWithColors = useMemo(() => {
    return processedData.batteryLevels.map(item => ({
      ...item,
      color: getBatteryColor(item.batteryLevel)
    }))
  }, [processedData.batteryLevels, getBatteryColor])

  // Handle loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={index < 2 ? "lg:col-span-2" : ""}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <ChartSkeleton />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <ChartErrorFallback
              error={error}
              retry={() => refetch()}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Flight Activity Trends */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Flight Activity Trends</CardTitle>
          <CardDescription>
            Flight activity over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flightTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke={chartColors.success}
                  fill={chartColors.success}
                  fillOpacity={0.6}
                  name="Completed Flights"
                />
                <Area
                  type="monotone"
                  dataKey="flights"
                  stackId="2"
                  stroke={chartColors.primary}
                  fill={chartColors.primary}
                  fillOpacity={0.6}
                  name="Total Flights"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Battery Levels */}
      <Card>
        <CardHeader>
          <CardTitle>UAV Battery Levels</CardTitle>
          <CardDescription>
            Current battery status across the fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryLevels} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="rfidTag" type="category" width={80} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, 'Battery Level']}
                  labelFormatter={(label) => `UAV: ${label}`}
                />
                <Bar
                  dataKey="batteryLevel"
                  fill={(entry) => getBatteryColor(entry.batteryLevel)}
                  name="Battery Level"
                >
                  {batteryLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBatteryColor(entry.batteryLevel)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* UAV Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>UAV Status Distribution</CardTitle>
          <CardDescription>
            Current distribution of UAV statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>
            Real-time system resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemLoad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpuUsage"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  name="CPU Usage"
                  dot={{ fill: chartColors.primary }}
                />
                <Line
                  type="monotone"
                  dataKey="memoryUsage"
                  stroke={chartColors.warning}
                  strokeWidth={2}
                  name="Memory Usage"
                  dot={{ fill: chartColors.warning }}
                />
                <Line
                  type="monotone"
                  dataKey="networkUsage"
                  stroke={chartColors.info}
                  strokeWidth={2}
                  name="Network Usage"
                  dot={{ fill: chartColors.info }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
