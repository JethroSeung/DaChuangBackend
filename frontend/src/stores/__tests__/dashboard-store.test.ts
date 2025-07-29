import { renderHook, act } from '@testing-library/react'
import { useDashboardStore } from '../dashboard-store'
import { createMockAlert, createMockUAV } from '@/lib/test-utils'
import { DashboardMetrics, FlightActivity, BatteryStatistics } from '../dashboard-store'
import { SystemAlert, UAVLocationUpdate } from '@/types/uav'

describe('Dashboard Store', () => {
  beforeEach(() => {
    // Reset store state
    useDashboardStore.setState({
      metrics: null,
      flightActivity: null,
      batteryStats: null,
      hibernatePodMetrics: null,
      chartData: null,
      alerts: [],
      recentLocationUpdates: [],
      isConnected: false,
      lastUpdate: null,
      connectionError: null,
      selectedTimeRange: '24h',
      autoRefresh: true,
      refreshInterval: 30,
      showAlerts: true,
    })
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('metrics management', () => {
    it('should update metrics', () => {
      const mockMetrics: DashboardMetrics = {
        totalUAVs: 15,
        authorizedUAVs: 12,
        unauthorizedUAVs: 3,
        activeFlights: 5,
        hibernatingUAVs: 4,
        lowBatteryCount: 2,
        chargingCount: 3,
        maintenanceCount: 1,
        emergencyCount: 0,
      }

      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.updateMetrics(mockMetrics)
      })

      expect(result.current.metrics).toEqual(mockMetrics)
      expect(result.current.lastUpdate).toBeTruthy()
    })

    it('should update flight activity', () => {
      const mockFlightActivity: FlightActivity = {
        activeFlights: 3,
        todayFlights: 8,
        completedFlights: 5,
        flights: [
          {
            id: 1,
            uavRfid: 'UAV-001',
            missionName: 'Test Mission',
            startTime: '2024-01-01T10:00:00Z',
            status: 'ACTIVE',
          },
        ],
      }

      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.updateFlightActivity(mockFlightActivity)
      })

      expect(result.current.flightActivity).toEqual(mockFlightActivity)
    })

    it('should update battery statistics', () => {
      const mockBatteryStats: BatteryStatistics = {
        lowBattery: 2,
        criticalBattery: 1,
        overheating: 0,
        charging: 3,
        healthy: 8,
      }

      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.updateBatteryStats(mockBatteryStats)
      })

      expect(result.current.batteryStats).toEqual(mockBatteryStats)
    })
  })

  describe('alerts management', () => {
    it('should add alert', () => {
      const mockAlert = createMockAlert({
        id: 1,
        type: 'WARNING',
        title: 'Low Battery',
        message: 'UAV-001 has low battery',
      })

      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.addAlert(mockAlert)
      })

      expect(result.current.alerts).toHaveLength(1)
      expect(result.current.alerts[0]).toEqual(mockAlert)
    })

    it('should remove alert', () => {
      const mockAlert1 = createMockAlert({ id: '1', title: 'Alert 1' })
      const mockAlert2 = createMockAlert({ id: '2', title: 'Alert 2' })

      const { result } = renderHook(() => useDashboardStore())

      // Add alerts
      act(() => {
        result.current.addAlert(mockAlert1)
        result.current.addAlert(mockAlert2)
      })

      expect(result.current.alerts).toHaveLength(2)

      // Remove one alert
      act(() => {
        result.current.removeAlert('1')
      })

      expect(result.current.alerts).toHaveLength(1)
      expect(result.current.alerts[0].id).toBe('2')
    })

    it('should acknowledge alert', () => {
      const mockAlert = createMockAlert({
        id: '1',
        acknowledged: false,
      })

      const { result } = renderHook(() => useDashboardStore())

      // Add alert
      act(() => {
        result.current.addAlert(mockAlert)
      })

      expect(result.current.alerts[0].acknowledged).toBe(false)

      // Acknowledge alert
      act(() => {
        result.current.acknowledgeAlert('1')
      })

      expect(result.current.alerts[0].acknowledged).toBe(true)
    })

    it('should clear all alerts', () => {
      const mockAlert1 = createMockAlert({ id: 1 })
      const mockAlert2 = createMockAlert({ id: 2 })

      const { result } = renderHook(() => useDashboardStore())

      // Add alerts
      act(() => {
        result.current.addAlert(mockAlert1)
        result.current.addAlert(mockAlert2)
      })

      expect(result.current.alerts).toHaveLength(2)

      // Clear all alerts
      act(() => {
        result.current.clearAlerts()
      })

      expect(result.current.alerts).toHaveLength(0)
    })

    it('should limit alerts to maximum count', () => {
      const { result } = renderHook(() => useDashboardStore())

      // Add more than 50 alerts (assuming max is 50)
      act(() => {
        for (let i = 1; i <= 55; i++) {
          result.current.addAlert(createMockAlert({ id: i.toString(), title: `Alert ${i}` }))
        }
      })

      // Should only keep the latest 50 alerts
      expect(result.current.alerts).toHaveLength(50)
      expect(result.current.alerts[0].id).toBe('55') // First alert should be #55 (newest first)
      expect(result.current.alerts[49].id).toBe('6') // Last alert should be #6
    })
  })

  describe('location updates', () => {
    it('should add location update', () => {
      const mockLocationUpdate: UAVLocationUpdate = {
        uavId: 1,
        rfidTag: 'UAV-001',
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: 100,
        timestamp: new Date().toISOString(),
        speed: 25,
        heading: 180,
      }

      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.addLocationUpdate(mockLocationUpdate)
      })

      expect(result.current.recentLocationUpdates).toHaveLength(1)
      expect(result.current.recentLocationUpdates[0]).toEqual(mockLocationUpdate)
    })

    it('should limit location updates to maximum count', () => {
      const { result } = renderHook(() => useDashboardStore())

      // Add more than 100 location updates (assuming max is 100)
      act(() => {
        for (let i = 1; i <= 105; i++) {
          result.current.addLocationUpdate({
            uavId: i,
            rfidTag: `UAV-${i.toString().padStart(3, '0')}`,
            latitude: 40.7128 + i * 0.001,
            longitude: -74.0060 + i * 0.001,
            altitude: 100,
            timestamp: new Date().toISOString(),
            speed: 25,
            heading: 180,
          })
        }
      })

      // Should only keep the latest 100 updates
      expect(result.current.recentLocationUpdates).toHaveLength(100)
      expect(result.current.recentLocationUpdates[0].uavId).toBe(105) // First should be #105 (newest first)
      expect(result.current.recentLocationUpdates[99].uavId).toBe(6) // Last should be #6
    })
  })

  describe('connection management', () => {
    it('should set connection status', () => {
      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.setConnectionStatus(true)
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.connectionError).toBeNull()

      act(() => {
        result.current.setConnectionStatus(false, 'Connection lost')
      })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.connectionError).toBe('Connection lost')
    })

    it('should clear connection error when reconnecting', () => {
      const { result } = renderHook(() => useDashboardStore())

      // Set error first
      act(() => {
        result.current.setConnectionStatus(false, 'Connection error')
      })

      expect(result.current.connectionError).toBe('Connection error')

      // Clear error by reconnecting
      act(() => {
        result.current.setConnectionStatus(true)
      })

      expect(result.current.connectionError).toBeNull()
    })
  })

  describe('UI settings', () => {
    it('should set time range', () => {
      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.setTimeRange('1h')
      })

      expect(result.current.selectedTimeRange).toBe('1h')

      act(() => {
        result.current.setTimeRange('7d')
      })

      expect(result.current.selectedTimeRange).toBe('7d')
    })

    it('should set auto refresh', () => {
      const { result } = renderHook(() => useDashboardStore())

      expect(result.current.autoRefresh).toBe(true)

      act(() => {
        result.current.setAutoRefresh(false)
      })

      expect(result.current.autoRefresh).toBe(false)

      act(() => {
        result.current.setAutoRefresh(true)
      })

      expect(result.current.autoRefresh).toBe(true)
    })

    it('should set refresh interval', () => {
      const { result } = renderHook(() => useDashboardStore())

      act(() => {
        result.current.setRefreshInterval(60)
      })

      expect(result.current.refreshInterval).toBe(60)
    })

    it('should set alerts visibility', () => {
      const { result } = renderHook(() => useDashboardStore())

      expect(result.current.showAlerts).toBe(true)

      act(() => {
        result.current.setShowAlerts(false)
      })

      expect(result.current.showAlerts).toBe(false)

      act(() => {
        result.current.setShowAlerts(true)
      })

      expect(result.current.showAlerts).toBe(true)
    })
  })

  describe('data management', () => {
    it('should update last update timestamp', () => {
      const { result } = renderHook(() => useDashboardStore())

      expect(result.current.lastUpdate).toBeNull()

      act(() => {
        result.current.updateLastUpdate()
      })

      expect(result.current.lastUpdate).toBeTruthy()
      expect(typeof result.current.lastUpdate).toBe('string')
    })

    it('should fetch dashboard data', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          metrics: {
            totalUAVs: 10,
            authorizedUAVs: 8,
            unauthorizedUAVs: 2,
            activeFlights: 3,
            hibernatingUAVs: 2,
            lowBatteryCount: 1,
            chargingCount: 2,
            maintenanceCount: 1,
            emergencyCount: 0,
          },
        }),
      })

      const { result } = renderHook(() => useDashboardStore())

      await act(async () => {
        await result.current.fetchDashboardData()
      })

      expect(result.current.metrics).toBeTruthy()
      expect(result.current.lastUpdate).toBeTruthy()
      expect(result.current.connectionError).toBeNull()
    })
  })

  describe('computed selectors', () => {
    it('should filter unacknowledged alerts', () => {
      const { result } = renderHook(() => useDashboardStore())

      // Add alerts with different acknowledgment status
      act(() => {
        result.current.addAlert(createMockAlert({ id: '1', acknowledged: false }))
        result.current.addAlert(createMockAlert({ id: '2', acknowledged: true }))
        result.current.addAlert(createMockAlert({ id: '3', acknowledged: false }))
      })

      const unacknowledgedAlerts = result.current.alerts.filter(alert => !alert.acknowledged)
      expect(unacknowledgedAlerts).toHaveLength(2)
      expect(unacknowledgedAlerts.map(a => a.id)).toEqual(['3', '1']) // Newest first
    })

    it('should filter critical alerts', () => {
      const { result } = renderHook(() => useDashboardStore())

      // Add different types of alerts
      act(() => {
        result.current.addAlert(createMockAlert({ id: '1', type: 'ERROR' }))
        result.current.addAlert(createMockAlert({ id: '2', type: 'WARNING' }))
        result.current.addAlert(createMockAlert({ id: '3', type: 'CRITICAL' }))
      })

      const criticalAlerts = result.current.alerts.filter(alert =>
        alert.type === 'CRITICAL' || alert.type === 'ERROR'
      )
      expect(criticalAlerts).toHaveLength(2)
      expect(criticalAlerts.map(a => a.type)).toEqual(['CRITICAL', 'ERROR'])
    })
  })
})
