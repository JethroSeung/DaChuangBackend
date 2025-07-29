package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.LocationHistory;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.LocationHistoryRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
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
import java.util.Random;

/**
 * Service for simulating real-time UAV movements and updates
 * Provides realistic movement patterns and WebSocket broadcasts for demonstration
 */
@Service
public class RealTimeSimulationService {

    private static final Logger logger = LoggerFactory.getLogger(RealTimeSimulationService.class);

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private LocationService locationService;

    @Autowired
    private GeofenceService geofenceService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Random random = new Random();
    private boolean simulationEnabled = true;

    /**
     * Simulate UAV movements every 10 seconds
     */
    @Scheduled(fixedRate = 10000) // 10 seconds
    public void simulateUAVMovements() {
        if (!simulationEnabled) {
            return;
        }

        try {
            List<UAV> activeUAVs = uavRepository.findAll().stream()
                .filter(uav -> uav.hasLocationData() && 
                              uav.getOperationalStatus() != UAV.OperationalStatus.HIBERNATING &&
                              uav.getOperationalStatus() != UAV.OperationalStatus.OUT_OF_SERVICE)
                .toList();

            for (UAV uav : activeUAVs) {
                simulateUAVMovement(uav);
            }

            if (!activeUAVs.isEmpty()) {
                logger.debug("Simulated movement for {} UAVs", activeUAVs.size());
            }

        } catch (Exception e) {
            logger.error("Error simulating UAV movements: {}", e.getMessage(), e);
        }
    }

    /**
     * Simulate movement for a single UAV
     */
    private void simulateUAVMovement(UAV uav) {
        try {
            // Get current position
            double currentLat = uav.getCurrentLatitude();
            double currentLon = uav.getCurrentLongitude();
            double currentAlt = uav.getCurrentAltitudeMeters();

            // Generate realistic movement based on operational status
            MovementPattern pattern = getMovementPattern(uav.getOperationalStatus());
            
            // Calculate new position
            double[] newPosition = calculateNewPosition(currentLat, currentLon, currentAlt, pattern);
            double newLat = newPosition[0];
            double newLon = newPosition[1];
            double newAlt = newPosition[2];

            // Ensure altitude stays within reasonable bounds
            newAlt = Math.max(5.0, Math.min(120.0, newAlt));

            // Update UAV location
            uav.setCurrentLatitude(newLat);
            uav.setCurrentLongitude(newLon);
            uav.setCurrentAltitudeMeters(newAlt);
            uav.setLastLocationUpdate(LocalDateTime.now());
            uavRepository.save(uav);

            // Create location history entry
            LocationHistory locationHistory = new LocationHistory(uav, newLat, newLon, newAlt);
            locationHistory.setSpeedKmh(pattern.speed + (random.nextGaussian() * 5));
            locationHistory.setHeadingDegrees(pattern.heading);
            locationHistory.setBatteryLevel(simulateBatteryLevel(uav));
            locationHistory.setLocationSource(LocationHistory.LocationSource.GPS);
            locationHistory.setAccuracyMeters(random.nextDouble() * 3 + 1);
            locationHistory.setSignalStrength(random.nextInt(20) + 80);

            locationHistoryRepository.save(locationHistory);

            // Check geofences
            locationService.checkGeofenceViolations(uav, newLat, newLon, newAlt);

            // Broadcast location update
            broadcastLocationUpdate(uav, locationHistory);

        } catch (Exception e) {
            logger.error("Error simulating movement for UAV {}: {}", uav.getRfidTag(), e.getMessage(), e);
        }
    }

    /**
     * Get movement pattern based on operational status
     */
    private MovementPattern getMovementPattern(UAV.OperationalStatus status) {
        switch (status) {
            case IN_FLIGHT:
                return new MovementPattern(
                    random.nextDouble() * 0.002 - 0.001, // lat change: ~±100m
                    random.nextDouble() * 0.002 - 0.001, // lon change: ~±100m
                    random.nextDouble() * 10 - 5,        // alt change: ±5m
                    random.nextDouble() * 40 + 20,       // speed: 20-60 km/h
                    random.nextDouble() * 360             // heading: 0-360°
                );
            case READY:
                return new MovementPattern(
                    random.nextDouble() * 0.0005 - 0.00025, // small movement
                    random.nextDouble() * 0.0005 - 0.00025,
                    random.nextDouble() * 2 - 1,
                    random.nextDouble() * 10 + 5,        // speed: 5-15 km/h
                    random.nextDouble() * 360
                );
            case CHARGING:
            case MAINTENANCE:
                return new MovementPattern(0, 0, 0, 0, 0); // stationary
            default:
                return new MovementPattern(
                    random.nextDouble() * 0.001 - 0.0005,
                    random.nextDouble() * 0.001 - 0.0005,
                    random.nextDouble() * 5 - 2.5,
                    random.nextDouble() * 20 + 10,
                    random.nextDouble() * 360
                );
        }
    }

    /**
     * Calculate new position based on movement pattern
     */
    private double[] calculateNewPosition(double lat, double lon, double alt, MovementPattern pattern) {
        double newLat = lat + pattern.latChange;
        double newLon = lon + pattern.lonChange;
        double newAlt = alt + pattern.altChange;

        // Add some randomness to make movement more realistic
        newLat += (random.nextGaussian() * 0.0001); // ~10m standard deviation
        newLon += (random.nextGaussian() * 0.0001);
        newAlt += (random.nextGaussian() * 2);

        return new double[]{newLat, newLon, newAlt};
    }

    /**
     * Simulate battery level changes
     */
    private Integer simulateBatteryLevel(UAV uav) {
        // Get last known battery level from location history
        LocationHistory lastLocation = locationHistoryRepository.findLatestLocationByUavId(uav.getId()).orElse(null);
        
        int currentBattery = lastLocation != null && lastLocation.getBatteryLevel() != null ? 
            lastLocation.getBatteryLevel() : 80;

        // Simulate battery drain based on operational status
        int batteryChange = 0;
        switch (uav.getOperationalStatus()) {
            case IN_FLIGHT:
                batteryChange = random.nextInt(3) + 1; // drain 1-3%
                break;
            case CHARGING:
                batteryChange = -(random.nextInt(5) + 2); // charge 2-6%
                break;
            case READY:
                batteryChange = random.nextInt(2); // drain 0-1%
                break;
            default:
                batteryChange = random.nextInt(2); // minimal drain
                break;
        }

        int newBattery = Math.max(0, Math.min(100, currentBattery - batteryChange));
        
        // Trigger low battery alert if needed
        if (newBattery <= 20 && currentBattery > 20) {
            triggerLowBatteryAlert(uav, newBattery);
        }

        return newBattery;
    }

    /**
     * Broadcast location update via WebSocket
     */
    private void broadcastLocationUpdate(UAV uav, LocationHistory location) {
        try {
            Map<String, Object> update = new HashMap<>();
            update.put("type", "LOCATION_UPDATE");
            update.put("timestamp", LocalDateTime.now());
            update.put("uavId", uav.getId());
            update.put("rfidTag", uav.getRfidTag());
            update.put("latitude", location.getLatitude());
            update.put("longitude", location.getLongitude());
            update.put("altitude", location.getAltitudeMeters());
            update.put("speed", location.getSpeedKmh());
            update.put("heading", location.getHeadingDegrees());
            update.put("batteryLevel", location.getBatteryLevel());
            update.put("status", uav.getStatus());
            update.put("operationalStatus", uav.getOperationalStatus());

            messagingTemplate.convertAndSend("/topic/location-updates", update);

        } catch (Exception e) {
            logger.error("Error broadcasting location update: {}", e.getMessage(), e);
        }
    }

    /**
     * Trigger low battery alert
     */
    private void triggerLowBatteryAlert(UAV uav, int batteryLevel) {
        try {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "LOW_BATTERY_ALERT");
            alert.put("timestamp", LocalDateTime.now());
            alert.put("uavId", uav.getId());
            alert.put("rfidTag", uav.getRfidTag());
            alert.put("batteryLevel", batteryLevel);
            alert.put("severity", batteryLevel <= 10 ? "CRITICAL" : "HIGH");
            alert.put("message", String.format("UAV %s has low battery: %d%%", uav.getRfidTag(), batteryLevel));

            messagingTemplate.convertAndSend("/topic/alerts", alert);
            
            logger.warn("Low battery alert for UAV {}: {}%", uav.getRfidTag(), batteryLevel);

        } catch (Exception e) {
            logger.error("Error triggering low battery alert: {}", e.getMessage(), e);
        }
    }

    /**
     * Simulate random events every 2 minutes
     */
    @Scheduled(fixedRate = 120000) // 2 minutes
    public void simulateRandomEvents() {
        if (!simulationEnabled) {
            return;
        }

        try {
            // Randomly change UAV operational status
            if (random.nextDouble() < 0.3) { // 30% chance
                simulateStatusChange();
            }

            // Randomly trigger maintenance alerts
            if (random.nextDouble() < 0.1) { // 10% chance
                simulateMaintenanceAlert();
            }

        } catch (Exception e) {
            logger.error("Error simulating random events: {}", e.getMessage(), e);
        }
    }

    /**
     * Simulate UAV status changes
     */
    private void simulateStatusChange() {
        try {
            List<UAV> uavs = uavRepository.findAll();
            if (uavs.isEmpty()) return;

            UAV uav = uavs.get(random.nextInt(uavs.size()));
            UAV.OperationalStatus oldStatus = uav.getOperationalStatus();
            UAV.OperationalStatus newStatus = getRandomStatusChange(oldStatus);

            if (newStatus != oldStatus) {
                uav.setOperationalStatus(newStatus);
                uavRepository.save(uav);

                // Broadcast status change
                Map<String, Object> statusChange = new HashMap<>();
                statusChange.put("type", "STATUS_CHANGE");
                statusChange.put("timestamp", LocalDateTime.now());
                statusChange.put("uavId", uav.getId());
                statusChange.put("rfidTag", uav.getRfidTag());
                statusChange.put("oldStatus", oldStatus);
                statusChange.put("newStatus", newStatus);

                messagingTemplate.convertAndSend("/topic/status-changes", statusChange);
                
                logger.info("UAV {} status changed from {} to {}", uav.getRfidTag(), oldStatus, newStatus);
            }

        } catch (Exception e) {
            logger.error("Error simulating status change: {}", e.getMessage(), e);
        }
    }

    /**
     * Get random status change based on current status
     */
    private UAV.OperationalStatus getRandomStatusChange(UAV.OperationalStatus currentStatus) {
        switch (currentStatus) {
            case READY:
                return random.nextBoolean() ? UAV.OperationalStatus.IN_FLIGHT : UAV.OperationalStatus.CHARGING;
            case IN_FLIGHT:
                return random.nextBoolean() ? UAV.OperationalStatus.READY : UAV.OperationalStatus.CHARGING;
            case CHARGING:
                return UAV.OperationalStatus.READY;
            case MAINTENANCE:
                return UAV.OperationalStatus.READY;
            default:
                return UAV.OperationalStatus.READY;
        }
    }

    /**
     * Simulate maintenance alerts
     */
    private void simulateMaintenanceAlert() {
        try {
            List<UAV> uavs = uavRepository.findAll();
            if (uavs.isEmpty()) return;

            UAV uav = uavs.get(random.nextInt(uavs.size()));

            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "MAINTENANCE_ALERT");
            alert.put("timestamp", LocalDateTime.now());
            alert.put("uavId", uav.getId());
            alert.put("rfidTag", uav.getRfidTag());
            alert.put("severity", "MEDIUM");
            alert.put("message", String.format("UAV %s requires scheduled maintenance", uav.getRfidTag()));

            messagingTemplate.convertAndSend("/topic/alerts", alert);
            
            logger.info("Maintenance alert triggered for UAV {}", uav.getRfidTag());

        } catch (Exception e) {
            logger.error("Error simulating maintenance alert: {}", e.getMessage(), e);
        }
    }

    /**
     * Enable or disable simulation
     */
    public void setSimulationEnabled(boolean enabled) {
        this.simulationEnabled = enabled;
        logger.info("Real-time simulation {}", enabled ? "enabled" : "disabled");
    }

    /**
     * Check if simulation is enabled
     */
    public boolean isSimulationEnabled() {
        return simulationEnabled;
    }

    /**
     * Movement pattern data class
     */
    private static class MovementPattern {
        final double latChange;
        final double lonChange;
        final double altChange;
        final double speed;
        final double heading;

        MovementPattern(double latChange, double lonChange, double altChange, double speed, double heading) {
            this.latChange = latChange;
            this.lonChange = lonChange;
            this.altChange = altChange;
            this.speed = speed;
            this.heading = heading;
        }
    }
}
