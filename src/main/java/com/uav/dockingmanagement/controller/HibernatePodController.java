package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.model.HibernatePod;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.UAVRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/hibernate-pod")
@CrossOrigin(origins = "*")
public class HibernatePodController {

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private HibernatePod hibernatePod;

    /**
     * Add UAV to hibernate pod
     */
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addUAVToHibernatePod(@RequestParam int uavId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<UAV> uavOpt = uavRepository.findById(uavId);
            if (uavOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "UAV not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            UAV uav = uavOpt.get();

            if (uav.isInHibernatePod()) {
                response.put("success", false);
                response.put("message", "UAV is already in hibernate pod");
                return ResponseEntity.badRequest().body(response);
            }

            if (hibernatePod.isFull()) {
                response.put("success", false);
                response.put("message", "Hibernate pod is full");
                response.put("currentCapacity", hibernatePod.getCurrentCapacity());
                response.put("maxCapacity", hibernatePod.getMaxCapacity());
                return ResponseEntity.badRequest().body(response);
            }

            hibernatePod.addUAV(uav);
            uavRepository.save(uav);

            response.put("success", true);
            response.put("message", "UAV successfully added to hibernate pod");
            response.put("uavId", uav.getId());
            response.put("currentCapacity", hibernatePod.getCurrentCapacity());
            response.put("maxCapacity", hibernatePod.getMaxCapacity());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error adding UAV to hibernate pod: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Remove UAV from hibernate pod
     */
    @PostMapping("/remove")
    public ResponseEntity<Map<String, Object>> removeUAVFromHibernatePod(@RequestParam int uavId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<UAV> uavOpt = uavRepository.findById(uavId);
            if (uavOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "UAV not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            UAV uav = uavOpt.get();

            if (!uav.isInHibernatePod()) {
                response.put("success", false);
                response.put("message", "UAV is not in hibernate pod");
                return ResponseEntity.badRequest().body(response);
            }

            hibernatePod.removeUAV(uav);
            uavRepository.save(uav);

            response.put("success", true);
            response.put("message", "UAV successfully removed from hibernate pod");
            response.put("uavId", uav.getId());
            response.put("currentCapacity", hibernatePod.getCurrentCapacity());
            response.put("maxCapacity", hibernatePod.getMaxCapacity());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error removing UAV from hibernate pod: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get hibernate pod status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getHibernatePodStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            status.put("currentCapacity", hibernatePod.getCurrentCapacity());
            status.put("maxCapacity", hibernatePod.getMaxCapacity());
            status.put("isFull", hibernatePod.isFull());
            status.put("availableCapacity", hibernatePod.getAvailableCapacity());
            status.put("uavIds", hibernatePod.getUAVs().stream().map(UAV::getId).toList());

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            status.put("error", "Error retrieving hibernate pod status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(status);
        }
    }

    /**
     * Get all UAVs in hibernate pod
     */
    @GetMapping("/uavs")
    public ResponseEntity<Map<String, Object>> getUAVsInHibernatePod() {
        Map<String, Object> response = new HashMap<>();

        try {
            response.put("success", true);
            response.put("uavs", hibernatePod.getUAVs());
            response.put("count", hibernatePod.getCurrentCapacity());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving UAVs in hibernate pod: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
