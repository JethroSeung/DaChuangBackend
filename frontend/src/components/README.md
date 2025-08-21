# Components Directory

This directory contains all React components organized by purpose and functionality.

## Directory Structure

```
components/
├── ui/                 # Reusable UI components (shadcn/ui based)
├── layout/            # Layout-specific components
├── features/          # Feature-specific components
├── demo/              # Demo and testing components
└── providers/         # React context providers
```

## UI Components (`ui/`)

Base UI components built on top of shadcn/ui and Radix UI primitives:

### Core Components
- **Button**: Primary, secondary, outline, ghost, and destructive variants
- **Input**: Text inputs with validation states
- **Card**: Container component with header, content, and footer sections
- **Badge**: Status indicators and labels
- **Switch**: Toggle switches for boolean settings
- **Progress**: Progress bars for loading states
- **Separator**: Visual dividers

### Enhanced Components
- **enhanced-loading.tsx**: Advanced loading components with multiple variants
  - `EnhancedLoading`: Configurable loading indicator with timeout support
  - `LoadingOverlay`: Overlay loading state for existing content
  - `LoadingSkeleton`: Skeleton loading placeholders
  - `NetworkStatus`: Network connectivity indicator
  - `ProgressiveLoading`: Step-by-step loading progress

### Form Components
- Form validation and input components
- Error display components
- Field wrappers with labels and help text

## Layout Components (`layout/`)

Components that define the application structure:

### Core Layout
- **app-layout.tsx**: Main application layout wrapper
- **header.tsx**: Top navigation bar with search and user menu
- **sidebar.tsx**: Main navigation sidebar
- **mobile-sidebar.tsx**: Mobile-optimized sidebar

### Navigation
- **navigation-menu.tsx**: Main navigation menu component
- **breadcrumbs.tsx**: Breadcrumb navigation
- **user-menu.tsx**: User account dropdown menu

## Feature Components (`features/`)

Domain-specific components organized by feature area:

### UAV Management (`features/uav/`)
- UAV list and grid views
- UAV detail cards
- UAV status indicators
- Mobile UAV management components

### Dashboard (`features/dashboard/`)
- Metric cards and widgets
- Chart components
- System status indicators
- Alert summaries

### Map (`features/map/`)
- Interactive map components
- UAV markers and overlays
- Location tracking components

### Battery (`features/battery/`)
- Battery level indicators
- Battery status cards
- Charging station components

### Docking (`features/docking/`)
- Docking station status
- Station management components
- Capacity indicators

## Demo Components (`demo/`)

Testing and demonstration components:

- **error-handling-demo.tsx**: Comprehensive demo of error handling and loading states
  - Network error simulation
  - Timeout handling demonstration
  - Loading state variants
  - Retry mechanism testing
  - Progressive loading examples

## Providers (`providers/`)

React context providers for global state management:

### Core Providers
- **query-provider.tsx**: TanStack Query client provider
- **theme-provider.tsx**: Theme and dark mode provider
- **i18n-provider.tsx**: Internationalization provider

### State Providers
- Global state management providers
- Authentication context providers
- WebSocket connection providers

## Component Guidelines

### Naming Conventions
- Use PascalCase for component names
- Use kebab-case for file names
- Prefix feature components with feature name

### Structure
```typescript
// Component structure template
interface ComponentProps {
  // Props interface
}

export function ComponentName({ ...props }: ComponentProps) {
  // Component implementation
}

// Export default if main component
export default ComponentName
```

### Best Practices
1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition**: Prefer composition over inheritance
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Error Boundaries**: Wrap components that might fail
5. **Loading States**: Include loading and error states
6. **Accessibility**: Follow ARIA guidelines and semantic HTML
7. **Responsive Design**: Ensure components work on all screen sizes

### Testing
- Unit tests for component logic
- Integration tests for component interactions
- Visual regression tests for UI components
- Accessibility tests for compliance

## Usage Examples

### Basic UI Component
```typescript
import { Button } from '@/components/ui/button'

<Button variant="primary" size="lg">
  Click me
</Button>
```

### Enhanced Loading
```typescript
import { EnhancedLoading } from '@/components/ui/enhanced-loading'

<EnhancedLoading
  message="Loading UAV data..."
  timeout={30000}
  onTimeout={() => console.log('Timeout!')}
  variant="spinner"
/>
```

### Feature Component
```typescript
import { UAVCard } from '@/components/features/uav/uav-card'

<UAVCard
  uav={uavData}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Dependencies

### Core Dependencies
- React 18+
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Lucide React (icons)

### Enhanced Features
- Framer Motion (animations)
- React Hook Form (forms)
- Zod (validation)
- i18next (internationalization)

## Contributing

When adding new components:

1. **Choose the right directory** based on component purpose
2. **Follow naming conventions** and file structure
3. **Include TypeScript interfaces** for all props
4. **Add proper documentation** with JSDoc comments
5. **Include usage examples** in component files
6. **Write tests** for component functionality
7. **Update this README** if adding new categories
