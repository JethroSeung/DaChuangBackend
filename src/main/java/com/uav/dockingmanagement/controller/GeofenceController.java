package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.model.Geofence;
import com.uav.dockingmanagement.repository.GeofenceRepository;
import com.uav.dockingmanagement.service.GeofenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Geofence management
 * Provides endpoints for creating, managing, and monitoring geofences
 */
@RestController
@RequestMapping("/api/geofences")
@CrossOrigin(origins = "*")
public class GeofenceController {

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private GeofenceService geofenceService;

    /**
     * Get all geofences
     */
    @GetMapping
    public ResponseEntity<List<Geofence>> getAllGeofences() {
        try {
            List<Geofence> geofences = geofenceRepository.findAll();
            return ResponseEntity.ok(geofences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get geofence by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Geofence> getGeofenceById(@PathVariable Long id) {
        try {
            Optional<Geofence> geofence = geofenceRepository.findById(id);
            return geofence.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new geofence
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createGeofence(@RequestBody Geofence geofence) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate required fields
            if (geofence.getName() == null || geofence.getName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Geofence name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Check if geofence name already exists
            Optional<Geofence> existingGeofence = geofenceRepository.findByName(geofence.getName());
            if (existingGeofence.isPresent()) {
                response.put("success", false);
                response.put("message", "Geofence with this name already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Validate geofence data based on type
            if (geofence.getFenceType() == Geofence.FenceType.CIRCULAR) {
                if (geofence.getCenterLatitude() == null || geofence.getCenterLongitude() == null || geofence.getRadiusMeters() == null) {
                    response.put("success", false);
                    response.put("message", "Circular geofence requires center coordinates and radius");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                if (geofence.getRadiusMeters() <= 0) {
                    response.put("success", false);
                    response.put("message", "Radius must be greater than 0");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            } else if (geofence.getFenceType() == Geofence.FenceType.POLYGONAL) {
                if (geofence.getPolygonCoordinates() == null || geofence.getPolygonCoordinates().trim().isEmpty()) {
                    response.put("success", false);
                    response.put("message", "Polygonal geofence requires polygon coordinates");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            }

            // Set default values
            if (geofence.getStatus() == null) {
                geofence.setStatus(Geofence.FenceStatus.ACTIVE);
            }
            if (geofence.getPriorityLevel() == null) {
                geofence.setPriorityLevel(1);
            }
            if (geofence.getTotalViolations() == null) {
                geofence.setTotalViolations(0);
            }

            Geofence savedGeofence = geofenceRepository.save(geofence);
            
            response.put("success", true);
            response.put("message", "Geofence created successfully");
            response.put("geofence", savedGeofence);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating geofence: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update geofence
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateGeofence(@PathVariable Long id, @RequestBody Geofence geofenceUpdate) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Geofence> existingGeofenceOpt = geofenceRepository.findById(id);
            if (existingGeofenceOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Geofence not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Geofence existingGeofence = existingGeofenceOpt.get();
            
            // Update fields
            if (geofenceUpdate.getName() != null) {
                existingGeofence.setName(geofenceUpdate.getName());
            }
            if (geofenceUpdate.getDescription() != null) {
                existingGeofence.setDescription(geofenceUpdate.getDescription());
            }
            if (geofenceUpdate.getStatus() != null) {
                existingGeofence.setStatus(geofenceUpdate.getStatus());
            }
            if (geofenceUpdate.getPriorityLevel() != null) {
                existingGeofence.setPriorityLevel(geofenceUpdate.getPriorityLevel());
            }
            if (geofenceUpdate.getViolationAction() != null) {
                existingGeofence.setViolationAction(geofenceUpdate.getViolationAction());
            }
            if (geofenceUpdate.getNotificationEmails() != null) {
                existingGeofence.setNotificationEmails(geofenceUpdate.getNotificationEmails());
            }
            if (geofenceUpdate.getActiveFrom() != null) {
                existingGeofence.setActiveFrom(geofenceUpdate.getActiveFrom());
            }
            if (geofenceUpdate.getActiveUntil() != null) {
                existingGeofence.setActiveUntil(geofenceUpdate.getActiveUntil());
            }
            if (geofenceUpdate.getMinAltitudeMeters() != null) {
                existingGeofence.setMinAltitudeMeters(geofenceUpdate.getMinAltitudeMeters());
            }
            if (geofenceUpdate.getMaxAltitudeMeters() != null) {
                existingGeofence.setMaxAltitudeMeters(geofenceUpdate.getMaxAltitudeMeters());
            }

            Geofence savedGeofence = geofenceRepository.save(existingGeofence);
            
            response.put("success", true);
            response.put("message", "Geofence updated successfully");
            response.put("geofence", savedGeofence);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating geofence: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete geofence
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteGeofence(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Geofence> geofenceOpt = geofenceRepository.findById(id);
            if (geofenceOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Geofence not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            geofenceRepository.deleteById(id);
            
            response.put("success", true);
            response.put("message", "Geofence deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting geofence: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get active geofences
     */
    @GetMapping("/active")
    public ResponseEntity<List<Geofence>> getActiveGeofences() {
        try {
            List<Geofence> geofences = geofenceRepository.findCurrentlyActiveGeofences(LocalDateTime.now());
            return ResponseEntity.ok(geofences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get geofences by type
     */
    @GetMapping("/type/{fenceType}")
    public ResponseEntity<List<Geofence>> getGeofencesByType(@PathVariable String fenceType) {
        try {
            Geofence.FenceType type = Geofence.FenceType.valueOf(fenceType.toUpperCase());
            List<Geofence> geofences = geofenceRepository.findByFenceType(type);
            return ResponseEntity.ok(geofences);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Check if point is inside any geofence
     */
    @GetMapping("/check-point")
    public ResponseEntity<Map<String, Object>> checkPoint(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) Double altitude) {
        
        try {
            Map<String, Object> result = geofenceService.checkPointAgainstGeofences(latitude, longitude, altitude);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error checking point: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get geofences in geographical area
     */
    @GetMapping("/area")
    public ResponseEntity<List<Geofence>> getGeofencesInArea(
            @RequestParam Double minLatitude,
            @RequestParam Double maxLatitude,
            @RequestParam Double minLongitude,
            @RequestParam Double maxLongitude) {
        try {
            List<Geofence> geofences = geofenceRepository.findGeofencesInArea(
                minLatitude, maxLatitude, minLongitude, maxLongitude);
            return ResponseEntity.ok(geofences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get geofences with violations
     */
    @GetMapping("/violations")
    public ResponseEntity<List<Geofence>> getGeofencesWithViolations() {
        try {
            List<Geofence> geofences = geofenceRepository.findGeofencesWithViolations();
            return ResponseEntity.ok(geofences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get geofence statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getGeofenceStatistics() {
        try {
            Map<String, Object> stats = geofenceService.getGeofenceStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create circular geofence
     */
    @PostMapping("/circular")
    public ResponseEntity<Map<String, Object>> createCircularGeofence(@RequestBody Map<String, Object> geofenceData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String name = (String) geofenceData.get("name");
            Double centerLat = Double.valueOf(geofenceData.get("centerLatitude").toString());
            Double centerLon = Double.valueOf(geofenceData.get("centerLongitude").toString());
            Double radius = Double.valueOf(geofenceData.get("radiusMeters").toString());
            String boundaryTypeStr = (String) geofenceData.getOrDefault("boundaryType", "INCLUSION");
            
            Geofence.BoundaryType boundaryType = Geofence.BoundaryType.valueOf(boundaryTypeStr.toUpperCase());
            
            Geofence geofence = Geofence.createCircularFence(name, centerLat, centerLon, radius, boundaryType);
            
            if (geofenceData.containsKey("description")) {
                geofence.setDescription((String) geofenceData.get("description"));
            }
            if (geofenceData.containsKey("priorityLevel")) {
                geofence.setPriorityLevel(Integer.valueOf(geofenceData.get("priorityLevel").toString()));
            }
            if (geofenceData.containsKey("violationAction")) {
                geofence.setViolationAction((String) geofenceData.get("violationAction"));
            }
            
            Geofence savedGeofence = geofenceRepository.save(geofence);
            
            response.put("success", true);
            response.put("message", "Circular geofence created successfully");
            response.put("geofence", savedGeofence);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating circular geofence: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update geofence status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateGeofenceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Geofence> geofenceOpt = geofenceRepository.findById(id);
            if (geofenceOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Geofence not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Geofence geofence = geofenceOpt.get();
            String newStatus = statusUpdate.get("status");
            
            try {
                Geofence.FenceStatus status = Geofence.FenceStatus.valueOf(newStatus.toUpperCase());
                geofence.setStatus(status);
                geofenceRepository.save(geofence);
                
                response.put("success", true);
                response.put("message", "Geofence status updated successfully");
                response.put("newStatus", status);
                
                return ResponseEntity.ok(response);
                
            } catch (IllegalArgumentException e) {
                response.put("success", false);
                response.put("message", "Invalid status value");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating geofence status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
