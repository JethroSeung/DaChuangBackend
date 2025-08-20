'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { AnimatedAlert, RealtimeAlerts as AnimatedRealtimeAlerts } from '@/components/ui/animated-alert'
import { StaggerContainer, StaggerItem } from '@/components/ui/animated-components'
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  X,
  Search,
  Filter,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'
import { useAlerts, useDashboardStore } from '@/stores/dashboard-store'
import { SystemAlert } from '@/types/uav'
import { formatRelativeTime, cn } from '@/lib/utils'

// Mock alerts for demonstration
const mockAlerts: SystemAlert[] = [
  {
    id: '1',
    type: 'CRITICAL',
    title: 'UAV Battery Critical',
    message: 'UAV-005 battery level is critically low (8%)',
    uavId: 5,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: '2',
    type: 'WARNING',
    title: 'Hibernate Pod Near Capacity',
    message: 'Hibernate pod is at 80% capacity (8/10 slots occupied)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: '3',
    type: 'INFO',
    title: 'Flight Completed',
    message: 'UAV-003 has successfully completed mission "Perimeter Patrol"',
    uavId: 3,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged: true,
  },
  {
    id: '4',
    type: 'ERROR',
    title: 'Communication Lost',
    message: 'Lost communication with UAV-007 during flight',
    uavId: 7,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: '5',
    type: 'INFO',
    title: 'Maintenance Scheduled',
    message: 'Routine maintenance scheduled for UAV-001 tomorrow at 09:00',
    uavId: 1,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    acknowledged: true,
  },
]

interface RealtimeAlertsProps {
  maxAlerts?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RealtimeAlerts({ maxAlerts = 20, autoRefresh = true, refreshInterval = 5000 }: RealtimeAlertsProps = {}) {
  const alerts = useAlerts()
  const {
    acknowledgeAlert,
    removeAlert,
    addAlert,
    clearAlerts,
    showAlerts,
    isConnected,
    connectionError,
    toggleAlerts
  } = useDashboardStore()

  // Local state for UI controls
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'error' | 'warning' | 'info' | 'high' | 'medium' | 'low' | 'unacknowledged'>('all')
  const [displayCount, setDisplayCount] = useState(maxAlerts)

  // Initialize with mock data for demonstration
  useEffect(() => {
    if (alerts.length === 0) {
      mockAlerts.forEach(alert => addAlert(alert))
    }
  }, [alerts.length, addAlert])

  // Filter and search alerts
  const filteredAlerts = alerts.filter(alert => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!alert.title.toLowerCase().includes(query) &&
          !alert.message.toLowerCase().includes(query)) {
        return false
      }
    }

    // Type/severity filters
    switch (selectedFilter) {
      case 'error':
        return alert.type === 'ERROR' || alert.type === 'CRITICAL'
      case 'warning':
        return alert.type === 'WARNING'
      case 'info':
        return alert.type === 'INFO'
      case 'high':
        return alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
      case 'medium':
        return alert.severity === 'MEDIUM'
      case 'low':
        return alert.severity === 'LOW'
      case 'unacknowledged':
        return !alert.acknowledged
      default:
        return true
    }
  })

  // Sort by timestamp (newest first)
  const sortedAlerts = filteredAlerts.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertVariant = (type: SystemAlert['type']) => {
    switch (type) {
      case 'CRITICAL':
      case 'ERROR':
        return 'destructive'
      case 'WARNING':
        return 'warning'
      case 'INFO':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const handleAcknowledge = (alertId: string | number) => {
    acknowledgeAlert(String(alertId))
  }

  const handleDismiss = (alertId: string | number) => {
    removeAlert(String(alertId))
  }

  const handleClearAll = () => {
    clearAlerts()
  }

  const handleToggleAlerts = () => {
    toggleAlerts()
  }

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + maxAlerts)
  }

  // Get displayed alerts with pagination
  const displayedAlerts = sortedAlerts.slice(0, displayCount)
  const hasMoreAlerts = sortedAlerts.length > displayCount

  const unacknowledgedAlerts = displayedAlerts.filter(alert => !alert.acknowledged)
  const acknowledgedAlerts = displayedAlerts.filter(alert => alert.acknowledged)

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Real-time Alerts</span>
              {unacknowledgedAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unacknowledgedAlerts.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div
                data-testid="connection-indicator"
                className="flex items-center space-x-1 text-xs"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Disconnected</span>
                  </>
                )}
              </div>

              {/* Toggle Alerts */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleAlerts}
                aria-label="Toggle alerts"
              >
                {showAlerts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>

              {/* Clear All */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={alerts.length === 0}
                aria-label="Clear all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            System notifications and warnings
          </CardDescription>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-3 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'error', 'warning', 'info', 'high', 'medium', 'low', 'unacknowledged'].map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter(filter as any)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showAlerts ? (
            <div className="text-center py-8 text-muted-foreground">
              <EyeOff className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Alerts Hidden</p>
              <p className="text-sm">Click the eye icon to show alerts</p>
            </div>
          ) : connectionError ? (
            <div className="text-center py-8 text-muted-foreground">
              <WifiOff className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium">Connection lost</p>
              <p className="text-sm">{connectionError}</p>
            </div>
          ) : unacknowledgedAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">No alerts</p>
              <p className="text-sm">All systems are running normally</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <StaggerContainer className="space-y-3">
                <AnimatePresence>
                  {unacknowledgedAlerts.map((alert, index) => (
                    <StaggerItem key={alert.id}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={cn(
                          'p-4 rounded-lg border transition-colors',
                          alert.type === 'CRITICAL' && 'border-red-200 bg-red-50',
                          alert.type === 'ERROR' && 'border-red-200 bg-red-50',
                          alert.type === 'WARNING' && 'border-yellow-200 bg-yellow-50',
                          alert.type === 'INFO' && 'border-blue-200 bg-blue-50'
                        )}
                      >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getAlertVariant(alert.type) as any}>
                              {alert.type}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatRelativeTime(alert.timestamp)}</span>
                            </div>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          {alert.uavId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Related UAV ID: {alert.uavId}
                            </p>
                          )}
                        </div>
                      </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDismiss(alert.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>

              {/* Load More Button */}
              {hasMoreAlerts && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    aria-label="Load more"
                  >
                    Load more alerts
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Recently acknowledged alerts and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acknowledgedAlerts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <ScrollArea className="h-60">
              <StaggerContainer className="space-y-2">
                <AnimatePresence>
                  {acknowledgedAlerts.slice(0, 10).map((alert, index) => (
                    <StaggerItem key={alert.id}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Acknowledged
                      </Badge>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
