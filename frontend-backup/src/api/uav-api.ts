import apiClient, { createQueryString } from '@/lib/api-client';
import {
  UAV,
  CreateUAVRequest,
  UpdateUAVRequest,
  UAVFilter,
  PaginationParams,
  SystemStatistics,
  HibernatePodStatus,
  Region,
  APIResponse,
} from '@/types/uav';

/**
 * API client for UAV (Unmanned Aerial Vehicle) management operations.
 *
 * This class provides a comprehensive interface for interacting with the UAV management
 * backend API. It handles all CRUD operations, region management, status updates,
 * and validation operations for UAVs in the system.
 *
 * @example
 * ```typescript
 * const uavApi = new UAVApi();
 *
 * // Get all UAVs
 * const uavs = await uavApi.getUAVs();
 *
 * // Create a new UAV
 * const newUAV = await uavApi.createUAV({
 *   rfidTag: 'UAV-001',
 *   ownerName: 'John Doe',
 *   model: 'DJI Phantom 4'
 * });
 *
 * // Update UAV status
 * await uavApi.updateUAVStatus(1);
 * ```
 *
 * @author UAV Management System Team
 * @version 1.0
 * @since 1.0
 */
export class UAVApi {
  /** Base API path for UAV endpoints */
  private basePath = '/api/uav';

  /**
   * Retrieves all UAVs from the system with optional filtering and pagination.
   *
   * @param filter - Optional filter criteria to apply to the UAV list
   * @param filter.status - Filter by UAV authorization status
   * @param filter.operationalStatus - Filter by operational status
   * @param filter.manufacturer - Filter by manufacturer name
   * @param filter.model - Filter by UAV model
   * @param filter.regionId - Filter by assigned region ID
   * @param filter.inHibernatePod - Filter by hibernate pod status
   * @param pagination - Optional pagination parameters
   * @param pagination.page - Page number (0-based)
   * @param pagination.size - Number of items per page
   * @param pagination.sort - Sort criteria
   *
   * @returns Promise resolving to an array of UAV objects
   *
   * @throws {APIError} When the request fails or server returns an error
   *
   * @example
   * ```typescript
   * // Get all authorized UAVs
   * const authorizedUAVs = await uavApi.getUAVs({ status: 'AUTHORIZED' });
   *
   * // Get first 10 UAVs sorted by name
   * const pagedUAVs = await uavApi.getUAVs(
   *   undefined,
   *   { page: 0, size: 10, sort: 'ownerName,asc' }
   * );
   * ```
   */
  async getUAVs(filter?: UAVFilter, pagination?: PaginationParams): Promise<UAV[]> {
    const params = {
      ...filter,
      ...pagination,
    };

    const queryString = createQueryString(params);
    const url = queryString ? `${this.basePath}/all?${queryString}` : `${this.basePath}/all`;

    return apiClient.get<UAV[]>(url);
  }

  /**
   * Retrieves a specific UAV by its unique identifier.
   *
   * @param id - The unique identifier of the UAV to retrieve
   *
   * @returns Promise resolving to the UAV object
   *
   * @throws {APIError} When UAV is not found or request fails
   *
   * @example
   * ```typescript
   * const uav = await uavApi.getUAVById(123);
   * console.log(`UAV: ${uav.rfidTag} - ${uav.model}`);
   * ```
   */
  async getUAVById(id: number): Promise<UAV> {
    return apiClient.get<UAV>(`${this.basePath}/${id}`);
  }

  /**
   * Creates a new UAV in the system.
   *
   * @param uav - The UAV data for creation
   * @param uav.rfidTag - Unique RFID identifier for the UAV
   * @param uav.ownerName - Name of the UAV owner
   * @param uav.model - UAV model designation
   * @param uav.serialNumber - Manufacturer serial number (optional)
   * @param uav.manufacturer - Manufacturer name (optional)
   * @param uav.regionIds - Array of region IDs to assign (optional)
   *
   * @returns Promise resolving to API response with created UAV data
   *
   * @throws {APIError} When validation fails or creation is unsuccessful
   *
   * @example
   * ```typescript
   * const response = await uavApi.createUAV({
   *   rfidTag: 'UAV-001',
   *   ownerName: 'John Doe',
   *   model: 'DJI Phantom 4',
   *   manufacturer: 'DJI',
   *   regionIds: [1, 2]
   * });
   *
   * if (response.success) {
   *   console.log('UAV created:', response.data);
   * }
   * ```
   */
  async createUAV(uav: CreateUAVRequest): Promise<APIResponse<UAV>> {
    return apiClient.post<APIResponse<UAV>>(`${this.basePath}`, uav);
  }

  /**
   * Updates an existing UAV's information.
   *
   * @param id - The unique identifier of the UAV to update
   * @param uav - Partial UAV data containing fields to update
   *
   * @returns Promise resolving to API response with updated UAV data
   *
   * @throws {APIError} When UAV is not found or update fails
   *
   * @example
   * ```typescript
   * const response = await uavApi.updateUAV(123, {
   *   ownerName: 'Jane Smith',
   *   model: 'DJI Mavic Pro 2'
   * });
   * ```
   */
  async updateUAV(id: number, uav: Partial<UpdateUAVRequest>): Promise<APIResponse<UAV>> {
    return apiClient.put<APIResponse<UAV>>(`${this.basePath}/${id}`, uav);
  }

  /**
   * Permanently deletes a UAV from the system.
   *
   * @param id - The unique identifier of the UAV to delete
   *
   * @returns Promise resolving to API response confirming deletion
   *
   * @throws {APIError} When UAV is not found or deletion fails
   *
   * @warning This operation is irreversible and will delete all associated data
   *
   * @example
   * ```typescript
   * await uavApi.deleteUAV(123);
   * console.log('UAV deleted successfully');
   * ```
   */
  async deleteUAV(id: number): Promise<APIResponse<void>> {
    return apiClient.delete<APIResponse<void>>(`${this.basePath}/${id}`);
  }

  /**
   * Toggles the authorization status of a UAV.
   *
   * This method switches the UAV status between AUTHORIZED and UNAUTHORIZED.
   * The operation affects the UAV's access permissions to assigned regions.
   *
   * @param id - The unique identifier of the UAV to update
   *
   * @returns Promise resolving to API response with status change details
   *
   * @throws {APIError} When UAV is not found or status update fails
   *
   * @example
   * ```typescript
   * const response = await uavApi.updateUAVStatus(123);
   * console.log(`Status changed from ${response.oldStatus} to ${response.newStatus}`);
   * ```
   */
  async updateUAVStatus(id: number): Promise<APIResponse<any>> {
    return apiClient.put<APIResponse<any>>(`${this.basePath}/${id}/status`);
  }

  /**
   * Validates if an RFID tag is unique in the system.
   *
   * @param rfidTag - The RFID tag to validate
   * @param excludeId - Optional UAV ID to exclude from uniqueness check (for updates)
   *
   * @returns Promise resolving to validation result
   *
   * @example
   * ```typescript
   * const result = await uavApi.validateRfidTag('UAV-001');
   * if (!result.isUnique) {
   *   console.log('RFID tag already exists');
   * }
   *
   * // For updates, exclude current UAV
   * const updateResult = await uavApi.validateRfidTag('UAV-001', 123);
   * ```
   */
  async validateRfidTag(rfidTag: string, excludeId?: number): Promise<{ isUnique: boolean }> {
    const params = excludeId ? { excludeId } : {};
    const queryString = createQueryString(params);
    const url = queryString
      ? `${this.basePath}/validate-rfid/${encodeURIComponent(rfidTag)}?${queryString}`
      : `${this.basePath}/validate-rfid/${encodeURIComponent(rfidTag)}`;

    return apiClient.get<{ isUnique: boolean }>(url);
  }

  /**
   * Assigns a region to a UAV for access control.
   *
   * @param uavId - The unique identifier of the UAV
   * @param regionId - The unique identifier of the region to assign
   *
   * @returns Promise resolving to API response with updated UAV data
   *
   * @throws {APIError} When UAV or region is not found, or assignment fails
   *
   * @example
   * ```typescript
   * await uavApi.addRegionToUAV(123, 456);
   * console.log('Region assigned to UAV');
   * ```
   */
  async addRegionToUAV(uavId: number, regionId: number): Promise<APIResponse<UAV>> {
    return apiClient.post<APIResponse<UAV>>(`${this.basePath}/${uavId}/regions/${regionId}`);
  }

  /**
   * Removes a region assignment from a UAV.
   *
   * @param uavId - The unique identifier of the UAV
   * @param regionId - The unique identifier of the region to remove
   *
   * @returns Promise resolving to API response confirming removal
   *
   * @throws {APIError} When UAV or region is not found, or removal fails
   *
   * @example
   * ```typescript
   * await uavApi.removeRegionFromUAV(123, 456);
   * console.log('Region removed from UAV');
   * ```
   */
  async removeRegionFromUAV(uavId: number, regionId: number): Promise<APIResponse<void>> {
    return apiClient.delete<APIResponse<void>>(`${this.basePath}/${uavId}/regions/${regionId}`);
  }

  /**
   * Retrieves regions that are available for assignment to a UAV.
   *
   * Returns all regions that are not currently assigned to the specified UAV.
   *
   * @param uavId - The unique identifier of the UAV
   *
   * @returns Promise resolving to array of available regions
   *
   * @throws {APIError} When UAV is not found or request fails
   *
   * @example
   * ```typescript
   * const availableRegions = await uavApi.getAvailableRegionsForUAV(123);
   * console.log(`${availableRegions.length} regions available for assignment`);
   * ```
   */
  async getAvailableRegionsForUAV(uavId: number): Promise<Region[]> {
    return apiClient.get<Region[]>(`${this.basePath}/${uavId}/available-regions`);
  }

  // Get system statistics
  async getSystemStatistics(): Promise<SystemStatistics> {
    return apiClient.get<SystemStatistics>(`${this.basePath}/statistics`);
  }

  // Search UAVs
  async searchUAVs(query: string): Promise<UAV[]> {
    const params = { search: query };
    const queryString = createQueryString(params);
    return apiClient.get<UAV[]>(`${this.basePath}/search?${queryString}`);
  }

  // Get UAVs by status
  async getUAVsByStatus(status: string): Promise<UAV[]> {
    const params = { status };
    const queryString = createQueryString(params);
    return apiClient.get<UAV[]>(`${this.basePath}/all?${queryString}`);
  }

  // Get UAVs by region
  async getUAVsByRegion(regionId: number): Promise<UAV[]> {
    const params = { regionId };
    const queryString = createQueryString(params);
    return apiClient.get<UAV[]>(`${this.basePath}/all?${queryString}`);
  }

  // Bulk operations
  async bulkUpdateStatus(uavIds: number[], status: string): Promise<APIResponse<void>> {
    return apiClient.post<APIResponse<void>>(`${this.basePath}/bulk/status`, {
      uavIds,
      status,
    });
  }

  async bulkDelete(uavIds: number[]): Promise<APIResponse<void>> {
    return apiClient.post<APIResponse<void>>(`${this.basePath}/bulk/delete`, {
      uavIds,
    });
  }

  // Export UAVs data
  async exportUAVs(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/export?format=${format}`, {
      responseType: 'blob',
    });
    return response;
  }

  // Import UAVs data
  async importUAVs(file: File, onProgress?: (progress: number) => void): Promise<APIResponse<any>> {
    return apiClient.uploadFile<APIResponse<any>>(`${this.basePath}/import`, file, onProgress);
  }
}

// Hibernate Pod API
export class HibernatePodApi {
  private basePath = '/api/hibernate-pod';

  // Get hibernate pod status
  async getStatus(): Promise<HibernatePodStatus> {
    return apiClient.get<HibernatePodStatus>(`${this.basePath}/status`);
  }

  // Add UAV to hibernate pod
  async addUAV(uavId: number): Promise<APIResponse<any>> {
    return apiClient.post<APIResponse<any>>(`${this.basePath}/add`, { uavId });
  }

  // Remove UAV from hibernate pod
  async removeUAV(uavId: number): Promise<APIResponse<any>> {
    return apiClient.post<APIResponse<any>>(`${this.basePath}/remove`, { uavId });
  }

  // Get UAVs in hibernate pod
  async getUAVsInPod(): Promise<UAV[]> {
    return apiClient.get<UAV[]>(`${this.basePath}/uavs`);
  }

  // Update hibernate pod capacity
  async updateCapacity(maxCapacity: number): Promise<APIResponse<any>> {
    return apiClient.put<APIResponse<any>>(`${this.basePath}/capacity`, { maxCapacity });
  }
}

// Region API
export class RegionApi {
  private basePath = '/api/regions';

  // Get all regions
  async getRegions(): Promise<Region[]> {
    return apiClient.get<Region[]>(this.basePath);
  }

  // Get region by ID
  async getRegionById(id: number): Promise<Region> {
    return apiClient.get<Region>(`${this.basePath}/${id}`);
  }

  // Create new region
  async createRegion(region: { regionName: string }): Promise<APIResponse<Region>> {
    return apiClient.post<APIResponse<Region>>(this.basePath, region);
  }

  // Update region
  async updateRegion(id: number, region: { regionName: string }): Promise<APIResponse<Region>> {
    return apiClient.put<APIResponse<Region>>(`${this.basePath}/${id}`, region);
  }

  // Delete region
  async deleteRegion(id: number): Promise<APIResponse<void>> {
    return apiClient.delete<APIResponse<void>>(`${this.basePath}/${id}`);
  }

  // Get UAVs in region
  async getUAVsInRegion(regionId: number): Promise<UAV[]> {
    return apiClient.get<UAV[]>(`${this.basePath}/${regionId}/uavs`);
  }
}

// Create singleton instances
export const uavApi = new UAVApi();
export const hibernatePodApi = new HibernatePodApi();
export const regionApi = new RegionApi();

// Export default as UAV API for convenience
export default uavApi;
