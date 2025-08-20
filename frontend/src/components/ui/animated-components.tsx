'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { staggerContainer, staggerItem, cardVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'

// Animated Card Component
interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className, delay = 0, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ delay }}
    >
      <Card className={cn(className)} {...props}>
        {children}
      </Card>
    </motion.div>
  )
}

// Stagger Container Component
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function StaggerContainer({ children, className, delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

// Stagger Item Component
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated Alert Component
interface AnimatedAlertProps {
  children: React.ReactNode
  className?: string
  show?: boolean
}

export function AnimatedAlert({ children, className, show = true }: AnimatedAlertProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Fade In Component
interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function FadeIn({ children, className, delay = 0, direction = 'up' }: FadeInProps) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale In Component
interface ScaleInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Slide In Component
interface SlideInProps {
  children: React.ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
}

export function SlideIn({ children, className, direction = 'left', delay = 0 }: SlideInProps) {
  const directionOffset = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: -100 },
    down: { y: 100 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
