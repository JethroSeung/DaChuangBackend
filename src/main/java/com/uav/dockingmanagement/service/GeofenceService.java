package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.Geofence;
import com.uav.dockingmanagement.repository.GeofenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service class for geofence operations
 * Handles geofence management, violation checking, and monitoring
 */
@Service
public class GeofenceService {

    private static final Logger logger = LoggerFactory.getLogger(GeofenceService.class);

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Get all geofences
     */
    public List<Geofence> getAllGeofences() {
        try {
            return geofenceRepository.findAll();
        } catch (Exception e) {
            logger.error("Error getting all geofences: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get geofence by ID
     */
    public Optional<Geofence> getGeofenceById(Long id) {
        try {
            return geofenceRepository.findById(id);
        } catch (Exception e) {
            logger.error("Error getting geofence by ID {}: {}", id, e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Create new geofence
     */
    @Transactional
    public Geofence createGeofence(Geofence geofence) {
        try {
            // Set default values if not provided
            if (geofence.getStatus() == null) {
                geofence.setStatus(Geofence.FenceStatus.ACTIVE);
            }
            if (geofence.getCreatedAt() == null) {
                geofence.setCreatedAt(LocalDateTime.now());
            }
            if (geofence.getTotalViolations() == null) {
                geofence.setTotalViolations(0);
            }

            Geofence savedGeofence = geofenceRepository.save(geofence);
            logger.info("Created new geofence: {}", savedGeofence.getName());
            return savedGeofence;
        } catch (Exception e) {
            logger.error("Error creating geofence: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create geofence: " + e.getMessage());
        }
    }

    /**
     * Update existing geofence
     */
    @Transactional
    public Geofence updateGeofence(Long id, Geofence updatedGeofence) {
        try {
            Optional<Geofence> existingOpt = geofenceRepository.findById(id);
            if (existingOpt.isEmpty()) {
                throw new RuntimeException("Geofence not found with ID: " + id);
            }

            Geofence existing = existingOpt.get();

            // Update fields
            if (updatedGeofence.getName() != null) {
                existing.setName(updatedGeofence.getName());
            }
            if (updatedGeofence.getDescription() != null) {
                existing.setDescription(updatedGeofence.getDescription());
            }
            if (updatedGeofence.getFenceType() != null) {
                existing.setFenceType(updatedGeofence.getFenceType());
            }
            if (updatedGeofence.getBoundaryType() != null) {
                existing.setBoundaryType(updatedGeofence.getBoundaryType());
            }
            if (updatedGeofence.getStatus() != null) {
                existing.setStatus(updatedGeofence.getStatus());
            }
            if (updatedGeofence.getPriorityLevel() != null) {
                existing.setPriorityLevel(updatedGeofence.getPriorityLevel());
            }
            if (updatedGeofence.getViolationAction() != null) {
                existing.setViolationAction(updatedGeofence.getViolationAction());
            }
            if (updatedGeofence.getCenterLatitude() != null) {
                existing.setCenterLatitude(updatedGeofence.getCenterLatitude());
            }
            if (updatedGeofence.getCenterLongitude() != null) {
                existing.setCenterLongitude(updatedGeofence.getCenterLongitude());
            }
            if (updatedGeofence.getRadiusMeters() != null) {
                existing.setRadiusMeters(updatedGeofence.getRadiusMeters());
            }
            if (updatedGeofence.getMinAltitudeMeters() != null) {
                existing.setMinAltitudeMeters(updatedGeofence.getMinAltitudeMeters());
            }
            if (updatedGeofence.getMaxAltitudeMeters() != null) {
                existing.setMaxAltitudeMeters(updatedGeofence.getMaxAltitudeMeters());
            }

            existing.setUpdatedAt(LocalDateTime.now());

            Geofence savedGeofence = geofenceRepository.save(existing);
            logger.info("Updated geofence: {}", savedGeofence.getName());
            return savedGeofence;
        } catch (Exception e) {
            logger.error("Error updating geofence {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to update geofence: " + e.getMessage());
        }
    }

    /**
     * Delete geofence
     */
    @Transactional
    public void deleteGeofence(Long id) {
        try {
            Optional<Geofence> geofenceOpt = geofenceRepository.findById(id);
            if (geofenceOpt.isEmpty()) {
                throw new RuntimeException("Geofence not found with ID: " + id);
            }

            Geofence geofence = geofenceOpt.get();
            geofenceRepository.deleteById(id);
            logger.info("Deleted geofence: {}", geofence.getName());
        } catch (Exception e) {
            logger.error("Error deleting geofence {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete geofence: " + e.getMessage());
        }
    }

    /**
     * Get active geofences
     */
    public List<Geofence> getActiveGeofences() {
        try {
            return geofenceRepository.findActiveGeofences();
        } catch (Exception e) {
            logger.error("Error getting active geofences: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Check geofence violations for a point
     */
    public List<Geofence> checkGeofenceViolations(Double latitude, Double longitude, Double altitude) {
        List<Geofence> violations = new ArrayList<>();
        try {
            List<Geofence> activeGeofences = geofenceRepository.findCurrentlyActiveGeofences(LocalDateTime.now());

            for (Geofence geofence : activeGeofences) {
                boolean isInside = isPointInsideGeofence(geofence, latitude, longitude, altitude);

                // Check for violations based on boundary type
                if ((geofence.getBoundaryType() == Geofence.BoundaryType.EXCLUSION && isInside) ||
                    (geofence.getBoundaryType() == Geofence.BoundaryType.INCLUSION && !isInside)) {
                    violations.add(geofence);

                    // Update violation count
                    geofenceRepository.incrementViolationCount(geofence.getId(), LocalDateTime.now());
                }
            }
        } catch (Exception e) {
            logger.error("Error checking geofence violations: {}", e.getMessage(), e);
        }
        return violations;
    }

    /**
     * Check if point is inside geofence (3 parameter version for tests)
     */
    public boolean isPointInsideGeofence(Geofence geofence, Double latitude, Double longitude, Double altitude) {
        // Check altitude constraints first
        if (geofence.getMinAltitudeMeters() != null && altitude < geofence.getMinAltitudeMeters()) {
            return false;
        }
        if (geofence.getMaxAltitudeMeters() != null && altitude > geofence.getMaxAltitudeMeters()) {
            return false;
        }

        // Use the existing 2-parameter method for lat/lon checking
        return geofence.isPointInside(latitude, longitude);
    }

    /**
     * Validate geofence data
     */
    public boolean validateGeofence(Geofence geofence) {
        try {
            if (geofence == null) {
                return false;
            }

            // Check required fields
            if (geofence.getName() == null || geofence.getName().trim().isEmpty()) {
                return false;
            }

            if (geofence.getFenceType() == null) {
                return false;
            }

            if (geofence.getBoundaryType() == null) {
                return false;
            }

            // Validate circular geofence
            if (geofence.getFenceType() == Geofence.FenceType.CIRCULAR) {
                if (geofence.getCenterLatitude() == null || geofence.getCenterLongitude() == null ||
                    geofence.getRadiusMeters() == null) {
                    return false;
                }

                // Check valid latitude/longitude ranges
                if (geofence.getCenterLatitude() < -90 || geofence.getCenterLatitude() > 90) {
                    return false;
                }
                if (geofence.getCenterLongitude() < -180 || geofence.getCenterLongitude() > 180) {
                    return false;
                }

                // Check positive radius
                if (geofence.getRadiusMeters() <= 0) {
                    return false;
                }
            }

            // Validate altitude constraints
            if (geofence.getMinAltitudeMeters() != null && geofence.getMaxAltitudeMeters() != null) {
                if (geofence.getMinAltitudeMeters() > geofence.getMaxAltitudeMeters()) {
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            logger.error("Error validating geofence: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get geofences by type
     */
    public List<Geofence> getGeofencesByType(Geofence.FenceType fenceType) {
        try {
            return geofenceRepository.findByFenceType(fenceType);
        } catch (Exception e) {
            logger.error("Error getting geofences by type {}: {}", fenceType, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get geofences by boundary type
     */
    public List<Geofence> getGeofencesByBoundaryType(Geofence.BoundaryType boundaryType) {
        try {
            return geofenceRepository.findByBoundaryType(boundaryType);
        } catch (Exception e) {
            logger.error("Error getting geofences by boundary type {}: {}", boundaryType, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Check point against all active geofences
     */
    public Map<String, Object> checkPointAgainstGeofences(Double latitude, Double longitude, Double altitude) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> violations = new ArrayList<>();
        List<Map<String, Object>> containments = new ArrayList<>();
        
        try {
            List<Geofence> activeGeofences = geofenceRepository.findCurrentlyActiveGeofences(LocalDateTime.now());
            
            for (Geofence geofence : activeGeofences) {
                boolean isInside = isPointInsideGeofence(geofence, latitude, longitude);
                boolean altitudeViolation = false;
                
                // Check altitude constraints
                if (altitude != null) {
                    if (geofence.getMinAltitudeMeters() != null && altitude < geofence.getMinAltitudeMeters()) {
                        altitudeViolation = true;
                    }
                    if (geofence.getMaxAltitudeMeters() != null && altitude > geofence.getMaxAltitudeMeters()) {
                        altitudeViolation = true;
                    }
                }
                
                Map<String, Object> geofenceInfo = new HashMap<>();
                geofenceInfo.put("geofenceId", geofence.getId());
                geofenceInfo.put("name", geofence.getName());
                geofenceInfo.put("type", geofence.getFenceType());
                geofenceInfo.put("boundaryType", geofence.getBoundaryType());
                geofenceInfo.put("priorityLevel", geofence.getPriorityLevel());
                geofenceInfo.put("isInside", isInside);
                geofenceInfo.put("altitudeViolation", altitudeViolation);
                
                // Determine if this is a violation
                boolean isViolation = false;
                if (geofence.getBoundaryType() == Geofence.BoundaryType.INCLUSION && !isInside) {
                    isViolation = true; // Should be inside but is outside
                } else if (geofence.getBoundaryType() == Geofence.BoundaryType.EXCLUSION && isInside) {
                    isViolation = true; // Should be outside but is inside
                }
                
                if (altitudeViolation) {
                    isViolation = true;
                }
                
                if (isViolation) {
                    violations.add(geofenceInfo);
                } else if (isInside) {
                    containments.add(geofenceInfo);
                }
            }
            
            result.put("success", true);
            result.put("latitude", latitude);
            result.put("longitude", longitude);
            result.put("altitude", altitude);
            result.put("violations", violations);
            result.put("containments", containments);
            result.put("hasViolations", !violations.isEmpty());
            result.put("checkedGeofences", activeGeofences.size());
            result.put("timestamp", LocalDateTime.now());
            
        } catch (Exception e) {
            logger.error("Error checking point against geofences: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error checking geofences: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * Check if point is inside geofence
     */
    private boolean isPointInsideGeofence(Geofence geofence, Double latitude, Double longitude) {
        try {
            if (geofence.getFenceType() == Geofence.FenceType.CIRCULAR) {
                return isPointInCircle(geofence, latitude, longitude);
            } else if (geofence.getFenceType() == Geofence.FenceType.POLYGONAL) {
                return isPointInPolygon(geofence, latitude, longitude);
            }
        } catch (Exception e) {
            logger.error("Error checking if point is inside geofence {}: {}", geofence.getName(), e.getMessage(), e);
        }
        return false;
    }

    /**
     * Check if point is inside circular geofence
     */
    private boolean isPointInCircle(Geofence geofence, Double latitude, Double longitude) {
        if (geofence.getCenterLatitude() == null || geofence.getCenterLongitude() == null || geofence.getRadiusMeters() == null) {
            return false;
        }
        
        double distance = calculateDistance(
            geofence.getCenterLatitude(), geofence.getCenterLongitude(),
            latitude, longitude
        );
        
        return distance <= geofence.getRadiusMeters();
    }

    /**
     * Check if point is inside polygonal geofence (simplified implementation)
     */
    private boolean isPointInPolygon(Geofence geofence, Double latitude, Double longitude) {
        // This is a simplified implementation
        // In production, you would use a proper geometry library like JTS
        String polygonCoords = geofence.getPolygonCoordinates();
        if (polygonCoords == null || polygonCoords.trim().isEmpty()) {
            return false;
        }
        
        // TODO: Implement proper polygon containment check
        // For now, return false as placeholder
        logger.warn("Polygon geofence checking not fully implemented for geofence: {}", geofence.getName());
        return false;
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c * 1000; // Distance in meters
    }

    /**
     * Get comprehensive geofence statistics
     */
    public Map<String, Object> getGeofenceStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Basic counts
            long totalGeofences = geofenceRepository.count();
            long activeGeofences = geofenceRepository.countActiveGeofences();
            long inactiveGeofences = geofenceRepository.countByStatus(Geofence.FenceStatus.INACTIVE);
            long suspendedGeofences = geofenceRepository.countByStatus(Geofence.FenceStatus.SUSPENDED);
            
            stats.put("totalGeofences", totalGeofences);
            stats.put("activeGeofences", activeGeofences);
            stats.put("inactiveGeofences", inactiveGeofences);
            stats.put("suspendedGeofences", suspendedGeofences);
            
            // Type breakdown
            long circularGeofences = geofenceRepository.findByFenceType(Geofence.FenceType.CIRCULAR).size();
            long polygonalGeofences = geofenceRepository.findByFenceType(Geofence.FenceType.POLYGONAL).size();
            
            Map<String, Long> typeBreakdown = new HashMap<>();
            typeBreakdown.put("CIRCULAR", circularGeofences);
            typeBreakdown.put("POLYGONAL", polygonalGeofences);
            stats.put("typeBreakdown", typeBreakdown);
            
            // Boundary type breakdown
            long inclusionGeofences = geofenceRepository.findByBoundaryType(Geofence.BoundaryType.INCLUSION).size();
            long exclusionGeofences = geofenceRepository.findByBoundaryType(Geofence.BoundaryType.EXCLUSION).size();
            
            Map<String, Long> boundaryBreakdown = new HashMap<>();
            boundaryBreakdown.put("INCLUSION", inclusionGeofences);
            boundaryBreakdown.put("EXCLUSION", exclusionGeofences);
            stats.put("boundaryBreakdown", boundaryBreakdown);
            
            // Violation statistics
            List<Geofence> geofencesWithViolations = geofenceRepository.findGeofencesWithViolations();
            long totalViolations = geofencesWithViolations.stream()
                .mapToLong(g -> g.getTotalViolations() != null ? g.getTotalViolations() : 0)
                .sum();
            
            stats.put("geofencesWithViolations", geofencesWithViolations.size());
            stats.put("totalViolations", totalViolations);
            
            // Recent violations (last 24 hours)
            LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
            List<Geofence> recentViolations = geofenceRepository.findGeofencesWithRecentViolations(yesterday);
            stats.put("recentViolations", recentViolations.size());
            
            // Feature statistics
            long geofencesWithAltitudeRestrictions = geofenceRepository.findGeofencesWithAltitudeRestrictions().size();
            long timeRestrictedGeofences = geofenceRepository.findTimeRestrictedGeofences().size();
            long geofencesWithNotifications = geofenceRepository.findGeofencesWithNotifications().size();
            
            Map<String, Long> features = new HashMap<>();
            features.put("altitudeRestrictions", geofencesWithAltitudeRestrictions);
            features.put("timeRestricted", timeRestrictedGeofences);
            features.put("withNotifications", geofencesWithNotifications);
            stats.put("features", features);
            
            // Expiring geofences (next 7 days)
            LocalDateTime nextWeek = LocalDateTime.now().plusDays(7);
            List<Geofence> expiringSoon = geofenceRepository.findGeofencesExpiringSoon(LocalDateTime.now(), nextWeek);
            stats.put("expiringSoon", expiringSoon.size());
            
            stats.put("timestamp", LocalDateTime.now());
            
        } catch (Exception e) {
            logger.error("Error getting geofence statistics: {}", e.getMessage(), e);
        }
        
        return stats;
    }

    /**
     * Create sample geofences for demonstration
     */
    @Transactional
    public void initializeSampleGeofences() {
        try {
            long count = geofenceRepository.count();
            
            if (count == 0) {
                logger.info("Initializing sample geofences...");
                
                // Create sample circular geofence (inclusion zone)
                Geofence operationalZone = Geofence.createCircularFence(
                    "Operational Zone", 40.7128, -74.0060, 5000.0, Geofence.BoundaryType.INCLUSION);
                operationalZone.setDescription("Main operational area for UAV flights");
                operationalZone.setPriorityLevel(2);
                operationalZone.setViolationAction("RETURN_TO_BASE");
                operationalZone.setMaxAltitudeMeters(120.0); // FAA limit
                
                // Create sample exclusion zone
                Geofence restrictedZone = Geofence.createCircularFence(
                    "Airport Restricted Zone", 40.6413, -73.7781, 8000.0, Geofence.BoundaryType.EXCLUSION);
                restrictedZone.setDescription("No-fly zone around airport");
                restrictedZone.setPriorityLevel(5);
                restrictedZone.setViolationAction("EMERGENCY_LAND");
                restrictedZone.setNotificationEmails("security@example.com,operations@example.com");
                
                // Create emergency zone
                Geofence emergencyZone = Geofence.createCircularFence(
                    "Emergency Response Zone", 40.7589, -73.9851, 2000.0, Geofence.BoundaryType.INCLUSION);
                emergencyZone.setDescription("Emergency response operational area");
                emergencyZone.setPriorityLevel(4);
                emergencyZone.setViolationAction("ALERT");
                emergencyZone.setMaxAltitudeMeters(60.0);
                
                // Create time-restricted zone
                Geofence schoolZone = Geofence.createCircularFence(
                    "School Zone", 40.7505, -73.9934, 500.0, Geofence.BoundaryType.EXCLUSION);
                schoolZone.setDescription("School area - restricted during school hours");
                schoolZone.setPriorityLevel(3);
                schoolZone.setViolationAction("ALERT");
                schoolZone.setTimeFrom("08:00");
                schoolZone.setTimeUntil("15:30");
                schoolZone.setDaysOfWeek("MON,TUE,WED,THU,FRI");
                
                geofenceRepository.save(operationalZone);
                geofenceRepository.save(restrictedZone);
                geofenceRepository.save(emergencyZone);
                geofenceRepository.save(schoolZone);
                
                logger.info("Sample geofences created successfully");
            }
            
        } catch (Exception e) {
            logger.error("Error initializing sample geofences: {}", e.getMessage(), e);
        }
    }

    /**
     * Clean up expired geofences
     */
    @Transactional
    public void cleanupExpiredGeofences() {
        try {
            List<Geofence> expiredGeofences = geofenceRepository.findExpiredGeofences(LocalDateTime.now());
            
            for (Geofence geofence : expiredGeofences) {
                geofence.setStatus(Geofence.FenceStatus.EXPIRED);
                geofenceRepository.save(geofence);
            }
            
            if (!expiredGeofences.isEmpty()) {
                logger.info("Marked {} geofences as expired", expiredGeofences.size());
            }
            
        } catch (Exception e) {
            logger.error("Error cleaning up expired geofences: {}", e.getMessage(), e);
        }
    }

    /**
     * Get geofences that need attention (expiring soon, high violations, etc.)
     */
    public Map<String, Object> getGeofencesNeedingAttention() {
        Map<String, Object> attention = new HashMap<>();
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime nextWeek = now.plusDays(7);
            LocalDateTime yesterday = now.minusHours(24);
            
            // Expiring soon
            List<Geofence> expiringSoon = geofenceRepository.findGeofencesExpiringSoon(now, nextWeek);
            attention.put("expiringSoon", expiringSoon);
            
            // High violation count (more than 10 violations)
            List<Geofence> highViolations = geofenceRepository.findGeofencesWithViolations().stream()
                .filter(g -> g.getTotalViolations() != null && g.getTotalViolations() > 10)
                .toList();
            attention.put("highViolations", highViolations);
            
            // Recent violations
            List<Geofence> recentViolations = geofenceRepository.findGeofencesWithRecentViolations(yesterday);
            attention.put("recentViolations", recentViolations);
            
            // Expired geofences
            List<Geofence> expired = geofenceRepository.findExpiredGeofences(now);
            attention.put("expired", expired);
            
            attention.put("timestamp", now);
            
        } catch (Exception e) {
            logger.error("Error getting geofences needing attention: {}", e.getMessage(), e);
        }
        
        return attention;
    }

    /**
     * Broadcast geofence alert
     */
    public void broadcastGeofenceAlert(String alertType, Map<String, Object> alertData) {
        try {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "GEOFENCE_ALERT");
            alert.put("alertType", alertType);
            alert.put("timestamp", LocalDateTime.now());
            alert.putAll(alertData);
            
            messagingTemplate.convertAndSend("/topic/geofence-alerts", alert);
            
        } catch (Exception e) {
            logger.error("Error broadcasting geofence alert: {}", e.getMessage(), e);
        }
    }
}
