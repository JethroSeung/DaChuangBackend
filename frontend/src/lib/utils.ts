import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Number formatting utilities
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  return Math.round((value / total) * 100) + '%'
}

// Time formatting utilities
export function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return time.toLocaleDateString()
}

// Date formatting utilities
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Status utilities
export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    AUTHORIZED: 'default',
    UNAUTHORIZED: 'destructive',
    HIBERNATING: 'secondary',
    CHARGING: 'outline',
    MAINTENANCE: 'outline',
    EMERGENCY: 'destructive',
    READY: 'default',
    IN_FLIGHT: 'default',
    OUT_OF_SERVICE: 'secondary',
    healthy: 'default',
    warning: 'outline',
    critical: 'destructive',
  };

  return statusVariants[status] || 'secondary';
}

// Chart color utilities
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
}
