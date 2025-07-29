import React from 'react'
import { render, screen } from '@/lib/test-utils'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly', () => {
      render(
        <Card data-testid="card">
          <div>Card content</div>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })

    it('applies custom className', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Card ref={ref}>
          Content
        </Card>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('accepts additional props', () => {
      render(
        <Card data-testid="card" role="region" aria-label="Test card">
          Content
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('role', 'region')
      expect(card).toHaveAttribute('aria-label', 'Test card')
    })
  })

  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(
        <CardHeader data-testid="card-header">
          <div>Header content</div>
        </CardHeader>
      )
      
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('applies custom className', () => {
      render(
        <CardHeader className="custom-header" data-testid="card-header">
          Header
        </CardHeader>
      )
      
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('custom-header')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <CardHeader ref={ref}>
          Header
        </CardHeader>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardTitle', () => {
    it('renders correctly', () => {
      render(
        <CardTitle data-testid="card-title">
          Card Title
        </CardTitle>
      )
      
      const title = screen.getByTestId('card-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
      expect(title).toHaveTextContent('Card Title')
    })

    it('applies custom className', () => {
      render(
        <CardTitle className="custom-title" data-testid="card-title">
          Title
        </CardTitle>
      )
      
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('custom-title')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(
        <CardTitle ref={ref}>
          Title
        </CardTitle>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
    })

    it('renders as different HTML elements', () => {
      render(
        <CardTitle as="h1" data-testid="card-title">
          Title as H1
        </CardTitle>
      )
      
      const title = screen.getByTestId('card-title')
      expect(title.tagName).toBe('H1')
    })
  })

  describe('CardDescription', () => {
    it('renders correctly', () => {
      render(
        <CardDescription data-testid="card-description">
          This is a card description
        </CardDescription>
      )
      
      const description = screen.getByTestId('card-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
      expect(description).toHaveTextContent('This is a card description')
    })

    it('applies custom className', () => {
      render(
        <CardDescription className="custom-description" data-testid="card-description">
          Description
        </CardDescription>
      )
      
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('custom-description')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(
        <CardDescription ref={ref}>
          Description
        </CardDescription>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
    })
  })

  describe('CardContent', () => {
    it('renders correctly', () => {
      render(
        <CardContent data-testid="card-content">
          <p>Card content goes here</p>
        </CardContent>
      )
      
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <CardContent className="custom-content" data-testid="card-content">
          Content
        </CardContent>
      )
      
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('custom-content')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <CardContent ref={ref}>
          Content
        </CardContent>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardFooter', () => {
    it('renders correctly', () => {
      render(
        <CardFooter data-testid="card-footer">
          <button>Action</button>
        </CardFooter>
      )
      
      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <CardFooter className="custom-footer" data-testid="card-footer">
          Footer
        </CardFooter>
      )
      
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <CardFooter ref={ref}>
          Footer
        </CardFooter>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Complete Card', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>UAV Status</CardTitle>
            <CardDescription>Current status of UAV-001</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Status: Active</p>
            <p>Battery: 85%</p>
          </CardContent>
          <CardFooter>
            <button>View Details</button>
            <button>Edit</button>
          </CardFooter>
        </Card>
      )
      
      const card = screen.getByTestId('complete-card')
      expect(card).toBeInTheDocument()
      
      expect(screen.getByText('UAV Status')).toBeInTheDocument()
      expect(screen.getByText('Current status of UAV-001')).toBeInTheDocument()
      expect(screen.getByText('Status: Active')).toBeInTheDocument()
      expect(screen.getByText('Battery: 85%')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    it('maintains proper semantic structure', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Article Title</CardTitle>
            <CardDescription>Article description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Article content</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
      
      const title = screen.getByText('Article Title')
      expect(title).toHaveAttribute('id', 'card-title')
    })

    it('handles interactive cards', () => {
      const handleClick = jest.fn()
      
      render(
        <Card 
          onClick={handleClick} 
          className="cursor-pointer hover:bg-accent"
          data-testid="interactive-card"
        >
          <CardContent>
            <p>Click me</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByTestId('interactive-card')
      expect(card).toHaveClass('cursor-pointer')
      
      card.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports keyboard navigation for interactive cards', () => {
      const handleKeyDown = jest.fn()
      
      render(
        <Card 
          tabIndex={0}
          onKeyDown={handleKeyDown}
          data-testid="keyboard-card"
        >
          <CardContent>
            <p>Keyboard accessible</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByTestId('keyboard-card')
      expect(card).toHaveAttribute('tabIndex', '0')
      
      card.focus()
      expect(card).toHaveFocus()
    })
  })
})
