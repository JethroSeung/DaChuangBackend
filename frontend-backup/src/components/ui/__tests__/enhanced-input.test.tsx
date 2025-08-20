import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { EnhancedInput, EnhancedTextarea } from '../enhanced-input'
import { runAxeTest } from '@/lib/test-utils'

describe('EnhancedInput', () => {
  describe('Basic Functionality', () => {
    it('renders with label and input', () => {
      render(
        <EnhancedInput
          label="Test Input"
          placeholder="Enter text"
          data-testid="test-input"
        />
      )

      expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('shows required indicator when required', () => {
      render(
        <EnhancedInput
          label="Required Field"
          required
        />
      )

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('handles value changes', async () => {
      const handleChange = jest.fn()
      render(
        <EnhancedInput
          label="Test Input"
          onChange={handleChange}
        />
      )

      const input = screen.getByLabelText('Test Input')
      fireEvent.change(input, { target: { value: 'test value' } })

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'test value'
          })
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('displays error message with proper styling', () => {
      render(
        <EnhancedInput
          label="Test Input"
          error="This field is required"
        />
      )

      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('This field is required')
      expect(errorMessage).toHaveClass('text-destructive')
    })

    it('sets aria-invalid when error is present', () => {
      render(
        <EnhancedInput
          label="Test Input"
          error="Invalid input"
        />
      )

      const input = screen.getByLabelText('Test Input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('associates error message with input via aria-describedby', () => {
      render(
        <EnhancedInput
          label="Test Input"
          error="Error message"
        />
      )

      const input = screen.getByLabelText('Test Input')
      const errorMessage = screen.getByRole('alert')
      
      expect(input).toHaveAttribute('aria-describedby')
      expect(input.getAttribute('aria-describedby')).toContain(errorMessage.id)
    })
  })

  describe('Success State', () => {
    it('displays success message and icon', () => {
      render(
        <EnhancedInput
          label="Test Input"
          success="Input is valid"
        />
      )

      expect(screen.getByRole('status')).toHaveTextContent('Input is valid')
      expect(screen.getByRole('status')).toHaveClass('text-green-600')
    })

    it('shows success icon in input', () => {
      render(
        <EnhancedInput
          label="Test Input"
          success="Valid"
        />
      )

      // Check for CheckCircle2 icon
      expect(screen.getByRole('textbox').parentElement).toContainHTML('CheckCircle2')
    })
  })

  describe('Helper Text', () => {
    it('displays helper text when provided', () => {
      render(
        <EnhancedInput
          label="Test Input"
          helperText="This is helpful information"
        />
      )

      expect(screen.getByText('This is helpful information')).toBeInTheDocument()
    })

    it('associates helper text with input', () => {
      render(
        <EnhancedInput
          label="Test Input"
          helperText="Helper text"
        />
      )

      const input = screen.getByLabelText('Test Input')
      const helperText = screen.getByText('Helper text')
      
      expect(input).toHaveAttribute('aria-describedby')
      expect(input.getAttribute('aria-describedby')).toContain(helperText.id)
    })
  })

  describe('Password Toggle', () => {
    it('shows password toggle button for password type', () => {
      render(
        <EnhancedInput
          label="Password"
          type="password"
          showPasswordToggle
        />
      )

      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
    })

    it('toggles password visibility', async () => {
      render(
        <EnhancedInput
          label="Password"
          type="password"
          showPasswordToggle
        />
      )

      const input = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', { name: /show password/i })

      expect(input).toHaveAttribute('type', 'password')

      fireEvent.click(toggleButton)

      expect(input).toHaveAttribute('type', 'text')
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(
        <EnhancedInput
          label="Test Input"
          loading
        />
      )

      expect(screen.getByRole('textbox').parentElement).toContainHTML('animate-spin')
    })

    it('hides other icons when loading', () => {
      render(
        <EnhancedInput
          label="Test Input"
          loading
          error="Error"
          success="Success"
        />
      )

      // Should only show loading spinner, not error or success icons
      const container = screen.getByRole('textbox').parentElement
      expect(container).toContainHTML('animate-spin')
      expect(container).not.toContainHTML('AlertCircle')
      expect(container).not.toContainHTML('CheckCircle2')
    })
  })

  describe('Focus Management', () => {
    it('applies focus styles when focused', async () => {
      render(
        <EnhancedInput
          label="Test Input"
        />
      )

      const input = screen.getByLabelText('Test Input')
      
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(input).toHaveClass('ring-2', 'ring-ring', 'ring-offset-2')
      })
    })

    it('removes focus styles when blurred', async () => {
      render(
        <EnhancedInput
          label="Test Input"
        />
      )

      const input = screen.getByLabelText('Test Input')
      
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      await waitFor(() => {
        expect(input).not.toHaveClass('ring-2')
      })
    })
  })

  describe('Icons', () => {
    it('displays left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">L</span>
      
      render(
        <EnhancedInput
          label="Test Input"
          leftIcon={<LeftIcon />}
        />
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('displays right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">R</span>
      
      render(
        <EnhancedInput
          label="Test Input"
          rightIcon={<RightIcon />}
        />
      )

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('adjusts padding for icons', () => {
      const LeftIcon = () => <span>L</span>
      const RightIcon = () => <span>R</span>
      
      render(
        <EnhancedInput
          label="Test Input"
          leftIcon={<LeftIcon />}
          rightIcon={<RightIcon />}
        />
      )

      const input = screen.getByLabelText('Test Input')
      expect(input).toHaveClass('pl-10', 'pr-10')
    })
  })

  describe('Accessibility', () => {
    it('passes accessibility tests', async () => {
      const { container } = render(
        <EnhancedInput
          label="Accessible Input"
          helperText="This is helpful"
          required
        />
      )

      await runAxeTest(container)
    })

    it('passes accessibility tests with error', async () => {
      const { container } = render(
        <EnhancedInput
          label="Input with Error"
          error="This field is required"
          required
        />
      )

      await runAxeTest(container)
    })

    it('has proper ARIA attributes', () => {
      render(
        <EnhancedInput
          label="Test Input"
          error="Error message"
          helperText="Helper text"
          required
        />
      )

      const input = screen.getByLabelText('Test Input')
      
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })
})

describe('EnhancedTextarea', () => {
  describe('Basic Functionality', () => {
    it('renders textarea with label', () => {
      render(
        <EnhancedTextarea
          label="Test Textarea"
          placeholder="Enter text"
        />
      )

      expect(screen.getByLabelText('Test Textarea')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('handles resize prop', () => {
      render(
        <EnhancedTextarea
          label="No Resize"
          resize={false}
        />
      )

      const textarea = screen.getByLabelText('No Resize')
      expect(textarea).toHaveClass('resize-none')
    })
  })

  describe('Error and Success States', () => {
    it('displays error message', () => {
      render(
        <EnhancedTextarea
          label="Test Textarea"
          error="This field is required"
        />
      )

      expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
    })

    it('displays success message', () => {
      render(
        <EnhancedTextarea
          label="Test Textarea"
          success="Input is valid"
        />
      )

      expect(screen.getByRole('status')).toHaveTextContent('Input is valid')
    })
  })

  describe('Accessibility', () => {
    it('passes accessibility tests', async () => {
      const { container } = render(
        <EnhancedTextarea
          label="Accessible Textarea"
          helperText="This is helpful"
          required
        />
      )

      await runAxeTest(container)
    })
  })
})
