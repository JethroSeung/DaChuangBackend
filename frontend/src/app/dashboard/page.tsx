'use client'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout/app-layout'
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
import { useDashboardStore } from '@/stores/dashboard-store'
import { useUAVStore } from '@/stores/uav-store'
import { DashboardCharts } from '@/components/features/dashboard/dashboard-charts'
import { RealtimeAlerts } from '@/components/features/dashboard/realtime-alerts'
import { SystemHealth } from '@/components/features/dashboard/system-health'
import { MobileDashboard } from '@/components/features/dashboard/mobile-dashboard'
import { useResponsive } from '@/hooks/use-responsive'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { isMobile } = useResponsive()
  const { t } = useTranslation(['dashboard', 'common'])
  const {
    metrics,
    loading,
    error,
    fetchDashboardData,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
  } = useDashboardStore()

  const { stats, fetchStats } = useUAVStore()

  useEffect(() => {
    // Initial data fetch
    fetchDashboardData()
    fetchStats()

    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchDashboardData()
      fetchStats()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchDashboardData, fetchStats])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleRefresh = () => {
    fetchDashboardData()
    fetchStats()
    toast.success('Dashboard refreshed')
  }

  const unacknowledgedAlerts = getUnacknowledgedAlerts()
  const criticalAlerts = getCriticalAlerts()

  // Quick stats from UAV store and dashboard metrics
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

  const systemOverview = [
    {
      title: t('dashboard:unauthorizedUAVs'),
      value: stats?.authorized || metrics?.authorizedUAVs || 0,
      total: stats?.total || metrics?.totalUAVs || 0,
      icon: Shield,
      color: 'text-green-600',
    },
    {
      title: t('dashboard:hibernatingUAVs'),
      value: stats?.hibernating || metrics?.hibernatingUAVs || 0,
      total: stats?.total || metrics?.totalUAVs || 0,
      icon: Home,
      color: 'text-blue-600',
    },
    {
      title: t('dashboard:chargingUAVs'),
      value: stats?.charging || metrics?.chargingCount || 0,
      total: stats?.total || metrics?.totalUAVs || 0,
      icon: Zap,
      color: 'text-yellow-600',
    },
    {
      title: t('dashboard:maintenanceUAVs'),
      value: stats?.maintenance || metrics?.maintenanceCount || 0,
      total: stats?.total || metrics?.totalUAVs || 0,
      icon: Users,
      color: 'text-purple-600',
    },
  ]

  if (isMobile) {
    return (
      <AppLayout>
        <MobileDashboard />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              {t('dashboard:title')}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard:subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              {t('common:refresh')}
            </Button>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {metrics?.realtimeData?.lastUpdate ?
                new Date(metrics.realtimeData.lastUpdate).toLocaleTimeString() :
                'Never'
              }
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={cn('p-2 rounded-md', stat.bgColor)}>
                      <Icon className={cn('h-4 w-4', stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      Real-time data
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* System Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {systemOverview.map((item) => {
            const Icon = item.icon
            const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0

            return (
              <Card key={item.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  <Icon className={cn('h-4 w-4', item.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{percentage}% of fleet</span>
                    <Badge variant="outline" className="text-xs">
                      {item.value}/{item.total}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <SystemHealth />

            {/* Recent Alerts */}
            <RealtimeAlerts />
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and navigation shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/uavs">
                  <Plane className="h-4 w-4 mr-2" />
                  Manage UAVs
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/map">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Map
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/hibernate-pod">
                  <Home className="h-4 w-4 mr-2" />
                  Hibernate Pod
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/battery">
                  <Battery className="h-4 w-4 mr-2" />
                  Battery Monitor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
