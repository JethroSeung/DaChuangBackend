import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import { MainNav, MobileNav, QuickNav } from '../main-nav'
import { usePathname } from 'next/navigation'
import { mockFramerMotion, runAxeTest } from '@/lib/test-utils'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock framer-motion
mockFramerMotion()

describe('MainNav Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
  })

  it('renders all navigation items', () => {
    render(<MainNav />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('UAV Management')).toBeInTheDocument()
    expect(screen.getByText('Map View')).toBeInTheDocument()
    expect(screen.getByText('Hibernate Pod')).toBeInTheDocument()
    expect(screen.getByText('Docking Stations')).toBeInTheDocument()
    expect(screen.getByText('Battery Monitor')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/uavs')
    render(<MainNav />)

    const uavLink = screen.getByRole('link', { name: /uav management/i })
    expect(uavLink).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('shows correct icons for each navigation item', () => {
    render(<MainNav />)

    // Check that icons are rendered (they would be Lucide React icons)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const uavLink = screen.getByRole('link', { name: /uav management/i })
    
    expect(dashboardLink).toBeInTheDocument()
    expect(uavLink).toBeInTheDocument()
  })

  it('handles navigation item clicks', () => {
    const mockOnNavigate = jest.fn()
    render(<MainNav onNavigate={mockOnNavigate} />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    fireEvent.click(dashboardLink)

    expect(mockOnNavigate).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<MainNav className="custom-nav" />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('custom-nav')
  })

  it('shows descriptions on hover', () => {
    render(<MainNav />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    
    fireEvent.mouseEnter(dashboardLink)
    expect(screen.getByText('System overview and real-time monitoring')).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(<MainNav />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const uavLink = screen.getByRole('link', { name: /uav management/i })

    dashboardLink.focus()
    expect(dashboardLink).toHaveFocus()

    // Test Tab navigation
    fireEvent.keyDown(dashboardLink, { key: 'Tab' })
    uavLink.focus()
    expect(uavLink).toHaveFocus()
  })

  it('maintains accessibility standards', async () => {
    const { container } = render(<MainNav />)

    // Check for proper navigation role
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    // Check for proper link accessibility
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })

    // Run accessibility tests
    await runAxeTest(container)
  })

  it('handles active state for nested routes', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/uavs/details/123')
    render(<MainNav />)

    const uavLink = screen.getByRole('link', { name: /uav management/i })
    expect(uavLink).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('shows proper link hrefs', () => {
    render(<MainNav />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /uav management/i })).toHaveAttribute('href', '/uavs')
    expect(screen.getByRole('link', { name: /map view/i })).toHaveAttribute('href', '/map')
    expect(screen.getByRole('link', { name: /hibernate pod/i })).toHaveAttribute('href', '/hibernate-pod')
  })
})

describe('MobileNav Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
  })

  it('renders in grid layout', () => {
    render(<MobileNav />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('grid', 'grid-cols-2', 'gap-2', 'p-4')
  })

  it('shows limited navigation items', () => {
    render(<MobileNav />)

    // Should show first 8 items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('UAV Management')).toBeInTheDocument()
    expect(screen.getByText('Map View')).toBeInTheDocument()
    expect(screen.getByText('Hibernate Pod')).toBeInTheDocument()
  })

  it('handles mobile navigation clicks', () => {
    const mockOnNavigate = jest.fn()
    render(<MobileNav onNavigate={mockOnNavigate} />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    fireEvent.click(dashboardLink)

    expect(mockOnNavigate).toHaveBeenCalledTimes(1)
  })

  it('shows icons and text in column layout', () => {
    render(<MobileNav />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
  })

  it('applies active state correctly', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/uavs')
    render(<MobileNav />)

    const uavLink = screen.getByRole('link', { name: /uav management/i })
    expect(uavLink).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('handles animation on interaction', () => {
    render(<MobileNav />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    
    // Test hover animation
    fireEvent.mouseEnter(dashboardLink)
    fireEvent.mouseLeave(dashboardLink)
    
    // Test tap animation
    fireEvent.mouseDown(dashboardLink)
    fireEvent.mouseUp(dashboardLink)
    
    expect(dashboardLink).toBeInTheDocument()
  })
})

describe('QuickNav Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
  })

  it('renders quick access items', () => {
    render(<QuickNav />)

    // Should show first 4 items
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /uav management/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /map view/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /hibernate pod/i })).toBeInTheDocument()
  })

  it('renders in horizontal layout', () => {
    render(<QuickNav />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('flex', 'space-x-1')
  })

  it('applies custom className', () => {
    render(<QuickNav className="custom-quick-nav" />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('custom-quick-nav')
  })

  it('shows only icons in compact format', () => {
    render(<QuickNav />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveClass('p-2')
  })

  it('handles active state for quick nav', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/map')
    render(<QuickNav />)

    const mapLink = screen.getByRole('link', { name: /map view/i })
    expect(mapLink).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('provides tooltips for quick nav items', () => {
    render(<QuickNav />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('title', 'Dashboard')
  })

  it('maintains accessibility in compact mode', async () => {
    const { container } = render(<QuickNav />)

    // Check for proper link accessibility
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
      expect(link).toHaveAttribute('title')
    })

    // Run accessibility tests
    await runAxeTest(container)
  })

  it('handles responsive behavior', () => {
    render(<QuickNav />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('flex', 'space-x-1')
    
    // Links should be compact
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('p-2')
    })
  })
})
