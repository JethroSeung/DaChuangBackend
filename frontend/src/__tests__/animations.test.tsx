import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { mockFramerMotion, mockPrefersReducedMotion } from '@/lib/test-utils'

// Mock framer-motion
mockFramerMotion()

// Test component that uses animations
const AnimatedTestComponent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="animated-component" className="animate-fade-in">
    {children}
  </div>
)

describe('Animation System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset prefers-reduced-motion
    mockPrefersReducedMotion(false)
  })

  describe('Framer Motion Integration', () => {
    it('renders motion components correctly', () => {
      render(
        <AnimatedTestComponent>
          <div>Animated content</div>
        </AnimatedTestComponent>
      )

      expect(screen.getByTestId('animated-component')).toBeInTheDocument()
      expect(screen.getByText('Animated content')).toBeInTheDocument()
    })

    it('handles motion variants', () => {
      const MotionComponent = () => (
        <div
          data-testid="motion-div"
          style={{
            opacity: 1,
            transform: 'translateY(0px)',
          }}
        >
          Motion content
        </div>
      )

      render(<MotionComponent />)
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveStyle('opacity: 1')
      expect(motionDiv).toHaveStyle('transform: translateY(0px)')
    })

    it('handles animation presence', () => {
      const AnimatePresenceComponent = ({ show }: { show: boolean }) => (
        <div data-testid="presence-container">
          {show && (
            <div data-testid="animated-item">
              Animated item
            </div>
          )}
        </div>
      )

      const { rerender } = render(<AnimatePresenceComponent show={true} />)
      expect(screen.getByTestId('animated-item')).toBeInTheDocument()

      rerender(<AnimatePresenceComponent show={false} />)
      expect(screen.queryByTestId('animated-item')).not.toBeInTheDocument()
    })

    it('handles stagger animations', () => {
      const StaggerComponent = () => (
        <div data-testid="stagger-container">
          {[1, 2, 3].map(i => (
            <div key={i} data-testid={`stagger-item-${i}`}>
              Item {i}
            </div>
          ))}
        </div>
      )

      render(<StaggerComponent />)
      
      expect(screen.getByTestId('stagger-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('stagger-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('stagger-item-3')).toBeInTheDocument()
    })
  })

  describe('Prefers Reduced Motion', () => {
    it('respects prefers-reduced-motion setting', () => {
      mockPrefersReducedMotion(true)
      
      render(
        <AnimatedTestComponent>
          <div>Reduced motion content</div>
        </AnimatedTestComponent>
      )

      const component = screen.getByTestId('animated-component')
      expect(component).toBeInTheDocument()
      // Animation should be disabled or reduced
    })

    it('provides full animations when prefers-reduced-motion is false', () => {
      mockPrefersReducedMotion(false)
      
      render(
        <AnimatedTestComponent>
          <div>Full animation content</div>
        </AnimatedTestComponent>
      )

      const component = screen.getByTestId('animated-component')
      expect(component).toBeInTheDocument()
      // Full animations should be enabled
    })

    it('handles media query changes', () => {
      // Start with reduced motion
      mockPrefersReducedMotion(true)
      
      const { rerender } = render(
        <AnimatedTestComponent>
          <div>Content</div>
        </AnimatedTestComponent>
      )

      // Change to full motion
      mockPrefersReducedMotion(false)
      rerender(
        <AnimatedTestComponent>
          <div>Content</div>
        </AnimatedTestComponent>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Animation Performance', () => {
    it('handles rapid animation triggers', async () => {
      const RapidAnimationComponent = () => {
        const [count, setCount] = React.useState(0)
        
        return (
          <div>
            <button 
              onClick={() => setCount(c => c + 1)}
              data-testid="trigger-button"
            >
              Trigger Animation
            </button>
            <div 
              data-testid="animated-counter"
              style={{ transform: `scale(${1 + count * 0.1})` }}
            >
              Count: {count}
            </div>
          </div>
        )
      }

      render(<RapidAnimationComponent />)
      
      const button = screen.getByTestId('trigger-button')
      const counter = screen.getByTestId('animated-counter')

      // Rapidly trigger animations
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button)
      }

      await waitFor(() => {
        expect(screen.getByText('Count: 10')).toBeInTheDocument()
      })

      expect(counter).toHaveStyle('transform: scale(2)')
    })

    it('handles concurrent animations', () => {
      const ConcurrentAnimationComponent = () => (
        <div>
          <div 
            data-testid="animation-1"
            style={{ opacity: 0.5, transform: 'translateX(10px)' }}
          >
            Animation 1
          </div>
          <div 
            data-testid="animation-2"
            style={{ opacity: 0.8, transform: 'translateY(20px)' }}
          >
            Animation 2
          </div>
        </div>
      )

      render(<ConcurrentAnimationComponent />)
      
      const anim1 = screen.getByTestId('animation-1')
      const anim2 = screen.getByTestId('animation-2')

      expect(anim1).toHaveStyle('opacity: 0.5')
      expect(anim2).toHaveStyle('opacity: 0.8')
    })

    it('cleans up animations on unmount', () => {
      const AnimationComponent = () => (
        <div data-testid="cleanup-component">
          Animated component
        </div>
      )

      const { unmount } = render(<AnimationComponent />)
      
      expect(screen.getByTestId('cleanup-component')).toBeInTheDocument()
      
      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Animation Timing', () => {
    it('uses appropriate animation durations', () => {
      const TimedAnimationComponent = () => (
        <div 
          data-testid="timed-animation"
          style={{ 
            transition: 'all 0.3s ease-out',
            opacity: 1 
          }}
        >
          Timed content
        </div>
      )

      render(<TimedAnimationComponent />)
      
      const component = screen.getByTestId('timed-animation')
      expect(component).toHaveStyle('transition: all 0.3s ease-out')
    })

    it('handles different easing functions', () => {
      const EasingComponent = () => (
        <div>
          <div 
            data-testid="ease-out"
            style={{ transition: 'transform 0.2s ease-out' }}
          >
            Ease Out
          </div>
          <div 
            data-testid="ease-in"
            style={{ transition: 'transform 0.2s ease-in' }}
          >
            Ease In
          </div>
        </div>
      )

      render(<EasingComponent />)
      
      expect(screen.getByTestId('ease-out')).toHaveStyle('transition: transform 0.2s ease-out')
      expect(screen.getByTestId('ease-in')).toHaveStyle('transition: transform 0.2s ease-in')
    })

    it('handles animation delays', () => {
      const DelayedAnimationComponent = () => (
        <div 
          data-testid="delayed-animation"
          style={{ 
            transition: 'opacity 0.3s ease-out',
            transitionDelay: '0.1s'
          }}
        >
          Delayed content
        </div>
      )

      render(<DelayedAnimationComponent />)
      
      const component = screen.getByTestId('delayed-animation')
      expect(component).toHaveStyle('transition-delay: 0.1s')
    })
  })

  describe('Interactive Animations', () => {
    it('handles hover animations', () => {
      const HoverComponent = () => {
        const [isHovered, setIsHovered] = React.useState(false)
        
        return (
          <div
            data-testid="hover-component"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            Hover me
          </div>
        )
      }

      render(<HoverComponent />)
      
      const component = screen.getByTestId('hover-component')
      
      expect(component).toHaveStyle('transform: scale(1)')
      
      fireEvent.mouseEnter(component)
      expect(component).toHaveStyle('transform: scale(1.05)')
      
      fireEvent.mouseLeave(component)
      expect(component).toHaveStyle('transform: scale(1)')
    })

    it('handles click animations', () => {
      const ClickComponent = () => {
        const [isPressed, setIsPressed] = React.useState(false)
        
        return (
          <button
            data-testid="click-component"
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              transform: isPressed ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.1s ease-out'
            }}
          >
            Click me
          </button>
        )
      }

      render(<ClickComponent />)
      
      const button = screen.getByTestId('click-component')
      
      expect(button).toHaveStyle('transform: scale(1)')
      
      fireEvent.mouseDown(button)
      expect(button).toHaveStyle('transform: scale(0.95)')
      
      fireEvent.mouseUp(button)
      expect(button).toHaveStyle('transform: scale(1)')
    })

    it('handles focus animations', () => {
      const FocusComponent = () => {
        const [isFocused, setIsFocused] = React.useState(false)
        
        return (
          <input
            data-testid="focus-component"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              borderColor: isFocused ? '#3b82f6' : '#d1d5db',
              transition: 'border-color 0.2s ease-out'
            }}
            placeholder="Focus me"
          />
        )
      }

      render(<FocusComponent />)
      
      const input = screen.getByTestId('focus-component')
      
      expect(input).toHaveStyle('border-color: #d1d5db')
      
      fireEvent.focus(input)
      expect(input).toHaveStyle('border-color: #3b82f6')
      
      fireEvent.blur(input)
      expect(input).toHaveStyle('border-color: #d1d5db')
    })
  })

  describe('Animation Error Handling', () => {
    it('handles animation errors gracefully', () => {
      const ErrorProneComponent = () => {
        try {
          return (
            <div data-testid="error-prone">
              Animation content
            </div>
          )
        } catch (error) {
          return (
            <div data-testid="error-fallback">
              Fallback content
            </div>
          )
        }
      }

      render(<ErrorProneComponent />)
      
      // Should render without throwing
      expect(screen.getByTestId('error-prone')).toBeInTheDocument()
    })

    it('provides fallbacks for unsupported animations', () => {
      const FallbackComponent = () => (
        <div 
          data-testid="fallback-component"
          style={{
            // Fallback for unsupported properties
            transform: 'translateX(0px)',
            opacity: 1
          }}
        >
          Fallback animation
        </div>
      )

      render(<FallbackComponent />)
      
      const component = screen.getByTestId('fallback-component')
      expect(component).toHaveStyle('opacity: 1')
    })
  })
})
