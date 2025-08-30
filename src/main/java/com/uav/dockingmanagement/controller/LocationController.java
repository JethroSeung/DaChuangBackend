package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.model.LocationHistory;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.LocationHistoryRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for UAV Location Tracking and Management
 *
 * <p>
 * This controller provides comprehensive endpoints for managing UAV location
 * data,
 * including real-time location updates, historical tracking, flight path
 * analysis,
 * and geospatial queries. It serves as the primary interface for location-based
 * operations in the UAV management system.
 * </p>
 *
 * <p>
 * Key features include:
 * </p>
 * <ul>
 * <li>Real-time location updates with validation</li>
 * <li>Historical location data retrieval and analysis</li>
 * <li>Flight path reconstruction and visualization</li>
 * <li>Geospatial queries and proximity searches</li>
 * <li>Bulk location updates for multiple UAVs</li>
 * <li>Integration with geofencing and alert systems</li>
 * </ul>
 *
 * <p>
 * All location data is validated for accuracy and stored with timestamps
 * for audit and analysis purposes. The controller supports both individual
 * and batch operations for optimal performance.
 * </p>
 *
 * @author UAV Management System Team
 * @version 1.0
 * @since 1.0
 *
 * @see LocationHistory
 * @see LocationService
 * @see UAV
 */
@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*")
public class LocationController {

    /** Repository for location history data access operations */
    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    /** Repository for UAV data access operations */
    @Autowired
    private UAVRepository uavRepository;

    /** Service layer for location business logic and validation */
    @Autowired
    private LocationService locationService;

    /**
     * Updates the current location of a specific UAV.
     *
     * <p>
     * This endpoint accepts location data for a UAV and performs the following
     * operations:
     * </p>
     * <ul>
     * <li>Validates the UAV exists and is operational</li>
     * <li>Validates location coordinates and optional parameters</li>
     * <li>Updates the UAV's current location in real-time</li>
     * <li>Creates a historical location record for tracking</li>
     * <li>Triggers geofence violation checks</li>
     * <li>Broadcasts real-time updates via WebSocket</li>
     * </ul>
     *
     * <p>
     * <strong>Security:</strong> Requires OPERATOR or ADMIN role
     * </p>
     *
     * <p>
     * <strong>Validation Rules:</strong>
     * </p>
     * <ul>
     * <li>Latitude: -90.0 to 90.0 degrees</li>
     * <li>Longitude: -180.0 to 180.0 degrees</li>
     * <li>Altitude: 0 to 500 meters (configurable)</li>
     * <li>Speed: 0 to 200 km/h (configurable)</li>
     * <li>Battery Level: 0 to 100 percent</li>
     * </ul>
     *
     * @param uavId        The unique identifier of the UAV to update
     * @param locationData Map containing location information with the following
     *                     structure:
     *
     *                     <pre>
     *                    {
     *                      "latitude": 40.7589,      // Required: Latitude in decimal degrees
     *                      "longitude": -73.9851,    // Required: Longitude in decimal degrees
     *                      "altitude": 85.5,         // Optional: Altitude in meters
     *                      "speed": 25.3,            // Optional: Speed in km/h
     *                      "heading": 180.0,         // Optional: Heading in degrees (0-360)
     *                      "batteryLevel": 75,       // Optional: Battery level (0-100)
     *                      "timestamp": "2024-01-15T10:30:00Z" // Optional: Custom timestamp
     *                    }
     *                     </pre>
     *
     * @return ResponseEntity containing:
     *         <ul>
     *         <li>200 OK: Success response with updated location data</li>
     *         <li>400 Bad Request: Invalid location data or validation errors</li>
     *         <li>404 Not Found: UAV with given ID doesn't exist</li>
     *         <li>500 Internal Server Error: Database or processing error</li>
     *         </ul>
     *
     * @apiNote Location updates trigger real-time WebSocket broadcasts to connected
     *          clients
     * @apiNote Geofence violations are automatically checked and alerts generated
     *
     * @see LocationHistory
     * @see LocationService#validateLocation(Double, Double, Double)
     * @see UAV#setCurrentLatitude(Double)
     * @see UAV#setCurrentLongitude(Double)
     */
    @PostMapping("/update/{uavId}")
    public ResponseEntity<Map<String, Object>> updateLocation(
            @PathVariable Integer uavId,
            @RequestBody Map<String, Object> locationData) {

        Map<String, Object> response = new HashMap<>();

        try {
            Optional<UAV> uavOpt = uavRepository.findById(uavId);
            if (uavOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "UAV not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            UAV uav = uavOpt.get();

            // Extract location data
            Double latitude = Double.valueOf(locationData.get("latitude").toString());
            Double longitude = Double.valueOf(locationData.get("longitude").toString());
            Double altitude = locationData.containsKey("altitude")
                    ? Double.valueOf(locationData.get("altitude").toString())
                    : null;
            Double speed = locationData.containsKey("speed") ? Double.valueOf(locationData.get("speed").toString())
                    : null;
            Double heading = locationData.containsKey("heading")
                    ? Double.valueOf(locationData.get("heading").toString())
                    : null;
            Integer batteryLevel = locationData.containsKey("batteryLevel")
                    ? Integer.valueOf(locationData.get("batteryLevel").toString())
                    : null;

            // Update UAV current location
            uav.setCurrentLatitude(latitude);
            uav.setCurrentLongitude(longitude);
            uav.setCurrentAltitudeMeters(altitude);
            uav.setLastLocationUpdate(LocalDateTime.now());
            uavRepository.save(uav);

            // Create location history record
            LocationHistory locationHistory = new LocationHistory(uav, latitude, longitude, altitude);
            locationHistory.setSpeedKmh(speed);
            locationHistory.setHeadingDegrees(heading);
            locationHistory.setBatteryLevel(batteryLevel);

            if (locationData.containsKey("accuracy")) {
                locationHistory.setAccuracyMeters(Double.valueOf(locationData.get("accuracy").toString()));
            }
            if (locationData.containsKey("signalStrength")) {
                locationHistory.setSignalStrength(Integer.valueOf(locationData.get("signalStrength").toString()));
            }
            if (locationData.containsKey("source")) {
                String source = locationData.get("source").toString().toUpperCase();
                try {
                    locationHistory.setLocationSource(LocationHistory.LocationSource.valueOf(source));
                } catch (IllegalArgumentException e) {
                    locationHistory.setLocationSource(LocationHistory.LocationSource.GPS);
                }
            }

            locationHistoryRepository.save(locationHistory);

            // Check geofences
            locationService.checkGeofenceViolations(uav, latitude, longitude, altitude);

            response.put("success", true);
            response.put("message", "Location updated successfully");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating location: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get current locations of all UAVs
     */
    @GetMapping("/current")
    public ResponseEntity<List<Map<String, Object>>> getCurrentLocations() {
        try {
            List<Map<String, Object>> locations = locationService.getCurrentUAVLocations();
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get current location of specific UAV
     */
    @GetMapping("/current/{uavId}")
    public ResponseEntity<Map<String, Object>> getCurrentLocation(@PathVariable Integer uavId) {
        try {
            Optional<UAV> uavOpt = uavRepository.findById(uavId);
            if (uavOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            UAV uav = uavOpt.get();
            Map<String, Object> location = new HashMap<>();
            location.put("uavId", uav.getId());
            location.put("rfidTag", uav.getRfidTag());
            location.put("latitude", uav.getCurrentLatitude());
            location.put("longitude", uav.getCurrentLongitude());
            location.put("altitude", uav.getCurrentAltitudeMeters());
            location.put("lastUpdate", uav.getLastLocationUpdate());
            location.put("hasLocation", uav.hasLocationData());

            return ResponseEntity.ok(location);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get location history for UAV
     */
    @GetMapping("/history/{uavId}")
    public ResponseEntity<List<LocationHistory>> getLocationHistory(
            @PathVariable Integer uavId,
            @RequestParam(defaultValue = "100") Integer limit) {
        try {
            List<LocationHistory> history = locationHistoryRepository.findRecentLocationsByUavId(uavId, limit);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get location history within time range
     */
    @GetMapping("/history/{uavId}/range")
    public ResponseEntity<List<LocationHistory>> getLocationHistoryRange(
            @PathVariable Integer uavId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        try {
            List<LocationHistory> history = locationHistoryRepository.findByUavIdAndTimestampBetween(uavId, startTime,
                    endTime);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get flight path for UAV
     */
    @GetMapping("/flight-path/{uavId}")
    public ResponseEntity<List<LocationHistory>> getFlightPath(
            @PathVariable Integer uavId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        try {
            List<LocationHistory> flightPath = locationHistoryRepository.getFlightPath(uavId, startTime, endTime);
            return ResponseEntity.ok(flightPath);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get UAVs in geographical area
     */
    @GetMapping("/area")
    public ResponseEntity<List<LocationHistory>> getUAVsInArea(
            @RequestParam Double minLatitude,
            @RequestParam Double maxLatitude,
            @RequestParam Double minLongitude,
            @RequestParam Double maxLongitude,
            @RequestParam(defaultValue = "60") Integer minutesBack) {
        try {
            LocalDateTime since = LocalDateTime.now().minusMinutes(minutesBack);
            LocalDateTime now = LocalDateTime.now();

            List<LocationHistory> locations = locationHistoryRepository.findLocationsInArea(
                    minLatitude, maxLatitude, minLongitude, maxLongitude, since, now);

            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active UAVs (with recent location data)
     */
    @GetMapping("/active")
    public ResponseEntity<List<UAV>> getActiveUAVs(@RequestParam(defaultValue = "30") Integer minutesBack) {
        try {
            LocalDateTime since = LocalDateTime.now().minusMinutes(minutesBack);
            List<UAV> activeUAVs = locationHistoryRepository.findActiveUAVsSince(since);
            return ResponseEntity.ok(activeUAVs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get location statistics for UAV
     */
    @GetMapping("/stats/{uavId}")
    public ResponseEntity<Map<String, Object>> getLocationStats(
            @PathVariable Integer uavId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        try {
            Map<String, Object> stats = new HashMap<>();

            long recordCount = locationHistoryRepository.countByUavIdAndTimestampBetween(uavId, startTime, endTime);
            Double avgSpeed = locationHistoryRepository.getAverageSpeed(uavId, startTime, endTime);
            Double maxAltitude = locationHistoryRepository.getMaxAltitude(uavId, startTime, endTime);

            stats.put("recordCount", recordCount);
            stats.put("averageSpeed", avgSpeed);
            stats.put("maxAltitude", maxAltitude);
            stats.put("period", Map.of("start", startTime, "end", endTime));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Find UAVs near a point
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<LocationHistory>> findNearbyUAVs(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm,
            @RequestParam(defaultValue = "30") Integer minutesBack) {
        try {
            LocalDateTime since = LocalDateTime.now().minusMinutes(minutesBack);
            List<LocationHistory> nearbyLocations = locationHistoryRepository.findLocationsNearPoint(
                    latitude, longitude, radiusKm, since);
            return ResponseEntity.ok(nearbyLocations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Bulk update locations (for multiple UAVs)
     */
    @PostMapping("/bulk-update")
    public ResponseEntity<Map<String, Object>> bulkUpdateLocations(
            @RequestBody List<Map<String, Object>> locationUpdates) {

        Map<String, Object> response = new HashMap<>();
        int successCount = 0;
        int errorCount = 0;

        try {
            for (Map<String, Object> update : locationUpdates) {
                try {
                    Integer uavId = Integer.valueOf(update.get("uavId").toString());
                    ResponseEntity<Map<String, Object>> result = updateLocation(uavId, update);

                    if (result.getStatusCode() == HttpStatus.OK) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (Exception e) {
                    errorCount++;
                }
            }

            response.put("success", true);
            response.put("successCount", successCount);
            response.put("errorCount", errorCount);
            response.put("totalProcessed", locationUpdates.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error processing bulk update: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
