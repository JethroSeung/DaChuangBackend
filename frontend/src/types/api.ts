export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
  id?: string
}

export interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectDelay?: number
  heartbeatInterval?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  permissions: Permission[]
  lastLogin?: string
  createdAt: string
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

export interface Permission {
  resource: string
  actions: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

// API Endpoints
export interface ApiEndpoints {
  // Authentication
  login: string
  logout: string
  refresh: string
  profile: string

  // UAV Management
  uavs: string
  uavById: (id: string) => string
  uavCreate: string
  uavUpdate: (id: string) => string
  uavDelete: (id: string) => string
  uavStats: string

  // Hibernate Pod
  hibernatePods: string
  hibernatePodById: (id: string) => string
  hibernatePodAdd: string
  hibernatePodRemove: string

  // Docking Stations
  dockingStations: string
  dockingStationById: (id: string) => string
  dockingStationStatus: (id: string) => string

  // Dashboard
  dashboardMetrics: string
  systemHealth: string
  alerts: string
  alertAcknowledge: (id: string) => string

  // Real-time
  websocket: string
}

export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filter?: Record<string, any>
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FileUploadResponse {
  id: string
  filename: string
  size: number
  url: string
  mimeType: string
}

export interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete'
  data: T[]
}

export interface BatchResponse<T> {
  successful: T[]
  failed: Array<{
    data: T
    error: string
  }>
  summary: {
    total: number
    successful: number
    failed: number
  }
}
