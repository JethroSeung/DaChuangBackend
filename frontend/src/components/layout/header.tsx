'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  Shield,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Activity,
  PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MainNav } from './main-nav'
import { LanguageSwitcher } from './language-switcher'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { t } = useTranslation(['common', 'navigation'])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { getUnacknowledgedAlerts, systemHealth } = useDashboardStore()
  const unacknowledgedAlerts = getUnacknowledgedAlerts()
  const connectionStatus = { isConnected: systemHealth?.overall === 'HEALTHY' }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      console.log('Searching for:', searchQuery)
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    if (pathSegments.length === 0) return t('navigation:dashboard')

    const pageMap: Record<string, string> = {
      dashboard: t('navigation:dashboard'),
      uavs: t('navigation:uavmanagement'),
      map: t('navigation:mapview'),
      'hibernate-pod': t('navigation:hibernatepod'),
      'docking-stations': t('navigation:dockingstations'),
      battery: t('navigation:batterymonitor'),
      'flightLogs': t('navigation:flightLogs'),
      analytics: t('navigation:analytics'),
      alerts: t('navigation:alerts'),
      regions: t('navigation:regions'),
      users: t('navigation:users'),
      settings: t('navigation:settings'),
    }

    return pageMap[pathSegments[0]] || t('common:appName')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Desktop sidebar toggle */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="hidden md:flex"
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}

          {/* Mobile menu trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('common:menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="font-orbitron font-bold text-lg">UAV Control</span>
                </div>
                <div className="flex-1 py-4">
                  <MainNav onNavigate={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo and title */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div className="hidden sm:block">
              <h1 className="font-orbitron font-bold text-xl text-primary">
                UAV Control
              </h1>
              <p className="text-xs text-muted-foreground">
                Management System
              </p>
            </div>
          </Link>

          {/* Page title */}
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground">
              {getPageTitle()}
            </h2>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('common:searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Connection status */}
          <div className="hidden sm:flex items-center space-x-2" data-testid="connection-status">
            {connectionStatus.isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-xs font-medium">{t('common:connected')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs font-medium">{t('common:disconnected')}</span>
              </div>
            )}
          </div>

          {/* System status indicator */}
          <Button variant="ghost" size="icon" className="relative">
            <Activity className={cn(
              "h-5 w-5",
              connectionStatus.isConnected ? "text-green-600" : "text-red-600"
            )} />
            <span className="sr-only">{t('common:systemStatus')}</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unacknowledgedAlerts.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unacknowledgedAlerts.length > 9 ? '9+' : unacknowledgedAlerts.length}
                  </Badge>
                )}
                <span className="sr-only">{t('common:notifications')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>{t('common:notifications')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {unacknowledgedAlerts.length > 0 ? (
                <>
                  {unacknowledgedAlerts.slice(0, 5).map((alert) => (
                    <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3">
                      <div className="flex items-center space-x-2 w-full">
                        <Badge variant={alert.type === 'CRITICAL' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/alerts" className="w-full text-center">
                      {t('common:viewAllAlerts')}
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled>
                  {t('common:noNotifications')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">{t('common:toggleDarkMode')}</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('common:myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  {t('common:profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('common:settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                {t('common:logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
