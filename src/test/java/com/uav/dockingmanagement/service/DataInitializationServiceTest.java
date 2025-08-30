package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.*;
import com.uav.dockingmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for DataInitializationService
 * Tests sample data creation logic, initialization methods, and error handling
 */
@ExtendWith(MockitoExtension.class)
class DataInitializationServiceTest {

    @Mock
    private UAVRepository uavRepository;

    @Mock
    private DockingStationRepository dockingStationRepository;

    @Mock
    private GeofenceRepository geofenceRepository;

    @Mock
    private LocationHistoryRepository locationHistoryRepository;

    @Mock
    private RegionRepository regionRepository;

    @Mock
    private DockingStationService dockingStationService;

    @Mock
    private GeofenceService geofenceService;

    @Mock
    private RegionService regionService;

    @InjectMocks
    private DataInitializationService dataInitializationService;

    private UAV testUAV;
    private Region testRegion;
    private DockingStation testStation;
    private Geofence testGeofence;
    private LocationHistory testLocationHistory;

    @BeforeEach
    void setUp() {
        // Setup test UAV
        testUAV = new UAV();
        testUAV.setId(1);
        testUAV.setRfidTag("UAV-001");
        testUAV.setOwnerName("John Smith");
        testUAV.setModel("DJI Phantom 4");
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        testUAV.setOperationalStatus(UAV.OperationalStatus.READY);
        testUAV.setCurrentLatitude(40.7589);
        testUAV.setCurrentLongitude(-73.9851);
        testUAV.setCurrentAltitudeMeters(50.0);
        testUAV.setRegions(new HashSet<>());

        // Setup test region
        testRegion = new Region();
        testRegion.setId(1);
        testRegion.setRegionName("Test Region");

        // Setup test docking station
        testStation = new DockingStation();
        testStation.setId(1L);
        testStation.setName("Test Station");
        testStation.setLatitude(40.7128);
        testStation.setLongitude(-74.0060);

        // Setup test geofence
        testGeofence = new Geofence();
        testGeofence.setId(1L);
        testGeofence.setName("Test Geofence");
        testGeofence.setCenterLatitude(40.7589);
        testGeofence.setCenterLongitude(-73.9851);
        testGeofence.setRadiusMeters(1000.0);

        // Setup test location history
        testLocationHistory = new LocationHistory();
        testLocationHistory.setId(1L);
        testLocationHistory.setUav(testUAV);
        testLocationHistory.setLatitude(40.7589);
        testLocationHistory.setLongitude(-73.9851);
        testLocationHistory.setAltitudeMeters(50.0);
        testLocationHistory.setTimestamp(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should run initialization successfully")
    void testRunInitialization() throws Exception {
        // Given
        doNothing().when(regionService).initializeSampleRegions();
        doNothing().when(dockingStationService).initializeSampleStations();
        doNothing().when(geofenceService).initializeSampleGeofences();
        when(uavRepository.count()).thenReturn(0L);

        // When
        dataInitializationService.run();

        // Then
        verify(regionService, times(1)).initializeSampleRegions();
        verify(dockingStationService, times(1)).initializeSampleStations();
        verify(geofenceService, times(1)).initializeSampleGeofences();
        verify(uavRepository, times(1)).count();
    }

    @Test
    @DisplayName("Should handle initialization exception gracefully")
    void testRunInitializationWithException() throws Exception {
        // Given
        doThrow(new RuntimeException("Database error")).when(regionService).initializeSampleRegions();

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> dataInitializationService.run());

        verify(regionService, times(1)).initializeSampleRegions();
    }

    @Test
    @DisplayName("Should initialize regions successfully")
    void testInitializeRegions() {
        // Given
        doNothing().when(regionService).initializeSampleRegions();

        // When
        dataInitializationService.initializeRegions();

        // Then
        verify(regionService, times(1)).initializeSampleRegions();
    }

    @Test
    @DisplayName("Should handle regions initialization exception")
    void testInitializeRegionsWithException() {
        // Given
        doThrow(new RuntimeException("Region error")).when(regionService).initializeSampleRegions();

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> dataInitializationService.initializeRegions());

        verify(regionService, times(1)).initializeSampleRegions();
    }

    @Test
    @DisplayName("Should initialize docking stations successfully")
    void testInitializeDockingStations() {
        // Given
        doNothing().when(dockingStationService).initializeSampleStations();

        // When
        dataInitializationService.initializeDockingStations();

        // Then
        verify(dockingStationService, times(1)).initializeSampleStations();
    }

    @Test
    @DisplayName("Should handle docking stations initialization exception")
    void testInitializeDockingStationsWithException() {
        // Given
        doThrow(new RuntimeException("Station error")).when(dockingStationService).initializeSampleStations();

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> dataInitializationService.initializeDockingStations());

        verify(dockingStationService, times(1)).initializeSampleStations();
    }

    @Test
    @DisplayName("Should initialize geofences successfully")
    void testInitializeGeofences() {
        // Given
        doNothing().when(geofenceService).initializeSampleGeofences();

        // When
        dataInitializationService.initializeGeofences();

        // Then
        verify(geofenceService, times(1)).initializeSampleGeofences();
    }

    @Test
    @DisplayName("Should handle geofences initialization exception")
    void testInitializeGeofencesWithException() {
        // Given
        doThrow(new RuntimeException("Geofence error")).when(geofenceService).initializeSampleGeofences();

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> dataInitializationService.initializeGeofences());

        verify(geofenceService, times(1)).initializeSampleGeofences();
    }

    @Test
    @DisplayName("Should initialize UAVs when count is less than 5")
    void testInitializeUAVsWithLocationsWhenCountLow() {
        // Given
        when(uavRepository.count()).thenReturn(2L);
        when(uavRepository.findByRfidTag(anyString())).thenReturn(Optional.empty());
        when(regionRepository.findAll()).thenReturn(Arrays.asList(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);

        // When
        dataInitializationService.initializeUAVsWithLocations();

        // Then
        verify(uavRepository, times(1)).count();
        verify(uavRepository, times(5)).findByRfidTag(anyString()); // 5 sample UAVs
        verify(uavRepository, times(5)).save(any(UAV.class));
    }

    @Test
    @DisplayName("Should skip UAV initialization when count is 5 or more")
    void testInitializeUAVsWithLocationsWhenCountHigh() {
        // Given
        when(uavRepository.count()).thenReturn(5L);

        // When
        dataInitializationService.initializeUAVsWithLocations();

        // Then
        verify(uavRepository, times(1)).count();
        verify(uavRepository, never()).save(any(UAV.class));
    }

    @Test
    @DisplayName("Should skip creating UAV if RFID tag already exists")
    void testInitializeUAVsSkipExistingRfidTag() {
        // Given
        when(uavRepository.count()).thenReturn(0L);
        when(uavRepository.findByRfidTag("UAV-001")).thenReturn(Optional.of(testUAV));
        when(uavRepository.findByRfidTag(argThat(tag -> !tag.equals("UAV-001")))).thenReturn(Optional.empty());
        when(regionRepository.findAll()).thenReturn(Arrays.asList(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);

        // When
        dataInitializationService.initializeUAVsWithLocations();

        // Then
        verify(uavRepository, times(1)).count();
        verify(uavRepository, times(5)).findByRfidTag(anyString());
        verify(uavRepository, times(4)).save(any(UAV.class)); // Only 4 saved, 1 skipped
    }

    @Test
    @DisplayName("Should handle UAV initialization exception")
    void testInitializeUAVsWithException() {
        // Given
        when(uavRepository.count()).thenThrow(new RuntimeException("Database error"));

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> dataInitializationService.initializeUAVsWithLocations());

        verify(uavRepository, times(1)).count();
    }

    @Test
    @DisplayName("Should create additional test data successfully")
    void testCreateAdditionalTestData() {
        // Given
        when(uavRepository.findByRfidTag(anyString())).thenReturn(Optional.empty());
        when(regionRepository.findAll()).thenReturn(Arrays.asList(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);
        when(geofenceRepository.count()).thenReturn(5L);
        when(geofenceRepository.save(any(Geofence.class))).thenReturn(testGeofence);

        // When
        dataInitializationService.createAdditionalTestData();

        // Then
        verify(uavRepository, times(10)).findByRfidTag(anyString()); // TEST-006 to TEST-015
        verify(uavRepository, times(10)).save(any(UAV.class));
        verify(geofenceRepository, times(1)).count();
        verify(geofenceRepository, times(3)).save(any(Geofence.class)); // 3 additional geofences
    }

    @Test
    @DisplayName("Should handle additional test data creation exception")
    void testCreateAdditionalTestDataWithException() {
        // Given
        when(uavRepository.findByRfidTag(anyString())).thenThrow(new RuntimeException("Database error"));

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> dataInitializationService.createAdditionalTestData());

        // The method tries to create 10 UAVs (TEST-006 to TEST-015), each calling findByRfidTag once
        verify(uavRepository, times(10)).findByRfidTag(anyString());
    }

    @Test
    @DisplayName("Should skip additional geofences when count is 8 or more")
    void testCreateAdditionalTestDataSkipGeofences() {
        // Given
        when(uavRepository.findByRfidTag(anyString())).thenReturn(Optional.empty());
        when(regionRepository.findAll()).thenReturn(Arrays.asList(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);
        when(geofenceRepository.count()).thenReturn(8L); // Already 8 geofences

        // When
        dataInitializationService.createAdditionalTestData();

        // Then
        verify(geofenceRepository, times(1)).count();
        verify(geofenceRepository, never()).save(any(Geofence.class));
    }

    @Test
    @DisplayName("Should simulate location updates for UAVs with location data")
    void testSimulateLocationUpdates() {
        // Given
        testUAV.setCurrentLatitude(40.7589);
        testUAV.setCurrentLongitude(-73.9851);
        testUAV.setCurrentAltitudeMeters(50.0);

        UAV uavWithoutLocation = new UAV();
        uavWithoutLocation.setId(2);
        uavWithoutLocation.setRfidTag("UAV-002");

        when(uavRepository.findAll()).thenReturn(Arrays.asList(testUAV, uavWithoutLocation));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);

        // When
        dataInitializationService.simulateLocationUpdates();

        // Then
        verify(uavRepository, times(1)).findAll();
        verify(uavRepository, times(1)).save(testUAV); // Only UAV with location data
        verify(locationHistoryRepository, times(1)).save(any(LocationHistory.class));
    }

    @Test
    @DisplayName("Should handle location simulation exception")
    void testSimulateLocationUpdatesWithException() {
        // Given
        when(uavRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> dataInitializationService.simulateLocationUpdates());

        verify(uavRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should handle empty UAV list in location simulation")
    void testSimulateLocationUpdatesEmptyList() {
        // Given
        when(uavRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        dataInitializationService.simulateLocationUpdates();

        // Then
        verify(uavRepository, times(1)).findAll();
        verify(uavRepository, never()).save(any(UAV.class));
        verify(locationHistoryRepository, never()).save(any(LocationHistory.class));
    }
}
