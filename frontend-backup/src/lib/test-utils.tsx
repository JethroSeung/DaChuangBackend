import React, { ReactElement } from 'react'
import { render, RenderOptions, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUAVStore } from '@/stores/uav-store'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useAuthStore } from '@/stores/auth-store'
import { User, Role, Permission } from '@/types/auth'
import { UAV, SystemAlert, DockingStation } from '@/types/uav'
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

// Test wrapper component
interface TestProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

function TestProviders({ children, queryClient }: TestProvidersProps) {
  const client = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
  }
) => {
  const { queryClient, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  })
}

// Mock data factories
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  roles: [createMockRole()],
  permissions: [createMockPermission()],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockRole = (overrides?: Partial<Role>): Role => ({
  id: 1,
  name: 'ADMIN',
  description: 'Administrator role',
  permissions: [createMockPermission()],
  ...overrides,
})

export const createMockPermission = (overrides?: Partial<Permission>): Permission => ({
  id: 1,
  name: 'UAV_READ',
  resource: 'UAV',
  action: 'READ',
  description: 'Read UAV data',
  ...overrides,
})

export const createMockUAV = (overrides?: Partial<UAV>): UAV => ({
  id: 1,
  rfidTag: 'UAV-001',
  ownerName: 'Test Owner',
  model: 'Test Model',
  status: 'AUTHORIZED',
  operationalStatus: 'READY',
  inHibernatePod: false,
  totalFlightHours: 10.5,
  totalFlightCycles: 25,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  regions: [],
  ...overrides,
})

export const createMockAlert = (overrides?: Partial<SystemAlert>): SystemAlert => ({
  id: 1,
  type: 'WARNING',
  title: 'Test Alert',
  message: 'This is a test alert',
  timestamp: new Date().toISOString(),
  acknowledged: false,
  source: 'SYSTEM',
  severity: 'MEDIUM',
  ...overrides,
})

export const createMockDockingStation = (overrides?: Partial<DockingStation>): DockingStation => ({
  id: 1,
  name: 'Test Station',
  location: { latitude: 40.7128, longitude: -74.0060 },
  status: 'AVAILABLE',
  capacity: 4,
  currentOccupancy: 1,
  isActive: true,
  ...overrides,
})

// Store helpers
export const setupAuthStore = (user?: User) => {
  const store = useAuthStore.getState()
  
  if (user) {
    store.user = user
    store.isAuthenticated = true
    store.token = 'mock-token'
  } else {
    store.user = null
    store.isAuthenticated = false
    store.token = null
  }
  
  store.isLoading = false
  store.error = null
}

export const setupUAVStore = (uavs: UAV[] = []) => {
  const store = useUAVStore.getState()
  store.uavs = uavs
  store.loading = false
  store.error = null
  store.selectedUAV = null
}

export const setupDashboardStore = () => {
  const store = useDashboardStore.getState()
  store.metrics = {
    totalUAVs: 10,
    authorizedUAVs: 8,
    unauthorizedUAVs: 2,
    activeFlights: 3,
    hibernatingUAVs: 2,
    lowBatteryCount: 1,
    chargingCount: 2,
    maintenanceCount: 1,
    emergencyCount: 0,
  }
  store.isConnected = true
  store.lastUpdate = new Date().toISOString()
  store.alerts = []
}

// Test utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const mockApiResponse = <T,>(data: T, success = true) => ({
  success,
  message: success ? 'Success' : 'Error',
  data: success ? data : undefined,
})

export const mockApiError = (message = 'API Error') => {
  throw new Error(message)
}

// Mock fetch
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      status: ok ? 200 : 400,
      statusText: ok ? 'OK' : 'Bad Request',
    })
  ) as jest.Mock
}

// Cleanup function
export const cleanup = () => {
  // Reset all stores
  useAuthStore.getState().logout()
  useUAVStore.setState({
    uavs: [],
    selectedUAV: null,
    loading: false,
    error: null,
    filter: {},
    searchQuery: '',
  })
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
  })
  
  // Clear mocks
  jest.clearAllMocks()
  
  // Clear localStorage
  localStorage.clear()
  sessionStorage.clear()
}

// Animation testing utilities
export const mockFramerMotion = () => {
  jest.mock('framer-motion', () => ({
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    },
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
    }),
    useMotionValue: () => ({
      get: jest.fn(),
      set: jest.fn(),
    }),
  }))
}

export const mockPrefersReducedMotion = (value: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? value : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Accessibility testing utilities
export const runAxeTest = async (container: HTMLElement) => {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

export const checkAriaAttributes = (element: HTMLElement, expectedAttributes: Record<string, string>) => {
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(attr, value)
  })
}

// User interaction helpers
export const createUser = () => userEvent.setup()

export const typeIntoInput = async (input: HTMLElement, text: string) => {
  const user = createUser()
  await user.clear(input)
  await user.type(input, text)
}

export const clickElement = async (element: HTMLElement) => {
  const user = createUser()
  await user.click(element)
}

// Wait utilities
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument()
  })
}

export const waitForLoadingToComplete = async () => {
  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
  }, { timeout: 5000 })
}

// Custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    }
  },
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }
export { userEvent }
