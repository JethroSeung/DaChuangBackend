package com.example.uavdockingmanagementsystem.service;
import com.example.uavdockingmanagementsystem.model.UAV;
import com.example.uavdockingmanagementsystem.model.Region;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.uavdockingmanagementsystem.repository.UAVRepository;
import com.example.uavdockingmanagementsystem.repository.RegionRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UAVService {

    @Autowired
    private UAVRepository uavRepository;
    
    @Autowired
    private RegionRepository regionRepository;

    // Add a new UAV
    public UAV addUAV(UAV uav) {
        return uavRepository.save(uav);
    }

    // Get all UAVs
    public List<UAV> getAllUAVs() {
        return uavRepository.findAll();
    }

    // Delete UAV by ID
    public void deleteUAV(int id) {
        uavRepository.deleteById(id);
    }

    // Get UAV by ID
    public Optional<UAV> getUAVById(int id) {
        return uavRepository.findById(id);
    }
    
    /**
     * Get UAV by RFID tag
     */
    public Optional<UAV> getUAVByRfidTag(String rfidTag) {
        return uavRepository.findByRfidTag(rfidTag);
    }
    
    /**
     * Check if a UAV has access to a specific region
     * Returns a string with the result of the validation
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


