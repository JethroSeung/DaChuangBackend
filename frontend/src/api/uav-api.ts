'use client'

import apiClient from '@/lib/api-client'
import { UAV, UAVFormData, UAVFilter, UAVStats, PaginatedResponse, QueryParams, LocationHistory, MaintenanceRecord, DiagnosticResult } from '@/types'

export class UAVApi {
  private basePath = '/api/uavs'

  // UAV CRUD operations
  async getUAVs(params?: QueryParams & { filter?: UAVFilter }): Promise<PaginatedResponse<UAV>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.sort) searchParams.set('sort', params.sort)
    if (params?.order) searchParams.set('order', params.order)
    if (params?.search) searchParams.set('search', params.search)

    if (params?.filter) {
      searchParams.set('filter', JSON.stringify(params.filter))
    }

    const query = searchParams.toString()
    const endpoint = query ? `${this.basePath}?${query}` : this.basePath

    return apiClient.get<PaginatedResponse<UAV>>(endpoint)
  }

  async getUAVById(id: string): Promise<UAV> {
    return apiClient.get<UAV>(`${this.basePath}/${id}`)
  }

  async createUAV(data: UAVFormData): Promise<UAV> {
    return apiClient.post<UAV>(this.basePath, data)
  }

  async updateUAV(id: string, data: Partial<UAVFormData>): Promise<UAV> {
    return apiClient.put<UAV>(`${this.basePath}/${id}`, data)
  }

  async deleteUAV(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.basePath}/${id}`)
  }

  async deleteMultipleUAVs(ids: string[]): Promise<{ success: boolean; message: string; failed?: string[] }> {
    return apiClient.post(`${this.basePath}/batch-delete`, { ids })
  }

  // UAV status operations
  async toggleUAVStatus(id: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/toggle-status`)
  }

  async authorizeUAV(id: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/authorize`)
  }

  async unauthorizeUAV(id: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/unauthorize`)
  }

  async activateUAV(id: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/activate`)
  }

  async deactivateUAV(id: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/deactivate`)
  }

  // Location and tracking
  async updateUAVLocation(id: string, location: { latitude: number; longitude: number; altitude?: number }): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/location`, location)
  }

  async getUAVLocation(id: string): Promise<{ latitude: number; longitude: number; altitude?: number; timestamp: string }> {
    return apiClient.get(`${this.basePath}/${id}/location`)
  }

  async getUAVHistory(id: string, timeRange?: { start: string; end: string }): Promise<LocationHistory[]> {
    const params = timeRange ? `?start=${timeRange.start}&end=${timeRange.end}` : ''
    return apiClient.get(`${this.basePath}/${id}/history${params}`)
  }

  // Battery management
  async updateBatteryLevel(id: string, batteryLevel: number): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/battery`, { batteryLevel })
  }

  async getBatteryStatus(id: string): Promise<{ level: number; status: string; lastUpdated: string }> {
    return apiClient.get(`${this.basePath}/${id}/battery`)
  }

  async getLowBatteryUAVs(threshold?: number): Promise<UAV[]> {
    const params = threshold ? `?threshold=${threshold}` : ''
    return apiClient.get(`${this.basePath}/low-battery${params}`)
  }

  // Statistics and analytics
  async getUAVStats(): Promise<UAVStats> {
    return apiClient.get<UAVStats>(`${this.basePath}/stats`)
  }

  async getUAVsByRegion(): Promise<Record<string, UAV[]>> {
    return apiClient.get(`${this.basePath}/by-region`)
  }

  async getUAVsByStatus(): Promise<Record<string, UAV[]>> {
    return apiClient.get(`${this.basePath}/by-status`)
  }

  // Search and filtering
  async searchUAVs(query: string): Promise<UAV[]> {
    return apiClient.get(`${this.basePath}/search?q=${encodeURIComponent(query)}`)
  }

  async getUAVsByFilter(filter: UAVFilter): Promise<UAV[]> {
    return apiClient.post<UAV[]>(`${this.basePath}/filter`, filter)
  }

  // Bulk operations
  async bulkUpdateStatus(ids: string[], status: string): Promise<{ success: boolean; updated: string[]; failed: string[] }> {
    return apiClient.post(`${this.basePath}/bulk-status`, { ids, status })
  }

  async bulkUpdateRegion(ids: string[], region: string): Promise<{ success: boolean; updated: string[]; failed: string[] }> {
    return apiClient.post(`${this.basePath}/bulk-region`, { ids, region })
  }

  // Maintenance and diagnostics
  async scheduleMaintenanceUAV(id: string, scheduledDate: string, notes?: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/maintenance`, { scheduledDate, notes })
  }

  async completeMaintenanceUAV(id: string, notes?: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/maintenance/complete`, { notes })
  }

  async getMaintenanceSchedule(): Promise<MaintenanceRecord[]> {
    return apiClient.get(`${this.basePath}/maintenance/schedule`)
  }

  async runDiagnostics(id: string): Promise<DiagnosticResult> {
    return apiClient.post(`${this.basePath}/${id}/diagnostics`)
  }

  // Emergency operations
  async emergencyLand(id: string, reason?: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/emergency-land`, { reason })
  }

  async emergencyReturn(id: string): Promise<UAV> {
    return apiClient.post<UAV>(`${this.basePath}/${id}/emergency-return`)
  }

  async reportEmergency(id: string, type: string, description: string): Promise<{ success: boolean; emergencyId: string }> {
    return apiClient.post(`${this.basePath}/${id}/emergency`, { type, description })
  }

  // Real-time updates
  async subscribeToUAVUpdates(uavId?: string): Promise<WebSocket> {
    const endpoint = uavId ? `/ws/uavs/${uavId}` : '/ws/uavs'
    return apiClient.createWebSocket(endpoint)
  }

  // Export and import
  async exportUAVs(format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    return apiClient.downloadFile(`${this.basePath}/export?format=${format}`)
  }

  async importUAVs(file: File): Promise<{ success: boolean; imported: number; failed: number; errors?: string[] }> {
    return apiClient.upload(`${this.basePath}/import`, file)
  }

  // Validation
  async validateRFIDTag(rfidTag: string): Promise<{ valid: boolean; exists: boolean; message?: string }> {
    return apiClient.get(`${this.basePath}/validate-rfid?tag=${encodeURIComponent(rfidTag)}`)
  }

  async validateUAVData(data: UAVFormData): Promise<{ valid: boolean; errors?: Record<string, string[]> }> {
    return apiClient.post(`${this.basePath}/validate`, data)
  }
}

// Create singleton instance
export const uavApi = new UAVApi()

export default uavApi
