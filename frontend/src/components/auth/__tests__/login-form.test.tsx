import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { LoginForm } from '../login-form'
import { useAuthStore } from '@/stores/auth-store'
import { createMockUser, runAxeTest } from '@/lib/test-utils'
import { useRouter } from 'next/navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the auth store
jest.mock('@/stores/auth-store')
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('LoginForm Component', () => {
  const mockPush = jest.fn()
  const mockLogin = jest.fn()
  const mockClearError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock router
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    })

    // Mock auth store
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      logout: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      changePassword: jest.fn(),
      updateProfile: jest.fn(),
      hasPermission: jest.fn(),
      hasRole: jest.fn(),
      canAccess: jest.fn(),
      checkSession: jest.fn(),
      setLoading: jest.fn(),
      fetchUserProfile: jest.fn(),
      updateLastActivity: jest.fn(),
    })
  })

  it('renders correctly', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('UAV Control System')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the UAV management dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles form submission with valid data', async () => {
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled()
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        rememberMe: false,
      })
    })
  })

  it('redirects to dashboard on successful login', async () => {
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('calls onSuccess callback when provided', async () => {
    const mockOnSuccess = jest.fn()
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('redirects to custom path when provided', async () => {
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm redirectTo="/custom-path" />)
    
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-path')
    })
  })

  it('handles remember me checkbox', async () => {
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(rememberMeCheckbox)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        rememberMe: true,
      })
    })
  })

  it('toggles password visibility', () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByRole('button', { name: /show password/i })

    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('displays loading state during login', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      isLoading: true,
    })
    
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays error message when login fails', () => {
    const errorMessage = 'Invalid credentials'
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      error: errorMessage,
    })
    
    render(<LoginForm />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
    
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('validates required username', async () => {
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Submit without entering username
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument()
    })
  })

  it('validates required password', async () => {
    render(<LoginForm />)

    const usernameInput = screen.getByLabelText('Username')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Enter username but not password
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('displays error messages', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      error: 'Invalid credentials',
    })

    render(<LoginForm />)

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(<LoginForm />)

    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Test that elements can receive focus
    usernameInput.focus()
    expect(usernameInput).toHaveFocus()

    passwordInput.focus()
    expect(passwordInput).toHaveFocus()

    submitButton.focus()
    expect(submitButton).toHaveFocus()
  })

  it('handles form submission', async () => {
    mockLogin.mockResolvedValue(true)

    render(<LoginForm />)

    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const form = document.querySelector('form')

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submit the form directly
    if (form) {
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    }
  })

  it('maintains accessibility standards', async () => {
    const { container } = render(<LoginForm />)
    
    // Check for proper labeling
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    
    // Check for form structure
    expect(container.querySelector('form')).toBeInTheDocument()
    
    // Run accessibility tests
    await runAxeTest(container)
  })

  it('has proper input types', () => {
    render(<LoginForm />)

    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')

    expect(usernameInput).toHaveAttribute('type', 'text')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables submit button during loading', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      isLoading: true,
    })

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
  })

  it('handles network errors gracefully', async () => {
    mockLogin.mockResolvedValue(false)
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      error: 'Network error',
    })
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
