'use client'

import React, { useEffect, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plane,
  Battery,
  MapPin,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { UAV } from '@/types'
import { UAVForm } from '@/components/features/uav/uav-form'
import { UAVDetails } from '@/components/features/uav/uav-details'
import { MobileUAVManagement } from '@/components/features/uav/mobile-uav-management'
import { useResponsive } from '@/hooks/use-responsive'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function UAVManagementPage() {
  const { isMobile } = useResponsive()
  const {
    uavs,
    loading,
    error,
    searchQuery,
    selectedUAV,
    fetchUAVs,
    setSearchQuery,
    setFilter,
    setSelectedUAV,
    deleteUAV,
    getFilteredUAVs,
  } = useUAVStore()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

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
    toast.success('UAV list refreshed')
  }

  const handleView = (uav: UAV) => {
    setSelectedUAV(uav)
    setShowDetailsDialog(true)
  }

  const handleEdit = (uav: UAV) => {
    setSelectedUAV(uav)
    setShowEditDialog(true)
  }

  const handleDelete = async (uav: UAV) => {
    if (window.confirm(`Are you sure you want to delete UAV ${uav.rfidTag}?`)) {
      const success = await deleteUAV(uav.id)
      if (success) {
        toast.success(`UAV ${uav.rfidTag} deleted successfully`)
      } else {
        toast.error(`Failed to delete UAV ${uav.rfidTag}`)
      }
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'default'
      case 'UNAUTHORIZED':
        return 'destructive'
      case 'ACTIVE':
        return 'default'
      case 'HIBERNATING':
        return 'secondary'
      case 'CHARGING':
        return 'outline'
      case 'MAINTENANCE':
        return 'outline'
      case 'EMERGENCY':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600'
    if (level > 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredUAVs = getFilteredUAVs()

  if (isMobile) {
    return (
      <AppLayout>
        <MobileUAVManagement />
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
              UAV Management
            </h1>
            <p className="text-muted-foreground">
              Manage your UAV fleet and monitor their status
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
              Refresh
            </Button>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add UAV
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New UAV</DialogTitle>
                  <DialogDescription>
                    Register a new UAV in the system
                  </DialogDescription>
                </DialogHeader>
                <UAVForm
                  onSuccess={() => {
                    setShowCreateDialog(false)
                    fetchUAVs()
                    toast.success('UAV created successfully')
                  }}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search UAVs by RFID tag, region, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter({ status: ['AUTHORIZED'] })}>
                    Authorized Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter({ status: ['UNAUTHORIZED'] })}>
                    Unauthorized Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter({ status: ['ACTIVE'] })}>
                    Active Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter({ batteryLevel: { max: 30 } })}>
                    Low Battery
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter({ inHibernatePod: true })}>
                    In Hibernate Pod
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter({})}>
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* UAV List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>UAVs ({filteredUAVs.length})</span>
              <Badge variant="outline">
                {loading ? 'Loading...' : `${filteredUAVs.length} of ${uavs.length}`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading UAVs...
              </div>
            ) : filteredUAVs.length === 0 ? (
              <div className="text-center py-8">
                <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No UAVs found</p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUAVs.map((uav) => (
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
                          <Badge variant={getStatusVariant(uav.status)}>
                            {uav.status}
                          </Badge>
                          {uav.inHibernatePod && (
                            <Badge variant="outline">Hibernating</Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Battery className={cn('h-4 w-4', getBatteryColor(uav.batteryLevel))} />
                            <span>{uav.batteryLevel}%</span>
                          </div>

                          {uav.region && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{uav.region}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(uav.lastSeen).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(uav)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(uav)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(uav)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>UAV Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedUAV?.rfidTag}
              </DialogDescription>
            </DialogHeader>
            {selectedUAV && (
              <UAVDetails
                uav={selectedUAV}
                onClose={() => setShowDetailsDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit UAV</DialogTitle>
              <DialogDescription>
                Update UAV information
              </DialogDescription>
            </DialogHeader>
            {selectedUAV && (
              <UAVForm
                uav={selectedUAV}
                onSuccess={() => {
                  setShowEditDialog(false)
                  fetchUAVs()
                  toast.success('UAV updated successfully')
                }}
                onCancel={() => setShowEditDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
