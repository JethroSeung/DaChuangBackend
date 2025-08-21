// Authentication and Authorization Types

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  roles: Role[]
  permissions: Permission[]
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description: string
}

export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    refreshToken: string
    expiresIn: number
  }
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    refreshToken: string
    expiresIn: number
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  message: string
  data?: {
    token: string
    refreshToken: string
    expiresIn: number
  }
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Security and session management
export interface SessionInfo {
  id: string
  userId: number
  ipAddress: string
  userAgent: string
  createdAt: string
  lastActivity: string
  isActive: boolean
}

export interface SecurityEvent {
  id: string
  userId: number
  eventType: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PASSWORD_CHANGE' | 'PERMISSION_DENIED'
  ipAddress: string
  userAgent: string
  details?: string
  timestamp: string
}

// Role-based access control
export type ResourceType =
  | 'UAV'
  | 'REGION'
  | 'HIBERNATE_POD'
  | 'DOCKING_STATION'
  | 'FLIGHT_LOG'
  | 'MAINTENANCE_RECORD'
  | 'USER'
  | 'SYSTEM_SETTINGS'
  | 'ANALYTICS'
  | 'ALERTS'

export type ActionType =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXECUTE'
  | 'APPROVE'
  | 'EXPORT'
  | 'IMPORT'

export interface PermissionCheck {
  resource: ResourceType
  action: ActionType
  resourceId?: number
}

// Two-factor authentication
export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorVerification {
  code: string
  backupCode?: string
}

export interface TwoFactorStatus {
  enabled: boolean
  lastUsed?: string
  backupCodesRemaining: number
}

// OAuth and external authentication
export interface OAuthProvider {
  name: string
  clientId: string
  enabled: boolean
  scopes: string[]
}

export interface OAuthLoginRequest {
  provider: string
  code: string
  state: string
}

// JWT token payload
export interface JWTPayload {
  sub: string // user ID
  username: string
  email: string
  roles: string[]
  permissions: string[]
  iat: number // issued at
  exp: number // expiration
  iss: string // issuer
  aud: string // audience
}

// Security incident reporting
export interface SecurityIncident {
  id?: string
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  eventType: string
  sourceIp?: string
  userAgent?: string
  userId?: number
  timestamp?: string
  status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
  reportedBy?: string
  assignedTo?: string
  evidence?: string[]
  impact?: string
  mitigation?: string
}

// Error types
export interface AuthError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'SESSION_EXPIRED'
  | 'TWO_FACTOR_REQUIRED'
  | 'PASSWORD_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'

// Password policy
export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReuse: number
  maxAge: number
  lockoutAttempts: number
  lockoutDuration: number
}

// Account lockout and security
export interface AccountLockout {
  userId: number
  reason: 'FAILED_ATTEMPTS' | 'ADMIN_LOCK' | 'SUSPICIOUS_ACTIVITY'
  lockedAt: string
  unlockAt?: string
  attempts: number
  isLocked: boolean
}
