package com.uav.dockingmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for BatteryStatus model
 */
@ExtendWith(MockitoExtension.class)
class BatteryStatusTest {

    private BatteryStatus batteryStatus;
    private UAV testUAV;

    @BeforeEach
    void setUp() {
        testUAV = new UAV();
        testUAV.setId(1);
        testUAV.setRfidTag("TEST001");
        
        batteryStatus = new BatteryStatus();
        batteryStatus.setId(1L);
        batteryStatus.setUav(testUAV);
        batteryStatus.setCurrentChargePercentage(75);
        batteryStatus.setVoltage(12.6);
        batteryStatus.setCurrentAmperage(2.5);
        batteryStatus.setTemperatureCelsius(25.0);
        batteryStatus.setCycleCount(150);
        batteryStatus.setHealthPercentage(95);
        batteryStatus.setIsCharging(false);
        batteryStatus.setLastUpdated(LocalDateTime.now());
    }

    @Test
    void testBatteryStatusCreation() {
        assertNotNull(batteryStatus);
        assertEquals(1L, batteryStatus.getId());
        assertEquals(testUAV, batteryStatus.getUav());
        assertEquals(75, batteryStatus.getCurrentChargePercentage());
        assertEquals(12.6, batteryStatus.getVoltage());
        assertEquals(2.5, batteryStatus.getCurrentAmperage());
        assertEquals(25.0, batteryStatus.getTemperatureCelsius());
        assertEquals(150, batteryStatus.getCycleCount());
        assertEquals(95, batteryStatus.getHealthPercentage());
        assertFalse(batteryStatus.getIsCharging());
        assertNotNull(batteryStatus.getLastUpdated());
    }

    @Test
    void testDefaultValues() {
        BatteryStatus newBatteryStatus = new BatteryStatus();
        
        assertNull(newBatteryStatus.getId());
        assertNull(newBatteryStatus.getUav());
        assertNull(newBatteryStatus.getCurrentChargePercentage());
        assertNull(newBatteryStatus.getVoltage());
        assertNull(newBatteryStatus.getCurrentAmperage());
        assertNull(newBatteryStatus.getTemperatureCelsius());
        assertNull(newBatteryStatus.getCycleCount());
        assertNull(newBatteryStatus.getHealthPercentage());
        assertNull(newBatteryStatus.getIsCharging());
        assertNull(newBatteryStatus.getLastUpdated());
    }

    @Test
    void testChargePercentageBoundaries() {
        // Test valid charge percentages
        batteryStatus.setCurrentChargePercentage(0);
        assertEquals(0, batteryStatus.getCurrentChargePercentage());

        batteryStatus.setCurrentChargePercentage(100);
        assertEquals(100, batteryStatus.getCurrentChargePercentage());

        batteryStatus.setCurrentChargePercentage(50);
        assertEquals(50, batteryStatus.getCurrentChargePercentage());

        // Test edge cases (should be handled by business logic)
        batteryStatus.setCurrentChargePercentage(-10);
        assertEquals(-10, batteryStatus.getCurrentChargePercentage());

        batteryStatus.setCurrentChargePercentage(110);
        assertEquals(110, batteryStatus.getCurrentChargePercentage());
        
        // Test null
        batteryStatus.setCurrentChargePercentage(null);
        assertNull(batteryStatus.getCurrentChargePercentage());
    }

    @Test
    void testIsLowBattery() {
        // Test low battery detection
        batteryStatus.setCurrentChargePercentage(15);
        assertTrue(batteryStatus.isLowBattery());

        batteryStatus.setCurrentChargePercentage(20);
        assertFalse(batteryStatus.isLowBattery());

        batteryStatus.setCurrentChargePercentage(10);
        assertTrue(batteryStatus.isLowBattery());

        batteryStatus.setCurrentChargePercentage(0);
        assertTrue(batteryStatus.isLowBattery());
        
        // Test null charge percentage
        batteryStatus.setCurrentChargePercentage(null);
        assertFalse(batteryStatus.isLowBattery()); // Should handle null gracefully
    }

    @Test
    void testIsCriticalBattery() {
        // Test critical battery detection
        batteryStatus.setCurrentChargePercentage(5);
        assertTrue(batteryStatus.isCriticalBattery());

        batteryStatus.setCurrentChargePercentage(10);
        assertFalse(batteryStatus.isCriticalBattery());

        batteryStatus.setCurrentChargePercentage(0);
        assertTrue(batteryStatus.isCriticalBattery());
        
        batteryStatus.setCurrentChargePercentage(3); // Changed from 2.5 to 3 (Integer)
        assertTrue(batteryStatus.isCriticalBattery());
        
        // Test null charge percentage
        batteryStatus.setCurrentChargePercentage(null);
        assertFalse(batteryStatus.isCriticalBattery()); // Should handle null gracefully
    }

    @Test
    void testVoltageValues() {
        // Test typical voltage values for UAV batteries
        batteryStatus.setVoltage(11.1); // 3S LiPo nominal
        assertEquals(11.1, batteryStatus.getVoltage());
        
        batteryStatus.setVoltage(14.8); // 4S LiPo nominal
        assertEquals(14.8, batteryStatus.getVoltage());
        
        batteryStatus.setVoltage(22.2); // 6S LiPo nominal
        assertEquals(22.2, batteryStatus.getVoltage());
        
        // Test edge cases
        batteryStatus.setVoltage(0.0);
        assertEquals(0.0, batteryStatus.getVoltage());
        
        batteryStatus.setVoltage(-1.0);
        assertEquals(-1.0, batteryStatus.getVoltage());
        
        // Test null
        batteryStatus.setVoltage(null);
        assertNull(batteryStatus.getVoltage());
    }

    @Test
    void testCurrentValues() {
        // Test positive current (discharging)
        batteryStatus.setCurrentAmperage(5.0);
        assertEquals(5.0, batteryStatus.getCurrentAmperage());

        // Test negative current (charging)
        batteryStatus.setCurrentAmperage(-2.0);
        assertEquals(-2.0, batteryStatus.getCurrentAmperage());

        // Test zero current (idle)
        batteryStatus.setCurrentAmperage(0.0);
        assertEquals(0.0, batteryStatus.getCurrentAmperage());

        // Test null
        batteryStatus.setCurrentAmperage(null);
        assertNull(batteryStatus.getCurrentAmperage());
    }

    @Test
    void testTemperatureValues() {
        // Test normal operating temperatures
        batteryStatus.setTemperatureCelsius(20.0);
        assertEquals(20.0, batteryStatus.getTemperatureCelsius());
        
        batteryStatus.setTemperatureCelsius(35.0);
        assertEquals(35.0, batteryStatus.getTemperatureCelsius());
        
        // Test extreme temperatures
        batteryStatus.setTemperatureCelsius(-10.0);
        assertEquals(-10.0, batteryStatus.getTemperatureCelsius());
        
        batteryStatus.setTemperatureCelsius(60.0);
        assertEquals(60.0, batteryStatus.getTemperatureCelsius());
        
        // Test null
        batteryStatus.setTemperatureCelsius(null);
        assertNull(batteryStatus.getTemperatureCelsius());
    }

    @Test
    void testChargeCycles() {
        // Test typical charge cycle values
        batteryStatus.setCycleCount(0);
        assertEquals(0, batteryStatus.getCycleCount());

        batteryStatus.setCycleCount(500);
        assertEquals(500, batteryStatus.getCycleCount());

        batteryStatus.setCycleCount(1000);
        assertEquals(1000, batteryStatus.getCycleCount());

        // Test negative cycles (should be handled by business logic)
        batteryStatus.setCycleCount(-1);
        assertEquals(-1, batteryStatus.getCycleCount());

        // Test null
        batteryStatus.setCycleCount(null);
        assertNull(batteryStatus.getCycleCount());
    }

    @Test
    void testHealthPercentage() {
        // Test valid health percentages
        batteryStatus.setHealthPercentage(100);
        assertEquals(100, batteryStatus.getHealthPercentage());

        batteryStatus.setHealthPercentage(80);
        assertEquals(80, batteryStatus.getHealthPercentage());

        batteryStatus.setHealthPercentage(50);
        assertEquals(50, batteryStatus.getHealthPercentage());

        // Test edge cases
        batteryStatus.setHealthPercentage(0);
        assertEquals(0, batteryStatus.getHealthPercentage());

        batteryStatus.setHealthPercentage(110);
        assertEquals(110, batteryStatus.getHealthPercentage());
        
        // Test null
        batteryStatus.setHealthPercentage(null);
        assertNull(batteryStatus.getHealthPercentage());
    }

    @Test
    void testChargingStatus() {
        // Test charging states
        batteryStatus.setIsCharging(true);
        assertTrue(batteryStatus.getIsCharging());
        
        batteryStatus.setIsCharging(false);
        assertFalse(batteryStatus.getIsCharging());
        
        // Test null
        batteryStatus.setIsCharging(null);
        assertNull(batteryStatus.getIsCharging());
    }

    @Test
    void testLastUpdatedTimestamp() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime past = LocalDateTime.now().minusHours(1);
        LocalDateTime future = LocalDateTime.now().plusHours(1);
        
        batteryStatus.setLastUpdated(now);
        assertEquals(now, batteryStatus.getLastUpdated());
        
        batteryStatus.setLastUpdated(past);
        assertEquals(past, batteryStatus.getLastUpdated());
        
        batteryStatus.setLastUpdated(future);
        assertEquals(future, batteryStatus.getLastUpdated());
        
        batteryStatus.setLastUpdated(null);
        assertNull(batteryStatus.getLastUpdated());
    }

    @Test
    void testUAVRelationship() {
        // Test UAV relationship
        assertNotNull(batteryStatus.getUav());
        assertEquals(testUAV, batteryStatus.getUav());
        assertEquals("TEST001", batteryStatus.getUav().getRfidTag());
        
        // Test changing UAV
        UAV newUAV = new UAV();
        newUAV.setId(2);
        newUAV.setRfidTag("TEST002");
        
        batteryStatus.setUav(newUAV);
        assertEquals(newUAV, batteryStatus.getUav());
        assertEquals("TEST002", batteryStatus.getUav().getRfidTag());
        
        // Test null UAV
        batteryStatus.setUav(null);
        assertNull(batteryStatus.getUav());
    }

    @Test
    void testBatteryStatusBusinessLogic() {
        // Test battery status combinations
        batteryStatus.setCurrentChargePercentage(10);
        batteryStatus.setIsCharging(true);
        assertTrue(batteryStatus.isLowBattery());
        assertTrue(batteryStatus.getIsCharging());

        // Test critical battery while charging
        batteryStatus.setCurrentChargePercentage(3);
        batteryStatus.setIsCharging(true);
        assertTrue(batteryStatus.isCriticalBattery());
        assertTrue(batteryStatus.getIsCharging());

        // Test full battery not charging
        batteryStatus.setCurrentChargePercentage(100);
        batteryStatus.setIsCharging(false);
        assertFalse(batteryStatus.isLowBattery());
        assertFalse(batteryStatus.isCriticalBattery());
        assertFalse(batteryStatus.getIsCharging());
    }

    @Test
    void testBatteryAging() {
        // Test battery degradation over time
        batteryStatus.setCycleCount(0);
        batteryStatus.setHealthPercentage(100);
        assertEquals(0, batteryStatus.getCycleCount());
        assertEquals(100, batteryStatus.getHealthPercentage());

        // Simulate aging
        batteryStatus.setCycleCount(500);
        batteryStatus.setHealthPercentage(85);
        assertEquals(500, batteryStatus.getCycleCount());
        assertEquals(85, batteryStatus.getHealthPercentage());

        // Simulate heavy aging
        batteryStatus.setCycleCount(1000);
        batteryStatus.setHealthPercentage(70);
        assertEquals(1000, batteryStatus.getCycleCount());
        assertEquals(70, batteryStatus.getHealthPercentage());
    }

    @Test
    void testBatteryTemperatureEffects() {
        // Test normal temperature
        batteryStatus.setTemperatureCelsius(25.0);
        batteryStatus.setCurrentChargePercentage(80);
        assertEquals(25.0, batteryStatus.getTemperatureCelsius());
        assertEquals(80, batteryStatus.getCurrentChargePercentage());
        
        // Test high temperature (could affect performance)
        batteryStatus.setTemperatureCelsius(45.0);
        assertEquals(45.0, batteryStatus.getTemperatureCelsius());
        
        // Test low temperature (could affect performance)
        batteryStatus.setTemperatureCelsius(0.0);
        assertEquals(0.0, batteryStatus.getTemperatureCelsius());
    }
}
