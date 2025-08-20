# API Layer Documentation

## Overview

The API layer provides a clean interface between the frontend application and the backend services. It includes HTTP clients, WebSocket connections, error handling, and type-safe API interactions using TypeScript.

## Architecture

```
Frontend Components
        │
        ▼
   Zustand Stores
        │
        ▼
    API Clients
        │
        ▼
   HTTP/WebSocket
        │
        ▼
   Backend Services
```

## Core API Clients

### 1. Base API Client (`api-client.ts`)

**Purpose**: Centralized HTTP client with interceptors, error handling, and authentication.

**Features**:
- Axios-based HTTP client
- Request/response interceptors
- Automatic error handling
- Authentication token management
- Request/response logging

**Configuration**:
```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);
```

**Usage**:
```typescript
import apiClient from '@/lib/api-client';

// GET request
const data = await apiClient.get<UAV[]>('/api/uav/all');

// POST request
const newUAV = await apiClient.post<UAV>('/api/uav', uavData);

// PUT request
const updated = await apiClient.put<UAV>(`/api/uav/${id}`, updateData);

// DELETE request
await apiClient.delete(`/api/uav/${id}`);
```

### 2. UAV API Client (`uav-api.ts`)

**Purpose**: Comprehensive API client for UAV management operations.

**Key Methods**:

```typescript
export class UAVApi {
  /**
   * Retrieves all UAVs with optional filtering and pagination
   */
  async getUAVs(filter?: UAVFilter, pagination?: PaginationParams): Promise<UAV[]>
  
  /**
   * Retrieves a specific UAV by ID
   */
  async getUAVById(id: number): Promise<UAV>
  
  /**
   * Creates a new UAV
   */
  async createUAV(uav: CreateUAVRequest): Promise<APIResponse<UAV>>
  
  /**
   * Updates an existing UAV
   */
  async updateUAV(id: number, uav: Partial<UpdateUAVRequest>): Promise<APIResponse<UAV>>
  
  /**
   * Deletes a UAV
   */
  async deleteUAV(id: number): Promise<APIResponse<void>>
  
  /**
   * Toggles UAV authorization status
   */
  async updateUAVStatus(id: number): Promise<APIResponse<any>>
  
  /**
   * Validates RFID tag uniqueness
   */
  async validateRfidTag(rfidTag: string, excludeId?: number): Promise<{ isUnique: boolean }>
}
```

**Usage Example**:
```typescript
import { uavApi } from '@/api/uav-api';

// Get all authorized UAVs
const authorizedUAVs = await uavApi.getUAVs({ status: 'AUTHORIZED' });

// Create new UAV
const response = await uavApi.createUAV({
  rfidTag: 'UAV-001',
  ownerName: 'John Doe',
  model: 'DJI Phantom 4',
  regionIds: [1, 2]
});

if (response.success) {
  console.log('UAV created:', response.data);
}
```

### 3. Location API Client (`location-api.ts`)

**Purpose**: Handles location tracking, history, and geospatial operations.

**Key Methods**:
```typescript
export class LocationApi {
  /**
   * Updates UAV location with real-time data
   */
  async updateLocation(uavId: number, locationData: LocationUpdateRequest): Promise<APIResponse<void>>
  
  /**
   * Retrieves current locations of all UAVs
   */
  async getCurrentLocations(): Promise<LocationHistory[]>
  
  /**
   * Gets historical location data for a UAV
   */
  async getLocationHistory(
    uavId: number, 
    startDate?: string, 
    endDate?: string, 
    limit?: number
  ): Promise<LocationHistory[]>
  
  /**
   * Gets flight path data for visualization
   */
  async getFlightPath(uavId: number, startDate: string, endDate: string): Promise<FlightPath>
  
  /**
   * Bulk update locations for multiple UAVs
   */
  async bulkUpdateLocations(updates: BulkLocationUpdate[]): Promise<APIResponse<void>>
}
```

### 4. Dashboard API Client (`dashboard-api.ts`)

**Purpose**: Provides dashboard data, statistics, and system metrics.

**Key Methods**:
```typescript
export class DashboardApi {
  /**
   * Gets system-wide statistics
   */
  async getSystemStatistics(): Promise<SystemStatistics>
  
  /**
   * Gets UAV status distribution
   */
  async getUAVStatusDistribution(): Promise<StatusDistribution[]>
  
  /**
   * Gets recent activity feed
   */
  async getRecentActivity(limit?: number): Promise<Activity[]>
  
  /**
   * Gets performance metrics
   */
  async getPerformanceMetrics(timeRange: TimeRange): Promise<PerformanceMetrics>
}
```

## WebSocket Client (`websocket-client.ts`)

**Purpose**: Real-time communication for live updates and notifications.

**Features**:
- Automatic reconnection
- Subscription management
- Message queuing during disconnection
- Type-safe message handling

**Implementation**:
```typescript
class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(url: string): void {
    this.socket = new WebSocket(url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  subscribe<T>(topic: string, callback: (data: T) => void): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    
    this.subscriptions.get(topic)!.add(callback);
    
    // Send subscription message to server
    this.send({ type: 'subscribe', topic });
    
    // Return unsubscribe function
    return () => {
      this.subscriptions.get(topic)?.delete(callback);
      if (this.subscriptions.get(topic)?.size === 0) {
        this.send({ type: 'unsubscribe', topic });
        this.subscriptions.delete(topic);
      }
    };
  }
  
  private handleMessage(message: any): void {
    const { topic, data } = message;
    const callbacks = this.subscriptions.get(topic);
    
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const websocketClient = new WebSocketClient();
```

**Usage**:
```typescript
import { websocketClient } from '@/api/websocket-client';

// Connect to WebSocket
websocketClient.connect('ws://localhost:8080/ws');

// Subscribe to UAV location updates
const unsubscribe = websocketClient.subscribe<LocationUpdate>(
  'uav.location.updates',
  (locationUpdate) => {
    console.log('Location update:', locationUpdate);
    // Update store or component state
  }
);

// Subscribe to system alerts
websocketClient.subscribe<SystemAlert>(
  'system.alerts',
  (alert) => {
    toast.error(alert.message);
  }
);

// Cleanup subscription
useEffect(() => {
  return unsubscribe;
}, []);
```

## Error Handling

### 1. API Error Types

```typescript
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export class APIException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIException';
  }
}
```

### 2. Error Handler

```typescript
export function handleApiError(error: AxiosError): never {
  if (error.response) {
    // Server responded with error status
    const apiError = error.response.data as APIError;
    
    switch (error.response.status) {
      case 400:
        throw new APIException('VALIDATION_ERROR', apiError.message, apiError.details);
      case 401:
        // Handle authentication error
        redirectToLogin();
        throw new APIException('UNAUTHORIZED', 'Please log in to continue');
      case 403:
        throw new APIException('FORBIDDEN', 'You do not have permission for this action');
      case 404:
        throw new APIException('NOT_FOUND', apiError.message || 'Resource not found');
      case 500:
        throw new APIException('SERVER_ERROR', 'Internal server error occurred');
      default:
        throw new APIException('UNKNOWN_ERROR', apiError.message || 'An unknown error occurred');
    }
  } else if (error.request) {
    // Network error
    throw new APIException('NETWORK_ERROR', 'Unable to connect to server');
  } else {
    // Request setup error
    throw new APIException('REQUEST_ERROR', error.message);
  }
}
```

### 3. Error Boundary Integration

```typescript
// In components
try {
  await uavApi.createUAV(uavData);
  toast.success('UAV created successfully');
} catch (error) {
  if (error instanceof APIException) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        setFormErrors(error.details);
        break;
      case 'DUPLICATE_RFID':
        setFieldError('rfidTag', 'RFID tag already exists');
        break;
      default:
        toast.error(error.message);
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

## Type Definitions

### 1. Request/Response Types

```typescript
// UAV types
export interface UAV {
  id: number;
  rfidTag: string;
  ownerName: string;
  model: string;
  status: 'AUTHORIZED' | 'UNAUTHORIZED';
  operationalStatus: 'READY' | 'IN_FLIGHT' | 'MAINTENANCE' | 'OFFLINE';
  // ... other properties
}

export interface CreateUAVRequest {
  rfidTag: string;
  ownerName: string;
  model: string;
  serialNumber?: string;
  manufacturer?: string;
  regionIds?: number[];
}

export interface UpdateUAVRequest {
  ownerName?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
}

// API response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  timestamp: string;
}
```

### 2. Filter and Pagination Types

```typescript
export interface UAVFilter {
  status?: 'AUTHORIZED' | 'UNAUTHORIZED';
  operationalStatus?: 'READY' | 'IN_FLIGHT' | 'MAINTENANCE' | 'OFFLINE';
  manufacturer?: string;
  model?: string;
  regionId?: number;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

## Caching Strategy

### 1. HTTP Cache Headers

```typescript
// Configure cache headers for different endpoints
const cacheConfig = {
  'GET /api/uav/all': { maxAge: 300 }, // 5 minutes
  'GET /api/regions': { maxAge: 3600 }, // 1 hour
  'GET /api/statistics': { maxAge: 60 }, // 1 minute
};
```

### 2. Client-side Caching

```typescript
class CachedApiClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  async get<T>(url: string, ttl = 300000): Promise<T> {
    const cached = this.cache.get(url);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    const data = await apiClient.get<T>(url);
    this.cache.set(url, { data, timestamp: Date.now(), ttl });
    
    return data;
  }
  
  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

## Testing API Clients

### 1. Mock API Responses

```typescript
import { jest } from '@jest/globals';
import { uavApi } from '@/api/uav-api';

// Mock the API client
jest.mock('@/lib/api-client');

describe('UAVApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should fetch UAVs successfully', async () => {
    const mockUAVs = [
      { id: 1, rfidTag: 'UAV-001', ownerName: 'John Doe' }
    ];
    
    (apiClient.get as jest.Mock).mockResolvedValue(mockUAVs);
    
    const result = await uavApi.getUAVs();
    
    expect(result).toEqual(mockUAVs);
    expect(apiClient.get).toHaveBeenCalledWith('/api/uav/all');
  });
  
  it('should handle API errors', async () => {
    const error = new Error('Network error');
    (apiClient.get as jest.Mock).mockRejectedValue(error);
    
    await expect(uavApi.getUAVs()).rejects.toThrow('Network error');
  });
});
```

### 2. Integration Testing

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { uavApi } from '@/api/uav-api';

const server = setupServer(
  rest.get('/api/uav/all', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, rfidTag: 'UAV-001', ownerName: 'John Doe' }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UAV API Integration', () => {
  it('should fetch UAVs from server', async () => {
    const uavs = await uavApi.getUAVs();
    
    expect(uavs).toHaveLength(1);
    expect(uavs[0].rfidTag).toBe('UAV-001');
  });
});
```

## Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_API_TIMEOUT=10000

# Development Settings
NEXT_PUBLIC_API_DEBUG=true
NEXT_PUBLIC_MOCK_API=false
```

### API Client Configuration

```typescript
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  retries: 3,
  retryDelay: 1000,
  debug: process.env.NEXT_PUBLIC_API_DEBUG === 'true',
};
```

This API layer provides a robust, type-safe, and maintainable interface for frontend-backend communication with comprehensive error handling, caching, and real-time capabilities.
