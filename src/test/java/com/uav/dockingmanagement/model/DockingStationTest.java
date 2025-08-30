package com.uav.dockingmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for DockingStation model
 */
@ExtendWith(MockitoExtension.class)
class DockingStationTest {

    private DockingStation dockingStation;

    @BeforeEach
    void setUp() {
        dockingStation = new DockingStation();
        dockingStation.setName("Test Station");
        dockingStation.setDescription("Test Description");
        dockingStation.setLatitude(40.7128);
        dockingStation.setLongitude(-74.0060);
        dockingStation.setAltitudeMeters(10.0);
        dockingStation.setMaxCapacity(5);
        dockingStation.setCurrentOccupancy(2);
        dockingStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        dockingStation.setStationType(DockingStation.StationType.STANDARD);
        dockingStation.setChargingAvailable(true);
        dockingStation.setMaintenanceAvailable(false);
        dockingStation.setWeatherProtected(true);
        dockingStation.setSecurityLevel("MEDIUM");
        dockingStation.setContactInfo("test@example.com");
    }

    @Test
    void testDockingStationCreation() {
        assertNotNull(dockingStation);
        assertEquals("Test Station", dockingStation.getName());
        assertEquals("Test Description", dockingStation.getDescription());
        assertEquals(40.7128, dockingStation.getLatitude());
        assertEquals(-74.0060, dockingStation.getLongitude());
        assertEquals(10.0, dockingStation.getAltitudeMeters());
        assertEquals(5, dockingStation.getMaxCapacity());
        assertEquals(2, dockingStation.getCurrentOccupancy());
        assertEquals(DockingStation.StationStatus.OPERATIONAL, dockingStation.getStatus());
        assertEquals(DockingStation.StationType.STANDARD, dockingStation.getStationType());
        assertTrue(dockingStation.getChargingAvailable());
        assertFalse(dockingStation.getMaintenanceAvailable());
        assertTrue(dockingStation.getWeatherProtected());
        assertEquals("MEDIUM", dockingStation.getSecurityLevel());
        assertEquals("test@example.com", dockingStation.getContactInfo());
    }

    @Test
    void testIsAvailable() {
        // Test available station
        assertTrue(dockingStation.isAvailable());

        // Test full station
        dockingStation.setCurrentOccupancy(5);
        assertFalse(dockingStation.isAvailable());

        // Test non-operational station
        dockingStation.setCurrentOccupancy(2);
        dockingStation.setStatus(DockingStation.StationStatus.MAINTENANCE);
        assertFalse(dockingStation.isAvailable());

        // Test offline station
        dockingStation.setStatus(DockingStation.StationStatus.OFFLINE);
        assertFalse(dockingStation.isAvailable());
    }

    @Test
    void testIsFull() {
        assertFalse(dockingStation.isFull());

        dockingStation.setCurrentOccupancy(5);
        assertTrue(dockingStation.isFull());

        dockingStation.setCurrentOccupancy(6); // Over capacity
        assertTrue(dockingStation.isFull());
    }

    @Test
    void testGetOccupancyPercentage() {
        assertEquals(40.0, dockingStation.getOccupancyPercentage(), 0.01);

        dockingStation.setCurrentOccupancy(5);
        assertEquals(100.0, dockingStation.getOccupancyPercentage(), 0.01);

        dockingStation.setCurrentOccupancy(0);
        assertEquals(0.0, dockingStation.getOccupancyPercentage(), 0.01);

        // Test with zero max capacity
        dockingStation.setMaxCapacity(0);
        assertEquals(0.0, dockingStation.getOccupancyPercentage(), 0.01);
    }

    @Test
    void testNeedsMaintenance() {
        // No maintenance due date set
        assertFalse(dockingStation.needsMaintenance());

        // Future maintenance date
        dockingStation.setNextMaintenanceDue(LocalDateTime.now().plusDays(1));
        assertFalse(dockingStation.needsMaintenance());

        // Past maintenance date
        dockingStation.setNextMaintenanceDue(LocalDateTime.now().minusDays(1));
        assertTrue(dockingStation.needsMaintenance());

        // Exactly now (should be true)
        dockingStation.setNextMaintenanceDue(LocalDateTime.now().minusSeconds(1));
        assertTrue(dockingStation.needsMaintenance());
    }

    @Test
    void testStationStatusEnum() {
        // Test all status values
        assertEquals(5, DockingStation.StationStatus.values().length);

        assertNotNull(DockingStation.StationStatus.OPERATIONAL);
        assertNotNull(DockingStation.StationStatus.MAINTENANCE);
        assertNotNull(DockingStation.StationStatus.OUT_OF_SERVICE);
        assertNotNull(DockingStation.StationStatus.EMERGENCY);
        assertNotNull(DockingStation.StationStatus.OFFLINE);
    }

    @Test
    void testStationTypeEnum() {
        // Test all type values
        assertEquals(5, DockingStation.StationType.values().length);

        assertNotNull(DockingStation.StationType.STANDARD);
        assertNotNull(DockingStation.StationType.CHARGING);
        assertNotNull(DockingStation.StationType.MAINTENANCE);
        assertNotNull(DockingStation.StationType.EMERGENCY);
        assertNotNull(DockingStation.StationType.TEMPORARY);
    }

    @Test
    void testDefaultValues() {
        DockingStation newStation = new DockingStation();

        assertEquals(0, newStation.getCurrentOccupancy());
        assertEquals(DockingStation.StationStatus.OPERATIONAL, newStation.getStatus());
        assertEquals(DockingStation.StationType.STANDARD, newStation.getStationType());
        assertTrue(newStation.getChargingAvailable());
        assertFalse(newStation.getMaintenanceAvailable());
        assertFalse(newStation.getWeatherProtected());
    }

    @Test
    void testCapacityValidation() {
        // Test negative occupancy
        dockingStation.setCurrentOccupancy(-1);
        assertEquals(-1, dockingStation.getCurrentOccupancy());
        assertFalse(dockingStation.isAvailable()); // Should handle gracefully

        // Test negative max capacity
        dockingStation.setMaxCapacity(-1);
        dockingStation.setCurrentOccupancy(0);
        assertFalse(dockingStation.isAvailable());
    }

    @Test
    void testNullCapacityHandling() {
        // Test null max capacity
        dockingStation.setMaxCapacity(null);
        dockingStation.setCurrentOccupancy(0);
        assertFalse(dockingStation.isAvailable()); // Should handle null gracefully
        assertFalse(dockingStation.isFull()); // Should handle null gracefully
        assertEquals(0.0, dockingStation.getOccupancyPercentage()); // Should return 0 for null

        // Test null current occupancy
        dockingStation.setMaxCapacity(5);
        dockingStation.setCurrentOccupancy(null);
        assertFalse(dockingStation.isAvailable()); // Should handle null gracefully
        assertFalse(dockingStation.isFull()); // Should handle null gracefully
        assertEquals(0.0, dockingStation.getOccupancyPercentage()); // Should return 0 for null

        // Test both null
        dockingStation.setMaxCapacity(null);
        dockingStation.setCurrentOccupancy(null);
        assertFalse(dockingStation.isAvailable()); // Should handle null gracefully
        assertFalse(dockingStation.isFull()); // Should handle null gracefully
        assertEquals(0.0, dockingStation.getOccupancyPercentage()); // Should return 0 for null
    }

    @Test
    void testLocationData() {
        // Test valid coordinates
        dockingStation.setLatitude(90.0);
        dockingStation.setLongitude(180.0);
        assertEquals(90.0, dockingStation.getLatitude());
        assertEquals(180.0, dockingStation.getLongitude());

        // Test boundary values
        dockingStation.setLatitude(-90.0);
        dockingStation.setLongitude(-180.0);
        assertEquals(-90.0, dockingStation.getLatitude());
        assertEquals(-180.0, dockingStation.getLongitude());
    }

    @Test
    void testTimestampFields() {
        DockingStation newStation = new DockingStation();

        // Created and updated timestamps should be null initially
        assertNull(newStation.getCreatedAt());
        assertNull(newStation.getUpdatedAt());

        // Test setting timestamps
        LocalDateTime now = LocalDateTime.now();
        newStation.setCreatedAt(now);
        newStation.setUpdatedAt(now);

        assertEquals(now, newStation.getCreatedAt());
        assertEquals(now, newStation.getUpdatedAt());
    }

    @Test
    void testMaintenanceFields() {
        LocalDateTime lastMaintenance = LocalDateTime.now().minusDays(30);
        LocalDateTime nextMaintenance = LocalDateTime.now().plusDays(30);

        dockingStation.setLastMaintenanceDate(lastMaintenance);
        dockingStation.setNextMaintenanceDue(nextMaintenance);

        assertEquals(lastMaintenance, dockingStation.getLastMaintenanceDate());
        assertEquals(nextMaintenance, dockingStation.getNextMaintenanceDue());
        assertFalse(dockingStation.needsMaintenance());
    }

    @Test
    void testOperationalHours() {
        dockingStation.setOperationalHours("24/7");
        assertEquals("24/7", dockingStation.getOperationalHours());

        dockingStation.setOperationalHours("06:00-22:00");
        assertEquals("06:00-22:00", dockingStation.getOperationalHours());
    }

    @Test
    void testStationFeatures() {
        // Test charging capability
        dockingStation.setChargingAvailable(false);
        assertFalse(dockingStation.getChargingAvailable());

        // Test maintenance capability
        dockingStation.setMaintenanceAvailable(true);
        assertTrue(dockingStation.getMaintenanceAvailable());

        // Test weather protection
        dockingStation.setWeatherProtected(false);
        assertFalse(dockingStation.getWeatherProtected());
    }

    @Test
    void testSecurityAndContact() {
        dockingStation.setSecurityLevel("HIGH");
        assertEquals("HIGH", dockingStation.getSecurityLevel());

        dockingStation.setContactInfo("admin@station.com");
        assertEquals("admin@station.com", dockingStation.getContactInfo());

        // Test null values
        dockingStation.setSecurityLevel(null);
        assertNull(dockingStation.getSecurityLevel());

        dockingStation.setContactInfo(null);
        assertNull(dockingStation.getContactInfo());
    }
}
