package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.service.UAVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
     * @param rfidId     The RFID tag of the UAV
     * @param regionName The name of the region requesting access
     * @return "OPEN THE DOOR" if access is granted, error message otherwise
     */
    @PostMapping(value = "/validate")
    public ResponseEntity<String> validateAccess(
            @RequestParam(value = "rfidId", required = false) String rfidId,
            @RequestParam(value = "regionName", required = false) String regionName) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);

        // Validate required parameters
        if (rfidId == null) {
            return ResponseEntity.badRequest()
                    .headers(headers)
                    .body("Missing required parameter: rfidId");
        }
        if (regionName == null) {
            return ResponseEntity.badRequest()
                    .headers(headers)
                    .body("Missing required parameter: regionName");
        }

        try {
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
            System.out.println("VALIDATION RESULT: " + result);
            System.out.println("==================================================\n");

            // Log that we're sending the response back to ESP32
            System.out.println("📤 SENDING RESPONSE TO ESP32: " + result);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(result);

        } catch (Exception e) {
            System.err.println("Error in access validation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .headers(headers)
                    .body("Internal server error");
        }
    }
}
