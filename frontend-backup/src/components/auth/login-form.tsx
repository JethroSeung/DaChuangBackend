'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { LoginRequest } from '@/types/auth'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  redirectTo?: string
  onSuccess?: () => void
}

export function LoginForm({ redirectTo = '/dashboard', onSuccess }: LoginFormProps) {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    
    const loginData: LoginRequest = {
      username: data.username,
      password: data.password,
      rememberMe: data.rememberMe,
    }

    const success = await login(loginData)
    
    if (success) {
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(redirectTo)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-orbitron">UAV Control System</CardTitle>
          <CardDescription>
            Sign in to access the UAV management dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register('username')}
                className={errors.username ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={watch('rememberMe')}
                  onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>
              
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Secure access to UAV management system
              </p>
              <div className="flex justify-center items-center mt-2 space-x-4 text-xs text-muted-foreground">
                <span>🔒 SSL Encrypted</span>
                <span>🛡️ Multi-factor Auth</span>
                <span>📊 Audit Logged</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
