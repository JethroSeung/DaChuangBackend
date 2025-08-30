package com.uav.dockingmanagement.graphql;

import com.uav.dockingmanagement.model.HibernatePod;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.model.BatteryStatus;
import com.uav.dockingmanagement.model.FlightLog;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.repository.BatteryStatusRepository;
import com.uav.dockingmanagement.repository.FlightLogRepository;
import com.uav.dockingmanagement.repository.DockingStationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GraphQL resolver for system-level queries
 */
@Controller
public class SystemResolver {

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private BatteryStatusRepository batteryStatusRepository;

    @Autowired
    private FlightLogRepository flightLogRepository;

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private HibernatePod hibernatePod;

    /**
     * Get system health information
     */
    @QueryMapping
    public Map<String, Object> systemHealth() {
        Map<String, Object> health = new HashMap<>();

        try {
            // Basic system status
            health.put("status", "OPERATIONAL");
            health.put("lastCheck", LocalDateTime.now());

            // Uptime calculation
            long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();
            long uptimeSeconds = uptimeMillis / 1000;
            long hours = uptimeSeconds / 3600;
            long minutes = (uptimeSeconds % 3600) / 60;
            long seconds = uptimeSeconds % 60;
            health.put("uptime", String.format("%02d:%02d:%02d", hours, minutes, seconds));

            // Database status (simple check)
            try {
                long uavCount = uavRepository.count();
                health.put("databaseStatus", "CONNECTED");
                health.put("totalRecords", uavCount);
            } catch (Exception e) {
                health.put("databaseStatus", "ERROR");
            }

            // Memory usage
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
            long maxMemory = memoryBean.getHeapMemoryUsage().getMax();
            double memoryUsagePercent = (double) usedMemory / maxMemory * 100;
            health.put("memoryUsage", Math.round(memoryUsagePercent * 100.0) / 100.0);

            // CPU usage (approximation)
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            double cpuUsage = 0.0;
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                cpuUsage = ((com.sun.management.OperatingSystemMXBean) osBean).getProcessCpuLoad() * 100;
            }
            health.put("cpuUsage", Math.round(cpuUsage * 100.0) / 100.0);

        } catch (Exception e) {
            health.put("status", "ERROR");
            health.put("error", e.getMessage());
        }

        return health;
    }

    /**
     * Get comprehensive dashboard data
     */
    @QueryMapping
    public Map<String, Object> dashboardData() {
        Map<String, Object> dashboard = new HashMap<>();

        // UAV Statistics
        dashboard.put("uavStatistics", getUAVStatistics());

        // Flight Statistics
        dashboard.put("flightStatistics", getFlightStatistics());

        // Battery Statistics
        dashboard.put("batteryStatistics", getBatteryStatistics());

        // Hibernate Pod Status
        dashboard.put("hibernatePodStatus", getHibernatePodStatus());

        // System Health
        dashboard.put("systemHealth", systemHealth());

        // Recent Alerts (placeholder)
        dashboard.put("recentAlerts", List.of());

        return dashboard;
    }

    /**
     * Get hibernate pod status
     */
    @QueryMapping
    public Map<String, Object> hibernatePodStatus() {
        return getHibernatePodStatus();
    }

    // Helper methods

    private Map<String, Object> getUAVStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<UAV> allUAVs = uavRepository.findAll();

        stats.put("totalUAVs", allUAVs.size());
        stats.put("authorizedUAVs", allUAVs.stream().filter(u -> u.getStatus() == UAV.Status.AUTHORIZED).count());
        stats.put("unauthorizedUAVs", allUAVs.stream().filter(u -> u.getStatus() == UAV.Status.UNAUTHORIZED).count());
        stats.put("operationalUAVs",
                allUAVs.stream().filter(u -> u.getOperationalStatus() == UAV.OperationalStatus.READY).count());
        stats.put("hibernatingUAVs", allUAVs.stream().filter(UAV::isInHibernatePod).count());

        return stats;
    }

    private Map<String, Object> getFlightStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<FlightLog> allFlights = flightLogRepository.findAll();

        stats.put("totalFlights", allFlights.size());
        stats.put("completedFlights",
                allFlights.stream().filter(f -> f.getFlightStatus() == FlightLog.FlightStatus.COMPLETED).count());
        stats.put("activeFlights",
                allFlights.stream().filter(f -> f.getFlightStatus() == FlightLog.FlightStatus.IN_PROGRESS).count());
        stats.put("emergencyLandings", allFlights.stream().filter(FlightLog::getEmergencyLanding).count());

        // Calculate total flight time
        int totalFlightTime = allFlights.stream()
                .filter(f -> f.getFlightDurationMinutes() != null)
                .mapToInt(FlightLog::getFlightDurationMinutes)
                .sum();
        stats.put("totalFlightTimeMinutes", totalFlightTime);

        // Calculate total distance
        double totalDistance = allFlights.stream()
                .filter(f -> f.getDistanceTraveledKm() != null)
                .mapToDouble(FlightLog::getDistanceTraveledKm)
                .sum();
        stats.put("totalDistanceKm", Math.round(totalDistance * 100.0) / 100.0);

        return stats;
    }

    private Map<String, Object> getBatteryStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<BatteryStatus> allBatteries = batteryStatusRepository.findAll();

        stats.put("totalBatteries", allBatteries.size());
        stats.put("lowBatteryCount", allBatteries.stream().filter(b -> b.getCurrentChargePercentage() < 20).count());
        stats.put("criticalBatteryCount",
                allBatteries.stream().filter(b -> b.getCurrentChargePercentage() < 10).count());
        stats.put("chargingCount", allBatteries.stream().filter(BatteryStatus::getIsCharging).count());

        // Calculate average charge percentage
        double avgCharge = allBatteries.stream()
                .mapToInt(BatteryStatus::getCurrentChargePercentage)
                .average()
                .orElse(0.0);
        stats.put("averageChargePercentage", Math.round(avgCharge * 100.0) / 100.0);

        // Calculate average health percentage
        double avgHealth = allBatteries.stream()
                .mapToInt(BatteryStatus::getHealthPercentage)
                .average()
                .orElse(0.0);
        stats.put("averageHealthPercentage", Math.round(avgHealth * 100.0) / 100.0);

        return stats;
    }

    private Map<String, Object> getHibernatePodStatus() {
        Map<String, Object> status = new HashMap<>();

        status.put("currentCapacity", hibernatePod.getCurrentCapacity());
        status.put("maxCapacity", hibernatePod.getMaxCapacity());
        status.put("availableCapacity", hibernatePod.getAvailableCapacity());
        status.put("isFull", hibernatePod.isFull());

        double utilizationPercentage = hibernatePod.getMaxCapacity() > 0
                ? (double) hibernatePod.getCurrentCapacity() / hibernatePod.getMaxCapacity() * 100
                : 0;
        status.put("utilizationPercentage", Math.round(utilizationPercentage * 100.0) / 100.0);

        status.put("uavs", hibernatePod.getUAVs());

        return status;
    }
}
