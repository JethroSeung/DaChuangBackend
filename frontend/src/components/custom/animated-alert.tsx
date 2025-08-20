'use client'

import React from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAnimationVariants } from '@/lib/animations'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

interface AnimatedAlertProps extends HTMLMotionProps<'div'> {
  type?: AlertType
  title?: string
  description: string
  dismissible?: boolean
  onDismiss?: () => void
  autoHide?: boolean
  autoHideDelay?: number
  className?: string
  icon?: React.ReactNode
}

const alertIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

const alertStyles = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  error: 'border-red-200 bg-red-50 text-red-800',
}

export function AnimatedAlert({
  type = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  className,
  icon,
  ...props
}: AnimatedAlertProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const IconComponent = (icon as any) || alertIcons[type]

  React.useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoHideDelay)

      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss?.()
    }, 300) // Wait for exit animation
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={getAnimationVariants('alert')}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn('relative', className)}
          {...props}
        >
          <Alert className={cn(alertStyles[type], 'border-l-4')}>
            <div className="flex items-start space-x-3">
              {IconComponent && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                >
                  <IconComponent className="h-5 w-5 mt-0.5" />
                </motion.div>
              )}

              <div className="flex-1 min-w-0">
                {title && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <AlertTitle className="mb-1">{title}</AlertTitle>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AlertDescription>{description}</AlertDescription>
                </motion.div>
              </div>

              {dismissible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 hover:bg-black/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>

            {autoHide && autoHideDelay > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: autoHideDelay / 1000, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
              />
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast Notification Component
interface ToastProps {
  id: string
  type: AlertType
  title?: string
  description: string
  duration?: number
  onRemove: (id: string) => void
}

export function Toast({ id, type, title, description, duration = 5000, onRemove }: ToastProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative max-w-sm w-full"
    >
      <AnimatedAlert
        type={type}
        title={title}
        description={description}
        dismissible
        onDismiss={() => onRemove(id)}
        autoHide
        autoHideDelay={duration}
        className="shadow-lg"
      />
    </motion.div>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function ToastContainer({ toasts, position = 'top-right' }: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
  }

  return (
    <div className={cn(positionClasses[position], 'z-50 space-y-2')}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Real-time Alert Component
interface RealtimeAlertProps {
  alerts: Array<{
    id: string
    type: AlertType
    title: string
    description: string
    timestamp: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
  }>
  maxVisible?: number
}

export function RealtimeAlerts({ alerts, maxVisible = 5 }: RealtimeAlertProps) {
  const visibleAlerts = alerts.slice(0, maxVisible)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {visibleAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: 'easeOut'
            }}
            className="relative"
          >
            <div className="flex items-start space-x-3 p-3 bg-card border rounded-lg">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className={cn(
                  'w-2 h-2 rounded-full mt-2',
                  getPriorityColor(alert.priority)
                )}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <motion.h4
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-medium"
                  >
                    {alert.title}
                  </motion.h4>

                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {alert.priority}
                    </Badge>
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground"
                >
                  {alert.description}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-muted-foreground mt-1"
                >
                  {alert.timestamp.toLocaleTimeString()}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
