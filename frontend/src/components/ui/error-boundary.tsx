'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// Default error fallback component that can use hooks
function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  const { t } = useTranslation('common')

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {t('somethingWentWrong')}
        </CardTitle>
        <CardDescription>
          {t('errorOccurred')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <code>{error.message}</code>
          </div>
        )}
        <Button onClick={resetError} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('tryAgain')}
        </Button>
      </CardContent>
    </Card>
  )
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Hook version for functional components
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
