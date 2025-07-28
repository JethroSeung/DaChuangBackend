package com.example.uavdockingmanagementsystem.controller;

import com.example.uavdockingmanagementsystem.model.HibernatePod;
import com.example.uavdockingmanagementsystem.model.Region;
import com.example.uavdockingmanagementsystem.model.UAV;
import com.example.uavdockingmanagementsystem.repository.RegionRepository;
import com.example.uavdockingmanagementsystem.repository.UAVRepository;
import com.example.uavdockingmanagementsystem.service.UAVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST API Controller for UAV Management
 * Provides JSON endpoints for AJAX calls from the frontend
 */
@RestController
@RequestMapping("/api/uav")
@CrossOrigin(origins = "*") // Allow CORS for frontend requests
public class UAVRestController {

    @Autowired
    private UAVRepository uavRepository;
    
    @Autowired
    private RegionRepository regionRepository;
    
    @Autowired
    private UAVService uavService;
    
    @Autowired
    private HibernatePod hibernatePod;

    /**
     * Get all UAVs with their regions
     */
    @GetMapping("/all")
    public ResponseEntity<List<UAV>> getAllUAVs() {
        try {
            List<UAV> uavs = uavRepository.findAllWithRegions();
            return ResponseEntity.ok(uavs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get UAV by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UAV> getUAVById(@PathVariable int id) {
        Optional<UAV> uav = uavRepository.findById(id);
        return uav.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update UAV status via AJAX
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateUAVStatus(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<UAV> uavOpt = uavRepository.findById(id);
            if (uavOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "UAV not found");
                return ResponseEntity.notFound().build();
            }
            
            UAV uav = uavOpt.get();
            UAV.Status oldStatus = uav.getStatus();
            
            // Toggle status
            if (uav.getStatus() == UAV.Status.AUTHORIZED) {
                uav.setStatus(UAV.Status.UNAUTHORIZED);
            } else {
                uav.setStatus(UAV.Status.AUTHORIZED);
            }
            
            UAV savedUAV = uavRepository.save(uav);
            
            response.put("success", true);
            response.put("message", "UAV status updated successfully");
            response.put("oldStatus", oldStatus.toString());
            response.put("newStatus", savedUAV.getStatus().toString());
            response.put("uav", savedUAV);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating UAV status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete UAV via AJAX
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUAV(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (!uavRepository.existsById(id)) {
                response.put("success", false);
                response.put("message", "UAV not found");
                return ResponseEntity.notFound().build();
            }
            
            // Remove from hibernate pod if present
            Optional<UAV> uavOpt = uavRepository.findById(id);
            if (uavOpt.isPresent() && uavOpt.get().isInHibernatePod()) {
                hibernatePod.removeUAV(uavOpt.get());
            }
            
            uavRepository.deleteById(id);
            
            response.put("success", true);
            response.put("message", "UAV deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting UAV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Add region to UAV via AJAX
     */
    @PostMapping("/{uavId}/regions/{regionId}")
    public ResponseEntity<Map<String, Object>> addRegionToUAV(
            @PathVariable int uavId, 
            @PathVariable int regionId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<UAV> uavOpt = uavRepository.findById(uavId);
            Optional<Region> regionOpt = regionRepository.findById(regionId);
            
            if (uavOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "UAV not found");
                return ResponseEntity.notFound().build();
            }
            
            if (regionOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Region not found");
                return ResponseEntity.notFound().build();
            }
            
            UAV uav = uavOpt.get();
            Region region = regionOpt.get();
            
            // Check if region is already assigned
            if (uav.getRegions().contains(region)) {
                response.put("success", false);
                response.put("message", "Region is already assigned to this UAV");
                return ResponseEntity.badRequest().body(response);
            }
            
            uav.getRegions().add(region);
            UAV savedUAV = uavRepository.save(uav);
            
            response.put("success", true);
            response.put("message", "Region added to UAV successfully");
            response.put("uav", savedUAV);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error adding region to UAV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Remove region from UAV via AJAX
     */
    @DeleteMapping("/{uavId}/regions/{regionId}")
    public ResponseEntity<Map<String, Object>> removeRegionFromUAV(
            @PathVariable int uavId, 
            @PathVariable int regionId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<UAV> uavOpt = uavRepository.findById(uavId);
            Optional<Region> regionOpt = regionRepository.findById(regionId);
            
            if (uavOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "UAV not found");
                return ResponseEntity.notFound().build();
            }
            
            if (regionOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Region not found");
                return ResponseEntity.notFound().build();
            }
            
            UAV uav = uavOpt.get();
            Region region = regionOpt.get();
            
            if (!uav.getRegions().contains(region)) {
                response.put("success", false);
                response.put("message", "Region is not assigned to this UAV");
                return ResponseEntity.badRequest().body(response);
            }
            
            uav.getRegions().remove(region);
            UAV savedUAV = uavRepository.save(uav);
            
            response.put("success", true);
            response.put("message", "Region removed from UAV successfully");
            response.put("uav", savedUAV);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error removing region from UAV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get available regions for a UAV (not already assigned)
     */
    @GetMapping("/{uavId}/available-regions")
    public ResponseEntity<List<Region>> getAvailableRegionsForUAV(@PathVariable int uavId) {
        try {
            List<Region> availableRegions = uavService.getUnassignedRegionsForUAV(uavId);
            return ResponseEntity.ok(availableRegions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Validate RFID tag uniqueness
     */
    @GetMapping("/validate-rfid/{rfidTag}")
    public ResponseEntity<Map<String, Object>> validateRfidTag(@PathVariable String rfidTag) {
        Map<String, Object> response = new HashMap<>();

        Optional<UAV> existingUAV = uavRepository.findByRfidTag(rfidTag);
        boolean isUnique = existingUAV.isEmpty();

        response.put("isUnique", isUnique);
        response.put("message", isUnique ? "RFID tag is available" : "RFID tag is already in use");

        return ResponseEntity.ok(response);
    }

    /**
     * Get UAVs by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<UAV>> getUAVsByStatus(@PathVariable String status) {
        try {
            UAV.Status uavStatus = UAV.Status.valueOf(status.toUpperCase());
            List<UAV> uavs = uavService.getUAVsByStatus(uavStatus);
            return ResponseEntity.ok(uavs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get system statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();

            List<UAV> allUAVs = uavRepository.findAll();
            long authorizedCount = allUAVs.stream().filter(uav -> uav.getStatus() == UAV.Status.AUTHORIZED).count();
            long unauthorizedCount = allUAVs.stream().filter(uav -> uav.getStatus() == UAV.Status.UNAUTHORIZED).count();
            long hibernatingCount = uavService.countUAVsInHibernatePod();

            stats.put("totalUAVs", allUAVs.size());
            stats.put("authorizedUAVs", authorizedCount);
            stats.put("unauthorizedUAVs", unauthorizedCount);
            stats.put("hibernatingUAVs", hibernatingCount);
            stats.put("activeUAVs", allUAVs.size() - hibernatingCount);

            // Region statistics
            List<Region> allRegions = regionRepository.findAll();
            stats.put("totalRegions", allRegions.size());

            // Hibernate pod statistics
            stats.put("hibernatePodCapacity", hibernatePod.getMaxCapacity());
            stats.put("hibernatePodUsed", hibernatePod.getCurrentCapacity());
            stats.put("hibernatePodAvailable", hibernatePod.getAvailableCapacity());

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
