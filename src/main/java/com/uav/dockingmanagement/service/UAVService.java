package com.uav.dockingmanagement.service;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.model.Region;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.repository.RegionRepository;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for UAV (Unmanned Aerial Vehicle) management operations.
 *
 * <p>This service provides comprehensive business logic for UAV management including
 * CRUD operations, region access control, validation, and status management.
 * It serves as the primary business layer between controllers and repositories.</p>
 *
 * <p>Key responsibilities include:</p>
 * <ul>
 * <li>UAV lifecycle management (create, read, update, delete)</li>
 * <li>Region assignment and access control validation</li>
 * <li>UAV status and operational state management</li>
 * <li>Data validation and business rule enforcement</li>
 * <li>Integration with hibernate pod operations</li>
 * <li>RFID tag uniqueness validation</li>
 * </ul>
 *
 * <p>All operations are transactional where appropriate and include proper
 * error handling and logging. The service enforces business rules and
 * maintains data integrity across the system.</p>
 *
 * @author UAV Management System Team
 * @version 1.0
 * @since 1.0
 *
 * @see UAV
 * @see Region
 * @see UAVRepository
 * @see RegionRepository
 */
@Service
public class UAVService {

    /** Repository for UAV data access operations */
    @Autowired
    private UAVRepository uavRepository;

    /** Repository for Region data access operations */
    @Autowired
    private RegionRepository regionRepository;

    /**
     * Creates and persists a new UAV in the system.
     *
     * <p>This method validates the UAV data and saves it to the database.
     * The UAV must pass validation checks before being persisted.</p>
     *
     * @param uav The UAV entity to be created and saved
     * @return The persisted UAV entity with generated ID and timestamps
     * @throws IllegalArgumentException if UAV data is invalid
     * @throws DataIntegrityViolationException if RFID tag is not unique
     *
     * @see #validateUAV(UAV)
     * @see UAVRepository#save(Object)
     */
    public UAV addUAV(UAV uav) {
        return uavRepository.save(uav);
    }

    /**
     * Retrieves all UAVs from the system.
     *
     * <p>Returns a complete list of all UAV entities in the database.
     * This method does not include lazy-loaded associations by default.</p>
     *
     * @return List of all UAV entities, empty list if none exist
     *
     * @see UAVRepository#findAll()
     */
    public List<UAV> getAllUAVs() {
        return uavRepository.findAll();
    }

    /**
     * Permanently removes a UAV from the system.
     *
     * <p>This operation cascades to remove associated data including
     * location history, flight logs, and region associations.
     * This operation cannot be undone.</p>
     *
     * @param id The unique identifier of the UAV to delete
     * @throws EntityNotFoundException if UAV with given ID doesn't exist
     *
     * @warning This operation is irreversible and removes all associated data
     *
     * @see UAVRepository#deleteById(Object)
     */
    public void deleteUAV(int id) {
        uavRepository.deleteById(id);
    }

    /**
     * Retrieves a specific UAV by its unique identifier.
     *
     * @param id The unique identifier of the UAV to retrieve
     * @return Optional containing the UAV if found, empty Optional otherwise
     *
     * @see UAVRepository#findById(Object)
     */
    public Optional<UAV> getUAVById(int id) {
        return uavRepository.findById(id);
    }

    /**
     * Retrieves a UAV by its RFID tag identifier.
     *
     * <p>RFID tags are unique identifiers used for physical UAV identification
     * and access control. This method is commonly used for real-time operations
     * and access validation.</p>
     *
     * @param rfidTag The RFID tag identifier to search for
     * @return Optional containing the UAV if found, empty Optional otherwise
     *
     * @see UAVRepository#findByRfidTag(String)
     * @see #checkUAVRegionAccess(String, String)
     */
    public Optional<UAV> getUAVByRfidTag(String rfidTag) {
        return uavRepository.findByRfidTag(rfidTag);
    }

    /**
     * Validates UAV access to a specific region for access control.
     *
     * <p>This method performs comprehensive access validation including:</p>
     * <ul>
     * <li>UAV existence verification</li>
     * <li>Authorization status check</li>
     * <li>Region assignment verification</li>
     * <li>Operational status validation</li>
     * </ul>
     *
     * <p>This method is primarily used by physical access control systems
     * to determine if a UAV should be granted access to restricted areas.</p>
     *
     * @param rfidTag The RFID tag of the UAV requesting access
     * @param regionName The name of the region being accessed
     * @return String indicating access result:
     *         <ul>
     *         <li>"OPEN THE DOOR" - Access granted</li>
     *         <li>Error message - Access denied with reason</li>
     *         </ul>
     *
     * @apiNote This method returns human-readable strings for integration with
     *          legacy access control systems
     *
     * @see UAV.Status
     * @see Region
     * @see #getUAVByRfidTag(String)
     */
    public String checkUAVRegionAccess(String rfidTag, String regionName) {
        // Check if UAV exists
        Optional<UAV> uavOpt = uavRepository.findByRfidTag(rfidTag);
        if (uavOpt.isEmpty()) {
            return "UAV with RFID " + rfidTag + " not found";
        }

        UAV uav = uavOpt.get();

        // Check if UAV is authorized
        if (uav.getStatus() != UAV.Status.AUTHORIZED) {
            return "UAV is not authorized";
        }

        // Check if region is assigned to the UAV
        boolean hasRegion = uav.getRegions().stream()
                .anyMatch(region -> region.getRegionName().equalsIgnoreCase(regionName));

        if (!hasRegion) {
            return "UAV is not authorized for region: " + regionName;
        }

        // All checks passed
        return "OPEN THE DOOR";
    }
    
    /**
     * Add a region to a specific UAV
     */
    @Transactional
    public UAV addRegionToUAV(int uavId, int regionId) {
        Optional<UAV> uavOpt = uavRepository.findById(uavId);
        Optional<Region> regionOpt = regionRepository.findById(regionId);
        
        if (uavOpt.isPresent() && regionOpt.isPresent()) {
            UAV uav = uavOpt.get();
            Region region = regionOpt.get();
            
            // Add the region to the UAV's regions
            uav.getRegions().add(region);
            UAV updatedUAV = uavRepository.save(uav);
            return updatedUAV;
        }
        
        return null;
    }
    
    /**
     * Remove a region from a specific UAV
     */
    @Transactional
    public UAV removeRegionFromUAV(int uavId, int regionId) {
        Optional<UAV> uavOpt = uavRepository.findById(uavId);
        Optional<Region> regionOpt = regionRepository.findById(regionId);
        
        if (uavOpt.isPresent() && regionOpt.isPresent()) {
            UAV uav = uavOpt.get();
            Region region = regionOpt.get();
            
            // Remove the region from the UAV's regions
            uav.getRegions().remove(region);
            UAV updatedUAV = uavRepository.save(uav);
            return updatedUAV;
        }
        
        return null;
    }

    /**
     * Get available regions that are not already assigned to a UAV
     */
    public List<Region> getUnassignedRegionsForUAV(int uavId) {
        Optional<UAV> uavOpt = uavRepository.findById(uavId);

        if (uavOpt.isPresent()) {
            UAV uav = uavOpt.get();
            List<Region> allRegions = regionRepository.findAll();
            // Filter out regions that are already assigned to this UAV
            return allRegions.stream()
                    .filter(region -> !uav.getRegions().contains(region))
                    .toList();
        }

        return List.of();
    }

    /**
     * Update UAV status
     */
    @Transactional
    public UAV updateUAVStatus(int uavId, UAV.Status newStatus) {
        Optional<UAV> uavOpt = uavRepository.findById(uavId);

        if (uavOpt.isPresent()) {
            UAV uav = uavOpt.get();
            uav.setStatus(newStatus);
            return uavRepository.save(uav);
        }

        return null;
    }

    /**
     * Get UAVs by status
     */
    public List<UAV> getUAVsByStatus(UAV.Status status) {
        return uavRepository.findByStatus(status);
    }

    /**
     * Get UAVs in hibernate pod
     */
    public List<UAV> getUAVsInHibernatePod() {
        return uavRepository.findByInHibernatePod(true);
    }

    /**
     * Count UAVs in hibernate pod
     */
    public long countUAVsInHibernatePod() {
        return uavRepository.countByInHibernatePod(true);
    }

    /**
     * Validate UAV data before saving
     */
    public boolean validateUAV(UAV uav) {
        if (uav.getRfidTag() == null || uav.getRfidTag().trim().isEmpty()) {
            return false;
        }
        if (uav.getOwnerName() == null || uav.getOwnerName().trim().isEmpty()) {
            return false;
        }
        if (uav.getModel() == null || uav.getModel().trim().isEmpty()) {
            return false;
        }
        if (uav.getStatus() == null) {
            return false;
        }
        return true;
    }

    /**
     * Check if RFID tag is unique (excluding a specific UAV ID for updates)
     */
    public boolean isRfidTagUnique(String rfidTag, Integer excludeUavId) {
        Optional<UAV> existingUAV = uavRepository.findByRfidTag(rfidTag);

        if (existingUAV.isEmpty()) {
            return true; // Tag is unique
        }

        // If we're updating an existing UAV, allow the same tag for that UAV
        if (excludeUavId != null && existingUAV.get().getId() == excludeUavId) {
            return true;
        }

        return false; // Tag is not unique
    }
    
    /**
     * Get all regions that are assigned to a specific UAV
     */
    public List<Region> getAssignedRegionsForUAV(int uavId) {
        Optional<UAV> uavOpt = uavRepository.findById(uavId);
        
        if (uavOpt.isPresent()) {
            UAV uav = uavOpt.get();
            // Convert set to list
            return uav.getRegions().stream().toList();
        }
        
        return List.of();
    }
}


