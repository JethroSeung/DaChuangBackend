'use client'

import React, { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { AnimatedPage, StaggerContainer, StaggerItem, AnimatedCard, AnimatedModal } from '@/components/ui/animated-components'
import { useToastContext } from '@/components/providers/toast-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { UAV, UAVFilter } from '@/types/uav'
import { getStatusVariant, formatDateTime, formatRelativeTime } from '@/lib/utils'
import { UAVForm } from '@/components/features/uav/uav-form'
import { UAVDetails } from '@/components/features/uav/uav-details'
import { MobileUAVManagement } from '@/components/features/uav/mobile-uav-management'
import { useResponsive } from '@/hooks/use-responsive'

export default function UAVsPage() {
  const {
    uavs,
    loading,
    error,
    filter,
    searchQuery,
    fetchUAVs,
    deleteUAV,
    setFilter,
    setSearchQuery,
    clearError,
  } = useUAVStore()

  const [selectedUAV, setSelectedUAV] = useState<UAV | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const { isMobile } = useResponsive()
  const { success, error: showError, warning, info } = useToastContext()

  useEffect(() => {
    fetchUAVs()
  }, [fetchUAVs, filter, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilter: Partial<UAVFilter>) => {
    setFilter(newFilter)
  }

  const handleDelete = async (uav: UAV) => {
    if (window.confirm(`Are you sure you want to delete UAV ${uav.rfidTag}?`)) {
      await deleteUAV(uav.id)
    }
  }

  const handleEdit = (uav: UAV) => {
    setSelectedUAV(uav)
    setShowEditDialog(true)
  }

  const handleViewDetails = (uav: UAV) => {
    setSelectedUAV(uav)
    setShowDetailsDialog(true)
  }

  const handleRefresh = () => {
    fetchUAVs()
  }

  const filteredUAVs = uavs.filter(uav => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        uav.rfidTag.toLowerCase().includes(query) ||
        uav.ownerName.toLowerCase().includes(query) ||
        uav.model.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Use mobile UAV management for mobile devices
  if (isMobile) {
    return <MobileUAVManagement />
  }

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-orbitron text-foreground">
              UAV Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your UAV fleet and monitor operations
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
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add UAV</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <AnimatedModal isOpen={showCreateDialog}>
                  <DialogHeader>
                    <DialogTitle>Add New UAV</DialogTitle>
                    <DialogDescription>
                      Register a new UAV in the management system
                    </DialogDescription>
                  </DialogHeader>
                  <UAVForm
                    onSuccess={() => {
                      setShowCreateDialog(false)
                      fetchUAVs()
                      success('UAV created successfully', 'Success')
                    }}
                    onCancel={() => setShowCreateDialog(false)}
                  />
                </AnimatedModal>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search UAVs by RFID, owner, or model..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filter.status === 'AUTHORIZED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange({ 
                    status: filter.status === 'AUTHORIZED' ? undefined : 'AUTHORIZED' 
                  })}
                >
                  Authorized
                </Button>
                <Button
                  variant={filter.status === 'UNAUTHORIZED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange({ 
                    status: filter.status === 'UNAUTHORIZED' ? undefined : 'UNAUTHORIZED' 
                  })}
                >
                  Unauthorized
                </Button>
                <Button
                  variant={filter.inHibernatePod === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange({ 
                    inHibernatePod: filter.inHibernatePod === true ? undefined : true 
                  })}
                >
                  Hibernating
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* UAV Table */}
        <AnimatedCard hover={false}>
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plane className="h-5 w-5" />
                <span>UAV Fleet ({filteredUAVs.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading UAVs...</span>
              </div>
            ) : filteredUAVs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No UAVs found</p>
                <p className="text-sm">
                  {searchQuery || Object.keys(filter).length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Add your first UAV to get started'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFID Tag</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Operational</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <StaggerContainer>
                      {filteredUAVs.map((uav) => (
                        <StaggerItem key={uav.id}>
                          <TableRow>
                        <TableCell className="font-medium">
                          {uav.rfidTag}
                        </TableCell>
                        <TableCell>{uav.ownerName}</TableCell>
                        <TableCell>{uav.model}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(uav.status)}>
                            {uav.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(uav.operationalStatus)}>
                            {uav.operationalStatus.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {uav.batteryStatus ? (
                            <div className="flex items-center space-x-1">
                              <Battery className="h-4 w-4" />
                              <span>{uav.batteryStatus.currentChargePercentage}%</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatRelativeTime(uav.updatedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetails(uav)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(uav)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(uav)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                          </TableRow>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          </Card>
        </AnimatedCard>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <AnimatedModal isOpen={showEditDialog}>
              <DialogHeader>
                <DialogTitle>Edit UAV</DialogTitle>
                <DialogDescription>
                  Update UAV information and settings
                </DialogDescription>
              </DialogHeader>
              {selectedUAV && (
                <UAVForm
                  uav={selectedUAV}
                  onSuccess={() => {
                    setShowEditDialog(false)
                    setSelectedUAV(null)
                    fetchUAVs()
                    success('UAV updated successfully', 'Success')
                  }}
                  onCancel={() => {
                    setShowEditDialog(false)
                    setSelectedUAV(null)
                  }}
                />
              )}
            </AnimatedModal>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>UAV Details</DialogTitle>
              <DialogDescription>
                Comprehensive UAV information and status
              </DialogDescription>
            </DialogHeader>
            {selectedUAV && (
              <UAVDetails
                uav={selectedUAV}
                onClose={() => {
                  setShowDetailsDialog(false)
                  setSelectedUAV(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
        </div>
      </AnimatedPage>
    </AppLayout>
  )
}
