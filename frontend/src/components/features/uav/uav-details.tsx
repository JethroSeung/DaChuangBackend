'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
            <p className="text-muted-foreground">{uav.region || 'No region assigned'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(uav.status)}>
            {uav.status}
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
                <p className="text-sm font-medium text-muted-foreground">Region</p>
                <p>{uav.region || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Battery Level</p>
                <p>{uav.batteryLevel}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p>{new Date(uav.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p>{new Date(uav.createdAt).toLocaleString()}</p>
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
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <div className="flex items-center space-x-1">
                  <span className="font-mono">{uav.id}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center space-x-1">
                  <Badge variant={getStatusVariant(uav.status)}>
                    {uav.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Battery Level</p>
                <div className="flex items-center space-x-1">
                  <span>{uav.batteryLevel}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Hibernate Pod</p>
                <div className="flex items-center space-x-1">
                  <span>{uav.inHibernatePod ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



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
                <p className="text-sm font-medium text-muted-foreground">Region</p>
                <p>{uav.region || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hibernate Pod Status</p>
                <p>{uav.inHibernatePod ? 'In Pod' : 'Not in Pod'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(uav.updatedAt).toLocaleString()}
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
            {uav.region ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {uav.region}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">No region assigned</p>
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
