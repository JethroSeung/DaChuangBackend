export interface DashboardMetrics {
  totalUAVs: number
  authorizedUAVs: number
  unauthorizedUAVs: number
  activeFlights: number
  hibernatingUAVs: number
  lowBatteryCount: number
  chargingCount: number
  maintenanceCount: number
  emergencyCount: number
  offlineCount: number
  systemHealth: SystemHealth
  realtimeData: RealtimeData
}

export interface SystemHealth {
  overall: HealthStatus
  components: {
    database: ComponentHealth
    webSocket: ComponentHealth
    apiServer: ComponentHealth
    dockingStations: ComponentHealth
    hibernatePods: ComponentHealth
    batteryMonitoring: ComponentHealth
  }
  lastUpdated: string
}

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'

export interface ComponentHealth {
  status: HealthStatus
  message?: string
  lastCheck: string
  uptime?: number
  responseTime?: number
}

export interface RealtimeData {
  activeConnections: number
  messagesPerSecond: number
  dataTransferRate: number
  lastUpdate: string
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  uavId?: string
  location?: {
    latitude: number
    longitude: number
  }
  metadata?: Record<string, unknown>
}

export type AlertType =
  | 'BATTERY_LOW'
  | 'BATTERY_CRITICAL'
  | 'UAV_OFFLINE'
  | 'UNAUTHORIZED_UAV'
  | 'SYSTEM_ERROR'
  | 'MAINTENANCE_DUE'
  | 'GEOFENCE_VIOLATION'
  | 'EMERGENCY_LANDING'
  | 'COMMUNICATION_LOST'
  | 'DOCKING_STATION_ERROR'
  | 'HIBERNATE_POD_FULL'

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ChartData {
  timestamp: string
  value: number
  label?: string
}

export interface UAVActivityChart {
  authorized: ChartData[]
  unauthorized: ChartData[]
  active: ChartData[]
  hibernating: ChartData[]
}

export interface BatteryChart {
  healthy: ChartData[]
  warning: ChartData[]
  critical: ChartData[]
  charging: ChartData[]
}

export interface SystemPerformanceChart {
  cpuUsage: ChartData[]
  memoryUsage: ChartData[]
  networkLatency: ChartData[]
  activeConnections: ChartData[]
}

export interface DashboardFilters {
  timeRange: TimeRange
  uavStatus?: string[]
  alertSeverity?: AlertSeverity[]
  showAcknowledged?: boolean
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom'

export interface CustomTimeRange {
  start: string
  end: string
}

export interface DashboardSettings {
  autoRefresh: boolean
  refreshInterval: number // in seconds
  showNotifications: boolean
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  href?: string
  disabled?: boolean
  badge?: string | number
}

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  visibility: number
  conditions: string
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
}

export interface SystemConfig {
  general: {
    systemName: string
    timezone: string
    language: string
    theme: 'light' | 'dark' | 'auto'
    autoRefresh: boolean
    refreshInterval: number
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    criticalAlerts: boolean
    maintenanceAlerts: boolean
    batteryAlerts: boolean
    communicationAlerts: boolean
    alertSound: boolean
  }
  security: {
    sessionTimeout: number
    passwordExpiry: number
    twoFactorAuth: boolean
    auditLogging: boolean
    ipWhitelist: boolean
    maxLoginAttempts: number
  }
  operations: {
    maxFlightAltitude: number
    defaultFlightSpeed: number
    batteryLowThreshold: number
    batteryCriticalThreshold: number
    autoReturnBattery: number
    geofenceEnabled: boolean
    weatherIntegration: boolean
  }
}
