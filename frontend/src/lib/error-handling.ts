/**
 * Enhanced error handling utilities for the UAV management system
 */

import toast from 'react-hot-toast'

export interface ErrorDetails {
  code: string
  message: string
  details?: any
  timestamp: string
  context?: string
}

export class AppError extends Error {
  public readonly code: string
  public readonly details?: any
  public readonly timestamp: string
  public readonly context?: string

  constructor(code: string, message: string, details?: any, context?: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
    this.context = context
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      context: this.context
    }
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed', details?: any) {
    super('NETWORK_ERROR', message, details, 'network')
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out', details?: any) {
    super('TIMEOUT_ERROR', message, details, 'timeout')
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details, 'validation')
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', message, undefined, 'authentication')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super('AUTHORIZATION_ERROR', message, undefined, 'authorization')
  }
}

/**
 * Enhanced retry configuration
 */
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  retryCondition?: (error: Error) => boolean
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry on network errors and timeouts, but not on client errors
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true
    }
    if (error instanceof AppError) {
      return !['VALIDATION_ERROR', 'AUTH_ERROR', 'AUTHORIZATION_ERROR'].includes(error.code)
    }
    return true
  }
}

/**
 * Enhanced retry function with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      if (attempt === finalConfig.maxAttempts || !finalConfig.retryCondition?.(lastError)) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt - 1),
        finalConfig.maxDelay
      )

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000

      await new Promise(resolve => setTimeout(resolve, jitteredDelay))
    }
  }

  throw lastError!
}

/**
 * Enhanced timeout wrapper
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(timeoutMessage || `Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId))
  })
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  options: {
    fallback?: T
    onError?: (error: Error) => void
    showToast?: boolean
    context?: string
  } = {}
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    const appError = error instanceof AppError
      ? error
      : new AppError('UNKNOWN_ERROR', error instanceof Error ? error.message : String(error), undefined, options.context)

    // Log error
    console.error(`Error in ${options.context || 'operation'}:`, appError.toJSON())

    // Call error handler
    options.onError?.(appError)

    // Show toast notification
    if (options.showToast !== false) {
      showErrorToast(appError)
    }

    return options.fallback
  }
}

/**
 * Error toast display with smart messaging
 */
export function showErrorToast(error: Error | AppError) {
  let message: string
  let description: string | undefined

  if (error instanceof AppError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        message = 'Connection Failed'
        description = 'Please check your internet connection and try again'
        break
      case 'TIMEOUT_ERROR':
        message = 'Request Timed Out'
        description = 'The operation took too long to complete'
        break
      case 'VALIDATION_ERROR':
        message = 'Invalid Input'
        description = error.message
        break
      case 'AUTH_ERROR':
        message = 'Authentication Failed'
        description = 'Please log in again'
        break
      case 'AUTHORIZATION_ERROR':
        message = 'Access Denied'
        description = 'You do not have permission to perform this action'
        break
      default:
        message = 'Something went wrong'
        description = error.message
    }
  } else {
    message = 'Unexpected Error'
    description = error.message
  }

  toast.error(description ? `${message}: ${description}` : message)
}

/**
 * Error boundary helper for React components
 */
export function createErrorHandler(context: string) {
  return (error: Error, errorInfo?: any) => {
    const appError = new AppError(
      'COMPONENT_ERROR',
      `Error in ${context}: ${error.message}`,
      { originalError: error, errorInfo },
      context
    )

    console.error(`Component error in ${context}:`, appError.toJSON())

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  }
}

/**
 * Form validation error handler
 */
export function handleFormErrors(error: Error, setFieldError: (field: string, message: string) => void) {
  if (error instanceof ValidationError && error.details) {
    // Handle field-specific validation errors
    if (typeof error.details === 'object') {
      Object.entries(error.details).forEach(([field, message]) => {
        setFieldError(field, String(message))
      })
      return
    }
  }

  // Show general error toast
  showErrorToast(error)
}

/**
 * API error parser
 */
export function parseApiError(error: any): AppError {
  if (error instanceof AppError) {
    return error
  }

  // Handle fetch/network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new NetworkError('Unable to connect to server')
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return new TimeoutError()
  }

  // Handle HTTP errors
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    if (status === 401) {
      return new AuthenticationError(data?.message || 'Authentication required')
    }

    if (status === 403) {
      return new AuthorizationError(data?.message || 'Access forbidden')
    }

    if (status >= 400 && status < 500) {
      return new ValidationError(data?.message || 'Invalid request', data?.details)
    }

    if (status >= 500) {
      return new AppError('SERVER_ERROR', data?.message || 'Server error', data)
    }
  }

  // Default error
  return new AppError(
    'UNKNOWN_ERROR',
    error.message || 'An unexpected error occurred',
    error
  )
}

/**
 * Loading state manager
 */
export class LoadingManager {
  private loadingStates = new Map<string, boolean>()
  private callbacks = new Set<(states: Record<string, boolean>) => void>()

  setLoading(key: string, loading: boolean) {
    this.loadingStates.set(key, loading)
    this.notifyCallbacks()
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false
  }

  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(Boolean)
  }

  subscribe(callback: (states: Record<string, boolean>) => void) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private notifyCallbacks() {
    const states = Object.fromEntries(this.loadingStates)
    this.callbacks.forEach(callback => callback(states))
  }

  clear() {
    this.loadingStates.clear()
    this.notifyCallbacks()
  }
}

export const globalLoadingManager = new LoadingManager()
