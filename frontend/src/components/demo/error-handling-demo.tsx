'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Clock,
  Zap
} from 'lucide-react'
import { useAsyncOperation, usePolling } from '@/hooks/use-async-operation'
import { 
  EnhancedLoading, 
  LoadingOverlay, 
  LoadingSkeleton, 
  NetworkStatus,
  ProgressiveLoading,
  useLoadingWithTimeout
} from '@/components/ui/enhanced-loading'
import { 
  AppError, 
  NetworkError, 
  TimeoutError, 
  ValidationError,
  safeAsync,
  withRetry,
  withTimeout
} from '@/lib/error-handling'

// Mock async operations for demonstration
const mockOperations = {
  success: async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { message: 'Operation completed successfully!', data: [1, 2, 3, 4, 5] }
  },

  networkError: async () => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    throw new NetworkError('Failed to connect to server')
  },

  timeout: async () => {
    await new Promise(resolve => setTimeout(resolve, 8000))
    return { message: 'This should timeout' }
  },

  validationError: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    throw new ValidationError('Invalid input data', {
      email: 'Email is required',
      password: 'Password must be at least 8 characters'
    })
  },

  randomError: async () => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    const errors = [
      new NetworkError('Connection lost'),
      new TimeoutError('Request timed out'),
      new ValidationError('Invalid data'),
      new AppError('SERVER_ERROR', 'Internal server error')
    ]
    throw errors[Math.floor(Math.random() * errors.length)]
  },

  progressiveOperation: async (onProgress?: (step: number) => void) => {
    const steps = ['Initializing...', 'Processing data...', 'Validating...', 'Finalizing...']
    
    for (let i = 0; i < steps.length; i++) {
      onProgress?.(i)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return { message: 'Progressive operation completed!' }
  }
}

export function ErrorHandlingDemo() {
  const [networkOnline, setNetworkOnline] = useState(true)
  const [progressStep, setProgressStep] = useState(0)

  // Async operation hooks
  const successOp = useAsyncOperation(mockOperations.success)
  const networkErrorOp = useAsyncOperation(mockOperations.networkError)
  const timeoutOp = useAsyncOperation(mockOperations.timeout, { timeout: 5000 })
  const validationErrorOp = useAsyncOperation(mockOperations.validationError)
  const randomErrorOp = useAsyncOperation(mockOperations.randomError, {
    retryConfig: { maxAttempts: 3, baseDelay: 1000 }
  })

  // Progressive operation
  const progressiveOp = useAsyncOperation(
    () => mockOperations.progressiveOperation(setProgressStep),
    {
      onSuccess: () => setProgressStep(0),
      onError: () => setProgressStep(0)
    }
  )

  // Polling demo
  const pollingOp = usePolling(
    async () => {
      if (!networkOnline) throw new NetworkError('Network is offline')
      return { timestamp: new Date().toISOString(), value: Math.random() }
    },
    3000,
    { enabled: networkOnline }
  )

  // Loading with timeout demo
  const { loading: timeoutLoading, timedOut, startLoading, stopLoading } = useLoadingWithTimeout(false, 5000)

  const handleTimeoutDemo = () => {
    startLoading()
    setTimeout(stopLoading, 7000) // Will timeout after 5 seconds
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Error Handling & Loading States Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of enhanced error handling, loading states, and retry mechanisms
        </p>
      </div>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Network Status
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNetworkOnline(!networkOnline)}
            >
              {networkOnline ? <WifiOff className="h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
              {networkOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkStatus isOnline={networkOnline} />
        </CardContent>
      </Card>

      {/* Basic Async Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Async Operations</CardTitle>
          <CardDescription>
            Test different types of operations and error scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Success Operation */}
            <div className="space-y-2">
              <Button
                onClick={() => successOp.execute()}
                disabled={successOp.loading}
                className="w-full"
              >
                {successOp.loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Success Operation
              </Button>
              {successOp.data && (
                <Badge variant="outline" className="w-full justify-center">
                  ✓ {successOp.data.message}
                </Badge>
              )}
              {successOp.error && (
                <Badge variant="destructive" className="w-full justify-center">
                  ✗ {successOp.error.message}
                </Badge>
              )}
            </div>

            {/* Network Error */}
            <div className="space-y-2">
              <Button
                onClick={() => networkErrorOp.execute()}
                disabled={networkErrorOp.loading}
                variant="outline"
                className="w-full"
              >
                {networkErrorOp.loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <WifiOff className="h-4 w-4 mr-2" />
                )}
                Network Error
              </Button>
              {networkErrorOp.error && (
                <div className="space-y-1">
                  <Badge variant="destructive" className="w-full justify-center">
                    ✗ {networkErrorOp.error.message}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => networkErrorOp.retry()}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Timeout Error */}
            <div className="space-y-2">
              <Button
                onClick={() => timeoutOp.execute()}
                disabled={timeoutOp.loading}
                variant="outline"
                className="w-full"
              >
                {timeoutOp.loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                Timeout (5s)
              </Button>
              {timeoutOp.error && (
                <Badge variant="destructive" className="w-full justify-center">
                  ✗ {timeoutOp.error.message}
                </Badge>
              )}
            </div>

            {/* Validation Error */}
            <div className="space-y-2">
              <Button
                onClick={() => validationErrorOp.execute()}
                disabled={validationErrorOp.loading}
                variant="outline"
                className="w-full"
              >
                {validationErrorOp.loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                Validation Error
              </Button>
              {validationErrorOp.error && (
                <Badge variant="destructive" className="w-full justify-center">
                  ✗ {validationErrorOp.error.message}
                </Badge>
              )}
            </div>

            {/* Random Error with Retry */}
            <div className="space-y-2">
              <Button
                onClick={() => randomErrorOp.execute()}
                disabled={randomErrorOp.loading}
                variant="outline"
                className="w-full"
              >
                {randomErrorOp.loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Random Error (Retry)
              </Button>
              {randomErrorOp.data && (
                <Badge variant="outline" className="w-full justify-center">
                  ✓ Success after retry!
                </Badge>
              )}
              {randomErrorOp.error && (
                <Badge variant="destructive" className="w-full justify-center">
                  ✗ {randomErrorOp.error.message}
                </Badge>
              )}
            </div>

            {/* Progressive Operation */}
            <div className="space-y-2">
              <Button
                onClick={() => progressiveOp.execute()}
                disabled={progressiveOp.loading}
                variant="outline"
                className="w-full"
              >
                {progressiveOp.loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Progressive
              </Button>
              {progressiveOp.loading && (
                <ProgressiveLoading
                  steps={[
                    { label: 'Initializing...' },
                    { label: 'Processing data...' },
                    { label: 'Validating...' },
                    { label: 'Finalizing...' }
                  ]}
                  currentStep={progressStep}
                />
              )}
              {progressiveOp.data && (
                <Badge variant="outline" className="w-full justify-center">
                  ✓ {progressiveOp.data.message}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading States Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
          <CardDescription>
            Different loading indicators and timeout handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Loading Variants</h4>
              <div className="space-y-4">
                <EnhancedLoading variant="spinner" message="Spinner Loading" size="sm" />
                <EnhancedLoading variant="dots" message="Dots Loading" size="md" />
                <EnhancedLoading variant="pulse" message="Pulse Loading" size="lg" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Skeleton Loading</h4>
              <LoadingSkeleton lines={4} showAvatar />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="font-medium">Timeout Demo</h4>
            <Button onClick={handleTimeoutDemo} disabled={timeoutLoading}>
              {timeoutLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Start Loading (Will timeout)
            </Button>
            
            {timeoutLoading && !timedOut && (
              <EnhancedLoading
                message="Loading with timeout..."
                timeout={5000}
                onTimeout={() => console.log('Timed out!')}
                onRetry={() => {
                  stopLoading()
                  handleTimeoutDemo()
                }}
              />
            )}
            
            {timedOut && (
              <Badge variant="destructive">
                Operation timed out!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Polling Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Polling Demo
            <Badge variant={pollingOp.isPolling ? "default" : "secondary"}>
              {pollingOp.isPolling ? "Polling" : "Stopped"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Auto-refreshing data every 3 seconds (affected by network status)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pollingOp.data && (
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Last Update:</strong> {pollingOp.data.timestamp}
              </p>
              <p className="text-sm">
                <strong>Value:</strong> {pollingOp.data.value.toFixed(4)}
              </p>
            </div>
          )}
          {pollingOp.error && (
            <Badge variant="destructive">
              {pollingOp.error.message}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
