'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  MapPin,
  RefreshCw,
  Plane,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { DockingStation } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// Mock docking stations data
const mockDockingStations: DockingStation[] = [
  {
    id: 'ds-1',
    name: 'Station Alpha',
    location: { latitude: 39.9042, longitude: 116.4074, timestamp: new Date().toISOString() },
    status: 'ACTIVE',
    capacity: 8,
    currentOccupancy: 5,
    uavs: [],
    chargingPorts: [
      { id: 'port-1', portNumber: 1, status: 'CHARGING', uavId: 'uav-1', chargingStartTime: new Date().toISOString() },
      { id: 'port-2', portNumber: 2, status: 'CHARGING', uavId: 'uav-2', chargingStartTime: new Date().toISOString() },
      { id: 'port-3', portNumber: 3, status: 'OCCUPIED', uavId: 'uav-3' },
      { id: 'port-4', portNumber: 4, status: 'OCCUPIED', uavId: 'uav-4' },
      { id: 'port-5', portNumber: 5, status: 'OCCUPIED', uavId: 'uav-5' },
      { id: 'port-6', portNumber: 6, status: 'AVAILABLE' },
      { id: 'port-7', portNumber: 7, status: 'AVAILABLE' },
      { id: 'port-8', portNumber: 8, status: 'ERROR' },
    ],
  },
  {
    id: 'ds-2',
    name: 'Station Beta',
    location: { latitude: 39.9142, longitude: 116.4174, timestamp: new Date().toISOString() },
    status: 'ACTIVE',
    capacity: 6,
    currentOccupancy: 2,
    uavs: [],
    chargingPorts: [
      { id: 'port-9', portNumber: 1, status: 'CHARGING', uavId: 'uav-6', chargingStartTime: new Date().toISOString() },
      { id: 'port-10', portNumber: 2, status: 'OCCUPIED', uavId: 'uav-7' },
      { id: 'port-11', portNumber: 3, status: 'AVAILABLE' },
      { id: 'port-12', portNumber: 4, status: 'AVAILABLE' },
      { id: 'port-13', portNumber: 5, status: 'AVAILABLE' },
      { id: 'port-14', portNumber: 6, status: 'AVAILABLE' },
    ],
  },
  {
    id: 'ds-3',
    name: 'Station Gamma',
    location: { latitude: 39.8942, longitude: 116.3974, timestamp: new Date().toISOString() },
    status: 'MAINTENANCE',
    capacity: 10,
    currentOccupancy: 0,
    uavs: [],
    chargingPorts: [],
  },
]

export default function DockingStationsPage() {
  const { t } = useTranslation(['docking', 'common'])
  const { uavs, loading, fetchUAVs } = useUAVStore()
  const [dockingStations] = useState<DockingStation[]>(mockDockingStations)

  useEffect(() => {
    fetchUAVs()
  }, [fetchUAVs])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600'
      case 'MAINTENANCE':
        return 'text-yellow-600'
      case 'OFFLINE':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircle
      case 'MAINTENANCE':
        return Clock
      case 'OFFLINE':
        return AlertTriangle
      default:
        return AlertTriangle
    }
  }

  const getPortStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800'
      case 'CHARGING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalCapacity = dockingStations.reduce((sum, station) => sum + station.capacity, 0)
  const totalOccupancy = dockingStations.reduce((sum, station) => sum + station.currentOccupancy, 0)
  const activeStations = dockingStations.filter(station => station.status === 'ACTIVE').length
  const chargingPorts = dockingStations.flatMap(station => station.chargingPorts).filter(port => port.status === 'CHARGING').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              Docking Stations
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage UAV docking station network
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUAVs}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dockingStations.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeStations} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOccupancy}/{totalCapacity}</div>
              <Progress value={(totalOccupancy / totalCapacity) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {((totalOccupancy / totalCapacity) * 100).toFixed(1)}% occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Charging</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chargingPorts}</div>
              <p className="text-xs text-muted-foreground">
                Active charging ports
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Availability</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity - totalOccupancy}</div>
              <p className="text-xs text-muted-foreground">
                Available ports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Docking Stations List */}
        <div className="grid gap-6 lg:grid-cols-2">
          {dockingStations.map((station) => {
            const StatusIcon = getStatusIcon(station.status)
            const occupancyPercentage = (station.currentOccupancy / station.capacity) * 100

            return (
              <Card key={station.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={cn('h-5 w-5', getStatusColor(station.status))} />
                      <span>{station.name}</span>
                    </div>
                    <Badge variant={station.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {station.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Location: {station.location.latitude.toFixed(4)}, {station.location.longitude.toFixed(4)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Capacity Overview */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Capacity</span>
                      <span>{station.currentOccupancy}/{station.capacity}</span>
                    </div>
                    <Progress value={occupancyPercentage} />
                  </div>

                  {/* Charging Ports */}
                  {station.chargingPorts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Charging Ports</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {station.chargingPorts.map((port) => (
                          <div
                            key={port.id}
                            className={cn(
                              'p-2 rounded text-center text-xs font-medium',
                              getPortStatusColor(port.status)
                            )}
                          >
                            <div>Port {port.portNumber}</div>
                            <div className="text-xs opacity-75">
                              {port.status}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Port Status Legend */}
                      <div className="flex flex-wrap gap-2 mt-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-100 rounded"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-100 rounded"></div>
                          <span>Occupied</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                          <span>Charging</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-100 rounded"></div>
                          <span>Error</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Station Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      View on Map
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Zap className="h-4 w-4 mr-1" />
                      Manage Ports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Maintenance Alert */}
        {dockingStations.some(station => station.status === 'MAINTENANCE') && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Maintenance Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                {dockingStations.filter(station => station.status === 'MAINTENANCE').length} docking station(s)
                require maintenance. Please check the affected stations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
