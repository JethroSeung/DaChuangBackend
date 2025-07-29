'use client'

import React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MainNav } from './main-nav'
import { cn } from '@/lib/utils'
import { sidebarVariants, getAnimationVariants } from '@/lib/animations'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  className?: string
}

export function Sidebar({ collapsed = false, onToggle, className }: SidebarProps) {
  return (
    <motion.div
      variants={getAnimationVariants(sidebarVariants)}
      animate={collapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'flex flex-col h-full bg-card border-r',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary flex-shrink-0" data-testid="shield-icon" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-orbitron font-bold text-lg text-primary">
                  UAV Control
                </h1>
                <p className="text-xs text-muted-foreground">
                  Management System
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        
        {onToggle && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
              aria-label="Toggle sidebar"
            >
              <motion.div
                animate={{ rotate: collapsed ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </motion.div>
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className={cn('px-3', collapsed && 'px-2')}>
          <MainNav />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-xs text-muted-foreground"
            >
              <p>Version 1.0.0</p>
              <p>© 2024 UAV Systems</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
