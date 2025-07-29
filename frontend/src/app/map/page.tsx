'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AppLayout } from '@/components/layout/app-layout'
import { AnimatedPage } from '@/components/ui/animated-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Map as MapIcon,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Plane,
  MapPin,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { UAV } from '@/types/uav'
import { cn } from '@/lib/utils'

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/features/map/interactive-map'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
)

export default function MapPage() {
  const { uavs, loading, fetchUAVs } = useUAVStore()
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

  const handleRefresh = () => {
    fetchUAVs()
  }

  const handleLayerToggle = (layer: keyof typeof mapLayers) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  const handleUAVSelect = (uav: UAV) => {
    setSelectedUAV(uav)
    if (uav.currentLatitude && uav.currentLongitude) {
      setMapCenter([uav.currentLatitude, uav.currentLongitude])
      setMapZoom(15)
    }
  }

  const filteredUAVs = uavs.filter(uav => {
    const matchesSearch = searchQuery === '' || 
      uav.rfidTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uav.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || uav.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const uavsWithLocation = filteredUAVs.filter(uav => 
    uav.currentLatitude && uav.currentLongitude
  )

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-orbitron text-foreground">
              UAV Tracking Map
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time UAV locations and operational zones
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map Controls Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Search & Filter</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search UAVs</Label>
                  <Input
                    id="search"
                    placeholder="RFID tag or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All UAVs</SelectItem>
                      <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                      <SelectItem value="UNAUTHORIZED">Unauthorized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Map Layers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Map Layers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(mapLayers).map(([layer, enabled]) => (
                  <div key={layer} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {layer === 'uavs' && <Plane className="h-4 w-4" />}
                      {layer === 'geofences' && <Shield className="h-4 w-4" />}
                      {layer === 'dockingStations' && <MapPin className="h-4 w-4" />}
                      {layer === 'flightPaths' && <MapIcon className="h-4 w-4" />}
                      {layer === 'weather' && <Settings className="h-4 w-4" />}
                      <Label className="text-sm capitalize">
                        {layer.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                    <Switch
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span>UAVs on Map</span>
                  </div>
                  <Badge variant="outline">
                    {uavsWithLocation.length}/{filteredUAVs.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  UAVs with location data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uavsWithLocation.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No UAVs with location data</p>
                    </div>
                  ) : (
                    uavsWithLocation.map((uav) => (
                      <div
                        key={uav.id}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer transition-colors',
                          selectedUAV?.id === uav.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        )}
                        onClick={() => handleUAVSelect(uav)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{uav.rfidTag}</p>
                            <p className="text-xs text-muted-foreground">
                              {uav.ownerName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge 
                              variant={uav.status === 'AUTHORIZED' ? 'success' : 'destructive'}
                              className="text-xs"
                            >
                              {uav.status}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {uav.operationalStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        {uav.currentLatitude && uav.currentLongitude && (
                          <div className="mt-2 text-xs text-muted-foreground font-mono">
                            {uav.currentLatitude.toFixed(4)}, {uav.currentLongitude.toFixed(4)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <InteractiveMap
                  uavs={uavsWithLocation}
                  selectedUAV={selectedUAV}
                  onUAVSelect={handleUAVSelect}
                  center={mapCenter}
                  zoom={mapZoom}
                  layers={mapLayers}
                  className="h-full rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </AnimatedPage>
    </AppLayout>
  )
}
