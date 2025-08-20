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
  region?: string
  status?: UAVStatus
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
  metadata?: Record<string, any>
}
