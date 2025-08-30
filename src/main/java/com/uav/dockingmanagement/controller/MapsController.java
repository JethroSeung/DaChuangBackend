package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.service.MapsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for mapping and geospatial operations
 */
@RestController
@RequestMapping("/api/maps")
@CrossOrigin(origins = "*")
public class MapsController {

    private static final Logger logger = LoggerFactory.getLogger(MapsController.class);

    @Autowired
    private MapsService mapsService;

    /**
     * Calculate distance between two points
     */
    @GetMapping("/distance")
    public ResponseEntity<Map<String, Object>> calculateDistance(
            @RequestParam double lat1,
            @RequestParam double lon1,
            @RequestParam double lat2,
            @RequestParam double lon2) {

        logger.info("Calculating distance between ({}, {}) and ({}, {})", lat1, lon1, lat2, lon2);

        Map<String, Object> result = mapsService.calculateDistance(lat1, lon1, lat2, lon2);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Get route between two points
     */
    @GetMapping("/route")
    public ResponseEntity<Map<String, Object>> getRoute(
            @RequestParam double startLat,
            @RequestParam double startLon,
            @RequestParam double endLat,
            @RequestParam double endLon) {

        logger.info("Getting route from ({}, {}) to ({}, {})", startLat, startLon, endLat, endLon);

        Map<String, Object> route = mapsService.getRoute(startLat, startLon, endLat, endLon);

        if ((Boolean) route.get("success")) {
            return ResponseEntity.ok(route);
        } else {
            return ResponseEntity.badRequest().body(route);
        }
    }

    /**
     * Geocode an address to coordinates
     */
    @GetMapping("/geocode")
    public ResponseEntity<Map<String, Object>> geocodeAddress(@RequestParam String address) {
        logger.info("Geocoding address: {}", address);

        Map<String, Object> result = mapsService.geocodeAddress(address);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Reverse geocode coordinates to address
     */
    @GetMapping("/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        logger.info("Reverse geocoding coordinates: {}, {}", latitude, longitude);

        Map<String, Object> result = mapsService.reverseGeocode(latitude, longitude);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Find nearby places of interest
     */
    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> findNearbyPlaces(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "point_of_interest") String type,
            @RequestParam(defaultValue = "1000") int radius) {

        logger.info("Finding nearby places of type '{}' within {}m of ({}, {})", type, radius, latitude, longitude);

        Map<String, Object> result = mapsService.findNearbyPlaces(latitude, longitude, type, radius);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Check if a point is within a geofence
     */
    @GetMapping("/geofence/check")
    public ResponseEntity<Map<String, Object>> checkGeofence(
            @RequestParam double pointLat,
            @RequestParam double pointLon,
            @RequestParam double centerLat,
            @RequestParam double centerLon,
            @RequestParam double radiusKm) {

        logger.info("Checking if point ({}, {}) is within {}km of ({}, {})",
                pointLat, pointLon, radiusKm, centerLat, centerLon);

        Map<String, Object> result = mapsService.checkGeofence(pointLat, pointLon, centerLat, centerLon, radiusKm);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Generate flight path waypoints
     */
    @GetMapping("/flight-path")
    public ResponseEntity<Map<String, Object>> generateFlightPath(
            @RequestParam double startLat,
            @RequestParam double startLon,
            @RequestParam double endLat,
            @RequestParam double endLon,
            @RequestParam(defaultValue = "3") int waypointCount) {

        logger.info("Generating flight path from ({}, {}) to ({}, {}) with {} waypoints",
                startLat, startLon, endLat, endLon, waypointCount);

        Map<String, Object> result = mapsService.generateFlightPath(startLat, startLon, endLat, endLon, waypointCount);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Batch geocoding for multiple addresses
     */
    @PostMapping("/geocode/batch")
    public ResponseEntity<Map<String, Object>> batchGeocode(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<String> addresses = (java.util.List<String>) request.get("addresses");

            java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();

            for (String address : addresses) {
                Map<String, Object> geocodeResult = mapsService.geocodeAddress(address);
                geocodeResult.put("originalAddress", address);
                results.add(geocodeResult);
            }

            Map<String, Object> response = Map.of(
                    "success", true,
                    "results", results,
                    "count", results.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing batch geocode request: {}", e.getMessage(), e);
            Map<String, Object> error = Map.of(
                    "success", false,
                    "message", "Error processing batch geocode request: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Calculate multiple distances in a batch
     */
    @PostMapping("/distance/batch")
    public ResponseEntity<Map<String, Object>> batchDistance(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> pairs = (java.util.List<Map<String, Object>>) request
                    .get("coordinatePairs");

            java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();

            for (Map<String, Object> pair : pairs) {
                double lat1 = ((Number) pair.get("lat1")).doubleValue();
                double lon1 = ((Number) pair.get("lon1")).doubleValue();
                double lat2 = ((Number) pair.get("lat2")).doubleValue();
                double lon2 = ((Number) pair.get("lon2")).doubleValue();

                Map<String, Object> distanceResult = mapsService.calculateDistance(lat1, lon1, lat2, lon2);
                distanceResult.put("coordinates", pair);
                results.add(distanceResult);
            }

            Map<String, Object> response = Map.of(
                    "success", true,
                    "results", results,
                    "count", results.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing batch distance request: {}", e.getMessage(), e);
            Map<String, Object> error = Map.of(
                    "success", false,
                    "message", "Error processing batch distance request: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get maps service status and configuration
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMapsServiceStatus() {
        Map<String, Object> status = Map.of(
                "service", "MapsService",
                "status", "operational",
                "features", java.util.List.of(
                        "distance calculation",
                        "routing",
                        "geocoding",
                        "reverse geocoding",
                        "nearby places search",
                        "geofence checking",
                        "flight path generation",
                        "batch operations"),
                "supportedParameters", Map.of(
                        "latitude", "Latitude coordinate (-90 to 90)",
                        "longitude", "Longitude coordinate (-180 to 180)",
                        "radius", "Search radius in meters",
                        "type", "Place type for nearby search",
                        "waypointCount", "Number of waypoints for flight path"));

        return ResponseEntity.ok(status);
    }
}
