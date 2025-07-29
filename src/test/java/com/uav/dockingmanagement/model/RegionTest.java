package com.uav.dockingmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Region model
 */
@ExtendWith(MockitoExtension.class)
class RegionTest {

    private Region region;

    @BeforeEach
    void setUp() {
        region = new Region();
        region.setId(1);
        region.setRegionName("Test Region");
    }

    @Test
    void testRegionCreation() {
        assertNotNull(region);
        assertEquals(1, region.getId());
        assertEquals("Test Region", region.getRegionName());
    }

    @Test
    void testRegionConstructorWithName() {
        Region namedRegion = new Region("Named Region");
        assertNotNull(namedRegion);
        assertEquals("Named Region", namedRegion.getRegionName());
        assertEquals(0, namedRegion.getId()); // Default ID should be 0
    }

    @Test
    void testDefaultConstructor() {
        Region defaultRegion = new Region();
        assertNotNull(defaultRegion);
        assertEquals(0, defaultRegion.getId());
        assertNull(defaultRegion.getRegionName());
    }

    @Test
    void testSettersAndGetters() {
        region.setId(100);
        region.setRegionName("Updated Region");
        
        assertEquals(100, region.getId());
        assertEquals("Updated Region", region.getRegionName());
    }

    @Test
    void testToString() {
        assertEquals("Test Region", region.toString());
        
        // Test with null region name
        region.setRegionName(null);
        assertEquals("null", region.toString());
        
        // Test with empty region name
        region.setRegionName("");
        assertEquals("", region.toString());
    }

    @Test
    void testRegionNameValidation() {
        // Test valid region names
        region.setRegionName("North Zone");
        assertEquals("North Zone", region.getRegionName());
        
        region.setRegionName("Zone-1");
        assertEquals("Zone-1", region.getRegionName());
        
        region.setRegionName("Area_A");
        assertEquals("Area_A", region.getRegionName());
        
        // Test special characters
        region.setRegionName("Zone #1");
        assertEquals("Zone #1", region.getRegionName());
    }

    @Test
    void testRegionNameEdgeCases() {
        // Test very long name
        String longName = "A".repeat(1000);
        region.setRegionName(longName);
        assertEquals(longName, region.getRegionName());
        
        // Test single character
        region.setRegionName("A");
        assertEquals("A", region.getRegionName());
        
        // Test whitespace
        region.setRegionName("   ");
        assertEquals("   ", region.getRegionName());
        
        // Test with newlines and tabs
        region.setRegionName("Region\nWith\tSpecial\rChars");
        assertEquals("Region\nWith\tSpecial\rChars", region.getRegionName());
    }

    @Test
    void testIdBoundaryValues() {
        // Test minimum integer value
        region.setId(Integer.MIN_VALUE);
        assertEquals(Integer.MIN_VALUE, region.getId());
        
        // Test maximum integer value
        region.setId(Integer.MAX_VALUE);
        assertEquals(Integer.MAX_VALUE, region.getId());
        
        // Test zero
        region.setId(0);
        assertEquals(0, region.getId());
        
        // Test negative values
        region.setId(-1);
        assertEquals(-1, region.getId());
    }

    @Test
    void testEqualsAndHashCode() {
        Region region1 = new Region("Test Region");
        region1.setId(1);
        
        Region region2 = new Region("Test Region");
        region2.setId(1);
        
        Region region3 = new Region("Different Region");
        region3.setId(1);
        
        Region region4 = new Region("Test Region");
        region4.setId(2);
        
        // Note: The Region class doesn't override equals/hashCode, 
        // so this tests the default Object behavior
        assertNotEquals(region1, region2); // Different objects
        assertNotEquals(region1.hashCode(), region2.hashCode());
        
        // Test same object
        assertEquals(region1, region1);
        assertEquals(region1.hashCode(), region1.hashCode());
    }

    @Test
    void testRegionImmutabilityAfterCreation() {
        Region originalRegion = new Region("Original");
        originalRegion.setId(1);
        
        String originalName = originalRegion.getRegionName();
        int originalId = originalRegion.getId();
        
        // Modify the region
        originalRegion.setRegionName("Modified");
        originalRegion.setId(2);
        
        // Verify changes took effect (Region is mutable)
        assertNotEquals(originalName, originalRegion.getRegionName());
        assertNotEquals(originalId, originalRegion.getId());
        assertEquals("Modified", originalRegion.getRegionName());
        assertEquals(2, originalRegion.getId());
    }

    @Test
    void testRegionNameWithUnicodeCharacters() {
        // Test Unicode characters
        region.setRegionName("区域测试");
        assertEquals("区域测试", region.getRegionName());
        
        region.setRegionName("Région française");
        assertEquals("Région française", region.getRegionName());
        
        region.setRegionName("Зона тестирования");
        assertEquals("Зона тестирования", region.getRegionName());
        
        // Test emojis
        region.setRegionName("Zone 🚁");
        assertEquals("Zone 🚁", region.getRegionName());
    }

    @Test
    void testRegionBusinessLogic() {
        // Test that region can be used in business logic
        assertTrue(region.getRegionName().contains("Test"));
        assertTrue(region.getRegionName().length() > 0);
        
        // Test case sensitivity
        assertFalse(region.getRegionName().equals("test region"));
        assertTrue(region.getRegionName().equals("Test Region"));
    }

    @Test
    void testRegionNameTrimming() {
        // The Region class doesn't automatically trim, so test as-is behavior
        region.setRegionName("  Spaced Region  ");
        assertEquals("  Spaced Region  ", region.getRegionName());
        
        // If we wanted to test trimmed behavior, we'd need to implement it
        String trimmedName = region.getRegionName().trim();
        assertEquals("Spaced Region", trimmedName);
    }

    @Test
    void testRegionForDatabaseConstraints() {
        // Test typical database scenarios
        
        // Test null name (should be handled by database constraints)
        region.setRegionName(null);
        assertNull(region.getRegionName());
        
        // Test empty string
        region.setRegionName("");
        assertEquals("", region.getRegionName());
        
        // Test typical region names that might be used in the system
        String[] validRegionNames = {
            "Warehouse A", "Loading Dock", "Maintenance Bay", 
            "Restricted Zone", "Public Area", "Emergency Landing"
        };
        
        for (String name : validRegionNames) {
            region.setRegionName(name);
            assertEquals(name, region.getRegionName());
            assertNotNull(region.toString());
        }
    }
}
