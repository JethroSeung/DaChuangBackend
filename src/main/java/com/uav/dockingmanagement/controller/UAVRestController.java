package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.model.HibernatePod;
import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.RegionRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.service.UAVService;
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
 *
 * <p>This controller provides comprehensive JSON endpoints for UAV (Unmanned Aerial Vehicle)
 * management operations. It handles CRUD operations, region assignments, and status updates
 * for UAVs in the system.</p>
 *
 * <p>All endpoints return JSON responses and support CORS for frontend integration.
 * Authentication and authorization are handled through Spring Security with role-based
 * access control (USER, OPERATOR, ADMIN).</p>
 *
 * @author UAV Management System Team
 * @version 1.0
 * @since 1.0
 *
 * @see UAV
 * @see UAVService
 * @see UAVRepository
 */
@RestController
@RequestMapping("/api/uav")
@CrossOrigin(origins = "*") // Allow CORS for frontend requests
public class UAVRestController {

    /** Repository for UAV data access operations */
    @Autowired
    private UAVRepository uavRepository;

    /** Repository for Region data access operations */
    @Autowired
    private RegionRepository regionRepository;

    /** Service layer for UAV business logic */
    @Autowired
    private UAVService uavService;

    /** Hibernate pod singleton for UAV storage management */
    @Autowired
    private HibernatePod hibernatePod;

    /**
     * Retrieves all UAVs in the system with their associated regions.
     *
     * <p>This endpoint returns a complete list of all UAVs registered in the system,
     * including their current status, operational information, and assigned regions.
     * The response includes lazy-loaded region associations.</p>
     *
     * <p><strong>Security:</strong> Requires USER, OPERATOR, or ADMIN role</p>
     *
     * @return ResponseEntity containing:
     *         <ul>
     *         <li>200 OK: List of UAV objects with regions</li>
     *         <li>500 Internal Server Error: If database operation fails</li>
     *         </ul>
     *
     * @apiNote This endpoint supports pagination in future versions
     *
     * @see UAV
     * @see Region
     * @see UAVRepository#findAllWithRegions()
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
     * Retrieves a specific UAV by its unique identifier.
     *
     * <p>This endpoint returns detailed information about a single UAV including
     * all its properties, relationships, and current status. The UAV is identified
     * by its database ID.</p>
     *
     * <p><strong>Security:</strong> Requires USER, OPERATOR, or ADMIN role</p>
     *
     * @param id The unique identifier of the UAV to retrieve
     * @return ResponseEntity containing:
     *         <ul>
     *         <li>200 OK: UAV object if found</li>
     *         <li>404 Not Found: If UAV with given ID doesn't exist</li>
     *         </ul>
     *
     * @see UAV
     * @see UAVRepository#findById(Object)
     */
    @GetMapping("/{id}")
    public ResponseEntity<UAV> getUAVById(@PathVariable int id) {
        Optional<UAV> uav = uavRepository.findById(id);
        return uav.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Updates the authorization status of a UAV.
     *
     * <p>This endpoint toggles the UAV's authorization status between AUTHORIZED
     * and UNAUTHORIZED. This is commonly used for access control and operational
     * management. The operation is atomic and includes audit logging.</p>
     *
     * <p><strong>Security:</strong> Requires OPERATOR or ADMIN role</p>
     *
     * <p><strong>Business Logic:</strong></p>
     * <ul>
     * <li>AUTHORIZED -> UNAUTHORIZED: Revokes UAV access to all regions</li>
     * <li>UNAUTHORIZED -> AUTHORIZED: Grants UAV access based on assigned regions</li>
     * </ul>
     *
     * @param id The unique identifier of the UAV to update
     * @return ResponseEntity containing:
     *         <ul>
     *         <li>200 OK: Success response with old/new status and updated UAV</li>
     *         <li>404 Not Found: If UAV with given ID doesn't exist</li>
     *         <li>500 Internal Server Error: If database operation fails</li>
     *         </ul>
     *
     * @apiNote The response includes both old and new status for audit purposes
     *
     * @see UAV.Status
     * @see UAVRepository#save(Object)
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
     * Permanently removes a UAV from the system.
     *
     * <p>This endpoint performs a hard delete of the UAV record and all associated
     * data including location history, flight logs, and maintenance records.
     * This operation cannot be undone.</p>
     *
     * <p><strong>Security:</strong> Requires ADMIN role only</p>
     *
     * <p><strong>Cascade Operations:</strong></p>
     * <ul>
     * <li>Removes UAV from hibernate pod if present</li>
     * <li>Deletes all location history records</li>
     * <li>Removes region associations</li>
     * <li>Archives flight logs (if configured)</li>
     * </ul>
     *
     * @param id The unique identifier of the UAV to delete
     * @return ResponseEntity containing:
     *         <ul>
     *         <li>200 OK: Success response confirming deletion</li>
     *         <li>404 Not Found: If UAV with given ID doesn't exist</li>
     *         <li>500 Internal Server Error: If deletion fails due to constraints</li>
     *         </ul>
     *
     * @warning This operation is irreversible and will delete all associated data
     *
     * @see UAVRepository#deleteById(Object)
     * @see HibernatePod#removeUAV(UAV)
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
            UAV updatedUAV = uavService.addRegionToUAV(uavId, regionId);

            if (updatedUAV == null) {
                response.put("success", false);
                response.put("message", "Failed to add region to UAV");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("success", true);
            response.put("message", "Region added to UAV successfully");
            response.put("uav", updatedUAV);

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
            UAV updatedUAV = uavService.removeRegionFromUAV(uavId, regionId);

            if (updatedUAV == null) {
                response.put("success", false);
                response.put("message", "Failed to remove region from UAV");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("success", true);
            response.put("message", "Region removed from UAV successfully");
            response.put("uav", updatedUAV);

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
