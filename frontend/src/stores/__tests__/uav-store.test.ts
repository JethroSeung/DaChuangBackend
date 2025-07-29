import { renderHook, act } from '@testing-library/react'
import { useUAVStore } from '../uav-store'
import { createMockUAV, mockApiResponse, mockApiError } from '@/lib/test-utils'
import { uavApi } from '@/api/uav-api'

// Mock the API
jest.mock('@/api/uav-api')
const mockedUavApi = uavApi as jest.Mocked<typeof uavApi>

describe('UAV Store', () => {
  beforeEach(() => {
    // Reset store state
    useUAVStore.setState({
      uavs: [],
      selectedUAV: null,
      loading: false,
      error: null,
      filter: {},
      searchQuery: '',
      regions: [],
      systemStats: null,
      hibernatePodStatus: null,
    })
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('fetchUAVs', () => {
    it('should fetch UAVs successfully', async () => {
      const mockUAVs = [createMockUAV(), createMockUAV({ id: 2, rfidTag: 'UAV-002' })]
      mockedUavApi.getUAVs.mockResolvedValue(mockUAVs)

      const { result } = renderHook(() => useUAVStore())

      await act(async () => {
        await result.current.fetchUAVs()
      })

      expect(result.current.uavs).toEqual(mockUAVs)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockedUavApi.getUAVs).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch UAVs error', async () => {
      const errorMessage = 'Failed to fetch UAVs'
      mockedUavApi.getUAVs.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUAVStore())

      await act(async () => {
        await result.current.fetchUAVs()
      })

      expect(result.current.uavs).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      mockedUavApi.getUAVs.mockReturnValue(promise as any)

      const { result } = renderHook(() => useUAVStore())

      act(() => {
        result.current.fetchUAVs()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePromise([])
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('createUAV', () => {
    it('should create UAV successfully', async () => {
      const newUAV = createMockUAV()
      const mockResponse = mockApiResponse(newUAV)
      mockedUavApi.createUAV.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUAVStore())

      let success: boolean
      await act(async () => {
        success = await result.current.createUAV({
          rfidTag: newUAV.rfidTag,
          ownerName: newUAV.ownerName,
          model: newUAV.model,
          status: newUAV.status,
        })
      })

      expect(success!).toBe(true)
      expect(result.current.uavs).toContain(newUAV)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle create UAV error', async () => {
      const errorMessage = 'Failed to create UAV'
      const mockResponse = { success: false, message: errorMessage }
      mockedUavApi.createUAV.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUAVStore())

      let success: boolean
      await act(async () => {
        success = await result.current.createUAV({
          rfidTag: 'UAV-001',
          ownerName: 'Test Owner',
          model: 'Test Model',
          status: 'AUTHORIZED',
        })
      })

      expect(success!).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('updateUAV', () => {
    it('should update UAV successfully', async () => {
      const existingUAV = createMockUAV()
      const updatedUAV = { ...existingUAV, ownerName: 'Updated Owner' }
      const mockResponse = mockApiResponse(updatedUAV)
      
      mockedUavApi.updateUAV.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUAVStore())

      // Set initial state
      act(() => {
        useUAVStore.setState({ uavs: [existingUAV] })
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateUAV(existingUAV.id, { ownerName: 'Updated Owner' })
      })

      expect(success!).toBe(true)
      expect(result.current.uavs[0].ownerName).toBe('Updated Owner')
    })
  })

  describe('deleteUAV', () => {
    it('should delete UAV successfully', async () => {
      const uavToDelete = createMockUAV()
      const mockResponse = mockApiResponse(undefined)
      
      mockedUavApi.deleteUAV.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUAVStore())

      // Set initial state
      act(() => {
        useUAVStore.setState({ uavs: [uavToDelete] })
      })

      let success: boolean
      await act(async () => {
        success = await result.current.deleteUAV(uavToDelete.id)
      })

      expect(success!).toBe(true)
      expect(result.current.uavs).toHaveLength(0)
    })
  })

  describe('filters and search', () => {
    it('should set filter correctly', () => {
      const { result } = renderHook(() => useUAVStore())

      act(() => {
        result.current.setFilter({ status: 'AUTHORIZED' })
      })

      expect(result.current.filter.status).toBe('AUTHORIZED')
    })

    it('should set search query correctly', () => {
      const { result } = renderHook(() => useUAVStore())

      act(() => {
        result.current.setSearchQuery('UAV-001')
      })

      expect(result.current.searchQuery).toBe('UAV-001')
    })

    it('should clear error', () => {
      const { result } = renderHook(() => useUAVStore())

      // Set error first
      act(() => {
        useUAVStore.setState({ error: 'Test error' })
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('selectedUAV', () => {
    it('should set selected UAV', () => {
      const uav = createMockUAV()
      const { result } = renderHook(() => useUAVStore())

      act(() => {
        result.current.setSelectedUAV(uav)
      })

      expect(result.current.selectedUAV).toEqual(uav)
    })

    it('should clear selected UAV', () => {
      const uav = createMockUAV()
      const { result } = renderHook(() => useUAVStore())

      // Set UAV first
      act(() => {
        result.current.setSelectedUAV(uav)
      })

      expect(result.current.selectedUAV).toEqual(uav)

      // Clear UAV
      act(() => {
        result.current.setSelectedUAV(null)
      })

      expect(result.current.selectedUAV).toBeNull()
    })
  })

  describe('real-time updates', () => {
    it('should update UAV in store', () => {
      const existingUAV = createMockUAV()
      const updatedUAV = { ...existingUAV, ownerName: 'Updated Owner' }
      
      const { result } = renderHook(() => useUAVStore())

      // Set initial state
      act(() => {
        useUAVStore.setState({ uavs: [existingUAV] })
      })

      // Update UAV
      act(() => {
        result.current.updateUAVInStore(updatedUAV)
      })

      expect(result.current.uavs[0].ownerName).toBe('Updated Owner')
    })

    it('should add new UAV if not exists', () => {
      const newUAV = createMockUAV()
      
      const { result } = renderHook(() => useUAVStore())

      act(() => {
        result.current.updateUAVInStore(newUAV)
      })

      expect(result.current.uavs).toContain(newUAV)
    })

    it('should remove UAV from store', () => {
      const uav = createMockUAV()
      
      const { result } = renderHook(() => useUAVStore())

      // Set initial state
      act(() => {
        useUAVStore.setState({ uavs: [uav] })
      })

      // Remove UAV
      act(() => {
        result.current.removeUAVFromStore(uav.id)
      })

      expect(result.current.uavs).toHaveLength(0)
    })
  })
})
