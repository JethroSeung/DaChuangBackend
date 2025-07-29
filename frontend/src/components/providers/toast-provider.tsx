'use client'

import React, { createContext, useContext } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ToastContainer } from '@/components/ui/animated-alert'
import { AlertType } from '@/components/ui/animated-alert'

interface ToastContextType {
  addToast: (toast: { type: AlertType; title?: string; description: string; duration?: number }) => void
  success: (description: string, title?: string, duration?: number) => void
  error: (description: string, title?: string, duration?: number) => void
  warning: (description: string, title?: string, duration?: number) => void
  info: (description: string, title?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, addToast, removeToast, success, error, warning, info } = useToast()

  const contextValue: ToastContextType = {
    addToast,
    success,
    error,
    warning,
    info,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toasts.map(toast => ({
          ...toast,
          onRemove: removeToast,
        }))} 
        position="top-right" 
      />
    </ToastContext.Provider>
  )
}
