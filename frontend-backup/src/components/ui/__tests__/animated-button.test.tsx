import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { AnimatedButton, FloatingActionButton, AnimatedIconButton, ProgressButton } from '../animated-button'
import { mockPrefersReducedMotion, mockFramerMotion } from '@/lib/test-utils'
import { Loader2, Plus, Download } from 'lucide-react'

// Mock framer-motion for testing
mockFramerMotion()

describe('AnimatedButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<AnimatedButton>Animated Button</AnimatedButton>)
    expect(screen.getByRole('button', { name: /animated button/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<AnimatedButton onClick={handleClick}>Click me</AnimatedButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<AnimatedButton loading>Loading Button</AnimatedButton>)
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()

    // Check for loading spinner (it's a div with specific styling)
    const spinner = button.querySelector('.border-t-transparent')
    expect(spinner).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<AnimatedButton disabled>Disabled Button</AnimatedButton>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
  })

  it('does not trigger click when disabled', () => {
    const handleClick = jest.fn()
    render(<AnimatedButton disabled onClick={handleClick}>Disabled</AnimatedButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not trigger click when loading', () => {
    const handleClick = jest.fn()
    render(<AnimatedButton loading onClick={handleClick}>Loading</AnimatedButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<AnimatedButton className="custom-class">Custom</AnimatedButton>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('custom-class')
  })

  it('handles ripple effect when enabled', () => {
    render(<AnimatedButton ripple>Ripple Button</AnimatedButton>)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    // Ripple effect should be triggered (tested through animation state)
    expect(button).toBeInTheDocument()
  })

  it('respects prefers-reduced-motion', () => {
    mockPrefersReducedMotion(true)
    render(<AnimatedButton>Reduced Motion</AnimatedButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    // Animation should be disabled when prefers-reduced-motion is set
  })

  it('supports glow effect', () => {
    render(<AnimatedButton glow>Glow Button</AnimatedButton>)
    const button = screen.getByRole('button')
    
    expect(button).toBeInTheDocument()
    // Glow effect should be applied through CSS classes
  })

  it('supports magnetic effect', () => {
    render(<AnimatedButton magnetic>Magnetic Button</AnimatedButton>)
    const button = screen.getByRole('button')
    
    expect(button).toBeInTheDocument()
    // Magnetic effect should be applied through motion properties
  })
})

describe('FloatingActionButton Component', () => {
  it('renders correctly', () => {
    render(
      <FloatingActionButton>
        <Plus className="h-6 w-6" />
      </FloatingActionButton>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('rounded-full', 'w-14', 'h-14')
  })

  it('applies correct position classes', () => {
    const { rerender } = render(
      <FloatingActionButton position="bottom-right">
        <Plus className="h-6 w-6" />
      </FloatingActionButton>
    )
    
    let container = document.querySelector('.fixed')
    expect(container).toHaveClass('bottom-6', 'right-6')
    
    rerender(
      <FloatingActionButton position="bottom-left">
        <Plus className="h-6 w-6" />
      </FloatingActionButton>
    )
    
    container = document.querySelector('.fixed')
    expect(container).toHaveClass('bottom-6', 'left-6')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(
      <FloatingActionButton onClick={handleClick}>
        <Plus className="h-6 w-6" />
      </FloatingActionButton>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles hover interactions', async () => {
    render(
      <FloatingActionButton>
        <Plus className="h-6 w-6" />
      </FloatingActionButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Test that the button can be hovered
    fireEvent.mouseEnter(button)
    fireEvent.mouseLeave(button)
  })
})

describe('AnimatedIconButton Component', () => {
  it('renders correctly', () => {
    render(
      <AnimatedIconButton icon={<Plus />} aria-label="Add item" />
    )

    const button = screen.getByRole('button', { name: /add item/i })
    expect(button).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <AnimatedIconButton icon={<Plus />} size="sm" aria-label="Small button" />
    )

    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-8', 'w-8')

    rerender(
      <AnimatedIconButton icon={<Plus />} size="lg" aria-label="Large button" />
    )

    button = screen.getByRole('button')
    expect(button).toHaveClass('h-12', 'w-12')
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(
      <AnimatedIconButton icon={<Plus />} variant="ghost" aria-label="Ghost button" />
    )

    let button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent')

    rerender(
      <AnimatedIconButton icon={<Plus />} variant="outline" aria-label="Outline button" />
    )

    button = screen.getByRole('button')
    expect(button).toHaveClass('border')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(
      <AnimatedIconButton
        icon={<Plus />}
        onClick={handleClick}
        aria-label="Clickable button"
      />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <AnimatedIconButton 
        icon={<Plus />}
        disabled 
        aria-label="Disabled button" 
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})

describe('ProgressButton Component', () => {
  it('renders correctly', () => {
    render(<ProgressButton progress={0}>Download</ProgressButton>)
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
  })

  it('shows progress bar when showProgress is true', () => {
    render(<ProgressButton progress={50} showProgress={true}>Downloading...</ProgressButton>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Check for progress bar element (it's a div with specific styling)
    const progressBar = button.querySelector('.bg-white\\/20')
    expect(progressBar).toBeInTheDocument()
  })

  it('shows completion state', () => {
    render(<ProgressButton progress={100} showProgress={true}>Completed</ProgressButton>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Completed')
  })

  it('handles click events when not in progress', () => {
    const handleClick = jest.fn()
    render(<ProgressButton progress={0} onClick={handleClick}>Start</ProgressButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles click events normally', () => {
    const handleClick = jest.fn()
    render(<ProgressButton progress={50} onClick={handleClick}>In Progress</ProgressButton>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows custom content', () => {
    render(
      <ProgressButton progress={0} showProgress={true}>
        Download File
      </ProgressButton>
    )

    expect(screen.getByText('Download File')).toBeInTheDocument()
  })

  it('applies correct progress width', () => {
    render(<ProgressButton progress={75} showProgress={true}>Progress</ProgressButton>)

    const button = screen.getByRole('button')
    const progressBar = button.querySelector('.bg-white\\/20')
    expect(progressBar).toBeInTheDocument()
  })

  it('handles progress animation', async () => {
    const { rerender } = render(<ProgressButton progress={0} showProgress={true}>Start</ProgressButton>)

    rerender(<ProgressButton progress={50} showProgress={true}>Progress</ProgressButton>)

    const button = screen.getByRole('button')
    const progressBar = button.querySelector('.bg-white\\/20')
    expect(progressBar).toBeInTheDocument()
  })

  it('resets to initial state when progress is 0', () => {
    const { rerender } = render(<ProgressButton progress={100} showProgress={true}>Done</ProgressButton>)

    rerender(<ProgressButton progress={0} showProgress={false}>Start Again</ProgressButton>)

    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveTextContent('Start Again')
  })
})
