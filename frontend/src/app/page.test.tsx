import { render, screen } from '@testing-library/react'
import Home from './page'

// Mock the components that might have complex dependencies
jest.mock('@/components/layout/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>
  }
})

jest.mock('@/components/layout/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>
  }
})

jest.mock('@/components/features/dashboard/DashboardStats', () => {
  return function MockDashboardStats() {
    return <div data-testid="dashboard-stats">Dashboard Stats</div>
  }
})

jest.mock('@/components/features/dashboard/RecentActivity', () => {
  return function MockRecentActivity() {
    return <div data-testid="recent-activity">Recent Activity</div>
  }
})

jest.mock('@/components/features/dashboard/SystemStatus', () => {
  return function MockSystemStatus() {
    return <div data-testid="system-status">System Status</div>
  }
})

jest.mock('@/components/features/map/MapContainer', () => {
  return function MockMapContainer() {
    return <div data-testid="map-container">Map Container</div>
  }
})

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    // Just check that the page renders without throwing an error
    expect(document.body).toBeInTheDocument()
  })

  it('contains main dashboard elements', () => {
    render(<Home />)
    
    // Check for main dashboard structure
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })
})
