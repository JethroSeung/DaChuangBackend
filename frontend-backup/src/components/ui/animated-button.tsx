'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants, getAnimationVariants } from '@/lib/animations'

interface AnimatedButtonProps extends Omit<ButtonProps, 'asChild'> {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
  ripple?: boolean
  glow?: boolean
  magnetic?: boolean
}

export function AnimatedButton({ 
  children, 
  className, 
  disabled = false, 
  loading = false,
  ripple = false,
  glow = false,
  magnetic = false,
  onClick,
  ...props 
}: AnimatedButtonProps) {
  const [isClicked, setIsClicked] = React.useState(false)
  const [ripplePosition, setRipplePosition] = React.useState({ x: 0, y: 0 })

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return

    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      setRipplePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 600)
    }

    onClick?.(e)
  }

  const buttonVariant = {
    rest: { scale: 1 },
    hover: { 
      scale: disabled ? 1 : 1.05,
      boxShadow: glow ? '0 0 20px rgba(59, 130, 246, 0.5)' : undefined,
    },
    tap: { scale: disabled ? 1 : 0.95 },
  }

  return (
    <motion.div
      variants={getAnimationVariants(buttonVariant)}
      initial="rest"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      className="relative inline-block"
    >
      <Button
        className={cn(
          'relative overflow-hidden',
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-current/10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          </motion.div>
        )}

        {/* Ripple effect */}
        {ripple && isClicked && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute bg-white rounded-full pointer-events-none"
            style={{
              left: ripplePosition.x - 10,
              top: ripplePosition.y - 10,
              width: 20,
              height: 20,
            }}
          />
        )}

        {/* Button content */}
        <motion.div
          animate={loading ? { opacity: 0.5 } : { opacity: 1 }}
          className="flex items-center space-x-2"
        >
          {children}
        </motion.div>
      </Button>
    </motion.div>
  )
}

// Floating Action Button
interface FloatingActionButtonProps extends AnimatedButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function FloatingActionButton({ 
  children, 
  className, 
  position = 'bottom-right',
  ...props 
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(positionClasses[position], 'z-50')}
    >
      <AnimatedButton
        className={cn(
          'rounded-full w-14 h-14 shadow-lg',
          className
        )}
        glow
        ripple
        {...props}
      >
        {children}
      </AnimatedButton>
    </motion.div>
  )
}

// Icon Button with animations
interface AnimatedIconButtonProps extends AnimatedButtonProps {
  icon: React.ReactNode
  label?: string
  showLabel?: boolean
}

export function AnimatedIconButton({ 
  icon, 
  label, 
  showLabel = false, 
  className, 
  ...props 
}: AnimatedIconButtonProps) {
  return (
    <AnimatedButton
      className={cn(
        'relative group',
        !showLabel && 'w-10 h-10 p-0',
        className
      )}
      {...props}
    >
      <motion.div
        whileHover={{ rotate: 15 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      
      {label && showLabel && (
        <span className="ml-2">{label}</span>
      )}
      
      {label && !showLabel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
        >
          {label}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </motion.div>
      )}
    </AnimatedButton>
  )
}

// Button with progress indicator
interface ProgressButtonProps extends AnimatedButtonProps {
  progress?: number
  showProgress?: boolean
}

export function ProgressButton({ 
  progress = 0, 
  showProgress = false, 
  children, 
  className, 
  ...props 
}: ProgressButtonProps) {
  return (
    <AnimatedButton
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {showProgress && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="absolute left-0 top-0 h-full bg-white/20 pointer-events-none"
        />
      )}
      {children}
    </AnimatedButton>
  )
}
