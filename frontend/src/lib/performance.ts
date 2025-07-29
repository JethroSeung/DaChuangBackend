// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordNavigationMetrics(entry as PerformanceNavigationTiming)
        }
      })
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordResourceMetrics(entry as PerformanceResourceTiming)
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordLCPMetrics(entry as PerformanceEntry)
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordFIDMetrics(entry as PerformanceEventTiming)
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
    }

    this.logMetrics('Navigation Timing', metrics)
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    if (entry.duration > 100) { // Only log slow resources
      const metrics = {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        type: this.getResourceType(entry.name),
      }

      this.logMetrics('Slow Resource', metrics)
    }
  }

  private recordLCPMetrics(entry: PerformanceEntry) {
    this.logMetrics('Largest Contentful Paint', {
      value: entry.startTime,
      element: (entry as any).element?.tagName,
    })
  }

  private recordFIDMetrics(entry: PerformanceEventTiming) {
    this.logMetrics('First Input Delay', {
      value: entry.processingStart - entry.startTime,
      eventType: entry.name,
    })
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : null
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : null
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  // Public API
  startTiming(name: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      metadata,
    }
    this.metrics.set(name, metric)
  }

  endTiming(name: string) {
    const metric = this.metrics.get(name)
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
      this.logMetrics(`Custom Timing: ${name}`, { duration: metric.duration })
      this.metrics.delete(name)
    }
  }

  measureFunction<T>(name: string, fn: () => T): T {
    this.startTiming(name)
    try {
      const result = fn()
      this.endTiming(name)
      return result
    } catch (error) {
      this.endTiming(name)
      throw error
    }
  }

  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(name)
    try {
      const result = await fn()
      this.endTiming(name)
      return result
    } catch (error) {
      this.endTiming(name)
      throw error
    }
  }

  getWebVitals() {
    return {
      fcp: this.getFirstContentfulPaint(),
      lcp: this.getLargestContentfulPaint(),
      fid: this.getFirstInputDelay(),
      cls: this.getCumulativeLayoutShift(),
      ttfb: this.getTimeToFirstByte(),
    }
  }

  private getLargestContentfulPaint(): number | null {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null
  }

  private getFirstInputDelay(): number | null {
    const fidEntries = performance.getEntriesByType('first-input')
    return fidEntries.length > 0 ? 
      (fidEntries[0] as PerformanceEventTiming).processingStart - fidEntries[0].startTime : null
  }

  private getCumulativeLayoutShift(): number {
    let cls = 0
    const clsEntries = performance.getEntriesByType('layout-shift')
    for (const entry of clsEntries) {
      if (!(entry as any).hadRecentInput) {
        cls += (entry as any).value
      }
    }
    return cls
  }

  private getTimeToFirstByte(): number | null {
    const navigationEntries = performance.getEntriesByType('navigation')
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0] as PerformanceNavigationTiming
      return nav.responseStart - nav.requestStart
    }
    return null
  }

  private logMetrics(category: string, metrics: any) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 Performance: ${category}`)
      console.table(metrics)
      console.groupEnd()
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(category, metrics)
    }
  }

  private sendToAnalytics(category: string, metrics: any) {
    // Implement your analytics service integration here
    // For example, Google Analytics, DataDog, New Relic, etc.
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metric', {
          event_category: category,
          event_label: JSON.stringify(metrics),
          value: Math.round(metrics.duration || metrics.value || 0),
        })
      }
    } catch (error) {
      console.error('Failed to send performance metrics to analytics:', error)
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    getWebVitals: performanceMonitor.getWebVitals.bind(performanceMonitor),
  }
}

// Utility functions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map()
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Lazy loading utilities
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc)
  
  return (props: React.ComponentProps<T>) =>
    React.createElement(React.Suspense,
      { fallback: fallback ? React.createElement(fallback) : React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props)
    )
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  quality: number = 75
): string {
  if (src.startsWith('http')) {
    // External image - use Next.js Image Optimization API
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
    })
    if (height) params.set('h', height.toString())
    
    return `/_next/image?${params.toString()}`
  }
  
  return src // Local images are handled by Next.js automatically
}

// Bundle size monitoring
export function logBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    
    console.group('📦 Bundle Analysis')
    console.log('Scripts:', scripts.length)
    console.log('Stylesheets:', styles.length)
    console.groupEnd()
  }
}
