package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.Geofence;
import com.uav.dockingmanagement.model.LocationHistory;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.GeofenceRepository;
import com.uav.dockingmanagement.repository.LocationHistoryRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service class for location-related operations
 * Handles location updates, tracking, and geofence monitoring
 */
@Service
public class LocationService {

    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Get location history for UAV (simple version for tests)
     */
    public List<LocationHistory> getLocationHistory(Integer uavId) {
        try {
            return locationHistoryRepository.findByUavIdOrderByTimestampDesc(uavId);
        } catch (Exception e) {
            logger.error("Error getting location history for UAV {}: {}", uavId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get location history for UAV within time range
     */
    public List<LocationHistory> getLocationHistory(Integer uavId, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            return locationHistoryRepository.findByUavIdAndTimestampBetween(uavId, startTime, endTime);
        } catch (Exception e) {
            logger.error("Error getting location history for UAV {} between {} and {}: {}",
                    uavId, startTime, endTime, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get current locations (alias for getCurrentUAVLocations for test
     * compatibility)
     */
    public List<Map<String, Object>> getCurrentLocations() {
        return getCurrentUAVLocations();
    }

    /**
     * Get UAVs in area
     */
    public List<Map<String, Object>> getUAVsInArea(Double minLatitude, Double maxLatitude,
            Double minLongitude, Double maxLongitude) {
        List<Map<String, Object>> uavsInArea = new ArrayList<>();
        try {
            List<UAV> allUAVs = uavRepository.findAll();

            for (UAV uav : allUAVs) {
                if (uav.hasLocationData()) {
                    Double lat = uav.getCurrentLatitude();
                    Double lon = uav.getCurrentLongitude();

                    if (lat >= minLatitude && lat <= maxLatitude &&
                            lon >= minLongitude && lon <= maxLongitude) {

                        Map<String, Object> uavData = new HashMap<>();
                        uavData.put("id", uav.getId());
                        uavData.put("rfidTag", uav.getRfidTag());
                        uavData.put("latitude", lat);
                        uavData.put("longitude", lon);
                        uavData.put("altitude", uav.getCurrentAltitudeMeters());
                        uavData.put("lastUpdate", uav.getLastLocationUpdate());
                        uavsInArea.add(uavData);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error getting UAVs in area: {}", e.getMessage(), e);
        }
        return uavsInArea;
    }

    /**
     * Get nearby UAVs (3 parameter version for test compatibility)
     */
    public List<Map<String, Object>> getNearbyUAVs(Double latitude, Double longitude, Double radiusKm) {
        return findNearbyUAVs(latitude, longitude, radiusKm, 60); // Default to last 60 minutes
    }

    /**
     * Calculate distance between two points
     */
    public Double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        try {
            final int R = 6371; // Radius of the earth in km

            double latDistance = Math.toRadians(lat2 - lat1);
            double lonDistance = Math.toRadians(lon2 - lon1);
            double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                    + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                            * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            double distance = R * c; // Distance in km

            return distance;
        } catch (Exception e) {
            logger.error("Error calculating distance: {}", e.getMessage(), e);
            return 0.0;
        }
    }

    /**
     * Check if point is within radius
     */
    public Boolean isWithinRadius(Double lat1, Double lon1, Double lat2, Double lon2, Double radiusKm) {
        try {
            Double distance = calculateDistance(lat1, lon1, lat2, lon2);
            return distance <= radiusKm;
        } catch (Exception e) {
            logger.error("Error checking if within radius: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get location statistics (no parameter version for test compatibility)
     */
    public Map<String, Object> getLocationStatistics() {
        try {
            LocalDateTime now = LocalDateTime.now();

            Map<String, Object> stats = new HashMap<>();

            // Get count of UAVs with location data
            long uavsWithLocation = uavRepository.findAll().stream()
                    .filter(UAV::hasLocationData)
                    .count();

            stats.put("uavsWithLocation", uavsWithLocation);
            stats.put("totalLocationRecords", locationHistoryRepository.count());
            // Count recent records (simplified approach)
            stats.put("recordsLast24Hours", 0L); // Placeholder - would need custom query
            stats.put("timestamp", now);

            return stats;
        } catch (Exception e) {
            logger.error("Error getting location statistics: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    /**
     * Get current locations of all UAVs with location data
     */
    public List<Map<String, Object>> getCurrentUAVLocations() {
        List<Map<String, Object>> locations = new ArrayList<>();

        try {
            List<UAV> uavsWithLocation = uavRepository.findAll().stream()
                    .filter(UAV::hasLocationData)
                    .toList();

            for (UAV uav : uavsWithLocation) {
                Map<String, Object> locationData = new HashMap<>();
                locationData.put("uavId", uav.getId());
                locationData.put("rfidTag", uav.getRfidTag());
                locationData.put("ownerName", uav.getOwnerName());
                locationData.put("model", uav.getModel());
                locationData.put("status", uav.getStatus());
                locationData.put("operationalStatus", uav.getOperationalStatus());
                locationData.put("latitude", uav.getCurrentLatitude());
                locationData.put("longitude", uav.getCurrentLongitude());
                locationData.put("altitude", uav.getCurrentAltitudeMeters());
                locationData.put("lastUpdate", uav.getLastLocationUpdate());
                locationData.put("inHibernatePod", uav.isInHibernatePod());

                // Get latest location history for additional data
                locationHistoryRepository.findLatestLocationByUavId(uav.getId())
                        .ifPresent(history -> {
                            locationData.put("speed", history.getSpeedKmh());
                            locationData.put("heading", history.getHeadingDegrees());
                            locationData.put("batteryLevel", history.getBatteryLevel());
                            locationData.put("accuracy", history.getAccuracyMeters());
                            locationData.put("signalStrength", history.getSignalStrength());
                            locationData.put("locationSource", history.getLocationSource());
                        });

                locations.add(locationData);
            }

        } catch (Exception e) {
            logger.error("Error getting current UAV locations: {}", e.getMessage(), e);
        }

        return locations;
    }

    /**
     * Update UAV location and broadcast to WebSocket clients
     */
    public void updateUAVLocation(UAV uav, Double latitude, Double longitude, Double altitude) {
        try {
            // Update UAV current location
            uav.setCurrentLatitude(latitude);
            uav.setCurrentLongitude(longitude);
            uav.setCurrentAltitudeMeters(altitude);
            uav.setLastLocationUpdate(LocalDateTime.now());
            uavRepository.save(uav);

            // Create location history record
            LocationHistory locationHistory = new LocationHistory(uav, latitude, longitude, altitude);
            locationHistoryRepository.save(locationHistory);

            // Check geofences
            checkGeofenceViolations(uav, latitude, longitude, altitude);

            // Broadcast location update via WebSocket
            broadcastLocationUpdate(uav);

            logger.debug("Updated location for UAV {}: {}, {}", uav.getRfidTag(), latitude, longitude);

        } catch (Exception e) {
            logger.error("Error updating UAV location: {}", e.getMessage(), e);
        }
    }

    /**
     * Check geofence violations for UAV location
     */
    public void checkGeofenceViolations(UAV uav, Double latitude, Double longitude, Double altitude) {
        try {
            List<Geofence> activeGeofences = geofenceRepository.findCurrentlyActiveGeofences(LocalDateTime.now());

            for (Geofence geofence : activeGeofences) {
                boolean isInside = geofence.isPointInside(latitude, longitude);
                boolean isViolation = false;

                // Check for violations based on boundary type
                if (geofence.getBoundaryType() == Geofence.BoundaryType.INCLUSION && !isInside) {
                    isViolation = true; // UAV should be inside but is outside
                } else if (geofence.getBoundaryType() == Geofence.BoundaryType.EXCLUSION && isInside) {
                    isViolation = true; // UAV should be outside but is inside
                }

                // Check altitude constraints if specified
                if (!isViolation && altitude != null) {
                    if (geofence.getMinAltitudeMeters() != null && altitude < geofence.getMinAltitudeMeters()) {
                        isViolation = true;
                    }
                    if (geofence.getMaxAltitudeMeters() != null && altitude > geofence.getMaxAltitudeMeters()) {
                        isViolation = true;
                    }
                }

                if (isViolation) {
                    handleGeofenceViolation(uav, geofence, latitude, longitude, altitude);
                }
            }

        } catch (Exception e) {
            logger.error("Error checking geofence violations for UAV {}: {}", uav.getRfidTag(), e.getMessage(), e);
        }
    }

    /**
     * Handle geofence violation
     */
    private void handleGeofenceViolation(UAV uav, Geofence geofence, Double latitude, Double longitude,
            Double altitude) {
        try {
            // Record violation
            geofence.recordViolation();
            geofenceRepository.save(geofence);

            // Create violation alert
            Map<String, Object> violationAlert = new HashMap<>();
            violationAlert.put("type", "GEOFENCE_VIOLATION");
            violationAlert.put("timestamp", LocalDateTime.now());
            violationAlert.put("uavId", uav.getId());
            violationAlert.put("uavRfidTag", uav.getRfidTag());
            violationAlert.put("geofenceId", geofence.getId());
            violationAlert.put("geofenceName", geofence.getName());
            violationAlert.put("boundaryType", geofence.getBoundaryType());
            violationAlert.put("violationAction", geofence.getViolationAction());
            violationAlert.put("latitude", latitude);
            violationAlert.put("longitude", longitude);
            violationAlert.put("altitude", altitude);
            violationAlert.put("priorityLevel", geofence.getPriorityLevel());

            // Broadcast violation alert
            messagingTemplate.convertAndSend("/topic/geofence-violations", violationAlert);

            logger.warn("Geofence violation detected - UAV: {}, Geofence: {}, Location: {}, {}",
                    uav.getRfidTag(), geofence.getName(), latitude, longitude);

        } catch (Exception e) {
            logger.error("Error handling geofence violation: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast location update via WebSocket
     */
    private void broadcastLocationUpdate(UAV uav) {
        try {
            Map<String, Object> locationUpdate = new HashMap<>();
            locationUpdate.put("type", "LOCATION_UPDATE");
            locationUpdate.put("timestamp", LocalDateTime.now());
            locationUpdate.put("uavId", uav.getId());
            locationUpdate.put("rfidTag", uav.getRfidTag());
            locationUpdate.put("latitude", uav.getCurrentLatitude());
            locationUpdate.put("longitude", uav.getCurrentLongitude());
            locationUpdate.put("altitude", uav.getCurrentAltitudeMeters());
            locationUpdate.put("status", uav.getStatus());
            locationUpdate.put("operationalStatus", uav.getOperationalStatus());

            // Broadcast to all connected clients
            messagingTemplate.convertAndSend("/topic/location-updates", locationUpdate);

            // Broadcast to specific UAV channel
            messagingTemplate.convertAndSend("/topic/uav/" + uav.getId() + "/location", locationUpdate);

        } catch (Exception e) {
            logger.error("Error broadcasting location update: {}", e.getMessage(), e);
        }
    }

    /**
     * Get flight path for UAV within time range
     */
    public List<LocationHistory> getFlightPath(Integer uavId, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            return locationHistoryRepository.getFlightPath(uavId, startTime, endTime);
        } catch (Exception e) {
            logger.error("Error getting flight path for UAV {}: {}", uavId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get location statistics for UAV
     */
    public Map<String, Object> getLocationStatistics(Integer uavId, LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> stats = new HashMap<>();

        try {
            long recordCount = locationHistoryRepository.countByUavIdAndTimestampBetween(uavId, startTime, endTime);
            Double avgSpeed = locationHistoryRepository.getAverageSpeed(uavId, startTime, endTime);
            Double maxAltitude = locationHistoryRepository.getMaxAltitude(uavId, startTime, endTime);

            stats.put("recordCount", recordCount);
            stats.put("averageSpeed", avgSpeed != null ? avgSpeed : 0.0);
            stats.put("maxAltitude", maxAltitude != null ? maxAltitude : 0.0);
            stats.put("period", Map.of("start", startTime, "end", endTime));

            // Calculate distance traveled (simplified)
            List<LocationHistory> locations = locationHistoryRepository.getFlightPath(uavId, startTime, endTime);
            double totalDistance = calculateTotalDistance(locations);
            stats.put("totalDistanceKm", totalDistance);

        } catch (Exception e) {
            logger.error("Error getting location statistics for UAV {}: {}", uavId, e.getMessage(), e);
        }

        return stats;
    }

    /**
     * Calculate total distance traveled from location history
     */
    private double calculateTotalDistance(List<LocationHistory> locations) {
        double totalDistance = 0.0;

        if (locations.size() < 2) {
            return totalDistance;
        }

        for (int i = 1; i < locations.size(); i++) {
            LocationHistory prev = locations.get(i - 1);
            LocationHistory curr = locations.get(i);

            double distance = prev.distanceToPoint(curr.getLatitude(), curr.getLongitude());
            totalDistance += distance;
        }

        return totalDistance / 1000.0; // Convert to kilometers
    }

    /**
     * Find UAVs near a specific location
     */
    public List<Map<String, Object>> findNearbyUAVs(Double latitude, Double longitude, Double radiusKm,
            Integer minutesBack) {
        List<Map<String, Object>> nearbyUAVs = new ArrayList<>();

        try {
            LocalDateTime since = LocalDateTime.now().minusMinutes(minutesBack);
            List<LocationHistory> nearbyLocations = locationHistoryRepository.findLocationsNearPoint(
                    latitude, longitude, radiusKm, since);

            for (LocationHistory location : nearbyLocations) {
                Map<String, Object> uavData = new HashMap<>();
                uavData.put("id", location.getUav().getId()); // Use "id" instead of "uavId" for ObjectMapper
                                                              // compatibility
                uavData.put("rfidTag", location.getUav().getRfidTag());
                uavData.put("latitude", location.getLatitude());
                uavData.put("longitude", location.getLongitude());
                uavData.put("altitude", location.getAltitudeMeters());
                uavData.put("timestamp", location.getTimestamp());
                uavData.put("speed", location.getSpeedKmh());
                uavData.put("batteryLevel", location.getBatteryLevel());

                double distance = location.distanceToPoint(latitude, longitude) / 1000.0; // Convert to km
                uavData.put("distanceKm", distance);

                nearbyUAVs.add(uavData);
            }

        } catch (Exception e) {
            logger.error("Error finding nearby UAVs: {}", e.getMessage(), e);
        }

        return nearbyUAVs;
    }

    /**
     * Clean up old location history records
     */
    public void cleanupOldLocationRecords(int daysToKeep) {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusDays(daysToKeep);
            locationHistoryRepository.deleteOldRecords(cutoffTime);
            logger.info("Cleaned up location records older than {} days", daysToKeep);
        } catch (Exception e) {
            logger.error("Error cleaning up old location records: {}", e.getMessage(), e);
        }
    }

    /**
     * Get real-time tracking data for dashboard
     */
    public Map<String, Object> getTrackingDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime oneHourAgo = now.minusHours(1);

            // Get active UAVs count
            List<UAV> activeUAVs = locationHistoryRepository.findActiveUAVsSince(oneHourAgo);
            dashboardData.put("activeUAVsCount", activeUAVs.size());

            // Get current locations
            List<Map<String, Object>> currentLocations = getCurrentUAVLocations();
            dashboardData.put("currentLocations", currentLocations);

            // Get recent violations
            List<Geofence> recentViolations = geofenceRepository.findGeofencesWithRecentViolations(oneHourAgo);
            dashboardData.put("recentViolationsCount", recentViolations.size());

            // Get low battery UAVs
            List<LocationHistory> lowBatteryLocations = locationHistoryRepository.findLowBatteryLocations(20);
            dashboardData.put("lowBatteryUAVsCount", lowBatteryLocations.size());

            dashboardData.put("timestamp", now);

        } catch (Exception e) {
            logger.error("Error getting tracking dashboard data: {}", e.getMessage(), e);
        }

        return dashboardData;
    }
}
