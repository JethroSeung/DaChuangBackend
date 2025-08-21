# Hooks Directory

This directory contains custom React hooks that provide reusable logic for the UAV management application.

## Available Hooks

### Core Hooks

#### `use-responsive.ts`
Responsive design hook for detecting screen sizes and device types.

```typescript
const { isMobile, isTablet, isDesktop } = useResponsive()
```

**Features:**
- Breakpoint detection (mobile, tablet, desktop)
- Real-time screen size monitoring
- SSR-safe implementation

### Enhanced Async Operations

#### `use-async-operation.ts`
Comprehensive hook for managing async operations with advanced error handling and loading states.

```typescript
const { data, loading, error, execute, retry, reset, cancel } = useAsyncOperation(
  async () => fetchUAVData(),
  {
    timeout: 30000,
    retryConfig: { maxAttempts: 3, baseDelay: 1000 },
    showErrorToast: true,
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error)
  }
)
```

**Features:**
- Automatic retry with exponential backoff
- Configurable timeouts
- Loading state management
- Error handling with custom error types
- Toast notifications
- Request cancellation
- Success/error callbacks

**Additional Hooks:**
- `useAsyncOperations`: Manage multiple concurrent async operations
- `usePolling`: Polling data with automatic retry and error handling

### Form Hooks

#### Form Management
Custom hooks for form handling, validation, and state management.

```typescript
const { register, handleSubmit, errors, isValid } = useFormValidation(schema)
```

**Features:**
- Integration with React Hook Form
- Zod schema validation
- Real-time validation feedback
- Error message handling

### State Management Hooks

#### Local Storage Hooks
Hooks for persisting state to localStorage with SSR safety.

```typescript
const [value, setValue] = useLocalStorage('key', defaultValue)
```

**Features:**
- SSR-safe implementation
- Automatic serialization/deserialization
- Type safety with TypeScript

#### Session Management
Hooks for managing user sessions and authentication state.

```typescript
const { user, isAuthenticated, login, logout } = useAuth()
```

### UI Interaction Hooks

#### Modal Management
Hooks for managing modal and dialog states.

```typescript
const { isOpen, open, close, toggle } = useModal()
```

#### Toast Notifications
Enhanced toast notification management.

```typescript
const { showSuccess, showError, showWarning, showInfo } = useToast()
```

## Hook Categories

### 1. Data Fetching & API
- `use-async-operation.ts` - Enhanced async operations
- `use-polling.ts` - Data polling with error handling
- `use-api-client.ts` - API client integration

### 2. UI & Interaction
- `use-responsive.ts` - Responsive design detection
- `use-modal.ts` - Modal state management
- `use-toast.ts` - Toast notifications
- `use-theme.ts` - Theme and dark mode

### 3. Form & Validation
- `use-form-validation.ts` - Form validation with Zod
- `use-debounce.ts` - Input debouncing
- `use-search.ts` - Search functionality

### 4. State & Storage
- `use-local-storage.ts` - localStorage integration
- `use-session-storage.ts` - sessionStorage integration
- `use-auth.ts` - Authentication state

### 5. Performance & Optimization
- `use-debounce.ts` - Value debouncing
- `use-throttle.ts` - Function throttling
- `use-memo-compare.ts` - Deep comparison memoization

## Hook Design Patterns

### 1. Return Object Pattern
```typescript
export function useCustomHook() {
  return {
    data,
    loading,
    error,
    actions: {
      fetch,
      reset,
      retry
    }
  }
}
```

### 2. Configuration Object Pattern
```typescript
export function useAsyncOperation(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  // Implementation
}
```

### 3. State and Actions Pattern
```typescript
export function useModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  }
}
```

## Error Handling in Hooks

### Custom Error Types
```typescript
import { AppError, NetworkError, TimeoutError } from '@/lib/error-handling'

// Hooks should handle and transform errors appropriately
const error = parseApiError(rawError)
```

### Error Boundaries Integration
```typescript
// Hooks should work with React Error Boundaries
const { data, error } = useAsyncOperation(operation, {
  onError: (error) => {
    if (error.code === 'CRITICAL_ERROR') {
      throw error // Let error boundary handle it
    }
  }
})
```

## Testing Hooks

### Unit Testing
```typescript
import { renderHook, act } from '@testing-library/react'
import { useAsyncOperation } from './use-async-operation'

test('should handle async operation', async () => {
  const { result } = renderHook(() => 
    useAsyncOperation(() => Promise.resolve('data'))
  )
  
  act(() => {
    result.current.execute()
  })
  
  await waitFor(() => {
    expect(result.current.data).toBe('data')
  })
})
```

### Integration Testing
```typescript
// Test hooks within component context
const TestComponent = () => {
  const { data, loading } = useAsyncOperation(fetchData)
  return <div>{loading ? 'Loading...' : data}</div>
}
```

## Best Practices

### 1. Single Responsibility
Each hook should have one clear purpose and responsibility.

### 2. Consistent API
Follow consistent patterns for hook APIs across the application.

### 3. Error Handling
Always include proper error handling and user feedback.

### 4. TypeScript
Use TypeScript for type safety and better developer experience.

### 5. Documentation
Include JSDoc comments and usage examples.

### 6. Testing
Write comprehensive tests for hook logic and edge cases.

### 7. Performance
Consider performance implications and use optimization techniques when needed.

## Usage Guidelines

### Import Patterns
```typescript
// Named imports for specific hooks
import { useAsyncOperation } from '@/hooks/use-async-operation'

// Grouped imports for related hooks
import { useModal, useToast } from '@/hooks/ui'
```

### Dependency Management
```typescript
// Proper dependency arrays
useEffect(() => {
  // Effect logic
}, [dependency1, dependency2])

// Stable references
const stableCallback = useCallback(() => {
  // Callback logic
}, [dependencies])
```

### Cleanup
```typescript
// Always cleanup subscriptions and timers
useEffect(() => {
  const subscription = subscribe()
  
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## Contributing

When creating new hooks:

1. **Follow naming conventions** (`use-` prefix, kebab-case files)
2. **Include TypeScript types** for all parameters and return values
3. **Add comprehensive documentation** with examples
4. **Write unit tests** for hook functionality
5. **Consider performance implications** and optimization
6. **Handle errors gracefully** with proper user feedback
7. **Update this README** when adding new categories or patterns
