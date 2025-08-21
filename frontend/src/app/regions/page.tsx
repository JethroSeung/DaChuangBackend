'use client'

import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Map,
  Plane,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Region {
  id: string
  name: string
  description: string
  type: 'OPERATIONAL' | 'RESTRICTED' | 'NO_FLY' | 'EMERGENCY'
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  coordinates: Array<{ latitude: number; longitude: number }>
  area: number // in square kilometers
  maxAltitude: number // in meters
  assignedUAVs: string[]
  createdAt: string
  updatedAt: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// Mock regions data
const mockRegions: Region[] = [
  {
    id: '1',
    name: 'Central Business District',
    description: 'Main commercial area with high-priority surveillance requirements',
    type: 'OPERATIONAL',
    status: 'ACTIVE',
    coordinates: [
      { latitude: 39.9042, longitude: 116.4074 },
      { latitude: 39.9142, longitude: 116.4074 },
      { latitude: 39.9142, longitude: 116.4174 },
      { latitude: 39.9042, longitude: 116.4174 }
    ],
    area: 12.5,
    maxAltitude: 150,
    assignedUAVs: ['UAV-001', 'UAV-002'],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-08-20T14:30:00Z',
    priority: 'HIGH'
  },
  {
    id: '2',
    name: 'Airport Perimeter',
    description: 'Restricted airspace around the international airport',
    type: 'RESTRICTED',
    status: 'ACTIVE',
    coordinates: [
      { latitude: 39.8842, longitude: 116.3874 },
      { latitude: 39.8942, longitude: 116.3874 },
      { latitude: 39.8942, longitude: 116.3974 },
      { latitude: 39.8842, longitude: 116.3974 }
    ],
    area: 8.2,
    maxAltitude: 50,
    assignedUAVs: [],
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-08-15T11:20:00Z',
    priority: 'CRITICAL'
  },
  {
    id: '3',
    name: 'Industrial Zone Alpha',
    description: 'Manufacturing and logistics area requiring regular monitoring',
    type: 'OPERATIONAL',
    status: 'ACTIVE',
    coordinates: [
      { latitude: 39.9242, longitude: 116.4274 },
      { latitude: 39.9342, longitude: 116.4274 },
      { latitude: 39.9342, longitude: 116.4374 },
      { latitude: 39.9242, longitude: 116.4374 }
    ],
    area: 15.7,
    maxAltitude: 200,
    assignedUAVs: ['UAV-003', 'UAV-004'],
    createdAt: '2025-02-01T14:00:00Z',
    updatedAt: '2025-08-18T16:45:00Z',
    priority: 'MEDIUM'
  },
  {
    id: '4',
    name: 'Emergency Response Zone',
    description: 'Designated area for emergency operations and medical response',
    type: 'EMERGENCY',
    status: 'ACTIVE',
    coordinates: [
      { latitude: 39.8942, longitude: 116.4174 },
      { latitude: 39.9042, longitude: 116.4174 },
      { latitude: 39.9042, longitude: 116.4274 },
      { latitude: 39.8942, longitude: 116.4274 }
    ],
    area: 6.3,
    maxAltitude: 300,
    assignedUAVs: ['UAV-005'],
    createdAt: '2025-03-10T12:00:00Z',
    updatedAt: '2025-08-20T09:15:00Z',
    priority: 'CRITICAL'
  },
  {
    id: '5',
    name: 'Residential Area North',
    description: 'Low-priority residential monitoring zone',
    type: 'OPERATIONAL',
    status: 'INACTIVE',
    coordinates: [
      { latitude: 39.9442, longitude: 116.4074 },
      { latitude: 39.9542, longitude: 116.4074 },
      { latitude: 39.9542, longitude: 116.4174 },
      { latitude: 39.9442, longitude: 116.4174 }
    ],
    area: 9.1,
    maxAltitude: 100,
    assignedUAVs: [],
    createdAt: '2025-04-05T08:30:00Z',
    updatedAt: '2025-07-22T13:10:00Z',
    priority: 'LOW'
  }
]

export default function RegionsPage() {
  const [regions] = useState<Region[]>(mockRegions)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const getTypeIcon = (type: Region['type']) => {
    switch (type) {
      case 'OPERATIONAL':
        return <Plane className="h-4 w-4" />
      case 'RESTRICTED':
        return <Shield className="h-4 w-4" />
      case 'NO_FLY':
        return <AlertTriangle className="h-4 w-4" />
      case 'EMERGENCY':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: Region['type']) => {
    switch (type) {
      case 'OPERATIONAL':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RESTRICTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'NO_FLY':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'EMERGENCY':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: Region['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: Region['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredRegions = regions.filter(region => {
    const matchesSearch = searchQuery === '' || 
      region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'ALL' || region.type === typeFilter
    const matchesStatus = statusFilter === 'ALL' || region.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const activeRegions = regions.filter(r => r.status === 'ACTIVE').length
  const totalArea = regions.reduce((sum, r) => sum + r.area, 0)
  const assignedUAVs = new Set(regions.flatMap(r => r.assignedUAVs)).size

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              Operational Regions
            </h1>
            <p className="text-muted-foreground">
              Manage operational regions and flight zones
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Map className="h-4 w-4 mr-2" />
              View Map
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRegions}</div>
              <p className="text-xs text-muted-foreground">
                of {regions.length} total regions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArea.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                square kilometers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned UAVs</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedUAVs}</div>
              <p className="text-xs text-muted-foreground">
                UAVs deployed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search regions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="RESTRICTED">Restricted</option>
                  <option value="NO_FLY">No Fly</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regions List */}
        <div className="space-y-4">
          {filteredRegions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No regions found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredRegions.map((region) => (
              <Card key={region.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{region.name}</h3>
                        <Badge className={cn("border", getTypeColor(region.type))}>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(region.type)}
                            <span>{region.type.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        <Badge className={cn("border", getStatusColor(region.status))}>
                          {region.status}
                        </Badge>
                        <span className={cn("text-sm font-medium", getPriorityColor(region.priority))}>
                          {region.priority} Priority
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{region.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Area:</span>
                          <span className="ml-2">{region.area} km²</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Max Altitude:</span>
                          <span className="ml-2">{region.maxAltitude}m</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Assigned UAVs:</span>
                          <span className="ml-2">{region.assignedUAVs.length}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Last Updated:</span>
                          <span className="ml-2">
                            {new Date(region.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {region.assignedUAVs.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">UAVs: </span>
                          <div className="inline-flex flex-wrap gap-1 mt-1">
                            {region.assignedUAVs.map((uav) => (
                              <Badge key={uav} variant="outline" className="text-xs">
                                {uav}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
