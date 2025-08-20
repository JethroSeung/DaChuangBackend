import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { Header } from '../header'
import { useDashboardStore } from '@/stores/dashboard-store'
import { usePathname } from 'next/navigation'
import { mockFramerMotion, runAxeTest } from '@/lib/test-utils'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock the dashboard store
jest.mock('@/stores/dashboard-store', () => ({
  useDashboardStore: jest.fn(),
  useConnectionStatus: jest.fn(),
  useUnacknowledgedAlerts: jest.fn(),
}))

// Mock the main nav component
jest.mock('../main-nav', () => ({
  MainNav: ({ onNavigate }: { onNavigate?: () => void }) => (
    <div data-testid="main-nav">
      <button onClick={onNavigate} data-testid="nav-item">
        Dashboard
      </button>
    </div>
  ),
}))

// Mock UI components
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
      <div onClick={() => onOpenChange?.(false)}>{children}</div>
    </div>
  ),
  SheetContent: ({ children }: any) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetTrigger: ({ children }: any) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
}))

// Mock framer-motion
mockFramerMotion()

describe('Header Component', () => {
  const mockOnMenuClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock pathname
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    // Mock dashboard store hooks
    ;(useDashboardStore as jest.Mock).mockReturnValue({
      alerts: [],
      isConnected: true,
    })

    // Mock individual hooks
    const { useConnectionStatus, useUnacknowledgedAlerts } = require('@/stores/dashboard-store')
    ;(useConnectionStatus as jest.Mock).mockReturnValue({
      isConnected: true,
      lastConnected: new Date(),
      reconnectAttempts: 0,
    })
    ;(useUnacknowledgedAlerts as jest.Mock).mockReturnValue([])
  })

  it('renders correctly', () => {
    render(<Header onMenuClick={mockOnMenuClick} />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getAllByText('UAV Control')).toHaveLength(2) // One in mobile menu, one in desktop
    expect(screen.getByText('Management System')).toBeInTheDocument()
  })

  it('displays logo and branding', () => {
    render(<Header />)

    expect(screen.getAllByText('UAV Control')).toHaveLength(2) // One in mobile menu, one in desktop
    expect(screen.getByText('Management System')).toBeInTheDocument()

    // Check for Shield icon (logo)
    const logoLink = screen.getByRole('link', { name: /uav control/i })
    expect(logoLink).toHaveAttribute('href', '/dashboard')
  })

  it('shows mobile menu trigger', () => {
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toHaveClass('md:hidden')
  })

  it('handles mobile menu interaction', () => {
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    const sheet = screen.getByTestId('sheet')

    // Initially closed
    expect(sheet).toHaveAttribute('data-open', 'false')

    // Open mobile menu
    fireEvent.click(menuButton)
    expect(sheet).toHaveAttribute('data-open', 'true')
  })

  it('displays search functionality', () => {
    render(<Header />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('handles search form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    render(<Header />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    const searchForm = searchInput.closest('form')

    fireEvent.change(searchInput, { target: { value: 'UAV-001' } })
    fireEvent.submit(searchForm!)

    expect(consoleSpy).toHaveBeenCalledWith('Searching for:', 'UAV-001')
    consoleSpy.mockRestore()
  })

  it('does not search with empty query', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    render(<Header />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    const searchForm = searchInput.closest('form')

    fireEvent.submit(searchForm!)

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('displays connection status', () => {
    render(<Header />)

    // Should show connected status by default
    const connectionIndicator = screen.getByTestId('connection-status')
    expect(connectionIndicator).toBeInTheDocument()
  })

  it('shows disconnected state', () => {
    ;(useDashboardStore as jest.Mock).mockReturnValue({
      alerts: [],
      isConnected: false,
    })

    render(<Header />)

    const connectionIndicator = screen.getByTestId('connection-status')
    expect(connectionIndicator).toHaveClass('text-destructive')
  })

  it('displays notification badge with alert count', () => {
    ;(useDashboardStore as jest.Mock).mockReturnValue({
      alerts: [
        { id: '1', type: 'ERROR', acknowledged: false },
        { id: '2', type: 'WARNING', acknowledged: false },
      ],
      isConnected: true,
    })

    render(<Header />)

    const notificationButton = screen.getByRole('button', { name: /notifications/i })
    expect(notificationButton).toBeInTheDocument()
    
    const badge = screen.getByText('2')
    expect(badge).toBeInTheDocument()
  })

  it('handles dark mode toggle', () => {
    render(<Header />)

    const darkModeButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(darkModeButton).toBeInTheDocument()

    fireEvent.click(darkModeButton)
    // Dark mode toggle functionality would be tested here
  })

  it('displays user menu', () => {
    render(<Header />)

    const userMenuButton = screen.getByRole('button', { name: /user menu/i })
    expect(userMenuButton).toBeInTheDocument()
  })

  it('shows page title based on pathname', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/uavs')
    render(<Header />)

    expect(screen.getByText('UAV Management')).toBeInTheDocument()
  })

  it('handles different pathnames correctly', () => {
    const pathTitleMap = [
      ['/dashboard', 'Dashboard'],
      ['/uavs', 'UAV Management'],
      ['/map', 'Map View'],
      ['/hibernate-pod', 'Hibernate Pod'],
      ['/battery', 'Battery Monitor'],
    ]

    pathTitleMap.forEach(([path, title]) => {
      ;(usePathname as jest.Mock).mockReturnValue(path)
      const { unmount } = render(<Header />)
      
      expect(screen.getByText(title)).toBeInTheDocument()
      unmount()
    })
  })

  it('calls onMenuClick when provided', () => {
    render(<Header onMenuClick={mockOnMenuClick} />)

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(menuButton)

    expect(mockOnMenuClick).toHaveBeenCalledTimes(1)
  })

  it('maintains accessibility standards', async () => {
    const { container } = render(<Header />)

    // Check for proper header role
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // Check for proper button labels
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    
    // Run accessibility tests
    await runAxeTest(container)
  })

  it('handles keyboard navigation', () => {
    render(<Header />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })

    // Test tab navigation
    searchInput.focus()
    expect(searchInput).toHaveFocus()

    menuButton.focus()
    expect(menuButton).toHaveFocus()
  })

  it('supports responsive design', () => {
    render(<Header />)

    // Check responsive classes
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0', 'z-50', 'w-full')

    // Mobile menu should be hidden on desktop
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toHaveClass('md:hidden')

    // Logo text should be hidden on small screens
    const logoText = screen.getByText('UAV Control').parentElement
    expect(logoText).toHaveClass('hidden', 'sm:block')
  })

  it('closes mobile menu when navigation occurs', () => {
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    const sheet = screen.getByTestId('sheet')

    // Open mobile menu
    fireEvent.click(menuButton)
    expect(sheet).toHaveAttribute('data-open', 'true')

    // Navigate (simulate clicking nav item)
    const navItem = screen.getByTestId('nav-item')
    fireEvent.click(navItem)

    // Menu should close
    expect(sheet).toHaveAttribute('data-open', 'false')
  })

  it('handles search input changes', () => {
    render(<Header />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    expect(searchInput).toHaveValue('test query')
  })

  it('displays proper backdrop blur effect', () => {
    render(<Header />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass(
      'bg-background/95',
      'backdrop-blur',
      'supports-[backdrop-filter]:bg-background/60'
    )
  })
})
