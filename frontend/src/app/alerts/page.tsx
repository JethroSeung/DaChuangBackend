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
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Clock,
  MapPin,
  Plane,
  Battery,
  Wifi
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS'
  category: 'SYSTEM' | 'UAV' | 'BATTERY' | 'COMMUNICATION' | 'MISSION' | 'MAINTENANCE'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  uavRfid?: string
  location?: string
  severity: number // 1-5, 5 being most severe
}

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'CRITICAL',
    category: 'UAV',
    title: 'UAV Communication Lost',
    message: 'Lost communication with UAV-003 during active mission. Last known position: 39.9142°N, 116.4174°E',
    timestamp: '2025-08-20T14:30:00Z',
    acknowledged: false,
    uavRfid: 'UAV-003',
    location: 'Sector 7',
    severity: 5
  },
  {
    id: '2',
    type: 'WARNING',
    category: 'BATTERY',
    title: 'Low Battery Warning',
    message: 'UAV-001 battery level has dropped to 15%. Consider returning to base for charging.',
    timestamp: '2025-08-20T14:15:00Z',
    acknowledged: false,
    uavRfid: 'UAV-001',
    location: 'Patrol Route A',
    severity: 3
  },
  {
    id: '3',
    type: 'WARNING',
    category: 'SYSTEM',
    title: 'Docking Station Offline',
    message: 'Docking Station DS-002 is not responding. Check power and network connections.',
    timestamp: '2025-08-20T13:45:00Z',
    acknowledged: true,
    location: 'Base Station B',
    severity: 4
  },
  {
    id: '4',
    type: 'INFO',
    category: 'MISSION',
    title: 'Mission Completed',
    message: 'Surveillance mission "Perimeter Check Alpha" completed successfully by UAV-002.',
    timestamp: '2025-08-20T13:30:00Z',
    acknowledged: true,
    uavRfid: 'UAV-002',
    location: 'Perimeter Zone',
    severity: 1
  },
  {
    id: '5',
    type: 'WARNING',
    category: 'MAINTENANCE',
    title: 'Scheduled Maintenance Due',
    message: 'UAV-004 is due for scheduled maintenance. Flight hours: 98/100.',
    timestamp: '2025-08-20T12:00:00Z',
    acknowledged: false,
    uavRfid: 'UAV-004',
    severity: 2
  },
  {
    id: '6',
    type: 'CRITICAL',
    category: 'SYSTEM',
    title: 'Weather Alert',
    message: 'Severe weather conditions detected. All outdoor operations should be suspended.',
    timestamp: '2025-08-20T11:30:00Z',
    acknowledged: true,
    severity: 5
  }
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [showAcknowledged, setShowAcknowledged] = useState(true)

  const getAlertIcon = (type: Alert['type'], category: Alert['category']) => {
    if (category === 'UAV') return <Plane className="h-4 w-4" />
    if (category === 'BATTERY') return <Battery className="h-4 w-4" />
    if (category === 'COMMUNICATION') return <Wifi className="h-4 w-4" />

    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4" />
      case 'WARNING':
        return <AlertCircle className="h-4 w-4" />
      case 'INFO':
        return <Info className="h-4 w-4" />
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchQuery === '' ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.uavRfid && alert.uavRfid.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = typeFilter === 'ALL' || alert.type === typeFilter
    const matchesCategory = categoryFilter === 'ALL' || alert.category === categoryFilter
    const matchesAcknowledged = showAcknowledged || !alert.acknowledged

    return matchesSearch && matchesType && matchesCategory && matchesAcknowledged
  })

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length
  const criticalCount = alerts.filter(alert => alert.type === 'CRITICAL' && !alert.acknowledged).length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              System Alerts
            </h1>
            <p className="text-muted-foreground">
              Monitor system alerts and notifications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="destructive" className="px-3 py-1">
              {criticalCount} Critical
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {unacknowledgedCount} Unacknowledged
            </Badge>
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
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="WARNING">Warning</option>
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SYSTEM">System</option>
                  <option value="UAV">UAV</option>
                  <option value="BATTERY">Battery</option>
                  <option value="COMMUNICATION">Communication</option>
                  <option value="MISSION">Mission</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showAcknowledged}
                    onChange={(e) => setShowAcknowledged(e.target.checked)}
                    className="rounded border-input"
                  />
                  <span>Show acknowledged</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No alerts found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts
              .sort((a, b) => {
                // Sort by severity (highest first), then by timestamp (newest first)
                if (a.severity !== b.severity) return b.severity - a.severity
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              })
              .map((alert) => (
                <Card key={alert.id} className={cn(
                  "transition-all duration-200",
                  !alert.acknowledged && "border-l-4",
                  alert.type === 'CRITICAL' && !alert.acknowledged && "border-l-red-500",
                  alert.type === 'WARNING' && !alert.acknowledged && "border-l-yellow-500",
                  alert.type === 'INFO' && !alert.acknowledged && "border-l-blue-500",
                  alert.acknowledged && "opacity-75"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={cn("p-2 rounded-full",
                            alert.type === 'CRITICAL' && "bg-red-100",
                            alert.type === 'WARNING' && "bg-yellow-100",
                            alert.type === 'INFO' && "bg-blue-100",
                            alert.type === 'SUCCESS' && "bg-green-100"
                          )}>
                            {getAlertIcon(alert.type, alert.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{alert.title}</h3>
                              <Badge className={cn("border text-xs", getAlertColor(alert.type))}>
                                {alert.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {alert.category}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  Acknowledged
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(alert.timestamp)}</span>
                              </div>
                              {alert.uavRfid && (
                                <div className="flex items-center space-x-1">
                                  <Plane className="h-3 w-3" />
                                  <span>{alert.uavRfid}</span>
                                </div>
                              )}
                              {alert.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{alert.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          <X className="h-4 w-4" />
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
