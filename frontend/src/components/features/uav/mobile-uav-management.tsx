'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  Filter,
  Plane,
  Battery,
  Shield,
  AlertTriangle,
  MapPin,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Home,
  Activity
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useUAVStore } from '@/stores/uav-store'
import { UAV, UAVStatus } from '@/types/uav'
import { MobileTable, MobileDataList } from '@/components/ui/mobile-table'
import { ResponsiveGrid, MobileCard, ResponsiveText } from '@/components/layout/mobile-responsive-layout'
import { useResponsive } from '@/hooks/use-responsive'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mobile-optimized UAV card component
function MobileUAVCard({
  uav,
  onView,
  onEdit,
  onDelete
}: {
  uav: UAV
  onView?: (uav: UAV) => void
  onEdit?: (uav: UAV) => void
  onDelete?: (uav: UAV) => void
}) {
  const getStatusColor = (status: UAVStatus) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'text-green-600 bg-green-100'
      case 'UNAUTHORIZED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-600'
    if (level > 50) return 'text-green-600'
    if (level > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <MobileCard className="cursor-pointer hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{uav.rfidTag}</h3>
              <p className="text-xs text-muted-foreground truncate">{uav.region || 'No region assigned'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={cn('text-xs', getStatusColor(uav.status))}>
              {uav.status.replace('_', ' ')}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(uav)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(uav)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(uav)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-medium truncate ml-2">Not specified</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">
                {uav.inHibernatePod ? (
                  <span className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Pod
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Active
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {uav.batteryLevel && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Battery:</span>
                <span className={cn('font-medium flex items-center gap-1', getBatteryColor(uav.batteryLevel))}>
                  <Battery className="h-3 w-3" />
                  {uav.batteryLevel}%
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated:</span>
              <span className="font-medium">{formatRelativeTime(uav.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Locate
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Status
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Config
          </Button>
        </div>
      </div>
    </MobileCard>
  )
}

// Mobile-optimized UAV stats overview
function MobileUAVStats({ uavs }: { uavs: UAV[] }) {
  const stats = React.useMemo(() => {
    const total = uavs.length
    const authorized = uavs.filter(uav => uav.status === 'AUTHORIZED').length
    const unauthorized = uavs.filter(uav => uav.status === 'UNAUTHORIZED').length
    const inPod = uavs.filter(uav => uav.inHibernatePod).length
    const lowBattery = uavs.filter(uav => uav.batteryLevel && uav.batteryLevel < 20).length

    return { total, authorized, unauthorized, inPod, lowBattery }
  }, [uavs])

  const statItems = [
    { label: 'Total', value: stats.total, icon: Plane, color: 'text-blue-600 bg-blue-100' },
    { label: 'Authorized', value: stats.authorized, icon: Shield, color: 'text-green-600 bg-green-100' },
    { label: 'Unauthorized', value: stats.unauthorized, icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
    { label: 'In Pod', value: stats.inPod, icon: Home, color: 'text-purple-600 bg-purple-100' },
    { label: 'Low Battery', value: stats.lowBattery, icon: Battery, color: 'text-yellow-600 bg-yellow-100' },
  ]

  return (
    <ResponsiveGrid cols={{ sm: 2, md: 3, lg: 5 }}>
      {statItems.map((item) => (
        <MobileCard key={item.label} padding="sm">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', item.color)}>
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </MobileCard>
      ))}
    </ResponsiveGrid>
  )
}

// Main mobile UAV management component
export function MobileUAVManagement() {
  const { uavs, loading, error, deleteUAV } = useUAVStore()
  const { isMobile } = useResponsive()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | UAVStatus>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Filter UAVs based on search and status
  const filteredUAVs = React.useMemo(() => {
    let filtered = uavs

    if (searchTerm) {
      filtered = filtered.filter(uav =>
        uav.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (uav.region && uav.region.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(uav => uav.status === filterStatus)
    }

    return filtered
  }, [uavs, searchTerm, filterStatus])

  const handleDelete = async (uav: UAV) => {
    if (window.confirm(`Are you sure you want to delete ${uav.rfidTag}?`)) {
      await deleteUAV(uav.id)
    }
  }

  const tableColumns = [
    { key: 'rfidTag', label: 'RFID Tag', sortable: true },
    { key: 'ownerName', label: 'Owner', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'status', label: 'Status', type: 'badge' as const },
    { key: 'batteryLevel', label: 'Battery', type: 'number' as const },
    { key: 'updatedAt', label: 'Updated', type: 'date' as const },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </ResponsiveGrid>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <ResponsiveText variant="h2" className="font-orbitron">
            UAV Management
          </ResponsiveText>
          <p className="text-sm text-muted-foreground">
            Manage your UAV fleet
          </p>
        </div>

        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add UAV
        </Button>
      </div>

      {/* Stats Overview */}
      <MobileUAVStats uavs={uavs} />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search UAVs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Filter Tabs */}
          <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="AUTHORIZED" className="text-xs">Authorized</TabsTrigger>
              <TabsTrigger value="UNAUTHORIZED" className="text-xs">Unauthorized</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* UAV List */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isMobile || viewMode === 'cards' ? (
        <div className="space-y-3">
          {filteredUAVs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No UAVs found</p>
              </CardContent>
            </Card>
          ) : (
            filteredUAVs.map((uav) => (
              <MobileUAVCard
                key={uav.id}
                uav={uav}
                onView={(uav) => console.log('View', uav)}
                onEdit={(uav) => console.log('Edit', uav)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      ) : (
        <MobileTable
          data={filteredUAVs}
          columns={tableColumns}
          onEdit={(uav) => console.log('Edit', uav)}
          onDelete={handleDelete}
          onView={(uav) => console.log('View', uav)}
          emptyMessage="No UAVs found"
        />
      )}
    </div>
  )
}
