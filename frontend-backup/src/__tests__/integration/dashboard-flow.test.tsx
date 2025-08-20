import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { useDashboardStore } from '@/stores/dashboard-store'
import { createMockAlert, createMockUAV } from '@/lib/test-utils'

// Mock WebSocket for real-time updates
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN,
}

// Mock global WebSocket
global.WebSocket = jest.fn(() => mockWebSocket) as any

// Integration test component for dashboard
const DashboardTestComponent = () => {
  const {
    metrics,
    alerts,
    recentLocationUpdates,
    isConnected,
    connectionError,
    showAlerts,
    autoRefresh,
    selectedTimeRange,
    fetchDashboardData,
    addAlert,
    acknowledgeAlert,
    removeAlert,
    clearAlerts,
    addLocationUpdate,
    setConnectionStatus,
    setTimeRange,
    setAutoRefresh,
    setShowAlerts,
    updateLastUpdate,
  } = useDashboardStore()

  const [wsConnected, setWsConnected] = React.useState(false)

  React.useEffect(() => {
    // Simulate initial data fetch
    fetchDashboardData()
    
    // Simulate WebSocket connection
    const ws = new WebSocket('ws://localhost:8080/ws')
    
    ws.addEventListener('open', () => {
      setWsConnected(true)
      setConnectionStatus(true)
    })
    
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'alert') {
        addAlert(data.payload)
      } else if (data.type === 'location_update') {
        addLocationUpdate(data.payload)
      }
    })
    
    ws.addEventListener('error', () => {
      setConnectionStatus(false, 'WebSocket connection failed')
    })
    
    return () => {
      ws.close()
      setConnectionStatus(false)
    }
  }, [])

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range)
    fetchDashboardData()
  }

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
  }

  const handleToggleAlerts = () => {
    setShowAlerts(!showAlerts)
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert(alertId)
  }

  const handleRemoveAlert = (alertId: string) => {
    removeAlert(alertId)
  }

  const handleClearAllAlerts = () => {
    clearAlerts()
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Connection Status */}
      <div data-testid="connection-status">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {connectionError && <span> - {connectionError}</span>}
        {wsConnected && <span> (WebSocket Active)</span>}
      </div>

      {/* Controls */}
      <div data-testid="dashboard-controls">
        <select 
          value={selectedTimeRange} 
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          data-testid="time-range-select"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        
        <button onClick={handleToggleAutoRefresh} data-testid="auto-refresh-toggle">
          Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
        </button>
        
        <button onClick={handleToggleAlerts} data-testid="alerts-toggle">
          Alerts: {showAlerts ? 'VISIBLE' : 'HIDDEN'}
        </button>
        
        <button onClick={() => fetchDashboardData()} data-testid="refresh-button">
          Refresh Data
        </button>
      </div>

      {/* Metrics */}
      {metrics && (
        <div data-testid="dashboard-metrics">
          <h2>System Metrics</h2>
          <div>Total UAVs: {metrics.totalUAVs}</div>
          <div>Authorized: {metrics.authorizedUAVs}</div>
          <div>Unauthorized: {metrics.unauthorizedUAVs}</div>
          <div>Active Flights: {metrics.activeFlights}</div>
          <div>Hibernating: {metrics.hibernatingUAVs}</div>
        </div>
      )}

      {/* Alerts */}
      {showAlerts && (
        <div data-testid="alerts-section">
          <h2>Alerts ({alerts.length})</h2>
          
          <div>
            <button onClick={handleClearAllAlerts} data-testid="clear-all-alerts">
              Clear All
            </button>
          </div>
          
          {alerts.length === 0 ? (
            <p>No alerts</p>
          ) : (
            <div data-testid="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} data-testid={`alert-${alert.id}`}>
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                  <p>Type: {alert.type}</p>
                  <p>Severity: {alert.severity}</p>
                  <p>Acknowledged: {alert.acknowledged ? 'Yes' : 'No'}</p>
                  
                  <div>
                    {!alert.acknowledged && (
                      <button 
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        data-testid={`acknowledge-${alert.id}`}
                      >
                        Acknowledge
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveAlert(alert.id)}
                      data-testid={`remove-${alert.id}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Location Updates */}
      <div data-testid="location-updates">
        <h2>Recent Location Updates ({recentLocationUpdates.length})</h2>
        {recentLocationUpdates.slice(0, 5).map((update, index) => (
          <div key={index} data-testid={`location-update-${index}`}>
            UAV {update.rfidTag}: {update.latitude}, {update.longitude}
          </div>
        ))}
      </div>
    </div>
  )
}

describe('Dashboard Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset dashboard store
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

    // Mock fetch for dashboard data
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
  })

  it('loads dashboard data on mount', async () => {
    render(<DashboardTestComponent />)

    // Should show initial state
    expect(screen.getByText('Status: Disconnected')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total UAVs: 10')).toBeInTheDocument()
      expect(screen.getByText('Authorized: 8')).toBeInTheDocument()
      expect(screen.getByText('Active Flights: 3')).toBeInTheDocument()
    })

    // Should show WebSocket connection
    expect(screen.getByText('Status: Connected (WebSocket Active)')).toBeInTheDocument()
  })

  it('handles time range changes', async () => {
    render(<DashboardTestComponent />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-metrics')).toBeInTheDocument()
    })

    // Change time range
    const timeRangeSelect = screen.getByTestId('time-range-select')
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } })

    // Should update selected time range
    expect(timeRangeSelect).toHaveValue('7d')

    // Should trigger data refresh
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2) // Initial + after time range change
    })
  })

  it('toggles auto refresh', () => {
    render(<DashboardTestComponent />)

    const autoRefreshToggle = screen.getByTestId('auto-refresh-toggle')
    
    // Initially ON
    expect(screen.getByText('Auto Refresh: ON')).toBeInTheDocument()

    // Toggle OFF
    fireEvent.click(autoRefreshToggle)
    expect(screen.getByText('Auto Refresh: OFF')).toBeInTheDocument()

    // Toggle back ON
    fireEvent.click(autoRefreshToggle)
    expect(screen.getByText('Auto Refresh: ON')).toBeInTheDocument()
  })

  it('toggles alerts visibility', () => {
    render(<DashboardTestComponent />)

    const alertsToggle = screen.getByTestId('alerts-toggle')
    
    // Initially visible
    expect(screen.getByText('Alerts: VISIBLE')).toBeInTheDocument()
    expect(screen.getByTestId('alerts-section')).toBeInTheDocument()

    // Toggle hidden
    fireEvent.click(alertsToggle)
    expect(screen.getByText('Alerts: HIDDEN')).toBeInTheDocument()
    expect(screen.queryByTestId('alerts-section')).not.toBeInTheDocument()
  })

  it('handles real-time alert updates', async () => {
    render(<DashboardTestComponent />)

    // Wait for WebSocket connection
    await waitFor(() => {
      expect(screen.getByText(/WebSocket Active/)).toBeInTheDocument()
    })

    // Simulate receiving an alert via WebSocket
    const mockAlert = createMockAlert({
      id: '1',
      title: 'Low Battery',
      message: 'UAV-001 battery is low',
      type: 'WARNING',
      severity: 'MEDIUM',
    })

    // Simulate WebSocket message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'alert',
        payload: mockAlert,
      }),
    })

    // Trigger the message handler
    const { addAlert } = useDashboardStore.getState()
    addAlert(mockAlert)

    // Should display the new alert
    await waitFor(() => {
      expect(screen.getByText('Alerts (1)')).toBeInTheDocument()
      expect(screen.getByText('Low Battery')).toBeInTheDocument()
      expect(screen.getByText('UAV-001 battery is low')).toBeInTheDocument()
    })
  })

  it('handles alert acknowledgment', async () => {
    const mockAlert = createMockAlert({
      id: '1',
      title: 'Test Alert',
      acknowledged: false,
    })

    // Add alert to store
    useDashboardStore.getState().addAlert(mockAlert)

    render(<DashboardTestComponent />)

    // Should show unacknowledged alert
    await waitFor(() => {
      expect(screen.getByText('Acknowledged: No')).toBeInTheDocument()
      expect(screen.getByTestId('acknowledge-1')).toBeInTheDocument()
    })

    // Acknowledge alert
    fireEvent.click(screen.getByTestId('acknowledge-1'))

    // Should update acknowledgment status
    await waitFor(() => {
      expect(screen.getByText('Acknowledged: Yes')).toBeInTheDocument()
      expect(screen.queryByTestId('acknowledge-1')).not.toBeInTheDocument()
    })
  })

  it('handles alert removal', async () => {
    const mockAlert = createMockAlert({
      id: '1',
      title: 'Test Alert',
    })

    // Add alert to store
    useDashboardStore.getState().addAlert(mockAlert)

    render(<DashboardTestComponent />)

    // Should show alert
    await waitFor(() => {
      expect(screen.getByText('Alerts (1)')).toBeInTheDocument()
      expect(screen.getByTestId('alert-1')).toBeInTheDocument()
    })

    // Remove alert
    fireEvent.click(screen.getByTestId('remove-1'))

    // Should remove alert
    await waitFor(() => {
      expect(screen.getByText('Alerts (0)')).toBeInTheDocument()
      expect(screen.queryByTestId('alert-1')).not.toBeInTheDocument()
      expect(screen.getByText('No alerts')).toBeInTheDocument()
    })
  })

  it('clears all alerts', async () => {
    // Add multiple alerts
    const alerts = [
      createMockAlert({ id: '1', title: 'Alert 1' }),
      createMockAlert({ id: '2', title: 'Alert 2' }),
      createMockAlert({ id: '3', title: 'Alert 3' }),
    ]

    alerts.forEach(alert => {
      useDashboardStore.getState().addAlert(alert)
    })

    render(<DashboardTestComponent />)

    // Should show all alerts
    await waitFor(() => {
      expect(screen.getByText('Alerts (3)')).toBeInTheDocument()
    })

    // Clear all alerts
    fireEvent.click(screen.getByTestId('clear-all-alerts'))

    // Should remove all alerts
    await waitFor(() => {
      expect(screen.getByText('Alerts (0)')).toBeInTheDocument()
      expect(screen.getByText('No alerts')).toBeInTheDocument()
    })
  })

  it('handles real-time location updates', async () => {
    render(<DashboardTestComponent />)

    // Wait for WebSocket connection
    await waitFor(() => {
      expect(screen.getByText(/WebSocket Active/)).toBeInTheDocument()
    })

    // Simulate location update
    const locationUpdate = {
      uavId: 1,
      rfidTag: 'UAV-001',
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 100,
      timestamp: new Date().toISOString(),
      speed: 25,
      heading: 180,
    }

    // Add location update to store
    useDashboardStore.getState().addLocationUpdate(locationUpdate)

    // Should display location update
    await waitFor(() => {
      expect(screen.getByText('Recent Location Updates (1)')).toBeInTheDocument()
      expect(screen.getByText('UAV UAV-001: 40.7128, -74.0060')).toBeInTheDocument()
    })
  })

  it('handles connection errors', async () => {
    render(<DashboardTestComponent />)

    // Simulate connection error
    useDashboardStore.getState().setConnectionStatus(false, 'Network timeout')

    // Should show error status
    await waitFor(() => {
      expect(screen.getByText('Status: Disconnected - Network timeout')).toBeInTheDocument()
    })
  })

  it('refreshes data manually', async () => {
    render(<DashboardTestComponent />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-metrics')).toBeInTheDocument()
    })

    // Clear previous fetch calls
    ;(global.fetch as jest.Mock).mockClear()

    // Click refresh
    fireEvent.click(screen.getByTestId('refresh-button'))

    // Should trigger data fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
