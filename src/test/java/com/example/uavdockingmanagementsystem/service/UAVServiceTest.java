package com.example.uavdockingmanagementsystem.service;

import com.example.uavdockingmanagementsystem.model.Region;
import com.example.uavdockingmanagementsystem.model.UAV;
import com.example.uavdockingmanagementsystem.repository.RegionRepository;
import com.example.uavdockingmanagementsystem.repository.UAVRepository;
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
        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Test Region");

        assertEquals("OPEN THE DOOR", result);
        verify(uavRepository, times(1)).findByRfidTag("TEST001");
    }

    @Test
    void testCheckUAVRegionAccessUAVNotFound() {
        when(uavRepository.findByRfidTag("NONEXISTENT")).thenReturn(Optional.empty());

        String result = uavService.checkUAVRegionAccess("NONEXISTENT", "Test Region");

        assertTrue(result.contains("not found"));
        verify(uavRepository, times(1)).findByRfidTag("NONEXISTENT");
    }

    @Test
    void testCheckUAVRegionAccessUnauthorized() {
        testUAV.setStatus(UAV.Status.UNAUTHORIZED);
        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Test Region");

        assertEquals("UAV is not authorized", result);
        verify(uavRepository, times(1)).findByRfidTag("TEST001");
    }

    @Test
    void testCheckUAVRegionAccessNoRegionAccess() {
        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));

        String result = uavService.checkUAVRegionAccess("TEST001", "Unauthorized Region");

        assertTrue(result.contains("not authorized for region"));
        verify(uavRepository, times(1)).findByRfidTag("TEST001");
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
}
