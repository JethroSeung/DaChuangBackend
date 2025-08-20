'use client'

import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getWebSocketService } from '@/lib/websocket-service'
import { MotionProvider } from '@/components/providers/motion-provider'
import { ToastProvider } from '@/components/providers/toast-provider'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize WebSocket connection when app starts
    const wsService = getWebSocketService()
    
    // Cleanup on unmount
    return () => {
      wsService.disconnect()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <MotionProvider>
        <ToastProvider>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ToastProvider>
      </MotionProvider>
    </QueryClientProvider>
  )
}
