# App Directory

This directory contains all the pages and routes for the UAV Docking Management System using Next.js App Router.

## Directory Structure

```
app/
├── dashboard/          # Main dashboard page
├── uavs/              # UAV fleet management
├── map/               # Interactive map view
├── hibernate-pod/     # UAV hibernation management
├── docking-stations/  # Docking station management
├── battery/           # Battery monitoring
├── flight-logs/       # Flight history and logs
├── analytics/         # Performance analytics
├── alerts/            # Alert management
├── regions/           # Operational region management
├── users/             # User account management
├── settings/          # System configuration
├── error-demo/        # Error handling demonstration
├── layout.tsx         # Root layout with providers
├── page.tsx           # Home page (redirects to dashboard)
├── loading.tsx        # Global loading component
├── error.tsx          # Global error boundary
└── not-found.tsx      # 404 page
```

## Page Descriptions

### Dashboard (`/dashboard`)
**Purpose**: Main overview page with system metrics and real-time monitoring

**Features:**
- System health overview
- UAV fleet status summary
- Battery level monitoring
- Recent alerts and notifications
- Quick action buttons
- Real-time data updates

**Components:**
- Metric cards with trend indicators
- Status indicators for system health
- Recent activity feed
- Quick navigation shortcuts

### UAV Management (`/uavs`)
**Purpose**: Complete UAV fleet management interface

**Features:**
- UAV list with filtering and search
- Individual UAV status cards
- CRUD operations for UAV management
- Hibernate pod assignment
- Battery level monitoring
- Real-time status updates

**Components:**
- UAV grid/list view toggle
- Search and filter controls
- UAV detail cards
- Action buttons (edit, delete, hibernate)
- Mobile-optimized views

### Interactive Map (`/map`)
**Purpose**: Real-time UAV tracking and location visualization

**Features:**
- Interactive map with UAV markers
- Real-time position updates
- Flight path visualization
- Geofencing boundaries
- Docking station locations
- Weather overlay (planned)

**Components:**
- Leaflet map integration
- Custom UAV markers
- Control panels
- Layer toggles
- Location search

### Hibernate Pod (`/hibernate-pod`)
**Purpose**: UAV hibernation and storage management

**Features:**
- Pod capacity monitoring
- UAV assignment to pods
- Hibernation scheduling
- Pod status indicators
- Maintenance tracking

**Components:**
- Pod grid layout
- Capacity indicators
- Assignment controls
- Status badges
- Maintenance schedules

### Docking Stations (`/docking-stations`)
**Purpose**: Monitor and manage UAV docking station network

**Features:**
- Station status monitoring
- Capacity tracking
- Maintenance scheduling
- Performance metrics
- Location management

**Components:**
- Station grid view
- Status indicators
- Capacity meters
- Maintenance alerts
- Performance charts

### Battery Monitor (`/battery`)
**Purpose**: Comprehensive battery level tracking and management

**Features:**
- Real-time battery levels
- Charging status monitoring
- Battery health analytics
- Low battery alerts
- Charging station status

**Components:**
- Battery level indicators
- Charging progress bars
- Health metrics
- Alert notifications
- Historical data charts

### Flight Logs (`/flight-logs`)
**Purpose**: Complete flight history and mission log management

**Features:**
- Flight history with detailed logs
- Mission status tracking
- Duration and distance metrics
- Search and filtering
- Export functionality

**Components:**
- Log entry cards
- Status badges
- Search filters
- Export controls
- Pagination

### Analytics (`/analytics`)
**Purpose**: Advanced performance analytics with charts and insights

**Features:**
- Performance metrics and KPIs
- Interactive charts and graphs
- Trend analysis
- Comparative analytics
- Custom date ranges

**Components:**
- Metric cards with trends
- Interactive charts (Recharts)
- Performance summaries
- Recommendation engine
- Data export options

### Alerts (`/alerts`)
**Purpose**: Real-time alert management and notification system

**Features:**
- Alert list with priority levels
- Real-time notifications
- Alert categorization
- Acknowledgment tracking
- Alert history

**Components:**
- Alert cards with priority indicators
- Filter and search controls
- Notification badges
- Action buttons
- Alert details modal

### Regions (`/regions`)
**Purpose**: Operational region management with geofencing

**Features:**
- Region definition and management
- Geofencing boundaries
- UAV assignment to regions
- Region status monitoring
- Coverage analytics

**Components:**
- Region cards
- Type and status badges
- Coverage metrics
- UAV assignment lists
- Map integration (planned)

### User Management (`/users`)
**Purpose**: Complete user account and permission management

**Features:**
- User account management
- Role-based access control
- Permission assignment
- User activity tracking
- Account status management

**Components:**
- User cards with role badges
- Search and filter controls
- Permission matrices
- Status indicators
- Action menus

### Settings (`/settings`)
**Purpose**: Comprehensive system configuration and preferences

**Features:**
- Tabbed settings interface
- General system preferences
- Notification settings
- Security configuration
- Operational parameters
- System maintenance options

**Components:**
- Tabbed navigation
- Form controls with validation
- Toggle switches
- Dropdown selectors
- Save/reset functionality

### Error Demo (`/error-demo`)
**Purpose**: Demonstration of error handling and loading states

**Features:**
- Error simulation controls
- Loading state variants
- Retry mechanism testing
- Network status simulation
- Progressive loading examples

**Components:**
- Error simulation buttons
- Loading indicators
- Network status toggle
- Progress indicators
- Toast notifications

## Layout Structure

### Root Layout (`layout.tsx`)
**Purpose**: Main application wrapper with providers and global styles

**Providers:**
- TanStack Query client
- Theme provider (dark/light mode)
- i18n provider
- Toast notifications
- Error boundaries

**Global Components:**
- App layout wrapper
- Global loading states
- Error boundaries
- Theme switching

### Page Layout Pattern
Each page follows a consistent layout pattern:

```typescript
export default function PageName() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1>Page Title</h1>
            <p>Page description</p>
          </div>
          <div>
            {/* Action buttons */}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric cards */}
        </div>

        {/* Filters */}
        <Card>
          {/* Search and filter controls */}
        </Card>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Content cards or lists */}
        </div>
      </div>
    </AppLayout>
  )
}
```

## Routing Configuration

### Static Routes
All routes are statically defined in the file system:

- `/` → Redirects to `/dashboard`
- `/dashboard` → Dashboard page
- `/uavs` → UAV management
- `/map` → Interactive map
- `/hibernate-pod` → Hibernate pod management
- `/docking-stations` → Docking stations
- `/battery` → Battery monitoring
- `/flight-logs` → Flight logs
- `/analytics` → Analytics dashboard
- `/alerts` → Alert management
- `/regions` → Region management
- `/users` → User management
- `/settings` → System settings
- `/error-demo` → Error handling demo

### Dynamic Routes (Planned)
Future dynamic routes for detailed views:

- `/uavs/[id]` → Individual UAV details
- `/users/[id]` → User profile
- `/regions/[id]` → Region details
- `/docking-stations/[id]` → Station details

## Data Flow

### State Management
- **Global State**: Zustand stores for shared data
- **Local State**: React useState for component-specific data
- **Server State**: TanStack Query for API data
- **Form State**: React Hook Form for form management

### API Integration
- **Mock Data**: Currently using mock data for all features
- **API Client**: Axios-based client ready for backend integration
- **Error Handling**: Comprehensive error handling with retry logic
- **Loading States**: Enhanced loading indicators with timeout handling

## Mobile Responsiveness

All pages are fully responsive with:

- **Mobile-first design**: Optimized for mobile devices
- **Breakpoint system**: Consistent responsive behavior
- **Touch-friendly**: Optimized for touch interactions
- **Mobile components**: Dedicated mobile UI components where needed

## Testing Strategy

### Page Testing
- **Unit tests**: Component logic and interactions
- **Integration tests**: Page functionality and data flow
- **E2E tests**: Complete user workflows
- **Visual tests**: UI consistency and responsive design

### Test Structure
```
__tests__/
├── pages/
│   ├── dashboard.test.tsx
│   ├── uavs.test.tsx
│   └── ...
├── components/
└── utils/
```

## Performance Optimization

### Code Splitting
- **Route-based splitting**: Each page is a separate chunk
- **Component splitting**: Large components are lazy-loaded
- **Library splitting**: Third-party libraries are optimized

### Data Loading
- **Lazy loading**: Data loaded on demand
- **Caching**: TanStack Query caching for API responses
- **Prefetching**: Critical data prefetched on route changes

## Contributing

When adding new pages:

1. **Follow the directory structure** and naming conventions
2. **Use the consistent layout pattern** for page structure
3. **Include proper TypeScript types** for all data
4. **Add responsive design** for all screen sizes
5. **Include error handling** and loading states
6. **Write tests** for page functionality
7. **Update navigation** in the sidebar component
8. **Update this README** with page documentation
