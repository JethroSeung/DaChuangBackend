package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.service.LocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket Controller for real-time map updates
 * Handles real-time communication for UAV tracking, geofence monitoring, and
 * map updates
 */
@Controller
public class MapWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(MapWebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private LocationService locationService;

    /**
     * Handle client subscription to map updates
     */
    @MessageMapping("/map/subscribe")
    @SendTo("/topic/map-status")
    public Map<String, Object> handleMapSubscription() {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "SUBSCRIPTION_CONFIRMED");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Successfully subscribed to map updates");

        logger.debug("Client subscribed to map updates");
        return response;
    }

    /**
     * Handle UAV tracking requests
     */
    @MessageMapping("/map/track-uav")
    @SendTo("/topic/uav-tracking")
    public Map<String, Object> handleUAVTracking(Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer uavId = (Integer) request.get("uavId");
            String action = (String) request.get("action");

            response.put("type", "UAV_TRACKING_RESPONSE");
            response.put("uavId", uavId);
            response.put("action", action);
            response.put("timestamp", LocalDateTime.now());

            if ("START_TRACKING".equals(action)) {
                response.put("message", "Started tracking UAV " + uavId);
                logger.info("Started tracking UAV {}", uavId);
            } else if ("STOP_TRACKING".equals(action)) {
                response.put("message", "Stopped tracking UAV " + uavId);
                logger.info("Stopped tracking UAV {}", uavId);
            }

        } catch (Exception e) {
            logger.error("Error handling UAV tracking request: {}", e.getMessage(), e);
            response.put("type", "ERROR");
            response.put("message", "Error processing tracking request: " + e.getMessage());
        }

        return response;
    }

    /**
     * Handle geofence monitoring requests
     */
    @MessageMapping("/map/geofence-monitor")
    @SendTo("/topic/geofence-monitoring")
    public Map<String, Object> handleGeofenceMonitoring(Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long geofenceId = Long.valueOf(request.get("geofenceId").toString());
            String action = (String) request.get("action");

            response.put("type", "GEOFENCE_MONITORING_RESPONSE");
            response.put("geofenceId", geofenceId);
            response.put("action", action);
            response.put("timestamp", LocalDateTime.now());

            if ("ENABLE_MONITORING".equals(action)) {
                response.put("message", "Enabled monitoring for geofence " + geofenceId);
                logger.info("Enabled monitoring for geofence {}", geofenceId);
            } else if ("DISABLE_MONITORING".equals(action)) {
                response.put("message", "Disabled monitoring for geofence " + geofenceId);
                logger.info("Disabled monitoring for geofence {}", geofenceId);
            }

        } catch (Exception e) {
            logger.error("Error handling geofence monitoring request: {}", e.getMessage(), e);
            response.put("type", "ERROR");
            response.put("message", "Error processing monitoring request: " + e.getMessage());
        }

        return response;
    }

    /**
     * Handle map view change requests
     */
    @MessageMapping("/map/view-change")
    @SendTo("/topic/map-view")
    public Map<String, Object> handleMapViewChange(Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Double latitude = Double.valueOf(request.get("latitude").toString());
            Double longitude = Double.valueOf(request.get("longitude").toString());
            Integer zoom = Integer.valueOf(request.get("zoom").toString());
            String userId = (String) request.getOrDefault("userId", "anonymous");

            response.put("type", "MAP_VIEW_CHANGED");
            response.put("latitude", latitude);
            response.put("longitude", longitude);
            response.put("zoom", zoom);
            response.put("userId", userId);
            response.put("timestamp", LocalDateTime.now());

            logger.debug("Map view changed by user {} to {}, {} (zoom: {})", userId, latitude, longitude, zoom);

        } catch (Exception e) {
            logger.error("Error handling map view change: {}", e.getMessage(), e);
            response.put("type", "ERROR");
            response.put("message", "Error processing view change: " + e.getMessage());
        }

        return response;
    }

    /**
     * Broadcast real-time dashboard data every 30 seconds
     */
    @Scheduled(fixedRate = 30000) // 30 seconds
    public void broadcastDashboardData() {
        try {
            Map<String, Object> dashboardData = locationService.getTrackingDashboardData();
            dashboardData.put("type", "DASHBOARD_UPDATE");

            messagingTemplate.convertAndSend("/topic/dashboard-updates", dashboardData);

        } catch (Exception e) {
            logger.error("Error broadcasting dashboard data: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast current UAV locations every 15 seconds
     */
    @Scheduled(fixedRate = 15000) // 15 seconds
    public void broadcastCurrentLocations() {
        try {
            Map<String, Object> locationUpdate = new HashMap<>();
            locationUpdate.put("type", "BULK_LOCATION_UPDATE");
            locationUpdate.put("locations", locationService.getCurrentUAVLocations());
            locationUpdate.put("timestamp", LocalDateTime.now());

            messagingTemplate.convertAndSend("/topic/location-updates", locationUpdate);

        } catch (Exception e) {
            logger.error("Error broadcasting current locations: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast system status every minute
     */
    @Scheduled(fixedRate = 60000) // 1 minute
    public void broadcastSystemStatus() {
        try {
            Map<String, Object> systemStatus = new HashMap<>();
            systemStatus.put("type", "SYSTEM_STATUS");
            systemStatus.put("timestamp", LocalDateTime.now());
            systemStatus.put("status", "OPERATIONAL");

            // Add system health metrics
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;

            Map<String, Object> healthMetrics = new HashMap<>();
            healthMetrics.put("memoryUsedMB", usedMemory / (1024 * 1024));
            healthMetrics.put("memoryTotalMB", totalMemory / (1024 * 1024));
            healthMetrics.put("memoryUsagePercent", Math.round((double) usedMemory / totalMemory * 100));

            systemStatus.put("healthMetrics", healthMetrics);

            messagingTemplate.convertAndSend("/topic/system-status", systemStatus);

        } catch (Exception e) {
            logger.error("Error broadcasting system status: {}", e.getMessage(), e);
        }
    }

    /**
     * Send alert to specific user or broadcast to all
     */
    public void sendAlert(String alertType, String message, String targetUser) {
        try {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "ALERT");
            alert.put("alertType", alertType);
            alert.put("message", message);
            alert.put("timestamp", LocalDateTime.now());
            alert.put("severity", getAlertSeverity(alertType));

            if (targetUser != null && !targetUser.isEmpty()) {
                // Send to specific user
                messagingTemplate.convertAndSendToUser(targetUser, "/queue/alerts", alert);
                logger.info("Sent {} alert to user {}: {}", alertType, targetUser, message);
            } else {
                // Broadcast to all users
                messagingTemplate.convertAndSend("/topic/alerts", alert);
                logger.info("Broadcast {} alert: {}", alertType, message);
            }

        } catch (Exception e) {
            logger.error("Error sending alert: {}", e.getMessage(), e);
        }
    }

    /**
     * Send emergency alert
     */
    public void sendEmergencyAlert(String message, Map<String, Object> emergencyData) {
        try {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "EMERGENCY_ALERT");
            alert.put("message", message);
            alert.put("timestamp", LocalDateTime.now());
            alert.put("severity", "CRITICAL");
            alert.put("emergencyData", emergencyData);
            alert.put("requiresAcknowledgment", true);

            // Broadcast emergency alert to all users
            messagingTemplate.convertAndSend("/topic/emergency-alerts", alert);

            logger.warn("Emergency alert broadcast: {}", message);

        } catch (Exception e) {
            logger.error("Error sending emergency alert: {}", e.getMessage(), e);
        }
    }

    /**
     * Send geofence violation notification
     */
    public void sendGeofenceViolationNotification(Map<String, Object> violationData) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "GEOFENCE_VIOLATION");
            notification.put("timestamp", LocalDateTime.now());
            notification.putAll(violationData);

            // Broadcast to geofence violations topic
            messagingTemplate.convertAndSend("/topic/geofence-violations", notification);

            // Also send as high-priority alert
            String message = String.format("Geofence violation: UAV %s violated %s",
                    violationData.get("uavRfidTag"), violationData.get("geofenceName"));
            sendAlert("GEOFENCE_VIOLATION", message, null);

            logger.warn("Geofence violation notification sent: {}", violationData);

        } catch (Exception e) {
            logger.error("Error sending geofence violation notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send docking event notification
     */
    public void sendDockingEventNotification(Map<String, Object> eventData) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "DOCKING_EVENT");
            notification.put("timestamp", LocalDateTime.now());
            notification.putAll(eventData);

            // Broadcast to docking events topic
            messagingTemplate.convertAndSend("/topic/docking-events", notification);

            logger.info("Docking event notification sent: {}", eventData);

        } catch (Exception e) {
            logger.error("Error sending docking event notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Get alert severity based on alert type
     */
    private String getAlertSeverity(String alertType) {
        switch (alertType.toUpperCase()) {
            case "EMERGENCY":
            case "GEOFENCE_VIOLATION":
            case "SYSTEM_FAILURE":
                return "CRITICAL";
            case "LOW_BATTERY":
            case "MAINTENANCE_DUE":
            case "COMMUNICATION_LOSS":
                return "HIGH";
            case "DOCKING_EVENT":
            case "STATUS_CHANGE":
                return "MEDIUM";
            default:
                return "LOW";
        }
    }

    /**
     * Handle client disconnection cleanup
     */
    @MessageMapping("/map/disconnect")
    public void handleClientDisconnect(Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            logger.info("Client {} disconnected from map", userId);

            // Perform any necessary cleanup

        } catch (Exception e) {
            logger.error("Error handling client disconnect: {}", e.getMessage(), e);
        }
    }
}
