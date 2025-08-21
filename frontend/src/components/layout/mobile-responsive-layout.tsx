'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Search,
  Bell,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MainNav } from './main-nav'
import { UserNav } from './user-nav'
import { SearchCommand } from './search-command'
import { NotificationCenter } from './notification-center'

interface MobileResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

// Hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

// Mobile-first responsive header
function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pathname = usePathname()

  const getPageTitle = () => {
    const routes: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/uavs': 'UAV Management',
      '/map': 'Map View',
      '/hibernate-pod': 'Hibernate Pod',
      '/docking-stations': 'Docking Stations',
      '/battery': 'Battery Monitor',
    }
    return routes[pathname] || 'UAV Control'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left section - Menu and Title */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-sm leading-none">UAV Control</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Center - Page Title (mobile) */}
        <div className="flex-1 text-center sm:hidden">
          <h2 className="text-sm font-medium truncate">{getPageTitle()}</h2>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-[80vh]">
              <SearchCommand onClose={() => setSearchOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Notifications */}
          <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <NotificationCenter />
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <UserNav />
        </div>
      </div>
    </header>
  )
}

// Enhanced mobile navigation drawer
function MobileNavDrawer({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">UAV Control</h2>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <MainNav
              className="px-4"
              onNavigate={() => onOpenChange(false)}
              mobile
            />
          </div>

          {/* Footer */}
          <div className="border-t p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Mobile-optimized bottom navigation for quick access
function MobileBottomNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  if (!isMobile) return null

  const quickNavItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/uavs', icon: User, label: 'UAVs' },
    { href: '/map', icon: Search, label: 'Map' },
    { href: '/battery', icon: Bell, label: 'Battery' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-4 h-16">
        {quickNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 text-xs transition-colors',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Main responsive layout component
export function MobileResponsiveLayout({ children, className }: MobileResponsiveLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Main Content */}
      <main className={cn(
        'min-h-[calc(100vh-3.5rem)]', // Account for header height
        isMobile && 'pb-16', // Account for bottom nav on mobile
        className
      )}>
        <div className="container mx-auto px-4 py-4 md:py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

// Responsive grid component for dashboard cards
export function ResponsiveGrid({
  children,
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 }
}: {
  children: React.ReactNode
  className?: string
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}) {
  const gridClasses = [
    `grid`,
    `grid-cols-${cols.sm || 1}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    'gap-4 md:gap-6'
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  )
}

// Mobile-optimized card component
export function MobileCard({
  children,
  className,
  padding = 'default'
}: {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'default' | 'lg'
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  }

  return (
    <div className={cn(
      'bg-card rounded-lg border shadow-sm',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive text component that adjusts size based on screen
export function ResponsiveText({
  children,
  variant = 'body',
  className
}: {
  children: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small'
  className?: string
}) {
  const variants = {
    h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg md:text-xl lg:text-2xl font-semibold',
    h4: 'text-base md:text-lg lg:text-xl font-medium',
    body: 'text-sm md:text-base',
    small: 'text-xs md:text-sm'
  }

  const Component = variant.startsWith('h') ? variant as keyof React.JSX.IntrinsicElements : 'p'

  return (
    <Component className={cn(variants[variant], className)}>
      {children}
    </Component>
  )
}
