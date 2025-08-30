package com.uav.dockingmanagement.model;

import com.uav.dockingmanagement.repository.UAVRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for HibernatePod
 */
@ExtendWith(MockitoExtension.class)
class HibernatePodTest {

    @Mock
    private UAVRepository uavRepository;

    private HibernatePod hibernatePod;
    private UAV testUAV1;
    private UAV testUAV2;

    @BeforeEach
    void setUp() {
        hibernatePod = new HibernatePod();

        testUAV1 = new UAV();
        testUAV1.setId(1);
        testUAV1.setRfidTag("TEST001");
        testUAV1.setInHibernatePod(false);

        testUAV2 = new UAV();
        testUAV2.setId(2);
        testUAV2.setRfidTag("TEST002");
        testUAV2.setInHibernatePod(false);
    }

    @Test
    void testAddUAVToHibernatePod() {
        assertTrue(hibernatePod.addUAV(testUAV1));
        assertTrue(testUAV1.isInHibernatePod());
        assertEquals(1, hibernatePod.getCurrentCapacity());
        assertTrue(hibernatePod.containsUAV(testUAV1));
    }

    @Test
    void testRemoveUAVFromHibernatePod() {
        hibernatePod.addUAV(testUAV1);
        hibernatePod.removeUAV(testUAV1);

        assertFalse(testUAV1.isInHibernatePod());
        assertEquals(0, hibernatePod.getCurrentCapacity());
        assertFalse(hibernatePod.containsUAV(testUAV1));
    }

    @Test
    void testHibernatePodCapacity() {
        assertEquals(5, hibernatePod.getMaxCapacity());
        assertEquals(0, hibernatePod.getCurrentCapacity());
        assertEquals(5, hibernatePod.getAvailableCapacity());
        assertFalse(hibernatePod.isFull());
    }

    @Test
    void testHibernatePodFull() {
        // Add UAVs until full
        for (int i = 0; i < 5; i++) {
            UAV uav = new UAV();
            uav.setId(i + 1);
            uav.setRfidTag("TEST" + (i + 1));
            assertTrue(hibernatePod.addUAV(uav));
        }

        assertTrue(hibernatePod.isFull());
        assertEquals(5, hibernatePod.getCurrentCapacity());
        assertEquals(0, hibernatePod.getAvailableCapacity());

        // Try to add one more UAV (should fail)
        UAV extraUAV = new UAV();
        extraUAV.setId(6);
        extraUAV.setRfidTag("EXTRA");
        assertFalse(hibernatePod.addUAV(extraUAV));
        assertFalse(extraUAV.isInHibernatePod());
    }

    @Test
    void testGetUAVs() {
        hibernatePod.addUAV(testUAV1);
        hibernatePod.addUAV(testUAV2);

        assertEquals(2, hibernatePod.getUAVs().size());
        assertTrue(hibernatePod.getUAVs().contains(testUAV1));
        assertTrue(hibernatePod.getUAVs().contains(testUAV2));

        // Ensure returned set is a copy (cannot be modified externally)
        hibernatePod.getUAVs().clear();
        assertEquals(2, hibernatePod.getCurrentCapacity());
    }

    @Test
    void testInitializeFromDatabase() {
        // Mock UAVs in database marked as in hibernate pod
        UAV hibernatingUAV1 = new UAV();
        hibernatingUAV1.setId(1);
        hibernatingUAV1.setRfidTag("HIBER001");
        hibernatingUAV1.setInHibernatePod(true);

        UAV hibernatingUAV2 = new UAV();
        hibernatingUAV2.setId(2);
        hibernatingUAV2.setRfidTag("HIBER002");
        hibernatingUAV2.setInHibernatePod(true);

        // Create a new hibernate pod with mocked repository
        HibernatePod newHibernatePod = new HibernatePod();

        // Simulate the initialization process
        newHibernatePod.addUAV(hibernatingUAV1);
        newHibernatePod.addUAV(hibernatingUAV2);

        assertEquals(2, newHibernatePod.getCurrentCapacity());
        assertTrue(newHibernatePod.containsUAV(hibernatingUAV1));
        assertTrue(newHibernatePod.containsUAV(hibernatingUAV2));
    }

    @Test
    void testCapacityOverflowHandling() {
        // Test scenario where database has more hibernating UAVs than capacity
        HibernatePod newHibernatePod = new HibernatePod();

        // Add 6 UAVs (more than capacity of 5)
        for (int i = 0; i < 6; i++) {
            UAV uav = new UAV();
            uav.setId(i + 1);
            uav.setRfidTag("OVERFLOW" + (i + 1));

            if (i < 5) {
                assertTrue(newHibernatePod.addUAV(uav));
            } else {
                assertFalse(newHibernatePod.addUAV(uav));
            }
        }

        assertEquals(5, newHibernatePod.getCurrentCapacity());
        assertTrue(newHibernatePod.isFull());
    }

    @Test
    void testMultipleOperations() {
        // Add some UAVs
        hibernatePod.addUAV(testUAV1);
        hibernatePod.addUAV(testUAV2);
        assertEquals(2, hibernatePod.getCurrentCapacity());

        // Remove one
        hibernatePod.removeUAV(testUAV1);
        assertEquals(1, hibernatePod.getCurrentCapacity());
        assertFalse(hibernatePod.containsUAV(testUAV1));
        assertTrue(hibernatePod.containsUAV(testUAV2));

        // Add it back
        hibernatePod.addUAV(testUAV1);
        assertEquals(2, hibernatePod.getCurrentCapacity());
        assertTrue(hibernatePod.containsUAV(testUAV1));

        // Remove all
        hibernatePod.removeUAV(testUAV1);
        hibernatePod.removeUAV(testUAV2);
        assertEquals(0, hibernatePod.getCurrentCapacity());
        assertFalse(hibernatePod.isFull());
        assertEquals(5, hibernatePod.getAvailableCapacity());
    }
}
