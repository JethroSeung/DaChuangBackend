'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Plane,
  Battery,
  MapPin,
  Clock,
  User,
  Settings,
  Activity,
  Shield,
  Home,
  Wrench,
  Calendar,
  Gauge,
  Weight,
  Ruler,
  Timer,
} from 'lucide-react'
import { UAV } from '@/types/uav'
import { getStatusVariant, formatDateTime, formatNumber } from '@/lib/utils'

interface UAVDetailsProps {
  uav: UAV
  onClose: () => void
}

export function UAVDetails({ uav, onClose }: UAVDetailsProps) {
  const { t } = useTranslation(['uav', 'common'])
  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{uav.rfidTag}</h3>
            <p className="text-muted-foreground">{uav.model}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(uav.status)}>
            {uav.status}
          </Badge>
          <Badge variant={getStatusVariant(uav.operationalStatus)}>
            {uav.operationalStatus.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">RFID Tag</p>
                <p className="font-mono">{uav.rfidTag}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Owner</p>
                <p>{uav.ownerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Model</p>
                <p>{uav.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                <p className="font-mono">{uav.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                <p>{uav.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hibernate Pod</p>
                <div className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>{uav.inHibernatePod ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Technical Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weight</p>
                <div className="flex items-center space-x-1">
                  <Weight className="h-4 w-4" />
                  <span>{uav.weightKg ? `${formatNumber(uav.weightKg, 1)} kg` : 'N/A'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Flight Time</p>
                <div className="flex items-center space-x-1">
                  <Timer className="h-4 w-4" />
                  <span>{uav.maxFlightTimeMinutes ? `${uav.maxFlightTimeMinutes} min` : 'N/A'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Altitude</p>
                <div className="flex items-center space-x-1">
                  <Ruler className="h-4 w-4" />
                  <span>{uav.maxAltitudeMeters ? `${formatNumber(uav.maxAltitudeMeters)} m` : 'N/A'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Speed</p>
                <div className="flex items-center space-x-1">
                  <Gauge className="h-4 w-4" />
                  <span>{uav.maxSpeedKmh ? `${formatNumber(uav.maxSpeedKmh)} km/h` : 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battery Status */}
        {uav.batteryStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Battery className="h-5 w-5" />
                <span>Battery Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Charge Level</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          uav.batteryStatus.currentChargePercentage > 50
                            ? 'bg-green-500'
                            : uav.batteryStatus.currentChargePercentage > 20
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${uav.batteryStatus.currentChargePercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {uav.batteryStatus.currentChargePercentage}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Health</p>
                  <p>{uav.batteryStatus.healthPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Voltage</p>
                  <p>{uav.batteryStatus.voltage ? `${formatNumber(uav.batteryStatus.voltage, 1)}V` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                  <p>{uav.batteryStatus.temperatureCelsius ? `${formatNumber(uav.batteryStatus.temperatureCelsius, 1)}°C` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cycle Count</p>
                  <p>{formatNumber(uav.batteryStatus.cycleCount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(uav.batteryStatus.chargingStatus)}>
                    {uav.batteryStatus.chargingStatus}
                  </Badge>
                </div>
              </div>

              {(uav.batteryStatus.isOverheating || uav.batteryStatus.needsReplacement) && (
                <div className="space-y-2">
                  <Separator />
                  <div className="space-y-1">
                    {uav.batteryStatus.isOverheating && (
                      <Badge variant="destructive" className="mr-2">
                        Overheating
                      </Badge>
                    )}
                    {uav.batteryStatus.needsReplacement && (
                      <Badge variant="warning">
                        Needs Replacement
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Position</p>
                {uav.currentLatitude && uav.currentLongitude ? (
                  <p className="font-mono text-sm">
                    {formatNumber(uav.currentLatitude, 6)}, {formatNumber(uav.currentLongitude, 6)}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No location data</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Altitude</p>
                <p>{uav.currentAltitudeMeters ? `${formatNumber(uav.currentAltitudeMeters)} m` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Location Update</p>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {uav.lastLocationUpdate ? formatDateTime(uav.lastLocationUpdate) : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Operational Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Flight Hours</p>
                <p className="text-lg font-semibold">{formatNumber(uav.totalFlightHours, 1)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flight Cycles</p>
                <p className="text-lg font-semibold">{formatNumber(uav.totalFlightCycles)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Maintenance</p>
                <div className="flex items-center space-x-1">
                  <Wrench className="h-4 w-4" />
                  <span className="text-sm">
                    {uav.lastMaintenanceDate ? formatDateTime(uav.lastMaintenanceDate) : 'Never'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Maintenance</p>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {uav.nextMaintenanceDue ? formatDateTime(uav.nextMaintenanceDue) : 'Not scheduled'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Regions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Assigned Regions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uav.regions && uav.regions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {uav.regions.map((region) => (
                  <Badge key={region.id} variant="outline">
                    {region.regionName}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No regions assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{formatDateTime(uav.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDateTime(uav.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
