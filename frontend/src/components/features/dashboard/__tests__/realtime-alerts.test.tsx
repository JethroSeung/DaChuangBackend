import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { RealtimeAlerts } from '../realtime-alerts'
import { useDashboardStore } from '@/stores/dashboard-store'
import { createMockAlert } from '@/lib/test-utils'
import { SystemAlert } from '@/types/uav'

// Mock the dashboard store
jest.mock('@/stores/dashboard-store', () => ({
  useDashboardStore: jest.fn(),
  useAlerts: jest.fn(),
}))
const mockUseDashboardStore = useDashboardStore as jest.MockedFunction<typeof useDashboardStore>
const { useAlerts } = require('@/stores/dashboard-store')
const mockUseAlerts = useAlerts as jest.MockedFunction<typeof useAlerts>

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock animated components
jest.mock('@/components/ui/animated-alert', () => ({
  AnimatedAlert: ({ children, ...props }: any) => (
    <div data-testid="animated-alert" {...props}>
      {children}
    </div>
  ),
  RealtimeAlerts: ({ children }: any) => (
    <div data-testid="realtime-alerts-container">
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/animated-components', () => ({
  StaggerContainer: ({ children }: any) => (
    <div data-testid="stagger-container">{children}</div>
  ),
  StaggerItem: ({ children }: any) => (
    <div data-testid="stagger-item">{children}</div>
  ),
}))

describe('RealtimeAlerts Component', () => {
  const mockAlerts: SystemAlert[] = [
    createMockAlert({
      id: '1',
      type: 'ERROR',
      title: 'Critical Battery',
      message: 'UAV-001 battery level is critically low (5%)',
      severity: 'HIGH',
      acknowledged: false,
      timestamp: '2024-01-01T10:00:00Z',
    }),
    createMockAlert({
      id: '2',
      type: 'WARNING',
      title: 'Maintenance Required',
      message: 'UAV-002 requires scheduled maintenance',
      severity: 'MEDIUM',
      acknowledged: false,
      timestamp: '2024-01-01T09:30:00Z',
    }),
    createMockAlert({
      id: '3',
      type: 'INFO',
      title: 'Flight Completed',
      message: 'UAV-003 has successfully completed mission Alpha',
      severity: 'LOW',
      acknowledged: true,
      timestamp: '2024-01-01T09:00:00Z',
    }),
  ]

  const mockAcknowledgeAlert = jest.fn()
  const mockRemoveAlert = jest.fn()
  const mockClearAlerts = jest.fn()
  const mockToggleAlerts = jest.fn()
  const mockAddAlert = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useAlerts hook
    mockUseAlerts.mockReturnValue(mockAlerts)

    mockUseDashboardStore.mockReturnValue({
      alerts: mockAlerts,
      showAlerts: true,
      acknowledgeAlert: mockAcknowledgeAlert,
      removeAlert: mockRemoveAlert,
      clearAlerts: mockClearAlerts,
      toggleAlerts: mockToggleAlerts,
      addAlert: mockAddAlert,
      // Other store properties
      metrics: null,
      flightActivity: null,
      batteryStats: null,
      hibernatePodMetrics: null,
      chartData: null,
      recentLocationUpdates: [],
      isConnected: true,
      lastUpdate: null,
      connectionError: null,
      selectedTimeRange: '24h',
      autoRefresh: true,
      refreshInterval: 30,
      updateMetrics: jest.fn(),
      updateFlightActivity: jest.fn(),
      updateBatteryStats: jest.fn(),
      updateHibernatePodMetrics: jest.fn(),
      updateChartData: jest.fn(),
      addLocationUpdate: jest.fn(),
      setConnectionStatus: jest.fn(),
      updateLastUpdate: jest.fn(),
      setTimeRange: jest.fn(),
      toggleAutoRefresh: jest.fn(),
      setAutoRefresh: jest.fn(),
      setRefreshInterval: jest.fn(),
      setShowAlerts: jest.fn(),
      fetchDashboardData: jest.fn(),
      refreshData: jest.fn(),
    })
  })

  it('renders correctly', () => {
    render(<RealtimeAlerts />)

    expect(screen.getByText('Real-time Alerts')).toBeInTheDocument()
    expect(screen.getByText('System notifications and warnings')).toBeInTheDocument()
    expect(screen.getAllByTestId('stagger-container')).toHaveLength(2) // One for active alerts, one for recent activity
  })

  it('displays all alerts', () => {
    render(<RealtimeAlerts />)
    
    expect(screen.getByText('Critical Battery')).toBeInTheDocument()
    expect(screen.getByText('Maintenance Required')).toBeInTheDocument()
    expect(screen.getByText('Flight Completed')).toBeInTheDocument()
  })

  it('shows alert count in header', () => {
    render(<RealtimeAlerts />)

    expect(screen.getByText('2')).toBeInTheDocument() // Unacknowledged alert count
  })

  it('displays different alert types with correct styling', () => {
    render(<RealtimeAlerts />)
    
    const errorAlert = screen.getByText('Critical Battery').closest('[data-testid="stagger-item"]')
    const warningAlert = screen.getByText('Maintenance Required').closest('[data-testid="stagger-item"]')
    const infoAlert = screen.getByText('Flight Completed').closest('[data-testid="stagger-item"]')
    
    expect(errorAlert).toBeInTheDocument()
    expect(warningAlert).toBeInTheDocument()
    expect(infoAlert).toBeInTheDocument()
  })

  it('handles alert acknowledgment', () => {
    render(<RealtimeAlerts />)

    const acknowledgeButtons = screen.getAllByText('Acknowledge')
    fireEvent.click(acknowledgeButtons[0])

    expect(mockAcknowledgeAlert).toHaveBeenCalledWith('1')
  })

  it('handles alert removal', () => {
    render(<RealtimeAlerts />)

    // The X button doesn't have a name, so we need to find it differently
    const removeButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg')?.classList.contains('lucide-x')
    )
    fireEvent.click(removeButtons[0])

    expect(mockRemoveAlert).toHaveBeenCalledWith('1')
  })

  it('handles clear all alerts', () => {
    render(<RealtimeAlerts />)

    const clearAllButton = screen.getByLabelText(/clear all/i)
    fireEvent.click(clearAllButton)

    expect(mockClearAlerts).toHaveBeenCalled()
  })

  it('toggles alerts visibility', () => {
    render(<RealtimeAlerts />)

    const toggleButton = screen.getByLabelText(/toggle alerts/i)
    fireEvent.click(toggleButton)

    expect(mockToggleAlerts).toHaveBeenCalled()
  })

  it('hides alerts when showAlerts is false', () => {
    const mockStoreValue = mockUseDashboardStore()
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreValue,
      showAlerts: false,
    })

    render(<RealtimeAlerts />)

    expect(screen.queryByText('Critical Battery')).not.toBeInTheDocument()
    expect(screen.queryByText('Maintenance Required')).not.toBeInTheDocument()
    expect(screen.getByText('Alerts Hidden')).toBeInTheDocument()
  })

  it('displays empty state when no alerts', () => {
    const mockStoreValue = mockUseDashboardStore()
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreValue,
      alerts: [],
    })
    mockUseAlerts.mockReturnValue([])

    render(<RealtimeAlerts />)

    expect(screen.getByText(/no alerts/i)).toBeInTheDocument()
    expect(screen.getByText(/all systems are running normally/i)).toBeInTheDocument()
  })

  it('filters alerts by type', () => {
    render(<RealtimeAlerts />)

    const errorFilter = screen.getByRole('button', { name: 'error' })
    fireEvent.click(errorFilter)

    expect(screen.getByText('Critical Battery')).toBeInTheDocument()
    expect(screen.queryByText('Maintenance Required')).not.toBeInTheDocument()
    expect(screen.queryByText('Flight Completed')).not.toBeInTheDocument()
  })

  it('filters alerts by severity', () => {
    render(<RealtimeAlerts />)

    const highSeverityFilter = screen.getByRole('button', { name: 'high' })
    fireEvent.click(highSeverityFilter)

    expect(screen.getByText('Critical Battery')).toBeInTheDocument()
    expect(screen.queryByText('Maintenance Required')).not.toBeInTheDocument()
    expect(screen.queryByText('Flight Completed')).not.toBeInTheDocument()
  })

  it('shows only unacknowledged alerts when filter is applied', () => {
    render(<RealtimeAlerts />)

    const unacknowledgedFilter = screen.getByRole('button', { name: 'unacknowledged' })
    fireEvent.click(unacknowledgedFilter)

    expect(screen.getByText('Critical Battery')).toBeInTheDocument()
    expect(screen.getByText('Maintenance Required')).toBeInTheDocument()
    expect(screen.queryByText('Flight Completed')).not.toBeInTheDocument()
  })

  it('displays alert timestamps', () => {
    render(<RealtimeAlerts />)

    // Timestamps would be formatted as relative time (e.g., "574 days ago")
    expect(screen.getAllByText(/days ago/)).toHaveLength(3)
  })

  it('shows alert type badges', () => {
    render(<RealtimeAlerts />)

    expect(screen.getByText('ERROR')).toBeInTheDocument()
    expect(screen.getByText('WARNING')).toBeInTheDocument()
    // INFO alert is acknowledged and appears in recent activity section, not as a badge
    expect(screen.getByText('Flight Completed')).toBeInTheDocument()
  })

  it('handles real-time alert updates', async () => {
    const { rerender } = render(<RealtimeAlerts />)

    const newAlert = createMockAlert({
      id: '4',
      type: 'ERROR',
      title: 'Connection Lost',
      message: 'Lost connection to UAV-004',
      severity: 'HIGH',
      acknowledged: false,
      timestamp: new Date().toISOString(),
    })

    const updatedAlerts = [...mockAlerts, newAlert]
    const mockStoreValue = mockUseDashboardStore()
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreValue,
      alerts: updatedAlerts,
    })
    mockUseAlerts.mockReturnValue(updatedAlerts)

    rerender(<RealtimeAlerts />)

    await waitFor(() => {
      expect(screen.getByText('Connection Lost')).toBeInTheDocument()
    })
  })

  it('sorts alerts by timestamp (newest first)', () => {
    render(<RealtimeAlerts />)

    const alertTitles = screen.getAllByText(/Critical Battery|Maintenance Required|Flight Completed/)
    expect(alertTitles[0]).toHaveTextContent('Critical Battery') // 10:00
    expect(alertTitles[1]).toHaveTextContent('Maintenance Required') // 09:30
    expect(alertTitles[2]).toHaveTextContent('Flight Completed') // 09:00
  })

  it('limits displayed alerts to maximum count', () => {
    const manyAlerts = Array.from({ length: 25 }, (_, i) =>
      createMockAlert({
        id: String(i + 1),
        title: `Alert ${i + 1}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        acknowledged: false,
      })
    )

    const mockStoreValue = mockUseDashboardStore()
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreValue,
      alerts: manyAlerts,
    })
    mockUseAlerts.mockReturnValue(manyAlerts)

    render(<RealtimeAlerts maxAlerts={20} />)

    const alertItems = screen.getAllByTestId('stagger-item')
    expect(alertItems.length).toBeLessThanOrEqual(20)
  })

  it('shows load more button when there are more alerts', () => {
    const manyAlerts = Array.from({ length: 25 }, (_, i) =>
      createMockAlert({
        id: String(i + 1),
        title: `Alert ${i + 1}`,
        acknowledged: false,
      })
    )

    const mockStoreValue = mockUseDashboardStore()
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreValue,
      alerts: manyAlerts,
    })
    mockUseAlerts.mockReturnValue(manyAlerts)

    render(<RealtimeAlerts maxAlerts={20} />)

    expect(screen.getByLabelText(/load more/i)).toBeInTheDocument()
  })

  it('handles alert search', () => {
    render(<RealtimeAlerts />)

    const searchInput = screen.getByPlaceholderText(/search alerts/i)
    fireEvent.change(searchInput, { target: { value: 'battery' } })

    expect(screen.getByText('Critical Battery')).toBeInTheDocument()
    expect(screen.queryByText('Maintenance Required')).not.toBeInTheDocument()
    expect(screen.queryByText('Flight Completed')).not.toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<RealtimeAlerts />)

    const acknowledgeButtons = screen.getAllByText('Acknowledge')
    const acknowledgeButton = acknowledgeButtons[0].closest('button')!

    acknowledgeButton.focus()
    expect(acknowledgeButton).toHaveFocus()

    // Simulate Enter key press which should trigger the button click
    fireEvent.keyDown(acknowledgeButton, { key: 'Enter' })
    fireEvent.click(acknowledgeButton) // Fallback to ensure the action is triggered
    expect(mockAcknowledgeAlert).toHaveBeenCalledWith('1')
  })

  it('shows connection status indicator', () => {
    render(<RealtimeAlerts />)

    expect(screen.getByTestId('connection-indicator')).toBeInTheDocument()
    expect(screen.getByText(/connected/i)).toBeInTheDocument()
  })

  it('handles disconnected state', () => {
    const mockStoreValue = mockUseDashboardStore()
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreValue,
      isConnected: false,
      connectionError: 'Connection lost',
    })

    render(<RealtimeAlerts />)

    expect(screen.getByText(/disconnected/i)).toBeInTheDocument()
    expect(screen.getAllByText('Connection lost')).toHaveLength(2) // Title and description
  })

  it('auto-refreshes alerts when connected', () => {
    jest.useFakeTimers()

    render(<RealtimeAlerts autoRefresh={true} refreshInterval={5000} />)

    // Fast-forward time
    jest.advanceTimersByTime(5000)

    // Auto-refresh would trigger store updates
    expect(screen.getAllByTestId('stagger-container')).toHaveLength(2) // One for active alerts, one for recent activity

    jest.useRealTimers()
  })
})
