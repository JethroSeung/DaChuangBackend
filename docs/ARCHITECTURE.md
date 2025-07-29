# UAV Docking Management System - Architecture Documentation

## Overview

The UAV Docking Management System is a comprehensive full-stack application designed for managing unmanned aerial vehicles (UAVs), their operations, real-time tracking, and fleet management. The system follows a modern microservices-inspired architecture with clear separation of concerns and scalable design patterns.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Spring Boot) │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ - React/Next.js │    │ - REST APIs     │    │ - UAV Data      │
│ - TypeScript    │    │ - GraphQL       │    │ - Location Logs │
│ - Zustand       │    │ - WebSocket     │    │ - Flight Logs   │
│ - Tailwind CSS  │    │ - Security      │    │ - Maintenance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────►│   (Caching)     │◄─────────────┘
                        │                 │
                        │ - Session Store │
                        │ - Cache Layer   │
                        │ - Real-time     │
                        └─────────────────┘
```

### Component Architecture

#### Backend Architecture (Spring Boot)

```
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot Application                   │
├─────────────────────────────────────────────────────────────┤
│                    Presentation Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ REST        │ │ GraphQL     │ │ WebSocket   │           │
│  │ Controllers │ │ Resolvers   │ │ Handlers    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ UAV         │ │ Location    │ │ Geofence    │           │
│  │ Service     │ │ Service     │ │ Service     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Docking     │ │ Real-time   │ │ Security    │           │
│  │ Service     │ │ Service     │ │ Service     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                   Repository Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ UAV         │ │ Location    │ │ Geofence    │           │
│  │ Repository  │ │ Repository  │ │ Repository  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ MySQL       │ │ Redis       │ │ File        │           │
│  │ Database    │ │ Cache       │ │ Storage     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

#### Frontend Architecture (Next.js)

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│                      App Router                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Dashboard   │ │ UAV         │ │ Map         │           │
│  │ Pages       │ │ Management  │ │ View        │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                   Component Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ UI          │ │ Feature     │ │ Layout      │           │
│  │ Components  │ │ Components  │ │ Components  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    State Management                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ UAV Store   │ │ Dashboard   │ │ Auth Store  │           │
│  │ (Zustand)   │ │ Store       │ │ (Zustand)   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                     API Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ REST API    │ │ WebSocket   │ │ GraphQL     │           │
│  │ Client      │ │ Client      │ │ Client      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Spring Boot | 3.4.4 | Main application framework |
| **Language** | Java | 21 | Primary programming language |
| **Database** | MySQL | 8.0 | Primary data storage |
| **Cache** | Redis | Latest | Session storage and caching |
| **Security** | Spring Security | 6.x | Authentication and authorization |
| **API** | Spring Web | 6.x | REST API endpoints |
| **GraphQL** | Spring GraphQL | 1.x | Flexible data querying |
| **WebSocket** | Spring WebSocket | 6.x | Real-time communication |
| **ORM** | Spring Data JPA | 3.x | Database abstraction |
| **Validation** | Bean Validation | 3.x | Input validation |
| **Testing** | JUnit 5 | 5.x | Unit and integration testing |
| **Build** | Maven | 3.9.6 | Build and dependency management |
| **Containerization** | Docker | Latest | Application containerization |

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Next.js | 14 | React framework with App Router |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **UI Library** | React | 18.x | Component-based UI |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **Components** | shadcn/ui | Latest | Pre-built UI components |
| **State Management** | Zustand | 4.x | Lightweight state management |
| **HTTP Client** | Axios | 1.x | API communication |
| **Real-time** | Socket.IO | 4.x | WebSocket client |
| **Maps** | Leaflet | 1.x | Interactive mapping |
| **Charts** | Recharts | 2.x | Data visualization |
| **Forms** | React Hook Form | 7.x | Form handling |
| **Validation** | Zod | 3.x | Schema validation |
| **Testing** | Jest + RTL | Latest | Unit testing |
| **E2E Testing** | Playwright | Latest | End-to-end testing |

## Design Patterns and Principles

### Backend Design Patterns

#### 1. Layered Architecture
- **Presentation Layer**: Controllers, REST endpoints, GraphQL resolvers
- **Service Layer**: Business logic, transaction management
- **Repository Layer**: Data access abstraction
- **Domain Layer**: Entity models, business rules

#### 2. Repository Pattern
```java
@Repository
public interface UAVRepository extends JpaRepository<UAV, Integer> {
    List<UAV> findByStatus(UAV.Status status);
    Optional<UAV> findByRfidTag(String rfidTag);
    List<UAV> findAllWithRegions();
}
```

#### 3. Service Layer Pattern
```java
@Service
@Transactional
public class UAVService {
    public UAV createUAV(UAV uav) {
        validateUAV(uav);
        return uavRepository.save(uav);
    }
}
```

#### 4. DTO Pattern
- Separate data transfer objects for API requests/responses
- Validation annotations for input validation
- Mapping between entities and DTOs

#### 5. Observer Pattern
- WebSocket notifications for real-time updates
- Event-driven architecture for system notifications

### Frontend Design Patterns

#### 1. Component Composition
```typescript
// Compound component pattern
<UAVManagement>
  <UAVManagement.Header />
  <UAVManagement.Filters />
  <UAVManagement.List />
  <UAVManagement.Pagination />
</UAVManagement>
```

#### 2. Custom Hooks Pattern
```typescript
// Encapsulate complex logic in reusable hooks
function useUAVOperations() {
  const { createUAV, updateUAV, deleteUAV } = useUAVStore();
  
  const handleCreate = useCallback(async (data) => {
    // Complex creation logic
  }, [createUAV]);
  
  return { handleCreate, handleUpdate, handleDelete };
}
```

#### 3. State Management Pattern
```typescript
// Zustand store with actions and selectors
const useUAVStore = create((set, get) => ({
  uavs: [],
  fetchUAVs: async () => {
    const uavs = await uavApi.getUAVs();
    set({ uavs });
  }
}));
```

#### 4. Provider Pattern
```typescript
// Context providers for global state
<AuthProvider>
  <ThemeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>
</AuthProvider>
```

## Data Flow Architecture

### Request Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───►│ Controller  │───►│   Service   │───►│ Repository  │
│ (Frontend)  │    │   Layer     │    │   Layer     │    │   Layer     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │                   │
       │                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Response   │◄───│ Validation  │◄───│ Business    │◄───│  Database   │
│   (JSON)    │    │ & Mapping   │    │   Logic     │    │   Access    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Real-time Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UAV       │───►│ Location    │───►│ WebSocket   │
│  Hardware   │    │  Service    │    │  Broadcast  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Database   │    │  Frontend   │
                   │   Update    │    │   Update    │
                   └─────────────┘    └─────────────┘
```

## Database Schema Design

### Core Entities

#### UAV Entity
```sql
CREATE TABLE uav (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_tag VARCHAR(50) UNIQUE NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status ENUM('AUTHORIZED', 'UNAUTHORIZED') NOT NULL,
    operational_status ENUM('READY', 'IN_FLIGHT', 'MAINTENANCE', 'OFFLINE'),
    in_hibernate_pod BOOLEAN DEFAULT FALSE,
    serial_number VARCHAR(50) UNIQUE,
    manufacturer VARCHAR(50),
    weight_kg DECIMAL(5,2),
    max_flight_time_minutes INT,
    max_altitude_meters INT,
    max_speed_kmh INT,
    total_flight_hours INT DEFAULT 0,
    total_flight_cycles INT DEFAULT 0,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    current_altitude_meters DECIMAL(8,2),
    last_location_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Location History Entity
```sql
CREATE TABLE location_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uav_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude_meters DECIMAL(8,2),
    speed_kmh DECIMAL(6,2),
    heading_degrees DECIMAL(5,2),
    battery_level INT,
    location_source ENUM('GPS', 'CELLULAR', 'WIFI', 'MANUAL', 'ESTIMATED', 'RADAR'),
    accuracy_meters DECIMAL(6,2),
    signal_strength INT,
    weather_conditions VARCHAR(100),
    notes VARCHAR(300),
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    INDEX idx_uav_timestamp (uav_id, timestamp),
    INDEX idx_location (latitude, longitude),
    INDEX idx_timestamp (timestamp)
);
```

### Relationship Design

#### Many-to-Many: UAV ↔ Regions
```sql
CREATE TABLE uav_regions (
    uav_id INT NOT NULL,
    region_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100),
    PRIMARY KEY (uav_id, region_id),
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
);
```

#### One-to-Many: UAV → Flight Logs
```sql
CREATE TABLE flight_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uav_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INT,
    distance_km DECIMAL(8,2),
    max_altitude_meters DECIMAL(8,2),
    average_speed_kmh DECIMAL(6,2),
    start_battery_level INT,
    end_battery_level INT,
    start_location_lat DECIMAL(10,8),
    start_location_lon DECIMAL(11,8),
    end_location_lat DECIMAL(10,8),
    end_location_lon DECIMAL(11,8),
    flight_purpose VARCHAR(200),
    pilot_name VARCHAR(100),
    weather_conditions VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    INDEX idx_uav_start_time (uav_id, start_time),
    INDEX idx_start_time (start_time)
);
```

## Security Architecture

### Authentication & Authorization

#### Role-Based Access Control (RBAC)
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    USER     │    │  OPERATOR   │    │    ADMIN    │
│             │    │             │    │             │
│ - Read UAVs │    │ - All USER  │    │ - All OPER  │
│ - View Maps │    │ - Update    │    │ - Delete    │
│ - Reports   │    │ - Locations │    │ - Manage    │
└─────────────┘    │ - Regions   │    │ - System    │
                   └─────────────┘    └─────────────┘
```

#### Security Layers
1. **Network Security**: HTTPS, CORS configuration
2. **Authentication**: Session-based with Spring Security
3. **Authorization**: Method-level security with @PreAuthorize
4. **Input Validation**: Bean Validation annotations
5. **SQL Injection Prevention**: JPA/Hibernate parameterized queries
6. **XSS Prevention**: Content Security Policy headers

### API Security

#### Endpoint Protection
```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteUAV(@PathVariable int id) {
    // Admin-only operation
}

@PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
@PostMapping("/location/update/{uavId}")
public ResponseEntity<Void> updateLocation(@PathVariable int uavId) {
    // Operator or Admin operation
}
```

## Performance Considerations

### Backend Optimizations

1. **Database Indexing**: Strategic indexes on frequently queried columns
2. **Connection Pooling**: HikariCP for efficient database connections
3. **Caching**: Redis for session storage and frequently accessed data
4. **Lazy Loading**: JPA lazy loading for related entities
5. **Pagination**: Limit result sets for large data queries
6. **Async Processing**: @Async for non-blocking operations

### Frontend Optimizations

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component
3. **State Management**: Zustand for minimal re-renders
4. **Memoization**: React.memo and useMemo for expensive calculations
5. **Virtual Scrolling**: For large lists of UAVs
6. **Debouncing**: Search input debouncing

## Scalability Architecture

### Horizontal Scaling Strategies

1. **Load Balancing**: Multiple backend instances behind load balancer
2. **Database Sharding**: Partition data by region or UAV groups
3. **Microservices**: Split into domain-specific services
4. **CDN**: Static asset distribution
5. **Caching Layers**: Multiple levels of caching

### Monitoring and Observability

1. **Application Metrics**: Spring Boot Actuator
2. **Health Checks**: Custom health indicators
3. **Logging**: Structured logging with correlation IDs
4. **Performance Monitoring**: Response time tracking
5. **Error Tracking**: Centralized error logging

## Deployment Architecture

### Containerization Strategy

```dockerfile
# Multi-stage Docker build
FROM openjdk:21-jdk-slim AS builder
COPY . /app
WORKDIR /app
RUN ./mvnw clean package -DskipTests

FROM openjdk:21-jre-slim
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Container Orchestration

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      - mysql
      - redis
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: uav_management
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
```

## Integration Patterns

### External System Integration

1. **Weather APIs**: Real-time weather data for flight planning
2. **Mapping Services**: Geographic data and routing
3. **IoT Devices**: Direct UAV hardware communication
4. **Notification Services**: Email and SMS alerts
5. **Analytics Platforms**: Data export for business intelligence

### Event-Driven Architecture

```java
@EventListener
public void handleUAVLocationUpdate(UAVLocationUpdateEvent event) {
    // Check geofence violations
    // Update real-time dashboard
    // Trigger alerts if necessary
}
```

This architecture provides a solid foundation for a scalable, maintainable, and secure UAV management system with clear separation of concerns and modern development practices.
