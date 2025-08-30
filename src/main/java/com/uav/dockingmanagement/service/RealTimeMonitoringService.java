package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.BatteryStatus;
import com.uav.dockingmanagement.model.FlightLog;
import com.uav.dockingmanagement.model.HibernatePod;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.BatteryStatusRepository;
import com.uav.dockingmanagement.repository.FlightLogRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Real-time monitoring service for UAV system
 * Provides live updates via WebSocket for dashboard and monitoring
 */
@Service
public class RealTimeMonitoringService {

    private static final Logger logger = LoggerFactory.getLogger(RealTimeMonitoringService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private FlightLogRepository flightLogRepository;

    @Autowired
    private BatteryStatusRepository batteryStatusRepository;

    @Autowired
    private HibernatePod hibernatePod;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Send real-time system statistics every 30 seconds
     */
    @Scheduled(fixedRate = 30000) // 30 seconds
    public void broadcastSystemStatistics() {
        try {
            Map<String, Object> stats = generateSystemStatistics();
            messagingTemplate.convertAndSend("/topic/system-stats", stats);
            logger.debug("Broadcasted system statistics to {} connected clients", stats.size());
        } catch (Exception e) {
            logger.error("Error broadcasting system statistics: {}", e.getMessage());
        }
    }

    /**
     * Send real-time UAV status updates every 15 seconds
     */
    @Scheduled(fixedRate = 15000) // 15 seconds
    public void broadcastUAVStatus() {
        try {
            List<UAV> uavs = uavRepository.findAll();
            Map<String, Object> uavStatus = new HashMap<>();

            for (UAV uav : uavs) {
                Map<String, Object> status = new HashMap<>();
                status.put("id", uav.getId());
                status.put("rfidTag", uav.getRfidTag());
                status.put("status", uav.getStatus());
                status.put("operationalStatus", uav.getOperationalStatus());
                status.put("inHibernatePod", uav.isInHibernatePod());
                status.put("lastUpdated", uav.getUpdatedAt());

                // Add battery information if available
                if (uav.getBatteryStatus() != null) {
                    BatteryStatus battery = uav.getBatteryStatus();
                    status.put("batteryLevel", battery.getCurrentChargePercentage());
                    status.put("batteryHealth", battery.getHealthPercentage());
                    status.put("isCharging", battery.getIsCharging());
                    status.put("batteryCondition", battery.getBatteryCondition());
                }

                // Add location if available
                if (uav.getCurrentLocationLatitude() != null && uav.getCurrentLocationLongitude() != null) {
                    Map<String, Double> location = new HashMap<>();
                    location.put("latitude", uav.getCurrentLocationLatitude());
                    location.put("longitude", uav.getCurrentLocationLongitude());
                    status.put("location", location);
                    status.put("locationUpdated", uav.getLastKnownLocationUpdate());
                }

                uavStatus.put("uav_" + uav.getId(), status);
            }

            messagingTemplate.convertAndSend("/topic/uav-status", uavStatus);
            logger.debug("Broadcasted UAV status for {} UAVs", uavs.size());
        } catch (Exception e) {
            logger.error("Error broadcasting UAV status: {}", e.getMessage());
        }
    }

    /**
     * Send real-time battery alerts every 60 seconds
     */
    @Scheduled(fixedRate = 60000) // 60 seconds
    public void broadcastBatteryAlerts() {
        try {
            List<BatteryStatus> lowBatteryUAVs = batteryStatusRepository.findLowBatteryUAVs(20);
            List<BatteryStatus> criticalBatteryUAVs = batteryStatusRepository.findCriticalBatteryUAVs();
            List<BatteryStatus> overheatingBatteries = batteryStatusRepository.findOverheatingBatteries(60.0);

            Map<String, Object> batteryAlerts = new HashMap<>();
            batteryAlerts.put("lowBattery", lowBatteryUAVs.size());
            batteryAlerts.put("criticalBattery", criticalBatteryUAVs.size());
            batteryAlerts.put("overheating", overheatingBatteries.size());
            batteryAlerts.put("timestamp", LocalDateTime.now());

            if (!lowBatteryUAVs.isEmpty() || !criticalBatteryUAVs.isEmpty() || !overheatingBatteries.isEmpty()) {
                batteryAlerts.put("details", Map.of(
                        "lowBatteryUAVs", lowBatteryUAVs.stream().map(b -> b.getUav().getRfidTag()).toList(),
                        "criticalBatteryUAVs", criticalBatteryUAVs.stream().map(b -> b.getUav().getRfidTag()).toList(),
                        "overheatingUAVs", overheatingBatteries.stream().map(b -> b.getUav().getRfidTag()).toList()));

                messagingTemplate.convertAndSend("/topic/battery-alerts", batteryAlerts);
                logger.warn("Broadcasted battery alerts: {} low, {} critical, {} overheating",
                        lowBatteryUAVs.size(), criticalBatteryUAVs.size(), overheatingBatteries.size());
            }
        } catch (Exception e) {
            logger.error("Error broadcasting battery alerts: {}", e.getMessage());
        }
    }

    /**
     * Send real-time flight activity updates every 10 seconds
     */
    @Scheduled(fixedRate = 10000) // 10 seconds
    public void broadcastFlightActivity() {
        try {
            List<FlightLog> activeFlights = flightLogRepository
                    .findByFlightStatusOrderByCreatedAtDesc(FlightLog.FlightStatus.IN_PROGRESS);

            Map<String, Object> flightActivity = new HashMap<>();
            flightActivity.put("activeFlights", activeFlights.size());
            flightActivity.put("timestamp", LocalDateTime.now());

            if (!activeFlights.isEmpty()) {
                flightActivity.put("flights", activeFlights.stream().map(flight -> {
                    Map<String, Object> flightInfo = new HashMap<>();
                    flightInfo.put("id", flight.getId());
                    flightInfo.put("missionName", flight.getMissionName());
                    flightInfo.put("uavRfid", flight.getUav().getRfidTag());
                    flightInfo.put("startTime", flight.getFlightStartTime());
                    flightInfo.put("pilotName", flight.getPilotName());
                    return flightInfo;
                }).toList());
            }

            messagingTemplate.convertAndSend("/topic/flight-activity", flightActivity);
            logger.debug("Broadcasted flight activity: {} active flights", activeFlights.size());
        } catch (Exception e) {
            logger.error("Error broadcasting flight activity: {}", e.getMessage());
        }
    }

    /**
     * Send hibernate pod status updates every 20 seconds
     */
    @Scheduled(fixedRate = 20000) // 20 seconds
    public void broadcastHibernatePodStatus() {
        try {
            Map<String, Object> podStatus = new HashMap<>();
            podStatus.put("currentCapacity", hibernatePod.getCurrentCapacity());
            podStatus.put("maxCapacity", hibernatePod.getMaxCapacity());
            podStatus.put("availableCapacity", hibernatePod.getAvailableCapacity());
            podStatus.put("isFull", hibernatePod.isFull());
            podStatus.put("utilizationPercentage",
                    (hibernatePod.getCurrentCapacity() * 100.0) / hibernatePod.getMaxCapacity());
            podStatus.put("timestamp", LocalDateTime.now());

            // Add UAV details in hibernate pod
            podStatus.put("uavs", hibernatePod.getUAVs().stream().map(uav -> {
                Map<String, Object> uavInfo = new HashMap<>();
                uavInfo.put("id", uav.getId());
                uavInfo.put("rfidTag", uav.getRfidTag());
                uavInfo.put("model", uav.getModel());
                uavInfo.put("ownerName", uav.getOwnerName());
                return uavInfo;
            }).toList());

            messagingTemplate.convertAndSend("/topic/hibernate-pod", podStatus);
            logger.debug("Broadcasted hibernate pod status: {}/{} capacity",
                    hibernatePod.getCurrentCapacity(), hibernatePod.getMaxCapacity());
        } catch (Exception e) {
            logger.error("Error broadcasting hibernate pod status: {}", e.getMessage());
        }
    }

    /**
     * Send custom notification to specific user
     */
    public void sendUserNotification(String username, String title, String message, String type) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("message", message);
            notification.put("type", type); // success, warning, error, info
            notification.put("timestamp", LocalDateTime.now());

            messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notification);
            logger.info("Sent notification to user {}: {}", username, title);
        } catch (Exception e) {
            logger.error("Error sending user notification: {}", e.getMessage());
        }
    }

    /**
     * Send broadcast notification to all users
     */
    public void sendBroadcastNotification(String title, String message, String type) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("message", message);
            notification.put("type", type);
            notification.put("timestamp", LocalDateTime.now());

            messagingTemplate.convertAndSend("/topic/notifications", notification);
            logger.info("Sent broadcast notification: {}", title);
        } catch (Exception e) {
            logger.error("Error sending broadcast notification: {}", e.getMessage());
        }
    }

    /**
     * Send emergency alert
     */
    public void sendEmergencyAlert(String uavRfid, String alertType, String description, Double latitude,
            Double longitude) {
        try {
            Map<String, Object> alert = new HashMap<>();
            alert.put("uavRfid", uavRfid);
            alert.put("alertType", alertType);
            alert.put("description", description);
            alert.put("severity", "CRITICAL");
            alert.put("timestamp", LocalDateTime.now());

            if (latitude != null && longitude != null) {
                Map<String, Double> location = new HashMap<>();
                location.put("latitude", latitude);
                location.put("longitude", longitude);
                alert.put("location", location);
            }

            messagingTemplate.convertAndSend("/topic/emergency-alerts", alert);
            logger.error("Sent emergency alert for UAV {}: {}", uavRfid, alertType);
        } catch (Exception e) {
            logger.error("Error sending emergency alert: {}", e.getMessage());
        }
    }

    /**
     * Generate comprehensive system statistics
     */
    private Map<String, Object> generateSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // UAV statistics
        List<UAV> allUAVs = uavRepository.findAll();
        long authorizedUAVs = allUAVs.stream().filter(uav -> uav.getStatus() == UAV.Status.AUTHORIZED).count();
        long unauthorizedUAVs = allUAVs.stream().filter(uav -> uav.getStatus() == UAV.Status.UNAUTHORIZED).count();
        long inFlightUAVs = allUAVs.stream()
                .filter(uav -> uav.getOperationalStatus() == UAV.OperationalStatus.IN_FLIGHT).count();
        long maintenanceUAVs = allUAVs.stream()
                .filter(uav -> uav.getOperationalStatus() == UAV.OperationalStatus.MAINTENANCE).count();

        Map<String, Object> uavStats = new HashMap<>();
        uavStats.put("total", allUAVs.size());
        uavStats.put("authorized", authorizedUAVs);
        uavStats.put("unauthorized", unauthorizedUAVs);
        uavStats.put("inFlight", inFlightUAVs);
        uavStats.put("maintenance", maintenanceUAVs);
        uavStats.put("hibernating", hibernatePod.getCurrentCapacity());

        // Flight statistics
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        List<FlightLog> todayFlights = flightLogRepository.findByDateRange(today, LocalDateTime.now());
        long completedToday = todayFlights.stream().filter(f -> f.getFlightStatus() == FlightLog.FlightStatus.COMPLETED)
                .count();
        long activeFlights = flightLogRepository.countByFlightStatus(FlightLog.FlightStatus.IN_PROGRESS);

        Map<String, Object> flightStats = new HashMap<>();
        flightStats.put("todayTotal", todayFlights.size());
        flightStats.put("todayCompleted", completedToday);
        flightStats.put("active", activeFlights);

        // Battery statistics
        List<BatteryStatus> allBatteries = batteryStatusRepository.findAll();
        long lowBatteryCount = batteryStatusRepository.findLowBatteryUAVs(20).size();
        long criticalBatteryCount = batteryStatusRepository.findCriticalBatteryUAVs().size();
        long chargingCount = batteryStatusRepository.findByIsChargingTrueOrderByLastUpdatedDesc().size();

        Map<String, Object> batteryStats = new HashMap<>();
        batteryStats.put("total", allBatteries.size());
        batteryStats.put("lowBattery", lowBatteryCount);
        batteryStats.put("critical", criticalBatteryCount);
        batteryStats.put("charging", chargingCount);

        // System health
        Map<String, Object> systemHealth = new HashMap<>();
        systemHealth.put("status", "OPERATIONAL");
        systemHealth.put("uptime", System.currentTimeMillis());
        systemHealth.put("lastUpdate", LocalDateTime.now());

        stats.put("uav", uavStats);
        stats.put("flights", flightStats);
        stats.put("battery", batteryStats);
        stats.put("system", systemHealth);
        stats.put("timestamp", LocalDateTime.now());

        return stats;
    }
}
