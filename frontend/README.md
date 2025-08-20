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

### Technical Features
- **Responsive Design**: Mobile-first approach with dedicated mobile components
- **Real-time Updates**: WebSocket integration for live data updates
- **State Management**: Zustand stores for efficient state management
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Error Handling**: Comprehensive error boundaries and user feedback

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
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page (redirects to dashboard)
├── components/
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── layout/           # Layout components (header, sidebar, etc.)
│   ├── features/         # Feature-specific components
│   └── providers/        # React context providers
├── stores/               # Zustand state stores
├── types/                # TypeScript type definitions
├── api/                  # API client functions
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions
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
- Complete page structure with all routes
- Responsive design with mobile components
- State management with Zustand stores
- TypeScript type definitions
- API client architecture
- UI component library setup
- Provider configuration
- Error handling and notifications

🚧 **Placeholder Implementations:**
- Interactive charts (basic placeholders)
- Real map integration (mock implementation)
- WebSocket connections (structure ready)
- Advanced filtering (basic implementation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request
