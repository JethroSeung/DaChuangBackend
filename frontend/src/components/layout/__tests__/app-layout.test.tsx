import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import { AppLayout } from '../app-layout'
import { mockFramerMotion, runAxeTest } from '@/lib/test-utils'

// Mock the layout components
jest.mock('../header', () => ({
  Header: ({ onMenuClick }: { onMenuClick?: () => void }) => (
    <div data-testid="header">
      <button onClick={onMenuClick} data-testid="menu-button">
        Menu
      </button>
    </div>
  ),
}))

jest.mock('../sidebar', () => ({
  Sidebar: ({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) => (
    <div data-testid="sidebar" data-collapsed={collapsed}>
      <button onClick={onToggle} data-testid="sidebar-toggle">
        Toggle
      </button>
    </div>
  ),
}))

jest.mock('../page-transition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-transition">{children}</div>
  ),
}))

// Mock framer-motion
mockFramerMotion()

describe('AppLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(
      <AppLayout>
        <div>Test content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('page-transition')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <AppLayout className="custom-class">
        <div>Content</div>
      </AppLayout>
    )

    const main = screen.getByRole('main')
    expect(main).toHaveClass('custom-class')
  })

  it('manages sidebar collapsed state', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    const sidebar = screen.getByTestId('sidebar')
    const sidebarToggle = screen.getByTestId('sidebar-toggle')

    // Initially not collapsed
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')

    // Toggle sidebar
    fireEvent.click(sidebarToggle)
    expect(sidebar).toHaveAttribute('data-collapsed', 'true')

    // Toggle again
    fireEvent.click(sidebarToggle)
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
  })

  it('handles header menu click', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    const sidebar = screen.getByTestId('sidebar')
    const menuButton = screen.getByTestId('menu-button')

    // Initially not collapsed
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')

    // Click menu button
    fireEvent.click(menuButton)
    expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  })

  it('has proper layout structure', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    // Check main layout structure
    const container = screen.getByTestId('header').parentElement?.parentElement
    expect(container).toHaveClass('flex', 'h-screen', 'bg-background')

    // Check main content area
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1', 'overflow-y-auto')

    // Check content container
    const contentContainer = main.firstElementChild
    expect(contentContainer).toHaveClass('container', 'mx-auto', 'px-4', 'py-6')
  })

  it('hides sidebar on mobile', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    const sidebarContainer = screen.getByTestId('sidebar').parentElement
    expect(sidebarContainer).toHaveClass('hidden', 'md:flex')
  })

  it('renders children inside page transition', () => {
    render(
      <AppLayout>
        <div data-testid="child-content">Child content</div>
      </AppLayout>
    )

    const pageTransition = screen.getByTestId('page-transition')
    const childContent = screen.getByTestId('child-content')
    
    expect(pageTransition).toContainElement(childContent)
  })

  it('maintains accessibility standards', async () => {
    const { container } = render(
      <AppLayout>
        <h1>Page Title</h1>
        <p>Page content</p>
      </AppLayout>
    )

    // Check for proper semantic structure
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Run accessibility tests
    await runAxeTest(container)
  })

  it('handles responsive design', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    // Check responsive classes
    const mainContentArea = screen.getByTestId('header').parentElement
    expect(mainContentArea).toHaveClass('flex-1', 'flex', 'flex-col', 'overflow-hidden')
  })

  it('passes props correctly to child components', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    const sidebar = screen.getByTestId('sidebar')
    const header = screen.getByTestId('header')

    // Sidebar should receive collapsed prop
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    
    // Header should have menu button (indicating onMenuClick prop was passed)
    expect(screen.getByTestId('menu-button')).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    const menuButton = screen.getByTestId('menu-button')
    const sidebarToggle = screen.getByTestId('sidebar-toggle')

    // Focus should work on interactive elements
    menuButton.focus()
    expect(menuButton).toHaveFocus()

    sidebarToggle.focus()
    expect(sidebarToggle).toHaveFocus()
  })

  it('supports nested content structure', () => {
    render(
      <AppLayout>
        <div>
          <header>Page Header</header>
          <section>
            <article>Article content</article>
          </section>
          <footer>Page Footer</footer>
        </div>
      </AppLayout>
    )

    expect(screen.getByText('Page Header')).toBeInTheDocument()
    expect(screen.getByText('Article content')).toBeInTheDocument()
    expect(screen.getByText('Page Footer')).toBeInTheDocument()
  })

  it('maintains state consistency', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    const sidebar = screen.getByTestId('sidebar')
    const menuButton = screen.getByTestId('menu-button')
    const sidebarToggle = screen.getByTestId('sidebar-toggle')

    // Both buttons should affect the same state
    fireEvent.click(menuButton)
    expect(sidebar).toHaveAttribute('data-collapsed', 'true')

    fireEvent.click(sidebarToggle)
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')

    fireEvent.click(menuButton)
    expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  })
})
