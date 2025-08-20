# Frontend Components Documentation

## Overview

The frontend components are organized in a hierarchical structure following atomic design principles and feature-based organization. Components are built with React, TypeScript, and Tailwind CSS, using shadcn/ui as the base component library.

## Component Architecture

```
components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── features/              # Feature-specific components
│   ├── uav/              # UAV management components
│   ├── dashboard/        # Dashboard components
│   ├── map/              # Map and location components
│   └── auth/             # Authentication components
└── layout/               # Layout and navigation components
    ├── header.tsx
    ├── sidebar.tsx
    └── footer.tsx
```

## Component Categories

### 1. UI Components (`/ui`)

Base components from shadcn/ui library, customized for the UAV management system.

**Key Components**:
- `Button`: Primary action buttons with variants
- `Input`: Form input fields with validation
- `Dialog`: Modal dialogs and confirmations
- `Table`: Data tables with sorting and pagination
- `Card`: Content containers and information cards
- `Badge`: Status indicators and labels

**Usage Example**:
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';

function CreateUAVForm() {
  return (
    <Dialog>
      <Input placeholder="RFID Tag" />
      <Button variant="primary">Create UAV</Button>
    </Dialog>
  );
}
```

### 2. Feature Components (`/features`)

#### UAV Management (`/features/uav`)

**UAVList Component**
- **Purpose**: Displays paginated list of UAVs with filtering
- **Props**: 
  - `filter?: UAVFilter` - Filter criteria
  - `onUAVSelect?: (uav: UAV) => void` - Selection callback
  - `showActions?: boolean` - Show action buttons

**Usage**:
```tsx
import { UAVList } from '@/components/features/uav/UAVList';

function UAVManagementPage() {
  const [selectedUAV, setSelectedUAV] = useState<UAV | null>(null);
  
  return (
    <UAVList 
      filter={{ status: 'AUTHORIZED' }}
      onUAVSelect={setSelectedUAV}
      showActions={true}
    />
  );
}
```

**UAVCard Component**
- **Purpose**: Individual UAV information card
- **Props**:
  - `uav: UAV` - UAV data object
  - `onClick?: () => void` - Click handler
  - `showStatus?: boolean` - Display status badge
  - `compact?: boolean` - Compact layout mode

**Usage**:
```tsx
import { UAVCard } from '@/components/features/uav/UAVCard';

function UAVGrid({ uavs }: { uavs: UAV[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {uavs.map(uav => (
        <UAVCard 
          key={uav.id} 
          uav={uav} 
          showStatus={true}
          onClick={() => handleUAVClick(uav)}
        />
      ))}
    </div>
  );
}
```

**UAVForm Component**
- **Purpose**: Create/edit UAV form with validation
- **Props**:
  - `uav?: UAV` - Existing UAV for editing
  - `onSubmit: (data: UAVFormData) => void` - Form submission
  - `onCancel?: () => void` - Cancel handler
  - `loading?: boolean` - Loading state

**Usage**:
```tsx
import { UAVForm } from '@/components/features/uav/UAVForm';

function CreateUAVDialog() {
  const { createUAV } = useUAVStore();
  
  const handleSubmit = async (data: UAVFormData) => {
    await createUAV(data);
    onClose();
  };
  
  return (
    <Dialog>
      <UAVForm onSubmit={handleSubmit} onCancel={onClose} />
    </Dialog>
  );
}
```

#### Dashboard Components (`/features/dashboard`)

**SystemStats Component**
- **Purpose**: Displays system-wide statistics and metrics
- **Props**:
  - `refreshInterval?: number` - Auto-refresh interval in ms
  - `showCharts?: boolean` - Display chart visualizations

**Usage**:
```tsx
import { SystemStats } from '@/components/features/dashboard/SystemStats';

function DashboardPage() {
  return (
    <div className="space-y-6">
      <SystemStats refreshInterval={30000} showCharts={true} />
    </div>
  );
}
```

**UAVStatusGrid Component**
- **Purpose**: Grid view of UAV statuses with real-time updates
- **Props**:
  - `filter?: UAVFilter` - Filter criteria
  - `columns?: number` - Grid columns (responsive)
  - `showDetails?: boolean` - Show detailed information

**RecentActivity Component**
- **Purpose**: Timeline of recent system activities
- **Props**:
  - `limit?: number` - Number of activities to show
  - `types?: ActivityType[]` - Activity types to include

#### Map Components (`/features/map`)

**UAVMap Component**
- **Purpose**: Interactive map showing UAV locations
- **Props**:
  - `uavs: UAV[]` - UAVs to display
  - `center?: [number, number]` - Map center coordinates
  - `zoom?: number` - Initial zoom level
  - `showGeofences?: boolean` - Display geofences
  - `onUAVClick?: (uav: UAV) => void` - UAV marker click handler

**Usage**:
```tsx
import { UAVMap } from '@/components/features/map/UAVMap';

function MapView() {
  const { uavs } = useUAVStore();
  
  return (
    <UAVMap 
      uavs={uavs}
      center={[40.7589, -73.9851]}
      zoom={12}
      showGeofences={true}
      onUAVClick={handleUAVClick}
    />
  );
}
```

**GeofenceLayer Component**
- **Purpose**: Map layer for displaying geofences
- **Props**:
  - `geofences: Geofence[]` - Geofences to display
  - `interactive?: boolean` - Enable interaction
  - `onGeofenceClick?: (geofence: Geofence) => void` - Click handler

### 3. Layout Components (`/layout`)

**AppLayout Component**
- **Purpose**: Main application layout with navigation
- **Props**:
  - `children: ReactNode` - Page content
  - `title?: string` - Page title
  - `showSidebar?: boolean` - Show/hide sidebar

**Usage**:
```tsx
import { AppLayout } from '@/components/layout/AppLayout';

function Page() {
  return (
    <AppLayout title="UAV Management" showSidebar={true}>
      <div>Page content here</div>
    </AppLayout>
  );
}
```

**Header Component**
- **Purpose**: Application header with navigation and user menu
- **Props**:
  - `title?: string` - Application title
  - `showUserMenu?: boolean` - Show user menu
  - `actions?: ReactNode` - Additional header actions

**Sidebar Component**
- **Purpose**: Navigation sidebar with menu items
- **Props**:
  - `collapsed?: boolean` - Collapsed state
  - `onToggle?: () => void` - Toggle handler

## Component Patterns

### 1. Compound Components

```tsx
// UAVManagement compound component
<UAVManagement>
  <UAVManagement.Header />
  <UAVManagement.Filters />
  <UAVManagement.List />
  <UAVManagement.Pagination />
</UAVManagement>
```

### 2. Render Props Pattern

```tsx
interface DataFetcherProps<T> {
  children: (data: T[], loading: boolean, error: string | null) => ReactNode;
  fetcher: () => Promise<T[]>;
}

function DataFetcher<T>({ children, fetcher }: DataFetcherProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch logic...
  
  return children(data, loading, error);
}

// Usage
<DataFetcher fetcher={fetchUAVs}>
  {(uavs, loading, error) => (
    loading ? <Spinner /> : <UAVList uavs={uavs} />
  )}
</DataFetcher>
```

### 3. Custom Hooks Integration

```tsx
function UAVManagement() {
  const {
    uavs,
    loading,
    error,
    fetchUAVs,
    createUAV,
    updateUAV,
    deleteUAV
  } = useUAVStore();
  
  const {
    filter,
    setFilter,
    pagination,
    setPagination
  } = useFilters();
  
  // Component logic...
}
```

## Styling Guidelines

### 1. Tailwind CSS Classes

```tsx
// Consistent spacing and layout
<div className="space-y-4 p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Grid items */}
  </div>
</div>

// Responsive design
<div className="w-full sm:w-auto md:w-1/2 lg:w-1/3">
  {/* Responsive content */}
</div>

// Status-based styling
<Badge 
  className={cn(
    "text-xs font-medium",
    status === 'AUTHORIZED' && "bg-green-100 text-green-800",
    status === 'UNAUTHORIZED' && "bg-red-100 text-red-800"
  )}
>
  {status}
</Badge>
```

### 2. Component Variants

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        ghost: "hover:bg-gray-100"
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);
```

## State Management Integration

### 1. Zustand Store Usage

```tsx
function UAVList() {
  // Selective subscriptions for performance
  const uavs = useUAVStore(state => state.uavs);
  const loading = useUAVStore(state => state.loading);
  const fetchUAVs = useUAVStore(state => state.fetchUAVs);
  
  useEffect(() => {
    fetchUAVs();
  }, [fetchUAVs]);
  
  return (
    <div>
      {loading ? <Spinner /> : <UAVGrid uavs={uavs} />}
    </div>
  );
}
```

### 2. Real-time Updates

```tsx
function UAVStatusCard({ uav }: { uav: UAV }) {
  const updateUAVInStore = useUAVStore(state => state.updateUAVInStore);
  
  useEffect(() => {
    const unsubscribe = websocketService.subscribe(
      `uav.${uav.id}.status`,
      (updatedUAV) => updateUAVInStore(updatedUAV)
    );
    
    return unsubscribe;
  }, [uav.id, updateUAVInStore]);
  
  return <Card>{/* UAV status display */}</Card>;
}
```

## Testing Components

### 1. Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UAVCard } from './UAVCard';

describe('UAVCard', () => {
  const mockUAV = {
    id: 1,
    rfidTag: 'UAV-001',
    ownerName: 'John Doe',
    model: 'DJI Phantom 4',
    status: 'AUTHORIZED'
  };

  it('displays UAV information correctly', () => {
    render(<UAVCard uav={mockUAV} />);
    
    expect(screen.getByText('UAV-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('DJI Phantom 4')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<UAVCard uav={mockUAV} onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { UAVManagement } from './UAVManagement';
import { TestWrapper } from '@/test-utils';

describe('UAVManagement Integration', () => {
  it('loads and displays UAVs', async () => {
    render(
      <TestWrapper>
        <UAVManagement />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('UAV-001')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### 1. Memoization

```tsx
import { memo, useMemo } from 'react';

const UAVCard = memo(({ uav, onClick }: UAVCardProps) => {
  const statusColor = useMemo(() => {
    return uav.status === 'AUTHORIZED' ? 'green' : 'red';
  }, [uav.status]);
  
  return (
    <Card onClick={onClick}>
      <Badge color={statusColor}>{uav.status}</Badge>
    </Card>
  );
});
```

### 2. Virtual Scrolling

```tsx
import { FixedSizeList as List } from 'react-window';

function UAVVirtualList({ uavs }: { uavs: UAV[] }) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <UAVCard uav={uavs[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={uavs.length}
      itemSize={120}
    >
      {Row}
    </List>
  );
}
```

## Accessibility

### 1. ARIA Labels

```tsx
<button
  aria-label={`Edit UAV ${uav.rfidTag}`}
  aria-describedby={`uav-${uav.id}-description`}
>
  <EditIcon />
</button>
```

### 2. Keyboard Navigation

```tsx
function UAVList({ uavs }: { uavs: UAV[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        setFocusedIndex(prev => Math.min(prev + 1, uavs.length - 1));
        break;
      case 'ArrowUp':
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        handleUAVSelect(uavs[focusedIndex]);
        break;
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {/* UAV list items */}
    </div>
  );
}
```

## Error Boundaries

```tsx
class UAVErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UAV component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2>Something went wrong with the UAV component.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

This component architecture provides a scalable, maintainable, and user-friendly foundation for the UAV management system frontend.
