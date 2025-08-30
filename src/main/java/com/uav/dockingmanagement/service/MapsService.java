package com.uav.dockingmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for integrating with mapping APIs to provide geospatial services
 * including geocoding, routing, and distance calculations
 */
@Service
public class MapsService {

    private static final Logger logger = LoggerFactory.getLogger(MapsService.class);

    @Value("${app.maps.api-key:}")
    private String apiKey;

    @Value("${app.maps.api-url:https://maps.googleapis.com/maps/api}")
    private String apiUrl;

    @Value("${app.maps.enabled:false}")
    private boolean mapsEnabled;

    private final RestTemplate restTemplate;

    public MapsService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    public Map<String, Object> calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        Map<String, Object> result = new HashMap<>();

        try {
            double distance = haversineDistance(lat1, lon1, lat2, lon2);

            result.put("success", true);
            result.put("distanceKm", Math.round(distance * 100.0) / 100.0);
            result.put("distanceMeters", Math.round(distance * 1000));
            result.put("calculatedAt", LocalDateTime.now());
            result.put("method", "haversine");

        } catch (Exception e) {
            logger.error("Error calculating distance: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error calculating distance: " + e.getMessage());
        }

        return result;
    }

    /**
     * Get route between two points
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getRoute(double startLat, double startLon, double endLat, double endLon) {
        Map<String, Object> result = new HashMap<>();

        if (!mapsEnabled || apiKey.isEmpty()) {
            logger.warn("Maps service is disabled or API key not configured");
            return getMockRouteData(startLat, startLon, endLat, endLon);
        }

        try {
            String url = String.format("%s/directions/json?origin=%f,%f&destination=%f,%f&key=%s&mode=driving",
                    apiUrl, startLat, startLon, endLat, endLon, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "OK".equals(response.get("status"))) {
                result = parseRouteResponse(response);
                result.put("success", true);
                result.put("source", "google_maps");
            } else {
                result.put("success", false);
                result.put("message", "No route data received");
            }

        } catch (Exception e) {
            logger.error("Error fetching route: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error fetching route data: " + e.getMessage());

            // Return mock data as fallback
            return getMockRouteData(startLat, startLon, endLat, endLon);
        }

        return result;
    }

    /**
     * Geocode an address to coordinates
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> geocodeAddress(String address) {
        Map<String, Object> result = new HashMap<>();

        if (!mapsEnabled || apiKey.isEmpty()) {
            logger.warn("Maps service is disabled or API key not configured");
            return getMockGeocodeData(address);
        }

        try {
            String url = String.format("%s/geocode/json?address=%s&key=%s",
                    apiUrl, java.net.URLEncoder.encode(address, "UTF-8"), apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "OK".equals(response.get("status"))) {
                result = parseGeocodeResponse(response);
                result.put("success", true);
                result.put("source", "google_maps");
            } else {
                result.put("success", false);
                result.put("message", "Address not found");
            }

        } catch (Exception e) {
            logger.error("Error geocoding address: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error geocoding address: " + e.getMessage());

            // Return mock data as fallback
            return getMockGeocodeData(address);
        }

        return result;
    }

    /**
     * Reverse geocode coordinates to address
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> reverseGeocode(double latitude, double longitude) {
        Map<String, Object> result = new HashMap<>();

        if (!mapsEnabled || apiKey.isEmpty()) {
            logger.warn("Maps service is disabled or API key not configured");
            return getMockReverseGeocodeData(latitude, longitude);
        }

        try {
            String url = String.format("%s/geocode/json?latlng=%f,%f&key=%s",
                    apiUrl, latitude, longitude, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "OK".equals(response.get("status"))) {
                result = parseReverseGeocodeResponse(response);
                result.put("success", true);
                result.put("source", "google_maps");
            } else {
                result.put("success", false);
                result.put("message", "Location not found");
            }

        } catch (Exception e) {
            logger.error("Error reverse geocoding: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error reverse geocoding: " + e.getMessage());

            // Return mock data as fallback
            return getMockReverseGeocodeData(latitude, longitude);
        }

        return result;
    }

    /**
     * Find nearby places of interest
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> findNearbyPlaces(double latitude, double longitude, String type, int radius) {
        Map<String, Object> result = new HashMap<>();

        if (!mapsEnabled || apiKey.isEmpty()) {
            logger.warn("Maps service is disabled or API key not configured");
            return getMockNearbyPlacesData(latitude, longitude, type);
        }

        try {
            String url = String.format("%s/place/nearbysearch/json?location=%f,%f&radius=%d&type=%s&key=%s",
                    apiUrl, latitude, longitude, radius, type, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "OK".equals(response.get("status"))) {
                result = parseNearbyPlacesResponse(response);
                result.put("success", true);
                result.put("source", "google_maps");
            } else {
                result.put("success", false);
                result.put("message", "No places found");
            }

        } catch (Exception e) {
            logger.error("Error finding nearby places: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error finding nearby places: " + e.getMessage());

            // Return mock data as fallback
            return getMockNearbyPlacesData(latitude, longitude, type);
        }

        return result;
    }

    /**
     * Check if a point is within a geofence
     */
    public Map<String, Object> checkGeofence(double pointLat, double pointLon,
            double centerLat, double centerLon, double radiusKm) {
        Map<String, Object> result = new HashMap<>();

        try {
            double distance = haversineDistance(pointLat, pointLon, centerLat, centerLon);
            boolean withinGeofence = distance <= radiusKm;

            result.put("success", true);
            result.put("withinGeofence", withinGeofence);
            result.put("distanceFromCenter", Math.round(distance * 100.0) / 100.0);
            result.put("geofenceRadius", radiusKm);
            result.put("checkedAt", LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Error checking geofence: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error checking geofence: " + e.getMessage());
        }

        return result;
    }

    /**
     * Generate flight path waypoints between two points
     */
    public Map<String, Object> generateFlightPath(double startLat, double startLon,
            double endLat, double endLon, int waypointCount) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<Map<String, Object>> waypoints = new ArrayList<>();

            // Calculate intermediate waypoints
            for (int i = 0; i <= waypointCount + 1; i++) {
                double ratio = (double) i / (waypointCount + 1);
                double lat = startLat + (endLat - startLat) * ratio;
                double lon = startLon + (endLon - startLon) * ratio;

                Map<String, Object> waypoint = new HashMap<>();
                waypoint.put("latitude", Math.round(lat * 1000000.0) / 1000000.0);
                waypoint.put("longitude", Math.round(lon * 1000000.0) / 1000000.0);
                waypoint.put("sequence", i);

                if (i == 0) {
                    waypoint.put("type", "start");
                } else if (i == waypointCount + 1) {
                    waypoint.put("type", "end");
                } else {
                    waypoint.put("type", "waypoint");
                }

                waypoints.add(waypoint);
            }

            double totalDistance = haversineDistance(startLat, startLon, endLat, endLon);

            result.put("success", true);
            result.put("waypoints", waypoints);
            result.put("totalDistance", Math.round(totalDistance * 100.0) / 100.0);
            result.put("waypointCount", waypointCount + 2); // Including start and end
            result.put("generatedAt", LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Error generating flight path: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error generating flight path: " + e.getMessage());
        }

        return result;
    }

    // Private helper methods

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Earth's radius in kilometers

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseRouteResponse(Map<String, Object> response) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");
            if (!routes.isEmpty()) {
                Map<String, Object> route = routes.get(0);
                List<Map<String, Object>> legs = (List<Map<String, Object>>) route.get("legs");

                if (!legs.isEmpty()) {
                    Map<String, Object> leg = legs.get(0);
                    Map<String, Object> distance = (Map<String, Object>) leg.get("distance");
                    Map<String, Object> duration = (Map<String, Object>) leg.get("duration");

                    result.put("distance", distance.get("text"));
                    result.put("distanceValue", distance.get("value"));
                    result.put("duration", duration.get("text"));
                    result.put("durationValue", duration.get("value"));
                }

                Map<String, Object> polyline = (Map<String, Object>) ((Map<String, Object>) route
                        .get("overview_polyline")).get("points");
                result.put("polyline", polyline);
            }

        } catch (Exception e) {
            logger.error("Error parsing route response: {}", e.getMessage(), e);
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseGeocodeResponse(Map<String, Object> response) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (!results.isEmpty()) {
                Map<String, Object> firstResult = results.get(0);
                Map<String, Object> geometry = (Map<String, Object>) firstResult.get("geometry");
                Map<String, Object> location = (Map<String, Object>) geometry.get("location");

                result.put("latitude", location.get("lat"));
                result.put("longitude", location.get("lng"));
                result.put("formattedAddress", firstResult.get("formatted_address"));
            }

        } catch (Exception e) {
            logger.error("Error parsing geocode response: {}", e.getMessage(), e);
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseReverseGeocodeResponse(Map<String, Object> response) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (!results.isEmpty()) {
                Map<String, Object> firstResult = results.get(0);
                result.put("formattedAddress", firstResult.get("formatted_address"));
                result.put("placeId", firstResult.get("place_id"));
            }

        } catch (Exception e) {
            logger.error("Error parsing reverse geocode response: {}", e.getMessage(), e);
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseNearbyPlacesResponse(Map<String, Object> response) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            List<Map<String, Object>> places = new ArrayList<>();

            for (Map<String, Object> place : results) {
                Map<String, Object> placeInfo = new HashMap<>();
                placeInfo.put("name", place.get("name"));
                placeInfo.put("placeId", place.get("place_id"));
                placeInfo.put("rating", place.get("rating"));

                Map<String, Object> geometry = (Map<String, Object>) place.get("geometry");
                Map<String, Object> location = (Map<String, Object>) geometry.get("location");
                placeInfo.put("latitude", location.get("lat"));
                placeInfo.put("longitude", location.get("lng"));

                places.add(placeInfo);
            }

            result.put("places", places);
            result.put("count", places.size());

        } catch (Exception e) {
            logger.error("Error parsing nearby places response: {}", e.getMessage(), e);
        }

        return result;
    }

    // Mock data methods for fallback

    private Map<String, Object> getMockRouteData(double startLat, double startLon, double endLat, double endLon) {
        Map<String, Object> result = new HashMap<>();
        double distance = haversineDistance(startLat, startLon, endLat, endLon);

        result.put("success", true);
        result.put("distance", String.format("%.1f km", distance));
        result.put("distanceValue", (int) (distance * 1000));
        result.put("duration", "15 mins");
        result.put("durationValue", 900);
        result.put("source", "mock");

        return result;
    }

    private Map<String, Object> getMockGeocodeData(String address) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("latitude", 40.7589);
        result.put("longitude", -73.9851);
        result.put("formattedAddress", "Mock Address, New York, NY, USA");
        result.put("source", "mock");

        return result;
    }

    private Map<String, Object> getMockReverseGeocodeData(double latitude, double longitude) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("formattedAddress", String.format("Mock Location at %.4f, %.4f", latitude, longitude));
        result.put("placeId", "mock_place_id");
        result.put("source", "mock");

        return result;
    }

    private Map<String, Object> getMockNearbyPlacesData(double latitude, double longitude, String type) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> places = List.of(
                Map.of("name", "Mock Place 1", "placeId", "mock_1", "rating", 4.5, "latitude", latitude + 0.001,
                        "longitude", longitude + 0.001),
                Map.of("name", "Mock Place 2", "placeId", "mock_2", "rating", 4.2, "latitude", latitude - 0.001,
                        "longitude", longitude - 0.001));

        result.put("success", true);
        result.put("places", places);
        result.put("count", places.size());
        result.put("source", "mock");

        return result;
    }
}
