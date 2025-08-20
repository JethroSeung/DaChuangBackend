'use client'

import React, { useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { AnimatedPage, StaggerContainer, StaggerItem, AnimatedCard } from '@/components/ui/animated-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plane,
  Battery,
  Shield,
  AlertTriangle,
  Activity,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Zap,
  Home,
  RefreshCw,
} from 'lucide-react'
import { useDashboardStore, useDashboardMetrics, useConnectionStatus } from '@/stores/dashboard-store'
import { useUAVStore } from '@/stores/uav-store'
import { cn, formatNumber, formatPercentage, formatRelativeTime } from '@/lib/utils'
import { DashboardCharts } from '@/components/features/dashboard/dashboard-charts'
import { RealtimeAlerts } from '@/components/features/dashboard/realtime-alerts'
import { SystemHealth } from '@/components/features/dashboard/system-health'
import { MobileDashboard } from '@/components/features/dashboard/mobile-dashboard'
import { useResponsive } from '@/hooks/use-responsive'

// Mock data for demonstration
const mockMetrics = {
  totalUAVs: 24,
  authorizedUAVs: 18,
  unauthorizedUAVs: 6,
  activeFlights: 3,
  hibernatingUAVs: 8,
  lowBatteryCount: 2,
  chargingCount: 5,
  maintenanceCount: 1,
  emergencyCount: 0,
}

const mockFlightActivity = {
  activeFlights: 3,
  todayFlights: 12,
  completedFlights: 9,
  flights: [
    { id: 1, uavRfid: 'UAV-001', missionName: 'Perimeter Patrol', startTime: '2024-01-15T10:30:00Z', status: 'IN_PROGRESS' },
    { id: 2, uavRfid: 'UAV-003', missionName: 'Cargo Delivery', startTime: '2024-01-15T11:15:00Z', status: 'IN_PROGRESS' },
    { id: 3, uavRfid: 'UAV-007', missionName: 'Surveillance', startTime: '2024-01-15T12:00:00Z', status: 'IN_PROGRESS' },
  ],
}

export default function DashboardPage() {
  const { isMobile } = useResponsive()
  const metrics = useDashboardMetrics()
  const connectionStatus = useConnectionStatus()
  const { updateMetrics, updateFlightActivity, fetchDashboardData } = useDashboardStore()
  const { fetchSystemStats, fetchHibernatePodStatus } = useUAVStore()

  // Use mock data for demonstration
  const displayMetrics = metrics || mockMetrics

  useEffect(() => {
    // Initialize with mock data for demonstration
    updateMetrics(mockMetrics)
    updateFlightActivity(mockFlightActivity)
    
    // Fetch real data
    fetchDashboardData()
    fetchSystemStats()
    fetchHibernatePodStatus()
  }, [updateMetrics, updateFlightActivity, fetchDashboardData, fetchSystemStats, fetchHibernatePodStatus])

  const handleRefresh = () => {
    fetchDashboardData()
    fetchSystemStats()
    fetchHibernatePodStatus()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600'
      case 'disconnected':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  // Use mobile dashboard for mobile devices
  if (isMobile) {
    return <MobileDashboard />
  }

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-orbitron text-foreground">
              UAV Control Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring and fleet management
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <Activity className={cn(
                'h-4 w-4',
                connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
              )} />
              <span className={cn(
                'text-sm font-medium',
                connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
              )}>
                {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total UAVs */}
          <StaggerItem>
            <AnimatedCard hover={true}>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total UAVs</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(displayMetrics.totalUAVs)}</div>
              <p className="text-xs text-muted-foreground">
                Fleet size
              </p>
            </CardContent>
              </Card>
            </AnimatedCard>
          </StaggerItem>

          {/* Authorized UAVs */}
          <StaggerItem>
            <AnimatedCard hover={true}>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authorized</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(displayMetrics.authorizedUAVs)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage((displayMetrics.authorizedUAVs / displayMetrics.totalUAVs) * 100)} of fleet
              </p>
            </CardContent>
              </Card>
            </AnimatedCard>
          </StaggerItem>

          {/* Active Flights */}
          <StaggerItem>
            <AnimatedCard hover={true}>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Flights</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(displayMetrics.activeFlights)}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in air
              </p>
            </CardContent>
              </Card>
            </AnimatedCard>
          </StaggerItem>

          {/* Hibernating */}
          <StaggerItem>
            <AnimatedCard hover={true}>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hibernating</CardTitle>
              <Home className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(displayMetrics.hibernatingUAVs)}
              </div>
              <p className="text-xs text-muted-foreground">
                In hibernate pod
              </p>
            </CardContent>
              </Card>
            </AnimatedCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Status Overview */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <StaggerItem>
            <AnimatedCard hover={true}>
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
              <CardDescription>
                Current system health and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unauthorized UAVs</span>
                <Badge variant={displayMetrics.unauthorizedUAVs > 0 ? 'destructive' : 'secondary'}>
                  {displayMetrics.unauthorizedUAVs}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Low Battery</span>
                <Badge variant={displayMetrics.lowBatteryCount > 0 ? 'warning' : 'secondary'}>
                  {displayMetrics.lowBatteryCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Charging</span>
                <Badge variant="info">
                  {displayMetrics.chargingCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Maintenance</span>
                <Badge variant={displayMetrics.maintenanceCount > 0 ? 'warning' : 'secondary'}>
                  {displayMetrics.maintenanceCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Emergency</span>
                <Badge variant={displayMetrics.emergencyCount > 0 ? 'destructive' : 'success'}>
                  {displayMetrics.emergencyCount}
                </Badge>
              </div>
            </CardContent>
              </Card>
            </AnimatedCard>
          </StaggerItem>

          {/* Active Flights */}
          <StaggerItem>
            <AnimatedCard hover={true}>
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plane className="h-5 w-5" />
                <span>Active Flights</span>
              </CardTitle>
              <CardDescription>
                Currently active flight missions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockFlightActivity.flights.length > 0 ? (
                <div className="space-y-3">
                  {mockFlightActivity.flights.map((flight) => (
                    <div key={flight.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{flight.missionName}</p>
                        <p className="text-xs text-muted-foreground">
                          {flight.uavRfid} • Started {formatRelativeTime(flight.startTime)}
                        </p>
                      </div>
                      <Badge variant="info">
                        {flight.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active flights</p>
                </div>
              )}
            </CardContent>
              </Card>
            </AnimatedCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Charts and Analytics */}
        <DashboardCharts />

        {/* Real-time Alerts and System Health */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StaggerItem>
            <RealtimeAlerts />
          </StaggerItem>
          <StaggerItem>
            <SystemHealth />
          </StaggerItem>
        </StaggerContainer>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used operations and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Plane className="h-6 w-6" />
                <span className="text-sm">Add UAV</span>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <MapPin className="h-6 w-6" />
                <span className="text-sm">View Map</span>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Battery className="h-6 w-6" />
                <span className="text-sm">Battery Status</span>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <AlertTriangle className="h-6 w-6" />
                <span className="text-sm">View Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </AnimatedPage>
    </AppLayout>
  )
}
