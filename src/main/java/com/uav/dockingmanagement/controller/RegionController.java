package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.repository.RegionRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.service.RegionService;
import com.uav.dockingmanagement.service.UAVService;
import jakarta.annotation.PostConstruct;
import com.uav.dockingmanagement.model.UAV;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@Controller
public class RegionController {

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private RegionService regionService;

    @Autowired
    private UAVService uavService;

    @PostConstruct
    public void init() {
        try {
            // Initialize sample regions if needed
            regionService.initializeSampleRegions();

            // Check if regions exist, if not add some sample regions
            if (regionRepository.count() == 0) {
                System.out.println("No regions found in database. Adding sample regions...");
                regionRepository.save(new Region("North"));
                regionRepository.save(new Region("South"));
                regionRepository.save(new Region("East"));
                regionRepository.save(new Region("West"));
                System.out.println("Sample regions added.");
            } else {
                System.out.println("Regions already exist in database: " + regionRepository.count());
                List<Region> regions = regionRepository.findAll();
                for (Region region : regions) {
                    System.out.println("Region: " + region.getRegionName() + " (ID: " + region.getId() + ")");
                }
            }
        } catch (Exception e) {
            // This can happen during tests or when database tables don't exist yet
            System.out.println(
                    "Could not initialize regions from database: " + e.getMessage() + ". This is normal during tests.");
        }
    }

    @GetMapping("/")
    public String index(Model model) {
        List<Region> regions = regionRepository.findAll();
        System.out.println("Regions found: " + regions.size());

        model.addAttribute("uavs", uavRepository.findAllWithRegions());
        model.addAttribute("allRegions", regions);
        return "index";
    }

    @GetMapping("/uav/{uavId}/add-region")
    public String showAddRegionForm(@PathVariable int uavId, Model model) {
        // Get available regions (not already assigned to this UAV)
        List<Region> availableRegions = uavService.getUnassignedRegionsForUAV(uavId);
        model.addAttribute("availableRegions", availableRegions);
        model.addAttribute("uavId", uavId);
        return "add-region";
    }

    @PostMapping("/uav/{uavId}/add-region")
    public String addRegionToUAV(@PathVariable int uavId, @RequestParam int regionId) {
        UAV uav = uavRepository.findById(uavId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid UAV ID: " + uavId));

        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Region ID: " + regionId));

        uav.getRegions().add(region);
        uavRepository.save(uav);

        return "redirect:/";
    }

    @GetMapping("/uav/{uavId}/remove-region")
    public String showRemoveRegionForm(@PathVariable int uavId, Model model) {
        // Get regions assigned to this UAV
        UAV uav = uavRepository.findById(uavId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid UAV ID: " + uavId));

        // Get assigned regions for this UAV
        List<Region> assignedRegions = new ArrayList<>(uav.getRegions());

        model.addAttribute("assignedRegions", assignedRegions);
        model.addAttribute("uavId", uavId);
        return "remove-region";
    }

    @PostMapping("/uav/{uavId}/remove-region")
    public String removeRegionFromUAV(@PathVariable int uavId, @RequestParam int regionId) {
        return getString(uavId, regionId);
    }

    // REST endpoint for direct removal without form
    @GetMapping("/uav/{uavId}/remove-region/{regionId}")
    public String quickRemoveRegion(@PathVariable int uavId, @PathVariable int regionId) {
        return getString(uavId, regionId);
    }

    private String getString(@PathVariable int uavId, @PathVariable int regionId) {
        UAV uav = uavRepository.findById(uavId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid UAV ID: " + uavId));

        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Region ID: " + regionId));

        uav.getRegions().remove(region);
        uavRepository.save(uav);

        return "redirect:/";
    }
}
