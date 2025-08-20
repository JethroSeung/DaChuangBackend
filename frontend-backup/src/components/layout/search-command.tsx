'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plane, 
  Map, 
  Battery, 
  Settings, 
  Users, 
  FileText,
  Clock,
  ArrowRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SearchCommandProps {
  onClose?: () => void
  className?: string
}

// Mock search data - replace with actual search implementation
const searchData = {
  recent: [
    { id: 1, title: 'UAV-001 Status', type: 'uav', href: '/uavs/1' },
    { id: 2, title: 'Battery Monitor', type: 'page', href: '/battery' },
    { id: 3, title: 'Flight Logs', type: 'page', href: '/flight-logs' },
  ],
  suggestions: [
    { id: 1, title: 'Dashboard', type: 'page', href: '/dashboard', icon: Plane },
    { id: 2, title: 'UAV Management', type: 'page', href: '/uavs', icon: Plane },
    { id: 3, title: 'Map View', type: 'page', href: '/map', icon: Map },
    { id: 4, title: 'Battery Monitor', type: 'page', href: '/battery', icon: Battery },
    { id: 5, title: 'Settings', type: 'page', href: '/settings', icon: Settings },
    { id: 6, title: 'Users', type: 'page', href: '/users', icon: Users },
    { id: 7, title: 'Reports', type: 'page', href: '/reports', icon: FileText },
  ],
  uavs: [
    { id: 1, title: 'UAV-001', type: 'uav', status: 'Active', href: '/uavs/1' },
    { id: 2, title: 'UAV-002', type: 'uav', status: 'Hibernating', href: '/uavs/2' },
    { id: 3, title: 'UAV-003', type: 'uav', status: 'Charging', href: '/uavs/3' },
    { id: 4, title: 'UAV-004', type: 'uav', status: 'Maintenance', href: '/uavs/4' },
  ]
}

export function SearchCommand({ onClose, className }: SearchCommandProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const filtered = [
      ...searchData.suggestions,
      ...searchData.uavs
    ].filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )

    setResults(filtered)
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [results, selectedIndex, onClose])

  const handleSelect = (item: any) => {
    // Navigate to the selected item
    window.location.href = item.href
    onClose?.()
  }

  const getItemIcon = (item: any) => {
    if (item.icon) return item.icon
    
    switch (item.type) {
      case 'uav':
        return Plane
      case 'page':
        return FileText
      default:
        return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'hibernating':
        return 'bg-blue-100 text-blue-800'
      case 'charging':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Search</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search UAVs, pages, settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="h-96">
        <div className="p-4 space-y-4">
          {!query.trim() ? (
            <>
              {/* Recent Searches */}
              {searchData.recent.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent
                  </h3>
                  <div className="space-y-1">
                    {searchData.recent.map((item, index) => {
                      const Icon = getItemIcon(item)
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent text-left transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.title}</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {searchData.suggestions.slice(0, 6).map((item) => {
                    const Icon = getItemIcon(item)
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Search Results */}
              {results.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Results ({results.length})
                  </h3>
                  <div className="space-y-1">
                    {results.map((item, index) => {
                      const Icon = getItemIcon(item)
                      const isSelected = index === selectedIndex
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={cn(
                              'h-4 w-4',
                              isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                            )} />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{item.title}</span>
                              {item.status && (
                                <Badge 
                                  variant="outline" 
                                  className={cn('text-xs mt-1', getStatusColor(item.status))}
                                >
                                  {item.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ArrowRight className={cn(
                            'h-3 w-3',
                            isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                          )} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results found for "{query}"</p>
                  <p className="text-xs mt-1">Try searching for UAVs, pages, or settings</p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Use ↑↓ to navigate, ↵ to select, ESC to close</span>
          <div className="flex items-center space-x-2">
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">K</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}
