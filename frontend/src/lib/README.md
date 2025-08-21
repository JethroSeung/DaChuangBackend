# Lib Directory

This directory contains utility functions, configurations, and shared libraries used throughout the application.

## Directory Structure

```
lib/
├── error-handling.ts     # Enhanced error handling utilities
├── utils.ts             # General utility functions
├── validations.ts       # Form validation schemas
├── constants.ts         # Application constants
├── api-client.ts        # API client configuration
├── date-utils.ts        # Date manipulation utilities
└── format-utils.ts      # Data formatting utilities
```

## Core Utilities

### `error-handling.ts`
Comprehensive error handling system with custom error types and retry mechanisms.

#### Custom Error Classes
```typescript
// Specific error types for different scenarios
class NetworkError extends AppError
class TimeoutError extends AppError
class ValidationError extends AppError
class AuthenticationError extends AppError
class AuthorizationError extends AppError
```

#### Enhanced Retry Logic
```typescript
// Retry with exponential backoff
await withRetry(
  () => fetchData(),
  {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error) => error instanceof NetworkError
  }
)
```

#### Timeout Handling
```typescript
// Add timeout to any promise
const result = await withTimeout(
  fetchData(),
  30000,
  'Operation timed out after 30 seconds'
)
```

#### Safe Async Operations
```typescript
// Safe execution with fallback
const result = await safeAsync(
  () => riskyOperation(),
  {
    fallback: defaultValue,
    showToast: true,
    context: 'UAV data fetch'
  }
)
```

#### Error Toast Management
```typescript
// Smart error message display
showErrorToast(error) // Automatically formats based on error type
```

#### Loading State Management
```typescript
// Global loading state manager
const loadingManager = new LoadingManager()
loadingManager.setLoading('uav-fetch', true)
```

### `utils.ts`
General utility functions for common operations.

#### Class Name Utilities
```typescript
// Conditional class names with Tailwind CSS
const className = cn(
  'base-class',
  condition && 'conditional-class',
  variant === 'primary' && 'primary-class'
)
```

#### Data Manipulation
```typescript
// Array utilities
const uniqueItems = removeDuplicates(array)
const groupedData = groupBy(array, 'category')
const sortedData = sortBy(array, 'name')

// Object utilities
const cleanObject = removeEmpty(object)
const deepCopy = deepClone(object)
```

#### String Utilities
```typescript
// String formatting
const slug = slugify('Hello World') // 'hello-world'
const truncated = truncate(text, 100)
const capitalized = capitalize('hello world') // 'Hello World'
```

### `validations.ts`
Zod validation schemas for forms and data validation.

#### Common Schemas
```typescript
// User validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER'])
})

// UAV validation
const uavSchema = z.object({
  rfid: z.string().min(1),
  model: z.string().min(1),
  batteryLevel: z.number().min(0).max(100)
})

// Settings validation
const settingsSchema = z.object({
  systemName: z.string().min(1),
  timezone: z.string(),
  autoRefresh: z.boolean()
})
```

#### Validation Utilities
```typescript
// Validate data with error handling
const { data, errors } = validateWithSchema(userSchema, formData)

// Async validation
const isValid = await validateAsync(schema, data)
```

### `constants.ts`
Application-wide constants and configuration values.

#### API Constants
```typescript
export const API_ENDPOINTS = {
  UAVS: '/api/uavs',
  DOCKING_STATIONS: '/api/docking-stations',
  BATTERY: '/api/battery',
  USERS: '/api/users'
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const
```

#### UI Constants
```typescript
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280
} as const

export const COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444'
} as const
```

#### Business Logic Constants
```typescript
export const UAV_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  HIBERNATING: 'HIBERNATING'
} as const

export const BATTERY_THRESHOLDS = {
  LOW: 20,
  CRITICAL: 10,
  FULL: 100
} as const
```

### `api-client.ts`
Centralized API client configuration with error handling.

#### Client Configuration
```typescript
// Axios instance with interceptors
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for auth
apiClient.interceptors.request.use(addAuthToken)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => handleApiError(error)
)
```

#### API Methods
```typescript
// Generic CRUD operations
export const api = {
  get: <T>(url: string) => apiClient.get<T>(url),
  post: <T>(url: string, data: any) => apiClient.post<T>(url, data),
  put: <T>(url: string, data: any) => apiClient.put<T>(url, data),
  delete: (url: string) => apiClient.delete(url)
}
```

### `date-utils.ts`
Date manipulation and formatting utilities.

#### Date Formatting
```typescript
// Human-readable date formats
const formatted = formatDate(date, 'MMM dd, yyyy') // 'Jan 15, 2024'
const relative = formatRelativeTime(date) // '2 hours ago'
const duration = formatDuration(milliseconds) // '2h 30m'
```

#### Date Calculations
```typescript
// Date arithmetic
const tomorrow = addDays(new Date(), 1)
const lastWeek = subDays(new Date(), 7)
const daysDiff = differenceInDays(date1, date2)
```

### `format-utils.ts`
Data formatting utilities for display purposes.

#### Number Formatting
```typescript
// Number formatting
const currency = formatCurrency(1234.56) // '$1,234.56'
const percentage = formatPercentage(0.1234) // '12.34%'
const fileSize = formatFileSize(1024) // '1 KB'
```

#### Data Formatting
```typescript
// Complex data formatting
const batteryDisplay = formatBatteryLevel(85) // '85% (Good)'
const statusDisplay = formatUAVStatus('ACTIVE') // 'Active'
const coordinatesDisplay = formatCoordinates(lat, lng) // '40.7128°N, 74.0060°W'
```

## Utility Categories

### 1. Error Handling
- Custom error classes
- Retry mechanisms
- Timeout handling
- Error boundaries integration

### 2. Data Validation
- Zod schema definitions
- Form validation utilities
- Data sanitization

### 3. API Integration
- HTTP client configuration
- Request/response interceptors
- Error handling

### 4. Data Manipulation
- Array and object utilities
- String formatting
- Date calculations

### 5. UI Utilities
- Class name management
- Responsive utilities
- Theme utilities

## Best Practices

### 1. Pure Functions
Utility functions should be pure and predictable:

```typescript
// Good: Pure function
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Avoid: Side effects
export function logAndFormat(amount: number): string {
  console.log(amount) // Side effect
  return formatCurrency(amount)
}
```

### 2. Type Safety
Always use TypeScript for type safety:

```typescript
// Good: Typed utility
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  // Implementation
}

// Avoid: Untyped utility
export function groupBy(array, key) {
  // Implementation
}
```

### 3. Error Handling
Include proper error handling in utilities:

```typescript
// Good: Error handling
export function parseJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}
```

### 4. Documentation
Include JSDoc comments for complex utilities:

```typescript
/**
 * Retries an async operation with exponential backoff
 * @param operation - The async operation to retry
 * @param config - Retry configuration options
 * @returns Promise that resolves with the operation result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  // Implementation
}
```

## Testing Utilities

### Unit Testing
```typescript
import { formatCurrency, withRetry } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
})

describe('withRetry', () => {
  it('should retry failed operations', async () => {
    let attempts = 0
    const operation = () => {
      attempts++
      if (attempts < 3) throw new Error('Failed')
      return Promise.resolve('Success')
    }

    const result = await withRetry(operation, { maxAttempts: 3 })
    expect(result).toBe('Success')
    expect(attempts).toBe(3)
  })
})
```

## Contributing

When adding new utilities:

1. **Choose the right file** based on utility purpose
2. **Follow naming conventions** (camelCase for functions)
3. **Include TypeScript types** for all parameters and return values
4. **Add JSDoc documentation** for complex functions
5. **Write unit tests** for utility functions
6. **Consider performance** implications
7. **Keep functions pure** when possible
8. **Update this README** when adding new categories
