'use client'

import React from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  pageVariants,
  cardVariants,
  staggerContainer,
  staggerItem,
  alertVariants,
  getAnimationVariants,
} from '@/lib/animations'

// Animated Page Wrapper
interface AnimatedPageProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

export function AnimatedPage({ children, className, ...props }: AnimatedPageProps) {
  return (
    <motion.div
      variants={getAnimationVariants(pageVariants)}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated Card
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  tap?: boolean
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  tap = true,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={getAnimationVariants(cardVariants)}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      whileTap={tap ? "tap" : undefined}
      className={cn('cursor-pointer', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger Container
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  ...props
}: StaggerContainerProps) {
  const variants = {
    ...staggerContainer,
    visible: {
      ...staggerContainer.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      variants={getAnimationVariants(staggerContainer)}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger Item
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated Modal/Dialog
interface AnimatedModalProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  isOpen: boolean
}

export function AnimatedModal({ children, className, isOpen, ...props }: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={getAnimationVariants(alertVariants)}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Animated Button
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function AnimatedButton({
  children,
  className,
  disabled = false,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
      }}
      initial="rest"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Fade In/Out
interface FadeProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  show: boolean
}

export function Fade({ children, className, show, ...props }: FadeProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 }
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Slide animations
interface SlideProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  direction: 'up' | 'down' | 'left' | 'right'
  show: boolean
}

export function Slide({ children, className, direction, show, ...props }: SlideProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={{
            hidden: {
              opacity: 0,
              x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
              y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0
            },
            visible: { opacity: 1, x: 0, y: 0 },
            exit: {
              opacity: 0,
              x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
              y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0
            }
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Loading Spinner
interface AnimatedSpinnerProps extends HTMLMotionProps<'div'> {
  className?: string
  size?: number
}

export function AnimatedSpinner({ className, size = 24, ...props }: AnimatedSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={cn('inline-block', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="24"
        />
      </svg>
    </motion.div>
  )
}

// Scale on Hover
interface ScaleOnHoverProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  scale?: number
}

export function ScaleOnHover({
  children,
  className,
  scale = 1.05,
  ...props
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Pulse animation
interface PulseProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

export function Pulse({ children, className, ...props }: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Bounce animation
interface BounceProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  trigger?: boolean
}

export function Bounce({ children, className, trigger = false, ...props }: BounceProps) {
  return (
    <motion.div
      animate={trigger ? {
        y: [0, -10, 0],
      } : {}}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Shake animation
interface ShakeProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  trigger?: boolean
}

export function Shake({ children, className, trigger = false, ...props }: ShakeProps) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
      } : {}}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Floating animation
interface FloatProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

export function Float({ children, className, ...props }: FloatProps) {
  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Glow effect
interface GlowProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  color?: string
}

export function Glow({ children, className, color = 'blue', ...props }: GlowProps) {
  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 20px rgba(59, 130, 246, 0.5)`,
      }}
      transition={{ duration: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Magnetic effect
interface MagneticProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className, strength = 0.3, ...props }: MagneticProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    setMousePosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    })
  }

  return (
    <motion.div
      animate={isHovered ? {
        x: mousePosition.x,
        y: mousePosition.y,
      } : {
        x: 0,
        y: 0,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
