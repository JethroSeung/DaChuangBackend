import { AuthApi } from '../auth-api'
import apiClient from '@/lib/api-client'
import { createMockUser } from '@/lib/test-utils'
import {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth'

// Mock the API client
jest.mock('@/lib/api-client')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('AuthApi', () => {
  let authApi: AuthApi

  beforeEach(() => {
    authApi = new AuthApi()
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'password123',
        rememberMe: false,
      }

      const mockResponse = {
        user: createMockUser(),
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      }

      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.login(loginData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/login', loginData)
    })

    it('should handle login error', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
        rememberMe: false,
      }

      const error = new Error('Invalid credentials')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.login(loginData)).rejects.toThrow('Invalid credentials')
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/login', loginData)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockedApiClient.post.mockResolvedValue(undefined)

      await authApi.logout()

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/logout')
    })

    it('should handle logout error', async () => {
      const error = new Error('Logout failed')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.logout()).rejects.toThrow('Logout failed')
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

      const mockResponse = {
        user: createMockUser({
          username: 'newuser',
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
        }),
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      }

      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.register(registerData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/register', registerData)
    })

    it('should handle registration error', async () => {
      const registerData: RegisterRequest = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      }

      const error = new Error('Username already exists')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.register(registerData)).rejects.toThrow('Username already exists')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshRequest = { refreshToken: 'refresh-token' }
      const mockResponse = {
        token: 'new-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      }

      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.refreshToken(refreshRequest)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/refresh', refreshRequest)
    })

    it('should handle refresh token error', async () => {
      const refreshRequest = { refreshToken: 'invalid-token' }
      const error = new Error('Invalid refresh token')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.refreshToken(refreshRequest)).rejects.toThrow('Invalid refresh token')
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordData: ChangePasswordRequest = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }

      const mockResponse = { success: true, message: 'Password changed successfully' }
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.changePassword(changePasswordData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/change-password', changePasswordData)
    })

    it('should handle change password error', async () => {
      const changePasswordData: ChangePasswordRequest = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }

      const error = new Error('Current password is incorrect')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.changePassword(changePasswordData)).rejects.toThrow('Current password is incorrect')
    })
  })

  describe('forgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      const forgotPasswordData: ForgotPasswordRequest = {
        email: 'user@example.com',
      }

      const mockResponse = { success: true, message: 'Reset email sent' }
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.forgotPassword(forgotPasswordData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/forgot-password', forgotPasswordData)
    })

    it('should handle forgot password error', async () => {
      const forgotPasswordData: ForgotPasswordRequest = {
        email: 'nonexistent@example.com',
      }

      const error = new Error('Email not found')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.forgotPassword(forgotPasswordData)).rejects.toThrow('Email not found')
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordData: ResetPasswordRequest = {
        token: 'reset-token',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }

      const mockResponse = { success: true, message: 'Password reset successfully' }
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.resetPassword(resetPasswordData)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/reset-password', resetPasswordData)
    })

    it('should handle reset password error', async () => {
      const resetPasswordData: ResetPasswordRequest = {
        token: 'invalid-token',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }

      const error = new Error('Invalid or expired token')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.resetPassword(resetPasswordData)).rejects.toThrow('Invalid or expired token')
    })
  })

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = createMockUser()
      mockedApiClient.get.mockResolvedValue(mockUser)

      const result = await authApi.getUserProfile()

      expect(result).toEqual(mockUser)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/auth/profile')
    })

    it('should handle get profile error', async () => {
      const error = new Error('Unauthorized')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(authApi.getUserProfile()).rejects.toThrow('Unauthorized')
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
      }

      const mockUpdatedUser = createMockUser(updateData)
      mockedApiClient.put.mockResolvedValue(mockUpdatedUser)

      const result = await authApi.updateProfile(updateData)

      expect(result).toEqual(mockUpdatedUser)
      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/auth/profile', updateData)
    })

    it('should handle update profile error', async () => {
      const updateData = {
        email: 'invalid-email',
      }

      const error = new Error('Invalid email format')
      mockedApiClient.put.mockRejectedValue(error)

      await expect(authApi.updateProfile(updateData)).rejects.toThrow('Invalid email format')
    })
  })

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token'
      const mockResponse = { success: true, message: 'Email verified' }
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.verifyEmail(token)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/verify-email', { token })
    })

    it('should handle email verification error', async () => {
      const token = 'invalid-token'
      const error = new Error('Invalid verification token')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.verifyEmail(token)).rejects.toThrow('Invalid verification token')
    })
  })

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      const email = 'user@example.com'
      const mockResponse = { success: true, message: 'Verification email sent' }
      mockedApiClient.post.mockResolvedValue(mockResponse)

      const result = await authApi.resendVerificationEmail(email)

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/auth/resend-verification', { email })
    })

    it('should handle resend verification error', async () => {
      const email = 'nonexistent@example.com'
      const error = new Error('Email not found')
      mockedApiClient.post.mockRejectedValue(error)

      await expect(authApi.resendVerificationEmail(email)).rejects.toThrow('Email not found')
    })
  })

  describe('checkSession', () => {
    it('should check session successfully', async () => {
      const mockResponse = { valid: true, user: createMockUser() }
      mockedApiClient.get.mockResolvedValue(mockResponse)

      const result = await authApi.checkSession()

      expect(result).toEqual(mockResponse)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/auth/session')
    })

    it('should handle invalid session', async () => {
      const error = new Error('Session expired')
      mockedApiClient.get.mockRejectedValue(error)

      await expect(authApi.checkSession()).rejects.toThrow('Session expired')
    })
  })
})
