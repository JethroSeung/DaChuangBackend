import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import { Sidebar } from '../sidebar'
import { mockFramerMotion, runAxeTest } from '@/lib/test-utils'

// Mock the main nav component
jest.mock('../main-nav', () => ({
  MainNav: () => (
    <div data-testid="main-nav">
      <a href="/dashboard">Dashboard</a>
      <a href="/uavs">UAVs</a>
    </div>
  ),
}))

// Mock animations
jest.mock('@/lib/animations', () => ({
  sidebarVariants: {
    expanded: { width: 280 },
    collapsed: { width: 80 },
  },
  getAnimationVariants: jest.fn((variants) => variants),
}))

// Mock framer-motion
mockFramerMotion()

describe('Sidebar Component', () => {
  const mockOnToggle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Sidebar />)

    expect(screen.getByTestId('main-nav')).toBeInTheDocument()
    expect(screen.getByText('UAV Control')).toBeInTheDocument()
    expect(screen.getByText('Management System')).toBeInTheDocument()
  })

  it('displays logo and branding when expanded', () => {
    render(<Sidebar collapsed={false} />)

    expect(screen.getByText('UAV Control')).toBeInTheDocument()
    expect(screen.getByText('Management System')).toBeInTheDocument()
  })

  it('hides text when collapsed', () => {
    render(<Sidebar collapsed={true} />)

    // Text should be hidden when collapsed
    const brandingText = screen.queryByText('UAV Control')
    expect(brandingText).not.toBeInTheDocument()
  })

  it('shows toggle button', () => {
    render(<Sidebar onToggle={mockOnToggle} />)

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('handles toggle button click', () => {
    render(<Sidebar onToggle={mockOnToggle} />)

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
    fireEvent.click(toggleButton)

    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('shows correct toggle icon when expanded', () => {
    render(<Sidebar collapsed={false} onToggle={mockOnToggle} />)

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
    // Should show ChevronLeft icon when expanded
    expect(toggleButton).toBeInTheDocument()
  })

  it('shows correct toggle icon when collapsed', () => {
    render(<Sidebar collapsed={true} onToggle={mockOnToggle} />)

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
    // Should show ChevronRight icon when collapsed
    expect(toggleButton).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Sidebar className="custom-sidebar" />)

    const sidebar = screen.getByTestId('main-nav').closest('div')
    expect(sidebar).toHaveClass('custom-sidebar')
  })

  it('renders navigation component', () => {
    render(<Sidebar />)

    expect(screen.getByTestId('main-nav')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('UAVs')).toBeInTheDocument()
  })

  it('displays version information when expanded', () => {
    render(<Sidebar collapsed={false} />)

    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
    expect(screen.getByText('© 2024 UAV Systems')).toBeInTheDocument()
  })

  it('hides version information when collapsed', () => {
    render(<Sidebar collapsed={true} />)

    expect(screen.queryByText('Version 1.0.0')).not.toBeInTheDocument()
    expect(screen.queryByText('© 2024 UAV Systems')).not.toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    render(<Sidebar />)

    const sidebar = screen.getByTestId('main-nav').closest('div')
    expect(sidebar).toHaveClass('flex', 'flex-col', 'h-full', 'bg-card', 'border-r')
  })

  it('handles animation states', () => {
    const { rerender } = render(<Sidebar collapsed={false} />)

    // Should be in expanded state
    let sidebar = screen.getByTestId('main-nav').closest('div')
    expect(sidebar).toBeInTheDocument()

    // Change to collapsed
    rerender(<Sidebar collapsed={true} />)
    sidebar = screen.getByTestId('main-nav').closest('div')
    expect(sidebar).toBeInTheDocument()
  })

  it('maintains accessibility standards', async () => {
    const { container } = render(<Sidebar onToggle={mockOnToggle} />)

    // Check for proper button accessibility
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
    expect(toggleButton).toBeInTheDocument()

    // Check for navigation accessibility
    expect(screen.getByTestId('main-nav')).toBeInTheDocument()

    // Run accessibility tests
    await runAxeTest(container)
  })

  it('supports keyboard navigation', () => {
    render(<Sidebar onToggle={mockOnToggle} />)

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
    
    toggleButton.focus()
    expect(toggleButton).toHaveFocus()

    // Test Enter key
    fireEvent.keyDown(toggleButton, { key: 'Enter' })
    expect(mockOnToggle).toHaveBeenCalledTimes(1)

    // Test Space key
    fireEvent.keyDown(toggleButton, { key: ' ' })
    expect(mockOnToggle).toHaveBeenCalledTimes(2)
  })

  it('handles missing onToggle prop gracefully', () => {
    render(<Sidebar />)

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
    
    // Should not throw error when clicked without onToggle
    expect(() => {
      fireEvent.click(toggleButton)
    }).not.toThrow()
  })

  it('adjusts padding based on collapsed state', () => {
    const { rerender } = render(<Sidebar collapsed={false} />)

    let navContainer = screen.getByTestId('main-nav').parentElement
    expect(navContainer).toHaveClass('px-3')

    rerender(<Sidebar collapsed={true} />)
    navContainer = screen.getByTestId('main-nav').parentElement
    expect(navContainer).toHaveClass('px-2')
  })

  it('shows logo icon consistently', () => {
    const { rerender } = render(<Sidebar collapsed={false} />)

    // Logo should be present when expanded
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument()

    rerender(<Sidebar collapsed={true} />)

    // Logo should still be present when collapsed
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
  })

  it('handles responsive behavior', () => {
    render(<Sidebar />)

    const sidebar = screen.getByTestId('main-nav').closest('div')
    
    // Should have proper responsive classes
    expect(sidebar).toHaveClass('flex', 'flex-col', 'h-full')
  })

  it('maintains proper z-index and positioning', () => {
    render(<Sidebar />)

    const sidebar = screen.getByTestId('main-nav').closest('div')
    
    // Should have proper background and border
    expect(sidebar).toHaveClass('bg-card', 'border-r')
  })

  it('handles animation variants correctly', () => {
    const { rerender } = render(<Sidebar collapsed={false} />)

    // Should use expanded variant
    let sidebar = screen.getByTestId('main-nav').closest('div')
    expect(sidebar).toBeInTheDocument()

    rerender(<Sidebar collapsed={true} />)

    // Should use collapsed variant
    sidebar = screen.getByTestId('main-nav').closest('div')
    expect(sidebar).toBeInTheDocument()
  })

  it('provides proper semantic structure', () => {
    render(<Sidebar />)

    // Should have proper navigation structure
    const nav = screen.getByTestId('main-nav')
    expect(nav).toBeInTheDocument()

    // Should have header section with logo
    expect(screen.getByText('UAV Control')).toBeInTheDocument()

    // Should have footer section with version info
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
  })
})
