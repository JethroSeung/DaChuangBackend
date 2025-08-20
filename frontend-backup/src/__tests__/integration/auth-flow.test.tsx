import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/api/auth-api'
import { createMockUser } from '@/lib/test-utils'
import { useRouter } from 'next/navigation'

// Mock the API
jest.mock('@/api/auth-api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Integration test component that uses auth flow
const AuthFlowTestComponent = () => {
  const { user, login, logout, isLoading, error } = useAuthStore()
  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login({
      username: formData.username,
      password: formData.password,
      rememberMe: false,
    })
  }

  const handleLogout = async () => {
    await logout()
  }

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.firstName}!</h1>
        <p>Email: {user.email}</p>
        <p>Role: {user.roles?.[0]?.name}</p>
        <button onClick={handleLogout} disabled={isLoading}>
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      {error && <div role="alert">{error}</div>}
      
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

describe('Authentication Flow Integration Tests', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset auth store
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })

    // Mock router
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('completes successful login flow', async () => {
    const mockUser = createMockUser({
      firstName: 'John',
      email: 'john@example.com',
      roles: [{ id: 1, name: 'ADMIN', description: 'Administrator', permissions: [] }],
    })

    const mockResponse = {
      user: mockUser,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    }

    mockedAuthApi.login.mockResolvedValue(mockResponse)

    render(<AuthFlowTestComponent />)

    // Initially shows login form
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()

    // Fill in form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    // Should show loading state
    expect(screen.getByText('Logging in...')).toBeInTheDocument()

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByText('Welcome, John!')).toBeInTheDocument()
    })

    // Should show user info
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Role: ADMIN')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()

    // Verify API was called correctly
    expect(mockedAuthApi.login).toHaveBeenCalledWith({
      username: 'john@example.com',
      password: 'password123',
      rememberMe: false,
    })
  })

  it('handles login failure', async () => {
    mockedAuthApi.login.mockRejectedValue(new Error('Invalid credentials'))

    render(<AuthFlowTestComponent />)

    // Fill in form with invalid credentials
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'invalid@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    // Should still show login form
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('completes logout flow', async () => {
    const mockUser = createMockUser()

    // Start with authenticated state
    useAuthStore.setState({
      user: mockUser,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })

    mockedAuthApi.logout.mockResolvedValue()

    render(<AuthFlowTestComponent />)

    // Should show authenticated state
    expect(screen.getByText(`Welcome, ${mockUser.firstName}!`)).toBeInTheDocument()

    // Click logout
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    // Should show loading state
    expect(screen.getByText('Logging out...')).toBeInTheDocument()

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    // Should show login form again
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()

    // Verify API was called
    expect(mockedAuthApi.logout).toHaveBeenCalled()
  })

  it('handles network errors during login', async () => {
    mockedAuthApi.login.mockRejectedValue(new Error('Network error'))

    render(<AuthFlowTestComponent />)

    // Fill in form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'user@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Should remain on login form
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('maintains loading state consistency', async () => {
    let resolveLogin: (value: any) => void
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve
    })

    mockedAuthApi.login.mockReturnValue(loginPromise as any)

    render(<AuthFlowTestComponent />)

    // Fill in form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'user@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    // Should show loading immediately
    expect(screen.getByText('Logging in...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()

    // Resolve login
    resolveLogin!({
      user: createMockUser(),
      token: 'token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
    })

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument()
    })
  })

  it('handles token refresh flow', async () => {
    const mockUser = createMockUser()

    // Start with authenticated state
    useAuthStore.setState({
      user: mockUser,
      token: 'old-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })

    const mockRefreshResponse = {
      token: 'new-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
    }

    mockedAuthApi.refreshToken.mockResolvedValue(mockRefreshResponse)

    render(<AuthFlowTestComponent />)

    // Should show authenticated state
    expect(screen.getByText(`Welcome, ${mockUser.firstName}!`)).toBeInTheDocument()

    // Trigger token refresh (this would normally happen automatically)
    const { refreshToken } = useAuthStore.getState()
    await refreshToken()

    // Should remain authenticated with new token
    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.token).toBe('new-token')
      expect(state.refreshToken).toBe('new-refresh-token')
      expect(state.isAuthenticated).toBe(true)
    })
  })

  it('handles refresh token failure and logout', async () => {
    const mockUser = createMockUser()

    // Start with authenticated state
    useAuthStore.setState({
      user: mockUser,
      token: 'old-token',
      refreshToken: 'invalid-refresh-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })

    mockedAuthApi.refreshToken.mockRejectedValue(new Error('Invalid refresh token'))

    render(<AuthFlowTestComponent />)

    // Should show authenticated state initially
    expect(screen.getByText(`Welcome, ${mockUser.firstName}!`)).toBeInTheDocument()

    // Trigger token refresh
    const { refreshToken } = useAuthStore.getState()
    await refreshToken()

    // Should logout user when refresh fails
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    // Should clear auth state
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
