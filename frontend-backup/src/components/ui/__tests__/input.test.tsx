import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import { Input } from '../input'
import { runAxeTest } from '@/lib/test-utils'

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue('test value')
  })

  it('supports controlled input', () => {
    const { rerender } = render(<Input value="initial" onChange={() => {}} />)
    
    let input = screen.getByRole('textbox')
    expect(input).toHaveValue('initial')
    
    rerender(<Input value="updated" onChange={() => {}} />)
    input = screen.getByRole('textbox')
    expect(input).toHaveValue('updated')
  })

  it('supports uncontrolled input', () => {
    render(<Input defaultValue="default" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default')
    
    fireEvent.change(input, { target: { value: 'changed' } })
    expect(input).toHaveValue('changed')
  })

  it('applies different input types', () => {
    const { rerender } = render(<Input type="email" />)
    
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    input = screen.getByLabelText(/password/i) || screen.getByDisplayValue('')
    expect(input).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />)
    
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('handles readonly state', () => {
    render(<Input readOnly value="readonly value" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveValue('readonly value')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('supports all HTML input attributes', () => {
    render(
      <Input
        id="test-input"
        name="testName"
        placeholder="Test placeholder"
        maxLength={50}
        minLength={5}
        required
        aria-label="Test input"
        data-testid="test-input"
      />
    )
    
    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'testName')
    expect(input).toHaveAttribute('placeholder', 'Test placeholder')
    expect(input).toHaveAttribute('maxLength', '50')
    expect(input).toHaveAttribute('minLength', '5')
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('aria-label', 'Test input')
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')

    // Use direct focus() method to actually set focus
    input.focus()
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    expect(input).toHaveFocus()

    input.blur()
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
    expect(input).not.toHaveFocus()
  })

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn()
    const handleKeyUp = jest.fn()
    const handleKeyPress = jest.fn()
    
    render(
      <Input
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onKeyPress={handleKeyPress}
      />
    )
    
    const input = screen.getByRole('textbox')
    
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(handleKeyDown).toHaveBeenCalledTimes(1)
    
    fireEvent.keyUp(input, { key: 'Enter', code: 'Enter' })
    expect(handleKeyUp).toHaveBeenCalledTimes(1)
    
    fireEvent.keyPress(input, { key: 'a', code: 'KeyA' })
    expect(handleKeyPress).toHaveBeenCalledTimes(1)
  })

  it('supports form validation', () => {
    render(
      <form data-testid="test-form">
        <Input
          type="email"
          required
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Please enter a valid email address"
        />
        <button type="submit">Submit</button>
      </form>
    )
    
    const input = screen.getByRole('textbox')
    const form = screen.getByTestId('test-form')
    
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('pattern')
    expect(input).toHaveAttribute('title')
    
    // Test invalid input
    fireEvent.change(input, { target: { value: 'invalid-email' } })
    fireEvent.submit(form)
    
    expect(input).toBeInvalid()
  })

  it('handles number input with min/max', () => {
    render(
      <Input
        type="number"
        min={0}
        max={100}
        step={5}
        defaultValue={50}
      />
    )
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
    expect(input).toHaveAttribute('step', '5')
    expect(input).toHaveValue(50)
  })

  it('handles file input', () => {
    const handleChange = jest.fn()
    render(
      <Input
        type="file"
        accept=".jpg,.png,.pdf"
        multiple
        onChange={handleChange}
      />
    )
    
    const input = screen.getByRole('button', { name: /choose files/i }) || 
                  screen.getByLabelText(/file/i) ||
                  document.querySelector('input[type="file"]')
    
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', '.jpg,.png,.pdf')
    expect(input).toHaveAttribute('multiple')
  })

  it('supports search input with clear functionality', () => {
    render(<Input type="search" defaultValue="search term" />)
    
    const input = screen.getByRole('searchbox')
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveValue('search term')
  })

  it('handles date and time inputs', () => {
    const { rerender } = render(<Input type="date" />)
    
    let input = screen.getByDisplayValue('') || document.querySelector('input[type="date"]')
    expect(input).toHaveAttribute('type', 'date')
    
    rerender(<Input type="time" />)
    input = screen.getByDisplayValue('') || document.querySelector('input[type="time"]')
    expect(input).toHaveAttribute('type', 'time')
    
    rerender(<Input type="datetime-local" />)
    input = screen.getByDisplayValue('') || document.querySelector('input[type="datetime-local"]')
    expect(input).toHaveAttribute('type', 'datetime-local')
  })

  it('maintains accessibility standards', async () => {
    const { container } = render(
      <div>
        <label htmlFor="accessible-input">Email Address</label>
        <Input
          id="accessible-input"
          type="email"
          required
          aria-describedby="email-help"
        />
        <div id="email-help">Enter your email address</div>
      </div>
    )
    
    const input = screen.getByLabelText('Email Address')
    expect(input).toHaveAttribute('aria-describedby', 'email-help')
    
    // Run accessibility tests
    await runAxeTest(container)
  })

  it('handles input with error state', () => {
    render(
      <Input
        aria-invalid="true"
        aria-describedby="error-message"
        className="border-red-500"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'error-message')
    expect(input).toHaveClass('border-red-500')
  })

  it('supports input groups and addons', () => {
    render(
      <div className="flex">
        <span className="input-addon">$</span>
        <Input type="number" placeholder="0.00" className="rounded-l-none" />
        <span className="input-addon">.00</span>
      </div>
    )
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveClass('rounded-l-none')
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('.00')).toBeInTheDocument()
  })
})
