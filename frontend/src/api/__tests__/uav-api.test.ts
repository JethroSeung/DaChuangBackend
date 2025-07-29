import { UAVApi, HibernatePodApi, RegionApi } from '../uav-api'
import apiClient from '@/lib/api-client'
import { createMockUAV, mockApiResponse } from '@/lib/test-utils'
import {
  CreateUAVRequest,
  UpdateUAVRequest,
  UAVFilter,
  PaginationParams,
  SystemStatistics,
  HibernatePodStatus,
  Region,
} from '@/types/uav'

// Mock the API client
jest.mock('@/lib/api-client')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('UAVApi', () => {
  let uavApi: UAVApi

  beforeEach(() => {
    uavApi = new UAVApi()
    jest.clearAllMocks()
  })

  describe('getUAVs', () => {
    it('should get UAVs without filters', async () => {
      const mockUAVs = [createMockUAV(), createMockUAV({ id: 2, rfidTag: 'UAV-002' })]
      mockedApiClient.get.mockResolvedValue(mockUAVs)

      const result = await uavApi.getUAVs()

      expect(result).toEqual(mockUAVs)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/uav/all')
    })

    it('should get UAVs with filters and pagination', async () => {
      const filter: UAVFilter = {
        status: 'AUTHORIZED',
        operationalStatus: 'READY',
      }
      const pagination: PaginationParams = {
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'desc',
      }

      const mockUAVs = [createMockUAV()]
      mockedApiClient.get.mockResolvedValue(mockUAVs)

      const result = await uavApi.getUAVs(filter, pagination)

      expect(result).toEqual(mockUAVs)
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/uav/all?status=AUTHORIZED&operationalStatus=READY&page=1&limit=10&sortBy=id&sortOrder=desc'
      )
    })

    it('should handle get UAVs error', async () => {
      const error = new Error('Failed to fetch UAVs')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(uavApi.getUAVs()).rejects.toThrow('Failed to fetch UAVs')
    })
  })

  describe('getUAVById', () => {
    it('should get UAV by ID successfully', async () => {
      const mockUAV = createMockUAV()
      mockedApiClient.get.mockResolvedValue(mockUAV)

      const result = await uavApi.getUAVById(1)

      expect(result).toEqual(mockUAV)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/uav/1')
    })

    it('should handle UAV not found', async () => {
      const error = new Error('UAV not found')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(uavApi.getUAVById(999)).rejects.toThrow('UAV not found')
    })
  })

  describe('createUAV', () => {
    it('should create UAV successfully', async () => {
      const createData: CreateUAVRequest = {
        rfidTag: 'UAV-003',
        ownerName: 'New Owner',
        model: 'New Model',
      }

      const mockResponse = mockApiResponse(createMockUAV({ ...createData, id: 3 }))
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await uavApi.createUAV(createData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/uav', createData)
    })

    it('should handle create UAV error', async () => {
      const createData: CreateUAVRequest = {
        rfidTag: 'DUPLICATE-TAG',
        ownerName: 'Owner',
        model: 'Model',
      }

      const error = new Error('RFID tag already exists')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(uavApi.createUAV(createData)).rejects.toThrow('RFID tag already exists')
    })
  })

  describe('updateUAV', () => {
    it('should update UAV successfully', async () => {
      const updateData: UpdateUAVRequest = {
        ownerName: 'Updated Owner',
        model: 'Updated Model',
      }

      const mockResponse = mockApiResponse(createMockUAV({ id: 1, ...updateData }))
      mockedApiClient.put.mockResolvedValue(mockResponse)

      const result = await uavApi.updateUAV(1, updateData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/uav/1', updateData)
    })

    it('should handle update UAV error', async () => {
      const updateData: UpdateUAVRequest = {
        ownerName: 'Updated Owner',
      }

      const error = new Error('UAV not found')
      mockedApiClient.put.mockRejectedValue(error)

      await expect(uavApi.updateUAV(999, updateData)).rejects.toThrow('UAV not found')
    })
  })

  describe('deleteUAV', () => {
    it('should delete UAV successfully', async () => {
      const mockResponse = mockApiResponse(null)
      mockedApiClient.delete.mockResolvedValue(mockResponse)

      const result = await uavApi.deleteUAV(1)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/uav/1')
    })

    it('should handle delete UAV error', async () => {
      const error = new Error('UAV not found')
      mockedApiClient.delete.mockRejectedValue(error)

      await expect(uavApi.deleteUAV(999)).rejects.toThrow('UAV not found')
    })
  })

  describe('updateUAVStatus', () => {
    it('should update UAV status successfully', async () => {
      const mockResponse = mockApiResponse({ message: 'Status updated' })
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await uavApi.updateUAVStatus(1)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/uav/1/status')
    })

    it('should handle update status error', async () => {
      const error = new Error('UAV not found')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(uavApi.updateUAVStatus(999)).rejects.toThrow('UAV not found')
    })
  })

  describe('getSystemStatistics', () => {
    it('should get system statistics successfully', async () => {
      const mockStats: SystemStatistics = {
        totalUAVs: 10,
        authorizedUAVs: 8,
        unauthorizedUAVs: 2,
        activeFlights: 3,
        hibernatingUAVs: 2,
        averageBatteryLevel: 75,
        totalFlightHours: 1000,
        totalFlightCycles: 500,
      }

      mockedApiClient.get.mockResolvedValue(mockStats)

      const result = await uavApi.getSystemStatistics()

      expect(result).toEqual(mockStats)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/uav/statistics')
    })

    it('should handle get statistics error', async () => {
      const error = new Error('Failed to fetch statistics')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(uavApi.getSystemStatistics()).rejects.toThrow('Failed to fetch statistics')
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should bulk update status successfully', async () => {
      const uavIds = [1, 2, 3]
      const status = 'AUTHORIZED'
      const mockResponse = mockApiResponse({ updated: 3 })
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await uavApi.bulkUpdateStatus(uavIds, status)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/uav/bulk/status', { uavIds, status })
    })

    it('should handle bulk update error', async () => {
      const uavIds = [999, 998]
      const status = 'AUTHORIZED'
      const error = new Error('Some UAVs not found')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(uavApi.bulkUpdateStatus(uavIds, status)).rejects.toThrow('Some UAVs not found')
    })
  })

  describe('bulkDelete', () => {
    it('should bulk delete successfully', async () => {
      const uavIds = [1, 2, 3]
      const mockResponse = mockApiResponse({ deleted: 3 })
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await uavApi.bulkDelete(uavIds)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/uav/bulk/delete', { uavIds })
    })

    it('should handle bulk delete error', async () => {
      const uavIds = [999, 998]
      const error = new Error('Some UAVs not found')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(uavApi.bulkDelete(uavIds)).rejects.toThrow('Some UAVs not found')
    })
  })
})

describe('HibernatePodApi', () => {
  let hibernatePodApi: HibernatePodApi

  beforeEach(() => {
    hibernatePodApi = new HibernatePodApi()
    jest.clearAllMocks()
  })

  describe('getStatus', () => {
    it('should get hibernate pod status successfully', async () => {
      const mockStatus: HibernatePodStatus = {
        isActive: true,
        capacity: 10,
        currentOccupancy: 5,
        availableSlots: 5,
        temperature: 20,
        humidity: 45,
        powerConsumption: 150,
        lastMaintenance: '2024-01-01T00:00:00Z',
      }

      mockedApiClient.get.mockResolvedValue(mockStatus)

      const result = await hibernatePodApi.getStatus()

      expect(result).toEqual(mockStatus)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/hibernate-pod/status')
    })

    it('should handle get status error', async () => {
      const error = new Error('Failed to fetch status')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(hibernatePodApi.getStatus()).rejects.toThrow('Failed to fetch status')
    })
  })

  describe('addUAV', () => {
    it('should add UAV to hibernate pod successfully', async () => {
      const mockResponse = mockApiResponse({ message: 'UAV added to hibernate pod' })
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await hibernatePodApi.addUAV(1)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/hibernate-pod/add', { uavId: 1 })
    })

    it('should handle add UAV error', async () => {
      const error = new Error('Hibernate pod is full')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(hibernatePodApi.addUAV(1)).rejects.toThrow('Hibernate pod is full')
    })
  })

  describe('removeUAV', () => {
    it('should remove UAV from hibernate pod successfully', async () => {
      const mockResponse = mockApiResponse({ message: 'UAV removed from hibernate pod' })
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await hibernatePodApi.removeUAV(1)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/hibernate-pod/remove', { uavId: 1 })
    })

    it('should handle remove UAV error', async () => {
      const error = new Error('UAV not in hibernate pod')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(hibernatePodApi.removeUAV(1)).rejects.toThrow('UAV not in hibernate pod')
    })
  })

  describe('getUAVsInPod', () => {
    it('should get UAVs in hibernate pod successfully', async () => {
      const mockUAVs = [
        createMockUAV({ id: 1, inHibernatePod: true }),
        createMockUAV({ id: 2, inHibernatePod: true }),
      ]
      mockedApiClient.get.mockResolvedValue(mockUAVs)

      const result = await hibernatePodApi.getUAVsInPod()

      expect(result).toEqual(mockUAVs)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/hibernate-pod/uavs')
    })

    it('should handle get UAVs error', async () => {
      const error = new Error('Failed to fetch UAVs')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(hibernatePodApi.getUAVsInPod()).rejects.toThrow('Failed to fetch UAVs')
    })
  })
})

describe('RegionApi', () => {
  let regionApi: RegionApi

  beforeEach(() => {
    regionApi = new RegionApi()
    jest.clearAllMocks()
  })

  describe('getRegions', () => {
    it('should get regions successfully', async () => {
      const mockRegions: Region[] = [
        {
          id: 1,
          name: 'Region 1',
          description: 'Test region 1',
          coordinates: [
            { latitude: 40.7128, longitude: -74.0060 },
            { latitude: 40.7589, longitude: -73.9851 },
          ],
          isActive: true,
        },
      ]

      mockedApiClient.get.mockResolvedValue(mockRegions)

      const result = await regionApi.getRegions()

      expect(result).toEqual(mockRegions)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/regions')
    })

    it('should handle get regions error', async () => {
      const error = new Error('Failed to fetch regions')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(regionApi.getRegions()).rejects.toThrow('Failed to fetch regions')
    })
  })

  describe('createRegion', () => {
    it('should create region successfully', async () => {
      const regionData = {
        name: 'New Region',
        description: 'A new test region',
        coordinates: [
          { latitude: 40.7128, longitude: -74.0060 },
          { latitude: 40.7589, longitude: -73.9851 },
        ],
      }

      const mockResponse = mockApiResponse({
        id: 1,
        ...regionData,
        isActive: true,
      })
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await regionApi.createRegion(regionData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/regions', regionData)
    })

    it('should handle create region error', async () => {
      const regionData = {
        name: 'Duplicate Region',
        description: 'A duplicate region',
        coordinates: [],
      }

      const error = new Error('Region name already exists')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(regionApi.createRegion(regionData)).rejects.toThrow('Region name already exists')
    })
  })
})
