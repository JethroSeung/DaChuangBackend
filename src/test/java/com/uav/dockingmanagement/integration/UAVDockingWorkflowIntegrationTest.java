package com.uav.dockingmanagement.integration;

import com.uav.dockingmanagement.TestDataInitializer;
import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import com.uav.dockingmanagement.config.TestSecurityConfig;
import com.uav.dockingmanagement.config.TestWebConfig;
import com.uav.dockingmanagement.model.*;
import com.uav.dockingmanagement.repository.*;
import com.uav.dockingmanagement.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test for complete UAV docking workflow
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Import({ TestRateLimitingConfig.class, TestSecurityConfig.class, TestWebConfig.class })
@Transactional
class UAVDockingWorkflowIntegrationTest {

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private DockingRecordRepository dockingRecordRepository;

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private UAVService uavService;

    @Autowired
    private DockingStationService dockingStationService;

    @Autowired
    private RegionService regionService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDataInitializer testDataInitializer;

    private UAV testUAV;
    private DockingStation testStation;
    private Region testRegion;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testDataInitializer.initializeTestData();

        // Get test entities from initialized data
        testRegion = regionRepository.findAll().get(0);

        // Create test UAV
        testUAV = new UAV();
        testUAV.setRfidTag("INTEGRATION_TEST_001");
        testUAV.setOwnerName("Integration Test Owner");
        testUAV.setModel("Test Model");
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        testUAV.setOperationalStatus(UAV.OperationalStatus.READY);
        testUAV.setCurrentLatitude(40.7128);
        testUAV.setCurrentLongitude(-74.0060);
        testUAV.setCurrentAltitudeMeters(50.0);
        testUAV.setLastLocationUpdate(LocalDateTime.now());
        testUAV = uavRepository.save(testUAV);

        // Associate UAV with test region for access control
        UAV updatedUAV = uavService.addRegionToUAV(testUAV.getId(), testRegion.getId());
        assertNotNull(updatedUAV, "UAV should be updated with region");

        // Force refresh the UAV to ensure region association is loaded
        testUAV = uavRepository.findById(testUAV.getId()).orElseThrow();

        // Verify the region was added
        assertTrue(testUAV.getRegions().contains(testRegion),
                "UAV should contain the test region after association");

        // Create test docking station
        testStation = new DockingStation();
        testStation.setName("Integration Test Station");
        testStation.setDescription("Test Station for Integration Tests");
        testStation.setLatitude(40.7130);
        testStation.setLongitude(-74.0058);
        testStation.setAltitudeMeters(10.0);
        testStation.setMaxCapacity(5);
        testStation.setCurrentOccupancy(0);
        testStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        testStation.setStationType(DockingStation.StationType.STANDARD);
        testStation.setChargingAvailable(true);
        testStation.setMaintenanceAvailable(false);
        testStation.setWeatherProtected(true);
        testStation.setSecurityLevel("MEDIUM");
        testStation.setContactInfo("test@integration.com");
        testStation = dockingStationRepository.save(testStation);
    }

    @Test
    void testCompleteUAVDockingWorkflow() throws Exception {
        // Step 1: Verify UAV exists and is authorized
        Optional<UAV> uavOptional = uavRepository.findByRfidTag("INTEGRATION_TEST_001");
        assertTrue(uavOptional.isPresent());
        assertEquals(UAV.Status.AUTHORIZED, uavOptional.get().getStatus());

        // Step 2: Add region access to UAV
        UAV updatedUAV = uavService.addRegionToUAV(testUAV.getId(), testRegion.getId());
        assertNotNull(updatedUAV);
        assertTrue(updatedUAV.getRegions().contains(testRegion));

        // Step 3: Test access control validation
        String accessResult = uavService.checkUAVRegionAccess("INTEGRATION_TEST_001", testRegion.getRegionName());
        assertEquals("OPEN THE DOOR", accessResult);

        // Step 4: Update UAV location (simulate movement)
        locationService.updateUAVLocation(testUAV, 40.7129, -74.0059, 55.0);

        // Verify location was updated
        UAV refreshedUAV = uavRepository.findById(testUAV.getId()).orElseThrow();
        assertEquals(40.7129, refreshedUAV.getCurrentLatitude());
        assertEquals(-74.0059, refreshedUAV.getCurrentLongitude());
        assertEquals(55.0, refreshedUAV.getCurrentAltitudeMeters());

        // Verify location history was created
        List<LocationHistory> locationHistory = locationService.getLocationHistory(testUAV.getId());
        assertFalse(locationHistory.isEmpty());

        // Step 5: Find optimal docking station
        Optional<DockingStation> optimalStation = dockingStationService.findOptimalStation(
                40.7129, -74.0059, "CHARGING");
        assertTrue(optimalStation.isPresent());
        assertEquals(testStation.getId(), optimalStation.get().getId());

        // Step 6: Dock the UAV
        Map<String, Object> dockingResult = dockingStationService.dockUAV(
                testUAV.getId(), testStation.getId(), "CHARGING");
        assertTrue((Boolean) dockingResult.get("success"));
        assertEquals("UAV docked successfully", dockingResult.get("message"));

        // Verify docking record was created
        Optional<DockingRecord> dockingRecord = dockingRecordRepository.findCurrentDockingByUavId(testUAV.getId());
        assertTrue(dockingRecord.isPresent());
        assertEquals(testUAV.getId(), dockingRecord.get().getUav().getId());
        assertEquals(testStation.getId(), dockingRecord.get().getDockingStation().getId());
        assertEquals("CHARGING", dockingRecord.get().getPurpose());
        assertNotNull(dockingRecord.get().getDockTime());
        assertNull(dockingRecord.get().getUndockTime());

        // Verify station occupancy was updated
        DockingStation refreshedStation = dockingStationRepository.findById(testStation.getId()).orElseThrow();
        assertEquals(1, refreshedStation.getCurrentOccupancy());

        // Verify UAV status was updated
        refreshedUAV = uavRepository.findById(testUAV.getId()).orElseThrow();
        assertEquals(UAV.OperationalStatus.CHARGING, refreshedUAV.getOperationalStatus());

        // Step 7: Simulate charging/maintenance time
        Thread.sleep(100); // Small delay to simulate time passage

        // Step 8: Undock the UAV
        Map<String, Object> undockingResult = dockingStationService.undockUAV(testUAV.getId());
        assertTrue((Boolean) undockingResult.get("success"));
        assertEquals("UAV undocked successfully", undockingResult.get("message"));

        // Verify docking record was updated
        dockingRecord = dockingRecordRepository.findCurrentDockingByUavId(testUAV.getId());
        assertFalse(dockingRecord.isPresent()); // Should no longer be active

        // Find the completed docking record
        List<DockingRecord> completedRecords = dockingRecordRepository.findByUavIdOrderByDockTimeDesc(testUAV.getId());
        assertFalse(completedRecords.isEmpty());
        DockingRecord completedRecord = completedRecords.get(0);
        assertNotNull(completedRecord.getUndockTime());
        assertTrue(completedRecord.getUndockTime().isAfter(completedRecord.getDockTime()));

        // Verify station occupancy was updated
        refreshedStation = dockingStationRepository.findById(testStation.getId()).orElseThrow();
        assertEquals(0, refreshedStation.getCurrentOccupancy());

        // Verify UAV status was updated
        refreshedUAV = uavRepository.findById(testUAV.getId()).orElseThrow();
        assertEquals(UAV.OperationalStatus.READY, refreshedUAV.getOperationalStatus());

        // Step 9: Test statistics and reporting
        Map<String, Object> stationStats = dockingStationService.getStationStatistics();
        assertNotNull(stationStats);
        assertTrue(stationStats.containsKey("totalStations"));
        assertTrue(stationStats.containsKey("operationalStations"));

        Map<String, Object> locationStats = locationService.getLocationStatistics();
        assertNotNull(locationStats);
        assertTrue(locationStats.containsKey("totalLocationRecords"));
        assertTrue(locationStats.containsKey("uavsWithLocation"));
    }

    @Test
    void testUAVDockingFailureScenarios() throws Exception {
        // Test docking when station is full
        testStation.setCurrentOccupancy(testStation.getMaxCapacity());
        dockingStationRepository.save(testStation);

        Map<String, Object> result = dockingStationService.dockUAV(
                testUAV.getId(), testStation.getId(), "CHARGING");
        assertFalse((Boolean) result.get("success"));
        assertTrue(result.get("message").toString().contains("full"));

        // Reset station
        testStation.setCurrentOccupancy(0);
        dockingStationRepository.save(testStation);

        // Test docking when station is not operational
        testStation.setStatus(DockingStation.StationStatus.MAINTENANCE);
        dockingStationRepository.save(testStation);

        result = dockingStationService.dockUAV(testUAV.getId(), testStation.getId(), "CHARGING");
        assertFalse((Boolean) result.get("success"));
        assertTrue(result.get("message").toString().contains("not operational"));

        // Reset station
        testStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        dockingStationRepository.save(testStation);

        // Test docking with non-existent UAV
        result = dockingStationService.dockUAV(99999, testStation.getId(), "CHARGING");
        assertFalse((Boolean) result.get("success"));
        assertEquals("UAV not found", result.get("message"));

        // Test docking with non-existent station
        result = dockingStationService.dockUAV(testUAV.getId(), 99999L, "CHARGING");
        assertFalse((Boolean) result.get("success"));
        assertEquals("Docking station not found", result.get("message"));
    }

    @Test
    void testAccessControlWorkflow() throws Exception {
        // Remove region access for this test to test different scenarios
        uavService.removeRegionFromUAV(testUAV.getId(), testRegion.getId());

        // Test unauthorized UAV
        testUAV.setStatus(UAV.Status.UNAUTHORIZED);
        uavRepository.save(testUAV);

        String accessResult = uavService.checkUAVRegionAccess("INTEGRATION_TEST_001", testRegion.getRegionName());
        assertEquals("UAV is not authorized", accessResult);

        // Test authorized UAV without region access
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        uavRepository.save(testUAV);

        accessResult = uavService.checkUAVRegionAccess("INTEGRATION_TEST_001", testRegion.getRegionName());
        assertEquals("UAV is not authorized for region: " + testRegion.getRegionName(), accessResult);

        // Test authorized UAV with region access
        uavService.addRegionToUAV(testUAV.getId(), testRegion.getId());
        accessResult = uavService.checkUAVRegionAccess("INTEGRATION_TEST_001", testRegion.getRegionName());
        assertEquals("OPEN THE DOOR", accessResult);

        // Test non-existent UAV
        accessResult = uavService.checkUAVRegionAccess("NON_EXISTENT", testRegion.getRegionName());
        assertEquals("UAV with RFID NON_EXISTENT not found", accessResult);
    }

    @Test
    void testLocationTrackingWorkflow() throws Exception {
        // Test initial location
        assertEquals(40.7128, testUAV.getCurrentLatitude());
        assertEquals(-74.0060, testUAV.getCurrentLongitude());

        // Test location updates
        locationService.updateUAVLocation(testUAV, 40.7140, -74.0050, 60.0);

        UAV updatedUAV = uavRepository.findById(testUAV.getId()).orElseThrow();
        assertEquals(40.7140, updatedUAV.getCurrentLatitude());
        assertEquals(-74.0050, updatedUAV.getCurrentLongitude());
        assertEquals(60.0, updatedUAV.getCurrentAltitudeMeters());

        // Test location history
        List<LocationHistory> history = locationHistoryRepository.findByUavIdOrderByTimestampDesc(testUAV.getId());
        assertFalse(history.isEmpty());

        LocationHistory latestLocation = history.get(0);
        assertEquals(40.7140, latestLocation.getLatitude());
        assertEquals(-74.0050, latestLocation.getLongitude());
        assertEquals(60.0, latestLocation.getAltitudeMeters());

        // Test nearby UAVs
        List<Map<String, Object>> nearbyUAVMaps = locationService.getNearbyUAVs(40.7140, -74.0050, 1000.0);
        assertFalse(nearbyUAVMaps.isEmpty());

        // Check if our test UAV is in the nearby UAVs by ID
        boolean testUAVFound = nearbyUAVMaps.stream()
                .anyMatch(map -> Objects.equals(testUAV.getId(), map.get("id")));
        assertTrue(testUAVFound, "Test UAV should be found in nearby UAVs");

        // Test UAVs in area
        List<Map<String, Object>> uavsInAreaMaps = locationService.getUAVsInArea(40.7130, 40.7150, -74.0070, -74.0040);
        assertFalse(uavsInAreaMaps.isEmpty());

        // Check if our test UAV is in the area by ID
        boolean testUAVInArea = uavsInAreaMaps.stream()
                .anyMatch(map -> Objects.equals(testUAV.getId(), map.get("id")));
        assertTrue(testUAVInArea, "Test UAV should be found in the specified area");
    }

    @Test
    void testRegionManagementWorkflow() throws Exception {
        // Test region creation
        Region newRegion = regionService.createRegion("New Test Region");
        assertNotNull(newRegion);
        assertEquals("New Test Region", newRegion.getRegionName());

        // Test region assignment to UAV
        UAV updatedUAV = uavService.addRegionToUAV(testUAV.getId(), newRegion.getId());
        assertTrue(updatedUAV.getRegions().contains(newRegion));

        // Test UAVs by region
        List<UAV> uavsInRegion = regionService.getUAVsByRegion(newRegion.getId());
        assertTrue(uavsInRegion.contains(testUAV));

        // Test region removal from UAV
        updatedUAV = uavService.removeRegionFromUAV(testUAV.getId(), newRegion.getId());
        assertFalse(updatedUAV.getRegions().contains(newRegion));

        // Test region statistics
        Map<String, Object> stats = regionService.getRegionStatistics();
        assertNotNull(stats);
        assertTrue(stats.containsKey("totalRegions"));
        assertTrue(stats.containsKey("totalUAVs"));
    }
}
