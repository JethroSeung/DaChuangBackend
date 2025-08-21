'use client'

import React, { useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import {
  Home,
  Plus,
  Minus,
  RefreshCw,
  Plane,
  Battery,
  Clock,
  Users,
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { UAV } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function HibernatePodPage() {
  const { uavs, loading, fetchUAVs, addToHibernatePod, removeFromHibernatePod } = useUAVStore()

  useEffect(() => {
    fetchUAVs()
  }, [fetchUAVs])

  const hibernatingUAVs = uavs.filter(uav => uav.inHibernatePod)
  const availableUAVs = uavs.filter(uav => !uav.inHibernatePod && uav.status !== 'ACTIVE')

  const podCapacity = 20 // Mock capacity
  const occupancyPercentage = (hibernatingUAVs.length / podCapacity) * 100

  const handleAddToHibernatePod = async (uav: UAV) => {
    const success = await addToHibernatePod(uav.id, 'pod-1')
    if (success) {
      toast.success(`${uav.rfidTag} added to hibernate pod`)
      fetchUAVs()
    } else {
      toast.error(`Failed to add ${uav.rfidTag} to hibernate pod`)
    }
  }

  const handleRemoveFromHibernatePod = async (uav: UAV) => {
    const success = await removeFromHibernatePod(uav.id)
    if (success) {
      toast.success(`${uav.rfidTag} removed from hibernate pod`)
      fetchUAVs()
    } else {
      toast.error(`Failed to remove ${uav.rfidTag} from hibernate pod`)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              Hibernate Pod
            </h1>
            <p className="text-muted-foreground">
              Manage UAV hibernation and storage
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

        {/* Pod Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pod Capacity</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hibernatingUAVs.length}/{podCapacity}</div>
              <Progress value={occupancyPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {occupancyPercentage.toFixed(1)}% occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available UAVs</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableUAVs.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready for hibernation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Battery</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hibernatingUAVs.length > 0
                  ? Math.round(hibernatingUAVs.reduce((sum, uav) => sum + uav.batteryLevel, 0) / hibernatingUAVs.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Hibernating UAVs
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Hibernating UAVs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Hibernating UAVs ({hibernatingUAVs.length})
              </CardTitle>
              <CardDescription>
                UAVs currently in the hibernate pod
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hibernatingUAVs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No UAVs in hibernate pod</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hibernatingUAVs.map((uav) => (
                    <div
                      key={uav.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <Plane className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{uav.rfidTag}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Battery className="h-3 w-3" />
                            <span>{uav.batteryLevel}%</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{new Date(uav.lastSeen).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromHibernatePod(uav)}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available UAVs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Available UAVs ({availableUAVs.length})
              </CardTitle>
              <CardDescription>
                UAVs that can be added to hibernate pod
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableUAVs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No UAVs available for hibernation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableUAVs.slice(0, 10).map((uav) => (
                    <div
                      key={uav.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-50 rounded-md">
                          <Plane className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{uav.rfidTag}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Badge variant="outline">{uav.status}</Badge>
                            <Battery className="h-3 w-3" />
                            <span>{uav.batteryLevel}%</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToHibernatePod(uav)}
                        disabled={hibernatingUAVs.length >= podCapacity}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}

                  {availableUAVs.length > 10 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-muted-foreground">
                        And {availableUAVs.length - 10} more...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pod Status Alert */}
        {occupancyPercentage > 90 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Pod Nearly Full</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700">
                The hibernate pod is {occupancyPercentage.toFixed(1)}% full.
                Consider removing some UAVs or expanding capacity.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
