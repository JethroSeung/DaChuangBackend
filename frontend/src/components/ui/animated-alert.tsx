'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Badge } from './badge'
import { Button } from './button'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AlertData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  timestamp?: string
  onRemove?: (id: string) => void
}

interface AnimatedAlertProps {
  alert: AlertData
  className?: string
}

export function AnimatedAlert({ alert, className }: AnimatedAlertProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'error':
        return AlertTriangle
      case 'warning':
        return AlertCircle
      case 'info':
        return Info
      default:
        return Info
    }
  }

  const getVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      default:
        return 'default'
    }
  }

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  const Icon = getIcon(alert.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn('relative', className)}
    >
      <Alert className={cn(getColorClasses(alert.type), 'pr-12')}>
        <Icon className="h-4 w-4" />
        <div className="flex-1">
          {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
          <AlertDescription>{alert.message}</AlertDescription>
          {alert.timestamp && (
            <div className="text-xs opacity-70 mt-1">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
        {alert.onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/10"
            onClick={() => alert.onRemove?.(alert.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </Alert>
    </motion.div>
  )
}

interface RealtimeAlertsProps {
  alerts: AlertData[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxAlerts?: number
  className?: string
}

export function RealtimeAlerts({ 
  alerts, 
  position = 'top-right', 
  maxAlerts = 5,
  className 
}: RealtimeAlertsProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const visibleAlerts = alerts.slice(0, maxAlerts)

  return (
    <div className={cn(
      'fixed z-50 flex flex-col space-y-2 w-80',
      positionClasses[position],
      className
    )}>
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <AnimatedAlert key={alert.id} alert={alert} />
        ))}
      </AnimatePresence>
    </div>
  )
}
