'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plane, 
  Battery, 
  Shield, 
  AlertTriangle, 
  Activity, 
  MapPin, 
  TrendingUp, 
  Home, 
  RefreshCw,
  ChevronRight,
  MoreVertical,
  Eye,
  Settings
} from 'lucide-react'
import { cn, formatNumber, formatPercentage, formatRelativeTime } from '@/lib/utils'
import { useDashboardMetrics, useConnectionStatus } from '@/stores/enhanced-dashboard-store'
import { ResponsiveGrid, MobileCard, ResponsiveText } from '@/components/layout/mobile-responsive-layout'
import { AnimatedCard, StaggerContainer, StaggerItem } from '@/components/ui/animated-components'

// Mobile-optimized metric card
function MobileMetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'default',
  trend,
  onClick 
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend?: { value: number; label: string }
  onClick?: () => void
}) {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  }

  const bgColorClasses = {
    default: 'bg-muted',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100'
  }

  return (
    <MobileCard 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95',
        onClick && 'hover:bg-accent/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              bgColorClasses[color]
            )}>
              <Icon className={cn('h-4 w-4', colorClasses[color])} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">
                {title}
              </p>
              <p className={cn('text-lg font-bold', colorClasses[color])}>
                {formatNumber(value)}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className="text-right">
            <div className={cn(
              'text-xs font-medium',
              trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-muted-foreground'
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
            <div className="text-xs text-muted-foreground">
              {trend.label}
            </div>
          </div>
        )}
        
        {onClick && (
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
        )}
      </div>
    </MobileCard>
  )
}

// Mobile-optimized status overview
function MobileStatusOverview({ metrics }: { metrics: any }) {
  const statusItems = [
    {
      label: 'Unauthorized',
      value: metrics?.unauthorizedUAVs || 0,
      color: metrics?.unauthorizedUAVs > 0 ? 'danger' : 'default' as const
    },
    {
      label: 'Low Battery',
      value: metrics?.lowBatteryCount || 0,
      color: metrics?.lowBatteryCount > 0 ? 'warning' : 'default' as const
    },
    {
      label: 'Charging',
      value: metrics?.chargingCount || 0,
      color: 'info' as const
    },
    {
      label: 'Maintenance',
      value: metrics?.maintenanceCount || 0,
      color: metrics?.maintenanceCount > 0 ? 'warning' : 'default' as const
    },
    {
      label: 'Emergency',
      value: metrics?.emergencyCount || 0,
      color: metrics?.emergencyCount > 0 ? 'danger' : 'success' as const
    }
  ]

  return (
    <MobileCard>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">System Status</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <span className="text-xs font-medium text-muted-foreground">
                {item.label}
              </span>
              <Badge 
                variant={item.color === 'danger' ? 'destructive' : 
                        item.color === 'warning' ? 'secondary' : 
                        item.color === 'success' ? 'default' : 'outline'}
                className="text-xs"
              >
                {item.value}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </MobileCard>
  )
}

// Mobile-optimized active flights
function MobileActiveFlights({ flights }: { flights: any[] }) {
  return (
    <MobileCard>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Active Flights</h3>
          <Badge variant="outline" className="text-xs">
            {flights.length}
          </Badge>
        </div>
        
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {flights.length > 0 ? (
              flights.map((flight) => (
                <div key={flight.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{flight.missionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {flight.uavRfid} • {formatRelativeTime(flight.startTime)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {flight.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Plane className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No active flights</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </MobileCard>
  )
}

// Mobile-optimized quick actions
function MobileQuickActions() {
  const actions = [
    { icon: Plane, label: 'Add UAV', color: 'bg-blue-100 text-blue-600' },
    { icon: MapPin, label: 'View Map', color: 'bg-green-100 text-green-600' },
    { icon: Battery, label: 'Battery', color: 'bg-yellow-100 text-yellow-600' },
    { icon: AlertTriangle, label: 'Alerts', color: 'bg-red-100 text-red-600' },
  ]

  return (
    <MobileCard>
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="h-16 flex flex-col space-y-1 p-2"
            >
              <div className={cn('p-2 rounded-lg', action.color)}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </MobileCard>
  )
}

// Main mobile dashboard component
export function MobileDashboard() {
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics()
  const connectionStatus = useConnectionStatus()
  const [activeTab, setActiveTab] = useState('overview')

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

  const mockFlights = [
    { id: 1, uavRfid: 'UAV-001', missionName: 'Perimeter Patrol', startTime: '2024-01-15T10:30:00Z', status: 'IN_PROGRESS' },
    { id: 2, uavRfid: 'UAV-003', missionName: 'Cargo Delivery', startTime: '2024-01-15T11:15:00Z', status: 'IN_PROGRESS' },
    { id: 3, uavRfid: 'UAV-007', missionName: 'Surveillance', startTime: '2024-01-15T12:00:00Z', status: 'IN_PROGRESS' },
  ]

  const displayMetrics = metrics || mockMetrics

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <ResponsiveText variant="h2" className="font-orbitron">
            Dashboard
          </ResponsiveText>
          <p className="text-xs text-muted-foreground">
            Real-time fleet monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            <Activity className={cn(
              'h-3 w-3',
              connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
            )} />
            <span className={cn(
              'text-xs font-medium',
              connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
            )}>
              {connectionStatus.isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="h-8 w-8"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Tabs for mobile organization */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Key Metrics */}
          <ResponsiveGrid cols={{ sm: 2, md: 4 }}>
            <MobileMetricCard
              title="Total UAVs"
              value={displayMetrics.totalUAVs}
              subtitle="Fleet size"
              icon={Plane}
              trend={{ value: 5, label: 'vs last month' }}
            />
            <MobileMetricCard
              title="Authorized"
              value={displayMetrics.authorizedUAVs}
              subtitle={`${formatPercentage((displayMetrics.authorizedUAVs / displayMetrics.totalUAVs) * 100)} of fleet`}
              icon={Shield}
              color="success"
            />
            <MobileMetricCard
              title="Active Flights"
              value={displayMetrics.activeFlights}
              subtitle="Currently in air"
              icon={TrendingUp}
              color="info"
            />
            <MobileMetricCard
              title="Hibernating"
              value={displayMetrics.hibernatingUAVs}
              subtitle="In hibernate pod"
              icon={Home}
              color="default"
            />
          </ResponsiveGrid>

          {/* Active Flights */}
          <MobileActiveFlights flights={mockFlights} />
        </TabsContent>

        <TabsContent value="status" className="space-y-4 mt-4">
          <MobileStatusOverview metrics={displayMetrics} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4 mt-4">
          <MobileQuickActions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
