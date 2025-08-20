'use client'

import React from 'react'
import { QueryProvider } from './query-provider'
import { ToastProvider } from './toast-provider'
import { MotionProvider } from './motion-provider'
import { I18nProvider } from './i18n-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <QueryProvider>
        <MotionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </MotionProvider>
      </QueryProvider>
    </I18nProvider>
  )
}

// Re-export individual providers
export { QueryProvider } from './query-provider'
export { ToastProvider } from './toast-provider'
export { MotionProvider } from './motion-provider'
export { I18nProvider } from './i18n-provider'
