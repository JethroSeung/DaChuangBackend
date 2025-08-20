# UAV Docking Management System - Frontend

A modern Next.js frontend application for the UAV Docking Management System, featuring real-time monitoring, fleet management, and interactive mapping capabilities.

## 🚀 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Real-time**: Socket.IO
- **Maps**: Leaflet with React Leaflet
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest, React Testing Library, Playwright

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Spring Boot backend running on port 8080

## 🛠️ Installation

1. **Clone and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_WS_URL=ws://localhost:8080
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── uavs/              # UAV management pages
│   │   ├── map/               # Map view page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   └── features/          # Feature-specific components
│   ├── stores/                # Zustand stores
│   │   ├── uav-store.ts       # UAV management state
│   │   └── dashboard-store.ts # Dashboard state
│   ├── api/                   # API client and services
│   ├── types/                 # TypeScript type definitions
│   ├── lib/                   # Utility functions
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
├── components.json            # shadcn/ui configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run e2e` - Run end-to-end tests
- `npm run storybook` - Start Storybook

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible UI components. Key components include:

- **Layout**: Header, Sidebar, Navigation
- **Data Display**: Cards, Tables, Charts, Badges
- **Forms**: Input, Select, Checkbox, Radio
- **Feedback**: Alerts, Toasts, Loading states
- **Overlays**: Modals, Dropdowns, Tooltips

## 📊 State Management

The application uses Zustand for state management with the following stores:

### UAV Store (`useUAVStore`)
- UAV CRUD operations
- Region management
- Hibernate pod operations
- Real-time UAV updates

### Dashboard Store (`useDashboardStore`)
- System metrics
- Real-time alerts
- Connection status
- Chart data

## 🔌 API Integration

The frontend communicates with the Spring Boot backend through:

- **REST API**: CRUD operations and data fetching
- **WebSocket**: Real-time updates and notifications
- **GraphQL**: Complex queries (if implemented)

### API Client Features
- Automatic request/response interceptors
- Error handling and retry logic
- Authentication token management
- Request caching with React Query

## 🗺️ Features

### Dashboard
- Real-time system metrics
- UAV status overview
- Active flight monitoring
- System alerts and notifications

### UAV Management
- Complete UAV lifecycle management
- Region assignment
- Status tracking
- Bulk operations

### Map View
- Real-time UAV tracking
- Geofence management
- Interactive markers
- Flight path visualization

### Hibernate Pod
- Capacity management
- UAV hibernation control
- Status monitoring

## 🔄 Real-time Updates

The application maintains real-time connectivity through WebSocket connections:

- **System Status**: Live metrics and health monitoring
- **UAV Tracking**: Real-time location and status updates
- **Alerts**: Instant notifications for critical events
- **Battery Monitoring**: Live battery status and alerts

## 🎯 Migration from Original Frontend

This Next.js application replaces the original Thymeleaf-based frontend while maintaining 100% feature parity:

### Migrated Features
- ✅ Dashboard with real-time metrics
- ✅ UAV management (CRUD operations)
- ✅ Interactive map with Leaflet
- ✅ Hibernate pod management
- ✅ Real-time WebSocket updates
- ✅ Responsive design
- ✅ Modern UI components

### Enhanced Features
- 🚀 Improved performance with Next.js
- 🎨 Modern UI with shadcn/ui
- 📱 Better mobile responsiveness
- 🔄 Optimistic updates
- 🧪 Comprehensive testing
- 📊 Enhanced data visualization

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run e2e
```

### Test Coverage
```bash
npm run test:ci
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
docker build -t uav-frontend .
docker run -p 3000:3000 uav-frontend
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-websocket-domain.com
```

## 🔧 Configuration

### Tailwind CSS
Custom theme configuration in `tailwind.config.js` includes:
- UAV-specific color palette
- Custom animations
- Responsive breakpoints
- Component utilities

### Next.js
Configuration in `next.config.js` includes:
- API proxy to backend
- Image optimization
- Security headers
- Build optimization

## 🤝 Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages
5. Ensure all tests pass

## 📝 License

This project is part of the UAV Docking Management System.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Note**: This frontend application requires the Spring Boot backend to be running for full functionality. Ensure the backend is accessible at the configured API URL.
