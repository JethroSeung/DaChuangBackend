package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for weather-related operations
 */
@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    private static final Logger logger = LoggerFactory.getLogger(WeatherController.class);

    @Autowired
    private WeatherService weatherService;

    /**
     * Get current weather for a location
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentWeather(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        logger.info("Getting current weather for location: {}, {}", latitude, longitude);

        Map<String, Object> weather = weatherService.getCurrentWeather(latitude, longitude);

        if ((Boolean) weather.get("success")) {
            return ResponseEntity.ok(weather);
        } else {
            return ResponseEntity.badRequest().body(weather);
        }
    }

    /**
     * Get weather forecast for a location
     */
    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getWeatherForecast(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "3") int days) {

        logger.info("Getting weather forecast for location: {}, {} for {} days", latitude, longitude, days);

        Map<String, Object> forecast = weatherService.getWeatherForecast(latitude, longitude, days);

        if ((Boolean) forecast.get("success")) {
            return ResponseEntity.ok(forecast);
        } else {
            return ResponseEntity.badRequest().body(forecast);
        }
    }

    /**
     * Check flight conditions for a location
     */
    @GetMapping("/flight-conditions")
    public ResponseEntity<Map<String, Object>> checkFlightConditions(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        logger.info("Checking flight conditions for location: {}, {}", latitude, longitude);

        Map<String, Object> conditions = weatherService.checkFlightConditions(latitude, longitude);

        if ((Boolean) conditions.get("success")) {
            return ResponseEntity.ok(conditions);
        } else {
            return ResponseEntity.badRequest().body(conditions);
        }
    }

    /**
     * Get weather alerts for a location
     */
    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getWeatherAlerts(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        logger.info("Getting weather alerts for location: {}, {}", latitude, longitude);

        Map<String, Object> alerts = weatherService.getWeatherAlerts(latitude, longitude);

        if ((Boolean) alerts.get("success")) {
            return ResponseEntity.ok(alerts);
        } else {
            return ResponseEntity.badRequest().body(alerts);
        }
    }

    /**
     * Get weather information for multiple locations
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> getBatchWeather(
            @RequestBody Map<String, Object> request) {

        try {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> locations = (java.util.List<Map<String, Object>>) request
                    .get("locations");

            java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();

            for (Map<String, Object> location : locations) {
                double lat = ((Number) location.get("latitude")).doubleValue();
                double lon = ((Number) location.get("longitude")).doubleValue();
                String name = (String) location.getOrDefault("name", "Unknown");

                Map<String, Object> weather = weatherService.getCurrentWeather(lat, lon);
                weather.put("locationName", name);
                weather.put("latitude", lat);
                weather.put("longitude", lon);

                results.add(weather);
            }

            Map<String, Object> response = Map.of(
                    "success", true,
                    "results", results,
                    "count", results.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing batch weather request: {}", e.getMessage(), e);
            Map<String, Object> error = Map.of(
                    "success", false,
                    "message", "Error processing batch weather request: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get weather service status and configuration
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getWeatherServiceStatus() {
        Map<String, Object> status = Map.of(
                "service", "WeatherService",
                "status", "operational",
                "features", java.util.List.of(
                        "current weather",
                        "weather forecast",
                        "flight conditions check",
                        "weather alerts",
                        "batch weather requests"),
                "supportedParameters", Map.of(
                        "latitude", "Latitude coordinate (-90 to 90)",
                        "longitude", "Longitude coordinate (-180 to 180)",
                        "days", "Number of forecast days (1-5)"));

        return ResponseEntity.ok(status);
    }
}
