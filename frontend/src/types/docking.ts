// Docking Station and Geofence Types

export enum StationStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  EMERGENCY = 'EMERGENCY',
}

export enum StationType {
  STANDARD = 'STANDARD',
  CHARGING = 'CHARGING',
  MAINTENANCE = 'MAINTENANCE',
  EMERGENCY = 'EMERGENCY',
  WEATHER_SHELTER = 'WEATHER_SHELTER',
}

export enum GeofenceType {
  RESTRICTED = 'RESTRICTED',
  ALLOWED = 'ALLOWED',
  WARNING = 'WARNING',
  NO_FLY_ZONE = 'NO_FLY_ZONE',
  LANDING_ZONE = 'LANDING_ZONE',
}

export interface DockingStation {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  maxCapacity: number;
  currentOccupancy: number;
  status: StationStatus;
  stationType: StationType;
  chargingAvailable: boolean;
  maintenanceAvailable: boolean;
  weatherProtected: boolean;
  securityLevel?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
  dockingRecords?: DockingRecord[];
}

export interface DockingRecord {
  id: number;
  uavId: number;
  stationId: number;
  dockingTime: string;
  undockingTime?: string;
  purpose: 'CHARGING' | 'MAINTENANCE' | 'STORAGE' | 'EMERGENCY';
  status: 'DOCKED' | 'UNDOCKED' | 'IN_PROGRESS';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  uav?: {
    id: number;
    rfidTag: string;
    model: string;
  };
  station?: {
    id: number;
    name: string;
    stationType: StationType;
  };
}

export interface Geofence {
  id: number;
  name: string;
  description?: string;
  geofenceType: GeofenceType;
  isActive: boolean;
  centerLatitude?: number;
  centerLongitude?: number;
  radiusMeters?: number;
  polygonCoordinates?: string; // JSON format: [[lat1,lon1],[lat2,lon2],...]
  minAltitudeMeters?: number;
  maxAltitudeMeters?: number;
  priorityLevel: number;
  violationAction?: string; // ALERT, RETURN_TO_BASE, LAND, etc.
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Location and tracking types
export interface LocationHistory {
  id: number;
  uavId: number;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  accuracy?: number;
  source: 'GPS' | 'MANUAL' | 'ESTIMATED';
}

// API request/response types
export interface CreateDockingStationRequest {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  maxCapacity: number;
  stationType: StationType;
  chargingAvailable?: boolean;
  maintenanceAvailable?: boolean;
  weatherProtected?: boolean;
  securityLevel?: string;
  contactInfo?: string;
}

export interface UpdateDockingStationRequest extends Partial<CreateDockingStationRequest> {
  id: number;
  status?: StationStatus;
  currentOccupancy?: number;
}

export interface CreateGeofenceRequest {
  name: string;
  description?: string;
  geofenceType: GeofenceType;
  centerLatitude?: number;
  centerLongitude?: number;
  radiusMeters?: number;
  polygonCoordinates?: string;
  minAltitudeMeters?: number;
  maxAltitudeMeters?: number;
  priorityLevel?: number;
  violationAction?: string;
}

export interface UpdateGeofenceRequest extends Partial<CreateGeofenceRequest> {
  id: number;
  isActive?: boolean;
}

// Map-related types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  type: 'UAV' | 'STATION' | 'GEOFENCE';
  latitude: number;
  longitude: number;
  data: UAV | DockingStation | Geofence;
  icon?: string;
  color?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  markers: MapMarker[];
}

// Real-time tracking types
export interface TrackingUpdate {
  uavId: number;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  status: {
    operational: string;
    battery: number;
    signal: number;
  };
  timestamp: string;
}

export interface GeofenceViolation {
  id: string;
  uavId: number;
  geofenceId: number;
  violationType: 'ENTRY' | 'EXIT' | 'ALTITUDE';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acknowledged: boolean;
}

// Statistics and analytics types
export interface DockingStatistics {
  totalStations: number;
  operationalStations: number;
  maintenanceStations: number;
  outOfServiceStations: number;
  totalCapacity: number;
  currentOccupancy: number;
  utilizationRate: number;
  averageDockingTime: number;
  totalDockingEvents: number;
}

export interface GeofenceStatistics {
  totalGeofences: number;
  activeGeofences: number;
  restrictedZones: number;
  allowedZones: number;
  noFlyZones: number;
  totalViolations: number;
  recentViolations: number;
}

// Filter types
export interface DockingStationFilter {
  status?: StationStatus;
  stationType?: StationType;
  chargingAvailable?: boolean;
  maintenanceAvailable?: boolean;
  weatherProtected?: boolean;
  search?: string;
}

export interface GeofenceFilter {
  geofenceType?: GeofenceType;
  isActive?: boolean;
  search?: string;
}

export interface LocationHistoryFilter {
  uavId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// WebSocket message types for location tracking
export interface LocationUpdateMessage {
  type: 'LOCATION_UPDATE';
  payload: TrackingUpdate;
}

export interface GeofenceViolationMessage {
  type: 'GEOFENCE_VIOLATION';
  payload: GeofenceViolation;
}

export interface StationStatusMessage {
  type: 'STATION_STATUS_UPDATE';
  payload: {
    stationId: number;
    status: StationStatus;
    currentOccupancy: number;
    timestamp: string;
  };
}
