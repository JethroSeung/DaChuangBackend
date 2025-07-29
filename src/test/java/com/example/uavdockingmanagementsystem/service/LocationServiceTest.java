package com.example.uavdockingmanagementsystem.service;

import com.example.uavdockingmanagementsystem.model.*;
import com.example.uavdockingmanagementsystem.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LocationService
 */
@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private UAVRepository uavRepository;

    @Mock
    private LocationHistoryRepository locationHistoryRepository;

    @Mock
    private GeofenceRepository geofenceRepository;

    @Mock
    private GeofenceService geofenceService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private LocationService locationService;

    private UAV testUAV;
    private LocationHistory testLocationHistory;
    private Geofence testGeofence;

    @BeforeEach
    void setUp() {
        testUAV = new UAV();
        testUAV.setId(1);
        testUAV.setRfidTag("TEST001");
        testUAV.setCurrentLatitude(40.7128);
        testUAV.setCurrentLongitude(-74.0060);
        testUAV.setCurrentAltitudeMeters(50.0);
        testUAV.setLastLocationUpdate(LocalDateTime.now());

        testLocationHistory = new LocationHistory();
        testLocationHistory.setId(1L);
        testLocationHistory.setUav(testUAV);
        testLocationHistory.setLatitude(40.7128);
        testLocationHistory.setLongitude(-74.0060);
        testLocationHistory.setAltitudeMeters(50.0);
        testLocationHistory.setTimestamp(LocalDateTime.now());

        testGeofence = new Geofence();
        testGeofence.setId(1L);
        testGeofence.setName("Test Geofence");
        testGeofence.setStatus(Geofence.FenceStatus.ACTIVE);
        testGeofence.setBoundaryType(Geofence.BoundaryType.INCLUSION);
    }

    @Test
    void testUpdateUAVLocation() {
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);
        when(geofenceService.checkGeofenceViolations(anyDouble(), anyDouble(), anyDouble())).thenReturn(Collections.emptyList());

        locationService.updateUAVLocation(testUAV, 40.7130, -74.0058, 55.0);

        assertEquals(40.7130, testUAV.getCurrentLatitude());
        assertEquals(-74.0058, testUAV.getCurrentLongitude());
        assertEquals(55.0, testUAV.getCurrentAltitudeMeters());
        assertNotNull(testUAV.getLastLocationUpdate());

        verify(uavRepository, times(1)).save(testUAV);
        verify(locationHistoryRepository, times(1)).save(any(LocationHistory.class));
    }

    @Test
    void testUpdateUAVLocationWithGeofenceViolation() {
        List<Geofence> activeGeofences = Arrays.asList(testGeofence);
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);
        when(geofenceRepository.findCurrentlyActiveGeofences(any(LocalDateTime.class))).thenReturn(activeGeofences);
        when(testGeofence.isPointInside(40.7130, -74.0058)).thenReturn(false);
        when(testGeofence.getBoundaryType()).thenReturn(Geofence.BoundaryType.INCLUSION);

        locationService.updateUAVLocation(testUAV, 40.7130, -74.0058, 55.0);

        verify(uavRepository, times(1)).save(testUAV);
        verify(locationHistoryRepository, times(1)).save(any(LocationHistory.class));
        verify(geofenceService, times(1)).checkGeofenceViolations(40.7130, -74.0058, 55.0);
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/geofence-violations"), any(Object.class));
    }

    @Test
    void testGetLocationHistory() {
        List<LocationHistory> history = Arrays.asList(testLocationHistory);
        when(locationHistoryRepository.findByUavIdOrderByTimestampDesc(1)).thenReturn(history);

        List<LocationHistory> result = locationService.getLocationHistory(1);

        assertEquals(1, result.size());
        assertEquals(testLocationHistory, result.get(0));
        verify(locationHistoryRepository, times(1)).findByUavIdOrderByTimestampDesc(1);
    }

    @Test
    void testGetLocationHistoryInTimeRange() {
        LocalDateTime start = LocalDateTime.now().minusHours(1);
        LocalDateTime end = LocalDateTime.now();
        List<LocationHistory> history = Arrays.asList(testLocationHistory);
        when(locationHistoryRepository.findByUavIdAndTimestampBetweenOrderByTimestampDesc(1, start, end)).thenReturn(history);

        List<LocationHistory> result = locationService.getLocationHistory(1, start, end);

        assertEquals(1, result.size());
        assertEquals(testLocationHistory, result.get(0));
        verify(locationHistoryRepository, times(1)).findByUavIdAndTimestampBetweenOrderByTimestampDesc(1, start, end);
    }

    @Test
    void testGetCurrentLocations() {
        List<UAV> uavs = Arrays.asList(testUAV);
        when(uavRepository.findAll()).thenReturn(uavs);
        when(testUAV.hasLocationData()).thenReturn(true);
        when(testUAV.getCurrentLatitude()).thenReturn(40.7128);
        when(testUAV.getCurrentLongitude()).thenReturn(-74.0060);
        when(testUAV.getCurrentAltitudeMeters()).thenReturn(50.0);

        List<Map<String, Object>> result = locationService.getCurrentLocations();

        assertEquals(1, result.size());
        verify(uavRepository, times(1)).findAll();
    }

    @Test
    void testGetUAVsInArea() {
        List<UAV> uavs = Arrays.asList(testUAV);
        when(uavRepository.findAll()).thenReturn(uavs);
        when(testUAV.hasLocationData()).thenReturn(true);
        when(testUAV.getCurrentLatitude()).thenReturn(40.7128);
        when(testUAV.getCurrentLongitude()).thenReturn(-74.0060);
        when(testUAV.getCurrentAltitudeMeters()).thenReturn(50.0);

        List<Map<String, Object>> result = locationService.getUAVsInArea(40.7100, 40.7150, -74.0080, -74.0040);

        assertEquals(1, result.size());
        verify(uavRepository, times(1)).findAll();
    }

    @Test
    void testGetNearbyUAVs() {
        when(locationHistoryRepository.findLocationsNearPoint(eq(40.7128), eq(-74.0060), eq(1000.0), any(LocalDateTime.class)))
            .thenReturn(Arrays.asList(testLocationHistory));

        List<Map<String, Object>> result = locationService.getNearbyUAVs(40.7128, -74.0060, 1000.0);

        assertEquals(1, result.size());
        verify(locationHistoryRepository, times(1)).findLocationsNearPoint(eq(40.7128), eq(-74.0060), eq(1000.0), any(LocalDateTime.class));
    }

    @Test
    void testCalculateDistance() {
        double distance = locationService.calculateDistance(40.7128, -74.0060, 40.7130, -74.0058);
        
        assertTrue(distance > 0);
        assertTrue(distance < 1000); // Should be less than 1km for nearby points
    }

    @Test
    void testCalculateDistanceSamePoint() {
        double distance = locationService.calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
        
        assertEquals(0.0, distance, 0.001);
    }

    @Test
    void testIsWithinRadius() {
        // Test point within radius
        assertTrue(locationService.isWithinRadius(40.7128, -74.0060, 40.7130, -74.0058, 1000.0));
        
        // Test point outside radius
        assertFalse(locationService.isWithinRadius(40.7128, -74.0060, 41.0000, -75.0000, 1000.0));
        
        // Test same point
        assertTrue(locationService.isWithinRadius(40.7128, -74.0060, 40.7128, -74.0060, 0.0));
    }

    @Test
    void testGetLocationStatistics() {
        when(locationHistoryRepository.count()).thenReturn(1000L);
        when(uavRepository.countUAVsWithLocation()).thenReturn(50L);
        when(uavRepository.count()).thenReturn(60L);

        Map<String, Object> result = locationService.getLocationStatistics();

        assertNotNull(result);
        assertEquals(1000L, result.get("totalLocationRecords"));
        assertEquals(50L, result.get("uavsWithLocation"));
        assertEquals(60L, result.get("totalUAVs"));
        assertNotNull(result.get("timestamp"));
        
        verify(locationHistoryRepository, times(1)).count();
        verify(uavRepository, times(1)).countUAVsWithLocation();
        verify(uavRepository, times(1)).count();
    }

    @Test
    void testCleanupOldLocationRecords() {
        doNothing().when(locationHistoryRepository).deleteOldRecords(any(LocalDateTime.class));

        locationService.cleanupOldLocationRecords(30);

        verify(locationHistoryRepository, times(1)).deleteOldRecords(any(LocalDateTime.class));
    }

    @Test
    void testGetTrackingDashboardData() {
        List<UAV> activeUAVs = Arrays.asList(testUAV);
        when(locationHistoryRepository.findActiveUAVsSince(any(LocalDateTime.class))).thenReturn(activeUAVs);
        when(uavRepository.findAll()).thenReturn(Arrays.asList(testUAV));
        when(testUAV.hasLocationData()).thenReturn(true);

        Map<String, Object> result = locationService.getTrackingDashboardData();

        assertNotNull(result);
        assertTrue(result.containsKey("activeUAVsCount"));
        assertTrue(result.containsKey("currentLocations"));
        assertTrue(result.containsKey("timestamp"));
        verify(locationHistoryRepository, times(1)).findActiveUAVsSince(any(LocalDateTime.class));
    }

    @Test
    void testCheckGeofenceViolations() {
        List<Geofence> activeGeofences = Arrays.asList(testGeofence);
        when(geofenceRepository.findCurrentlyActiveGeofences(any(LocalDateTime.class))).thenReturn(activeGeofences);
        when(testGeofence.isPointInside(40.7128, -74.0060)).thenReturn(false);
        when(testGeofence.getBoundaryType()).thenReturn(Geofence.BoundaryType.INCLUSION);

        locationService.checkGeofenceViolations(testUAV, 40.7128, -74.0060, 50.0);

        verify(geofenceService, times(1)).checkGeofenceViolations(40.7128, -74.0060, 50.0);
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/geofence-violations"), any(Object.class));
    }

    @Test
    void testCheckGeofenceViolationsNoViolations() {
        when(geofenceService.checkGeofenceViolations(40.7128, -74.0060, 50.0)).thenReturn(Collections.emptyList());

        locationService.checkGeofenceViolations(testUAV, 40.7128, -74.0060, 50.0);

        verify(geofenceService, times(1)).checkGeofenceViolations(40.7128, -74.0060, 50.0);
        verify(messagingTemplate, never()).convertAndSend(eq("/topic/geofence-violations"), any(Object.class));
    }

    @Test
    void testGetLocationHistoryEmpty() {
        when(locationHistoryRepository.findByUavIdOrderByTimestampDesc(999)).thenReturn(Collections.emptyList());

        List<LocationHistory> result = locationService.getLocationHistory(999);

        assertTrue(result.isEmpty());
        verify(locationHistoryRepository, times(1)).findByUavIdOrderByTimestampDesc(999);
    }

    @Test
    void testGetUAVsInAreaEmpty() {
        when(uavRepository.findAll()).thenReturn(Collections.emptyList());

        List<Map<String, Object>> result = locationService.getUAVsInArea(50.0, 51.0, 0.0, 1.0);

        assertTrue(result.isEmpty());
        verify(uavRepository, times(1)).findAll();
    }

    @Test
    void testGetNearbyUAVsEmpty() {
        when(locationHistoryRepository.findLocationsNearPoint(eq(50.0), eq(0.0), eq(1000.0), any(LocalDateTime.class)))
            .thenReturn(Collections.emptyList());

        List<Map<String, Object>> result = locationService.getNearbyUAVs(50.0, 0.0, 1000.0);

        assertTrue(result.isEmpty());
        verify(locationHistoryRepository, times(1)).findLocationsNearPoint(eq(50.0), eq(0.0), eq(1000.0), any(LocalDateTime.class));
    }

    @Test
    void testUpdateUAVLocationNullValues() {
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenReturn(testLocationHistory);
        when(geofenceRepository.findCurrentlyActiveGeofences(any(LocalDateTime.class))).thenReturn(Collections.emptyList());

        // Test with null altitude
        locationService.updateUAVLocation(testUAV, 40.7130, -74.0058, null);

        assertEquals(40.7130, testUAV.getCurrentLatitude());
        assertEquals(-74.0058, testUAV.getCurrentLongitude());
        assertNull(testUAV.getCurrentAltitudeMeters());

        verify(uavRepository, times(1)).save(testUAV);
        verify(locationHistoryRepository, times(1)).save(any(LocationHistory.class));
    }

    @Test
    void testLocationHistoryCreation() {
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);
        when(locationHistoryRepository.save(any(LocationHistory.class))).thenAnswer(invocation -> {
            LocationHistory history = invocation.getArgument(0);
            assertEquals(testUAV, history.getUav());
            assertEquals(40.7130, history.getLatitude());
            assertEquals(-74.0058, history.getLongitude());
            assertEquals(55.0, history.getAltitudeMeters());
            assertNotNull(history.getTimestamp());
            return history;
        });
        when(geofenceService.checkGeofenceViolations(anyDouble(), anyDouble(), anyDouble())).thenReturn(Collections.emptyList());

        locationService.updateUAVLocation(testUAV, 40.7130, -74.0058, 55.0);

        verify(locationHistoryRepository, times(1)).save(any(LocationHistory.class));
    }
}
