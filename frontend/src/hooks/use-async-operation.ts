/**
 * Enhanced hook for managing async operations with loading states, error handling, and retry logic
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  AppError,
  withRetry,
  withTimeout,
  safeAsync,
  RetryConfig,
  parseApiError,
  showErrorToast
} from '@/lib/error-handling'

export interface AsyncOperationOptions {
  timeout?: number
  retryConfig?: Partial<RetryConfig>
  showErrorToast?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: AppError) => void
  immediate?: boolean
}

export interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: AppError | null
  lastUpdated: Date | null
}

export interface AsyncOperationActions<T> {
  execute: (...args: any[]) => Promise<T | undefined>
  retry: () => Promise<T | undefined>
  reset: () => void
  cancel: () => void
}

export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions = {}
): AsyncOperationState<T> & AsyncOperationActions<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const lastArgsRef = useRef<any[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [])

  const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
    // Cancel previous operation
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    // Store args for retry
    lastArgsRef.current = args

    if (!mountedRef.current) return

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      const wrappedOperation = async () => {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Operation was cancelled')
        }
        return await operation(...args)
      }

      let result: T

      // Apply timeout if specified
      if (options.timeout) {
        result = await withTimeout(
          withRetry(wrappedOperation, options.retryConfig),
          options.timeout
        )
      } else {
        result = await withRetry(wrappedOperation, options.retryConfig)
      }

      if (!mountedRef.current) return

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }))

      options.onSuccess?.(result)
      return result

    } catch (error) {
      if (!mountedRef.current) return

      const appError = parseApiError(error)

      setState(prev => ({
        ...prev,
        loading: false,
        error: appError,
        lastUpdated: new Date()
      }))

      options.onError?.(appError)

      if (options.showErrorToast !== false) {
        showErrorToast(appError)
      }

      return undefined
    }
  }, [operation, options])

  const retry = useCallback(async (): Promise<T | undefined> => {
    return execute(...lastArgsRef.current)
  }, [execute])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    })
  }, [])

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setState(prev => ({
      ...prev,
      loading: false
    }))
  }, [])

  // Execute immediately if requested
  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [options.immediate, execute])

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel
  }
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncOperations<T extends Record<string, (...args: any[]) => Promise<any>>>(
  operations: T,
  globalOptions: AsyncOperationOptions = {}
) {
  const [states, setStates] = useState<Record<keyof T, AsyncOperationState<any>>>(() => {
    const initialStates: any = {}
    Object.keys(operations).forEach(key => {
      initialStates[key] = {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null
      }
    })
    return initialStates
  })

  const abortControllersRef = useRef<Record<string, AbortController>>({})
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      Object.values(abortControllersRef.current).forEach(controller => {
        controller.abort()
      })
    }
  }, [])

  const createExecutor = useCallback((key: keyof T, operation: Function) => {
    return async (...args: any[]) => {
      // Cancel previous operation for this key
      abortControllersRef.current[key as string]?.abort()
      abortControllersRef.current[key as string] = new AbortController()

      if (!mountedRef.current) return

      setStates(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: true,
          error: null
        }
      }))

      try {
        const wrappedOperation = async () => {
          if (abortControllersRef.current[key as string]?.signal.aborted) {
            throw new Error('Operation was cancelled')
          }
          return await operation(...args)
        }

        let result: any

        if (globalOptions.timeout) {
          result = await withTimeout(
            withRetry(wrappedOperation, globalOptions.retryConfig),
            globalOptions.timeout
          )
        } else {
          result = await withRetry(wrappedOperation, globalOptions.retryConfig)
        }

        if (!mountedRef.current) return

        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            data: result,
            loading: false,
            error: null,
            lastUpdated: new Date()
          }
        }))

        globalOptions.onSuccess?.(result)
        return result

      } catch (error) {
        if (!mountedRef.current) return

        const appError = parseApiError(error)

        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            loading: false,
            error: appError,
            lastUpdated: new Date()
          }
        }))

        globalOptions.onError?.(appError)

        if (globalOptions.showErrorToast !== false) {
          showErrorToast(appError)
        }

        return undefined
      }
    }
  }, [globalOptions])

  const executors = Object.fromEntries(
    Object.entries(operations).map(([key, operation]) => [
      key,
      createExecutor(key, operation)
    ])
  ) as Record<keyof T, (...args: any[]) => Promise<any>>

  const isAnyLoading = Object.values(states).some(state => state.loading)
  const hasAnyError = Object.values(states).some(state => state.error)

  const resetAll = useCallback(() => {
    Object.values(abortControllersRef.current).forEach(controller => {
      controller.abort()
    })
    setStates(prev => {
      const newStates: any = {}
      Object.keys(prev).forEach(key => {
        newStates[key] = {
          data: null,
          loading: false,
          error: null,
          lastUpdated: null
        }
      })
      return newStates
    })
  }, [])

  const cancelAll = useCallback(() => {
    Object.values(abortControllersRef.current).forEach(controller => {
      controller.abort()
    })
    setStates(prev => {
      const newStates: any = {}
      Object.keys(prev).forEach(key => {
        newStates[key] = {
          ...prev[key],
          loading: false
        }
      })
      return newStates
    })
  }, [])

  return {
    states,
    executors,
    isAnyLoading,
    hasAnyError,
    resetAll,
    cancelAll
  }
}

/**
 * Hook for polling data with error handling and retry logic
 */
export function usePolling<T>(
  operation: () => Promise<T>,
  interval: number,
  options: AsyncOperationOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...asyncOptions } = options
  const asyncOp = useAsyncOperation(operation, asyncOptions)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const executeRef = useRef(asyncOp.execute)

  // Update the ref when execute changes
  useEffect(() => {
    executeRef.current = asyncOp.execute
  }, [asyncOp.execute])

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      if (enabled && !asyncOp.loading) {
        executeRef.current()
      }
    }, interval)
  }, [enabled, interval, asyncOp.loading])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      // Initial fetch
      executeRef.current()
      // Start polling
      startPolling()
    } else {
      stopPolling()
    }

    return stopPolling
  }, [enabled, startPolling, stopPolling])

  return {
    ...asyncOp,
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null
  }
}
