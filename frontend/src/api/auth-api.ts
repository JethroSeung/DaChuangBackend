import apiClient from '@/lib/api-client'
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SessionInfo,
  SecurityEvent,
  SecurityIncident,
  TwoFactorSetup
} from '@/types/auth'

export class AuthApi {
  private basePath = '/api/auth'

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`${this.basePath}/login`, credentials)
  }

  async logout(): Promise<void> {
    return apiClient.post(`${this.basePath}/logout`)
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>(`${this.basePath}/register`, userData)
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>(`${this.basePath}/refresh`, request)
  }

  async validateToken(): Promise<boolean> {
    try {
      await apiClient.get(`${this.basePath}/validate`)
      return true
    } catch {
      return false
    }
  }

  // Password management
  async changePassword(passwords: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/change-password`, passwords)
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/forgot-password`, request)
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/reset-password`, request)
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/resend-verification`, { email })
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/verify-email`, { token })
  }

  // User profile
  async getUserProfile(): Promise<User> {
    return apiClient.get<User>(`${this.basePath}/profile`)
  }

  async updateProfile(userData: Partial<User>): Promise<{ success: boolean; message: string; data?: User }> {
    return apiClient.put(`${this.basePath}/profile`, userData)
  }

  // Session management
  async checkSession(): Promise<{ success: boolean; data?: { isValid: boolean; user?: User } }> {
    return apiClient.get(`${this.basePath}/session`)
  }

  async getSessions(): Promise<SessionInfo[]> {
    return apiClient.get(`${this.basePath}/sessions`)
  }

  async terminateSession(sessionId: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/sessions/${sessionId}`)
  }

  async terminateAllSessions(): Promise<void> {
    return apiClient.delete(`${this.basePath}/sessions`)
  }

  // Two-factor authentication
  async setupTwoFactor(): Promise<TwoFactorSetup> {
    return apiClient.post(`${this.basePath}/2fa/setup`)
  }

  async verifyTwoFactor(code: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/2fa/verify`, { code })
  }

  async disableTwoFactor(code: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.basePath}/2fa/disable`, { code })
  }

  // OAuth
  async oauthLogin(provider: string, code: string, state: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`${this.basePath}/oauth/${provider}`, { code, state })
  }

  // Security
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return apiClient.get(`${this.basePath}/security/events`)
  }

  async reportSecurityIncident(incident: SecurityIncident): Promise<void> {
    return apiClient.post(`${this.basePath}/security/incident`, incident)
  }

  // Token management
  setAuthToken(token: string) {
    apiClient.setAuthToken(token)
  }

  clearAuthToken() {
    apiClient.clearAuthToken()
  }
}

// Create singleton instance
export const authApi = new AuthApi()

export default authApi
