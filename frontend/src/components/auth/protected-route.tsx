'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { ResourceType, ActionType, PermissionCheck } from '@/types/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Lock, AlertTriangle, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredPermissions?: PermissionCheck[]
  requiredRoles?: string[]
  fallbackUrl?: string
  showUnauthorized?: boolean
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackUrl = '/auth/login',
  showUnauthorized = true,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading, checkSession, hasPermission, hasRole } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true)

      // If authentication is not required, allow access
      if (!requireAuth) {
        setHasAccess(true)
        setIsChecking(false)
        return
      }

      // Check if user is authenticated
      const sessionValid = await checkSession()

      if (!sessionValid) {
        router.push(fallbackUrl)
        return
      }

      // Check role requirements
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => hasRole(role))
        if (!hasRequiredRole) {
          setHasAccess(false)
          setIsChecking(false)
          return
        }
      }

      // Check permission requirements
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(permission =>
          hasPermission(permission)
        )
        if (!hasRequiredPermissions) {
          setHasAccess(false)
          setIsChecking(false)
          return
        }
      }

      setHasAccess(true)
      setIsChecking(false)
    }

    checkAccess()
  }, [
    requireAuth,
    requiredPermissions,
    requiredRoles,
    fallbackUrl,
    router,
    checkSession,
    hasPermission,
    hasRole,
  ])

  // Show loading state
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Checking access permissions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show unauthorized message
  if (!hasAccess && showUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You don&apos;t have permission to access this resource.
                  {requiredRoles.length > 0 && (
                    <div className="mt-2">
                      <strong>Required roles:</strong> {requiredRoles.join(', ')}
                    </div>
                  )}
                  {requiredPermissions.length > 0 && (
                    <div className="mt-2">
                      <strong>Required permissions:</strong>{' '}
                      {requiredPermissions.map(p => `${p.resource}:${p.action}`).join(', ')}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full"
                >
                  Go Back
                </Button>

                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>

              {user && (
                <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                  <p>Signed in as: <strong>{user.username}</strong></p>
                  <p>Roles: {user.roles?.map(r => r.name).join(', ') || 'None'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render children if access is granted
  if (hasAccess) {
    return <>{children}</>
  }

  // Fallback - redirect to login
  return null
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Permission-based component wrapper
interface RequirePermissionProps {
  children: React.ReactNode
  resource: ResourceType
  action: ActionType
  fallback?: React.ReactNode
}

export function RequirePermission({
  children,
  resource,
  action,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission } = useAuthStore()

  if (hasPermission({ resource, action })) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

// Role-based component wrapper
interface RequireRoleProps {
  children: React.ReactNode
  roles: string | string[]
  fallback?: React.ReactNode
}

export function RequireRole({
  children,
  roles,
  fallback = null,
}: RequireRoleProps) {
  const { hasRole } = useAuthStore()

  const roleArray = Array.isArray(roles) ? roles : [roles]
  const hasRequiredRole = roleArray.some(role => hasRole(role))

  if (hasRequiredRole) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
