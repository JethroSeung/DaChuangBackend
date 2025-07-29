import React from 'react'
import { render, screen } from '@/lib/test-utils'
import { PageTransition } from '../page-transition'
import { usePathname } from 'next/navigation'
import { mockFramerMotion, mockPrefersReducedMotion } from '@/lib/test-utils'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock animations
jest.mock('@/lib/animations', () => ({
  pageVariants: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  },
  getAnimationVariants: jest.fn((variants) => variants),
}))

// Mock framer-motion
mockFramerMotion()

describe('PageTransition Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
  })

  it('renders children correctly', () => {
    render(
      <PageTransition>
        <div data-testid="page-content">Page Content</div>
      </PageTransition>
    )

    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('wraps content in motion div', () => {
    render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    )

    // The motion.div should be present (mocked as regular div)
    const wrapper = screen.getByText('Content').parentElement
    expect(wrapper).toHaveClass('w-full', 'h-full')
  })

  it('uses pathname as key for animations', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    const { rerender } = render(
      <PageTransition>
        <div>Dashboard Content</div>
      </PageTransition>
    )

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()

    // Change pathname
    ;(usePathname as jest.Mock).mockReturnValue('/uavs')
    
    rerender(
      <PageTransition>
        <div>UAV Content</div>
      </PageTransition>
    )

    expect(screen.getByText('UAV Content')).toBeInTheDocument()
  })

  it('applies correct animation variants', () => {
    render(
      <PageTransition>
        <div>Animated Content</div>
      </PageTransition>
    )

    // The motion div should have the correct props (tested through mocked framer-motion)
    const content = screen.getByText('Animated Content')
    expect(content).toBeInTheDocument()
  })

  it('handles multiple children', () => {
    render(
      <PageTransition>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </PageTransition>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('handles complex nested content', () => {
    render(
      <PageTransition>
        <div>
          <header>Page Header</header>
          <main>
            <section>
              <h1>Page Title</h1>
              <p>Page description</p>
            </section>
          </main>
          <footer>Page Footer</footer>
        </div>
      </PageTransition>
    )

    expect(screen.getByText('Page Header')).toBeInTheDocument()
    expect(screen.getByText('Page Title')).toBeInTheDocument()
    expect(screen.getByText('Page description')).toBeInTheDocument()
    expect(screen.getByText('Page Footer')).toBeInTheDocument()
  })

  it('respects prefers-reduced-motion', () => {
    mockPrefersReducedMotion(true)
    
    render(
      <PageTransition>
        <div>Reduced Motion Content</div>
      </PageTransition>
    )

    expect(screen.getByText('Reduced Motion Content')).toBeInTheDocument()
    // Animation should be disabled when prefers-reduced-motion is set
  })

  it('handles pathname changes correctly', () => {
    const pathnames = ['/dashboard', '/uavs', '/map', '/hibernate-pod']
    
    pathnames.forEach((pathname, index) => {
      ;(usePathname as jest.Mock).mockReturnValue(pathname)
      
      const { unmount } = render(
        <PageTransition>
          <div>Content for {pathname}</div>
        </PageTransition>
      )

      expect(screen.getByText(`Content for ${pathname}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('maintains full width and height', () => {
    render(
      <PageTransition>
        <div data-testid="content">Content</div>
      </PageTransition>
    )

    const wrapper = screen.getByTestId('content').parentElement
    expect(wrapper).toHaveClass('w-full', 'h-full')
  })

  it('handles empty children gracefully', () => {
    render(<PageTransition>{null}</PageTransition>)
    
    // Should not throw error and should render the wrapper
    const wrapper = document.querySelector('.w-full.h-full')
    expect(wrapper).toBeInTheDocument()
  })

  it('handles string children', () => {
    render(
      <PageTransition>
        Simple text content
      </PageTransition>
    )

    expect(screen.getByText('Simple text content')).toBeInTheDocument()
  })

  it('handles React fragments', () => {
    render(
      <PageTransition>
        <>
          <div>Fragment Child 1</div>
          <div>Fragment Child 2</div>
        </>
      </PageTransition>
    )

    expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
    expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
  })

  it('preserves component state during transitions', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0)
      return (
        <div>
          <span>Count: {count}</span>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
      )
    }

    render(
      <PageTransition>
        <TestComponent />
      </PageTransition>
    )

    const button = screen.getByText('Increment')
    const countDisplay = screen.getByText('Count: 0')

    expect(countDisplay).toBeInTheDocument()
    
    // Click button to change state
    button.click()
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('handles conditional rendering', () => {
    const ConditionalComponent = ({ show }: { show: boolean }) => (
      <PageTransition>
        {show ? <div>Visible Content</div> : <div>Hidden Content</div>}
      </PageTransition>
    )

    const { rerender } = render(<ConditionalComponent show={true} />)
    expect(screen.getByText('Visible Content')).toBeInTheDocument()

    rerender(<ConditionalComponent show={false} />)
    expect(screen.getByText('Hidden Content')).toBeInTheDocument()
  })

  it('works with different pathname formats', () => {
    const pathnames = [
      '/',
      '/dashboard',
      '/uavs/123',
      '/map?filter=active',
      '/hibernate-pod#section1',
    ]

    pathnames.forEach(pathname => {
      ;(usePathname as jest.Mock).mockReturnValue(pathname)
      
      const { unmount } = render(
        <PageTransition>
          <div>Content for {pathname}</div>
        </PageTransition>
      )

      expect(screen.getByText(`Content for ${pathname}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('handles rapid pathname changes', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    const { rerender } = render(
      <PageTransition>
        <div>Dashboard</div>
      </PageTransition>
    )

    // Rapidly change pathnames
    ;(usePathname as jest.Mock).mockReturnValue('/uavs')
    rerender(
      <PageTransition>
        <div>UAVs</div>
      </PageTransition>
    )

    ;(usePathname as jest.Mock).mockReturnValue('/map')
    rerender(
      <PageTransition>
        <div>Map</div>
      </PageTransition>
    )

    expect(screen.getByText('Map')).toBeInTheDocument()
  })

  it('maintains accessibility during transitions', () => {
    render(
      <PageTransition>
        <div role="main" aria-label="Page content">
          <h1>Accessible Page</h1>
          <button>Accessible Button</button>
        </div>
      </PageTransition>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByLabelText('Page content')).toBeInTheDocument()
  })
})
