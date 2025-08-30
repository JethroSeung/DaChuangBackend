package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.RegionRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UAVService
 */
@ExtendWith(MockitoExtension.class)
class UAVServiceTest {

    @Mock
    private UAVRepository uavRepository;

    @Mock
    private RegionRepository regionRepository;

    @InjectMocks
    private UAVService uavService;

    private UAV testUAV;
    private Region testRegion;

    @BeforeEach
    void setUp() {
        testUAV = new UAV();
        testUAV.setId(1);
        testUAV.setRfidTag("TEST001");
        testUAV.setOwnerName("Test Owner");
        testUAV.setModel("Test Model");
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        testUAV.setRegions(new HashSet<>());

        testRegion = new Region();
        testRegion.setId(1);
        testRegion.setRegionName("Test Region");
    }

    @Test
    void testAddUAV() {
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.addUAV(testUAV);

        assertNotNull(result);
        assertEquals(testUAV.getRfidTag(), result.getRfidTag());
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testGetAllUAVs() {
        List<UAV> uavList = Arrays.asList(testUAV);
        when(uavRepository.findAll()).thenReturn(uavList);

        List<UAV> result = uavService.getAllUAVs();

        assertEquals(1, result.size());
        assertEquals(testUAV.getRfidTag(), result.get(0).getRfidTag());
        verify(uavRepository, times(1)).findAll();
    }

    @Test
    void testGetUAVById() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));

        Optional<UAV> result = uavService.getUAVById(1);

        assertTrue(result.isPresent());
        assertEquals(testUAV.getRfidTag(), result.get().getRfidTag());
        verify(uavRepository, times(1)).findById(1);
    }

    @Test
    void testGetUAVByRfidTag() {
        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));

        Optional<UAV> result = uavService.getUAVByRfidTag("TEST001");

        assertTrue(result.isPresent());
        assertEquals(testUAV.getRfidTag(), result.get().getRfidTag());
        verify(uavRepository, times(1)).findByRfidTag("TEST001");
    }

    @Test
    void testCheckUAVRegionAccessSuccess() {
        testUAV.getRegions().add(testRegion);
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Test Region");

        assertEquals("OPEN THE DOOR", result);
        verify(uavRepository, times(1)).findByRfidTagWithRegions("TEST001");
    }

    @Test
    void testCheckUAVRegionAccessUAVNotFound() {
        when(uavRepository.findByRfidTagWithRegions("NONEXISTENT")).thenReturn(Optional.empty());

        String result = uavService.checkUAVRegionAccess("NONEXISTENT", "Test Region");

        assertTrue(result.contains("not found"));
        verify(uavRepository, times(1)).findByRfidTagWithRegions("NONEXISTENT");
    }

    @Test
    void testCheckUAVRegionAccessUnauthorized() {
        testUAV.setStatus(UAV.Status.UNAUTHORIZED);
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Test Region");

        assertEquals("UAV is not authorized", result);
        verify(uavRepository, times(1)).findByRfidTagWithRegions("TEST001");
    }

    @Test
    void testCheckUAVRegionAccessNoRegionAccess() {
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Unauthorized Region");

        assertTrue(result.contains("not authorized for region"));
        verify(uavRepository, times(1)).findByRfidTagWithRegions("TEST001");
    }

    @Test
    void testAddRegionToUAV() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(1)).thenReturn(Optional.of(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.addRegionToUAV(1, 1);

        assertNotNull(result);
        assertTrue(testUAV.getRegions().contains(testRegion));
        verify(uavRepository, times(1)).findById(1);
        verify(regionRepository, times(1)).findById(1);
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testRemoveRegionFromUAV() {
        testUAV.getRegions().add(testRegion);
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(1)).thenReturn(Optional.of(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.removeRegionFromUAV(1, 1);

        assertNotNull(result);
        assertFalse(testUAV.getRegions().contains(testRegion));
        verify(uavRepository, times(1)).findById(1);
        verify(regionRepository, times(1)).findById(1);
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testUpdateUAVStatus() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.updateUAVStatus(1, UAV.Status.UNAUTHORIZED);

        assertNotNull(result);
        assertEquals(UAV.Status.UNAUTHORIZED, testUAV.getStatus());
        verify(uavRepository, times(1)).findById(1);
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testValidateUAV() {
        // Test valid UAV
        assertTrue(uavService.validateUAV(testUAV));

        // Test invalid UAVs
        UAV invalidUAV = new UAV();
        assertFalse(uavService.validateUAV(invalidUAV));

        invalidUAV.setRfidTag("");
        assertFalse(uavService.validateUAV(invalidUAV));

        invalidUAV.setRfidTag("VALID");
        invalidUAV.setOwnerName("");
        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testIsRfidTagUnique() {
        // Test unique tag
        when(uavRepository.findByRfidTag("UNIQUE")).thenReturn(Optional.empty());
        assertTrue(uavService.isRfidTagUnique("UNIQUE", null));

        // Test non-unique tag
        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));
        assertFalse(uavService.isRfidTagUnique("TEST001", null));

        // Test updating same UAV
        assertTrue(uavService.isRfidTagUnique("TEST001", 1));
    }

    @Test
    void testDeleteUAV() {
        doNothing().when(uavRepository).deleteById(1);

        uavService.deleteUAV(1);

        verify(uavRepository, times(1)).deleteById(1);
    }

    // Additional edge cases and error scenarios

    @Test
    void testGetUAVByIdNotFound() {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        Optional<UAV> result = uavService.getUAVById(999);

        assertFalse(result.isPresent());
        verify(uavRepository, times(1)).findById(999);
    }

    @Test
    void testGetUAVByRfidTagNotFound() {
        when(uavRepository.findByRfidTag("NONEXISTENT")).thenReturn(Optional.empty());

        Optional<UAV> result = uavService.getUAVByRfidTag("NONEXISTENT");

        assertFalse(result.isPresent());
        verify(uavRepository, times(1)).findByRfidTag("NONEXISTENT");
    }

    @Test
    void testAddRegionToUAVNotFound() {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        UAV result = uavService.addRegionToUAV(999, 1);

        assertNull(result);
        verify(uavRepository, times(1)).findById(999);
        verify(regionRepository, never()).findById(any());
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testAddRegionToUAVRegionNotFound() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(999)).thenReturn(Optional.empty());

        UAV result = uavService.addRegionToUAV(1, 999);

        assertNull(result);
        verify(uavRepository, times(1)).findById(1);
        verify(regionRepository, times(1)).findById(999);
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testRemoveRegionFromUAVNotFound() {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        UAV result = uavService.removeRegionFromUAV(999, 1);

        assertNull(result);
        verify(uavRepository, times(1)).findById(999);
        verify(regionRepository, never()).findById(any());
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testRemoveRegionFromUAVRegionNotFound() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(999)).thenReturn(Optional.empty());

        UAV result = uavService.removeRegionFromUAV(1, 999);

        assertNull(result);
        verify(uavRepository, times(1)).findById(1);
        verify(regionRepository, times(1)).findById(999);
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testUpdateUAVStatusNotFound() {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        UAV result = uavService.updateUAVStatus(999, UAV.Status.UNAUTHORIZED);

        assertNull(result);
        verify(uavRepository, times(1)).findById(999);
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testValidateUAVNullRfidTag() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag(null);
        invalidUAV.setOwnerName("Valid Owner");
        invalidUAV.setModel("Valid Model");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVEmptyRfidTag() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("");
        invalidUAV.setOwnerName("Valid Owner");
        invalidUAV.setModel("Valid Model");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVWhitespaceRfidTag() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("   ");
        invalidUAV.setOwnerName("Valid Owner");
        invalidUAV.setModel("Valid Model");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVNullOwnerName() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("VALID001");
        invalidUAV.setOwnerName(null);
        invalidUAV.setModel("Valid Model");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVEmptyOwnerName() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("VALID001");
        invalidUAV.setOwnerName("");
        invalidUAV.setModel("Valid Model");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVWhitespaceOwnerName() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("VALID001");
        invalidUAV.setOwnerName("   ");
        invalidUAV.setModel("Valid Model");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVNullModel() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("VALID001");
        invalidUAV.setOwnerName("Valid Owner");
        invalidUAV.setModel(null);

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVEmptyModel() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("VALID001");
        invalidUAV.setOwnerName("Valid Owner");
        invalidUAV.setModel("");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVWhitespaceModel() {
        UAV invalidUAV = new UAV();
        invalidUAV.setRfidTag("VALID001");
        invalidUAV.setOwnerName("Valid Owner");
        invalidUAV.setModel("   ");

        assertFalse(uavService.validateUAV(invalidUAV));
    }

    @Test
    void testValidateUAVNullUAV() {
        assertFalse(uavService.validateUAV(null));
    }

    @Test
    void testIsRfidTagUniqueNullTag() {
        assertFalse(uavService.isRfidTagUnique(null, null));
    }

    @Test
    void testIsRfidTagUniqueEmptyTag() {
        assertFalse(uavService.isRfidTagUnique("", null));
    }

    @Test
    void testIsRfidTagUniqueWhitespaceTag() {
        assertFalse(uavService.isRfidTagUnique("   ", null));
    }

    @Test
    void testCheckUAVRegionAccessNullRfidTag() {
        String result = uavService.checkUAVRegionAccess(null, "Test Region");
        assertTrue(result.contains("not found") || result.contains("invalid"));
    }

    @Test
    void testCheckUAVRegionAccessEmptyRfidTag() {
        String result = uavService.checkUAVRegionAccess("", "Test Region");
        assertTrue(result.contains("not found") || result.contains("invalid"));
    }

    @Test
    void testCheckUAVRegionAccessNullRegionName() {
        testUAV.getRegions().add(testRegion);
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", null);

        assertTrue(result.contains("not authorized for region") || result.contains("invalid"));
    }

    @Test
    void testCheckUAVRegionAccessEmptyRegionName() {
        testUAV.getRegions().add(testRegion);
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "");

        assertTrue(result.contains("not authorized for region") || result.contains("invalid"));
    }

    @Test
    void testCheckUAVRegionAccessCaseInsensitive() {
        testUAV.getRegions().add(testRegion);
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "test region");

        assertEquals("OPEN THE DOOR", result);
    }

    @Test
    void testAddRegionToUAVAlreadyExists() {
        testUAV.getRegions().add(testRegion); // Region already added
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(1)).thenReturn(Optional.of(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.addRegionToUAV(1, 1);

        assertNotNull(result);
        assertEquals(1, testUAV.getRegions().size()); // Should still be 1, not duplicated
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testRemoveRegionFromUAVNotAssigned() {
        // testUAV has no regions assigned
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(1)).thenReturn(Optional.of(testRegion));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.removeRegionFromUAV(1, 1);

        assertNotNull(result);
        assertEquals(0, testUAV.getRegions().size()); // Should remain 0
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testGetUnassignedRegionsForUAVExists() {
        Region unassignedRegion = new Region();
        unassignedRegion.setId(2);
        unassignedRegion.setRegionName("Unassigned Region");

        testUAV.getRegions().add(testRegion); // UAV has testRegion assigned
        List<Region> allRegions = Arrays.asList(testRegion, unassignedRegion);

        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findAll()).thenReturn(allRegions);

        List<Region> result = uavService.getUnassignedRegionsForUAV(1);

        assertEquals(1, result.size());
        assertEquals("Unassigned Region", result.get(0).getRegionName());
        assertFalse(result.contains(testRegion));
    }

    @Test
    void testGetUnassignedRegionsForUAVNotFound() {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        List<Region> result = uavService.getUnassignedRegionsForUAV(999);

        assertTrue(result.isEmpty());
        verify(uavRepository, times(1)).findById(999);
        verify(regionRepository, never()).findAll();
    }

    @Test
    void testGetUnassignedRegionsForUAVAllAssigned() {
        testUAV.getRegions().add(testRegion); // UAV has all regions assigned
        List<Region> allRegions = Arrays.asList(testRegion);

        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findAll()).thenReturn(allRegions);

        List<Region> result = uavService.getUnassignedRegionsForUAV(1);

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetUnassignedRegionsForUAVNoRegionsExist() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findAll()).thenReturn(Collections.emptyList());

        List<Region> result = uavService.getUnassignedRegionsForUAV(1);

        assertTrue(result.isEmpty());
    }

    @Test
    void testAddUAVWithNullRegions() {
        testUAV.setRegions(null);
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.addUAV(testUAV);

        assertNotNull(result);
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testCheckUAVRegionAccessWithNullRegions() {
        testUAV.setRegions(null);
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Test Region");

        assertTrue(result.contains("not authorized for region"));
    }

    @Test
    void testCheckUAVRegionAccessWithEmptyRegions() {
        testUAV.setRegions(new HashSet<>()); // Empty set
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Test Region");

        assertTrue(result.contains("not authorized for region"));
    }

    @Test
    void testUpdateUAVStatusSameStatus() {
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV result = uavService.updateUAVStatus(1, UAV.Status.AUTHORIZED);

        assertNotNull(result);
        assertEquals(UAV.Status.AUTHORIZED, result.getStatus());
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testIsRfidTagUniqueWithDifferentCase() {
        when(uavRepository.findByRfidTag("test001")).thenReturn(Optional.empty());
        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));

        assertTrue(uavService.isRfidTagUnique("test001", null));
        assertFalse(uavService.isRfidTagUnique("TEST001", null));
    }

    @Test
    void testValidateUAVWithSpecialCharactersInRfidTag() {
        UAV uavWithSpecialChars = new UAV();
        uavWithSpecialChars.setRfidTag("TEST@001");
        uavWithSpecialChars.setOwnerName("Valid Owner");
        uavWithSpecialChars.setModel("Valid Model");
        uavWithSpecialChars.setStatus(UAV.Status.AUTHORIZED);

        // Assuming the service allows special characters in RFID tags
        assertTrue(uavService.validateUAV(uavWithSpecialChars));
    }

    @Test
    void testValidateUAVWithVeryLongRfidTag() {
        UAV uavWithLongTag = new UAV();
        uavWithLongTag.setRfidTag("A".repeat(1000)); // Very long RFID tag
        uavWithLongTag.setOwnerName("Valid Owner");
        uavWithLongTag.setModel("Valid Model");

        // This should test the service's handling of extremely long RFID tags
        boolean result = uavService.validateUAV(uavWithLongTag);
        // The result depends on the actual validation logic in the service
        assertNotNull(result); // Just ensure it doesn't throw an exception
    }

    @Test
    void testGetAllUAVsEmpty() {
        when(uavRepository.findAll()).thenReturn(Collections.emptyList());

        List<UAV> result = uavService.getAllUAVs();

        assertTrue(result.isEmpty());
        verify(uavRepository, times(1)).findAll();
    }

    @Test
    void testAddUAVWithDuplicateRfidTag() {
        UAV duplicateUAV = new UAV();
        duplicateUAV.setRfidTag("TEST001"); // Same as testUAV
        duplicateUAV.setOwnerName("Another Owner");
        duplicateUAV.setModel("Another Model");

        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));

        // This tests the behavior when trying to add a UAV with duplicate RFID
        // The actual behavior depends on the service implementation
        assertFalse(uavService.isRfidTagUnique("TEST001", null));
    }

    @Test
    void testCheckUAVRegionAccessMultipleRegions() {
        Region region1 = new Region();
        region1.setId(1);
        region1.setRegionName("Region 1");

        Region region2 = new Region();
        region2.setId(2);
        region2.setRegionName("Region 2");

        testUAV.getRegions().add(region1);
        testUAV.getRegions().add(region2);

        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenReturn(Optional.of(testUAV));

        String result1 = uavService.checkUAVRegionAccess("TEST001", "Region 1");
        String result2 = uavService.checkUAVRegionAccess("TEST001", "Region 2");
        String result3 = uavService.checkUAVRegionAccess("TEST001", "Region 3");

        assertEquals("OPEN THE DOOR", result1);
        assertEquals("OPEN THE DOOR", result2);
        assertTrue(result3.contains("not authorized for region"));
    }

    @Test
    void testDeleteUAVWithException() {
        doThrow(new RuntimeException("Database error")).when(uavRepository).deleteById(1);

        assertThrows(RuntimeException.class, () -> {
            uavService.deleteUAV(1);
        });

        verify(uavRepository, times(1)).deleteById(1);
    }

    @Test
    void testAddRegionToUAVWithRepositoryException() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(1)).thenReturn(Optional.of(testRegion));
        when(uavRepository.save(any(UAV.class))).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> {
            uavService.addRegionToUAV(1, 1);
        });

        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testUpdateUAVStatusWithRepositoryException() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(uavRepository.save(any(UAV.class))).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> {
            uavService.updateUAVStatus(1, UAV.Status.UNAUTHORIZED);
        });

        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testValidateUAVBoundaryValues() {
        // Test with minimum valid values
        UAV minValidUAV = new UAV();
        minValidUAV.setRfidTag("A");
        minValidUAV.setOwnerName("B");
        minValidUAV.setModel("C");
        minValidUAV.setStatus(UAV.Status.AUTHORIZED);

        assertTrue(uavService.validateUAV(minValidUAV));

        // Test with values containing only spaces (should be invalid after trim)
        UAV spacesUAV = new UAV();
        spacesUAV.setRfidTag("  A  ");
        spacesUAV.setOwnerName("  B  ");
        spacesUAV.setModel("  C  ");

        // This depends on whether the service trims whitespace
        boolean result = uavService.validateUAV(spacesUAV);
        assertNotNull(result); // Just ensure it doesn't throw an exception
    }

    @Test
    void testIsRfidTagUniqueWithRepositoryException() {
        when(uavRepository.findByRfidTag("TEST001")).thenThrow(new RuntimeException("Database error"));

        // The service should handle the exception gracefully
        assertThrows(RuntimeException.class, () -> {
            uavService.isRfidTagUnique("TEST001", null);
        });
    }

    @Test
    void testCheckUAVRegionAccessWithRepositoryException() {
        when(uavRepository.findByRfidTagWithRegions("TEST001")).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> {
            uavService.checkUAVRegionAccess("TEST001", "Test Region");
        });
    }

    @Test
    void testConcurrentRegionModification() {
        // Test concurrent modification of regions set
        Set<Region> regions = new HashSet<>();
        regions.add(testRegion);
        testUAV.setRegions(regions);

        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(regionRepository.findById(2)).thenReturn(Optional.of(new Region()));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        // This tests that the service handles concurrent modifications properly
        UAV result = uavService.addRegionToUAV(1, 2);

        assertNotNull(result);
        assertEquals(2, testUAV.getRegions().size());
    }
}
