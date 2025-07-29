import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../auth-store'
import { authApi } from '@/api/auth-api'
import { createMockUser, mockApiResponse, mockApiError } from '@/lib/test-utils'
import { LoginRequest, RegisterRequest, ChangePasswordRequest } from '@/types/auth'

// Mock the API
jest.mock('@/api/auth-api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    
    // Clear all mocks
    jest.clearAllMocks()
    
    // Clear localStorage
    localStorage.clear()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = createMockUser()
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'password123',
        rememberMe: false,
      }
      
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        }
      }

      mockedAuthApi.login.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const success = await result.current.login(loginData)
        expect(success).toBe(true)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe('mock-token')
      expect(result.current.refreshToken).toBe('mock-refresh-token')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockedAuthApi.login).toHaveBeenCalledWith(loginData)
    })

    it('should handle login failure', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
        rememberMe: false,
      }
      
      mockedAuthApi.login.mockRejectedValue(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const success = await result.current.login(loginData)
        expect(success).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
    })

    it('should set loading state during login', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'password123',
        rememberMe: false,
      }
      
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve
      })
      
      mockedAuthApi.login.mockReturnValue(loginPromise as any)

      const { result } = renderHook(() => useAuthStore())

      // Start login
      act(() => {
        result.current.login(loginData)
      })

      // Check loading state
      expect(result.current.isLoading).toBe(true)

      // Resolve login
      await act(async () => {
        resolveLogin!({
          user: createMockUser(),
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        })
        await loginPromise
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Set initial authenticated state
      const mockUser = createMockUser()
      useAuthStore.setState({
        user: mockUser,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
      })

      mockedAuthApi.logout.mockResolvedValue()

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockedAuthApi.logout).toHaveBeenCalled()
    })

    it('should handle logout failure gracefully', async () => {
      // Set initial authenticated state
      const mockUser = createMockUser()
      useAuthStore.setState({
        user: mockUser,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
      })

      mockedAuthApi.logout.mockRejectedValue(new Error('Logout failed'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.logout()
      })

      // Should still clear local state even if API call fails
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const registerData: RegisterRequest = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      }
      
      const mockUser = createMockUser({
        username: 'newuser',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      })
      
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        }
      }

      mockedAuthApi.register.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const success = await result.current.register(registerData)
        expect(success).toBe(true)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe('mock-token')
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockedAuthApi.register).toHaveBeenCalledWith(registerData)
    })

    it('should handle registration failure', async () => {
      const registerData: RegisterRequest = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      }
      
      mockedAuthApi.register.mockRejectedValue(new Error('Username already exists'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const success = await result.current.register(registerData)
        expect(success).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Username already exists')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockUser = createMockUser()
      useAuthStore.setState({
        user: mockUser,
        token: 'old-token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
      })

      const mockResponse = {
        success: true,
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
        }
      }

      mockedAuthApi.refreshToken.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const success = await result.current.refreshAuthToken()
        expect(success).toBe(true)
      })

      expect(result.current.token).toBe('new-token')
      expect(result.current.refreshToken).toBe('new-refresh-token')
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockedAuthApi.refreshToken).toHaveBeenCalledWith({
        refreshToken: 'refresh-token',
      })
    })

    it('should handle refresh token failure', async () => {
      useAuthStore.setState({
        user: createMockUser(),
        token: 'old-token',
        refreshToken: 'invalid-refresh-token',
        isAuthenticated: true,
      })

      mockedAuthApi.refreshToken.mockRejectedValue(new Error('Invalid refresh token'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const success = await result.current.refreshAuthToken()
        expect(success).toBe(false)
      })

      // Should logout user when refresh fails
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('permission checks', () => {
    it('should check permissions correctly', () => {
      const mockUser = createMockUser({
        permissions: [
          { id: 1, name: 'UAV_READ', resource: 'UAV', action: 'READ', description: 'Read UAV data' },
          { id: 2, name: 'UAV_WRITE', resource: 'UAV', action: 'WRITE', description: 'Write UAV data' },
        ],
      })
      
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.hasPermission({ resource: 'UAV', action: 'READ' })).toBe(true)
      expect(result.current.hasPermission({ resource: 'UAV', action: 'DELETE' })).toBe(false)
      expect(result.current.canAccess('UAV', 'READ')).toBe(true)
      expect(result.current.canAccess('UAV', 'DELETE')).toBe(false)
    })

    it('should check roles correctly', () => {
      const mockUser = createMockUser({
        roles: [
          { id: 1, name: 'ADMIN', description: 'Administrator', permissions: [] },
          { id: 2, name: 'USER', description: 'Regular user', permissions: [] },
        ],
      })
      
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.hasRole('ADMIN')).toBe(true)
      expect(result.current.hasRole('USER')).toBe(true)
      expect(result.current.hasRole('SUPER_ADMIN')).toBe(false)
    })

    it('should return false for unauthenticated users', () => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.hasPermission({ resource: 'UAV', action: 'READ' })).toBe(false)
      expect(result.current.hasRole('ADMIN')).toBe(false)
      expect(result.current.canAccess('UAV', 'READ')).toBe(false)
    })
  })

  describe('utility functions', () => {
    it('should clear error', () => {
      useAuthStore.setState({ error: 'Some error' })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should update last activity', () => {
      const mockUser = createMockUser()
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useAuthStore())

      const beforeUpdate = result.current.user?.lastLogin

      act(() => {
        result.current.updateLastActivity()
      })

      const afterUpdate = result.current.user?.lastLogin
      expect(afterUpdate).not.toBe(beforeUpdate)
    })
  })
})
