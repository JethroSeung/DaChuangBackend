package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.model.FlightLog;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.BatteryStatusRepository;
import com.uav.dockingmanagement.repository.FlightLogRepository;
import com.uav.dockingmanagement.repository.MaintenanceRecordRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.service.FlightLogService;
import com.uav.dockingmanagement.service.ErrorTrackingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Dashboard Controller
 * Provides comprehensive analytics and reporting endpoints
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsDashboardController.class);

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private FlightLogRepository flightLogRepository;

    @Autowired
    private BatteryStatusRepository batteryStatusRepository;

    @Autowired
    private MaintenanceRecordRepository maintenanceRecordRepository;

    @Autowired
    private FlightLogService flightLogService;

    @Autowired
    private ErrorTrackingService errorTrackingService;

    /**
     * Get comprehensive dashboard analytics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        try {
            Map<String, Object> analytics = new HashMap<>();

            // UAV Analytics
            analytics.put("uavAnalytics", getUAVAnalytics());

            // Flight Analytics
            analytics.put("flightAnalytics", getFlightAnalytics());

            // Battery Analytics
            analytics.put("batteryAnalytics", getBatteryAnalytics());

            // Maintenance Analytics
            analytics.put("maintenanceAnalytics", getMaintenanceAnalytics());

            // Performance Trends
            analytics.put("performanceTrends", getPerformanceTrends());

            // System Health
            analytics.put("systemHealth", getSystemHealth());

            analytics.put("generatedAt", LocalDateTime.now());

            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            logger.error("Error generating dashboard analytics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get flight analytics for specific date range
     */
    @GetMapping("/flights")
    public ResponseEntity<Map<String, Object>> getFlightAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        try {
            if (startDate == null)
                startDate = LocalDateTime.now().minusDays(30);
            if (endDate == null)
                endDate = LocalDateTime.now();

            List<FlightLog> flights = flightLogRepository.findByDateRange(startDate, endDate);

            Map<String, Object> analytics = new HashMap<>();

            // Basic statistics
            analytics.put("totalFlights", flights.size());
            analytics.put("completedFlights",
                    flights.stream().filter(f -> f.getFlightStatus() == FlightLog.FlightStatus.COMPLETED).count());
            analytics.put("abortedFlights",
                    flights.stream().filter(f -> f.getFlightStatus() == FlightLog.FlightStatus.ABORTED).count());
            analytics.put("emergencyLandings", flights.stream().filter(FlightLog::getEmergencyLanding).count());

            // Duration analytics
            OptionalDouble avgDuration = flights.stream()
                    .filter(f -> f.getFlightDurationMinutes() != null)
                    .mapToInt(FlightLog::getFlightDurationMinutes)
                    .average();
            analytics.put("averageFlightDuration", avgDuration.isPresent() ? avgDuration.getAsDouble() : 0);

            // Distance analytics
            OptionalDouble totalDistance = flights.stream()
                    .filter(f -> f.getDistanceTraveledKm() != null)
                    .mapToDouble(FlightLog::getDistanceTraveledKm)
                    .reduce(Double::sum);
            analytics.put("totalDistance", totalDistance.isPresent() ? totalDistance.getAsDouble() : 0);

            // Daily flight trends
            Map<String, Long> dailyFlights = flights.stream()
                    .collect(Collectors.groupingBy(
                            f -> f.getCreatedAt().toLocalDate().toString(),
                            Collectors.counting()));
            analytics.put("dailyFlightTrends", dailyFlights);

            // UAV utilization
            Map<String, Long> uavUtilization = flights.stream()
                    .collect(Collectors.groupingBy(
                            f -> f.getUav().getRfidTag(),
                            Collectors.counting()));
            analytics.put("uavUtilization", uavUtilization);

            // Mission type analysis
            Map<String, Long> missionTypes = flights.stream()
                    .collect(Collectors.groupingBy(
                            f -> f.getMissionName() != null ? f.getMissionName().split(" ")[0] : "Unknown",
                            Collectors.counting()));
            analytics.put("missionTypes", missionTypes);

            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            logger.error("Error generating flight analytics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get UAV performance metrics
     */
    @GetMapping("/uav-performance")
    public ResponseEntity<Map<String, Object>> getUAVPerformanceMetrics() {
        try {
            List<UAV> uavs = uavRepository.findAll();
            Map<String, Object> performance = new HashMap<>();

            List<Map<String, Object>> uavMetrics = new ArrayList<>();

            for (UAV uav : uavs) {
                Map<String, Object> metrics = new HashMap<>();
                metrics.put("uavId", uav.getId());
                metrics.put("rfidTag", uav.getRfidTag());
                metrics.put("model", uav.getModel());

                // Flight statistics
                FlightLogService.FlightStatistics stats = flightLogService.getFlightStatistics(uav);
                metrics.put("totalFlightTime", stats.getTotalFlightTimeMinutes());
                metrics.put("totalFlights", stats.getTotalFlights());
                metrics.put("completedFlights", stats.getCompletedFlights());
                metrics.put("averageFlightDuration", stats.getAverageFlightDurationMinutes());
                metrics.put("maxAltitude", stats.getMaxAltitudeMeters());
                metrics.put("totalDistance", stats.getTotalDistanceKm());

                // Reliability metrics
                double reliability = stats.getTotalFlights() > 0
                        ? (double) stats.getCompletedFlights() / stats.getTotalFlights() * 100
                        : 0;
                metrics.put("reliability", reliability);

                // Battery health
                if (uav.getBatteryStatus() != null) {
                    metrics.put("batteryHealth", uav.getBatteryStatus().getHealthPercentage());
                    metrics.put("batteryCycles", uav.getBatteryStatus().getCycleCount());
                }

                // Maintenance metrics
                long maintenanceCount = maintenanceRecordRepository.countByUav(uav);
                metrics.put("maintenanceCount", maintenanceCount);

                uavMetrics.add(metrics);
            }

            performance.put("uavMetrics", uavMetrics);
            performance.put("generatedAt", LocalDateTime.now());

            return ResponseEntity.ok(performance);

        } catch (Exception e) {
            logger.error("Error generating UAV performance metrics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get battery health trends
     */
    @GetMapping("/battery-trends")
    public ResponseEntity<Map<String, Object>> getBatteryTrends() {
        try {
            Map<String, Object> trends = new HashMap<>();

            // Battery statistics
            Object[] batteryStats = batteryStatusRepository.getBatteryStatistics();
            if (batteryStats != null && batteryStats.length > 0) {
                trends.put("totalBatteries", batteryStats[0]);
                trends.put("lowBatteryCount", batteryStats[1]);
                trends.put("criticalBatteryCount", batteryStats[2]);
                trends.put("chargingCount", batteryStats[3]);
                trends.put("problemBatteryCount", batteryStats[4]);
                trends.put("avgChargePercentage", batteryStats[5]);
                trends.put("avgHealthPercentage", batteryStats[6]);
                trends.put("avgCycleCount", batteryStats[7]);
            }

            // Battery condition distribution
            List<Object[]> conditionData = batteryStatusRepository.countBatteriesByCondition();
            Map<String, Long> conditionDistribution = conditionData.stream()
                    .collect(Collectors.toMap(
                            row -> row[0].toString(),
                            row -> (Long) row[1]));
            trends.put("conditionDistribution", conditionDistribution);

            // Charging status distribution
            List<Object[]> chargingData = batteryStatusRepository.countBatteriesByChargingStatus();
            Map<String, Long> chargingDistribution = chargingData.stream()
                    .collect(Collectors.toMap(
                            row -> row[0].toString(),
                            row -> (Long) row[1]));
            trends.put("chargingDistribution", chargingDistribution);

            return ResponseEntity.ok(trends);

        } catch (Exception e) {
            logger.error("Error generating battery trends: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get maintenance analytics
     */
    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> getMaintenanceAnalyticsEndpoint() {
        try {
            Map<String, Object> analytics = getMaintenanceAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error generating maintenance analytics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get system utilization metrics
     */
    @GetMapping("/utilization")
    public ResponseEntity<Map<String, Object>> getSystemUtilization() {
        try {
            Map<String, Object> utilization = new HashMap<>();

            // UAV utilization
            List<UAV> allUAVs = uavRepository.findAll();
            long activeUAVs = allUAVs.stream()
                    .filter(uav -> uav.getOperationalStatus() == UAV.OperationalStatus.READY ||
                            uav.getOperationalStatus() == UAV.OperationalStatus.IN_FLIGHT)
                    .count();

            utilization.put("uavUtilization", allUAVs.isEmpty() ? 0 : (double) activeUAVs / allUAVs.size() * 100);

            // Flight activity (last 24 hours)
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            List<FlightLog> recentFlights = flightLogRepository.findByDateRange(yesterday, LocalDateTime.now());
            utilization.put("dailyFlightActivity", recentFlights.size());

            // Hourly flight distribution
            Map<Integer, Long> hourlyDistribution = recentFlights.stream()
                    .collect(Collectors.groupingBy(
                            f -> f.getCreatedAt().getHour(),
                            Collectors.counting()));
            utilization.put("hourlyFlightDistribution", hourlyDistribution);

            return ResponseEntity.ok(utilization);

        } catch (Exception e) {
            logger.error("Error generating system utilization: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get error tracking analytics
     */
    @GetMapping("/errors")
    public ResponseEntity<Map<String, Object>> getErrorAnalytics() {
        try {
            Map<String, Object> errorAnalytics = errorTrackingService.getErrorStatistics();
            return ResponseEntity.ok(errorAnalytics);
        } catch (Exception e) {
            logger.error("Error generating error analytics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get recent errors
     */
    @GetMapping("/errors/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentErrors(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<Map<String, Object>> recentErrors = errorTrackingService.getRecentErrors(limit);
            return ResponseEntity.ok(recentErrors);
        } catch (Exception e) {
            logger.error("Error getting recent errors: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get error trends
     */
    @GetMapping("/errors/trends")
    public ResponseEntity<Map<String, Object>> getErrorTrends() {
        try {
            Map<String, Object> trends = errorTrackingService.getErrorTrends();
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            logger.error("Error getting error trends: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper methods for generating analytics data
    private Map<String, Object> getUAVAnalytics() {
        List<UAV> uavs = uavRepository.findAll();
        Map<String, Object> analytics = new HashMap<>();

        analytics.put("totalUAVs", uavs.size());
        analytics.put("authorizedUAVs", uavs.stream().filter(u -> u.getStatus() == UAV.Status.AUTHORIZED).count());
        analytics.put("unauthorizedUAVs", uavs.stream().filter(u -> u.getStatus() == UAV.Status.UNAUTHORIZED).count());

        // Operational status distribution
        Map<UAV.OperationalStatus, Long> statusDistribution = uavs.stream()
                .collect(Collectors.groupingBy(UAV::getOperationalStatus, Collectors.counting()));
        analytics.put("operationalStatusDistribution", statusDistribution);

        return analytics;
    }

    private Map<String, Object> getFlightAnalytics() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<FlightLog> recentFlights = flightLogRepository.findRecentFlightLogs(thirtyDaysAgo);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalFlights", recentFlights.size());
        analytics.put("completedFlights",
                recentFlights.stream().filter(f -> f.getFlightStatus() == FlightLog.FlightStatus.COMPLETED).count());
        analytics.put("emergencyLandings", recentFlights.stream().filter(FlightLog::getEmergencyLanding).count());

        return analytics;
    }

    private Map<String, Object> getBatteryAnalytics() {
        Object[] stats = batteryStatusRepository.getBatteryStatistics();
        Map<String, Object> analytics = new HashMap<>();

        if (stats != null && stats.length > 0) {
            analytics.put("totalBatteries", stats[0]);
            analytics.put("lowBatteryCount", stats[1]);
            analytics.put("criticalBatteryCount", stats[2]);
            analytics.put("averageHealth", stats[6]);
        }

        return analytics;
    }

    private Map<String, Object> getMaintenanceAnalytics() {
        Object[] stats = maintenanceRecordRepository.getMaintenanceStatistics();
        Map<String, Object> analytics = new HashMap<>();

        if (stats != null && stats.length > 0) {
            analytics.put("totalRecords", stats[0]);
            analytics.put("completedRecords", stats[1]);
            analytics.put("scheduledRecords", stats[2]);
            analytics.put("overdueRecords", stats[4]);
        }

        return analytics;
    }

    private Map<String, Object> getPerformanceTrends() {
        Map<String, Object> trends = new HashMap<>();

        // Weekly flight trends
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<FlightLog> weeklyFlights = flightLogRepository.findByDateRange(weekAgo, LocalDateTime.now());

        Map<String, Long> dailyTrends = weeklyFlights.stream()
                .collect(Collectors.groupingBy(
                        f -> f.getCreatedAt().toLocalDate().toString(),
                        Collectors.counting()));
        trends.put("weeklyFlightTrends", dailyTrends);

        return trends;
    }

    private Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "OPERATIONAL");
        health.put("uptime", System.currentTimeMillis());
        health.put("lastCheck", LocalDateTime.now());
        return health;
    }
}
