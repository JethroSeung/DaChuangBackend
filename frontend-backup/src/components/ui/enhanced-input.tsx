'use client'

import * as React from "react"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  showPasswordToggle?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
}

const EnhancedInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label,
    error,
    success,
    helperText,
    showPasswordToggle = false,
    leftIcon,
    rightIcon,
    loading = false,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const successId = `${inputId}-success`

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type

    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)
    const hasHelper = Boolean(helperText)

    // Build aria-describedby
    const describedBy = [
      hasError && errorId,
      hasSuccess && successId,
      hasHelper && helperId,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              hasError && "text-destructive",
              hasSuccess && "text-green-600"
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={inputType}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || hasError || hasSuccess || loading) && "pr-10",
              hasError && "border-destructive focus-visible:ring-destructive",
              hasSuccess && "border-green-500 focus-visible:ring-green-500",
              isFocused && "ring-2 ring-ring ring-offset-2",
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            )}
            
            {hasError && !loading && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            
            {hasSuccess && !loading && !hasError && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            
            {showPasswordToggle && type === 'password' && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {rightIcon && !showPasswordToggle && !hasError && !hasSuccess && !loading && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {hasError && (
          <p 
            id={errorId}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </p>
        )}
        
        {hasSuccess && !hasError && (
          <p 
            id={successId}
            className="text-sm text-green-600 flex items-center gap-1"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
            {success}
          </p>
        )}
        
        {hasHelper && !hasError && !hasSuccess && (
          <p 
            id={helperId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

// Textarea variant
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  resize?: boolean
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label,
    error,
    success,
    helperText,
    resize = true,
    id,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const successId = `${inputId}-success`

    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)
    const hasHelper = Boolean(helperText)

    const describedBy = [
      hasError && errorId,
      hasSuccess && successId,
      hasHelper && helperId,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              hasError && "text-destructive",
              hasSuccess && "text-green-600"
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <textarea
          id={inputId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !resize && "resize-none",
            hasError && "border-destructive focus-visible:ring-destructive",
            hasSuccess && "border-green-500 focus-visible:ring-green-500",
            isFocused && "ring-2 ring-ring ring-offset-2",
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        {hasError && (
          <p 
            id={errorId}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </p>
        )}
        
        {hasSuccess && !hasError && (
          <p 
            id={successId}
            className="text-sm text-green-600 flex items-center gap-1"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
            {success}
          </p>
        )}
        
        {hasHelper && !hasError && !hasSuccess && (
          <p 
            id={helperId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

EnhancedTextarea.displayName = "EnhancedTextarea"

export { EnhancedInput, EnhancedTextarea }
