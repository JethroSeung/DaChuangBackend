package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.Geofence;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.GeofenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for GeofenceService
 */
@ExtendWith(MockitoExtension.class)
class GeofenceServiceTest {

    @Mock
    private GeofenceRepository geofenceRepository;

    @InjectMocks
    private GeofenceService geofenceService;

    private Geofence testGeofence;
    private UAV testUAV;

    @BeforeEach
    void setUp() {
        testGeofence = new Geofence();
        testGeofence.setId(1L);
        testGeofence.setName("Test Geofence");
        testGeofence.setDescription("Test Description");
        testGeofence.setFenceType(Geofence.FenceType.CIRCULAR);
        testGeofence.setBoundaryType(Geofence.BoundaryType.INCLUSION);
        testGeofence.setStatus(Geofence.FenceStatus.ACTIVE);
        testGeofence.setCenterLatitude(40.7128);
        testGeofence.setCenterLongitude(-74.0060);
        testGeofence.setRadiusMeters(1000.0);
        testGeofence.setPriorityLevel(1);

        testUAV = new UAV();
        testUAV.setId(1);
        testUAV.setRfidTag("TEST001");
        testUAV.setCurrentLatitude(40.7130);
        testUAV.setCurrentLongitude(-74.0058);
        testUAV.setCurrentAltitudeMeters(50.0);
    }

    @Test
    void testGetAllGeofences() {
        List<Geofence> geofences = Arrays.asList(testGeofence);
        when(geofenceRepository.findAll()).thenReturn(geofences);

        List<Geofence> result = geofenceService.getAllGeofences();

        assertEquals(1, result.size());
        assertEquals(testGeofence, result.get(0));
        verify(geofenceRepository, times(1)).findAll();
    }

    @Test
    void testGetGeofenceById() {
        when(geofenceRepository.findById(1L)).thenReturn(Optional.of(testGeofence));

        Optional<Geofence> result = geofenceService.getGeofenceById(1L);

        assertTrue(result.isPresent());
        assertEquals(testGeofence, result.get());
        verify(geofenceRepository, times(1)).findById(1L);
    }

    @Test
    void testGetGeofenceByIdNotFound() {
        when(geofenceRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Geofence> result = geofenceService.getGeofenceById(999L);

        assertFalse(result.isPresent());
        verify(geofenceRepository, times(1)).findById(999L);
    }

    @Test
    void testCreateGeofence() {
        when(geofenceRepository.save(any(Geofence.class))).thenReturn(testGeofence);

        Geofence result = geofenceService.createGeofence(testGeofence);

        assertNotNull(result);
        assertEquals(testGeofence, result);
        verify(geofenceRepository, times(1)).save(testGeofence);
    }

    @Test
    void testUpdateGeofence() {
        when(geofenceRepository.findById(1L)).thenReturn(Optional.of(testGeofence));
        when(geofenceRepository.save(any(Geofence.class))).thenReturn(testGeofence);

        testGeofence.setName("Updated Geofence");
        Geofence result = geofenceService.updateGeofence(1L, testGeofence);

        assertNotNull(result);
        assertEquals("Updated Geofence", result.getName());
        verify(geofenceRepository, times(1)).findById(1L);
        verify(geofenceRepository, times(1)).save(testGeofence);
    }

    @Test
    void testUpdateGeofenceNotFound() {
        when(geofenceRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            geofenceService.updateGeofence(999L, testGeofence);
        });

        assertEquals("Failed to update geofence: Geofence not found with ID: 999", exception.getMessage());
        verify(geofenceRepository, times(1)).findById(999L);
        verify(geofenceRepository, never()).save(any());
    }

    @Test
    void testDeleteGeofence() {
        when(geofenceRepository.findById(1L)).thenReturn(Optional.of(testGeofence));
        doNothing().when(geofenceRepository).deleteById(1L);

        geofenceService.deleteGeofence(1L);

        verify(geofenceRepository, times(1)).findById(1L);
        verify(geofenceRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteGeofenceNotFound() {
        when(geofenceRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            geofenceService.deleteGeofence(999L);
        });

        assertEquals("Failed to delete geofence: Geofence not found with ID: 999", exception.getMessage());
        verify(geofenceRepository, times(1)).findById(999L);
        verify(geofenceRepository, never()).deleteById(999L);
    }

    @Test
    void testGetActiveGeofences() {
        List<Geofence> activeGeofences = Arrays.asList(testGeofence);
        when(geofenceRepository.findByStatus(Geofence.FenceStatus.ACTIVE)).thenReturn(activeGeofences);

        List<Geofence> result = geofenceService.getActiveGeofences();

        assertEquals(1, result.size());
        assertEquals(testGeofence, result.get(0));
        verify(geofenceRepository, times(1)).findByStatus(Geofence.FenceStatus.ACTIVE);
    }

    @Test
    void testIsPointInsideCircularGeofence() {
        // Test point inside circular geofence
        boolean result = geofenceService.isPointInsideGeofence(testGeofence, 40.7130, -74.0058, 50.0);
        assertTrue(result);

        // Test point outside circular geofence
        result = geofenceService.isPointInsideGeofence(testGeofence, 41.0000, -75.0000, 50.0);
        assertFalse(result);

        // Test point exactly at center
        result = geofenceService.isPointInsideGeofence(testGeofence, 40.7128, -74.0060, 50.0);
        assertTrue(result);
    }

    @Test
    void testIsPointInsideCircularGeofenceWithAltitude() {
        testGeofence.setMinAltitudeMeters(0.0);
        testGeofence.setMaxAltitudeMeters(100.0);

        // Test point inside with valid altitude
        boolean result = geofenceService.isPointInsideGeofence(testGeofence, 40.7130, -74.0058, 50.0);
        assertTrue(result);

        // Test point inside but altitude too high
        result = geofenceService.isPointInsideGeofence(testGeofence, 40.7130, -74.0058, 150.0);
        assertFalse(result);

        // Test point inside but altitude too low
        result = geofenceService.isPointInsideGeofence(testGeofence, 40.7130, -74.0058, -10.0);
        assertFalse(result);
    }

    @Test
    void testIsPointInsidePolygonalGeofence() {
        testGeofence.setFenceType(Geofence.FenceType.POLYGONAL);
        // Simple square polygon around the test point
        String polygonCoords = "[[40.7120,-74.0070],[40.7120,-74.0050],[40.7140,-74.0050],[40.7140,-74.0070],[40.7120,-74.0070]]";
        testGeofence.setPolygonCoordinates(polygonCoords);

        // Test point inside polygon
        boolean result = geofenceService.isPointInsideGeofence(testGeofence, 40.7130, -74.0060, 50.0);
        assertTrue(result);

        // Test point outside polygon
        result = geofenceService.isPointInsideGeofence(testGeofence, 40.7150, -74.0060, 50.0);
        assertFalse(result);
    }

    @Test
    void testCheckGeofenceViolation() {
        List<Geofence> activeGeofences = Arrays.asList(testGeofence);
        when(geofenceRepository.findByStatus(Geofence.FenceStatus.ACTIVE)).thenReturn(activeGeofences);

        // Test point inside inclusion geofence (no violation)
        List<Geofence> violations = geofenceService.checkGeofenceViolations(40.7130, -74.0058, 50.0);
        assertTrue(violations.isEmpty());

        // Test point outside inclusion geofence (violation)
        violations = geofenceService.checkGeofenceViolations(41.0000, -75.0000, 50.0);
        assertEquals(1, violations.size());
        assertEquals(testGeofence, violations.get(0));
    }

    @Test
    void testCheckGeofenceViolationExclusion() {
        testGeofence.setBoundaryType(Geofence.BoundaryType.EXCLUSION);
        List<Geofence> activeGeofences = Arrays.asList(testGeofence);
        when(geofenceRepository.findByStatus(Geofence.FenceStatus.ACTIVE)).thenReturn(activeGeofences);

        // Test point inside exclusion geofence (violation)
        List<Geofence> violations = geofenceService.checkGeofenceViolations(40.7130, -74.0058, 50.0);
        assertEquals(1, violations.size());
        assertEquals(testGeofence, violations.get(0));

        // Test point outside exclusion geofence (no violation)
        violations = geofenceService.checkGeofenceViolations(41.0000, -75.0000, 50.0);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testGetGeofencesByType() {
        List<Geofence> circularGeofences = Arrays.asList(testGeofence);
        when(geofenceRepository.findByFenceType(Geofence.FenceType.CIRCULAR)).thenReturn(circularGeofences);

        List<Geofence> result = geofenceService.getGeofencesByType(Geofence.FenceType.CIRCULAR);

        assertEquals(1, result.size());
        assertEquals(testGeofence, result.get(0));
        verify(geofenceRepository, times(1)).findByFenceType(Geofence.FenceType.CIRCULAR);
    }

    @Test
    void testGetGeofencesByBoundaryType() {
        List<Geofence> inclusionGeofences = Arrays.asList(testGeofence);
        when(geofenceRepository.findByBoundaryType(Geofence.BoundaryType.INCLUSION)).thenReturn(inclusionGeofences);

        List<Geofence> result = geofenceService.getGeofencesByBoundaryType(Geofence.BoundaryType.INCLUSION);

        assertEquals(1, result.size());
        assertEquals(testGeofence, result.get(0));
        verify(geofenceRepository, times(1)).findByBoundaryType(Geofence.BoundaryType.INCLUSION);
    }

    @Test
    void testCleanupExpiredGeofences() {
        Geofence expiredGeofence = new Geofence();
        expiredGeofence.setId(2L);
        expiredGeofence.setStatus(Geofence.FenceStatus.ACTIVE);
        expiredGeofence.setExpiresAt(LocalDateTime.now().minusDays(1));

        List<Geofence> expiredGeofences = Arrays.asList(expiredGeofence);
        when(geofenceRepository.findExpiredGeofences(any(LocalDateTime.class))).thenReturn(expiredGeofences);
        when(geofenceRepository.save(any(Geofence.class))).thenReturn(expiredGeofence);

        geofenceService.cleanupExpiredGeofences();

        verify(geofenceRepository, times(1)).findExpiredGeofences(any(LocalDateTime.class));
        verify(geofenceRepository, times(1)).save(expiredGeofence);
        assertEquals(Geofence.FenceStatus.EXPIRED, expiredGeofence.getStatus());
    }

    @Test
    void testGetGeofencesNeedingAttention() {
        when(geofenceRepository.findExpiredGeofences(any(LocalDateTime.class))).thenReturn(Arrays.asList(testGeofence));
        when(geofenceRepository.findByStatus(Geofence.FenceStatus.ACTIVE)).thenReturn(Arrays.asList(testGeofence));

        Map<String, Object> result = geofenceService.getGeofencesNeedingAttention();

        assertNotNull(result);
        assertTrue(result.containsKey("expiringSoon"));
        assertTrue(result.containsKey("totalActive"));
        assertTrue(result.containsKey("timestamp"));
        
        verify(geofenceRepository, times(1)).findExpiredGeofences(any(LocalDateTime.class));
        verify(geofenceRepository, times(1)).findByStatus(Geofence.FenceStatus.ACTIVE);
    }

    @Test
    void testValidateGeofence() {
        // Test valid circular geofence
        assertTrue(geofenceService.validateGeofence(testGeofence));

        // Test invalid geofence - no name
        testGeofence.setName(null);
        assertFalse(geofenceService.validateGeofence(testGeofence));

        // Reset and test invalid geofence - no center coordinates for circular
        testGeofence.setName("Test");
        testGeofence.setCenterLatitude(null);
        assertFalse(geofenceService.validateGeofence(testGeofence));

        // Test invalid geofence - no radius for circular
        testGeofence.setCenterLatitude(40.7128);
        testGeofence.setRadiusMeters(null);
        assertFalse(geofenceService.validateGeofence(testGeofence));

        // Test invalid geofence - negative radius
        testGeofence.setRadiusMeters(-100.0);
        assertFalse(geofenceService.validateGeofence(testGeofence));
    }

    @Test
    void testValidatePolygonalGeofence() {
        testGeofence.setFenceType(Geofence.FenceType.POLYGONAL);
        testGeofence.setPolygonCoordinates("[[40.7120,-74.0070],[40.7120,-74.0050],[40.7140,-74.0050]]");

        // Test valid polygonal geofence
        assertTrue(geofenceService.validateGeofence(testGeofence));

        // Test invalid polygonal geofence - no coordinates
        testGeofence.setPolygonCoordinates(null);
        assertFalse(geofenceService.validateGeofence(testGeofence));

        // Test invalid polygonal geofence - empty coordinates
        testGeofence.setPolygonCoordinates("");
        assertFalse(geofenceService.validateGeofence(testGeofence));
    }

    @Test
    void testGetGeofenceStatistics() {
        when(geofenceRepository.count()).thenReturn(10L);
        when(geofenceRepository.countByStatus(Geofence.FenceStatus.ACTIVE)).thenReturn(8L);
        when(geofenceRepository.countByFenceType(Geofence.FenceType.CIRCULAR)).thenReturn(6L);
        when(geofenceRepository.countByBoundaryType(Geofence.BoundaryType.INCLUSION)).thenReturn(7L);

        Map<String, Object> result = geofenceService.getGeofenceStatistics();

        assertNotNull(result);
        assertEquals(10L, result.get("totalGeofences"));
        assertEquals(8L, result.get("activeGeofences"));
        assertEquals(6L, result.get("circularGeofences"));
        assertEquals(7L, result.get("inclusionGeofences"));
        assertNotNull(result.get("timestamp"));
        
        verify(geofenceRepository, times(1)).count();
        verify(geofenceRepository, times(1)).countByStatus(Geofence.FenceStatus.ACTIVE);
        verify(geofenceRepository, times(1)).countByFenceType(Geofence.FenceType.CIRCULAR);
        verify(geofenceRepository, times(1)).countByBoundaryType(Geofence.BoundaryType.INCLUSION);
    }
}
