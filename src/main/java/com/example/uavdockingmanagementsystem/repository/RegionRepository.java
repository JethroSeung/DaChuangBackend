package com.example.uavdockingmanagementsystem.repository;
import com.example.uavdockingmanagementsystem.model.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegionRepository extends JpaRepository<Region, Integer> {
    
    /**
     * Find region by exact name
     */
    Optional<Region> findByRegionName(String regionName);
    
    /**
     * Find region by name (case insensitive)
     */
    Optional<Region> findByRegionNameIgnoreCase(String regionName);
    
    /**
     * Find regions containing the given text (case insensitive)
     */
    List<Region> findByRegionNameContainingIgnoreCase(String searchTerm);
}


