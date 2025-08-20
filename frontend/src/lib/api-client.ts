'use client'

import { ApiResponse, ApiError, RequestConfig } from '@/types'

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private authToken: string | null = null

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') {
    this.baseURL = baseURL.replace(/\/$/, '') // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }

    // Load auth token from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_token')
      if (stored) {
        this.authToken = stored
      }
    }
  }

  setAuthToken(token: string) {
    this.authToken = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearAuthToken() {
    this.authToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders }
    
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    let data: any
    if (isJson) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const error: ApiError = {
        code: response.status.toString(),
        message: data?.message || data || `HTTP ${response.status}`,
        details: data?.details,
        timestamp: new Date().toISOString(),
      }
      throw error
    }

    // If the response is wrapped in an ApiResponse format
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        const error: ApiError = {
          code: data.code || 'API_ERROR',
          message: data.message || 'API request failed',
          details: data.details,
          timestamp: data.timestamp || new Date().toISOString(),
        }
        throw error
      }
      return data.data || data
    }

    return data
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = this.getHeaders(config?.headers)

    const requestConfig: RequestInit = {
      method,
      headers,
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      if (data instanceof FormData) {
        // Remove Content-Type header for FormData (browser will set it with boundary)
        delete headers['Content-Type']
        requestConfig.body = data
      } else {
        requestConfig.body = JSON.stringify(data)
      }
    }

    // Add timeout if specified
    if (config?.timeout) {
      const controller = new AbortController()
      requestConfig.signal = controller.signal
      setTimeout(() => controller.abort(), config.timeout)
    }

    let lastError: any
    const maxRetries = config?.retries || 0
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, requestConfig)
        return await this.handleResponse<T>(response)
      } catch (error) {
        lastError = error
        
        // Don't retry on certain errors
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        
        if (error && typeof error === 'object' && 'code' in error) {
          const apiError = error as ApiError
          // Don't retry on client errors (4xx)
          if (apiError.code.startsWith('4')) {
            throw error
          }
        }

        // Wait before retrying
        if (attempt < maxRetries && config?.retryDelay) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay))
        }
      }
    }

    throw lastError
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, undefined, config)
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data, config)
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data, config)
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('PATCH', endpoint, data, config)
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, config)
  }

  // Utility methods for common patterns
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.post<T>(endpoint, formData)
  }

  async downloadFile(endpoint: string): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`
    const headers = this.getHeaders()

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    return response.blob()
  }

  // WebSocket connection helper
  createWebSocket(endpoint: string): WebSocket {
    const protocol = this.baseURL.startsWith('https') ? 'wss' : 'ws'
    const wsUrl = `${protocol}://${this.baseURL.replace(/^https?:\/\//, '')}${endpoint}`
    
    const ws = new WebSocket(wsUrl)
    
    // Add auth token to WebSocket if available
    if (this.authToken) {
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token: this.authToken
        }))
      })
    }

    return ws
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }

  // Get API version
  async getVersion(): Promise<{ version: string; buildTime: string }> {
    return this.get('/version')
  }
}

// Create singleton instance
const apiClient = new ApiClient()

export default apiClient
export { ApiClient }
