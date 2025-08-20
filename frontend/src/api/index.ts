// Re-export all API modules for easy importing
export { authApi } from './auth-api'
export { uavApi } from './uav-api'
export { dashboardApi } from './dashboard-api'

// Re-export the API client
export { default as apiClient } from '@/lib/api-client'

// Re-export types
export * from '@/types'
