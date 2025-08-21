'use client'

import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Battery,
  MapPin,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  flightHours: {
    total: number
    thisMonth: number
    change: number
  }
  missionSuccess: {
    rate: number
    total: number
    successful: number
    change: number
  }
  batteryEfficiency: {
    average: number
    change: number
  }
  coverage: {
    area: number
    change: number
  }
  topPerformers: Array<{
    uavRfid: string
    flightHours: number
    successRate: number
    missions: number
  }>
  recentTrends: Array<{
    date: string
    flights: number
    successRate: number
    avgDuration: number
  }>
}

// Mock analytics data
const mockAnalytics: AnalyticsData = {
  flightHours: {
    total: 1247,
    thisMonth: 156,
    change: 12.5
  },
  missionSuccess: {
    rate: 94.2,
    total: 342,
    successful: 322,
    change: 2.1
  },
  batteryEfficiency: {
    average: 87.3,
    change: -1.2
  },
  coverage: {
    area: 2847,
    change: 8.7
  },
  topPerformers: [
    { uavRfid: 'UAV-001', flightHours: 89, successRate: 96.8, missions: 45 },
    { uavRfid: 'UAV-003', flightHours: 76, successRate: 94.1, missions: 38 },
    { uavRfid: 'UAV-002', flightHours: 71, successRate: 92.3, missions: 41 },
    { uavRfid: 'UAV-005', flightHours: 68, successRate: 95.7, missions: 35 },
    { uavRfid: 'UAV-004', flightHours: 63, successRate: 91.2, missions: 33 }
  ],
  recentTrends: [
    { date: '2025-08-20', flights: 12, successRate: 95.8, avgDuration: 45 },
    { date: '2025-08-19', flights: 15, successRate: 93.3, avgDuration: 52 },
    { date: '2025-08-18', flights: 8, successRate: 100, avgDuration: 38 },
    { date: '2025-08-17', flights: 11, successRate: 90.9, avgDuration: 47 },
    { date: '2025-08-16', flights: 14, successRate: 92.9, avgDuration: 41 }
  ]
}

export default function AnalyticsPage() {
  const [analytics] = useState<AnalyticsData>(mockAnalytics)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const formatChange = (change: number) => {
    const isPositive = change > 0
    return (
      <div className={cn("flex items-center space-x-1", 
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {Math.abs(change)}%
        </span>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Performance metrics and operational insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flight Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.flightHours.total}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {analytics.flightHours.thisMonth} this month
                </p>
                {formatChange(analytics.flightHours.change)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mission Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.missionSuccess.rate}%</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {analytics.missionSuccess.successful}/{analytics.missionSuccess.total} missions
                </p>
                {formatChange(analytics.missionSuccess.change)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battery Efficiency</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.batteryEfficiency.average}%</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Average efficiency
                </p>
                {formatChange(analytics.batteryEfficiency.change)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage Area</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.coverage.area}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Square kilometers
                </p>
                {formatChange(analytics.coverage.change)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Top Performing UAVs</span>
              </CardTitle>
              <CardDescription>
                UAVs ranked by flight hours and success rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformers.map((uav, index) => (
                  <div key={uav.uavRfid} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{uav.uavRfid}</p>
                        <p className="text-sm text-muted-foreground">
                          {uav.missions} missions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{uav.flightHours}h</p>
                      <p className="text-sm text-green-600">{uav.successRate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Daily flight activity and performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentTrends.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(day.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {day.flights} flights
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {day.successRate}% success
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {day.avgDuration}min avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              Key insights and recommendations based on recent data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Strengths</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• High mission success rate (94.2%)</li>
                  <li>• Consistent flight operations</li>
                  <li>• Good battery efficiency</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">Areas for Improvement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Battery efficiency declining</li>
                  <li>• Some UAVs underutilized</li>
                  <li>• Weather impact on operations</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Schedule battery maintenance</li>
                  <li>• Optimize flight routes</li>
                  <li>• Increase training frequency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
