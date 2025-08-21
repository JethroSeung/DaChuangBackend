'use client'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plane,
  Battery,
  Shield,
  AlertTriangle,
  Activity,
  MapPin,
  RefreshCw,
  Home,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useUAVStore } from '@/stores/uav-store'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function MobileDashboard() {
  const { t } = useTranslation(['dashboard', 'common'])
  const {
    metrics,
    alerts,
    loading,
    systemHealth,
    fetchDashboardData,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
  } = useDashboardStore()

  const { stats, fetchStats } = useUAVStore()

  useEffect(() => {
    fetchDashboardData()
    fetchStats()
  }, [fetchDashboardData, fetchStats])

  const handleRefresh = () => {
    fetchDashboardData()
    fetchStats()
    toast.success(t('common:dashboardRefreshed'))
  }

  const unacknowledgedAlerts = getUnacknowledgedAlerts()
  const criticalAlerts = getCriticalAlerts()

  const quickStats = [
    {
      title: t('dashboard:totalUAVs'),
      value: stats?.total || metrics?.totalUAVs || 0,
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/uavs',
    },
    {
      title: t('dashboard:activeFlights'),
      value: metrics?.activeFlights || 0,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/map',
    },
    {
      title: t('dashboard:lowBattery'),
      value: stats?.lowBattery || metrics?.lowBatteryCount || 0,
      icon: Battery,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/battery',
    },
    {
      title: t('dashboard:alerts'),
      value: unacknowledgedAlerts.length,
      icon: AlertTriangle,
      color: criticalAlerts.length > 0 ? 'text-red-600' : 'text-yellow-600',
      bgColor: criticalAlerts.length > 0 ? 'bg-red-50' : 'bg-yellow-50',
      href: '/dashboard#alerts',
    },
  ]

  const systemStatus = [
    {
      title: 'Authorized',
      value: stats?.authorized || metrics?.authorizedUAVs || 0,
      icon: Shield,
      color: 'text-green-600',
    },
    {
      title: 'Hibernating',
      value: stats?.hibernating || metrics?.hibernatingUAVs || 0,
      icon: Home,
      color: 'text-blue-600',
    },
    {
      title: 'Charging',
      value: stats?.charging || metrics?.chargingCount || 0,
      icon: Zap,
      color: 'text-yellow-600',
    },
  ]

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-orbitron">Dashboard</h1>
          <p className="text-sm text-muted-foreground">UAV Fleet Overview</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={cn('p-2 rounded-md', stat.bgColor)}>
                      <Icon className={cn('h-5 w-5', stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {systemStatus.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-5 w-5', item.color)} />
                  <span className="font-medium">{item.title}</span>
                </div>
                <Badge variant="outline">{item.value}</Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Recent Alerts</span>
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-4">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
              <p className="text-sm text-muted-foreground">No recent alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'HIGH' ? 'bg-orange-50 border-orange-200' :
                    'bg-yellow-50 border-yellow-200'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}

              {alerts.length > 3 && (
                <div className="text-center">
                  <Button variant="link" size="sm">
                    View all alerts
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/uavs">
                <Plane className="h-4 w-4 mr-2" />
                UAVs
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/map">
                <MapPin className="h-4 w-4 mr-2" />
                Map
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/hibernate-pod">
                <Home className="h-4 w-4 mr-2" />
                Hibernate
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/battery">
                <Battery className="h-4 w-4 mr-2" />
                Battery
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
