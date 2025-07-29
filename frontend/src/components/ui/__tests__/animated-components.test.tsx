import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import {
  AnimatedPage,
  AnimatedCard,
  StaggerContainer,
  StaggerItem,
  AnimatedModal,
  AnimatedSpinner,
  ScaleOnHover,
  Pulse,
  Bounce,
  Shake,
  Float,
  Glow,
  Magnetic,
  Fade,
  SlideIn,
  ZoomIn,
} from '../animated-components'
import { mockFramerMotion, mockPrefersReducedMotion } from '@/lib/test-utils'

// Mock framer-motion for testing
mockFramerMotion()

describe('Animated Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AnimatedPage', () => {
    it('renders correctly', () => {
      render(
        <AnimatedPage>
          <div>Page content</div>
        </AnimatedPage>
      )
      
      expect(screen.getByText('Page content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <AnimatedPage className="custom-page" data-testid="animated-page">
          <div>Content</div>
        </AnimatedPage>
      )
      
      const page = screen.getByTestId('animated-page')
      expect(page).toHaveClass('custom-page')
    })

    it('respects prefers-reduced-motion', () => {
      mockPrefersReducedMotion(true)
      
      render(
        <AnimatedPage data-testid="reduced-motion-page">
          <div>Content</div>
        </AnimatedPage>
      )
      
      const page = screen.getByTestId('reduced-motion-page')
      expect(page).toBeInTheDocument()
    })
  })

  describe('AnimatedCard', () => {
    it('renders correctly', () => {
      render(
        <AnimatedCard>
          <div>Card content</div>
        </AnimatedCard>
      )
      
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('handles hover interactions', () => {
      render(
        <AnimatedCard data-testid="animated-card">
          <div>Hover me</div>
        </AnimatedCard>
      )
      
      const card = screen.getByTestId('animated-card')
      fireEvent.mouseEnter(card)
      fireEvent.mouseLeave(card)
      
      expect(card).toBeInTheDocument()
    })

    it('handles click interactions', () => {
      const handleClick = jest.fn()
      
      render(
        <AnimatedCard onClick={handleClick} data-testid="clickable-card">
          <div>Click me</div>
        </AnimatedCard>
      )
      
      const card = screen.getByTestId('clickable-card')
      fireEvent.click(card)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('StaggerContainer and StaggerItem', () => {
    it('renders stagger container with items', () => {
      render(
        <StaggerContainer>
          <StaggerItem>
            <div>Item 1</div>
          </StaggerItem>
          <StaggerItem>
            <div>Item 2</div>
          </StaggerItem>
          <StaggerItem>
            <div>Item 3</div>
          </StaggerItem>
        </StaggerContainer>
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('applies custom stagger delay', () => {
      render(
        <StaggerContainer staggerDelay={0.2}>
          <StaggerItem>
            <div>Delayed item</div>
          </StaggerItem>
        </StaggerContainer>
      )
      
      expect(screen.getByText('Delayed item')).toBeInTheDocument()
    })
  })

  describe('AnimatedModal', () => {
    it('renders when open', () => {
      render(
        <AnimatedModal isOpen={true} onClose={() => {}}>
          <div>Modal content</div>
        </AnimatedModal>
      )
      
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <AnimatedModal isOpen={false} onClose={() => {}}>
          <div>Modal content</div>
        </AnimatedModal>
      )
      
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('calls onClose when backdrop is clicked', () => {
      const handleClose = jest.fn()
      
      render(
        <AnimatedModal isOpen={true} onClose={handleClose}>
          <div>Modal content</div>
        </AnimatedModal>
      )
      
      const backdrop = screen.getByTestId('modal-backdrop')
      fireEvent.click(backdrop)
      
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('handles escape key press', () => {
      const handleClose = jest.fn()
      
      render(
        <AnimatedModal isOpen={true} onClose={handleClose}>
          <div>Modal content</div>
        </AnimatedModal>
      )
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('prevents closing when closeOnBackdropClick is false', () => {
      const handleClose = jest.fn()
      
      render(
        <AnimatedModal 
          isOpen={true} 
          onClose={handleClose}
          closeOnBackdropClick={false}
        >
          <div>Modal content</div>
        </AnimatedModal>
      )
      
      const backdrop = screen.getByTestId('modal-backdrop')
      fireEvent.click(backdrop)
      
      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('AnimatedSpinner', () => {
    it('renders correctly', () => {
      render(<AnimatedSpinner data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('applies different sizes', () => {
      const { rerender } = render(<AnimatedSpinner size="sm" data-testid="spinner" />)
      
      let spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('h-4', 'w-4')
      
      rerender(<AnimatedSpinner size="lg" data-testid="spinner" />)
      spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('h-8', 'w-8')
    })

    it('applies custom color', () => {
      render(<AnimatedSpinner color="red" data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('text-red-500')
    })
  })

  describe('ScaleOnHover', () => {
    it('renders correctly', () => {
      render(
        <ScaleOnHover>
          <div>Hover to scale</div>
        </ScaleOnHover>
      )
      
      expect(screen.getByText('Hover to scale')).toBeInTheDocument()
    })

    it('handles hover interactions', () => {
      render(
        <ScaleOnHover data-testid="scale-element">
          <div>Scale me</div>
        </ScaleOnHover>
      )
      
      const element = screen.getByTestId('scale-element')
      fireEvent.mouseEnter(element)
      fireEvent.mouseLeave(element)
      
      expect(element).toBeInTheDocument()
    })

    it('applies custom scale factor', () => {
      render(
        <ScaleOnHover scale={1.2} data-testid="custom-scale">
          <div>Custom scale</div>
        </ScaleOnHover>
      )
      
      const element = screen.getByTestId('custom-scale')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Pulse', () => {
    it('renders correctly', () => {
      render(
        <Pulse>
          <div>Pulsing element</div>
        </Pulse>
      )
      
      expect(screen.getByText('Pulsing element')).toBeInTheDocument()
    })

    it('applies custom duration', () => {
      render(
        <Pulse duration={2} data-testid="pulse-element">
          <div>Custom pulse</div>
        </Pulse>
      )
      
      const element = screen.getByTestId('pulse-element')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Bounce', () => {
    it('renders correctly', () => {
      render(
        <Bounce>
          <div>Bouncing element</div>
        </Bounce>
      )
      
      expect(screen.getByText('Bouncing element')).toBeInTheDocument()
    })

    it('applies custom height', () => {
      render(
        <Bounce height={20} data-testid="bounce-element">
          <div>Custom bounce</div>
        </Bounce>
      )
      
      const element = screen.getByTestId('bounce-element')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Shake', () => {
    it('renders correctly', () => {
      render(
        <Shake>
          <div>Shaking element</div>
        </Shake>
      )
      
      expect(screen.getByText('Shaking element')).toBeInTheDocument()
    })

    it('triggers shake animation', () => {
      render(
        <Shake trigger={true} data-testid="shake-element">
          <div>Shake me</div>
        </Shake>
      )
      
      const element = screen.getByTestId('shake-element')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Float', () => {
    it('renders correctly', () => {
      render(
        <Float>
          <div>Floating element</div>
        </Float>
      )
      
      expect(screen.getByText('Floating element')).toBeInTheDocument()
    })

    it('applies custom float distance', () => {
      render(
        <Float distance={15} data-testid="float-element">
          <div>Custom float</div>
        </Float>
      )
      
      const element = screen.getByTestId('float-element')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Glow', () => {
    it('renders correctly', () => {
      render(
        <Glow>
          <div>Glowing element</div>
        </Glow>
      )
      
      expect(screen.getByText('Glowing element')).toBeInTheDocument()
    })

    it('applies custom glow color', () => {
      render(
        <Glow color="blue" data-testid="glow-element">
          <div>Blue glow</div>
        </Glow>
      )
      
      const element = screen.getByTestId('glow-element')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Magnetic', () => {
    it('renders correctly', () => {
      render(
        <Magnetic>
          <div>Magnetic element</div>
        </Magnetic>
      )
      
      expect(screen.getByText('Magnetic element')).toBeInTheDocument()
    })

    it('handles mouse movement', () => {
      render(
        <Magnetic data-testid="magnetic-element">
          <div>Follow cursor</div>
        </Magnetic>
      )
      
      const element = screen.getByTestId('magnetic-element')
      fireEvent.mouseMove(element, { clientX: 100, clientY: 100 })
      fireEvent.mouseLeave(element)
      
      expect(element).toBeInTheDocument()
    })
  })

  describe('Fade', () => {
    it('renders when show is true', () => {
      render(
        <Fade show={true}>
          <div>Fading content</div>
        </Fade>
      )
      
      expect(screen.getByText('Fading content')).toBeInTheDocument()
    })

    it('does not render when show is false', () => {
      render(
        <Fade show={false}>
          <div>Hidden content</div>
        </Fade>
      )
      
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
    })
  })

  describe('SlideIn', () => {
    it('renders correctly', () => {
      render(
        <SlideIn direction="left">
          <div>Sliding content</div>
        </SlideIn>
      )
      
      expect(screen.getByText('Sliding content')).toBeInTheDocument()
    })

    it('supports different directions', () => {
      const directions = ['left', 'right', 'up', 'down'] as const
      
      directions.forEach(direction => {
        const { unmount } = render(
          <SlideIn direction={direction} data-testid={`slide-${direction}`}>
            <div>Slide {direction}</div>
          </SlideIn>
        )
        
        expect(screen.getByText(`Slide ${direction}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('ZoomIn', () => {
    it('renders correctly', () => {
      render(
        <ZoomIn>
          <div>Zooming content</div>
        </ZoomIn>
      )
      
      expect(screen.getByText('Zooming content')).toBeInTheDocument()
    })

    it('applies custom scale', () => {
      render(
        <ZoomIn scale={0.5} data-testid="zoom-element">
          <div>Custom zoom</div>
        </ZoomIn>
      )
      
      const element = screen.getByTestId('zoom-element')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('respects prefers-reduced-motion for all components', () => {
      mockPrefersReducedMotion(true)
      
      const components = [
        <AnimatedPage key="page"><div>Page</div></AnimatedPage>,
        <AnimatedCard key="card"><div>Card</div></AnimatedCard>,
        <Pulse key="pulse"><div>Pulse</div></Pulse>,
        <Bounce key="bounce"><div>Bounce</div></Bounce>,
        <Float key="float"><div>Float</div></Float>,
      ]
      
      components.forEach(component => {
        const { unmount } = render(component)
        expect(screen.getByText(component.props.children.props.children)).toBeInTheDocument()
        unmount()
      })
    })

    it('maintains focus management in modals', () => {
      render(
        <AnimatedModal isOpen={true} onClose={() => {}}>
          <div>
            <button>First button</button>
            <button>Second button</button>
          </div>
        </AnimatedModal>
      )
      
      const firstButton = screen.getByText('First button')
      const secondButton = screen.getByText('Second button')
      
      expect(firstButton).toBeInTheDocument()
      expect(secondButton).toBeInTheDocument()
    })
  })
})
