'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Loading fallback component
export function LoadingFallback({ message = 'Loading...' }: { message?: string }) {
  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Map loading fallback
export function MapLoadingFallback() {
  return (
    <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )
}

// Chart loading fallback
export function ChartLoadingFallback() {
  return (
    <div className="h-80 w-full bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading chart...</p>
      </div>
    </div>
  )
}

// Lazy loaded components with optimized loading
export const LazyInteractiveMap = dynamic(
  () => import('@/components/features/map/interactive-map'),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  }
)

export const LazyDashboardCharts = dynamic(
  () => import('@/components/features/dashboard/dashboard-charts').then(mod => ({ default: mod.DashboardCharts })),
  {
    ssr: false,
    loading: () => <ChartLoadingFallback />,
  }
)

export const LazyRealtimeAlerts = dynamic(
  () => import('@/components/features/dashboard/realtime-alerts').then(mod => ({ default: mod.RealtimeAlerts })),
  {
    ssr: false,
    loading: () => <LoadingFallback message="Loading alerts..." />,
  }
)

export const LazySystemHealth = dynamic(
  () => import('@/components/features/dashboard/system-health').then(mod => ({ default: mod.SystemHealth })),
  {
    ssr: false,
    loading: () => <LoadingFallback message="Loading system health..." />,
  }
)

export const LazyUAVForm = dynamic(
  () => import('@/components/features/uav/uav-form').then(mod => ({ default: mod.UAVForm })),
  {
    ssr: false,
    loading: () => <LoadingFallback message="Loading UAV form..." />,
  }
)

export const LazyUAVDetails = dynamic(
  () => import('@/components/features/uav/uav-details').then(mod => ({ default: mod.UAVDetails })),
  {
    ssr: false,
    loading: () => <LoadingFallback message="Loading UAV details..." />,
  }
)

// Higher-order component for lazy loading with error boundary
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ComponentType
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export function LazyWrapper({ 
  children, 
  fallback: Fallback = LoadingFallback,
  errorFallback: ErrorFallback 
}: LazyWrapperProps) {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    setHasError(false)
    setError(null)
  }, [children])

  const retry = React.useCallback(() => {
    setHasError(false)
    setError(null)
  }, [])

  if (hasError && error && ErrorFallback) {
    return <ErrorFallback error={error} retry={retry} />
  }

  return (
    <Suspense fallback={<Fallback />}>
      <ErrorBoundary onError={(error) => {
        setHasError(true)
        setError(error)
      }}>
        {children}
      </ErrorBoundary>
    </Suspense>
  )
}

// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full border-red-200">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Component Error</h3>
            <p className="text-red-600 text-sm mb-4">
              {this.state.error?.message || 'An error occurred while loading this component'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, options])

  return isIntersecting
}

// Lazy loading component with intersection observer
interface LazyOnScrollProps {
  children: React.ReactNode
  fallback?: React.ComponentType
  rootMargin?: string
  threshold?: number
}

export function LazyOnScroll({ 
  children, 
  fallback: Fallback = LoadingFallback,
  rootMargin = '100px',
  threshold = 0.1 
}: LazyOnScrollProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(ref as React.RefObject<Element>, { rootMargin, threshold })
  const [hasLoaded, setHasLoaded] = React.useState(false)

  React.useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isIntersecting, hasLoaded])

  return (
    <div ref={ref}>
      {hasLoaded ? children : <Fallback />}
    </div>
  )
}

// Preload component for critical resources
export function PreloadCriticalResources() {
  React.useEffect(() => {
    // Preload critical fonts
    const fontLinks = [
      '/fonts/orbitron-variable.woff2',
      '/fonts/inter-variable.woff2',
    ]

    fontLinks.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = href
      document.head.appendChild(link)
    })

    // Preload critical images
    const criticalImages = [
      '/images/logo.svg',
      '/images/uav-icon.svg',
    ]

    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }, [])

  return null
}
