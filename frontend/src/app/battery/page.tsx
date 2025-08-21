'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Battery,
  BatteryLow,
  Zap,
  AlertTriangle,
  RefreshCw,
  Plane,
  TrendingUp,
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { cn } from '@/lib/utils'

export default function BatteryMonitorPage() {
  const { t } = useTranslation(['battery', 'common'])
  const { uavs, loading, fetchUAVs } = useUAVStore()
  const [sortBy, setSortBy] = useState<'battery' | 'name' | 'status'>('battery')
  const [filterLevel, setFilterLevel] = useState<'all' | 'low' | 'critical' | 'charging'>('all')

  useEffect(() => {
    fetchUAVs()
  }, [fetchUAVs])

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600'
    if (level > 30) return 'text-yellow-600'
    if (level > 15) return 'text-orange-600'
    return 'text-red-600'
  }

  const getBatteryIcon = (level: number, status: string) => {
    if (status === 'CHARGING') return Zap
    if (level <= 15) return BatteryLow
    return Battery
  }

  const getBatteryVariant = (level: number) => {
    if (level > 60) return 'default'
    if (level > 30) return 'secondary'
    if (level > 15) return 'outline'
    return 'destructive'
  }

  const filteredAndSortedUAVs = uavs
    .filter(uav => {
      switch (filterLevel) {
        case 'low':
          return uav.batteryLevel <= 30 && uav.batteryLevel > 15
        case 'critical':
          return uav.batteryLevel <= 15
        case 'charging':
          return uav.status === 'CHARGING'
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'battery':
          return a.batteryLevel - b.batteryLevel
        case 'name':
          return a.rfidTag.localeCompare(b.rfidTag)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const batteryStats = {
    healthy: uavs.filter(uav => uav.batteryLevel > 60).length,
    warning: uavs.filter(uav => uav.batteryLevel <= 60 && uav.batteryLevel > 30).length,
    low: uavs.filter(uav => uav.batteryLevel <= 30 && uav.batteryLevel > 15).length,
    critical: uavs.filter(uav => uav.batteryLevel <= 15).length,
    charging: uavs.filter(uav => uav.status === 'CHARGING').length,
  }

  const averageBattery = uavs.length > 0
    ? Math.round(uavs.reduce((sum, uav) => sum + uav.batteryLevel, 0) / uavs.length)
    : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              {t('battery:title')}
            </h1>
            <p className="text-muted-foreground">
              {t('battery:subtitle')}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUAVs}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            {t('common:refresh')}
          </Button>
        </div>

        {/* Battery Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('battery:healthy')}</CardTitle>
              <Battery className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{batteryStats.healthy}</div>
              <p className="text-xs text-muted-foreground">
                {t('battery:above60')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('battery:warning')}</CardTitle>
              <Battery className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{batteryStats.warning}</div>
              <p className="text-xs text-muted-foreground">
                {t('battery:range30to60')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('battery:low')}</CardTitle>
              <BatteryLow className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{batteryStats.low}</div>
              <p className="text-xs text-muted-foreground">
                {t('battery:range15to30')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('battery:critical')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{batteryStats.critical}</div>
              <p className="text-xs text-muted-foreground">
                {t('battery:below15')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('battery:charging')}</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{batteryStats.charging}</div>
              <p className="text-xs text-muted-foreground">
                {t('battery:currentlyCharging')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Average */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {t('battery:fleetBatteryAverage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">{averageBattery}%</div>
              <Progress value={averageBattery} className="flex-1" />
              <Badge variant={averageBattery > 60 ? 'default' : averageBattery > 30 ? 'secondary' : 'destructive'}>
                {averageBattery > 60 ? 'Good' : averageBattery > 30 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Sorting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Filter by Level</label>
                <Select value={filterLevel} onValueChange={(value: any) => setFilterLevel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All UAVs ({uavs.length})</SelectItem>
                    <SelectItem value="critical">Critical ({batteryStats.critical})</SelectItem>
                    <SelectItem value="low">Low ({batteryStats.low})</SelectItem>
                    <SelectItem value="charging">Charging ({batteryStats.charging})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium">Sort by</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="battery">Battery Level</SelectItem>
                    <SelectItem value="name">UAV Name</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UAV Battery List */}
        <Card>
          <CardHeader>
            <CardTitle>UAV Battery Status ({filteredAndSortedUAVs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading battery data...
              </div>
            ) : filteredAndSortedUAVs.length === 0 ? (
              <div className="text-center py-8">
                <Battery className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No UAVs match the current filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedUAVs.map((uav) => {
                  const BatteryIcon = getBatteryIcon(uav.batteryLevel, uav.status)

                  return (
                    <div
                      key={uav.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{uav.rfidTag}</h3>
                            <Badge variant="outline">{uav.status}</Badge>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Last seen: {new Date(uav.lastSeen).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right min-w-[100px]">
                          <div className="flex items-center space-x-2">
                            <BatteryIcon className={cn('h-5 w-5', getBatteryColor(uav.batteryLevel))} />
                            <span className={cn('font-semibold', getBatteryColor(uav.batteryLevel))}>
                              {uav.batteryLevel}%
                            </span>
                          </div>
                          <Progress
                            value={uav.batteryLevel}
                            className="w-20 mt-1"
                          />
                        </div>

                        <Badge variant={getBatteryVariant(uav.batteryLevel)}>
                          {uav.batteryLevel > 60 ? 'Good' :
                           uav.batteryLevel > 30 ? 'Fair' :
                           uav.batteryLevel > 15 ? 'Low' : 'Critical'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical Battery Alert */}
        {batteryStats.critical > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Critical Battery Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                {batteryStats.critical} UAV(s) have critically low battery levels (≤15%).
                Immediate charging or hibernation is recommended.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
