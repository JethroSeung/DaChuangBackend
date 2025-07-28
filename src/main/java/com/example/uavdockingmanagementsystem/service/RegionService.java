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
}
