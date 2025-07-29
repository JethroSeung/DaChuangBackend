package com.example.uavdockingmanagementsystem;

import com.example.uavdockingmanagementsystem.config.TestRateLimitingConfig;
import com.example.uavdockingmanagementsystem.model.*;
import com.example.uavdockingmanagementsystem.repository.*;
import com.example.uavdockingmanagementsystem.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive test suite for map positioning functionality
 * Tests API endpoints, services, and data models for location tracking
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Import(TestRateLimitingConfig.class)
@Transactional
public class MapFunctionalityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private LocationService locationService;

    @Autowired
    private DockingStationService dockingStationService;

    @Autowired
    private GeofenceService geofenceService;

    private UAV testUAV;
    private DockingStation testStation;
    private Geofence testGeofence;

    @BeforeEach
    void setUp() {
        // Create test UAV with location
        testUAV = new UAV();
        testUAV.setRfidTag("TEST-UAV-001");
        testUAV.setOwnerName("Test Owner");
        testUAV.setModel("Test Model");
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        testUAV.setOperationalStatus(UAV.OperationalStatus.READY);
        testUAV.setCurrentLatitude(40.7128);
        testUAV.setCurrentLongitude(-74.0060);
        testUAV.setCurrentAltitudeMeters(50.0);
        testUAV.setLastLocationUpdate(LocalDateTime.now());
        testUAV = uavRepository.save(testUAV);

        // Create test docking station
        testStation = new DockingStation("Test Station", 40.7589, -73.9851, 5);
        testStation.setDescription("Test docking station");
        testStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        testStation.setStationType(DockingStation.StationType.STANDARD);
        testStation.setChargingAvailable(true);
        testStation = dockingStationRepository.save(testStation);

        // Create test geofence
        testGeofence = Geofence.createCircularFence(
            "Test Geofence", 40.7128, -74.0060, 1000.0, Geofence.BoundaryType.INCLUSION);
        testGeofence.setDescription("Test circular geofence");
        testGeofence.setPriorityLevel(2);
        testGeofence.setViolationAction("ALERT");
        testGeofence = geofenceRepository.save(testGeofence);
    }

    // Location API Tests
    @Test
    void testUpdateUAVLocation() throws Exception {
        Map<String, Object> locationData = new HashMap<>();
        locationData.put("latitude", 40.7200);
        locationData.put("longitude", -74.0100);
        locationData.put("altitude", 75.0);
        locationData.put("speed", 25.5);
        locationData.put("heading", 180.0);
        locationData.put("batteryLevel", 85);

        mockMvc.perform(post("/api/location/update/" + testUAV.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Location updated successfully"));

        // Verify UAV location was updated
        UAV updatedUAV = uavRepository.findById(testUAV.getId()).orElseThrow();
        assertEquals(40.7200, updatedUAV.getCurrentLatitude(), 0.0001);
        assertEquals(-74.0100, updatedUAV.getCurrentLongitude(), 0.0001);
        assertEquals(75.0, updatedUAV.getCurrentAltitudeMeters(), 0.1);
    }

    @Test
    void testGetCurrentLocations() throws Exception {
        mockMvc.perform(get("/api/location/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].uavId").value(testUAV.getId()))
                .andExpect(jsonPath("$[0].latitude").value(40.7128))
                .andExpect(jsonPath("$[0].longitude").value(-74.0060));
    }

    @Test
    void testGetLocationHistory() throws Exception {
        // Create some location history
        LocationHistory history1 = new LocationHistory(testUAV, 40.7128, -74.0060, 50.0);
        history1.setSpeedKmh(20.0);
        history1.setBatteryLevel(90);
        locationHistoryRepository.save(history1);

        LocationHistory history2 = new LocationHistory(testUAV, 40.7130, -74.0062, 55.0);
        history2.setSpeedKmh(25.0);
        history2.setBatteryLevel(88);
        locationHistoryRepository.save(history2);

        mockMvc.perform(get("/api/location/history/" + testUAV.getId())
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // Docking Station API Tests
    @Test
    void testCreateDockingStation() throws Exception {
        DockingStation newStation = new DockingStation("New Test Station", 40.7500, -73.9800, 3);
        newStation.setDescription("New test station");
        newStation.setChargingAvailable(true);
        newStation.setMaintenanceAvailable(false);

        mockMvc.perform(post("/api/docking-stations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newStation)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.station.name").value("New Test Station"));
    }

    @Test
    void testGetNearestStations() throws Exception {
        mockMvc.perform(get("/api/docking-stations/nearest")
                .param("latitude", "40.7128")
                .param("longitude", "-74.0060")
                .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThan(0)));
    }

    @Test
    void testGetStationsInArea() throws Exception {
        mockMvc.perform(get("/api/docking-stations/area")
                .param("minLatitude", "40.7000")
                .param("maxLatitude", "40.8000")
                .param("minLongitude", "-74.1000")
                .param("maxLongitude", "-73.9000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // Geofence API Tests
    @Test
    void testCreateCircularGeofence() throws Exception {
        Map<String, Object> geofenceData = new HashMap<>();
        geofenceData.put("name", "New Test Geofence");
        geofenceData.put("centerLatitude", 40.7200);
        geofenceData.put("centerLongitude", -74.0100);
        geofenceData.put("radiusMeters", 500.0);
        geofenceData.put("boundaryType", "EXCLUSION");
        geofenceData.put("description", "Test exclusion zone");
        geofenceData.put("priorityLevel", 3);

        mockMvc.perform(post("/api/geofences/circular")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(geofenceData)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.geofence.name").value("New Test Geofence"));
    }

    @Test
    void testCheckPointAgainstGeofences() throws Exception {
        mockMvc.perform(get("/api/geofences/check-point")
                .param("latitude", "40.7128")
                .param("longitude", "-74.0060")
                .param("altitude", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.latitude").value(40.7128))
                .andExpect(jsonPath("$.longitude").value(-74.0060));
    }

    // Service Layer Tests
    @Test
    void testLocationServiceGeofenceCheck() {
        // Test point inside inclusion geofence (should not violate)
        locationService.checkGeofenceViolations(testUAV, 40.7128, -74.0060, 50.0);
        
        // Test point outside inclusion geofence (should violate)
        locationService.checkGeofenceViolations(testUAV, 40.7200, -74.0200, 50.0);
        
        // Verify geofence violation was recorded
        Geofence updatedGeofence = geofenceRepository.findById(testGeofence.getId()).orElseThrow();
        assertTrue(updatedGeofence.getTotalViolations() > 0);
    }

    @Test
    void testDockingStationService() {
        // Test finding optimal station
        var optimalStation = dockingStationService.findOptimalStation(40.7128, -74.0060, "CHARGING");
        assertTrue(optimalStation.isPresent());
        
        // Test docking UAV
        Map<String, Object> dockingResult = dockingStationService.dockUAV(
            testUAV.getId(), testStation.getId(), "CHARGING");
        assertTrue((Boolean) dockingResult.get("success"));
        
        // Verify station occupancy increased
        DockingStation updatedStation = dockingStationRepository.findById(testStation.getId()).orElseThrow();
        assertEquals(1, updatedStation.getCurrentOccupancy());
    }

    @Test
    void testGeofenceService() {
        // Test point checking
        Map<String, Object> result = geofenceService.checkPointAgainstGeofences(40.7128, -74.0060, 50.0);
        assertTrue((Boolean) result.get("success"));
        assertFalse((Boolean) result.get("hasViolations"));
        
        // Test statistics
        Map<String, Object> stats = geofenceService.getGeofenceStatistics();
        assertNotNull(stats);
        assertTrue(stats.containsKey("totalGeofences"));
        assertTrue(stats.containsKey("activeGeofences"));
    }

    // Data Model Tests
    @Test
    void testLocationHistoryModel() {
        LocationHistory location = new LocationHistory(testUAV, 40.7128, -74.0060, 50.0);
        location.setSpeedKmh(30.0);
        location.setHeadingDegrees(180.0);
        location.setBatteryLevel(85);
        location.setLocationSource(LocationHistory.LocationSource.GPS);
        location.setAccuracyMeters(2.5);
        
        LocationHistory saved = locationHistoryRepository.save(location);
        assertNotNull(saved.getId());
        assertEquals(testUAV.getId(), saved.getUav().getId());
        assertTrue(saved.isHighAccuracy());
        
        // Test distance calculation
        double distance = saved.distanceToPoint(40.7130, -74.0062);
        assertTrue(distance > 0);
        assertTrue(distance < 1000); // Should be less than 1km
    }

    @Test
    void testDockingStationModel() {
        assertTrue(testStation.isAvailable());
        assertFalse(testStation.isFull());
        assertEquals(0.0, testStation.getOccupancyPercentage(), 0.1);
        
        // Test capacity management
        testStation.setCurrentOccupancy(3);
        assertEquals(60.0, testStation.getOccupancyPercentage(), 0.1);
        
        testStation.setCurrentOccupancy(5);
        assertTrue(testStation.isFull());
        assertFalse(testStation.isAvailable());
    }

    @Test
    void testGeofenceModel() {
        assertTrue(testGeofence.isActive());
        
        // Test point containment
        assertTrue(testGeofence.isPointInside(40.7128, -74.0060)); // center point
        assertFalse(testGeofence.isPointInside(40.7200, -74.0200)); // outside radius
        
        // Test violation recording
        int initialViolations = testGeofence.getTotalViolations();
        testGeofence.recordViolation();
        assertEquals(initialViolations + 1, testGeofence.getTotalViolations());
        assertNotNull(testGeofence.getLastViolationTime());
    }

    // Integration Tests
    @Test
    void testCompleteLocationUpdateFlow() throws Exception {
        // Update location
        Map<String, Object> locationData = new HashMap<>();
        locationData.put("latitude", 40.7150);
        locationData.put("longitude", -74.0080);
        locationData.put("altitude", 60.0);
        locationData.put("speed", 30.0);
        locationData.put("batteryLevel", 80);

        mockMvc.perform(post("/api/location/update/" + testUAV.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationData)))
                .andExpect(status().isOk());

        // Verify location history was created
        var history = locationHistoryRepository.findByUavIdOrderByTimestampDesc(testUAV.getId());
        assertFalse(history.isEmpty());
        assertEquals(40.7150, history.get(0).getLatitude(), 0.0001);

        // Verify current location was updated
        UAV updatedUAV = uavRepository.findById(testUAV.getId()).orElseThrow();
        assertEquals(40.7150, updatedUAV.getCurrentLatitude(), 0.0001);
    }

    @Test
    void testBulkLocationUpdate() throws Exception {
        // Create multiple location updates
        Map<String, Object> update1 = new HashMap<>();
        update1.put("uavId", testUAV.getId());
        update1.put("latitude", 40.7160);
        update1.put("longitude", -74.0090);
        update1.put("altitude", 65.0);

        Map<String, Object> update2 = new HashMap<>();
        update2.put("uavId", testUAV.getId());
        update2.put("latitude", 40.7170);
        update2.put("longitude", -74.0100);
        update2.put("altitude", 70.0);

        mockMvc.perform(post("/api/location/bulk-update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(java.util.List.of(update1, update2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.successCount").value(2))
                .andExpect(jsonPath("$.errorCount").value(0));
    }

    // Error Handling Tests
    @Test
    void testUpdateLocationForNonexistentUAV() throws Exception {
        Map<String, Object> locationData = new HashMap<>();
        locationData.put("latitude", 40.7128);
        locationData.put("longitude", -74.0060);

        mockMvc.perform(post("/api/location/update/99999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationData)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("UAV not found"));
    }

    @Test
    void testCreateDockingStationWithInvalidData() throws Exception {
        DockingStation invalidStation = new DockingStation();
        // Missing required fields

        mockMvc.perform(post("/api/docking-stations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidStation)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        Map<String, Object> locationData = new HashMap<>();
        locationData.put("latitude", 40.7128);
        locationData.put("longitude", -74.0060);

        // USER role should not be able to update locations
        mockMvc.perform(post("/api/location/update/" + testUAV.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationData)))
                .andExpect(status().isForbidden());
    }
}
