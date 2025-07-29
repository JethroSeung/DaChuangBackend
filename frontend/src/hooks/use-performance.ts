'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

// Performance metrics interface
interface PerformanceMetrics {
  renderTime: number
  mountTime: number
  updateCount: number
  lastUpdate: number
  memoryUsage?: number
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const mountTime = useRef<number>(0)
  const updateCount = useRef<number>(0)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastUpdate: 0,
  })

  // Start render timing
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])

  // End render timing
  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current
      updateCount.current += 1
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        updateCount: updateCount.current,
        lastUpdate: Date.now(),
      }))

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  // Track component mount time
  useEffect(() => {
    const start = performance.now()
    mountTime.current = start

    return () => {
      const mountDuration = performance.now() - start
      setMetrics(prev => ({
        ...prev,
        mountTime: mountDuration,
      }))
    }
  }, [])

  // Memory usage tracking (if available)
  useEffect(() => {
    if ('memory' in performance) {
      const updateMemory = () => {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (performance as any).memory?.usedJSHeapSize,
        }))
      }

      updateMemory()
      const interval = setInterval(updateMemory, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [])

  return {
    startRender,
    endRender,
    metrics,
  }
}

// Hook for measuring async operations
export function useAsyncPerformance() {
  const [operations, setOperations] = useState<Map<string, number>>(new Map())

  const startOperation = useCallback((operationName: string) => {
    setOperations(prev => new Map(prev.set(operationName, performance.now())))
  }, [])

  const endOperation = useCallback((operationName: string) => {
    setOperations(prev => {
      const startTime = prev.get(operationName)
      if (startTime) {
        const duration = performance.now() - startTime
        
        // Log slow operations in development
        if (process.env.NODE_ENV === 'development' && duration > 1000) {
          console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`)
        }
        
        const newMap = new Map(prev)
        newMap.delete(operationName)
        return newMap
      }
      return prev
    })
  }, [])

  return {
    startOperation,
    endOperation,
    activeOperations: operations,
  }
}

// Hook for intersection observer performance
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, options, hasIntersected])

  return { isIntersecting, hasIntersected }
}

// Hook for debouncing values to improve performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now()
          callback(...args)
        }, delay - (now - lastCall.current))
      }
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

// Hook for measuring component re-renders
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0)
  const lastProps = useRef<any>()

  renderCount.current += 1

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`)
    }
  })

  const logPropsChange = useCallback((props: any) => {
    if (process.env.NODE_ENV === 'development' && lastProps.current) {
      const changedProps = Object.keys(props).filter(
        key => props[key] !== lastProps.current[key]
      )
      
      if (changedProps.length > 0) {
        console.log(`${componentName} re-rendered due to props change:`, changedProps)
      }
    }
    lastProps.current = props
  }, [componentName])

  return {
    renderCount: renderCount.current,
    logPropsChange,
  }
}

// Hook for lazy loading images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = useRef<HTMLImageElement>()

  const { isIntersecting } = useIntersectionObserver(
    { current: imgRef.current } as React.RefObject<Element>
  )

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !isError) {
      const img = new Image()
      
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      
      img.onerror = () => {
        setIsError(true)
      }
      
      img.src = src
    }
  }, [isIntersecting, src, isLoaded, isError])

  return {
    imageSrc,
    isLoaded,
    isError,
    imgRef,
  }
}

// Performance context for global performance tracking
export interface PerformanceContextValue {
  trackEvent: (eventName: string, duration: number) => void
  getMetrics: () => Record<string, number[]>
  clearMetrics: () => void
}

// Global performance tracker
class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map()

  trackEvent(eventName: string, duration: number) {
    const existing = this.metrics.get(eventName) || []
    existing.push(duration)
    
    // Keep only last 100 measurements
    if (existing.length > 100) {
      existing.shift()
    }
    
    this.metrics.set(eventName, existing)
  }

  getMetrics() {
    const result: Record<string, number[]> = {}
    this.metrics.forEach((values, key) => {
      result[key] = [...values]
    })
    return result
  }

  getAverageMetric(eventName: string): number {
    const values = this.metrics.get(eventName) || []
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  clearMetrics() {
    this.metrics.clear()
  }
}

export const performanceTracker = new PerformanceTracker()

// Hook to use global performance tracker
export function useGlobalPerformance() {
  return {
    trackEvent: performanceTracker.trackEvent.bind(performanceTracker),
    getMetrics: performanceTracker.getMetrics.bind(performanceTracker),
    getAverageMetric: performanceTracker.getAverageMetric.bind(performanceTracker),
    clearMetrics: performanceTracker.clearMetrics.bind(performanceTracker),
  }
}
