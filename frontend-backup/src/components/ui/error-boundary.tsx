'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (e.g., Sentry)
      console.error('Production error:', error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props
    const { hasError } = this.state

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      if (resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetError()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback: Fallback } = this.props

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetError} errorInfo={errorInfo} />
      }

      return <DefaultErrorFallback error={error} resetError={this.resetError} errorInfo={errorInfo} />
    }

    return children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <Card className="w-full max-w-2xl mx-auto border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>
          An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDevelopment && (
          <Alert variant="destructive">
            <AlertDescription>
              <details className="whitespace-pre-wrap">
                <summary className="cursor-pointer font-medium mb-2">Error Details (Development)</summary>
                <div className="text-sm font-mono">
                  <strong>Error:</strong> {error.message}
                  {error.stack && (
                    <>
                      <br />
                      <strong>Stack:</strong>
                      <br />
                      {error.stack}
                    </>
                  )}
                  {errorInfo?.componentStack && (
                    <>
                      <br />
                      <strong>Component Stack:</strong>
                      <br />
                      {errorInfo.componentStack}
                    </>
                  )}
                </div>
              </details>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={resetError} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact error fallback for smaller components
export function CompactErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Error: {error.message}</span>
        <Button onClick={resetError} size="sm" variant="outline">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// Hook for using error boundary programmatically
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
