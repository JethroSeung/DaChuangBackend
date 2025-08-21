'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface LoadingProps {
  message?: string
  description?: string
  showProgress?: boolean
  progress?: number
  timeout?: number
  onTimeout?: () => void
  onRetry?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
}

export function EnhancedLoading({
  message = 'Loading...',
  description,
  showProgress = false,
  progress = 0,
  timeout,
  onTimeout,
  onRetry,
  className,
  size = 'md',
  variant = 'spinner'
}: LoadingProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!timeout) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setElapsedTime(elapsed)

      if (elapsed >= timeout) {
        setHasTimedOut(true)
        onTimeout?.()
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [timeout, onTimeout])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const containerSizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  if (hasTimedOut) {
    return (
      <Card className={cn('border-yellow-200 bg-yellow-50', className)}>
        <CardContent className={containerSizeClasses[size]}>
          <div className="flex items-center justify-center text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Taking longer than expected</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This operation is taking longer than usual. Please check your connection.
                </p>
              </div>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHasTimedOut(false)
                    setElapsedTime(0)
                    onRetry()
                  }}
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'spinner':
        return <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary rounded-full animate-pulse',
                  size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div className={cn(
            'bg-primary/20 rounded-full animate-pulse',
            size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-12 w-12' : 'h-16 w-16'
          )} />
        )
      
      case 'skeleton':
        return (
          <div className="space-y-3 w-full max-w-sm">
            <div className="h-4 bg-primary/20 rounded animate-pulse" />
            <div className="h-4 bg-primary/20 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-primary/20 rounded animate-pulse w-1/2" />
          </div>
        )
      
      default:
        return <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
    }
  }

  return (
    <div className={cn('flex items-center justify-center', containerSizeClasses[size], className)}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          {renderLoadingIndicator()}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {showProgress && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        )}

        {timeout && !hasTimedOut && (
          <div className="text-xs text-muted-foreground">
            {Math.round((timeout - elapsedTime) / 1000)}s remaining
          </div>
        )}
      </div>
    </div>
  )
}

export interface NetworkStatusProps {
  isOnline?: boolean
  className?: string
}

export function NetworkStatus({ isOnline = true, className }: NetworkStatusProps) {
  return (
    <div className={cn('flex items-center space-x-2 text-sm', className)}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Disconnected</span>
        </>
      )}
    </div>
  )
}

export interface LoadingSkeletonProps {
  lines?: number
  className?: string
  showAvatar?: boolean
}

export function LoadingSkeleton({ lines = 3, className, showAvatar = false }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
          </div>
        </div>
      )}
      
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-muted rounded animate-pulse',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

export interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card>
            <CardContent className="p-6">
              <EnhancedLoading message={message} size="md" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export interface ProgressiveLoadingProps {
  steps: Array<{
    label: string
    duration?: number
  }>
  currentStep: number
  className?: string
}

export function ProgressiveLoading({ steps, currentStep, className }: ProgressiveLoadingProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {steps[currentStep]?.label || 'Processing...'}
          </span>
          <span className="text-muted-foreground">
            {currentStep + 1} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  )
}

// Hook for managing loading states with timeout
export function useLoadingWithTimeout(initialLoading = false, timeoutMs = 30000) {
  const [loading, setLoading] = useState(initialLoading)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!loading) {
      setTimedOut(false)
      return
    }

    const timer = setTimeout(() => {
      setTimedOut(true)
    }, timeoutMs)

    return () => clearTimeout(timer)
  }, [loading, timeoutMs])

  const startLoading = () => {
    setLoading(true)
    setTimedOut(false)
  }

  const stopLoading = () => {
    setLoading(false)
    setTimedOut(false)
  }

  return {
    loading,
    timedOut,
    startLoading,
    stopLoading,
    setLoading
  }
}
