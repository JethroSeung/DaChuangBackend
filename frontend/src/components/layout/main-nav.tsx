'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Plane,
  Map,
  Settings,
  BarChart3,
  Shield,
  Battery,
  MapPin,
  AlertTriangle,
  Users,
  FileText,
  Home,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'System overview and real-time monitoring',
  },
  {
    name: 'UAV Management',
    href: '/uavs',
    icon: Plane,
    description: 'Manage UAV fleet and operations',
  },
  {
    name: 'Map View',
    href: '/map',
    icon: Map,
    description: 'Real-time UAV tracking and geofences',
  },
  {
    name: 'Hibernate Pod',
    href: '/hibernate-pod',
    icon: Home,
    description: 'Manage UAV hibernation and storage',
  },
  {
    name: 'Docking Stations',
    href: '/docking-stations',
    icon: MapPin,
    description: 'Manage docking station network',
  },
  {
    name: 'Battery Monitor',
    href: '/battery',
    icon: Battery,
    description: 'Monitor UAV battery status and health',
  },
  {
    name: 'Flight Logs',
    href: '/flight-logs',
    icon: FileText,
    description: 'View flight history and logs',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Performance metrics and reports',
  },
  {
    name: 'Alerts',
    href: '/alerts',
    icon: AlertTriangle,
    description: 'System alerts and notifications',
  },
  {
    name: 'Regions',
    href: '/regions',
    icon: Shield,
    description: 'Manage operational regions',
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    description: 'User management and permissions',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration and preferences',
  },
]

interface MainNavProps {
  className?: string
  onNavigate?: () => void
  mobile?: boolean
}

export function MainNav({ className, onNavigate, mobile = false }: MainNavProps) {
  const pathname = usePathname()
  const { t } = useTranslation('navigation')

  // Get navigation items with translations
  const getNavigationItems = () => navigation.map(item => {
    const key = item.name.toLowerCase().replace(/\s+/g, '').replace(/-/g, '')
    return {
      ...item,
      name: t(key),
      description: t(key + 'Description')
    }
  })

  const navigationItems = getNavigationItems()

  if (mobile) {
    return (
      <nav className={cn('flex flex-col space-y-1', className)}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
              title={item.description}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="truncate">{item.name}</span>
                <span className="text-xs opacity-70 truncate">{item.description}</span>
              </div>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground" />
              )}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
            title={item.description}
          >
            <Icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground group-hover:text-accent-foreground'
              )}
            />
            <span className="truncate">{item.name}</span>
            {isActive && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// Mobile navigation component
export function MobileNav({ className, onNavigate }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn('grid grid-cols-2 gap-2 p-4', className)}>
      {navigation.slice(0, 8).map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon

        return (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-6 w-6 mb-1" />
              </motion.div>
              <span className="text-xs font-medium text-center leading-tight">
                {item.name}
              </span>
            </Link>
          </motion.div>
        )
      })}
    </nav>
  )
}

// Quick access navigation for frequently used items
export function QuickNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const quickItems = navigation.slice(0, 4) // Dashboard, UAVs, Map, Hibernate Pod

  return (
    <nav className={cn('flex space-x-1', className)}>
      {quickItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon

        return (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              )}
              title={item.description}
            >
              <motion.div
                animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="h-4 w-4 mr-2" />
              </motion.div>
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          </motion.div>
        )
      })}
    </nav>
  )
}
