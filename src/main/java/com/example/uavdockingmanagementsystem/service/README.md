# Service Layer Documentation

## Overview

The service layer contains the business logic for the UAV Docking Management System. These services act as intermediaries between the controllers and repositories, implementing core business rules, validation, and complex operations.

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───►│    Services     │───►│  Repositories   │
│                 │    │                 │    │                 │
│ - REST APIs     │    │ - Business      │    │ - Data Access   │
│ - GraphQL       │    │   Logic         │    │ - Queries       │
│ - WebSocket     │    │ - Validation    │    │ - Persistence   │
└─────────────────┘    │ - Transactions  │    └─────────────────┘
                       │ - Integration   │
                       └─────────────────┘
```

## Core Services

### 1. UAVService

**Purpose**: Manages UAV lifecycle, validation, and business operations.

**Key Responsibilities**:
- UAV CRUD operations with validation
- Region assignment and access control
- Status management and transitions
- RFID tag uniqueness validation
- Integration with hibernate pod operations

**Usage Example**:
```java
@Autowired
private UAVService uavService;

// Create new UAV
UAV uav = new UAV();
uav.setRfidTag("UAV-001");
uav.setOwnerName("John Doe");
uav.setModel("DJI Phantom 4");

UAV savedUAV = uavService.addUAV(uav);

// Validate access
String accessResult = uavService.checkUAVRegionAccess("UAV-001", "Zone A");
if ("OPEN THE DOOR".equals(accessResult)) {
    // Grant access
}
```

**Configuration**:
- No specific configuration required
- Uses standard JPA transaction management
- Integrates with validation framework

### 2. LocationService

**Purpose**: Handles real-time location tracking, history management, and geospatial operations.

**Key Responsibilities**:
- Real-time location updates with validation
- Historical location data management
- Flight path reconstruction
- Geofence violation checking
- WebSocket broadcasting for real-time updates

**Usage Example**:
```java
@Autowired
private LocationService locationService;

// Update UAV location
locationService.updateUAVLocation(uav, 40.7589, -73.9851, 85.5);

// Get UAVs in area
List<Map<String, Object>> uavsInArea = locationService.getUAVsInArea(
    40.7500, 40.7600, -73.9900, -73.9800);

// Get flight path
List<LocationHistory> flightPath = locationService.getFlightPath(
    uavId, startTime, endTime);
```

**Configuration**:
```properties
# Location validation settings
app.location.max-altitude-meters=500
app.location.max-speed-kmh=200
app.location.accuracy-threshold-meters=10

# Real-time broadcasting
app.websocket.location-updates=true
app.websocket.broadcast-interval=5000
```

### 3. GeofenceService

**Purpose**: Manages geographical boundaries and violation detection.

**Key Responsibilities**:
- Geofence creation and management
- Real-time violation detection
- Notification and alert generation
- Spatial calculations and queries

**Usage Example**:
```java
@Autowired
private GeofenceService geofenceService;

// Create circular geofence
Geofence geofence = Geofence.createCircularFence(
    "Restricted Zone", 40.7589, -73.9851, 1000.0, 
    Geofence.BoundaryType.EXCLUSION);

geofenceService.createGeofence(geofence);

// Check point against geofences
Map<String, Object> result = geofenceService.checkPointAgainstGeofences(
    40.7589, -73.9851, 100.0);
```

**Configuration**:
```properties
# Geofence settings
app.geofence.default-priority=1
app.geofence.violation-check-interval=1000
app.geofence.notification-enabled=true
app.geofence.max-radius-meters=10000
```

### 4. DockingStationService

**Purpose**: Manages docking station operations and capacity.

**Key Responsibilities**:
- Docking station lifecycle management
- Capacity tracking and availability
- Proximity searches and routing
- Status monitoring and alerts

**Usage Example**:
```java
@Autowired
private DockingStationService dockingStationService;

// Find nearest stations
List<DockingStation> nearestStations = dockingStationService.findNearestStations(
    40.7589, -73.9851, 5000.0, 3);

// Check availability
boolean isAvailable = dockingStationService.isStationAvailable(stationId);

// Update occupancy
dockingStationService.updateOccupancy(stationId, 2);
```

### 5. RealTimeMonitoringService

**Purpose**: Provides real-time system monitoring and WebSocket broadcasting.

**Key Responsibilities**:
- System statistics collection
- Real-time data broadcasting
- Performance monitoring
- Alert generation and distribution

**Usage Example**:
```java
@Autowired
private RealTimeMonitoringService monitoringService;

// Manual broadcast
monitoringService.broadcastSystemStatistics();
monitoringService.broadcastUAVStatus();

// Get current metrics
Map<String, Object> metrics = monitoringService.generateSystemStatistics();
```

**Configuration**:
```properties
# Monitoring intervals
app.monitoring.system-stats-interval=30000
app.monitoring.uav-status-interval=15000
app.monitoring.alert-check-interval=60000

# WebSocket settings
app.websocket.enabled=true
app.websocket.heartbeat-interval=25000
```

### 6. DataInitializationService

**Purpose**: Initializes sample data for development and testing.

**Key Responsibilities**:
- Sample data creation
- Database seeding
- Test data generation
- Development environment setup

**Usage Example**:
```java
@Autowired
private DataInitializationService dataInitService;

// Initialize sample data
dataInitService.initializeRegions();
dataInitService.initializeDockingStations();
dataInitService.initializeGeofences();
dataInitService.initializeUAVsWithLocations();
```

**Configuration**:
```properties
# Data initialization
app.data.init-sample-data=true
app.data.sample-uav-count=5
app.data.sample-region-count=3
app.data.sample-station-count=2
```

## Service Patterns and Best Practices

### 1. Transaction Management

All services use declarative transaction management:

```java
@Service
@Transactional
public class UAVService {
    
    @Transactional(readOnly = true)
    public List<UAV> getAllUAVs() {
        return uavRepository.findAll();
    }
    
    @Transactional(rollbackFor = Exception.class)
    public UAV createUAV(UAV uav) {
        validateUAV(uav);
        return uavRepository.save(uav);
    }
}
```

### 2. Validation Pattern

Services implement comprehensive validation:

```java
private void validateUAV(UAV uav) {
    if (uav.getRfidTag() == null || uav.getRfidTag().trim().isEmpty()) {
        throw new ValidationException("RFID tag is required");
    }
    
    if (!isRfidTagUnique(uav.getRfidTag(), uav.getId())) {
        throw new DuplicateRfidException("RFID tag already exists");
    }
    
    // Additional validation rules
}
```

### 3. Error Handling

Services use specific exception types:

```java
public class UAVNotFoundException extends RuntimeException {
    public UAVNotFoundException(String message) {
        super(message);
    }
}

public class DuplicateRfidException extends RuntimeException {
    public DuplicateRfidException(String message) {
        super(message);
    }
}
```

### 4. Caching Strategy

Services implement caching for frequently accessed data:

```java
@Service
public class UAVService {
    
    @Cacheable(value = "uavs", key = "#id")
    public Optional<UAV> getUAVById(int id) {
        return uavRepository.findById(id);
    }
    
    @CacheEvict(value = "uavs", key = "#uav.id")
    public UAV updateUAV(UAV uav) {
        return uavRepository.save(uav);
    }
}
```

## Testing Services

### Unit Testing

```java
@ExtendWith(MockitoExtension.class)
class UAVServiceTest {
    
    @Mock
    private UAVRepository uavRepository;
    
    @InjectMocks
    private UAVService uavService;
    
    @Test
    void shouldCreateUAVSuccessfully() {
        // Given
        UAV uav = createTestUAV();
        when(uavRepository.save(any(UAV.class))).thenReturn(uav);
        
        // When
        UAV result = uavService.addUAV(uav);
        
        // Then
        assertThat(result).isNotNull();
        verify(uavRepository).save(uav);
    }
}
```

### Integration Testing

```java
@SpringBootTest
@Transactional
class UAVServiceIntegrationTest {
    
    @Autowired
    private UAVService uavService;
    
    @Test
    void shouldPersistUAVToDatabase() {
        // Given
        UAV uav = createTestUAV();
        
        // When
        UAV saved = uavService.addUAV(uav);
        
        // Then
        assertThat(saved.getId()).isNotNull();
        
        Optional<UAV> retrieved = uavService.getUAVById(saved.getId());
        assertThat(retrieved).isPresent();
    }
}
```

## Performance Considerations

### 1. Database Optimization

- Use appropriate fetch strategies (LAZY vs EAGER)
- Implement pagination for large datasets
- Use database indexes for frequently queried fields
- Consider read replicas for read-heavy operations

### 2. Caching Strategy

- Cache frequently accessed reference data
- Use cache eviction strategies for data consistency
- Monitor cache hit rates and adjust TTL values
- Consider distributed caching for scalability

### 3. Async Processing

```java
@Service
public class LocationService {
    
    @Async
    public CompletableFuture<Void> processLocationUpdate(UAV uav, LocationData data) {
        // Process location update asynchronously
        updateLocation(uav, data);
        checkGeofenceViolations(uav, data);
        broadcastUpdate(uav, data);
        
        return CompletableFuture.completedFuture(null);
    }
}
```

## Monitoring and Observability

### 1. Metrics Collection

```java
@Service
public class UAVService {
    
    private final MeterRegistry meterRegistry;
    private final Counter uavCreationCounter;
    
    public UAVService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.uavCreationCounter = Counter.builder("uav.created")
            .description("Number of UAVs created")
            .register(meterRegistry);
    }
    
    public UAV addUAV(UAV uav) {
        UAV saved = uavRepository.save(uav);
        uavCreationCounter.increment();
        return saved;
    }
}
```

### 2. Health Checks

```java
@Component
public class UAVServiceHealthIndicator implements HealthIndicator {
    
    @Autowired
    private UAVRepository uavRepository;
    
    @Override
    public Health health() {
        try {
            long count = uavRepository.count();
            return Health.up()
                .withDetail("uav.count", count)
                .withDetail("status", "operational")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## Configuration Reference

### Application Properties

```properties
# Service-specific settings
app.services.uav.validation-enabled=true
app.services.location.real-time-updates=true
app.services.geofence.violation-alerts=true
app.services.monitoring.metrics-enabled=true

# Performance settings
app.services.cache.enabled=true
app.services.cache.ttl-seconds=300
app.services.async.pool-size=10
app.services.batch.size=100

# Integration settings
app.services.websocket.enabled=true
app.services.notifications.enabled=true
app.services.external-apis.enabled=false
```

## Troubleshooting

### Common Issues

1. **Transaction Rollback Issues**
   - Check exception handling in @Transactional methods
   - Verify rollbackFor configuration
   - Ensure proper exception propagation

2. **Performance Problems**
   - Monitor database query performance
   - Check N+1 query problems
   - Verify cache configuration and hit rates

3. **Validation Errors**
   - Check validation annotations
   - Verify custom validation logic
   - Ensure proper error message handling

### Debug Configuration

```properties
# Enable debug logging for services
logging.level.com.example.uavdockingmanagementsystem.service=DEBUG

# Enable SQL logging
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Enable transaction logging
logging.level.org.springframework.transaction=DEBUG
```

This service layer provides a robust foundation for the UAV management system with proper separation of concerns, comprehensive validation, and scalable architecture patterns.
