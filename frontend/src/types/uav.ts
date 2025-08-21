export interface UAV {
  id: string
  rfidTag: string
  status: UAVStatus
  batteryLevel: number
  location?: Location
  region?: string
  lastSeen: string
  createdAt: string
  updatedAt: string
  inHibernatePod: boolean
  dockingStationId?: string
  flightTime?: number
  maintenanceStatus?: MaintenanceStatus
  emergencyStatus?: EmergencyStatus
}

export type UAVStatus =
  | 'AUTHORIZED'
  | 'UNAUTHORIZED'
  | 'ACTIVE'
  | 'HIBERNATING'
  | 'CHARGING'
  | 'MAINTENANCE'
  | 'EMERGENCY'
  | 'OFFLINE'
  | 'ERROR'

export type MaintenanceStatus =
  | 'NONE'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'

export type EmergencyStatus =
  | 'NONE'
  | 'LOW_BATTERY'
  | 'LOST_SIGNAL'
  | 'SYSTEM_ERROR'
  | 'CRASH_DETECTED'
  | 'UNAUTHORIZED_MOVEMENT'

export interface Location {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  timestamp: string
}

export interface UAVFilter {
  status?: UAVStatus[]
  region?: string[]
  batteryLevel?: {
    min?: number
    max?: number
  }
  inHibernatePod?: boolean
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface UAVFormData {
  rfidTag: string
  status: UAVStatus
  inHibernatePod?: boolean
  batteryLevel?: number
  region?: string
}

export interface UAVStats {
  total: number
  authorized: number
  unauthorized: number
  active: number
  hibernating: number
  charging: number
  maintenance: number
  emergency: number
  lowBattery: number
  offline: number
}

export interface HibernatePod {
  id: string
  name: string
  capacity: number
  currentOccupancy: number
  uavs: UAV[]
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE'
  location?: Location
}

export interface DockingStation {
  id: string
  name: string
  location: Location
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE'
  capacity: number
  currentOccupancy: number
  uavs: UAV[]
  chargingPorts: ChargingPort[]
}

export interface ChargingPort {
  id: string
  portNumber: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'CHARGING' | 'ERROR'
  uavId?: string
  chargingStartTime?: string
  estimatedCompletionTime?: string
}

export interface FlightPath {
  id: string
  uavId: string
  waypoints: Location[]
  startTime: string
  endTime?: string
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ABORTED'
}

export interface Geofence {
  id: string
  name: string
  type: 'INCLUSION' | 'EXCLUSION'
  coordinates: Location[]
  active: boolean
  description?: string
}

export interface SystemAlert {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  uavId?: string
  location?: Location
  metadata?: Record<string, unknown>
}

export interface LocationHistory {
  id: string
  uavId: string
  latitude: number
  longitude: number
  altitude?: number
  speed?: number
  heading?: number
  batteryLevel?: number
  timestamp: string
  accuracy?: number
  source: 'GPS' | 'CELLULAR' | 'WIFI' | 'MANUAL' | 'ESTIMATED' | 'RADAR'
  weatherConditions?: string
  notes?: string
}

export interface MaintenanceRecord {
  id: string
  uavId: string
  maintenanceType: 'ROUTINE_INSPECTION' | 'PREVENTIVE_MAINTENANCE' | 'CORRECTIVE_MAINTENANCE' | 'EMERGENCY_REPAIR' | 'BATTERY_SERVICE' | 'PROPELLER_REPLACEMENT' | 'MOTOR_SERVICE' | 'SENSOR_CALIBRATION' | 'SOFTWARE_UPDATE' | 'STRUCTURAL_REPAIR' | 'ANNUAL_INSPECTION' | 'PRE_FLIGHT_CHECK' | 'POST_FLIGHT_CHECK'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' | 'WAITING_PARTS' | 'WAITING_APPROVAL'
  title: string
  description?: string
  technicianName?: string
  estimatedDurationHours?: number
  actualDurationHours?: number
  cost?: number
  partsReplaced?: string
  scheduledDate: string
  startedDate?: string
  completedDate?: string
  nextMaintenanceDate?: string
  flightHoursAtMaintenance?: number
  cyclesAtMaintenance?: number
  warrantyCovered: boolean
  externalService: boolean
  serviceProvider?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DiagnosticResult {
  status: 'PASS' | 'FAIL' | 'WARNING' | 'ERROR'
  results: {
    battery: { status: string; level: number; health: string }
    motors: { status: string; rpm: number[]; temperature: number[] }
    sensors: { status: string; gps: boolean; imu: boolean; camera: boolean }
    communication: { status: string; signalStrength: number; latency: number }
    software: { status: string; version: string; updateAvailable: boolean }
    hardware: { status: string; components: Record<string, string> }
  }
  timestamp: string
  duration: number
  recommendations?: string[]
}
