# UAV Docking Management System - AI Coding Agent Instructions

## Architecture Overview

This is a full-stack **UAV fleet management system** with Spring Boot (Java 21) backend and Next.js 14 frontend. The system manages real-time UAV tracking, docking operations, geofencing, and fleet analytics.

### Core Service Boundaries

- **LocationService**: Real-time tracking, geofence violations, flight paths
- **DockingStationService**: Automated docking/undocking operations
- **UAVService**: Fleet management, status updates, hibernate pod operations
- **Real-time Integration**: WebSocket for live updates via STOMP protocol

### Key Data Flow Patterns

- **Location Updates**: `UAV location → LocationService → Geofence checks → WebSocket broadcast`
- **Docking Operations**: `Request → Validation → Transaction → Status update → Broadcast`
- **Real-time Dashboard**: `WebSocket subscriptions → Zustand stores → React components`

## Development Workflows

### Backend Development

```bash
# Use Maven wrapper (not global Maven)
./mvnw spring-boot:run                    # Dev with H2 database
./mvnw spring-boot:run -Pprod             # Prod with MySQL
./mvnw test                               # Run tests
./mvnw clean install -DskipTests          # Fast build
```

### Frontend Development

```bash
cd frontend/
pnpm dev --turbopack                      # Dev server with Turbopack
pnpm build                                # Production build
pnpm test                                 # Jest tests
```

### Docker Development

```bash
cd docker/
docker-compose up -d                      # Full stack with MySQL/Redis
docker-compose logs -f app                # View application logs
```

## Critical Code Patterns

### Service Layer Architecture

Services use `@Transactional` for docking operations and bulk updates. Always check entity existence before operations:

```java
// Pattern: Validation → Transaction → Broadcast
@Transactional
public Map<String, Object> dockUAV(Integer uavId, Long stationId, String purpose) {
    // 1. Validate entities exist
    // 2. Check business rules (station capacity, UAV already docked)
    // 3. Perform transaction
    // 4. Broadcast via WebSocket
}
```

### Frontend State Management

Uses **Zustand with Immer** for immutable updates. Stores are organized by domain:

```typescript
// Pattern: Immer mutations + selective subscriptions
const useUAVStore = create<UAVState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Always use set((state) => { state.field = value }) for mutations
        fetchUAVs: async () => {
          set((state) => {
            state.loading = true;
          });
          // API call...
          set((state) => {
            state.uavs = result;
            state.loading = false;
          });
        },
      }))
    )
  )
);
```

### Real-time WebSocket Integration

Backend publishes to STOMP topics, frontend subscribes via stores:

```java
// Backend: Broadcast pattern
@Autowired SimpMessagingTemplate messagingTemplate;
messagingTemplate.convertAndSend("/topic/location-updates", locationData);
```

```typescript
// Frontend: Store-based subscription management
useEffect(() => {
  const unsubscribe = websocketService.subscribe(
    `/topic/uav-locations`,
    (data) => updateUAVInStore(data)
  );
  return unsubscribe;
}, []);
```

## Project-Specific Conventions

### API Response Pattern

All API responses use standardized wrapper:

```java
// Always return Map<String, Object> for operations
Map<String, Object> result = new HashMap<>();
result.put("success", true/false);
result.put("message", "Description");
result.put("data", actualData);  // Optional
```

### Database Strategy

- **H2** for development (`spring.profiles.active=local`)
- **MySQL** for production (`spring.profiles.active=prod`)
- Schema auto-generated but use `update` in production, not `create-drop`

### Error Handling Patterns

- Services catch exceptions and return structured responses
- Frontend uses toast notifications from react-hot-toast
- WebSocket errors trigger reconnection logic in stores

### Component Organization

```
frontend/src/components/
├── ui/           # shadcn/ui base components
├── features/     # Domain-specific components (uav/, dashboard/)
└── layout/       # App shell components
```

## Integration Points

### Critical Environment Variables

```bash
# Database switching
SPRING_PROFILES_ACTIVE=local|prod
DB_HOST=localhost
DB_NAME=uav_management

# Redis for caching
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-secret-key
```

### Build Dependencies

- **Frontend builds** managed by Maven frontend plugin
- **Docker builds** use multi-stage with Node.js + OpenJDK 21
- **Tests run** in parallel: `./mvnw test` (backend) + `pnpm test` (frontend)

### Mobile Optimization

Frontend includes dedicated mobile components (prefix: `Mobile*`) for responsive UAV management on smaller screens.

## Common Debugging Commands

```bash
# View real-time logs in Docker
docker-compose logs -f app

# Check database connectivity
./mvnw spring-boot:run | grep "database"

# Debug frontend build issues
cd frontend && pnpm build --debug

# Test WebSocket connections
# Navigate to /swagger-ui.html for API testing with WebSocket examples
```

When working with this codebase, prioritize understanding the real-time data flow between LocationService, WebSocket broadcasting, and Zustand stores, as this drives the core user experience.
