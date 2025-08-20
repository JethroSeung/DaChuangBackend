import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { SystemAlert, UAVLocationUpdate, BatteryAlert } from '@/types/uav'

// Enhanced dashboard types with better error handling
export interface DashboardMetrics {
  totalUAVs: number
  authorizedUAVs: number
  unauthorizedUAVs: number
  activeFlights: number
  hibernatingUAVs: number
  lowBatteryCount: number
  chargingCount: number
  maintenanceCount: number
  emergencyCount: number
  lastUpdated: string
}

export interface FlightActivity {
  activeFlights: number
  todayFlights: number
  completedFlights: number
  flights: Array<{
    id: number
    uavRfid: string
    missionName: string
    startTime: string
    status: string
    estimatedEndTime?: string
    progress?: number
  }>
  lastUpdated: string
}

export interface ChartData {
  flightTrends: Array<{
    time: string
    flights: number
    completed: number
  }>
  batteryLevels: Array<{
    uavId: number
    rfidTag: string
    batteryLevel: number
    status: string
    temperature?: number
    voltage?: number
  }>
  systemLoad: Array<{
    timestamp: string
    cpuUsage: number
    memoryUsage: number
    networkUsage: number
    diskUsage?: number
  }>
  lastUpdated: string
}

export interface ConnectionStatus {
  isConnected: boolean
  lastConnected: string | null
  reconnectAttempts: number
  latency: number | null
}

export interface DashboardState {
  // Data
  metrics: DashboardMetrics | null
  flightActivity: FlightActivity | null
  chartData: ChartData | null
  alerts: SystemAlert[]
  connectionStatus: ConnectionStatus
  
  // Loading states
  isLoading: boolean
  isLoadingMetrics: boolean
  isLoadingCharts: boolean
  isLoadingAlerts: boolean
  
  // Error states
  error: string | null
  metricsError: string | null
  chartsError: string | null
  alertsError: string | null
  
  // Cache management
  lastFetch: string | null
  cacheExpiry: number // in milliseconds
  
  // Performance tracking
  renderCount: number
  lastRenderTime: number
}

export interface DashboardActions {
  // Data fetching
  fetchDashboardData: () => Promise<void>
  fetchMetrics: () => Promise<void>
  fetchChartData: () => Promise<void>
  fetchAlerts: () => Promise<void>
  refreshAll: () => Promise<void>
  
  // Real-time updates
  updateMetrics: (metrics: Partial<DashboardMetrics>) => void
  updateFlightActivity: (activity: Partial<FlightActivity>) => void
  updateChartData: (data: Partial<ChartData>) => void
  addAlert: (alert: SystemAlert) => void
  removeAlert: (alertId: string) => void
  clearAlerts: () => void
  
  // Connection management
  setConnectionStatus: (status: Partial<ConnectionStatus>) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  
  // Error handling
  setError: (error: string | null) => void
  setMetricsError: (error: string | null) => void
  setChartsError: (error: string | null) => void
  setAlertsError: (error: string | null) => void
  clearErrors: () => void
  
  // Cache management
  invalidateCache: () => void
  isCacheValid: () => boolean
  
  // Performance tracking
  incrementRenderCount: () => void
  setRenderTime: (time: number) => void
}

type DashboardStore = DashboardState & DashboardActions

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_ALERTS = 50 // Maximum number of alerts to keep

export const useEnhancedDashboardStore = create<DashboardStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        metrics: null,
        flightActivity: null,
        chartData: null,
        alerts: [],
        connectionStatus: {
          isConnected: false,
          lastConnected: null,
          reconnectAttempts: 0,
          latency: null,
        },
        isLoading: false,
        isLoadingMetrics: false,
        isLoadingCharts: false,
        isLoadingAlerts: false,
        error: null,
        metricsError: null,
        chartsError: null,
        alertsError: null,
        lastFetch: null,
        cacheExpiry: CACHE_DURATION,
        renderCount: 0,
        lastRenderTime: 0,

        // Data fetching actions
        fetchDashboardData: async () => {
          const state = get()
          
          // Check cache validity
          if (state.isCacheValid() && state.metrics && state.chartData) {
            return
          }

          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            await Promise.all([
              get().fetchMetrics(),
              get().fetchChartData(),
              get().fetchAlerts(),
            ])

            set((state) => {
              state.lastFetch = new Date().toISOString()
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
            })
          } finally {
            set((state) => {
              state.isLoading = false
            })
          }
        },

        fetchMetrics: async () => {
          set((state) => {
            state.isLoadingMetrics = true
            state.metricsError = null
          })

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/dashboard/metrics')
            if (!response.ok) throw new Error('Failed to fetch metrics')
            
            const metrics = await response.json()
            
            set((state) => {
              state.metrics = {
                ...metrics,
                lastUpdated: new Date().toISOString(),
              }
            })
          } catch (error) {
            set((state) => {
              state.metricsError = error instanceof Error ? error.message : 'Failed to fetch metrics'
            })
          } finally {
            set((state) => {
              state.isLoadingMetrics = false
            })
          }
        },

        fetchChartData: async () => {
          set((state) => {
            state.isLoadingCharts = true
            state.chartsError = null
          })

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/dashboard/charts')
            if (!response.ok) throw new Error('Failed to fetch chart data')
            
            const chartData = await response.json()
            
            set((state) => {
              state.chartData = {
                ...chartData,
                lastUpdated: new Date().toISOString(),
              }
            })
          } catch (error) {
            set((state) => {
              state.chartsError = error instanceof Error ? error.message : 'Failed to fetch chart data'
            })
          } finally {
            set((state) => {
              state.isLoadingCharts = false
            })
          }
        },

        fetchAlerts: async () => {
          set((state) => {
            state.isLoadingAlerts = true
            state.alertsError = null
          })

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/dashboard/alerts')
            if (!response.ok) throw new Error('Failed to fetch alerts')
            
            const alerts = await response.json()
            
            set((state) => {
              state.alerts = alerts.slice(0, MAX_ALERTS) // Limit alerts for performance
            })
          } catch (error) {
            set((state) => {
              state.alertsError = error instanceof Error ? error.message : 'Failed to fetch alerts'
            })
          } finally {
            set((state) => {
              state.isLoadingAlerts = false
            })
          }
        },

        refreshAll: async () => {
          get().invalidateCache()
          await get().fetchDashboardData()
        },

        // Real-time update actions
        updateMetrics: (newMetrics) => {
          set((state) => {
            if (state.metrics) {
              Object.assign(state.metrics, newMetrics, {
                lastUpdated: new Date().toISOString(),
              })
            } else {
              state.metrics = {
                totalUAVs: 0,
                authorizedUAVs: 0,
                unauthorizedUAVs: 0,
                activeFlights: 0,
                hibernatingUAVs: 0,
                lowBatteryCount: 0,
                chargingCount: 0,
                maintenanceCount: 0,
                emergencyCount: 0,
                lastUpdated: new Date().toISOString(),
                ...newMetrics,
              }
            }
          })
        },

        updateFlightActivity: (newActivity) => {
          set((state) => {
            if (state.flightActivity) {
              Object.assign(state.flightActivity, newActivity, {
                lastUpdated: new Date().toISOString(),
              })
            } else {
              state.flightActivity = {
                activeFlights: 0,
                todayFlights: 0,
                completedFlights: 0,
                flights: [],
                lastUpdated: new Date().toISOString(),
                ...newActivity,
              }
            }
          })
        },

        updateChartData: (newData) => {
          set((state) => {
            if (state.chartData) {
              Object.assign(state.chartData, newData, {
                lastUpdated: new Date().toISOString(),
              })
            }
          })
        },

        addAlert: (alert) => {
          set((state) => {
            state.alerts.unshift(alert)
            // Keep only the most recent alerts
            if (state.alerts.length > MAX_ALERTS) {
              state.alerts = state.alerts.slice(0, MAX_ALERTS)
            }
          })
        },

        removeAlert: (alertId) => {
          set((state) => {
            state.alerts = state.alerts.filter(alert => alert.id !== alertId)
          })
        },

        clearAlerts: () => {
          set((state) => {
            state.alerts = []
          })
        },

        // Connection management
        setConnectionStatus: (status) => {
          set((state) => {
            Object.assign(state.connectionStatus, status)
          })
        },

        incrementReconnectAttempts: () => {
          set((state) => {
            state.connectionStatus.reconnectAttempts += 1
          })
        },

        resetReconnectAttempts: () => {
          set((state) => {
            state.connectionStatus.reconnectAttempts = 0
          })
        },

        // Error handling
        setError: (error) => {
          set((state) => {
            state.error = error
          })
        },

        setMetricsError: (error) => {
          set((state) => {
            state.metricsError = error
          })
        },

        setChartsError: (error) => {
          set((state) => {
            state.chartsError = error
          })
        },

        setAlertsError: (error) => {
          set((state) => {
            state.alertsError = error
          })
        },

        clearErrors: () => {
          set((state) => {
            state.error = null
            state.metricsError = null
            state.chartsError = null
            state.alertsError = null
          })
        },

        // Cache management
        invalidateCache: () => {
          set((state) => {
            state.lastFetch = null
          })
        },

        isCacheValid: () => {
          const state = get()
          if (!state.lastFetch) return false
          
          const lastFetchTime = new Date(state.lastFetch).getTime()
          const now = Date.now()
          return (now - lastFetchTime) < state.cacheExpiry
        },

        // Performance tracking
        incrementRenderCount: () => {
          set((state) => {
            state.renderCount += 1
          })
        },

        setRenderTime: (time) => {
          set((state) => {
            state.lastRenderTime = time
          })
        },
      }))
    ),
    {
      name: 'enhanced-dashboard-store',
    }
  )
)

// Selectors for better performance
export const useDashboardMetrics = () => useEnhancedDashboardStore(state => ({
  data: state.metrics,
  isLoading: state.isLoadingMetrics,
  error: state.metricsError,
  refetch: state.fetchMetrics,
}))

export const useChartData = () => useEnhancedDashboardStore(state => ({
  data: state.chartData,
  isLoading: state.isLoadingCharts,
  error: state.chartsError,
  refetch: state.fetchChartData,
}))

export const useConnectionStatus = () => useEnhancedDashboardStore(state => state.connectionStatus)
