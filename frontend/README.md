# UAV Docking Management System - Frontend

A modern, responsive web application for managing UAV fleets with real-time monitoring, docking station management, and comprehensive analytics.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time UAV fleet overview with metrics and system health monitoring
- **UAV Management**: Complete CRUD operations for UAV fleet management
- **Interactive Map**: Real-time UAV tracking and location visualization
- **Hibernate Pod**: UAV hibernation and storage management
- **Docking Stations**: Monitor and manage UAV docking station network
- **Battery Monitor**: Comprehensive battery level tracking and alerts
- **Flight Logs**: Complete flight history and mission log management
- **Analytics**: Advanced performance analytics with charts and insights
- **Alerts**: Real-time alert management and notification system
- **Regions**: Operational region management with geofencing
- **User Management**: Complete user account and permission management
- **Settings**: Comprehensive system configuration and preferences

### Technical Features
- **Responsive Design**: Mobile-first approach with dedicated mobile components
- **Real-time Updates**: WebSocket integration for live data updates
- **State Management**: Zustand stores for efficient state management
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Enhanced Error Handling**: Comprehensive error boundaries, retry mechanisms, and timeout handling
- **Advanced Loading States**: Multiple loading indicators with timeout detection and user feedback
- **Internationalization**: Multi-language support with i18next
- **Form Validation**: Robust form handling with real-time validation
- **Search & Filtering**: Advanced search and filtering capabilities across all data views

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand with Immer
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Internationalization**: i18next with react-i18next
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Maps**: React Leaflet for interactive maps
- **HTTP Client**: Axios with enhanced error handling

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── uavs/             # UAV management page
│   ├── map/              # Interactive map page
│   ├── hibernate-pod/    # Hibernate pod management
│   ├── docking-stations/ # Docking stations page
│   ├── battery/          # Battery monitoring page
│   ├── flight-logs/      # Flight history and mission logs
│   ├── analytics/        # Performance analytics and insights
│   ├── alerts/           # Alert management and notifications
│   ├── regions/          # Operational region management
│   ├── users/            # User account and permission management
│   ├── settings/         # System configuration and preferences
│   ├── error-demo/       # Error handling demonstration page
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page (redirects to dashboard)
├── components/
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── layout/           # Layout components (header, sidebar, etc.)
│   ├── features/         # Feature-specific components
│   ├── demo/             # Demo components for testing
│   └── providers/        # React context providers
├── stores/               # Zustand state stores
├── types/                # TypeScript type definitions
├── api/                  # API client functions
├── hooks/                # Custom React hooks (including async operations)
├── lib/                  # Utility functions and error handling
├── i18n/                 # Internationalization configuration
└── locales/              # Translation files
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 📊 State Management

### Zustand Stores

**UAV Store** (`useUAVStore`)
- UAV CRUD operations
- Filtering and search
- Hibernate pod management
- Real-time updates

**Dashboard Store** (`useDashboardStore`)
- System metrics
- Alert management
- System health monitoring
- Chart data

## 🛡️ Error Handling & Async Operations

### Enhanced Error Handling
- **Custom Error Classes**: Specific error types for different scenarios (NetworkError, TimeoutError, ValidationError, etc.)
- **Retry Mechanisms**: Exponential backoff with configurable retry policies
- **Timeout Handling**: Configurable timeouts with user feedback
- **Error Boundaries**: React error boundaries for graceful error recovery
- **User Feedback**: Toast notifications with contextual error messages

### Async Operation Hooks
- **useAsyncOperation**: Enhanced hook for managing async operations with loading states and error handling
- **usePolling**: Hook for polling data with automatic retry and error handling
- **useAsyncOperations**: Hook for managing multiple concurrent async operations

### Loading States
- **Multiple Variants**: Spinner, dots, pulse, and skeleton loading indicators
- **Timeout Detection**: Automatic timeout detection with user feedback
- **Progress Tracking**: Progressive loading with step-by-step feedback
- **Network Status**: Real-time network connectivity monitoring

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach**: Optimized for mobile devices
- **Breakpoint system**: Consistent responsive behavior
- **Mobile components**: Dedicated mobile UI components
- **Touch-friendly**: Optimized for touch interactions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set the following for production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   npx kill-port 3000
   ```

2. **Module not found errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📈 Current Implementation Status

✅ **Completed Features:**
- Complete page structure with all routes (12 main pages)
- Responsive design with mobile components
- State management with Zustand stores
- TypeScript type definitions
- API client architecture with enhanced error handling
- UI component library setup (shadcn/ui)
- Provider configuration
- Comprehensive error handling with retry mechanisms
- Advanced loading states with timeout detection
- Internationalization (i18n) support
- Form validation with React Hook Form + Zod
- Search and filtering functionality across all pages
- Mock data implementations for all features
- User management with role-based access
- Settings management with form state tracking
- Analytics dashboard with charts and metrics
- Flight logs with detailed history tracking
- Regional management with geofencing concepts
- Alert system with notification management

🚧 **Ready for Backend Integration:**
- Real-time WebSocket connections (structure ready)
- API endpoints (client architecture complete)
- Authentication system (UI ready)
- File upload functionality (components ready)

🔧 **Future Enhancements:**
- Real map integration with live GPS data
- Advanced chart customization
- Push notification service
- Offline mode support
- Advanced user permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request
