'use client'

import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Clock,
  MapPin,
  Plane,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlightLog {
  id: string
  uavRfid: string
  missionName: string
  startTime: string
  endTime?: string
  duration?: number
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'CANCELLED'
  startLocation: { latitude: number; longitude: number; name: string }
  endLocation?: { latitude: number; longitude: number; name: string }
  distance?: number
  maxAltitude?: number
  averageSpeed?: number
  batteryUsed?: number
  notes?: string
}

// Mock data
const mockFlightLogs: FlightLog[] = [
  {
    id: '1',
    uavRfid: 'UAV-001',
    missionName: 'Perimeter Patrol Alpha',
    startTime: '2025-08-20T08:30:00Z',
    endTime: '2025-08-20T09:45:00Z',
    duration: 75,
    status: 'COMPLETED',
    startLocation: { latitude: 39.9042, longitude: 116.4074, name: 'Base Station A' },
    endLocation: { latitude: 39.9142, longitude: 116.4174, name: 'Base Station A' },
    distance: 12.5,
    maxAltitude: 150,
    averageSpeed: 25.3,
    batteryUsed: 45,
    notes: 'Routine patrol completed successfully'
  },
  {
    id: '2',
    uavRfid: 'UAV-002',
    missionName: 'Emergency Response',
    startTime: '2025-08-20T10:15:00Z',
    endTime: '2025-08-20T10:35:00Z',
    duration: 20,
    status: 'COMPLETED',
    startLocation: { latitude: 39.9042, longitude: 116.4074, name: 'Base Station A' },
    endLocation: { latitude: 39.9242, longitude: 116.4274, name: 'Emergency Site' },
    distance: 8.2,
    maxAltitude: 200,
    averageSpeed: 35.7,
    batteryUsed: 25,
    notes: 'Emergency response mission - medical supply delivery'
  },
  {
    id: '3',
    uavRfid: 'UAV-003',
    missionName: 'Surveillance Mission Beta',
    startTime: '2025-08-20T14:00:00Z',
    status: 'IN_PROGRESS',
    startLocation: { latitude: 39.9042, longitude: 116.4074, name: 'Base Station B' },
    distance: 5.8,
    maxAltitude: 120,
    averageSpeed: 22.1,
    batteryUsed: 15,
    notes: 'Ongoing surveillance mission'
  },
  {
    id: '4',
    uavRfid: 'UAV-001',
    missionName: 'Maintenance Check',
    startTime: '2025-08-19T16:20:00Z',
    endTime: '2025-08-19T16:25:00Z',
    duration: 5,
    status: 'FAILED',
    startLocation: { latitude: 39.9042, longitude: 116.4074, name: 'Base Station A' },
    distance: 0.5,
    maxAltitude: 50,
    averageSpeed: 15.0,
    batteryUsed: 5,
    notes: 'Mission aborted due to sensor malfunction'
  }
]

export default function FlightLogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [flightLogs] = useState<FlightLog[]>(mockFlightLogs)

  const getStatusIcon = (status: FlightLog['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: FlightLog['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredLogs = flightLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.uavRfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.missionName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              Flight Logs
            </h1>
            <p className="text-muted-foreground">
              View flight history and mission logs
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
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
                    placeholder="Search by UAV RFID or mission name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Logs List */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No flight logs found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{log.missionName}</h3>
                        <Badge className={cn("border", getStatusColor(log.status))}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(log.status)}
                            <span>{log.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Plane className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.uavRfid}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDateTime(log.startTime)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDuration(log.duration)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{log.distance ? `${log.distance} km` : 'N/A'}</span>
                        </div>
                      </div>
                      
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-3 italic">
                          {log.notes}
                        </p>
                      )}
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
