'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { UAV, UAVFilter, UAVStats, UAVFormData, HibernatePod, DockingStation } from '@/types'

interface UAVState {
  // Data
  uavs: UAV[]
  selectedUAV: UAV | null
  hibernatePods: HibernatePod[]
  dockingStations: DockingStation[]
  stats: UAVStats | null

  // UI State
  loading: boolean
  error: string | null
  filter: UAVFilter
  searchQuery: string
  selectedIds: string[]

  // Actions
  setUAVs: (uavs: UAV[]) => void
  addUAV: (uav: UAV) => void
  updateUAV: (id: string, updates: Partial<UAV>) => void
  removeUAV: (id: string) => void
  setSelectedUAV: (uav: UAV | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilter: (filter: Partial<UAVFilter>) => void
  setSearchQuery: (query: string) => void
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void

  // API Actions
  fetchUAVs: () => Promise<void>
  createUAV: (data: UAVFormData) => Promise<UAV | null>
  updateUAVById: (id: string, data: Partial<UAVFormData>) => Promise<UAV | null>
  deleteUAV: (id: string) => Promise<boolean>
  toggleUAVStatus: (id: string) => Promise<boolean>
  addToHibernatePod: (uavId: string, podId: string) => Promise<boolean>
  removeFromHibernatePod: (uavId: string) => Promise<boolean>
  fetchStats: () => Promise<void>
  fetchHibernatePods: () => Promise<void>
  fetchDockingStations: () => Promise<void>

  // Computed
  getFilteredUAVs: () => UAV[]
  getUAVById: (id: string) => UAV | undefined
  getUAVsByStatus: (status: string) => UAV[]
}

// Mock API functions - replace with actual API calls
const mockAPI = {
  async fetchUAVs(): Promise<UAV[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: '1',
        rfidTag: 'UAV-001',
        status: 'AUTHORIZED',
        batteryLevel: 85,
        location: { latitude: 39.9042, longitude: 116.4074, timestamp: new Date().toISOString() },
        region: 'Beijing',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inHibernatePod: false,
      },
      {
        id: '2',
        rfidTag: 'UAV-002',
        status: 'ACTIVE',
        batteryLevel: 45,
        location: { latitude: 39.9142, longitude: 116.4174, timestamp: new Date().toISOString() },
        region: 'Beijing',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inHibernatePod: false,
      },
    ]
  },

  async createUAV(data: UAVFormData): Promise<UAV> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      rfidTag: data.rfidTag,
      status: data.status || 'UNAUTHORIZED',
      batteryLevel: 100,
      region: data.region,
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inHibernatePod: false,
    }
  },

  async updateUAV(id: string, data: Partial<UAVFormData>): Promise<UAV | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    // Return updated UAV or null if not found
    return null
  },

  async deleteUAV(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return true
  },

  async fetchStats(): Promise<UAVStats> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      total: 24,
      authorized: 18,
      unauthorized: 6,
      active: 3,
      hibernating: 8,
      charging: 5,
      maintenance: 1,
      emergency: 0,
      lowBattery: 2,
      offline: 1,
    }
  },
}

export const useUAVStore = create<UAVState>()(
  immer((set, get) => ({
    // Initial state
    uavs: [],
    selectedUAV: null,
    hibernatePods: [],
    dockingStations: [],
    stats: null,
    loading: false,
    error: null,
    filter: {},
    searchQuery: '',
    selectedIds: [],

    // Basic setters
    setUAVs: (uavs) => set((state) => { state.uavs = uavs }),
    addUAV: (uav) => set((state) => { state.uavs.push(uav) }),
    updateUAV: (id, updates) => set((state) => {
      const index = state.uavs.findIndex(uav => uav.id === id)
      if (index !== -1) {
        Object.assign(state.uavs[index], updates)
      }
    }),
    removeUAV: (id) => set((state) => {
      state.uavs = state.uavs.filter(uav => uav.id !== id)
    }),
    setSelectedUAV: (uav) => set((state) => { state.selectedUAV = uav }),
    setLoading: (loading) => set((state) => { state.loading = loading }),
    setError: (error) => set((state) => { state.error = error }),
    setFilter: (filter) => set((state) => { 
      state.filter = { ...state.filter, ...filter }
    }),
    setSearchQuery: (query) => set((state) => { state.searchQuery = query }),
    setSelectedIds: (ids) => set((state) => { state.selectedIds = ids }),
    clearSelection: () => set((state) => { 
      state.selectedIds = []
      state.selectedUAV = null
    }),

    // API actions
    fetchUAVs: async () => {
      set((state) => { 
        state.loading = true
        state.error = null
      })
      
      try {
        const uavs = await mockAPI.fetchUAVs()
        set((state) => { 
          state.uavs = uavs
          state.loading = false
        })
      } catch (error) {
        set((state) => { 
          state.error = error instanceof Error ? error.message : 'Failed to fetch UAVs'
          state.loading = false
        })
      }
    },

    createUAV: async (data) => {
      set((state) => { state.loading = true })
      
      try {
        const uav = await mockAPI.createUAV(data)
        set((state) => { 
          state.uavs.push(uav)
          state.loading = false
        })
        return uav
      } catch (error) {
        set((state) => { 
          state.error = error instanceof Error ? error.message : 'Failed to create UAV'
          state.loading = false
        })
        return null
      }
    },

    updateUAVById: async (id, data) => {
      set((state) => { state.loading = true })
      
      try {
        const updatedUAV = await mockAPI.updateUAV(id, data)
        if (updatedUAV) {
          set((state) => {
            const index = state.uavs.findIndex(uav => uav.id === id)
            if (index !== -1) {
              state.uavs[index] = updatedUAV
            }
            state.loading = false
          })
        }
        return updatedUAV
      } catch (error) {
        set((state) => { 
          state.error = error instanceof Error ? error.message : 'Failed to update UAV'
          state.loading = false
        })
        return null
      }
    },

    deleteUAV: async (id) => {
      set((state) => { state.loading = true })
      
      try {
        const success = await mockAPI.deleteUAV(id)
        if (success) {
          set((state) => {
            state.uavs = state.uavs.filter(uav => uav.id !== id)
            if (state.selectedUAV?.id === id) {
              state.selectedUAV = null
            }
            state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id)
            state.loading = false
          })
        }
        return success
      } catch (error) {
        set((state) => { 
          state.error = error instanceof Error ? error.message : 'Failed to delete UAV'
          state.loading = false
        })
        return false
      }
    },

    toggleUAVStatus: async (id) => {
      // Implementation for toggling UAV authorization status
      return true
    },

    addToHibernatePod: async (uavId, podId) => {
      // Implementation for adding UAV to hibernate pod
      return true
    },

    removeFromHibernatePod: async (uavId) => {
      // Implementation for removing UAV from hibernate pod
      return true
    },

    fetchStats: async () => {
      try {
        const stats = await mockAPI.fetchStats()
        set((state) => { state.stats = stats })
      } catch (error) {
        set((state) => { 
          state.error = error instanceof Error ? error.message : 'Failed to fetch stats'
        })
      }
    },

    fetchHibernatePods: async () => {
      // Implementation for fetching hibernate pods
    },

    fetchDockingStations: async () => {
      // Implementation for fetching docking stations
    },

    // Computed values
    getFilteredUAVs: () => {
      const { uavs, filter, searchQuery } = get()
      let filtered = [...uavs]

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(uav => 
          uav.rfidTag.toLowerCase().includes(query) ||
          uav.region?.toLowerCase().includes(query) ||
          uav.status.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      if (filter.status && filter.status.length > 0) {
        filtered = filtered.filter(uav => filter.status!.includes(uav.status))
      }

      // Apply region filter
      if (filter.region && filter.region.length > 0) {
        filtered = filtered.filter(uav => 
          uav.region && filter.region!.includes(uav.region)
        )
      }

      // Apply battery level filter
      if (filter.batteryLevel) {
        const { min, max } = filter.batteryLevel
        filtered = filtered.filter(uav => {
          if (min !== undefined && uav.batteryLevel < min) return false
          if (max !== undefined && uav.batteryLevel > max) return false
          return true
        })
      }

      // Apply hibernate pod filter
      if (filter.inHibernatePod !== undefined) {
        filtered = filtered.filter(uav => uav.inHibernatePod === filter.inHibernatePod)
      }

      return filtered
    },

    getUAVById: (id) => {
      return get().uavs.find(uav => uav.id === id)
    },

    getUAVsByStatus: (status) => {
      return get().uavs.filter(uav => uav.status === status)
    },
  }))
)
