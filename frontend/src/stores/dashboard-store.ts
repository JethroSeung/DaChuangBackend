'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { 
  DashboardMetrics, 
  Alert, 
  SystemHealth, 
  ChartData, 
  UAVActivityChart, 
  BatteryChart, 
  SystemPerformanceChart,
  DashboardFilters,
  TimeRange,
  WeatherData
} from '@/types'

interface DashboardState {
  // Data
  metrics: DashboardMetrics | null
  alerts: Alert[]
  systemHealth: SystemHealth | null
  chartData: {
    uavActivity: UAVActivityChart | null
    battery: BatteryChart | null
    systemPerformance: SystemPerformanceChart | null
  }
  weatherData: WeatherData | null

  // UI State
  loading: boolean
  error: string | null
  filters: DashboardFilters
  autoRefresh: boolean
  refreshInterval: number
  lastUpdated: string | null

  // Actions
  setMetrics: (metrics: DashboardMetrics) => void
  setAlerts: (alerts: Alert[]) => void
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (alertId: string) => void
  removeAlert: (alertId: string) => void
  setSystemHealth: (health: SystemHealth) => void
  setChartData: (type: keyof DashboardState['chartData'], data: any) => void
  setWeatherData: (weather: WeatherData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<DashboardFilters>) => void
  setAutoRefresh: (enabled: boolean) => void
  setRefreshInterval: (interval: number) => void

  // API Actions
  fetchDashboardData: () => Promise<void>
  fetchMetrics: () => Promise<void>
  fetchAlerts: () => Promise<void>
  fetchSystemHealth: () => Promise<void>
  fetchChartData: (timeRange: TimeRange) => Promise<void>
  fetchWeatherData: () => Promise<void>
  acknowledgeAlertById: (alertId: string) => Promise<boolean>

  // Computed
  getFilteredAlerts: () => Alert[]
  getUnacknowledgedAlerts: () => Alert[]
  getCriticalAlerts: () => Alert[]
  getSystemHealthStatus: () => 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'
}

// Mock API functions
const mockAPI = {
  async fetchMetrics(): Promise<DashboardMetrics> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      totalUAVs: 24,
      authorizedUAVs: 18,
      unauthorizedUAVs: 6,
      activeFlights: 3,
      hibernatingUAVs: 8,
      lowBatteryCount: 2,
      chargingCount: 5,
      maintenanceCount: 1,
      emergencyCount: 0,
      offlineCount: 1,
      systemHealth: {
        overall: 'HEALTHY',
        components: {
          database: { status: 'HEALTHY', lastCheck: new Date().toISOString(), uptime: 99.9 },
          webSocket: { status: 'HEALTHY', lastCheck: new Date().toISOString(), uptime: 99.8 },
          apiServer: { status: 'HEALTHY', lastCheck: new Date().toISOString(), responseTime: 45 },
          dockingStations: { status: 'WARNING', lastCheck: new Date().toISOString(), message: '1 station offline' },
          hibernatePods: { status: 'HEALTHY', lastCheck: new Date().toISOString() },
          batteryMonitoring: { status: 'HEALTHY', lastCheck: new Date().toISOString() },
        },
        lastUpdated: new Date().toISOString(),
      },
      realtimeData: {
        activeConnections: 12,
        messagesPerSecond: 45,
        dataTransferRate: 1.2,
        lastUpdate: new Date().toISOString(),
      },
    }
  },

  async fetchAlerts(): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return [
      {
        id: '1',
        type: 'BATTERY_LOW',
        severity: 'MEDIUM',
        title: 'Low Battery Warning',
        message: 'UAV-002 battery level is below 50%',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        acknowledged: false,
        uavId: '2',
      },
      {
        id: '2',
        type: 'UNAUTHORIZED_UAV',
        severity: 'HIGH',
        title: 'Unauthorized UAV Detected',
        message: 'Unknown UAV detected in restricted area',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        acknowledged: false,
        location: { latitude: 39.9042, longitude: 116.4074 },
      },
    ]
  },

  async fetchChartData(timeRange: TimeRange): Promise<{
    uavActivity: UAVActivityChart
    battery: BatteryChart
    systemPerformance: SystemPerformanceChart
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const now = new Date()
    const generateTimeSeriesData = (hours: number, baseValue: number, variance: number): ChartData[] => {
      const data: ChartData[] = []
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString()
        const value = baseValue + (Math.random() - 0.5) * variance
        data.push({ timestamp, value: Math.max(0, value) })
      }
      return data
    }

    return {
      uavActivity: {
        authorized: generateTimeSeriesData(24, 18, 4),
        unauthorized: generateTimeSeriesData(24, 6, 2),
        active: generateTimeSeriesData(24, 3, 2),
        hibernating: generateTimeSeriesData(24, 8, 3),
      },
      battery: {
        healthy: generateTimeSeriesData(24, 15, 3),
        warning: generateTimeSeriesData(24, 5, 2),
        critical: generateTimeSeriesData(24, 2, 1),
        charging: generateTimeSeriesData(24, 5, 2),
      },
      systemPerformance: {
        cpuUsage: generateTimeSeriesData(24, 45, 20),
        memoryUsage: generateTimeSeriesData(24, 60, 15),
        networkLatency: generateTimeSeriesData(24, 25, 10),
        activeConnections: generateTimeSeriesData(24, 12, 5),
      },
    }
  },

  async fetchWeatherData(): Promise<WeatherData> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      temperature: 22,
      humidity: 65,
      windSpeed: 8,
      windDirection: 180,
      visibility: 10,
      conditions: 'Partly Cloudy',
      timestamp: new Date().toISOString(),
      location: { latitude: 39.9042, longitude: 116.4074 },
    }
  },

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return true
  },
}

export const useDashboardStore = create<DashboardState>()(
  immer((set, get) => ({
    // Initial state
    metrics: null,
    alerts: [],
    systemHealth: null,
    chartData: {
      uavActivity: null,
      battery: null,
      systemPerformance: null,
    },
    weatherData: null,
    loading: false,
    error: null,
    filters: {
      timeRange: '24h',
      showAcknowledged: false,
    },
    autoRefresh: true,
    refreshInterval: 30, // seconds
    lastUpdated: null,

    // Basic setters
    setMetrics: (metrics) => set((state) => { 
      state.metrics = metrics
      state.lastUpdated = new Date().toISOString()
    }),
    setAlerts: (alerts) => set((state) => { state.alerts = alerts }),
    addAlert: (alert) => set((state) => { 
      state.alerts.unshift(alert) // Add to beginning for newest first
    }),
    acknowledgeAlert: (alertId) => set((state) => {
      const alert = state.alerts.find(a => a.id === alertId)
      if (alert) {
        alert.acknowledged = true
      }
    }),
    removeAlert: (alertId) => set((state) => {
      state.alerts = state.alerts.filter(a => a.id !== alertId)
    }),
    setSystemHealth: (health) => set((state) => { state.systemHealth = health }),
    setChartData: (type, data) => set((state) => {
      state.chartData[type] = data
    }),
    setWeatherData: (weather) => set((state) => { state.weatherData = weather }),
    setLoading: (loading) => set((state) => { state.loading = loading }),
    setError: (error) => set((state) => { state.error = error }),
    setFilters: (filters) => set((state) => {
      state.filters = { ...state.filters, ...filters }
    }),
    setAutoRefresh: (enabled) => set((state) => { state.autoRefresh = enabled }),
    setRefreshInterval: (interval) => set((state) => { state.refreshInterval = interval }),

    // API actions
    fetchDashboardData: async () => {
      set((state) => { 
        state.loading = true
        state.error = null
      })

      try {
        const [metrics, alerts, chartData, weatherData] = await Promise.all([
          mockAPI.fetchMetrics(),
          mockAPI.fetchAlerts(),
          mockAPI.fetchChartData(get().filters.timeRange),
          mockAPI.fetchWeatherData(),
        ])

        set((state) => {
          state.metrics = metrics
          state.systemHealth = metrics.systemHealth
          state.alerts = alerts
          state.chartData = chartData
          state.weatherData = weatherData
          state.loading = false
          state.lastUpdated = new Date().toISOString()
        })
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
          state.loading = false
        })
      }
    },

    fetchMetrics: async () => {
      try {
        const metrics = await mockAPI.fetchMetrics()
        set((state) => { 
          state.metrics = metrics
          state.systemHealth = metrics.systemHealth
        })
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch metrics'
        })
      }
    },

    fetchAlerts: async () => {
      try {
        const alerts = await mockAPI.fetchAlerts()
        set((state) => { state.alerts = alerts })
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch alerts'
        })
      }
    },

    fetchSystemHealth: async () => {
      try {
        const metrics = await mockAPI.fetchMetrics()
        set((state) => { state.systemHealth = metrics.systemHealth })
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch system health'
        })
      }
    },

    fetchChartData: async (timeRange) => {
      try {
        const chartData = await mockAPI.fetchChartData(timeRange)
        set((state) => { state.chartData = chartData })
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch chart data'
        })
      }
    },

    fetchWeatherData: async () => {
      try {
        const weatherData = await mockAPI.fetchWeatherData()
        set((state) => { state.weatherData = weatherData })
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch weather data'
        })
      }
    },

    acknowledgeAlertById: async (alertId) => {
      try {
        const success = await mockAPI.acknowledgeAlert(alertId)
        if (success) {
          set((state) => {
            const alert = state.alerts.find(a => a.id === alertId)
            if (alert) {
              alert.acknowledged = true
            }
          })
        }
        return success
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to acknowledge alert'
        })
        return false
      }
    },

    // Computed values
    getFilteredAlerts: () => {
      const { alerts, filters } = get()
      let filtered = [...alerts]

      if (!filters.showAcknowledged) {
        filtered = filtered.filter(alert => !alert.acknowledged)
      }

      if (filters.alertSeverity && filters.alertSeverity.length > 0) {
        filtered = filtered.filter(alert => filters.alertSeverity!.includes(alert.severity))
      }

      return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },

    getUnacknowledgedAlerts: () => {
      return get().alerts.filter(alert => !alert.acknowledged)
    },

    getCriticalAlerts: () => {
      return get().alerts.filter(alert => alert.severity === 'CRITICAL' && !alert.acknowledged)
    },

    getSystemHealthStatus: () => {
      const health = get().systemHealth
      if (!health) return 'UNKNOWN'
      return health.overall
    },
  }))
)
