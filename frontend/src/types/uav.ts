// UAV Management System Types
// Based on the Spring Boot backend models

export enum UAVStatus {
  AUTHORIZED = 'AUTHORIZED',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export enum OperationalStatus {
  READY = 'READY',
  IN_FLIGHT = 'IN_FLIGHT',
  MAINTENANCE = 'MAINTENANCE',
  CHARGING = 'CHARGING',
  HIBERNATING = 'HIBERNATING',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  EMERGENCY = 'EMERGENCY',
  LOST_COMMUNICATION = 'LOST_COMMUNICATION',
}

export enum FlightStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABORTED = 'ABORTED',
  EMERGENCY_LANDED = 'EMERGENCY_LANDED',
  CANCELLED = 'CANCELLED',
}

export enum MaintenanceType {
  ROUTINE_INSPECTION = 'ROUTINE_INSPECTION',
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
  CORRECTIVE_MAINTENANCE = 'CORRECTIVE_MAINTENANCE',
  EMERGENCY_REPAIR = 'EMERGENCY_REPAIR',
  BATTERY_SERVICE = 'BATTERY_SERVICE',
  PROPELLER_REPLACEMENT = 'PROPELLER_REPLACEMENT',
  MOTOR_SERVICE = 'MOTOR_SERVICE',
  SENSOR_CALIBRATION = 'SENSOR_CALIBRATION',
  SOFTWARE_UPDATE = 'SOFTWARE_UPDATE',
  STRUCTURAL_REPAIR = 'STRUCTURAL_REPAIR',
  ANNUAL_INSPECTION = 'ANNUAL_INSPECTION',
  PRE_FLIGHT_CHECK = 'PRE_FLIGHT_CHECK',
  POST_FLIGHT_CHECK = 'POST_FLIGHT_CHECK',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
  WAITING_PARTS = 'WAITING_PARTS',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
}

export interface Region {
  id: number;
  regionName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatteryStatus {
  id: number;
  uavId: number;
  currentChargePercentage: number;
  voltage?: number;
  currentAmperage?: number;
  temperatureCelsius?: number;
  chargingStatus: 'CHARGING' | 'DISCHARGING' | 'FULL' | 'CRITICAL';
  lastChargeDate?: string;
  cycleCount: number;
  healthPercentage: number;
  estimatedTimeToEmpty?: number;
  estimatedTimeToFull?: number;
  isOverheating: boolean;
  needsReplacement: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlightLog {
  id: number;
  uavId: number;
  missionName: string;
  flightDurationMinutes?: number;
  maxAltitudeMeters?: number;
  distanceTraveledKm?: number;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  flightStatus: FlightStatus;
  pilotName?: string;
  weatherConditions?: string;
  notes?: string;
  createdAt: string;
  flightStartTime?: string;
  flightEndTime?: string;
  emergencyLanding: boolean;
  payloadWeightKg?: number;
  averageSpeedKmh?: number;
  maxSpeedKmh?: number;
}

export interface MaintenanceRecord {
  id: number;
  uavId: number;
  maintenanceType: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  technicianName?: string;
  description: string;
  partsReplaced?: string;
  costAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UAV {
  id: number;
  rfidTag: string;
  ownerName: string;
  model: string;
  status: UAVStatus;
  operationalStatus: OperationalStatus;
  inHibernatePod: boolean;
  serialNumber?: string;
  manufacturer?: string;
  weightKg?: number;
  maxFlightTimeMinutes?: number;
  maxAltitudeMeters?: number;
  maxSpeedKmh?: number;
  totalFlightHours: number;
  totalFlightCycles: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDue?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentAltitudeMeters?: number;
  lastLocationUpdate?: string;
  createdAt: string;
  updatedAt: string;
  regions: Region[];
  flightLogs?: FlightLog[];
  maintenanceRecords?: MaintenanceRecord[];
  batteryStatus?: BatteryStatus;
}

// Form types for creating/updating UAVs
export interface CreateUAVRequest {
  rfidTag: string;
  ownerName: string;
  model: string;
  status: UAVStatus;
  inHibernatePod?: boolean;
  regionIds?: number[];
  serialNumber?: string;
  manufacturer?: string;
  weightKg?: number;
  maxFlightTimeMinutes?: number;
  maxAltitudeMeters?: number;
  maxSpeedKmh?: number;
}

export interface UpdateUAVRequest extends Partial<CreateUAVRequest> {
  id: number;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UAVListResponse {
  uavs: UAV[];
  total: number;
  page: number;
  limit: number;
}

export interface SystemStatistics {
  totalUAVs: number;
  authorizedUAVs: number;
  unauthorizedUAVs: number;
  hibernatingUAVs: number;
  activeUAVs: number;
  totalRegions: number;
  hibernatePodCapacity: number;
  hibernatePodUsed: number;
  hibernatePodAvailable: number;
}

// Hibernate Pod types
export interface HibernatePodStatus {
  currentCapacity: number;
  maxCapacity: number;
  utilizationPercentage: number;
  isFull: boolean;
  uavs: UAV[];
}

// Real-time update types
export interface UAVLocationUpdate {
  uavId: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export interface SystemAlert {
  id: string | number;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  title: string;
  message: string;
  uavId?: number;
  timestamp: string;
  acknowledged: boolean;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source?: 'SYSTEM' | 'UAV' | 'USER' | 'EXTERNAL';
}

// Filter and pagination types
export interface UAVFilter {
  status?: UAVStatus;
  operationalStatus?: OperationalStatus;
  inHibernatePod?: boolean;
  regionId?: number;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface UAVStatusUpdate extends WebSocketMessage {
  type: 'UAV_STATUS_UPDATE';
  payload: {
    uavId: number;
    status: UAVStatus;
    operationalStatus: OperationalStatus;
  };
}

export interface BatteryAlert extends WebSocketMessage {
  type: 'BATTERY_ALERT';
  payload: {
    uavId: number;
    batteryLevel: number;
    alertType: 'LOW' | 'CRITICAL' | 'OVERHEATING';
  };
}
