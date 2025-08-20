import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString();
  }
}

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

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Number formatting utilities
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// String utilities
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Status utilities
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    AUTHORIZED: 'text-green-600 bg-green-100 border-green-200',
    UNAUTHORIZED: 'text-red-600 bg-red-100 border-red-200',
    HIBERNATING: 'text-purple-600 bg-purple-100 border-purple-200',
    CHARGING: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    MAINTENANCE: 'text-orange-600 bg-orange-100 border-orange-200',
    EMERGENCY: 'text-red-800 bg-red-200 border-red-300',
    READY: 'text-blue-600 bg-blue-100 border-blue-200',
    IN_FLIGHT: 'text-indigo-600 bg-indigo-100 border-indigo-200',
    OUT_OF_SERVICE: 'text-gray-600 bg-gray-100 border-gray-200',
  };

  return statusColors[status] || 'text-gray-600 bg-gray-100 border-gray-200';
}

export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' {
  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
    AUTHORIZED: 'success',
    UNAUTHORIZED: 'destructive',
    HIBERNATING: 'secondary',
    CHARGING: 'warning',
    MAINTENANCE: 'warning',
    EMERGENCY: 'destructive',
    READY: 'info',
    IN_FLIGHT: 'info',
    OUT_OF_SERVICE: 'secondary',
  };

  return statusVariants[status] || 'secondary';
}

export function getBatteryColor(percentage: number): string {
  if (percentage > 50) return 'text-green-600';
  if (percentage > 20) return 'text-yellow-600';
  return 'text-red-600';
}

export function getBatteryIcon(percentage: number): string {
  if (percentage > 75) return 'battery-full';
  if (percentage > 50) return 'battery-three-quarters';
  if (percentage > 25) return 'battery-half';
  if (percentage > 10) return 'battery-quarter';
  return 'battery-empty';
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidRFID(rfid: string): boolean {
  // RFID should be alphanumeric with hyphens and underscores, 3-50 characters
  const rfidRegex = /^[A-Za-z0-9-_]{3,50}$/;
  return rfidRegex.test(rfid);
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
}

// URL utilities
export function createSearchParams(params: Record<string, any>): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams;
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

// Color utilities for charts
export const chartColors = {
  primary: '#3498db',
  secondary: '#2c3e50',
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
};

export function generateChartColors(count: number): string[] {
  const baseColors = Object.values(chartColors);
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
}
