'use client'

import { useState, useEffect, useCallback } from 'react'

// Breakpoint definitions matching Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

// Hook to get current screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const updateSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    updateSize()

    // Add event listener
    window.addEventListener('resize', updateSize)

    // Cleanup
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return screenSize
}

// Hook to check if screen matches a specific breakpoint
export function useBreakpoint(breakpoint: Breakpoint) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const query = `(min-width: ${breakpoints[breakpoint]}px)`
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [breakpoint])

  return matches
}

// Hook to get current breakpoint
export function useCurrentBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint | null>(null)
  const screenSize = useScreenSize()

  useEffect(() => {
    const width = screenSize.width
    
    if (width >= breakpoints['2xl']) {
      setCurrentBreakpoint('2xl')
    } else if (width >= breakpoints.xl) {
      setCurrentBreakpoint('xl')
    } else if (width >= breakpoints.lg) {
      setCurrentBreakpoint('lg')
    } else if (width >= breakpoints.md) {
      setCurrentBreakpoint('md')
    } else if (width >= breakpoints.sm) {
      setCurrentBreakpoint('sm')
    } else {
      setCurrentBreakpoint(null) // xs
    }
  }, [screenSize.width])

  return currentBreakpoint
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}) {
  const currentBreakpoint = useCurrentBreakpoint()
  const screenSize = useScreenSize()

  const getValue = useCallback(() => {
    const width = screenSize.width

    // Find the appropriate value based on current screen size
    if (width >= breakpoints['2xl'] && values['2xl'] !== undefined) {
      return values['2xl']
    }
    if (width >= breakpoints.xl && values.xl !== undefined) {
      return values.xl
    }
    if (width >= breakpoints.lg && values.lg !== undefined) {
      return values.lg
    }
    if (width >= breakpoints.md && values.md !== undefined) {
      return values.md
    }
    if (width >= breakpoints.sm && values.sm !== undefined) {
      return values.sm
    }
    
    return values.xs
  }, [screenSize.width, values])

  return getValue()
}

// Hook to check if device is mobile
export function useIsMobile() {
  const isMd = useBreakpoint('md')
  return !isMd
}

// Hook to check if device is tablet
export function useIsTablet() {
  const isMd = useBreakpoint('md')
  const isLg = useBreakpoint('lg')
  return isMd && !isLg
}

// Hook to check if device is desktop
export function useIsDesktop() {
  const isLg = useBreakpoint('lg')
  return isLg
}

// Hook for responsive grid columns
export function useResponsiveColumns(config: {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  '2xl'?: number
}) {
  return useResponsiveValue(config) || 1
}

// Hook for responsive spacing
export function useResponsiveSpacing(config: {
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
}) {
  return useResponsiveValue(config) || '1rem'
}

// Hook to detect orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

// Hook to detect if device supports touch
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

// Hook for responsive font sizes
export function useResponsiveFontSize(config: {
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
}) {
  return useResponsiveValue(config) || '1rem'
}

// Hook to get responsive container padding
export function useResponsiveContainerPadding() {
  return useResponsiveValue({
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
    '2xl': '3.5rem',
  })
}

// Hook for responsive modal/dialog sizing
export function useResponsiveModalSize() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  if (isMobile) {
    return {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      borderRadius: '0',
    }
  }

  if (isTablet) {
    return {
      width: '90%',
      height: 'auto',
      maxWidth: '600px',
      maxHeight: '90vh',
      borderRadius: '0.5rem',
    }
  }

  return {
    width: 'auto',
    height: 'auto',
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: '0.5rem',
  }
}

// Hook for responsive table behavior
export function useResponsiveTable() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  return {
    shouldUseCards: isMobile,
    shouldStackColumns: isMobile || isTablet,
    maxVisibleColumns: isMobile ? 2 : isTablet ? 4 : 8,
    showExpandButton: isMobile,
  }
}

// Hook for responsive navigation
export function useResponsiveNavigation() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  return {
    shouldUseMobileMenu: isMobile,
    shouldUseBottomNav: isMobile,
    shouldCollapseSidebar: isMobile || isTablet,
    maxVisibleNavItems: isMobile ? 4 : isTablet ? 6 : 10,
  }
}

// Hook for responsive form layout
export function useResponsiveForm() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  return {
    shouldUseSteps: isMobile,
    shouldStackFields: isMobile,
    fieldsPerRow: isMobile ? 1 : isTablet ? 2 : 3,
    shouldUseFullWidth: isMobile,
  }
}

// Hook for responsive chart sizing
export function useResponsiveChart() {
  const screenSize = useScreenSize()
  const isMobile = useIsMobile()

  return {
    width: isMobile ? screenSize.width - 32 : 'auto', // Account for padding
    height: isMobile ? 200 : 300,
    shouldSimplify: isMobile,
    shouldHideLegend: isMobile,
    fontSize: isMobile ? 10 : 12,
  }
}

// Utility function to get responsive class names
export function getResponsiveClasses(config: {
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
}) {
  const classes = []
  
  if (config.xs) classes.push(config.xs)
  if (config.sm) classes.push(`sm:${config.sm}`)
  if (config.md) classes.push(`md:${config.md}`)
  if (config.lg) classes.push(`lg:${config.lg}`)
  if (config.xl) classes.push(`xl:${config.xl}`)
  if (config['2xl']) classes.push(`2xl:${config['2xl']}`)
  
  return classes.join(' ')
}

// Utility function to create responsive grid classes
export function getResponsiveGridClasses(config: {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  '2xl'?: number
}) {
  return getResponsiveClasses({
    xs: config.xs ? `grid-cols-${config.xs}` : undefined,
    sm: config.sm ? `grid-cols-${config.sm}` : undefined,
    md: config.md ? `grid-cols-${config.md}` : undefined,
    lg: config.lg ? `grid-cols-${config.lg}` : undefined,
    xl: config.xl ? `grid-cols-${config.xl}` : undefined,
    '2xl': config['2xl'] ? `grid-cols-${config['2xl']}` : undefined,
  })
}

// Context for responsive design
export interface ResponsiveContextValue {
  screenSize: { width: number; height: number }
  currentBreakpoint: Breakpoint | null
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  isTouch: boolean
}

// Hook to use responsive context
export function useResponsive(): ResponsiveContextValue {
  const screenSize = useScreenSize()
  const currentBreakpoint = useCurrentBreakpoint()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const orientation = useOrientation()
  const isTouch = useIsTouchDevice()

  return {
    screenSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    isTouch,
  }
}
