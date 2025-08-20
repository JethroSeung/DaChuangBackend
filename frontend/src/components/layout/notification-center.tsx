'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  read: boolean
  actionUrl?: string
  category: 'system' | 'uav' | 'battery' | 'security' | 'maintenance'
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Low Battery Alert',
    message: 'UAV-001 battery level is at 15%. Consider charging soon.',
    type: 'warning',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    category: 'battery',
    actionUrl: '/uavs/1'
  },
  {
    id: '2',
    title: 'Unauthorized UAV Detected',
    message: 'Unknown UAV detected in restricted zone Alpha-7.',
    type: 'error',
    timestamp: '2024-01-15T09:45:00Z',
    read: false,
    category: 'security',
    actionUrl: '/map'
  },
  {
    id: '3',
    title: 'Maintenance Scheduled',
    message: 'UAV-003 is scheduled for maintenance tomorrow at 14:00.',
    type: 'info',
    timestamp: '2024-01-15T08:20:00Z',
    read: true,
    category: 'maintenance',
    actionUrl: '/uavs/3'
  },
  {
    id: '4',
    title: 'Flight Mission Completed',
    message: 'UAV-002 has successfully completed patrol mission PM-2024-001.',
    type: 'success',
    timestamp: '2024-01-15T07:15:00Z',
    read: true,
    category: 'uav',
    actionUrl: '/flight-logs'
  },
  {
    id: '5',
    title: 'System Update Available',
    message: 'A new system update (v2.1.3) is available for installation.',
    type: 'info',
    timestamp: '2024-01-14T16:30:00Z',
    read: false,
    category: 'system',
    actionUrl: '/settings'
  }
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return AlertTriangle
      case 'warning':
        return AlertTriangle
      case 'success':
        return CheckCircle
      case 'info':
      default:
        return Info
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'info':
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const getCategoryColor = (category: Notification['category']) => {
    switch (category) {
      case 'security':
        return 'bg-red-100 text-red-800'
      case 'battery':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800'
      case 'uav':
        return 'bg-blue-100 text-blue-800'
      case 'system':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="text-xs"
          >
            Unread ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="p-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="w-full text-xs"
          >
            Mark all as read
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      notification.read
                        ? 'bg-muted/30 border-muted'
                        : 'bg-card border-border shadow-sm'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={cn(
                        'p-1.5 rounded-full flex-shrink-0',
                        getNotificationColor(notification.type)
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              'text-sm font-medium truncate',
                              notification.read && 'text-muted-foreground'
                            )}>
                              {notification.title}
                            </h4>
                            <p className={cn(
                              'text-xs mt-1 line-clamp-2',
                              notification.read ? 'text-muted-foreground' : 'text-foreground'
                            )}>
                              {notification.message}
                            </p>
                          </div>

                          {/* Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                {notification.read ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Mark as unread
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Mark as read
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getCategoryColor(notification.category))}
                            >
                              {notification.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.timestamp)}
                            </span>
                          </div>

                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => window.location.href = notification.actionUrl!}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
