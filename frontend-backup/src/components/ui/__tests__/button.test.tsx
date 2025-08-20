import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('bg-destructive')
    
    rerender(<Button variant="outline">Outline</Button>)
    expect(button).toHaveClass('border')
  })

  it('applies size styles correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('h-9')
    
    rerender(<Button size="lg">Large</Button>)
    expect(button).toHaveClass('h-11')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Button with ref</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('custom-class')
  })

  it('supports UAV-specific variant', () => {
    render(<Button variant="uav">UAV Button</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('bg-uav-primary')
  })

  it('supports success, warning, and danger variants', () => {
    const { rerender } = render(<Button variant="success">Success</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-green-600')
    
    rerender(<Button variant="warning">Warning</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-yellow-600')
    
    rerender(<Button variant="danger">Danger</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')
  })
})
