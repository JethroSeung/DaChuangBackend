# Project Structure Guide

This document provides a comprehensive overview of the UAV Docking Management System project structure, reflecting the current state of the sophisticated full-stack application.

## 📁 Complete Directory Structure

```
DaChuangBackend/
├── 📁 docker/                    # Docker configuration files
│   ├── Dockerfile                # Main application Dockerfile
│   ├── Dockerfile.mysql          # MySQL-specific Dockerfile
│   └── docker-compose.yml        # Docker Compose configuration
├── 📁 scripts/                   # Build and deployment scripts
│   ├── build.bat                 # Windows build script
│   ├── build.sh                  # Unix/Linux build script
│   ├── deploy.bat                # Windows deployment script
│   ├── deploy.sh                 # Unix/Linux deployment script
│   ├── test.bat                  # Windows test script
│   ├── test.sh                   # Unix/Linux test script
│   ├── run-tests.bat             # Windows test runner
│   ├── clean-orphans.sh          # Cleanup script
│   └── refactor-packages.ps1     # Package refactoring utility
├── 📁 src/                       # Java Spring Boot backend
│   ├── main/
│   │   ├── java/com/uav/dockingmanagement/
│   │   │   ├── config/           # Spring configuration classes
│   │   │   ├── controller/       # REST & GraphQL controllers
│   │   │   ├── dto/              # Data transfer objects
│   │   │   ├── graphql/          # GraphQL resolvers & data loaders
│   │   │   ├── interceptor/      # Request interceptors
│   │   │   ├── model/            # JPA entity classes
│   │   │   ├── repository/       # Data access layer
│   │   │   ├── security/         # Security & JWT implementation
│   │   │   ├── service/          # Business logic layer
│   │   │   └── UavDockingManagementSystemApplication.java
│   │   └── resources/
│   │       ├── application*.properties  # Configuration files
│   │       ├── static/           # Static web assets
│   │       └── templates/        # Thymeleaf templates
│   └── test/                     # Comprehensive test suite
├── 📁 frontend/                  # Next.js 15 React application
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── uavs/            # UAV fleet management
│   │   │   ├── map/             # Interactive map view
│   │   │   ├── hibernate-pod/   # UAV hibernation management
│   │   │   ├── docking-stations/ # Docking station management
│   │   │   ├── battery/         # Battery monitoring
│   │   │   ├── flight-logs/     # Flight history & logs
│   │   │   ├── analytics/       # Performance analytics
│   │   │   ├── alerts/          # Alert management
│   │   │   ├── regions/         # Operational region management
│   │   │   ├── users/           # User account management
│   │   │   ├── settings/        # System configuration
│   │   │   └── error-demo/      # Error handling demo
│   │   ├── components/          # React component library
│   │   │   ├── ui/              # Base UI components (shadcn/ui)
│   │   │   ├── layout/          # Layout components
│   │   │   ├── features/        # Feature-specific components
│   │   │   ├── auth/            # Authentication components
│   │   │   └── providers/       # React context providers
│   │   ├── stores/              # Zustand state management
│   │   ├── api/                 # API client functions
│   │   ├── types/               # TypeScript type definitions
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility functions & configurations
│   │   ├── i18n/                # Internationalization setup
│   │   └── locales/             # Translation files (en, zh)
│   ├── public/                  # Static assets
│   ├── __tests__/               # Frontend test files
│   └── docs/                    # Component documentation
├── 📁 docs/                      # Comprehensive project documentation
│   ├── API_DOCUMENTATION.md     # REST API documentation
│   ├── ARCHITECTURE.md          # System architecture overview
│   ├── DATABASE_SCHEMA.md       # Database design documentation
│   ├── DEVELOPER_GUIDE.md       # Development workflow guide
│   ├── GRAPHQL_API.md           # GraphQL API documentation
│   └── openapi.yaml             # OpenAPI specification
├── 📁 db/                        # Database scripts and migrations
│   └── init.sql                 # Database initialization script
├── 📁 images/                    # Project screenshots and assets
├── 📁 logs/                      # Application logs (runtime)
│   ├── application.log          # Main application logs
│   ├── audit.log               # Audit trail logs
│   └── security.log            # Security event logs
├── 📁 target/                    # Maven build artifacts (generated)
├── 📁 .github/                   # GitHub workflows and templates
│   └── copilot-instructions.md  # AI assistant guidelines
├── pom.xml                       # Maven project configuration
├── mvnw, mvnw.cmd               # Maven wrapper scripts
├── checkstyle.xml               # Code style configuration
├── README.md                     # Main project documentation
├── INSTALLATION.md              # Installation and setup guide
├── DEPLOYMENT.md                # Deployment instructions
├── PROJECT_STATUS.md            # Current project status
├── SECURITY_AUDIT.md            # Security audit documentation
└── LICENSE                      # Project license
```

## 🏗️ Backend Architecture

### Spring Boot Application Structure

The backend follows a layered architecture pattern with clear separation of concerns:

```
src/main/java/com/uav/dockingmanagement/
├── 🚀 UavDockingManagementSystemApplication.java  # Main application entry point
├── ⚙️  config/                    # Configuration layer
│   ├── CacheConfig.java          # Redis caching configuration
│   ├── SecurityConfig.java       # Spring Security setup
│   ├── WebConfig.java            # Web MVC configuration
│   ├── WebSocketConfig.java      # Real-time communication
│   ├── GraphQLConfig.java        # GraphQL configuration
│   ├── RateLimitingConfig.java   # API rate limiting
│   └── GlobalExceptionHandler.java # Global error handling
├── 🌐 controller/                 # Presentation layer
│   ├── AuthController.java       # Authentication endpoints
│   ├── UAVController.java        # UAV management REST API
│   ├── DockingStationController.java # Docking station API
│   ├── GeofenceController.java   # Geofencing API
│   ├── LocationController.java   # Location tracking API
│   ├── RegionController.java     # Region management API
│   ├── AnalyticsDashboardController.java # Analytics API
│   ├── MapWebSocketController.java # Real-time map updates
│   ├── HealthCheckController.java # System health monitoring
│   └── ExportController.java     # Data export functionality
├── 📊 graphql/                    # GraphQL layer
│   ├── UAVResolver.java          # UAV GraphQL queries/mutations
│   ├── SystemResolver.java       # System-wide GraphQL operations
│   └── dataloader/               # GraphQL data loading optimization
├── 🔒 security/                   # Security layer
│   └── JwtAuthenticationFilter.java # JWT token validation
├── 🔄 interceptor/                # Request processing
│   └── RateLimitInterceptor.java  # Rate limiting implementation
├── 📦 dto/                        # Data transfer objects
│   ├── AuthRequest.java          # Authentication request DTO
│   ├── AuthResponse.java         # Authentication response DTO
│   ├── RefreshTokenRequest.java  # Token refresh DTO
│   └── UAVStatusResponse.java    # UAV status response DTO
├── 🗃️  model/                     # Data model layer (JPA entities)
│   ├── UAV.java                  # UAV entity
│   ├── DockingStation.java       # Docking station entity
│   ├── FlightLog.java            # Flight history entity
│   ├── BatteryStatus.java        # Battery monitoring entity
│   ├── LocationHistory.java      # Location tracking entity
│   ├── Geofence.java             # Geofencing entity
│   ├── Region.java               # Operational region entity
│   ├── HibernatePod.java         # Hibernation management entity
│   ├── DockingRecord.java        # Docking history entity
│   ├── MaintenanceRecord.java    # Maintenance tracking entity
│   ├── Notification.java         # Notification system entity
│   ├── AuditLog.java             # Audit trail entity
│   ├── SecurityEvent.java        # Security monitoring entity
│   └── ApiKey.java               # API key management entity
├── 🗄️  repository/                # Data access layer
│   ├── UAVRepository.java        # UAV data access
│   ├── DockingStationRepository.java # Docking station data access
│   ├── FlightLogRepository.java  # Flight log data access
│   ├── BatteryStatusRepository.java # Battery data access
│   ├── LocationHistoryRepository.java # Location data access
│   ├── GeofenceRepository.java   # Geofence data access
│   ├── RegionRepository.java     # Region data access
│   └── MaintenanceRecordRepository.java # Maintenance data access
└── 🔧 service/                    # Business logic layer
    ├── AuthService.java          # Authentication business logic
    ├── UAVService.java           # UAV management logic
    ├── DockingStationService.java # Docking station logic
    ├── FlightLogService.java     # Flight logging logic
    ├── LocationService.java      # Location tracking logic
    ├── GeofenceService.java      # Geofencing logic
    ├── RegionService.java        # Region management logic
    ├── JwtService.java           # JWT token management
    ├── RealTimeMonitoringService.java # Real-time data processing
    ├── RealTimeSimulationService.java # Data simulation
    ├── SystemHealthService.java  # System monitoring
    ├── BackupService.java        # Data backup functionality
    ├── ExportService.java        # Data export logic
    ├── FileUploadService.java    # File handling logic
    ├── EmailNotificationService.java # Email notifications
    ├── ErrorTrackingService.java # Error monitoring
    ├── RateLimitingService.java  # Rate limiting logic
    ├── MapsService.java          # Map integration
    ├── WeatherService.java       # Weather data integration
    └── DataInitializationService.java # Initial data setup
```

### Key Backend Features

- **🔐 Security**: JWT-based authentication with role-based access control
- **📊 Dual API**: Both REST and GraphQL endpoints for flexible data access
- **⚡ Real-time**: WebSocket support for live updates
- **🚀 Performance**: Redis caching and rate limiting
- **📈 Monitoring**: Comprehensive logging and health checks
- **🔄 Integration**: Weather and maps service integration
- **💾 Data Management**: Automated backups and data export
- **🛡️ Audit Trail**: Complete security and operation logging

## 🎨 Frontend Architecture

### Next.js 15 Application Structure

The frontend is built with modern React patterns and follows a feature-based architecture:

```text
frontend/src/
├── 📱 app/                        # Next.js App Router (Pages)
│   ├── dashboard/                # 📊 Main operational dashboard
│   ├── uavs/                     # 🚁 UAV fleet management interface
│   ├── map/                      # 🗺️ Interactive map with real-time tracking
│   ├── hibernate-pod/            # 🛌 UAV hibernation management
│   ├── docking-stations/         # 🏢 Docking station control panel
│   ├── battery/                  # 🔋 Battery monitoring dashboard
│   ├── flight-logs/              # 📋 Flight history and mission logs
│   ├── analytics/                # 📈 Performance analytics & insights
│   ├── alerts/                   # 🚨 Alert management system
│   ├── regions/                  # 🌍 Operational region management
│   ├── users/                    # 👥 User account management
│   ├── settings/                 # ⚙️ System configuration
│   ├── error-demo/               # 🐛 Error handling demonstration
│   ├── i18n-test/                # 🌐 Internationalization testing
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Home page (redirects to dashboard)
├── 🧩 components/                 # React Component Library
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx            # Button component variants
│   │   ├── card.tsx              # Card layout components
│   │   ├── dialog.tsx            # Modal dialog components
│   │   ├── form.tsx              # Form input components
│   │   ├── table.tsx             # Data table components
│   │   └── ...                   # Additional UI primitives
│   ├── layout/                   # Layout & Navigation
│   │   ├── header.tsx            # Application header
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   ├── footer.tsx            # Application footer
│   │   └── breadcrumb.tsx        # Breadcrumb navigation
│   ├── features/                 # Feature-specific components
│   │   ├── uav/                  # UAV-related components
│   │   ├── dashboard/            # Dashboard widgets
│   │   ├── map/                  # Map-related components
│   │   ├── battery/              # Battery monitoring components
│   │   └── analytics/            # Analytics visualization
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # Login interface
│   │   ├── auth-guard.tsx        # Route protection
│   │   └── user-menu.tsx         # User account menu
│   ├── demo/                     # Demo & testing components
│   ├── performance/              # Performance monitoring components
│   └── providers/                # React context providers
├── 🗃️ stores/                     # Zustand State Management
│   ├── auth-store.ts             # Authentication state
│   ├── dashboard-store.ts        # Dashboard data state
│   └── uav-store.ts              # UAV fleet state
├── 🌐 api/                        # API Client Layer
│   ├── auth-api.ts               # Authentication API calls
│   ├── uav-api.ts                # UAV management API calls
│   ├── dashboard-api.ts          # Dashboard data API calls
│   └── index.ts                  # API exports
├── 📝 types/                      # TypeScript Definitions
│   ├── auth.ts                   # Authentication types
│   ├── uav.ts                    # UAV-related types
│   ├── dashboard.ts              # Dashboard data types
│   ├── api.ts                    # API response types
│   └── index.ts                  # Type exports
├── 🎣 hooks/                      # Custom React Hooks
│   ├── use-async-operation.ts    # Async operation handling
│   ├── use-websocket.ts          # WebSocket connection management
│   ├── use-mobile.ts             # Mobile device detection
│   ├── use-responsive.ts         # Responsive design utilities
│   └── index.ts                  # Hook exports
├── 🛠️ lib/                        # Utility Functions & Config
│   ├── api-client.ts             # Axios HTTP client configuration
│   ├── utils.ts                  # General utility functions
│   ├── error-handling.ts         # Error handling utilities
│   ├── animations.ts             # Framer Motion configurations
│   ├── i18n.ts                   # Internationalization setup
│   └── test-utils.tsx            # Testing utilities
├── 🌍 i18n/                       # Internationalization
│   └── README.md                 # i18n documentation
└── 📁 locales/                    # Translation Files
    ├── en/                       # English translations
    ├── en-US/                    # US English variants
    ├── zh/                       # Chinese translations
    └── zh-CN/                    # Simplified Chinese
```

### Key Frontend Features

- **🎨 Modern UI**: shadcn/ui components with Tailwind CSS styling
- **📱 Responsive**: Mobile-first design with adaptive layouts
- **🌐 Internationalization**: Multi-language support (English, Chinese)
- **⚡ Performance**: Optimized with Next.js 15 and App Router
- **🔄 State Management**: Zustand for global state, React Query for server state
- **🎭 Animations**: Smooth transitions with Framer Motion
- **🧪 Testing**: Comprehensive test suite with Jest and React Testing Library
- **♿ Accessibility**: WCAG compliant with proper ARIA attributes
- **🔍 Type Safety**: Full TypeScript coverage with strict typing

## �️ Technology Stack

### Backend Technologies

- **☕ Java 21**: Latest LTS version with modern language features
- **🍃 Spring Boot 3.x**: Enterprise-grade application framework
- **🔒 Spring Security**: JWT-based authentication and authorization
- **📊 GraphQL**: Flexible query language alongside REST APIs
- **🌐 WebSocket**: Real-time bidirectional communication
- **🗄️ JPA/Hibernate**: Object-relational mapping and database abstraction
- **🐬 MySQL**: Production database with H2 for development/testing
- **⚡ Redis**: High-performance caching and session storage
- **🧪 JUnit 5 + Mockito**: Comprehensive testing framework
- **📦 Maven**: Dependency management and build automation

### Frontend Technologies

- **⚛️ React 18**: Modern component-based UI library
- **🚀 Next.js 15**: Full-stack React framework with App Router
- **📘 TypeScript**: Type-safe JavaScript with enhanced developer experience
- **🎨 Tailwind CSS**: Utility-first CSS framework
- **🧩 shadcn/ui**: High-quality component library built on Radix UI
- **🗃️ Zustand**: Lightweight state management with Immer integration
- **🔄 TanStack Query**: Powerful data fetching and caching
- **🎭 Framer Motion**: Production-ready motion library
- **🌐 i18next**: Internationalization framework
- **📋 React Hook Form**: Performant forms with Zod validation
- **📊 Recharts**: Composable charting library
- **🗺️ React Leaflet**: Interactive maps integration

### DevOps & Infrastructure

- **🐳 Docker**: Containerization for consistent deployments
- **🔧 Docker Compose**: Multi-container application orchestration
- **📝 OpenAPI**: API documentation and specification
- **🔍 Checkstyle**: Code quality and style enforcement
- **📊 Logging**: Structured logging with audit trails
- **🛡️ Security Auditing**: Comprehensive security monitoring

## 🚀 Quick Start & Usage

### Prerequisites

- Java 21 or higher
- Node.js 18+ and pnpm
- Docker & Docker Compose (recommended)
- MySQL 8.0 (if not using Docker)

### 1. Using Docker (Recommended)

```bash
# Clone and start all services
git clone <repository-url>
cd DaChuangBackend

# Start MySQL, Redis, and Application
docker-compose up -d

# View application logs
docker-compose logs -f app

# Access the application
# Backend: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
# GraphQL: http://localhost:8080/graphql
```

### 2. Manual Development Setup

```bash
# Backend setup
./mvnw clean install
./mvnw spring-boot:run

# Frontend setup (in separate terminal)
cd frontend
pnpm install
pnpm dev

# Run tests
./scripts/test.sh              # Backend tests
cd frontend && pnpm test       # Frontend tests
```

### 3. Build Scripts

All build and deployment scripts are in the `scripts/` directory:

```bash
# Build the entire application
./scripts/build.sh

# Run comprehensive tests
./scripts/test.sh

# Deploy to production
./scripts/deploy.sh

# Clean up Docker orphans
./scripts/clean-orphans.sh
```

## 🎯 Current Project Status

### ✅ Completed Features

**Backend Capabilities:**

- ✅ **Authentication & Authorization**: JWT-based security with role management
- ✅ **UAV Fleet Management**: Complete lifecycle management with status tracking
- ✅ **Docking Station Control**: Capacity management and maintenance scheduling
- ✅ **Real-time Monitoring**: WebSocket-based live data streaming
- ✅ **Geofencing**: Boundary management and violation detection
- ✅ **Location Tracking**: GPS positioning with historical data
- ✅ **Flight Logging**: Comprehensive mission and operation records
- ✅ **Battery Management**: Real-time monitoring and health tracking
- ✅ **Analytics Dashboard**: Performance metrics and insights
- ✅ **Data Export**: Multiple format support (CSV, Excel, PDF, JSON)
- ✅ **API Documentation**: OpenAPI/Swagger and GraphQL schemas
- ✅ **Security Auditing**: Comprehensive logging and monitoring

**Frontend Capabilities:**

- ✅ **Modern UI/UX**: Responsive design with dark/light themes
- ✅ **Interactive Dashboard**: Real-time data visualization
- ✅ **Map Integration**: Live UAV tracking with geofencing
- ✅ **Multi-language Support**: English and Chinese localization
- ✅ **Mobile Responsive**: Optimized for all device sizes
- ✅ **Error Handling**: Comprehensive error boundaries and recovery
- ✅ **Performance Optimized**: Code splitting and lazy loading
- ✅ **Accessibility**: WCAG compliant with screen reader support

**DevOps & Infrastructure:**

- ✅ **Containerization**: Docker and Docker Compose setup
- ✅ **Database Management**: MySQL production, H2 development
- ✅ **Caching Layer**: Redis integration for performance
- ✅ **Build Automation**: Cross-platform build scripts
- ✅ **Testing Suite**: Comprehensive unit and integration tests
- ✅ **Code Quality**: Checkstyle and linting enforcement

### 🚀 Key Architectural Benefits

1. **🏗️ Scalable Architecture**: Microservice-ready with clear separation of concerns
2. **🔒 Enterprise Security**: Production-grade authentication and authorization
3. **⚡ High Performance**: Optimized with caching, lazy loading, and efficient queries
4. **🌐 Modern Tech Stack**: Latest versions of Spring Boot, React, and supporting libraries
5. **� Cross-Platform**: Web-based with mobile-responsive design
6. **🔄 Real-time Capabilities**: Live updates and monitoring
7. **🌍 Internationalization**: Multi-language support for global deployment
8. **🧪 Test Coverage**: Comprehensive testing strategy for reliability
9. **📊 Observability**: Detailed logging, monitoring, and analytics
10. **🔧 Developer Experience**: Modern tooling and development workflow

## 🔧 Development Workflow

### Getting Started

1. **Environment Setup**: Use Docker Compose for instant development environment
2. **Code Organization**: Feature-based structure for easy navigation
3. **Testing Strategy**: Test-driven development with comprehensive coverage
4. **Documentation**: Auto-generated API docs and component documentation

### Best Practices

- **Backend**: Follow Spring Boot conventions and clean architecture
- **Frontend**: Use TypeScript strictly and component-driven development
- **Database**: Use migrations for schema changes and proper indexing
- **Security**: Regular security audits and dependency updates
- **Performance**: Monitor and optimize based on real usage metrics

## 🔮 Future Enhancement Opportunities

### Short-term Improvements

1. **CI/CD Pipeline**: Automated testing and deployment workflows
2. **Monitoring Dashboard**: Application performance monitoring (APM)
3. **API Rate Limiting**: Enhanced rate limiting with user quotas
4. **Advanced Analytics**: Machine learning insights for UAV operations

### Long-term Vision

1. **Microservices Migration**: Split into domain-specific services
2. **Cloud Native**: Kubernetes deployment with auto-scaling
3. **AI Integration**: Predictive maintenance and autonomous operations
4. **IoT Expansion**: Integration with additional sensor types and devices
