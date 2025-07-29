package com.example.uavdockingmanagementsystem.service;

import com.example.uavdockingmanagementsystem.model.Region;
import com.example.uavdockingmanagementsystem.model.UAV;
import com.example.uavdockingmanagementsystem.repository.RegionRepository;
import com.example.uavdockingmanagementsystem.repository.UAVRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class RegionService {

    private static final Logger logger = LoggerFactory.getLogger(RegionService.class);

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private UAVRepository uavRepository;

    /**
     * Get all regions
     */
    @Cacheable("regions")
    public List<Region> getAllRegions() {
        List<Region> regions = regionRepository.findAll();
        logger.info("Retrieved {} regions from database", regions.size());
        return regions;
    }

    /**
     * Get region by ID
     */
    public Optional<Region> getRegionById(int id) {
        Optional<Region> region = regionRepository.findById(id);
        if (region.isPresent()) {
            logger.debug("Found region: {} (ID: {})", region.get().getRegionName(), id);
        } else {
            logger.warn("Region with ID {} not found", id);
        }
        return region;
    }

    /**
     * Create a new region
     */
    @CacheEvict(value = "regions", allEntries = true)
    public Region createRegion(String regionName) {
        Region region = new Region(regionName);
        Region savedRegion = regionRepository.save(region);
        logger.info("Created new region: {} (ID: {})", savedRegion.getRegionName(), savedRegion.getId());
        return savedRegion;
    }

    /**
     * Update an existing region
     */
    public Region updateRegion(int id, String regionName) {
        Optional<Region> regionOpt = regionRepository.findById(id);
        if (regionOpt.isPresent()) {
            Region region = regionOpt.get();
            String oldName = region.getRegionName();
            region.setRegionName(regionName);
            Region updatedRegion = regionRepository.save(region);
            logger.info("Updated region {} from '{}' to '{}'", id, oldName, regionName);
            return updatedRegion;
        }
        logger.warn("Failed to update region {}: region not found", id);
        return null;
    }

    /**
     * Delete a region by ID
     */
    @Transactional
    public void deleteRegion(int id) {
        if (regionRepository.existsById(id)) {
            // This will automatically handle removal from the junction table
            regionRepository.deleteById(id);
            logger.info("Deleted region with ID: {}", id);
        } else {
            logger.warn("Failed to delete region {}: region not found", id);
        }
    }

    /**
     * Get all UAVs that are assigned to a specific region
     */
    public List<UAV> getUAVsByRegion(int regionId) {
        try {
            List<UAV> uavs = uavRepository.findByRegionId(regionId);
            logger.debug("Found {} UAVs for region ID {}", uavs.size(), regionId);
            return uavs;
        } catch (Exception e) {
            logger.error("Error finding UAVs for region {}: {}", regionId, e.getMessage());
            // Fallback to filtering method
            List<UAV> allUAVs = uavRepository.findAllWithRegions();
            List<UAV> filteredUAVs = allUAVs.stream()
                    .filter(uav -> uav.getRegions().stream()
                            .anyMatch(region -> region.getId() == regionId))
                    .toList();
            logger.info("Found {} UAVs for region ID {} (using fallback method)", filteredUAVs.size(), regionId);
            return filteredUAVs;
        }
    }

    /**
     * Initialize sample regions if none exist
     */
    @Transactional
    public void initializeSampleRegions() {
        try {
            long count = regionRepository.count();
            logger.info("Current region count in database: {}", count);

            if (count == 0) {
                logger.info("Initializing sample regions...");
                Region north = createRegion("North");
                Region south = createRegion("South");
                Region east = createRegion("East");
                Region west = createRegion("West");
                logger.info("Sample regions created: North(ID:{}), South(ID:{}), East(ID:{}), West(ID:{})",
                           north.getId(), south.getId(), east.getId(), west.getId());
            } else {
                logger.info("Sample regions already exist. Skipping initialization.");
            }
        } catch (Exception e) {
            // This can happen during tests or when database tables don't exist yet
            logger.warn("Could not initialize sample regions from database: {}. This is normal during tests.", e.getMessage());
        }
    }

    /**
     * Update an existing region using Region object
     */
    public Region updateRegion(int id, Region updatedRegion) {
        Optional<Region> regionOpt = regionRepository.findById(id);
        if (regionOpt.isPresent()) {
            Region region = regionOpt.get();
            String oldName = region.getRegionName();
            region.setRegionName(updatedRegion.getRegionName());
            Region savedRegion = regionRepository.save(region);
            logger.info("Updated region {} from '{}' to '{}'", id, oldName, updatedRegion.getRegionName());
            return savedRegion;
        }
        logger.warn("Failed to update region {}: region not found", id);
        return null;
    }

    /**
     * Get region by name
     */
    public Optional<Region> getRegionByName(String regionName) {
        try {
            Optional<Region> region = regionRepository.findByRegionName(regionName);
            if (region.isPresent()) {
                logger.debug("Found region by name: {}", regionName);
            } else {
                logger.debug("Region not found by name: {}", regionName);
            }
            return region;
        } catch (Exception e) {
            logger.error("Error finding region by name {}: {}", regionName, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Get region by name (case insensitive)
     */
    public Optional<Region> getRegionByNameIgnoreCase(String regionName) {
        try {
            Optional<Region> region = regionRepository.findByRegionNameIgnoreCase(regionName);
            if (region.isPresent()) {
                logger.debug("Found region by name (case insensitive): {}", regionName);
            } else {
                logger.debug("Region not found by name (case insensitive): {}", regionName);
            }
            return region;
        } catch (Exception e) {
            logger.error("Error finding region by name (case insensitive) {}: {}", regionName, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Validate region name
     */
    public boolean validateRegionName(String regionName) {
        if (regionName == null || regionName.trim().isEmpty()) {
            return false;
        }
        if (regionName.length() < 2 || regionName.length() > 50) {
            return false;
        }
        // Check for special characters
        return regionName.matches("^[a-zA-Z0-9\\s-_]+$");
    }

    /**
     * Check if region name is unique
     */
    public boolean isRegionNameUnique(String regionName, Integer excludeId) {
        try {
            Optional<Region> existing = regionRepository.findByRegionName(regionName);
            if (existing.isEmpty()) {
                return true;
            }
            // If we're updating a region, check if the existing region is the same one we're updating
            return excludeId != null && existing.get().getId() == excludeId;
        } catch (Exception e) {
            logger.error("Error checking region name uniqueness for {}: {}", regionName, e.getMessage());
            return false;
        }
    }

    /**
     * Get region statistics
     */
    public Map<String, Object> getRegionStatistics() {
        Map<String, Object> stats = new HashMap<>();
        try {
            long totalRegions = regionRepository.count();
            stats.put("totalRegions", totalRegions);
            
            // Get regions with UAV counts
            List<Region> allRegions = regionRepository.findAll();
            List<Map<String, Object>> regionData = new ArrayList<>();
            
            for (Region region : allRegions) {
                Map<String, Object> regionInfo = new HashMap<>();
                regionInfo.put("id", region.getId());
                regionInfo.put("name", region.getRegionName());
                
                List<UAV> uavsInRegion = getUAVsByRegion(region.getId());
                regionInfo.put("uavCount", uavsInRegion.size());
                regionData.add(regionInfo);
            }
            
            stats.put("regions", regionData);
            stats.put("timestamp", java.time.LocalDateTime.now());
            
        } catch (Exception e) {
            logger.error("Error getting region statistics: {}", e.getMessage());
            stats.put("error", "Unable to retrieve statistics");
        }
        return stats;
    }

    /**
     * Search regions by name
     */
    public List<Region> searchRegions(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return regionRepository.findAll();
        }
        try {
            return regionRepository.findByRegionNameContainingIgnoreCase(searchTerm.trim());
        } catch (Exception e) {
            logger.error("Error searching regions with term {}: {}", searchTerm, e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Get regions with UAV count
     */
    public List<Map<String, Object>> getRegionsWithUAVCount() {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            List<Region> allRegions = regionRepository.findAll();
            
            for (Region region : allRegions) {
                Map<String, Object> regionData = new HashMap<>();
                regionData.put("id", region.getId());
                regionData.put("name", region.getRegionName());
                
                List<UAV> uavsInRegion = getUAVsByRegion(region.getId());
                regionData.put("uavCount", uavsInRegion.size());
                regionData.put("uavs", uavsInRegion);
                
                result.add(regionData);
            }
            
        } catch (Exception e) {
            logger.error("Error getting regions with UAV count: {}", e.getMessage());
        }
        return result;
    }

    /**
     * Create region with validation
     */
    @CacheEvict(value = "regions", allEntries = true)
    public Region createRegionWithValidation(String regionName) {
        if (!validateRegionName(regionName)) {
            throw new IllegalArgumentException("Invalid region name: " + regionName);
        }
        
        if (!isRegionNameUnique(regionName, null)) {
            throw new IllegalArgumentException("Region name already exists: " + regionName);
        }
        
        return createRegion(regionName);
    }

    /**
     * Bulk create regions
     */
    @CacheEvict(value = "regions", allEntries = true)
    @Transactional
    public List<Region> bulkCreateRegions(List<String> regionNames) {
        List<Region> createdRegions = new ArrayList<>();
        
        for (String regionName : regionNames) {
            try {
                if (validateRegionName(regionName) && isRegionNameUnique(regionName, null)) {
                    Region region = createRegion(regionName);
                    createdRegions.add(region);
                } else {
                    logger.warn("Skipping invalid or duplicate region name: {}", regionName);
                }
            } catch (Exception e) {
                logger.error("Error creating region {}: {}", regionName, e.getMessage());
            }
        }
        
        return createdRegions;
    }
}
