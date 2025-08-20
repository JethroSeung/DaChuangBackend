'use client'

import React from 'react'
import { QueryProvider } from './query-provider'
import { ToastProvider } from './toast-provider'
import { MotionProvider } from './motion-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <MotionProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </MotionProvider>
    </QueryProvider>
  )
}

// Re-export individual providers
export { QueryProvider } from './query-provider'
export { ToastProvider } from './toast-provider'
export { MotionProvider } from './motion-provider'
