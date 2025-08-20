'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { cn } from '@/lib/utils'

interface SystemMetric {
  name: string
  value: number
  status: 'healthy' | 'warning' | 'critical'
  icon: React.ReactNode
  unit: string
}

export function SystemHealth() {
  const { systemHealth } = useDashboardStore()
  const connectionStatus = { isConnected: systemHealth?.overall === 'HEALTHY' }
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 45,
      status: 'healthy',
      icon: <Cpu className="h-4 w-4" />,
      unit: '%',
    },
    {
      name: 'Memory Usage',
      value: 68,
      status: 'warning',
      icon: <MemoryStick className="h-4 w-4" />,
      unit: '%',
    },
    {
      name: 'Disk Usage',
      value: 32,
      status: 'healthy',
      icon: <HardDrive className="h-4 w-4" />,
      unit: '%',
    },
    {
      name: 'Network Load',
      value: 23,
      status: 'healthy',
      icon: <Network className="h-4 w-4" />,
      unit: '%',
    },
  ])

  const [services, setServices] = useState([
    { name: 'UAV Management API', status: 'healthy', uptime: '99.9%' },
    { name: 'WebSocket Service', status: connectionStatus.isConnected ? 'healthy' : 'critical', uptime: '98.7%' },
    { name: 'Database', status: 'healthy', uptime: '99.8%' },
    { name: 'Authentication Service', status: 'healthy', uptime: '99.5%' },
    { name: 'Map Service', status: 'healthy', uptime: '99.2%' },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        status: metric.value > 80 ? 'critical' : metric.value > 60 ? 'warning' : 'healthy',
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Update WebSocket service status based on connection
  useEffect(() => {
    setServices(prev => prev.map(service =>
      service.name === 'WebSocket Service'
        ? { ...service, status: connectionStatus.isConnected ? 'healthy' : 'critical' }
        : service
    ))
  }, [connectionStatus.isConnected])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success'
      case 'warning':
        return 'warning'
      case 'critical':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'critical':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const overallHealth = systemMetrics.every(m => m.status === 'healthy') &&
                       services.every(s => s.status === 'healthy') ? 'healthy' :
                       systemMetrics.some(m => m.status === 'critical') ||
                       services.some(s => s.status === 'critical') ? 'critical' : 'warning'

  return (
    <div className="space-y-6">
      {/* Overall System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health Overview</span>
            </div>
            <Badge variant={getStatusVariant(overallHealth) as any}>
              {overallHealth.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time system performance and service status monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <span className="text-sm font-bold">
                    {metric.value.toFixed(0)}{metric.unit}
                  </span>
                </div>
                <Progress
                  value={metric.value}
                  className={cn(
                    "h-2",
                    `[&>div]:${getProgressColor(metric.status)}`
                  )}
                />
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusVariant(metric.status) as any} className="text-xs">
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Service Status</span>
          </CardTitle>
          <CardDescription>
            Status and uptime of critical system services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {service.uptime}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(service.status) as any}>
                  {service.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5" />
            <span>Connection Status</span>
          </CardTitle>
          <CardDescription>
            Real-time connection status and network health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                {connectionStatus.isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-sm">WebSocket Connection</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                    {connectionStatus.lastUpdate && (
                      <span> • Last update: {new Date(connectionStatus.lastUpdate).toLocaleTimeString()}</span>
                    )}
                  </p>
                </div>
              </div>
              <Badge variant={connectionStatus.isConnected ? 'success' : 'destructive'}>
                {connectionStatus.isConnected ? 'ONLINE' : 'OFFLINE'}
              </Badge>
            </div>

            {connectionStatus.error && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-medium text-red-800">Connection Error</p>
                </div>
                <p className="text-xs text-red-600 mt-1">{connectionStatus.error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
