// Re-export all types for easy importing
export * from './uav'
export * from './dashboard'
export * from './api'

// Common utility types
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableColumn<T = unknown> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface LoadingState {
  loading: boolean
  error?: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

export interface PaginationState {
  page: number
  limit: number
  total: number
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  [key: string]: unknown
}

export interface SearchState {
  query: string
  results: unknown[]
  loading: boolean
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ResponsiveProps {
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
}

export interface AnimationProps {
  animate?: boolean
  duration?: number
  delay?: number
  easing?: string
}

// Theme and styling types
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  destructive: string
  warning: string
  success: string
}

export interface Breakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<Record<string, unknown>>
  description?: string
  badge?: string | number
  children?: NavigationItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

// Form types
export interface FormErrors {
  [field: string]: string | string[]
}

export interface FormState<T> {
  values: T
  errors: FormErrors
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// Chart and visualization types
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  data: unknown[]
  xAxis?: string
  yAxis?: string
  colors?: string[]
  responsive?: boolean
  legend?: boolean
  tooltip?: boolean
}

export interface MapConfig {
  center: [number, number]
  zoom: number
  layers: string[]
  markers?: MapMarker[]
  polygons?: MapPolygon[]
}

export interface MapMarker {
  id: string
  position: [number, number]
  popup?: string
  icon?: string
  color?: string
}

export interface MapPolygon {
  id: string
  coordinates: [number, number][]
  color?: string
  fillColor?: string
  opacity?: number
}
