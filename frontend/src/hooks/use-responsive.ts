'use client'

import { useState, useEffect } from 'react'

interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < breakpoints.md
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg
  const isLargeDesktop = windowSize.width >= breakpoints.xl

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoints,
    // Utility functions
    isAtLeast: (breakpoint: keyof BreakpointConfig) => windowSize.width >= breakpoints[breakpoint],
    isBelow: (breakpoint: keyof BreakpointConfig) => windowSize.width < breakpoints[breakpoint],
  }
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Predefined responsive hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsLargeScreen() {
  return useMediaQuery('(min-width: 1280px)')
}

// Hook for responsive text sizing
export function useResponsiveText() {
  const { isMobile, isTablet } = useResponsive()

  const getTextSize = (base: string, mobile?: string, tablet?: string) => {
    if (isMobile && mobile) return mobile
    if (isTablet && tablet) return tablet
    return base
  }

  return { getTextSize }
}

// Hook for responsive spacing
export function useResponsiveSpacing() {
  const { isMobile, isTablet } = useResponsive()

  const getSpacing = (base: string, mobile?: string, tablet?: string) => {
    if (isMobile && mobile) return mobile
    if (isTablet && tablet) return tablet
    return base
  }

  return { getSpacing }
}
