package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.service.UAVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/access")
public class AccessControlAPI {

    @Autowired
    private UAVService uavService;
    
    /**
     * API endpoint to validate UAV access to a region
     * 
     * @param rfidId The RFID tag of the UAV
     * @param regionName The name of the region requesting access
     * @return "OPEN THE DOOR" if access is granted, error message otherwise
     */
    @PostMapping("/validate")
    public String validateAccess(
            @RequestParam("rfidId") String rfidId,
            @RequestParam("regionName") String regionName) {
        
        // Log the request with distinctive markers for easy visibility in terminal
        System.out.println("\n==================================================");
        System.out.println("▶️ REQUEST RECEIVED AT: " + java.time.LocalDateTime.now());
        System.out.println("▶️ REQUEST PARAMETERS:");
        System.out.println("   RFID ID: " + rfidId);
        System.out.println("   REGION NAME: " + regionName);
        System.out.println("==================================================\n");
        
        // Perform validation
        String result = uavService.checkUAVRegionAccess(rfidId, regionName);
        
        // Log the result
        System.out.println("\n==================================================");
        System.out.println("�?VALIDATION RESULT: " + result);
        System.out.println("==================================================\n");
        
        // Log that we're sending the response back to ESP32
        System.out.println("📤 SENDING RESPONSE TO ESP32: " + result);
        
        return result;
    }
}
