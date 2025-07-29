# UAV Docking Management System - API Documentation

## Overview

The UAV Docking Management System provides a comprehensive REST API for managing UAV operations, real-time tracking, geofencing, and fleet management. This document provides detailed information about all available endpoints, authentication requirements, and usage examples.

## Base URL

- **Development**: `http://localhost:8080`
- **Production**: `https://your-domain.com`

## Authentication

The API uses role-based authentication with three user roles:

- **USER**: Read-only access to most endpoints
- **OPERATOR**: Can perform UAV operations and updates
- **ADMIN**: Full system access including delete operations

### Authentication Methods

1. **Session-based Authentication**: Login through `/login` endpoint
2. **API Keys**: For programmatic access (if enabled)

### Default Users

- **Admin**: `admin/admin123`
- **Operator**: `operator/operator123`
- **User**: `user/user123`

## Rate Limiting

- **Default**: 100 requests per minute
- **Admin**: 1000 requests per minute
- **API Key**: 2000 requests per minute

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## API Endpoints

### 1. UAV Management

#### Get All UAVs
- **Endpoint**: `GET /api/uav/all`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Retrieve all UAVs with their associated regions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rfidTag": "UAV-001",
      "ownerName": "John Smith",
      "model": "DJI Phantom 4",
      "status": "AUTHORIZED",
      "operationalStatus": "READY",
      "inHibernatePod": false,
      "serialNumber": "SNUAV001",
      "manufacturer": "DJI",
      "weightKg": 1.38,
      "maxFlightTimeMinutes": 28,
      "maxAltitudeMeters": 120,
      "maxSpeedKmh": 72,
      "totalFlightHours": 45,
      "totalFlightCycles": 123,
      "currentLatitude": 40.7589,
      "currentLongitude": -73.9851,
      "lastLocationUpdate": "2024-01-15T10:25:00Z",
      "regions": [
        {
          "id": 1,
          "regionName": "Zone A"
        }
      ]
    }
  ]
}
```

#### Add New UAV
- **Endpoint**: `POST /api/uav/add`
- **Authentication**: OPERATOR, ADMIN
- **Description**: Create a new UAV in the system

**Request Body:**
```json
{
  "rfidTag": "UAV-006",
  "ownerName": "Jane Doe",
  "model": "DJI Mavic Pro",
  "serialNumber": "SNUAV006",
  "manufacturer": "DJI",
  "weightKg": 0.9,
  "maxFlightTimeMinutes": 27,
  "maxAltitudeMeters": 120,
  "maxSpeedKmh": 65,
  "regionIds": [1, 2],
  "inHibernatePod": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "rfidTag": "UAV-006",
    "message": "UAV added successfully"
  }
}
```

#### Update UAV
- **Endpoint**: `PUT /api/uav/update/{id}`
- **Authentication**: OPERATOR, ADMIN
- **Description**: Update an existing UAV's information

**Path Parameters:**
- `id` (integer): UAV ID

**Request Body:**
```json
{
  "ownerName": "Jane Smith",
  "model": "DJI Mavic Pro 2",
  "weightKg": 0.95
}
```

#### Delete UAV
- **Endpoint**: `DELETE /api/uav/delete/{id}`
- **Authentication**: ADMIN
- **Description**: Remove a UAV from the system

**Path Parameters:**
- `id` (integer): UAV ID

#### Get UAV Statistics
- **Endpoint**: `GET /api/uav/statistics`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get system-wide UAV statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUAVs": 5,
    "authorizedUAVs": 4,
    "unauthorizedUAVs": 1,
    "activeUAVs": 3,
    "hibernatingUAVs": 2,
    "totalFlightHours": 245,
    "totalFlightCycles": 1234,
    "averageFlightTime": 49
  }
}
```

### 2. Location Tracking

#### Update UAV Location
- **Endpoint**: `POST /api/location/update/{uavId}`
- **Authentication**: OPERATOR, ADMIN
- **Description**: Update the current location of a UAV

**Path Parameters:**
- `uavId` (integer): UAV ID

**Request Body:**
```json
{
  "latitude": 40.7589,
  "longitude": -73.9851,
  "altitude": 85.5,
  "speed": 25.3,
  "heading": 180.0,
  "batteryLevel": 75,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Get Current Locations
- **Endpoint**: `GET /api/location/current`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get current locations of all UAVs

#### Get Location History
- **Endpoint**: `GET /api/location/history/{uavId}`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get historical location data for a specific UAV

**Path Parameters:**
- `uavId` (integer): UAV ID

**Query Parameters:**
- `startDate` (string): Start date (ISO 8601 format)
- `endDate` (string): End date (ISO 8601 format)
- `limit` (integer): Maximum number of records (default: 100)

#### Get Flight Path
- **Endpoint**: `GET /api/location/flight-path/{uavId}`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get flight path data for visualization

**Path Parameters:**
- `uavId` (integer): UAV ID

**Query Parameters:**
- `startDate` (string): Start date for flight path
- `endDate` (string): End date for flight path

#### Bulk Location Update
- **Endpoint**: `POST /api/location/bulk-update`
- **Authentication**: OPERATOR, ADMIN
- **Description**: Update locations for multiple UAVs in a single request

**Request Body:**
```json
{
  "updates": [
    {
      "uavId": 1,
      "latitude": 40.7589,
      "longitude": -73.9851,
      "altitude": 85.5,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "uavId": 2,
      "latitude": 40.7505,
      "longitude": -73.9934,
      "altitude": 92.1,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 3. Docking Station Management

#### Get All Docking Stations
- **Endpoint**: `GET /api/docking-stations`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Retrieve all docking stations

#### Create Docking Station
- **Endpoint**: `POST /api/docking-stations`
- **Authentication**: ADMIN
- **Description**: Create a new docking station

**Request Body:**
```json
{
  "name": "Station Alpha",
  "description": "Primary docking station for Zone A",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "capacity": 4,
  "stationType": "CHARGING",
  "operationalHours": "24/7",
  "contactInfo": "station-alpha@company.com"
}
```

#### Get Available Stations
- **Endpoint**: `GET /api/docking-stations/available`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get stations with available capacity

#### Find Nearest Stations
- **Endpoint**: `GET /api/docking-stations/nearest`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Find nearest docking stations to a location

**Query Parameters:**
- `latitude` (double): Current latitude
- `longitude` (double): Current longitude
- `radius` (double): Search radius in meters (default: 5000)
- `limit` (integer): Maximum number of results (default: 5)

#### Update Station Status
- **Endpoint**: `PUT /api/docking-stations/{id}/status`
- **Authentication**: OPERATOR, ADMIN
- **Description**: Update the operational status of a docking station

**Path Parameters:**
- `id` (long): Station ID

**Request Body:**
```json
{
  "status": "OPERATIONAL",
  "notes": "Station fully operational after maintenance"
}
```

### 4. Geofence Management

#### Get All Geofences
- **Endpoint**: `GET /api/geofences`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Retrieve all geofences

#### Create Geofence
- **Endpoint**: `POST /api/geofences`
- **Authentication**: ADMIN
- **Description**: Create a new geofence

**Request Body (Circular Geofence):**
```json
{
  "name": "Restricted Zone 1",
  "description": "No-fly zone around airport",
  "fenceType": "CIRCULAR",
  "boundaryType": "EXCLUSION",
  "centerLatitude": 40.7589,
  "centerLongitude": -73.9851,
  "radiusMeters": 1000.0,
  "minAltitudeMeters": 0.0,
  "maxAltitudeMeters": 120.0,
  "priorityLevel": 1,
  "violationAction": "RETURN_TO_BASE",
  "notificationEmails": "admin@company.com,operator@company.com"
}
```

#### Get Active Geofences
- **Endpoint**: `GET /api/geofences/active`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get currently active geofences

#### Check Point Against Geofences
- **Endpoint**: `GET /api/geofences/check-point`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Check if a point violates any geofences

**Query Parameters:**
- `latitude` (double): Point latitude
- `longitude` (double): Point longitude
- `altitude` (double): Point altitude (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "violations": [
      {
        "geofenceId": 1,
        "geofenceName": "Restricted Zone 1",
        "violationType": "EXCLUSION_VIOLATION",
        "distance": 0,
        "action": "RETURN_TO_BASE"
      }
    ],
    "isViolation": true,
    "totalViolations": 1
  }
}
```

### 5. Access Control

#### Validate UAV Access
- **Endpoint**: `POST /api/access/validate`
- **Authentication**: None (Public endpoint)
- **Description**: Validate if a UAV has access to a specific region

**Request Parameters:**
- `rfidId` (string): UAV RFID tag
- `regionName` (string): Region name

**Response:**
- Success: `"OPEN THE DOOR"`
- Failure: Error message explaining why access was denied

### 6. Hibernate Pod Management

#### Get Hibernate Pod Status
- **Endpoint**: `GET /api/hibernate-pod/status`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get current status of the hibernate pod

**Response:**
```json
{
  "success": true,
  "data": {
    "currentCapacity": 2,
    "maxCapacity": 5,
    "isFull": false,
    "availableCapacity": 3,
    "uavIds": [3, 5]
  }
}
```

#### Add UAV to Hibernate Pod
- **Endpoint**: `POST /api/hibernate-pod/add`
- **Authentication**: ADMIN
- **Description**: Add a UAV to the hibernate pod

**Request Body:**
```json
{
  "uavId": 4
}
```

#### Remove UAV from Hibernate Pod
- **Endpoint**: `POST /api/hibernate-pod/remove`
- **Authentication**: ADMIN
- **Description**: Remove a UAV from the hibernate pod

**Request Body:**
```json
{
  "uavId": 4
}
```

#### Get UAVs in Hibernate Pod
- **Endpoint**: `GET /api/hibernate-pod/uavs`
- **Authentication**: USER, OPERATOR, ADMIN
- **Description**: Get list of UAVs currently in hibernate pod

## Error Codes

| Code | Description |
|------|-------------|
| `UAV_NOT_FOUND` | UAV with specified ID not found |
| `REGION_NOT_FOUND` | Region with specified ID not found |
| `UNAUTHORIZED_ACCESS` | UAV not authorized for region |
| `HIBERNATE_POD_FULL` | Cannot add UAV, hibernate pod at capacity |
| `INVALID_LOCATION` | Invalid latitude/longitude coordinates |
| `GEOFENCE_VIOLATION` | Location violates active geofence |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |
| `INVALID_REQUEST` | Request body validation failed |
| `INTERNAL_ERROR` | Internal server error |

## WebSocket Endpoints

The system provides real-time updates through WebSocket connections:

### Connection Endpoints
- `/ws` - Main WebSocket endpoint
- `/ws/dashboard` - Dashboard real-time updates
- `/ws/notifications` - System notifications
- `/ws/monitoring` - System monitoring data

### Subscription Topics
- `/topic/uav-locations` - Real-time UAV location updates
- `/topic/system-stats` - System statistics updates
- `/topic/alerts` - System alerts and notifications
- `/topic/geofence-violations` - Geofence violation alerts

## GraphQL API

The system also provides a GraphQL endpoint at `/graphql` for flexible data querying. See the GraphQL schema documentation for available queries and mutations.

## SDK and Client Libraries

Official client libraries are available for:
- JavaScript/TypeScript (frontend integration)
- Python (data analysis and automation)
- Java (enterprise integration)

## Support and Resources

- **API Status**: `/api/health`
- **API Metrics**: `/actuator/metrics`
- **Documentation**: This document and inline API documentation
- **Support**: Contact development team for assistance
