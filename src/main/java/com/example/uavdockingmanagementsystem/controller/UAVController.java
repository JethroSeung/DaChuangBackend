package com.example.uavdockingmanagementsystem.controller;
import com.example.uavdockingmanagementsystem.model.HibernatePod;
import com.example.uavdockingmanagementsystem.model.Region;
import com.example.uavdockingmanagementsystem.model.UAV;
import com.example.uavdockingmanagementsystem.repository.RegionRepository;
import com.example.uavdockingmanagementsystem.repository.UAVRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@Controller
@RequestMapping("/uav")
public class UAVController {

    @Autowired
    private UAVRepository uavRepository;
    
    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private HibernatePod hibernatePod;
    // Show all UAVs
    @GetMapping("/")
    public String getAllUAVs(Model model) {
        model.addAttribute("uavs", uavRepository.findAllWithRegions());
        model.addAttribute("allRegions", regionRepository.findAll());
        model.addAttribute("hibernatePodFull", hibernatePod.isFull());
        return "index";
    }

    // Add a new UAV
    @PostMapping("/add")
    public String addUAV(@ModelAttribute UAV uav, @RequestParam(name = "regionIds", required = false) Integer[] regionIds,
                         @RequestParam(name = "inHibernatePod", required = false) Boolean inHibernatePod, Model model) {
        try {
            System.out.println("Adding UAV with RFID: " + uav.getRfidTag() + ", Model: " + uav.getModel());

            // Validate UAV data
            if (uav.getRfidTag() == null || uav.getRfidTag().trim().isEmpty()) {
                model.addAttribute("message", "RFID tag is required");
                model.addAttribute("uavs", uavRepository.findAllWithRegions());
                model.addAttribute("allRegions", regionRepository.findAll());
                model.addAttribute("hibernatePodFull", hibernatePod.isFull());
                return "index";
            }

            // Check RFID uniqueness
            if (uavRepository.findByRfidTag(uav.getRfidTag()).isPresent()) {
                model.addAttribute("message", "RFID tag already exists: " + uav.getRfidTag());
                model.addAttribute("uavs", uavRepository.findAllWithRegions());
                model.addAttribute("allRegions", regionRepository.findAll());
                model.addAttribute("hibernatePodFull", hibernatePod.isFull());
                return "index";
            }

            // Hibernate pod setup
            if (Boolean.TRUE.equals(inHibernatePod)) {
                if (hibernatePod.isFull()) {
                    model.addAttribute("message", "Hibernate pod is full, cannot add UAV!");
                    model.addAttribute("uavs", uavRepository.findAllWithRegions());
                    model.addAttribute("allRegions", regionRepository.findAll());
                    model.addAttribute("hibernatePodFull", hibernatePod.isFull());
                    return "index";
                }
                hibernatePod.addUAV(uav);
                uav.setInHibernatePod(true);
                System.out.println("UAV added to hibernate pod");
            } else {
                uav.setInHibernatePod(false);
            }

            // Set regions if any were selected
            if (regionIds != null && regionIds.length > 0) {
                Set<Region> selectedRegions = new HashSet<>();
                for (Integer regionId : regionIds) {
                    regionRepository.findById(regionId).ifPresent(region -> {
                        selectedRegions.add(region);
                        System.out.println("Added region: " + region.getRegionName() + " (ID: " + region.getId() + ")");
                    });
                }
                uav.setRegions(selectedRegions);
                System.out.println("UAV assigned " + selectedRegions.size() + " regions");
            } else {
                System.out.println("No regions selected for UAV");
            }

            UAV savedUAV = uavRepository.save(uav);
            System.out.println("UAV saved successfully with ID: " + savedUAV.getId());
            model.addAttribute("message", "UAV added successfully: " + savedUAV.getRfidTag());

        } catch (Exception e) {
            System.err.println("Error adding UAV: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("message", "Error adding UAV: " + e.getMessage());
            model.addAttribute("uavs", uavRepository.findAllWithRegions());
            model.addAttribute("allRegions", regionRepository.findAll());
            model.addAttribute("hibernatePodFull", hibernatePod.isFull());
            return "index";
        }

        return "redirect:/uav/";
    }

    // Delete UAV by ID
    @GetMapping("/delete/{id}")
    public String deleteUAV(@PathVariable int id, Model model) {
        try {
            UAV uav = uavRepository.findById(id).orElse(null);
            if (uav == null) {
                model.addAttribute("message", "UAV not found with ID: " + id);
                return "redirect:/uav/";
            }

            // Remove from hibernate pod if present
            if (uav.isInHibernatePod()) {
                hibernatePod.removeUAV(uav);
                System.out.println("Removed UAV from hibernate pod before deletion");
            }

            uavRepository.deleteById(id);
            System.out.println("UAV deleted successfully with ID: " + id);
            model.addAttribute("message", "UAV deleted successfully: " + uav.getRfidTag());

        } catch (Exception e) {
            System.err.println("Error deleting UAV with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("message", "Error deleting UAV: " + e.getMessage());
        }

        return "redirect:/uav/";
    }

    // Update UAV status
    @GetMapping("/update-status/{id}")
    public String updateUAVStatus(@PathVariable int id, Model model) {
        try {
            UAV uav = uavRepository.findById(id).orElse(null);
            if (uav == null) {
                model.addAttribute("message", "UAV not found with ID: " + id);
                return "redirect:/uav/";
            }

            UAV.Status oldStatus = uav.getStatus();

            // Toggle status between AUTHORIZED and UNAUTHORIZED
            if (uav.getStatus() == UAV.Status.AUTHORIZED) {
                uav.setStatus(UAV.Status.UNAUTHORIZED);
            } else {
                uav.setStatus(UAV.Status.AUTHORIZED);
            }

            // The updatedAt field will be automatically updated via @PreUpdate
            uavRepository.save(uav);

            System.out.println("UAV status updated from " + oldStatus + " to " + uav.getStatus() +
                             " for UAV: " + uav.getRfidTag());
            model.addAttribute("message", "UAV status updated: " + uav.getRfidTag() +
                             " is now " + uav.getStatus());

        } catch (Exception e) {
            System.err.println("Error updating UAV status for ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("message", "Error updating UAV status: " + e.getMessage());
        }

        return "redirect:/uav/";
    }
}



