package com.uav.dockingmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Geofence model
 */
@ExtendWith(MockitoExtension.class)
class GeofenceTest {

    private Geofence geofence;

    @BeforeEach
    void setUp() {
        geofence = new Geofence();
        geofence.setId(1L);
        geofence.setName("Test Geofence");
        geofence.setDescription("Test Description");
        geofence.setFenceType(Geofence.FenceType.CIRCULAR);
        geofence.setBoundaryType(Geofence.BoundaryType.INCLUSION);
        geofence.setStatus(Geofence.FenceStatus.ACTIVE);
        geofence.setCenterLatitude(40.7128);
        geofence.setCenterLongitude(-74.0060);
        geofence.setRadiusMeters(1000.0);
        geofence.setMinAltitudeMeters(0.0);
        geofence.setMaxAltitudeMeters(100.0);
        geofence.setPriorityLevel(1);
        geofence.setViolationAction("ALERT");
    }

    @Test
    void testGeofenceCreation() {
        assertNotNull(geofence);
        assertEquals(1L, geofence.getId());
        assertEquals("Test Geofence", geofence.getName());
        assertEquals("Test Description", geofence.getDescription());
        assertEquals(Geofence.FenceType.CIRCULAR, geofence.getFenceType());
        assertEquals(Geofence.BoundaryType.INCLUSION, geofence.getBoundaryType());
        assertEquals(Geofence.FenceStatus.ACTIVE, geofence.getStatus());
        assertEquals(40.7128, geofence.getCenterLatitude());
        assertEquals(-74.0060, geofence.getCenterLongitude());
        assertEquals(1000.0, geofence.getRadiusMeters());
        assertEquals(0.0, geofence.getMinAltitudeMeters());
        assertEquals(100.0, geofence.getMaxAltitudeMeters());
        assertEquals(1, geofence.getPriorityLevel());
        assertEquals("ALERT", geofence.getViolationAction());
    }

    @Test
    void testDefaultValues() {
        Geofence newGeofence = new Geofence();
        
        assertEquals(Geofence.FenceType.CIRCULAR, newGeofence.getFenceType());
        assertEquals(Geofence.BoundaryType.INCLUSION, newGeofence.getBoundaryType());
        assertEquals(Geofence.FenceStatus.ACTIVE, newGeofence.getStatus());
        assertEquals(1, newGeofence.getPriorityLevel());
    }

    @Test
    void testFenceTypeEnum() {
        assertEquals(2, Geofence.FenceType.values().length);
        
        assertNotNull(Geofence.FenceType.CIRCULAR);
        assertNotNull(Geofence.FenceType.POLYGONAL);
        
        // Test setting different fence types
        geofence.setFenceType(Geofence.FenceType.POLYGONAL);
        assertEquals(Geofence.FenceType.POLYGONAL, geofence.getFenceType());
    }

    @Test
    void testBoundaryTypeEnum() {
        assertEquals(2, Geofence.BoundaryType.values().length);
        
        assertNotNull(Geofence.BoundaryType.INCLUSION);
        assertNotNull(Geofence.BoundaryType.EXCLUSION);
        
        // Test setting different boundary types
        geofence.setBoundaryType(Geofence.BoundaryType.EXCLUSION);
        assertEquals(Geofence.BoundaryType.EXCLUSION, geofence.getBoundaryType());
    }

    @Test
    void testFenceStatusEnum() {
        assertEquals(4, Geofence.FenceStatus.values().length);
        
        assertNotNull(Geofence.FenceStatus.ACTIVE);
        assertNotNull(Geofence.FenceStatus.INACTIVE);
        assertNotNull(Geofence.FenceStatus.EXPIRED);
        assertNotNull(Geofence.FenceStatus.SUSPENDED);
        
        // Test setting different statuses
        geofence.setStatus(Geofence.FenceStatus.INACTIVE);
        assertEquals(Geofence.FenceStatus.INACTIVE, geofence.getStatus());
        
        geofence.setStatus(Geofence.FenceStatus.EXPIRED);
        assertEquals(Geofence.FenceStatus.EXPIRED, geofence.getStatus());
        
        geofence.setStatus(Geofence.FenceStatus.SUSPENDED);
        assertEquals(Geofence.FenceStatus.SUSPENDED, geofence.getStatus());
    }

    @Test
    void testCircularGeofenceProperties() {
        // Test valid circular geofence
        geofence.setFenceType(Geofence.FenceType.CIRCULAR);
        geofence.setCenterLatitude(0.0);
        geofence.setCenterLongitude(0.0);
        geofence.setRadiusMeters(500.0);
        
        assertEquals(0.0, geofence.getCenterLatitude());
        assertEquals(0.0, geofence.getCenterLongitude());
        assertEquals(500.0, geofence.getRadiusMeters());
        
        // Test boundary coordinates
        geofence.setCenterLatitude(90.0);
        geofence.setCenterLongitude(180.0);
        assertEquals(90.0, geofence.getCenterLatitude());
        assertEquals(180.0, geofence.getCenterLongitude());
        
        geofence.setCenterLatitude(-90.0);
        geofence.setCenterLongitude(-180.0);
        assertEquals(-90.0, geofence.getCenterLatitude());
        assertEquals(-180.0, geofence.getCenterLongitude());
    }

    @Test
    void testPolygonalGeofenceProperties() {
        geofence.setFenceType(Geofence.FenceType.POLYGONAL);
        
        // Test polygon coordinates as JSON string
        String polygonCoords = "[[40.7128,-74.0060],[40.7130,-74.0058],[40.7132,-74.0062],[40.7128,-74.0060]]";
        geofence.setPolygonCoordinates(polygonCoords);
        
        assertEquals(polygonCoords, geofence.getPolygonCoordinates());
        
        // Test null polygon coordinates
        geofence.setPolygonCoordinates(null);
        assertNull(geofence.getPolygonCoordinates());
        
        // Test empty polygon coordinates
        geofence.setPolygonCoordinates("");
        assertEquals("", geofence.getPolygonCoordinates());
    }

    @Test
    void testAltitudeConstraints() {
        // Test valid altitude range
        geofence.setMinAltitudeMeters(10.0);
        geofence.setMaxAltitudeMeters(200.0);
        
        assertEquals(10.0, geofence.getMinAltitudeMeters());
        assertEquals(200.0, geofence.getMaxAltitudeMeters());
        
        // Test zero altitudes
        geofence.setMinAltitudeMeters(0.0);
        geofence.setMaxAltitudeMeters(0.0);
        assertEquals(0.0, geofence.getMinAltitudeMeters());
        assertEquals(0.0, geofence.getMaxAltitudeMeters());
        
        // Test negative altitudes (below sea level)
        geofence.setMinAltitudeMeters(-10.0);
        assertEquals(-10.0, geofence.getMinAltitudeMeters());
        
        // Test null altitudes
        geofence.setMinAltitudeMeters(null);
        geofence.setMaxAltitudeMeters(null);
        assertNull(geofence.getMinAltitudeMeters());
        assertNull(geofence.getMaxAltitudeMeters());
    }

    @Test
    void testPriorityLevel() {
        // Test default priority
        assertEquals(1, geofence.getPriorityLevel());
        
        // Test different priority levels
        geofence.setPriorityLevel(5);
        assertEquals(5, geofence.getPriorityLevel());
        
        geofence.setPriorityLevel(0);
        assertEquals(0, geofence.getPriorityLevel());
        
        // Test negative priority (should be allowed)
        geofence.setPriorityLevel(-1);
        assertEquals(-1, geofence.getPriorityLevel());
        
        // Test high priority
        geofence.setPriorityLevel(100);
        assertEquals(100, geofence.getPriorityLevel());
    }

    @Test
    void testViolationActions() {
        String[] validActions = {"ALERT", "RETURN_TO_BASE", "LAND", "STOP", "REDIRECT"};
        
        for (String action : validActions) {
            geofence.setViolationAction(action);
            assertEquals(action, geofence.getViolationAction());
        }
        
        // Test null action
        geofence.setViolationAction(null);
        assertNull(geofence.getViolationAction());
        
        // Test empty action
        geofence.setViolationAction("");
        assertEquals("", geofence.getViolationAction());
    }

    @Test
    void testTimestampFields() {
        LocalDateTime now = LocalDateTime.now();
        
        geofence.setCreatedAt(now);
        geofence.setUpdatedAt(now);
        geofence.setActivatedAt(now);
        geofence.setExpiresAt(now.plusDays(30));
        
        assertEquals(now, geofence.getCreatedAt());
        assertEquals(now, geofence.getUpdatedAt());
        assertEquals(now, geofence.getActivatedAt());
        assertEquals(now.plusDays(30), geofence.getExpiresAt());
    }

    @Test
    void testGeofenceValidation() {
        // Test required fields
        assertNotNull(geofence.getName());
        assertNotNull(geofence.getFenceType());
        assertNotNull(geofence.getBoundaryType());
        assertNotNull(geofence.getStatus());
        
        // Test circular geofence validation
        geofence.setFenceType(Geofence.FenceType.CIRCULAR);
        assertNotNull(geofence.getCenterLatitude());
        assertNotNull(geofence.getCenterLongitude());
        assertNotNull(geofence.getRadiusMeters());
        assertTrue(geofence.getRadiusMeters() > 0);
    }

    @Test
    void testGeofenceRadius() {
        // Test valid radius values
        geofence.setRadiusMeters(1.0);
        assertEquals(1.0, geofence.getRadiusMeters());
        
        geofence.setRadiusMeters(10000.0);
        assertEquals(10000.0, geofence.getRadiusMeters());
        
        // Test zero radius
        geofence.setRadiusMeters(0.0);
        assertEquals(0.0, geofence.getRadiusMeters());
        
        // Test negative radius (should be handled by business logic)
        geofence.setRadiusMeters(-100.0);
        assertEquals(-100.0, geofence.getRadiusMeters());
        
        // Test null radius
        geofence.setRadiusMeters(null);
        assertNull(geofence.getRadiusMeters());
    }

    @Test
    void testGeofenceDescription() {
        // Test long description
        String longDescription = "A".repeat(1000);
        geofence.setDescription(longDescription);
        assertEquals(longDescription, geofence.getDescription());
        
        // Test special characters in description
        geofence.setDescription("Description with special chars: !@#$%^&*()");
        assertEquals("Description with special chars: !@#$%^&*()", geofence.getDescription());
        
        // Test null description
        geofence.setDescription(null);
        assertNull(geofence.getDescription());
    }

    @Test
    void testGeofenceActiveStatus() {
        // Test if geofence is considered active
        geofence.setStatus(Geofence.FenceStatus.ACTIVE);
        assertEquals(Geofence.FenceStatus.ACTIVE, geofence.getStatus());
        
        // Test inactive status
        geofence.setStatus(Geofence.FenceStatus.INACTIVE);
        assertEquals(Geofence.FenceStatus.INACTIVE, geofence.getStatus());
        
        // Test expired status
        geofence.setStatus(Geofence.FenceStatus.EXPIRED);
        assertEquals(Geofence.FenceStatus.EXPIRED, geofence.getStatus());
    }

    @Test
    void testGeofenceExpiration() {
        LocalDateTime future = LocalDateTime.now().plusDays(1);
        LocalDateTime past = LocalDateTime.now().minusDays(1);
        
        // Test future expiration
        geofence.setExpiresAt(future);
        assertEquals(future, geofence.getExpiresAt());
        
        // Test past expiration
        geofence.setExpiresAt(past);
        assertEquals(past, geofence.getExpiresAt());
        
        // Test null expiration (never expires)
        geofence.setExpiresAt(null);
        assertNull(geofence.getExpiresAt());
    }
}
