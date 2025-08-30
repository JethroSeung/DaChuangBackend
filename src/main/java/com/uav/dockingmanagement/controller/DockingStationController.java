package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.model.DockingStation;
import com.uav.dockingmanagement.repository.DockingStationRepository;
import com.uav.dockingmanagement.service.DockingStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Docking Station management
 * Provides endpoints for station operations, status monitoring, and location
 * services
 */
@RestController
@RequestMapping("/api/docking-stations")
@CrossOrigin(origins = "*")
public class DockingStationController {

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private DockingStationService dockingStationService;

    /**
     * Get all docking stations
     */
    @GetMapping
    public ResponseEntity<List<DockingStation>> getAllStations() {
        try {
            List<DockingStation> stations = dockingStationRepository.findAll();
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get docking station by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DockingStation> getStationById(@PathVariable Long id) {
        try {
            Optional<DockingStation> station = dockingStationRepository.findById(id);
            return station.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new docking station
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createStation(@RequestBody DockingStation station) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validate required fields
            if (station.getName() == null || station.getName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Station name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (station.getLatitude() == null || station.getLongitude() == null) {
                response.put("success", false);
                response.put("message", "Station coordinates are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (station.getMaxCapacity() == null || station.getMaxCapacity() <= 0) {
                response.put("success", false);
                response.put("message", "Valid max capacity is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Check if station name already exists
            Optional<DockingStation> existingStation = dockingStationRepository.findByName(station.getName());
            if (existingStation.isPresent()) {
                response.put("success", false);
                response.put("message", "Station with this name already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Set default values
            if (station.getCurrentOccupancy() == null) {
                station.setCurrentOccupancy(0);
            }
            if (station.getStatus() == null) {
                station.setStatus(DockingStation.StationStatus.OPERATIONAL);
            }
            if (station.getStationType() == null) {
                station.setStationType(DockingStation.StationType.STANDARD);
            }

            DockingStation savedStation = dockingStationRepository.save(station);

            response.put("success", true);
            response.put("message", "Docking station created successfully");
            response.put("station", savedStation);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating station: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update docking station
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateStation(@PathVariable Long id,
            @RequestBody DockingStation stationUpdate) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<DockingStation> existingStationOpt = dockingStationRepository.findById(id);
            if (existingStationOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Station not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            DockingStation existingStation = existingStationOpt.get();

            // Update fields
            if (stationUpdate.getName() != null) {
                existingStation.setName(stationUpdate.getName());
            }
            if (stationUpdate.getDescription() != null) {
                existingStation.setDescription(stationUpdate.getDescription());
            }
            if (stationUpdate.getLatitude() != null) {
                existingStation.setLatitude(stationUpdate.getLatitude());
            }
            if (stationUpdate.getLongitude() != null) {
                existingStation.setLongitude(stationUpdate.getLongitude());
            }
            if (stationUpdate.getAltitudeMeters() != null) {
                existingStation.setAltitudeMeters(stationUpdate.getAltitudeMeters());
            }
            if (stationUpdate.getMaxCapacity() != null) {
                existingStation.setMaxCapacity(stationUpdate.getMaxCapacity());
            }
            if (stationUpdate.getStatus() != null) {
                existingStation.setStatus(stationUpdate.getStatus());
            }
            if (stationUpdate.getStationType() != null) {
                existingStation.setStationType(stationUpdate.getStationType());
            }
            if (stationUpdate.getChargingAvailable() != null) {
                existingStation.setChargingAvailable(stationUpdate.getChargingAvailable());
            }
            if (stationUpdate.getMaintenanceAvailable() != null) {
                existingStation.setMaintenanceAvailable(stationUpdate.getMaintenanceAvailable());
            }
            if (stationUpdate.getWeatherProtected() != null) {
                existingStation.setWeatherProtected(stationUpdate.getWeatherProtected());
            }
            if (stationUpdate.getSecurityLevel() != null) {
                existingStation.setSecurityLevel(stationUpdate.getSecurityLevel());
            }
            if (stationUpdate.getContactInfo() != null) {
                existingStation.setContactInfo(stationUpdate.getContactInfo());
            }

            DockingStation savedStation = dockingStationRepository.save(existingStation);

            response.put("success", true);
            response.put("message", "Station updated successfully");
            response.put("station", savedStation);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating station: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete docking station
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteStation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<DockingStation> stationOpt = dockingStationRepository.findById(id);
            if (stationOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Station not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            DockingStation station = stationOpt.get();

            // Check if station has active dockings
            if (station.getCurrentOccupancy() > 0) {
                response.put("success", false);
                response.put("message", "Cannot delete station with active dockings");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            dockingStationRepository.delete(station);

            response.put("success", true);
            response.put("message", "Station deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting station: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get operational stations
     */
    @GetMapping("/operational")
    public ResponseEntity<List<DockingStation>> getOperationalStations() {
        try {
            List<DockingStation> stations = dockingStationRepository.findOperationalStations();
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get available stations
     */
    @GetMapping("/available")
    public ResponseEntity<List<DockingStation>> getAvailableStations() {
        try {
            List<DockingStation> stations = dockingStationRepository.findAvailableStations();
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get stations by type
     */
    @GetMapping("/type/{stationType}")
    public ResponseEntity<List<DockingStation>> getStationsByType(@PathVariable String stationType) {
        try {
            DockingStation.StationType type = DockingStation.StationType.valueOf(stationType.toUpperCase());
            List<DockingStation> stations = dockingStationRepository.findByStationType(type);
            return ResponseEntity.ok(stations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get stations with charging capability
     */
    @GetMapping("/charging")
    public ResponseEntity<List<DockingStation>> getChargingStations() {
        try {
            List<DockingStation> stations = dockingStationRepository.findByChargingAvailableTrue();
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get stations with maintenance capability
     */
    @GetMapping("/maintenance")
    public ResponseEntity<List<DockingStation>> getMaintenanceStations() {
        try {
            List<DockingStation> stations = dockingStationRepository.findByMaintenanceAvailableTrue();
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Find nearest stations to a point
     */
    @GetMapping("/nearest")
    public ResponseEntity<List<DockingStation>> getNearestStations(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5") Integer limit) {
        try {
            List<DockingStation> stations = dockingStationRepository.findNearestStations(latitude, longitude, limit);
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Find stations in geographical area
     */
    @GetMapping("/area")
    public ResponseEntity<List<DockingStation>> getStationsInArea(
            @RequestParam Double minLatitude,
            @RequestParam Double maxLatitude,
            @RequestParam Double minLongitude,
            @RequestParam Double maxLongitude) {
        try {
            List<DockingStation> stations = dockingStationRepository.findStationsInArea(
                    minLatitude, maxLatitude, minLongitude, maxLongitude);
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get station statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStationStatistics() {
        try {
            Map<String, Object> stats = dockingStationService.getStationStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update station status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {

        Map<String, Object> response = new HashMap<>();

        try {
            Optional<DockingStation> stationOpt = dockingStationRepository.findById(id);
            if (stationOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Station not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            DockingStation station = stationOpt.get();
            String newStatus = statusUpdate.get("status");

            try {
                DockingStation.StationStatus status = DockingStation.StationStatus.valueOf(newStatus.toUpperCase());
                station.setStatus(status);
                dockingStationRepository.save(station);

                response.put("success", true);
                response.put("message", "Station status updated successfully");
                response.put("newStatus", status);

                return ResponseEntity.ok(response);

            } catch (IllegalArgumentException e) {
                response.put("success", false);
                response.put("message", "Invalid status value");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating station status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Dock UAV at station
     */
    @PostMapping("/{id}/dock")
    public ResponseEntity<Map<String, Object>> dockUAV(
            @PathVariable Long id,
            @RequestParam Integer uavId,
            @RequestParam String purpose) {

        try {
            Map<String, Object> result = dockingStationService.dockUAV(uavId, id, purpose);

            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(result);
            } else {
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(result);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error docking UAV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        }
    }

    /**
     * Undock UAV from station
     */
    @PostMapping("/{id}/undock")
    public ResponseEntity<Map<String, Object>> undockUAV(
            @PathVariable Long id,
            @RequestParam Integer uavId) {

        try {
            Map<String, Object> result = dockingStationService.undockUAV(uavId);

            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(result);
            } else {
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(result);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error undocking UAV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        }
    }

    /**
     * Find optimal docking station
     */
    @GetMapping("/optimal")
    public ResponseEntity<DockingStation> findOptimalStation(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam String purpose) {

        try {
            Optional<DockingStation> optimalStation = dockingStationService.findOptimalStation(latitude, longitude,
                    purpose);

            if (optimalStation.isPresent()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(optimalStation.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
