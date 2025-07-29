# GraphQL API Documentation

## Overview

The UAV Docking Management System provides a GraphQL API endpoint at `/graphql` for flexible data querying and mutations. This complements the REST API by allowing clients to request exactly the data they need in a single request.

## GraphQL Endpoint

- **URL**: `/graphql`
- **Method**: POST
- **Content-Type**: `application/json`
- **Authentication**: Same as REST API (session-based or API key)

## GraphQL Playground

Access the interactive GraphQL playground at `/graphql` in your browser when running in development mode.

## Schema Overview

The GraphQL schema includes the following main types:

### Core Types

- **UAV**: Unmanned Aerial Vehicle entity
- **Region**: Geographical regions for UAV access control
- **FlightLog**: Flight history and logs
- **MaintenanceRecord**: UAV maintenance records
- **BatteryStatus**: Real-time battery information
- **LocationHistory**: Historical location data
- **DockingStation**: Docking station information
- **Geofence**: Geographical boundaries and restrictions

### Query Operations

#### UAV Queries

```graphql
# Get all UAVs with filtering and pagination
query GetUAVs($filter: UAVFilter, $pagination: PaginationInput) {
  uavs(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        rfidTag
        ownerName
        model
        status
        operationalStatus
        currentLocationLatitude
        currentLocationLongitude
        lastKnownLocationUpdate
        regions {
          id
          regionName
        }
        batteryStatus {
          currentLevel
          isCharging
          lastUpdated
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

```graphql
# Get specific UAV by ID
query GetUAV($id: ID!) {
  uav(id: $id) {
    id
    rfidTag
    ownerName
    model
    status
    operationalStatus
    serialNumber
    manufacturer
    weightKg
    maxFlightTimeMinutes
    maxAltitudeMeters
    maxSpeedKmh
    totalFlightHours
    totalFlightCycles
    currentLocationLatitude
    currentLocationLongitude
    lastKnownLocationUpdate
    regions {
      id
      regionName
    }
    flightLogs(limit: 10) {
      id
      startTime
      endTime
      duration
      distance
      maxAltitude
      averageSpeed
    }
    maintenanceRecords(limit: 5) {
      id
      maintenanceType
      description
      scheduledDate
      completedDate
      status
    }
    batteryStatus {
      currentLevel
      voltage
      temperature
      cycleCount
      isCharging
      estimatedTimeToFull
      lastUpdated
    }
  }
}
```

```graphql
# Get UAV by RFID tag
query GetUAVByRFID($rfidTag: String!) {
  uavByRfid(rfidTag: $rfidTag) {
    id
    rfidTag
    ownerName
    model
    status
    operationalStatus
    regions {
      id
      regionName
    }
  }
}
```

```graphql
# Get UAV statistics
query GetUAVStatistics {
  uavStatistics {
    totalUAVs
    activeUAVs
    authorizedUAVs
    unauthorizedUAVs
    hibernatingUAVs
    totalFlightHours
    totalFlightCycles
    averageFlightTime
    statusDistribution {
      status
      count
    }
    manufacturerDistribution {
      manufacturer
      count
    }
  }
}
```

#### Flight Log Queries

```graphql
# Get flight logs with filtering
query GetFlightLogs($filter: FlightLogFilter, $pagination: PaginationInput) {
  flightLogs(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        uav {
          id
          rfidTag
          model
        }
        startTime
        endTime
        duration
        distance
        maxAltitude
        averageSpeed
        startLocation {
          latitude
          longitude
        }
        endLocation {
          latitude
          longitude
        }
        flightPath {
          latitude
          longitude
          altitude
          timestamp
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
```

```graphql
# Get flight statistics
query GetFlightStatistics($uavId: ID, $dateRange: DateRangeInput) {
  flightStatistics(uavId: $uavId, dateRange: $dateRange) {
    totalFlights
    totalDistance
    totalFlightTime
    averageFlightTime
    averageDistance
    maxAltitudeReached
    averageSpeed
    flightsByDay {
      date
      count
      totalDistance
      totalTime
    }
  }
}
```

#### Maintenance Queries

```graphql
# Get maintenance records
query GetMaintenanceRecords($filter: MaintenanceFilter, $pagination: PaginationInput) {
  maintenanceRecords(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        uav {
          id
          rfidTag
          model
        }
        maintenanceType
        description
        scheduledDate
        completedDate
        status
        technician
        cost
        notes
        partsReplaced {
          partName
          partNumber
          quantity
          cost
        }
      }
    }
    totalCount
  }
}
```

```graphql
# Get upcoming maintenance
query GetUpcomingMaintenance($days: Int = 7) {
  upcomingMaintenance(days: $days) {
    id
    uav {
      id
      rfidTag
      model
    }
    maintenanceType
    scheduledDate
    priority
    estimatedDuration
  }
}
```

```graphql
# Get overdue maintenance
query GetOverdueMaintenance {
  overdueMaintenance {
    id
    uav {
      id
      rfidTag
      model
    }
    maintenanceType
    scheduledDate
    daysPastDue
    priority
  }
}
```

### Input Types

#### Filtering

```graphql
input UAVFilter {
  status: UAVStatus
  operationalStatus: OperationalStatus
  manufacturer: String
  model: String
  regionId: ID
  inHibernatePod: Boolean
  batteryLevelMin: Int
  batteryLevelMax: Int
  lastLocationUpdateAfter: DateTime
  lastLocationUpdateBefore: DateTime
}

input FlightLogFilter {
  uavId: ID
  startTimeAfter: DateTime
  startTimeBefore: DateTime
  minDuration: Int
  maxDuration: Int
  minDistance: Float
  maxDistance: Float
  minAltitude: Float
  maxAltitude: Float
}

input MaintenanceFilter {
  uavId: ID
  maintenanceType: MaintenanceType
  status: MaintenanceStatus
  scheduledAfter: DateTime
  scheduledBefore: DateTime
  completedAfter: DateTime
  completedBefore: DateTime
}
```

#### Pagination

```graphql
input PaginationInput {
  first: Int
  after: String
  last: Int
  before: String
}

input DateRangeInput {
  startDate: DateTime!
  endDate: DateTime!
}
```

### Enums

```graphql
enum UAVStatus {
  AUTHORIZED
  UNAUTHORIZED
}

enum OperationalStatus {
  READY
  IN_FLIGHT
  MAINTENANCE
  OFFLINE
}

enum MaintenanceType {
  ROUTINE
  REPAIR
  UPGRADE
  INSPECTION
  EMERGENCY
}

enum MaintenanceStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  OVERDUE
}
```

### Mutation Operations

#### UAV Mutations

```graphql
# Create new UAV
mutation CreateUAV($input: UAVCreateInput!) {
  createUAV(input: $input) {
    success
    uav {
      id
      rfidTag
      ownerName
      model
    }
    errors {
      field
      message
    }
  }
}

# Update UAV
mutation UpdateUAV($id: ID!, $input: UAVUpdateInput!) {
  updateUAV(id: $id, input: $input) {
    success
    uav {
      id
      rfidTag
      ownerName
      model
      updatedAt
    }
    errors {
      field
      message
    }
  }
}

# Update UAV location
mutation UpdateUAVLocation($uavId: ID!, $input: LocationUpdateInput!) {
  updateUAVLocation(uavId: $uavId, input: $input) {
    success
    location {
      latitude
      longitude
      altitude
      timestamp
    }
    errors {
      field
      message
    }
  }
}
```

#### Flight Log Mutations

```graphql
# Start flight log
mutation StartFlight($input: StartFlightInput!) {
  startFlight(input: $input) {
    success
    flightLog {
      id
      startTime
      uav {
        id
        rfidTag
      }
    }
    errors {
      field
      message
    }
  }
}

# End flight log
mutation EndFlight($flightLogId: ID!, $input: EndFlightInput!) {
  endFlight(flightLogId: $flightLogId, input: $input) {
    success
    flightLog {
      id
      endTime
      duration
      distance
    }
    errors {
      field
      message
    }
  }
}
```

#### Maintenance Mutations

```graphql
# Schedule maintenance
mutation ScheduleMaintenance($input: ScheduleMaintenanceInput!) {
  scheduleMaintenance(input: $input) {
    success
    maintenanceRecord {
      id
      scheduledDate
      maintenanceType
      uav {
        id
        rfidTag
      }
    }
    errors {
      field
      message
    }
  }
}

# Complete maintenance
mutation CompleteMaintenance($id: ID!, $input: CompleteMaintenanceInput!) {
  completeMaintenance(id: $id, input: $input) {
    success
    maintenanceRecord {
      id
      completedDate
      status
      notes
    }
    errors {
      field
      message
    }
  }
}
```

### Subscriptions

#### Real-time Updates

```graphql
# Subscribe to UAV location updates
subscription UAVLocationUpdates($uavId: ID) {
  uavLocationUpdates(uavId: $uavId) {
    uavId
    latitude
    longitude
    altitude
    speed
    heading
    batteryLevel
    timestamp
  }
}

# Subscribe to system alerts
subscription SystemAlerts {
  systemAlerts {
    id
    type
    severity
    message
    timestamp
    uav {
      id
      rfidTag
    }
  }
}

# Subscribe to maintenance alerts
subscription MaintenanceAlerts {
  maintenanceAlerts {
    id
    type
    message
    uav {
      id
      rfidTag
    }
    maintenanceRecord {
      id
      scheduledDate
      maintenanceType
    }
  }
}
```

### Example Queries

#### Complex UAV Query with Relations

```graphql
query ComplexUAVQuery {
  uavs(filter: { status: AUTHORIZED, operationalStatus: READY }) {
    edges {
      node {
        id
        rfidTag
        model
        batteryStatus {
          currentLevel
          isCharging
        }
        flightLogs(limit: 3) {
          id
          startTime
          duration
          distance
        }
        maintenanceRecords(limit: 2) {
          id
          maintenanceType
          scheduledDate
          status
        }
        regions {
          id
          regionName
        }
      }
    }
  }
}
```

#### Analytics Query

```graphql
query AnalyticsData($dateRange: DateRangeInput!) {
  flightStatistics(dateRange: $dateRange) {
    totalFlights
    totalDistance
    totalFlightTime
    flightsByDay {
      date
      count
      totalDistance
    }
  }
  
  uavStatistics {
    totalUAVs
    activeUAVs
    statusDistribution {
      status
      count
    }
  }
}
```

### Error Handling

GraphQL errors are returned in the standard GraphQL error format:

```json
{
  "data": null,
  "errors": [
    {
      "message": "UAV not found",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["uav"],
      "extensions": {
        "code": "UAV_NOT_FOUND",
        "uavId": "123"
      }
    }
  ]
}
```

### Best Practices

1. **Use Fragments**: Define reusable fragments for common field sets
2. **Pagination**: Always use pagination for list queries
3. **Field Selection**: Only request fields you need
4. **Variables**: Use variables instead of inline values
5. **Error Handling**: Always check for errors in responses
6. **Caching**: Leverage GraphQL caching mechanisms

### Rate Limiting

GraphQL queries are subject to the same rate limiting as REST endpoints:
- Query complexity analysis
- Depth limiting
- Rate limiting by user role

### Authentication

Include authentication headers with GraphQL requests:

```javascript
fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  },
  body: JSON.stringify({
    query: '...',
    variables: { ... }
  })
});
```
