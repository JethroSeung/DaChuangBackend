import { useState, useCallback } from 'react'
import { AlertType } from '@/components/ui/animated-alert'

interface ToastData {
  id: string
  type: AlertType
  title?: string
  description: string
  duration?: number
}

interface UseToastReturn {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  success: (description: string, title?: string, duration?: number) => void
  error: (description: string, title?: string, duration?: number) => void
  warning: (description: string, title?: string, duration?: number) => void
  info: (description: string, title?: string, duration?: number) => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = {
      id,
      duration: 5000,
      ...toast,
    }

    setToasts((prev) => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((description: string, title?: string, duration?: number) => {
    addToast({ type: 'success', description, title, duration })
  }, [addToast])

  const error = useCallback((description: string, title?: string, duration?: number) => {
    addToast({ type: 'error', description, title, duration })
  }, [addToast])

  const warning = useCallback((description: string, title?: string, duration?: number) => {
    addToast({ type: 'warning', description, title, duration })
  }, [addToast])

  const info = useCallback((description: string, title?: string, duration?: number) => {
    addToast({ type: 'info', description, title, duration })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}
