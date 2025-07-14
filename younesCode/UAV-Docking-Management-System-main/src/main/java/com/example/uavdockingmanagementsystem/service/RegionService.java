package com.example.uavdockingmanagementsystem.service;

import com.example.uavdockingmanagementsystem.model.Region;
import com.example.uavdockingmanagementsystem.model.UAV;
import com.example.uavdockingmanagementsystem.repository.RegionRepository;
import com.example.uavdockingmanagementsystem.repository.UAVRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RegionService {

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private UAVRepository uavRepository;

    /**
     * Get all regions
     */
    public List<Region> getAllRegions() {
        List<Region> regions = regionRepository.findAll();
        System.out.println("Retrieved " + regions.size() + " regions from database");
        return regions;
    }

    /**
     * Get region by ID
     */
    public Optional<Region> getRegionById(int id) {
        Optional<Region> region = regionRepository.findById(id);
        if (region.isPresent()) {
            System.out.println("Found region: " + region.get().getRegionName() + " (ID: " + id + ")");
        } else {
            System.out.println("Region with ID " + id + " not found");
        }
        return region;
    }

    /**
     * Create a new region
     */
    public Region createRegion(String regionName) {
        Region region = new Region(regionName);
        Region savedRegion = regionRepository.save(region);
        System.out.println("Created new region: " + savedRegion.getRegionName() + " (ID: " + savedRegion.getId() + ")");
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
            System.out.println("Updated region " + id + " from '" + oldName + "' to '" + regionName + "'");
            return updatedRegion;
        }
        System.out.println("Failed to update region " + id + ": region not found");
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
            System.out.println("Deleted region with ID: " + id);
        } else {
            System.out.println("Failed to delete region " + id + ": region not found");
        }
    }

    /**
     * Get all UAVs that are assigned to a specific region
     */
    public List<UAV> getUAVsByRegion(int regionId) {
        try {
            List<UAV> uavs = uavRepository.findByRegionId(regionId);
            System.out.println("Found " + uavs.size() + " UAVs for region ID " + regionId);
            return uavs;
        } catch (Exception e) {
            System.out.println("Error finding UAVs for region " + regionId + ": " + e.getMessage());
            // Fallback to filtering method
            List<UAV> allUAVs = uavRepository.findAllWithRegions();
            List<UAV> filteredUAVs = allUAVs.stream()
                    .filter(uav -> uav.getRegions().stream()
                            .anyMatch(region -> region.getId() == regionId))
                    .toList();
            System.out.println("Found " + filteredUAVs.size() + " UAVs for region ID " + regionId + " (using fallback method)");
            return filteredUAVs;
        }
    }

    /**
     * Initialize sample regions if none exist
     */
    @Transactional
    public void initializeSampleRegions() {
        long count = regionRepository.count();
        System.out.println("Current region count in database: " + count);

        if (count == 0) {
            System.out.println("Initializing sample regions...");
            Region north = createRegion("North");
            Region south = createRegion("South");
            Region east = createRegion("East");
            Region west = createRegion("West");
            System.out.println("Sample regions created: North(ID:" + north.getId() + "), South(ID:" + south.getId() +
                    "), East(ID:" + east.getId() + "), West(ID:" + west.getId() + ")");
        } else {
            System.out.println("Sample regions already exist. Skipping initialization.");
        }
    }
}
