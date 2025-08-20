'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { prefersReducedMotion, getTransition, transitions } from '@/lib/animations'

interface MotionContextType {
  reducedMotion: boolean
  toggleReducedMotion: () => void
}

const MotionContext = createContext<MotionContextType | undefined>(undefined)

export function useMotionPreference() {
  const context = useContext(MotionContext)
  if (context === undefined) {
    throw new Error('useMotionPreference must be used within a MotionProvider')
  }
  return context
}

interface MotionProviderProps {
  children: React.ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check initial preference
    setReducedMotion(prefersReducedMotion())

    // Listen for changes in motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion)
  }

  const motionConfig = {
    transition: reducedMotion ? { duration: 0.01 } : transitions.default,
    reducedMotion: reducedMotion ? 'always' : 'never',
  }

  return (
    <MotionContext.Provider value={{ reducedMotion, toggleReducedMotion }}>
      <MotionConfig {...motionConfig}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  )
}
