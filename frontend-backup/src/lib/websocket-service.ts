import { io, Socket } from 'socket.io-client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { useUAVStore } from '@/stores/uav-store';
import {
  WebSocketMessage,
  UAVStatusUpdate,
  BatteryAlert,
  UAVLocationUpdate,
  SystemAlert,
} from '@/types/uav';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

    try {
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionError();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Update connection status in stores
      useDashboardStore.getState().setConnectionStatus(true);
      
      // Subscribe to topics
      this.subscribeToTopics();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      useDashboardStore.getState().setConnectionStatus(false, `Disconnected: ${reason}`);
      
      // Attempt to reconnect if not a manual disconnect
      if (reason !== 'io client disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError();
    });

    // Data event listeners
    this.socket.on('system-stats', this.handleSystemStats.bind(this));
    this.socket.on('uav-status', this.handleUAVStatus.bind(this));
    this.socket.on('battery-alerts', this.handleBatteryAlerts.bind(this));
    this.socket.on('flight-activity', this.handleFlightActivity.bind(this));
    this.socket.on('hibernate-pod', this.handleHibernatePod.bind(this));
    this.socket.on('notifications', this.handleNotifications.bind(this));
    this.socket.on('emergency-alerts', this.handleEmergencyAlerts.bind(this));
    this.socket.on('location-updates', this.handleLocationUpdates.bind(this));
  }

  private subscribeToTopics() {
    if (!this.socket?.connected) return;

    // Subscribe to various data streams
    this.socket.emit('subscribe', 'system-stats');
    this.socket.emit('subscribe', 'uav-status');
    this.socket.emit('subscribe', 'battery-alerts');
    this.socket.emit('subscribe', 'flight-activity');
    this.socket.emit('subscribe', 'hibernate-pod');
    this.socket.emit('subscribe', 'notifications');
    this.socket.emit('subscribe', 'emergency-alerts');
    this.socket.emit('subscribe', 'location-updates');
  }

  private handleSystemStats(data: any) {
    try {
      const dashboardStore = useDashboardStore.getState();
      
      if (data.uav) {
        dashboardStore.updateMetrics({
          totalUAVs: data.uav.total || 0,
          authorizedUAVs: data.uav.authorized || 0,
          unauthorizedUAVs: data.uav.unauthorized || 0,
          activeFlights: data.flights?.active || 0,
          hibernatingUAVs: data.uav.hibernating || 0,
          lowBatteryCount: data.battery?.lowBattery || 0,
          chargingCount: data.battery?.charging || 0,
          maintenanceCount: data.maintenance?.active || 0,
          emergencyCount: data.emergency?.active || 0,
        });
      }

      dashboardStore.updateLastUpdate();
    } catch (error) {
      console.error('Error handling system stats:', error);
    }
  }

  private handleUAVStatus(data: any) {
    try {
      const uavStore = useUAVStore.getState();
      
      // Update UAV in store if it exists
      if (data.uav) {
        uavStore.updateUAVInStore(data.uav);
      }
    } catch (error) {
      console.error('Error handling UAV status:', error);
    }
  }

  private handleBatteryAlerts(data: any) {
    try {
      const dashboardStore = useDashboardStore.getState();
      
      if (data.lowBattery > 0 || data.criticalBattery > 0 || data.overheating > 0) {
        dashboardStore.updateBatteryStats({
          lowBattery: data.lowBattery || 0,
          criticalBattery: data.criticalBattery || 0,
          overheating: data.overheating || 0,
          charging: data.charging || 0,
          healthy: data.healthy || 0,
        });

        // Add alert for critical battery issues
        if (data.criticalBattery > 0) {
          const alert: SystemAlert = {
            id: `battery-critical-${Date.now()}`,
            type: 'CRITICAL',
            title: 'Critical Battery Alert',
            message: `${data.criticalBattery} UAV(s) have critically low battery levels`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
          };
          dashboardStore.addAlert(alert);
        }
      }
    } catch (error) {
      console.error('Error handling battery alerts:', error);
    }
  }

  private handleFlightActivity(data: any) {
    try {
      const dashboardStore = useDashboardStore.getState();
      dashboardStore.updateFlightActivity(data);
    } catch (error) {
      console.error('Error handling flight activity:', error);
    }
  }

  private handleHibernatePod(data: any) {
    try {
      const dashboardStore = useDashboardStore.getState();
      const uavStore = useUAVStore.getState();
      
      dashboardStore.updateHibernatePodMetrics(data);
      uavStore.updateHibernatePodInStore(data);
    } catch (error) {
      console.error('Error handling hibernate pod data:', error);
    }
  }

  private handleNotifications(data: any) {
    try {
      const dashboardStore = useDashboardStore.getState();
      
      const alert: SystemAlert = {
        id: `notification-${Date.now()}`,
        type: 'INFO',
        title: data.title || 'Notification',
        message: data.message || '',
        timestamp: data.timestamp || new Date().toISOString(),
        acknowledged: false,
      };
      
      dashboardStore.addAlert(alert);
    } catch (error) {
      console.error('Error handling notifications:', error);
    }
  }

  private handleEmergencyAlerts(data: any) {
    try {
      const dashboardStore = useDashboardStore.getState();
      
      const alert: SystemAlert = {
        id: `emergency-${Date.now()}`,
        type: 'CRITICAL',
        title: 'EMERGENCY ALERT',
        message: `${data.alertType}: ${data.description}`,
        uavId: data.uavRfid ? parseInt(data.uavRfid) : undefined,
        timestamp: data.timestamp || new Date().toISOString(),
        acknowledged: false,
      };
      
      dashboardStore.addAlert(alert);
    } catch (error) {
      console.error('Error handling emergency alerts:', error);
    }
  }

  private handleLocationUpdates(data: UAVLocationUpdate) {
    try {
      const dashboardStore = useDashboardStore.getState();
      dashboardStore.addLocationUpdate(data);
    } catch (error) {
      console.error('Error handling location updates:', error);
    }
  }

  private handleConnectionError() {
    this.isConnecting = false;
    useDashboardStore.getState().setConnectionStatus(false, 'Connection failed');
    this.handleReconnect();
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      useDashboardStore.getState().setConnectionStatus(false, 'Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Public methods
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  public reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }

  // Send custom messages
  public sendMessage(message: WebSocketMessage) {
    this.emit('message', message);
  }

  // Request specific data
  public requestSystemStats() {
    this.emit('request-system-stats');
  }

  public requestUAVStatus(uavId?: number) {
    this.emit('request-uav-status', { uavId });
  }

  public requestFlightActivity() {
    this.emit('request-flight-activity');
  }
}

// Create singleton instance
let webSocketService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!webSocketService) {
    webSocketService = new WebSocketService();
  }
  return webSocketService;
};

// Hook for using WebSocket service in components
export const useWebSocket = () => {
  return getWebSocketService();
};

export default getWebSocketService;
