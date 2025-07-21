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
        // Debug log
        System.out.println("Adding UAV with model: " + uav.getModel());

        //休眠仓设置
        if (Boolean.TRUE.equals(inHibernatePod)) {
            if (hibernatePod.isFull()) {
                model.addAttribute("message", "休眠仓已满，无法加入！");
                return "index";
            }
            hibernatePod.addUAV(uav);
            uav.setInHibernatePod(true);
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
        System.out.println("UAV saved with ID: " + savedUAV.getId());
        return "redirect:/";
    }

    // Delete UAV by ID
    @GetMapping("/delete/{id}")
    public String deleteUAV(@PathVariable int id) {
        uavRepository.deleteById(id);
        return "redirect:/";
    }
    
    // Update UAV status
    @GetMapping("/update-status/{id}")
    public String updateUAVStatus(@PathVariable int id) {
        UAV uav = uavRepository.findById(id).orElseThrow();
        // Toggle status between AUTHORIZED and UNAUTHORIZED
        if (uav.getStatus() == UAV.Status.AUTHORIZED) {
            uav.setStatus(UAV.Status.UNAUTHORIZED);
        } else {
            uav.setStatus(UAV.Status.AUTHORIZED);
        }
        // The updatedAt field will be automatically updated via @PreUpdate
        uavRepository.save(uav);
        return "redirect:/";
    }
}



