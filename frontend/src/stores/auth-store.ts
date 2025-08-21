import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  PermissionCheck,
  ResourceType,
  ActionType,
} from '@/types/auth'
import { authApi } from '@/api/auth-api'
import { toast } from 'react-hot-toast'

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>
  logout: () => Promise<void>
  register: (userData: RegisterRequest) => Promise<boolean>
  refreshAuthToken: () => Promise<boolean>
  changePassword: (passwords: ChangePasswordRequest) => Promise<boolean>
  updateProfile: (userData: Partial<User>) => Promise<boolean>

  // Permission checks
  hasPermission: (check: PermissionCheck) => boolean
  hasRole: (roleName: string) => boolean
  canAccess: (resource: ResourceType, action: ActionType) => boolean

  // Session management
  checkSession: () => Promise<boolean>
  clearError: () => void
  setLoading: (loading: boolean) => void

  // User management
  fetchUserProfile: () => Promise<void>
  updateLastActivity: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,

          // Login
          login: async (credentials: LoginRequest) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const response = await authApi.login(credentials)

              if (response.success && response.data) {
                set((state) => {
                  state.user = response.data!.user
                  state.token = response.data!.token
                  state.refreshToken = response.data!.refreshToken
                  state.isAuthenticated = true
                  state.isLoading = false
                  state.error = null
                })

                // Set token in API client
                authApi.setAuthToken(response.data.token)

                toast.success('Login successful!')
                return true
              } else {
                set((state) => {
                  state.error = response.message || 'Login failed'
                  state.isLoading = false
                })
                toast.error(response.message || 'Login failed')
                return false
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Login failed'
              set((state) => {
                state.error = errorMessage
                state.isLoading = false
              })
              toast.error(errorMessage)
              return false
            }
          },

          // Logout
          logout: async () => {
            try {
              await authApi.logout()
            } catch (error) {
              console.error('Logout error:', error)
            } finally {
              set((state) => {
                state.user = null
                state.token = null
                state.refreshToken = null
                state.isAuthenticated = false
                state.error = null
              })

              // Clear token from API client
              authApi.clearAuthToken()

              toast.success('Logged out successfully')
            }
          },

          // Register
          register: async (userData: RegisterRequest) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const response = await authApi.register(userData)

              if (response.success && response.data) {
                set((state) => {
                  state.user = response.data!.user
                  state.token = response.data!.token
                  state.refreshToken = response.data!.refreshToken
                  state.isAuthenticated = true
                  state.isLoading = false
                  state.error = null
                })

                // Set token in API client
                authApi.setAuthToken(response.data.token)

                toast.success('Registration successful!')
                return true
              } else {
                set((state) => {
                  state.error = response.message || 'Registration failed'
                  state.isLoading = false
                })
                toast.error(response.message || 'Registration failed')
                return false
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Registration failed'
              set((state) => {
                state.error = errorMessage
                state.isLoading = false
              })
              toast.error(errorMessage)
              return false
            }
          },

          // Refresh token
          refreshAuthToken: async () => {
            const state = get()
            if (!state.refreshToken) return false

            try {
              const response = await authApi.refreshToken({ refreshToken: state.refreshToken })

              if (response.success && response.data) {
                set((state) => {
                  state.token = response.data!.token
                  state.refreshToken = response.data!.refreshToken
                  state.error = null
                })

                // Update token in API client
                authApi.setAuthToken(response.data.token)

                return true
              } else {
                // Refresh failed, logout user
                get().logout()
                return false
              }
            } catch (error) {
              console.error('Token refresh failed:', error)
              get().logout()
              return false
            }
          },

          // Change password
          changePassword: async (passwords: ChangePasswordRequest) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const response = await authApi.changePassword(passwords)

              if (response.success) {
                set((state) => {
                  state.isLoading = false
                  state.error = null
                })
                toast.success('Password changed successfully!')
                return true
              } else {
                set((state) => {
                  state.error = response.message || 'Password change failed'
                  state.isLoading = false
                })
                toast.error(response.message || 'Password change failed')
                return false
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Password change failed'
              set((state) => {
                state.error = errorMessage
                state.isLoading = false
              })
              toast.error(errorMessage)
              return false
            }
          },

          // Update profile
          updateProfile: async (userData: Partial<User>) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const response = await authApi.updateProfile(userData)

              if (response.success && response.data) {
                set((state) => {
                  state.user = response.data!
                  state.isLoading = false
                  state.error = null
                })

                toast.success('Profile updated successfully!')
                return true
              } else {
                set((state) => {
                  state.error = response.message || 'Profile update failed'
                  state.isLoading = false
                })
                toast.error(response.message || 'Profile update failed')
                return false
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
              set((state) => {
                state.error = errorMessage
                state.isLoading = false
              })
              toast.error(errorMessage)
              return false
            }
          },

          // Permission checks
          hasPermission: (check: PermissionCheck) => {
            const { user } = get()
            if (!user || !user.permissions) return false

            return user.permissions.some(permission =>
              permission.resource === check.resource &&
              permission.action === check.action
            )
          },

          hasRole: (roleName: string) => {
            const { user } = get()
            if (!user || !user.roles) return false

            return user.roles.some(role => role.name === roleName)
          },

          canAccess: (resource: ResourceType, action: ActionType) => {
            return get().hasPermission({ resource, action })
          },

          // Session management
          checkSession: async () => {
            const { token, refreshToken } = get()

            if (!token) {
              set((state) => {
                state.isAuthenticated = false
              })
              return false
            }

            try {
              // Check if token is still valid
              const isValid = await authApi.validateToken()

              if (isValid) {
                set((state) => {
                  state.isAuthenticated = true
                })
                return true
              } else if (refreshToken) {
                // Try to refresh token
                return await get().refreshAuthToken()
              } else {
                // No valid token or refresh token
                get().logout()
                return false
              }
            } catch (error) {
              console.error('Session check failed:', error)
              get().logout()
              return false
            }
          },

          // Fetch user profile
          fetchUserProfile: async () => {
            try {
              const user = await authApi.getUserProfile()
              set((state) => {
                state.user = user
              })
            } catch (error) {
              console.error('Failed to fetch user profile:', error)
            }
          },

          // Update last activity
          updateLastActivity: () => {
            const { user } = get()
            if (user) {
              set((state) => {
                if (state.user) {
                  state.user.lastLogin = new Date().toISOString()
                }
              })
            }
          },

          // Clear error
          clearError: () => {
            set((state) => {
              state.error = null
            })
          },

          // Set loading
          setLoading: (loading: boolean) => {
            set((state) => {
              state.isLoading = loading
            })
          },
        }))
      ),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)

// Selectors
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}))

export const usePermissions = () => useAuthStore((state) => ({
  hasPermission: state.hasPermission,
  hasRole: state.hasRole,
  canAccess: state.canAccess,
}))
