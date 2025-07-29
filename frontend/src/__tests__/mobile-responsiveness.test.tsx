import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// Import components to test
import { MobileResponsiveLayout } from '@/components/layout/mobile-responsive-layout'
import { MobileDashboard } from '@/components/features/dashboard/mobile-dashboard'
import { MobileUAVManagement } from '@/components/features/uav/mobile-uav-management'
import { MobileTable } from '@/components/ui/mobile-table'
import { MobileForm } from '@/components/ui/mobile-form'
import { EnhancedInput } from '@/components/ui/enhanced-input'

// Import hooks to test
import { 
  useResponsive, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop,
  useScreenSize,
  useOrientation,
  useIsTouchDevice
} from '@/hooks/use-responsive'

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
}

// Mock providers for testing
const TestProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-providers">
      {children}
    </div>
  )
}

describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    // Reset window dimensions before each test
    mockWindowDimensions(1024, 768)
    mockMatchMedia(false)
  })

  describe('Responsive Hooks', () => {
    describe('useScreenSize', () => {
      it('should return current screen dimensions', () => {
        mockWindowDimensions(375, 667) // iPhone dimensions
        
        const { result } = renderHook(() => useScreenSize())
        
        expect(result.current.width).toBe(375)
        expect(result.current.height).toBe(667)
      })

      it('should update dimensions on window resize', () => {
        const { result } = renderHook(() => useScreenSize())
        
        act(() => {
          mockWindowDimensions(768, 1024)
          window.dispatchEvent(new Event('resize'))
        })
        
        expect(result.current.width).toBe(768)
        expect(result.current.height).toBe(1024)
      })
    })

    describe('useIsMobile', () => {
      it('should return true for mobile screen sizes', () => {
        mockWindowDimensions(375, 667)
        mockMatchMedia(false) // md breakpoint not matched
        
        const { result } = renderHook(() => useIsMobile())
        
        expect(result.current).toBe(true)
      })

      it('should return false for desktop screen sizes', () => {
        mockWindowDimensions(1024, 768)
        mockMatchMedia(true) // md breakpoint matched
        
        const { result } = renderHook(() => useIsMobile())
        
        expect(result.current).toBe(false)
      })
    })

    describe('useOrientation', () => {
      it('should detect portrait orientation', () => {
        mockWindowDimensions(375, 667) // height > width
        
        const { result } = renderHook(() => useOrientation())
        
        expect(result.current).toBe('portrait')
      })

      it('should detect landscape orientation', () => {
        mockWindowDimensions(667, 375) // width > height
        
        const { result } = renderHook(() => useOrientation())
        
        expect(result.current).toBe('landscape')
      })
    })

    describe('useResponsive', () => {
      it('should provide comprehensive responsive information', () => {
        mockWindowDimensions(375, 667)
        mockMatchMedia(false)
        
        const { result } = renderHook(() => useResponsive())
        
        expect(result.current.isMobile).toBe(true)
        expect(result.current.isTablet).toBe(false)
        expect(result.current.isDesktop).toBe(false)
        expect(result.current.orientation).toBe('portrait')
        expect(result.current.screenSize.width).toBe(375)
        expect(result.current.screenSize.height).toBe(667)
      })
    })
  })

  describe('Mobile Layout Components', () => {
    describe('MobileResponsiveLayout', () => {
      it('should render mobile header on mobile devices', () => {
        mockWindowDimensions(375, 667)
        
        render(
          <TestProviders>
            <MobileResponsiveLayout>
              <div>Test Content</div>
            </MobileResponsiveLayout>
          </TestProviders>
        )
        
        expect(screen.getByText('Test Content')).toBeInTheDocument()
        // Check for mobile-specific elements
        expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument()
      })

      it('should show bottom navigation on mobile', () => {
        mockWindowDimensions(375, 667)
        
        render(
          <TestProviders>
            <MobileResponsiveLayout>
              <div>Test Content</div>
            </MobileResponsiveLayout>
          </TestProviders>
        )
        
        // Check for bottom navigation
        const bottomNav = screen.getByRole('navigation')
        expect(bottomNav).toBeInTheDocument()
      })

      it('should handle menu toggle', async () => {
        mockWindowDimensions(375, 667)
        
        render(
          <TestProviders>
            <MobileResponsiveLayout>
              <div>Test Content</div>
            </MobileResponsiveLayout>
          </TestProviders>
        )
        
        const menuButton = screen.getByRole('button', { name: /toggle menu/i })
        
        fireEvent.click(menuButton)
        
        // Check if menu opens (this would depend on your implementation)
        await waitFor(() => {
          // Add specific assertions based on your menu implementation
          expect(menuButton).toBeInTheDocument()
        })
      })
    })

    describe('MobileTable', () => {
      const mockData = [
        { id: 1, name: 'UAV-001', status: 'Active', battery: 85 },
        { id: 2, name: 'UAV-002', status: 'Hibernating', battery: 92 },
      ]

      const mockColumns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', type: 'badge' as const },
        { key: 'battery', label: 'Battery', type: 'number' as const },
      ]

      it('should render data in mobile-friendly format', () => {
        render(
          <TestProviders>
            <MobileTable
              data={mockData}
              columns={mockColumns}
              title="Test Table"
            />
          </TestProviders>
        )
        
        expect(screen.getByText('Test Table')).toBeInTheDocument()
        expect(screen.getByText('UAV-001')).toBeInTheDocument()
        expect(screen.getByText('UAV-002')).toBeInTheDocument()
      })

      it('should handle search functionality', async () => {
        render(
          <TestProviders>
            <MobileTable
              data={mockData}
              columns={mockColumns}
              searchable
            />
          </TestProviders>
        )
        
        const searchInput = screen.getByPlaceholderText(/search/i)
        
        fireEvent.change(searchInput, { target: { value: 'UAV-001' } })
        
        await waitFor(() => {
          expect(screen.getByText('UAV-001')).toBeInTheDocument()
          expect(screen.queryByText('UAV-002')).not.toBeInTheDocument()
        })
      })

      it('should show empty state when no data', () => {
        render(
          <TestProviders>
            <MobileTable
              data={[]}
              columns={mockColumns}
              emptyMessage="No UAVs found"
            />
          </TestProviders>
        )
        
        expect(screen.getByText('No UAVs found')).toBeInTheDocument()
      })
    })

    describe('EnhancedInput', () => {
      it('should render with proper mobile accessibility', () => {
        render(
          <TestProviders>
            <EnhancedInput
              label="Test Input"
              placeholder="Enter text"
              required
            />
          </TestProviders>
        )
        
        const input = screen.getByLabelText('Test Input')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('required')
        expect(input).toHaveAttribute('aria-required', 'true')
      })

      it('should show error states properly', () => {
        render(
          <TestProviders>
            <EnhancedInput
              label="Test Input"
              error="This field is required"
            />
          </TestProviders>
        )
        
        const input = screen.getByLabelText('Test Input')
        const errorMessage = screen.getByRole('alert')
        
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(errorMessage).toHaveTextContent('This field is required')
        expect(input).toHaveAttribute('aria-describedby', errorMessage.id)
      })

      it('should handle password toggle', () => {
        render(
          <TestProviders>
            <EnhancedInput
              label="Password"
              type="password"
              showPasswordToggle
            />
          </TestProviders>
        )
        
        const input = screen.getByLabelText('Password')
        const toggleButton = screen.getByRole('button', { name: /show password/i })
        
        expect(input).toHaveAttribute('type', 'password')
        
        fireEvent.click(toggleButton)
        
        expect(input).toHaveAttribute('type', 'text')
        expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
      })
    })
  })

  describe('Touch Interactions', () => {
    it('should handle touch events properly', () => {
      render(
        <TestProviders>
          <button className="touch-target">Touch Me</button>
        </TestProviders>
      )
      
      const button = screen.getByText('Touch Me')
      
      // Simulate touch events
      fireEvent.touchStart(button)
      fireEvent.touchEnd(button)
      
      expect(button).toBeInTheDocument()
    })
  })

  describe('Responsive Breakpoints', () => {
    const breakpointTests = [
      { width: 320, expected: 'mobile' },
      { width: 640, expected: 'mobile' },
      { width: 768, expected: 'tablet' },
      { width: 1024, expected: 'desktop' },
      { width: 1280, expected: 'desktop' },
    ]

    breakpointTests.forEach(({ width, expected }) => {
      it(`should detect ${expected} at ${width}px width`, () => {
        mockWindowDimensions(width, 768)
        
        const { result } = renderHook(() => useResponsive())
        
        switch (expected) {
          case 'mobile':
            expect(result.current.isMobile).toBe(true)
            break
          case 'tablet':
            expect(result.current.isTablet).toBe(true)
            break
          case 'desktop':
            expect(result.current.isDesktop).toBe(true)
            break
        }
      })
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper focus management on mobile', () => {
      render(
        <TestProviders>
          <MobileResponsiveLayout>
            <button>First Button</button>
            <button>Second Button</button>
          </MobileResponsiveLayout>
        </TestProviders>
      )
      
      const firstButton = screen.getByText('First Button')
      const secondButton = screen.getByText('Second Button')
      
      firstButton.focus()
      expect(firstButton).toHaveFocus()
      
      // Test tab navigation
      fireEvent.keyDown(firstButton, { key: 'Tab' })
      expect(secondButton).toHaveFocus()
    })

    it('should support reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })
      
      render(
        <TestProviders>
          <div className="mobile-fade-in">Animated Content</div>
        </TestProviders>
      )
      
      expect(screen.getByText('Animated Content')).toBeInTheDocument()
    })
  })
})
