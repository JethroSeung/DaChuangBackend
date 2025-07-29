import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SystemAlert, UAVLocationUpdate, BatteryAlert } from '@/types/uav';

// Dashboard-specific types
export interface DashboardMetrics {
  totalUAVs: number;
  authorizedUAVs: number;
  unauthorizedUAVs: number;
  activeFlights: number;
  hibernatingUAVs: number;
  lowBatteryCount: number;
  chargingCount: number;
  maintenanceCount: number;
  emergencyCount: number;
}

export interface FlightActivity {
  activeFlights: number;
  todayFlights: number;
  completedFlights: number;
  flights: Array<{
    id: number;
    uavRfid: string;
    missionName: string;
    startTime: string;
    status: string;
  }>;
}

export interface BatteryStatistics {
  lowBattery: number;
  criticalBattery: number;
  overheating: number;
  charging: number;
  healthy: number;
}

export interface HibernatePodMetrics {
  currentCapacity: number;
  maxCapacity: number;
  utilizationPercentage: number;
  isFull: boolean;
}

export interface ChartData {
  flightTrends: Array<{
    time: string;
    flights: number;
    completed: number;
  }>;
  batteryLevels: Array<{
    uavId: number;
    rfidTag: string;
    batteryLevel: number;
    status: string;
  }>;
  systemLoad: Array<{
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    networkUsage: number;
  }>;
}

interface DashboardState {
  // Real-time data
  metrics: DashboardMetrics | null;
  flightActivity: FlightActivity | null;
  batteryStats: BatteryStatistics | null;
  hibernatePodMetrics: HibernatePodMetrics | null;
  chartData: ChartData | null;
  alerts: SystemAlert[];
  recentLocationUpdates: UAVLocationUpdate[];

  // Connection status
  isConnected: boolean;
  lastUpdate: string | null;
  connectionError: string | null;

  // UI state
  selectedTimeRange: '1h' | '6h' | '24h' | '7d';
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  showAlerts: boolean;

  // Actions
  updateMetrics: (metrics: DashboardMetrics) => void;
  updateFlightActivity: (activity: FlightActivity) => void;
  updateBatteryStats: (stats: BatteryStatistics) => void;
  updateHibernatePodMetrics: (metrics: HibernatePodMetrics) => void;
  updateChartData: (data: Partial<ChartData>) => void;
  addAlert: (alert: SystemAlert) => void;
  removeAlert: (alertId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
  addLocationUpdate: (update: UAVLocationUpdate) => void;
  
  // Connection management
  setConnectionStatus: (connected: boolean, error?: string) => void;
  updateLastUpdate: () => void;
  
  // UI actions
  setTimeRange: (range: '1h' | '6h' | '24h' | '7d') => void;
  toggleAutoRefresh: () => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  toggleAlerts: () => void;
  setShowAlerts: (show: boolean) => void;
  
  // Data fetching
  fetchDashboardData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        metrics: null,
        flightActivity: null,
        batteryStats: null,
        hibernatePodMetrics: null,
        chartData: null,
        alerts: [],
        recentLocationUpdates: [],
        isConnected: false,
        lastUpdate: null,
        connectionError: null,
        selectedTimeRange: '24h',
        autoRefresh: true,
        refreshInterval: 30,
        showAlerts: true,

        // Update metrics
        updateMetrics: (metrics: DashboardMetrics) => {
          set((state) => {
            state.metrics = metrics;
            state.lastUpdate = new Date().toISOString();
          });
        },

        // Update flight activity
        updateFlightActivity: (activity: FlightActivity) => {
          set((state) => {
            state.flightActivity = activity;
          });
        },

        // Update battery statistics
        updateBatteryStats: (stats: BatteryStatistics) => {
          set((state) => {
            state.batteryStats = stats;
          });
        },

        // Update hibernate pod metrics
        updateHibernatePodMetrics: (metrics: HibernatePodMetrics) => {
          set((state) => {
            state.hibernatePodMetrics = metrics;
          });
        },

        // Update chart data
        updateChartData: (data: Partial<ChartData>) => {
          set((state) => {
            if (state.chartData) {
              state.chartData = { ...state.chartData, ...data };
            } else {
              state.chartData = data as ChartData;
            }
          });
        },

        // Add alert
        addAlert: (alert: SystemAlert) => {
          set((state) => {
            // Avoid duplicates
            const exists = state.alerts.some(a => a.id === alert.id);
            if (!exists) {
              state.alerts.unshift(alert);
              // Keep only last 50 alerts
              if (state.alerts.length > 50) {
                state.alerts = state.alerts.slice(0, 50);
              }
            }
          });
        },

        // Remove alert
        removeAlert: (alertId: string) => {
          set((state) => {
            state.alerts = state.alerts.filter(a => a.id !== alertId);
          });
        },

        // Acknowledge alert
        acknowledgeAlert: (alertId: string) => {
          set((state) => {
            const alert = state.alerts.find(a => a.id === alertId);
            if (alert) {
              alert.acknowledged = true;
            }
          });
        },

        // Clear all alerts
        clearAlerts: () => {
          set((state) => {
            state.alerts = [];
          });
        },

        // Add location update
        addLocationUpdate: (update: UAVLocationUpdate) => {
          set((state) => {
            state.recentLocationUpdates.unshift(update);
            // Keep only last 100 updates
            if (state.recentLocationUpdates.length > 100) {
              state.recentLocationUpdates = state.recentLocationUpdates.slice(0, 100);
            }
          });
        },

        // Set connection status
        setConnectionStatus: (connected: boolean, error?: string) => {
          set((state) => {
            state.isConnected = connected;
            state.connectionError = error || null;
            if (connected) {
              state.lastUpdate = new Date().toISOString();
            }
          });
        },

        // Update last update timestamp
        updateLastUpdate: () => {
          set((state) => {
            state.lastUpdate = new Date().toISOString();
          });
        },

        // Set time range
        setTimeRange: (range: '1h' | '6h' | '24h' | '7d') => {
          set((state) => {
            state.selectedTimeRange = range;
          });
          // Trigger data refresh with new time range
          get().refreshData();
        },

        // Toggle auto refresh
        toggleAutoRefresh: () => {
          set((state) => {
            state.autoRefresh = !state.autoRefresh;
          });
        },

        // Set auto refresh
        setAutoRefresh: (enabled: boolean) => {
          set((state) => {
            state.autoRefresh = enabled;
          });
        },

        // Set refresh interval
        setRefreshInterval: (interval: number) => {
          set((state) => {
            state.refreshInterval = interval;
          });
        },

        // Toggle alerts
        toggleAlerts: () => {
          set((state) => {
            state.showAlerts = !state.showAlerts;
          });
        },

        // Set show alerts
        setShowAlerts: (show: boolean) => {
          set((state) => {
            state.showAlerts = show;
          });
        },

        // Fetch dashboard data
        fetchDashboardData: async () => {
          try {
            // This would typically call multiple API endpoints
            // For now, we'll simulate the data structure
            const response = await fetch('/api/analytics/dashboard');
            if (response.ok) {
              const data = await response.json();
              
              set((state) => {
                if (data.metrics) state.metrics = data.metrics;
                if (data.flightActivity) state.flightActivity = data.flightActivity;
                if (data.batteryStats) state.batteryStats = data.batteryStats;
                if (data.hibernatePodMetrics) state.hibernatePodMetrics = data.hibernatePodMetrics;
                if (data.chartData) state.chartData = data.chartData;
                state.lastUpdate = new Date().toISOString();
                state.connectionError = null;
              });
            }
          } catch (error) {
            set((state) => {
              state.connectionError = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
            });
          }
        },

        // Refresh data
        refreshData: async () => {
          await get().fetchDashboardData();
        },
      }))
    ),
    {
      name: 'dashboard-store',
    }
  )
);

// Selectors for computed values
export const useDashboardMetrics = () => useDashboardStore((state) => state.metrics);
export const useFlightActivity = () => useDashboardStore((state) => state.flightActivity);
export const useBatteryStats = () => useDashboardStore((state) => state.batteryStats);
export const useHibernatePodMetrics = () => useDashboardStore((state) => state.hibernatePodMetrics);
export const useChartData = () => useDashboardStore((state) => state.chartData);
export const useAlerts = () => useDashboardStore((state) => state.alerts);
export const useConnectionStatus = () => useDashboardStore((state) => ({
  isConnected: state.isConnected,
  lastUpdate: state.lastUpdate,
  error: state.connectionError,
}));

// Computed selectors
export const useUnacknowledgedAlerts = () => 
  useDashboardStore((state) => state.alerts.filter(alert => !alert.acknowledged));

export const useCriticalAlerts = () => 
  useDashboardStore((state) => state.alerts.filter(alert => alert.type === 'CRITICAL' || alert.type === 'ERROR'));

export const useRecentLocationUpdates = () => 
  useDashboardStore((state) => state.recentLocationUpdates.slice(0, 10));
