'use client'

import apiClient from '@/lib/api-client'
import { 
  DashboardMetrics, 
  Alert, 
  SystemHealth, 
  UAVActivityChart, 
  BatteryChart, 
  SystemPerformanceChart,
  WeatherData,
  TimeRange 
} from '@/types'

export class DashboardApi {
  private basePath = '/api/dashboard'

  // Dashboard metrics
  async getMetrics(): Promise<DashboardMetrics> {
    return apiClient.get<DashboardMetrics>(`${this.basePath}/metrics`)
  }

  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get<SystemHealth>(`${this.basePath}/health`)
  }

  async getSystemStatus(): Promise<{ status: string; uptime: number; version: string }> {
    return apiClient.get(`${this.basePath}/status`)
  }

  // Alerts management
  async getAlerts(params?: { 
    acknowledged?: boolean
    severity?: string[]
    type?: string[]
    limit?: number
    offset?: number
  }): Promise<Alert[]> {
    const searchParams = new URLSearchParams()
    
    if (params?.acknowledged !== undefined) {
      searchParams.set('acknowledged', params.acknowledged.toString())
    }
    if (params?.severity) {
      params.severity.forEach(s => searchParams.append('severity', s))
    }
    if (params?.type) {
      params.type.forEach(t => searchParams.append('type', t))
    }
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    const endpoint = query ? `${this.basePath}/alerts?${query}` : `${this.basePath}/alerts`
    
    return apiClient.get<Alert[]>(endpoint)
  }

  async acknowledgeAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/alerts/${alertId}/acknowledge`)
  }

  async acknowledgeMultipleAlerts(alertIds: string[]): Promise<{ success: boolean; acknowledged: string[]; failed: string[] }> {
    return apiClient.post(`${this.basePath}/alerts/acknowledge-multiple`, { alertIds })
  }

  async dismissAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.basePath}/alerts/${alertId}`)
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> {
    return apiClient.post<Alert>(`${this.basePath}/alerts`, alert)
  }

  // Chart data
  async getUAVActivityChart(timeRange: TimeRange = '24h'): Promise<UAVActivityChart> {
    return apiClient.get<UAVActivityChart>(`${this.basePath}/charts/uav-activity?range=${timeRange}`)
  }

  async getBatteryChart(timeRange: TimeRange = '24h'): Promise<BatteryChart> {
    return apiClient.get<BatteryChart>(`${this.basePath}/charts/battery?range=${timeRange}`)
  }

  async getSystemPerformanceChart(timeRange: TimeRange = '24h'): Promise<SystemPerformanceChart> {
    return apiClient.get<SystemPerformanceChart>(`${this.basePath}/charts/performance?range=${timeRange}`)
  }

  async getCustomChart(
    metric: string, 
    timeRange: TimeRange = '24h',
    aggregation: 'avg' | 'sum' | 'min' | 'max' = 'avg'
  ): Promise<{ timestamp: string; value: number }[]> {
    return apiClient.get(`${this.basePath}/charts/custom?metric=${metric}&range=${timeRange}&agg=${aggregation}`)
  }

  // Weather data
  async getWeatherData(): Promise<WeatherData> {
    return apiClient.get<WeatherData>(`${this.basePath}/weather`)
  }

  async getWeatherForecast(days: number = 3): Promise<WeatherData[]> {
    return apiClient.get(`${this.basePath}/weather/forecast?days=${days}`)
  }

  // Real-time data
  async getRealtimeMetrics(): Promise<{
    activeConnections: number
    messagesPerSecond: number
    dataTransferRate: number
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
  }> {
    return apiClient.get(`${this.basePath}/realtime`)
  }

  async subscribeToRealtimeUpdates(): Promise<WebSocket> {
    return apiClient.createWebSocket('/ws/dashboard')
  }

  async subscribeToAlerts(): Promise<WebSocket> {
    return apiClient.createWebSocket('/ws/alerts')
  }

  // System operations
  async restartSystem(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/system/restart`)
  }

  async shutdownSystem(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/system/shutdown`)
  }

  async clearCache(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/system/clear-cache`)
  }

  async runSystemDiagnostics(): Promise<{
    status: string
    results: {
      database: { status: string; responseTime: number }
      redis: { status: string; responseTime: number }
      storage: { status: string; freeSpace: number }
      network: { status: string; latency: number }
    }
  }> {
    return apiClient.post(`${this.basePath}/system/diagnostics`)
  }

  // Configuration
  async getSystemConfig(): Promise<Record<string, any>> {
    return apiClient.get(`${this.basePath}/config`)
  }

  async updateSystemConfig(config: Record<string, any>): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`${this.basePath}/config`, config)
  }

  async resetSystemConfig(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/config/reset`)
  }

  // Logs and audit
  async getSystemLogs(params?: {
    level?: 'debug' | 'info' | 'warn' | 'error'
    component?: string
    limit?: number
    offset?: number
    startTime?: string
    endTime?: string
  }): Promise<{
    logs: Array<{
      timestamp: string
      level: string
      component: string
      message: string
      metadata?: Record<string, any>
    }>
    total: number
  }> {
    const searchParams = new URLSearchParams()
    
    if (params?.level) searchParams.set('level', params.level)
    if (params?.component) searchParams.set('component', params.component)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.startTime) searchParams.set('startTime', params.startTime)
    if (params?.endTime) searchParams.set('endTime', params.endTime)

    const query = searchParams.toString()
    const endpoint = query ? `${this.basePath}/logs?${query}` : `${this.basePath}/logs`
    
    return apiClient.get(endpoint)
  }

  async getAuditLogs(params?: {
    userId?: string
    action?: string
    resource?: string
    limit?: number
    offset?: number
    startTime?: string
    endTime?: string
  }): Promise<{
    logs: Array<{
      timestamp: string
      userId: string
      action: string
      resource: string
      details?: Record<string, any>
      ipAddress?: string
      userAgent?: string
    }>
    total: number
  }> {
    const searchParams = new URLSearchParams()
    
    if (params?.userId) searchParams.set('userId', params.userId)
    if (params?.action) searchParams.set('action', params.action)
    if (params?.resource) searchParams.set('resource', params.resource)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.startTime) searchParams.set('startTime', params.startTime)
    if (params?.endTime) searchParams.set('endTime', params.endTime)

    const query = searchParams.toString()
    const endpoint = query ? `${this.basePath}/audit?${query}` : `${this.basePath}/audit`
    
    return apiClient.get(endpoint)
  }

  // Export and reporting
  async exportDashboardData(
    format: 'csv' | 'json' | 'pdf' = 'json',
    timeRange: TimeRange = '24h'
  ): Promise<Blob> {
    return apiClient.downloadFile(`${this.basePath}/export?format=${format}&range=${timeRange}`)
  }

  async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    format: 'pdf' | 'html' = 'pdf'
  ): Promise<Blob> {
    return apiClient.downloadFile(`${this.basePath}/reports/${type}?format=${format}`)
  }

  // Notifications
  async getNotificationSettings(): Promise<{
    email: boolean
    sms: boolean
    push: boolean
    alertThresholds: Record<string, number>
  }> {
    return apiClient.get(`${this.basePath}/notifications/settings`)
  }

  async updateNotificationSettings(settings: {
    email?: boolean
    sms?: boolean
    push?: boolean
    alertThresholds?: Record<string, number>
  }): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`${this.basePath}/notifications/settings`, settings)
  }

  async testNotification(type: 'email' | 'sms' | 'push'): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/notifications/test`, { type })
  }
}

// Create singleton instance
export const dashboardApi = new DashboardApi()

export default dashboardApi
