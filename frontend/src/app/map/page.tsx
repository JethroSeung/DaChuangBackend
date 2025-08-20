'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Search,
  RefreshCw,
  Layers,
  Zap,
  Home,
  Shield,
  AlertTriangle,
  Settings,
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { UAV } from '@/types'
import { InteractiveMap } from '@/components/features/map/interactive-map'
import { useResponsive } from '@/hooks/use-responsive'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MapPage() {
  const { isMobile } = useResponsive()
  const { t } = useTranslation(['map', 'common'])
  const { uavs, loading, error, fetchUAVs } = useUAVStore()

  const [selectedUAV, setSelectedUAV] = useState<UAV | null>(null)
  const [mapLayers, setMapLayers] = useState({
    uavs: true,
    geofences: true,
    dockingStations: true,
    flightPaths: false,
    weather: false,
  })
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9042, 116.4074]) // Beijing
  const [mapZoom, setMapZoom] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchUAVs()
  }, [fetchUAVs])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleRefresh = () => {
    fetchUAVs()
    toast.success(t('map:mapDataRefreshed'))
  }

  const handleLayerToggle = (layer: keyof typeof mapLayers) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  const handleUAVSelect = (uav: UAV) => {
    setSelectedUAV(uav)
    if (uav.location) {
      setMapCenter([uav.location.latitude, uav.location.longitude])
      setMapZoom(15)
    }
  }

  const filteredUAVs = uavs.filter(uav => {
    const matchesSearch = searchQuery === '' ||
      uav.rfidTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uav.region?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || uav.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'text-green-600'
      case 'UNAUTHORIZED':
        return 'text-red-600'
      case 'ACTIVE':
        return 'text-blue-600'
      case 'HIBERNATING':
        return 'text-gray-600'
      case 'CHARGING':
        return 'text-yellow-600'
      case 'MAINTENANCE':
        return 'text-purple-600'
      case 'EMERGENCY':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return Shield
      case 'UNAUTHORIZED':
        return AlertTriangle
      case 'ACTIVE':
        return MapPin
      case 'HIBERNATING':
        return Home
      case 'CHARGING':
        return Zap
      case 'MAINTENANCE':
        return Settings
      case 'EMERGENCY':
        return AlertTriangle
      default:
        return MapPin
    }
  }

  const statusCounts = {
    all: uavs.length,
    AUTHORIZED: uavs.filter(u => u.status === 'AUTHORIZED').length,
    UNAUTHORIZED: uavs.filter(u => u.status === 'UNAUTHORIZED').length,
    ACTIVE: uavs.filter(u => u.status === 'ACTIVE').length,
    HIBERNATING: uavs.filter(u => u.status === 'HIBERNATING').length,
    CHARGING: uavs.filter(u => u.status === 'CHARGING').length,
    MAINTENANCE: uavs.filter(u => u.status === 'MAINTENANCE').length,
    EMERGENCY: uavs.filter(u => u.status === 'EMERGENCY').length,
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              {t('map:title')}
            </h1>
            <p className="text-muted-foreground">
              {t('map:subtitle')}
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
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('map:searchAndFilter')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('map:searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <Label htmlFor="status-filter">{t('map:filterByStatus')}</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('map:selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('map:all')} ({statusCounts.all})</SelectItem>
                      <SelectItem value="AUTHORIZED">{t('map:authorized')} ({statusCounts.AUTHORIZED})</SelectItem>
                      <SelectItem value="UNAUTHORIZED">{t('map:unauthorized')} ({statusCounts.UNAUTHORIZED})</SelectItem>
                      <SelectItem value="ACTIVE">{t('map:active')} ({statusCounts.ACTIVE})</SelectItem>
                      <SelectItem value="HIBERNATING">{t('map:hibernating')} ({statusCounts.HIBERNATING})</SelectItem>
                      <SelectItem value="CHARGING">{t('map:charging')} ({statusCounts.CHARGING})</SelectItem>
                      <SelectItem value="MAINTENANCE">{t('map:maintenance')} ({statusCounts.MAINTENANCE})</SelectItem>
                      <SelectItem value="EMERGENCY">{t('map:emergency')} ({statusCounts.EMERGENCY})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Map Layers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  {t('map:mapLayers')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(mapLayers).map(([layer, enabled]) => (
                  <div key={layer} className="flex items-center justify-between">
                    <Label htmlFor={layer} className="capitalize">
                      {layer.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={layer}
                      checked={enabled}
                      onCheckedChange={() => handleLayerToggle(layer as keyof typeof mapLayers)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* UAV List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('map:uavs')} ({filteredUAVs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUAVs.map((uav) => {
                    const StatusIcon = getStatusIcon(uav.status)
                    return (
                      <div
                        key={uav.id}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
                          selectedUAV?.id === uav.id && 'bg-primary/10 border-primary'
                        )}
                        onClick={() => handleUAVSelect(uav)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={cn('h-4 w-4', getStatusColor(uav.status))} />
                            <span className="font-medium">{uav.rfidTag}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {uav.batteryLevel}%
                          </Badge>
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {uav.region && <div>{t('map:region')}: {uav.region}</div>}
                          {uav.location && (
                            <div>
                              {t('map:latitude')}: {uav.location.latitude.toFixed(4)},
                              {t('map:longitude')}: {uav.location.longitude.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {filteredUAVs.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      {t('map:noUAVsFound')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] lg:h-[800px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('map:interactiveMap')}</span>
                  <Badge variant="outline">
                    {filteredUAVs.filter(u => u.location).length} {t('map:uavsWithLocation')}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t('map:realtimePositions')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <InteractiveMap
                  uavs={filteredUAVs}
                  selectedUAV={selectedUAV}
                  onUAVSelect={handleUAVSelect}
                  center={mapCenter}
                  zoom={mapZoom}
                  layers={mapLayers}
                  className="h-full w-full rounded-b-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected UAV Details */}
        {selectedUAV && (
          <Card>
            <CardHeader>
              <CardTitle>{t('map:selectedUAV')}: {selectedUAV.rfidTag}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="text-sm font-medium">{t('map:status')}</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={selectedUAV.status === 'AUTHORIZED' ? 'default' : 'destructive'}>
                      {selectedUAV.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t('map:batteryLevel')}</Label>
                  <div className="mt-1">
                    <span className={cn('font-semibold',
                      selectedUAV.batteryLevel > 60 ? 'text-green-600' :
                      selectedUAV.batteryLevel > 30 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {selectedUAV.batteryLevel}%
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t('map:region')}</Label>
                  <div className="mt-1">{selectedUAV.region || t('map:notAssigned')}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t('map:lastSeen')}</Label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedUAV.lastSeen).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
