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
import org.springframework.cache.CacheManager;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RegionService
 */
@ExtendWith(MockitoExtension.class)
class RegionServiceTest {

    @Mock
    private RegionRepository regionRepository;

    @Mock
    private UAVRepository uavRepository;

    @Mock
    private CacheManager cacheManager;

    @InjectMocks
    private RegionService regionService;

    private Region testRegion;
    private UAV testUAV;

    @BeforeEach
    void setUp() {
        testRegion = new Region();
        testRegion.setId(1);
        testRegion.setRegionName("Test Region");

        testUAV = new UAV();
        testUAV.setId(1);
        testUAV.setRfidTag("TEST001");
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        testUAV.setRegions(new HashSet<>());
    }

    @Test
    void testGetAllRegions() {
        List<Region> regions = Arrays.asList(testRegion);
        when(regionRepository.findAll()).thenReturn(regions);

        List<Region> result = regionService.getAllRegions();

        assertEquals(1, result.size());
        assertEquals(testRegion, result.get(0));
        verify(regionRepository, times(1)).findAll();
    }

    @Test
    void testGetRegionById() {
        when(regionRepository.findById(1)).thenReturn(Optional.of(testRegion));

        Optional<Region> result = regionService.getRegionById(1);

        assertTrue(result.isPresent());
        assertEquals(testRegion, result.get());
        verify(regionRepository, times(1)).findById(1);
    }

    @Test
    void testGetRegionByIdNotFound() {
        when(regionRepository.findById(999)).thenReturn(Optional.empty());

        Optional<Region> result = regionService.getRegionById(999);

        assertFalse(result.isPresent());
        verify(regionRepository, times(1)).findById(999);
    }

    @Test
    void testCreateRegion() {
        when(regionRepository.save(any(Region.class))).thenReturn(testRegion);

        Region result = regionService.createRegion("Test Region");

        assertNotNull(result);
        assertEquals("Test Region", result.getRegionName());
        verify(regionRepository, times(1)).save(any(Region.class));
    }

    @Test
    void testUpdateRegion() {
        when(regionRepository.findById(1)).thenReturn(Optional.of(testRegion));
        when(regionRepository.save(any(Region.class))).thenReturn(testRegion);

        testRegion.setRegionName("Updated Region");
        Region result = regionService.updateRegion(1, testRegion);

        assertNotNull(result);
        assertEquals("Updated Region", result.getRegionName());
        verify(regionRepository, times(1)).findById(1);
        verify(regionRepository, times(1)).save(testRegion);
    }

    @Test
    void testUpdateRegionNotFound() {
        when(regionRepository.findById(999)).thenReturn(Optional.empty());

        Region result = regionService.updateRegion(999, testRegion);

        assertNull(result);
        verify(regionRepository, times(1)).findById(999);
        verify(regionRepository, never()).save(any());
    }

    @Test
    void testDeleteRegion() {
        doNothing().when(regionRepository).deleteById(1);

        regionService.deleteRegion(1);

        verify(regionRepository, times(1)).deleteById(1);
    }

    @Test
    void testGetUAVsByRegion() {
        List<UAV> uavs = Arrays.asList(testUAV);
        when(uavRepository.findByRegionId(1)).thenReturn(uavs);

        List<UAV> result = regionService.getUAVsByRegion(1);

        assertEquals(1, result.size());
        assertEquals(testUAV, result.get(0));
        verify(uavRepository, times(1)).findByRegionId(1);
    }

    @Test
    void testGetUAVsByRegionWithFallback() {
        // Simulate exception in primary method, should use fallback
        when(uavRepository.findByRegionId(1)).thenThrow(new RuntimeException("Database error"));
        
        testUAV.getRegions().add(testRegion);
        List<UAV> allUAVs = Arrays.asList(testUAV);
        when(uavRepository.findAllWithRegions()).thenReturn(allUAVs);

        List<UAV> result = regionService.getUAVsByRegion(1);

        assertEquals(1, result.size());
        assertEquals(testUAV, result.get(0));
        verify(uavRepository, times(1)).findByRegionId(1);
        verify(uavRepository, times(1)).findAllWithRegions();
    }

    @Test
    void testGetUAVsByRegionEmpty() {
        when(uavRepository.findByRegionId(1)).thenReturn(Collections.emptyList());

        List<UAV> result = regionService.getUAVsByRegion(1);

        assertTrue(result.isEmpty());
        verify(uavRepository, times(1)).findByRegionId(1);
    }

    @Test
    void testGetRegionByName() {
        when(regionRepository.findByRegionName("Test Region")).thenReturn(Optional.of(testRegion));

        Optional<Region> result = regionService.getRegionByName("Test Region");

        assertTrue(result.isPresent());
        assertEquals(testRegion, result.get());
        verify(regionRepository, times(1)).findByRegionName("Test Region");
    }

    @Test
    void testGetRegionByNameNotFound() {
        when(regionRepository.findByRegionName("Nonexistent Region")).thenReturn(Optional.empty());

        Optional<Region> result = regionService.getRegionByName("Nonexistent Region");

        assertFalse(result.isPresent());
        verify(regionRepository, times(1)).findByRegionName("Nonexistent Region");
    }

    @Test
    void testGetRegionByNameCaseInsensitive() {
        when(regionRepository.findByRegionNameIgnoreCase("test region")).thenReturn(Optional.of(testRegion));

        Optional<Region> result = regionService.getRegionByNameIgnoreCase("test region");

        assertTrue(result.isPresent());
        assertEquals(testRegion, result.get());
        verify(regionRepository, times(1)).findByRegionNameIgnoreCase("test region");
    }

    @Test
    void testValidateRegionName() {
        // Test valid region names
        assertTrue(regionService.validateRegionName("Valid Region"));
        assertTrue(regionService.validateRegionName("Zone-1"));
        assertTrue(regionService.validateRegionName("Area_A"));
        assertTrue(regionService.validateRegionName("123"));

        // Test invalid region names
        assertFalse(regionService.validateRegionName(null));
        assertFalse(regionService.validateRegionName(""));
        assertFalse(regionService.validateRegionName("   "));
    }

    @Test
    void testIsRegionNameUnique() {
        // Test unique name
        when(regionRepository.findByRegionName("Unique Region")).thenReturn(Optional.empty());
        assertTrue(regionService.isRegionNameUnique("Unique Region", null));

        // Test non-unique name
        when(regionRepository.findByRegionName("Test Region")).thenReturn(Optional.of(testRegion));
        assertFalse(regionService.isRegionNameUnique("Test Region", null));

        // Test updating same region
        assertTrue(regionService.isRegionNameUnique("Test Region", 1));
    }

    @Test
    void testGetRegionStatistics() {
        when(regionRepository.count()).thenReturn(5L);
        when(uavRepository.count()).thenReturn(10L);

        Map<String, Object> result = regionService.getRegionStatistics();

        assertNotNull(result);
        assertEquals(5L, result.get("totalRegions"));
        assertEquals(10L, result.get("totalUAVs"));
        assertNotNull(result.get("timestamp"));
        
        verify(regionRepository, times(1)).count();
        verify(uavRepository, times(1)).count();
    }

    @Test
    void testSearchRegions() {
        List<Region> regions = Arrays.asList(testRegion);
        when(regionRepository.findByRegionNameContainingIgnoreCase("test")).thenReturn(regions);

        List<Region> result = regionService.searchRegions("test");

        assertEquals(1, result.size());
        assertEquals(testRegion, result.get(0));
        verify(regionRepository, times(1)).findByRegionNameContainingIgnoreCase("test");
    }

    @Test
    void testSearchRegionsEmpty() {
        when(regionRepository.findByRegionNameContainingIgnoreCase("nonexistent")).thenReturn(Collections.emptyList());

        List<Region> result = regionService.searchRegions("nonexistent");

        assertTrue(result.isEmpty());
        verify(regionRepository, times(1)).findByRegionNameContainingIgnoreCase("nonexistent");
    }

    @Test
    void testSearchRegionsNullQuery() {
        List<Region> allRegions = Arrays.asList(testRegion);
        when(regionRepository.findAll()).thenReturn(allRegions);

        List<Region> result = regionService.searchRegions(null);

        assertEquals(1, result.size());
        verify(regionRepository, times(1)).findAll();
    }

    @Test
    void testSearchRegionsEmptyQuery() {
        List<Region> allRegions = Arrays.asList(testRegion);
        when(regionRepository.findAll()).thenReturn(allRegions);

        List<Region> result = regionService.searchRegions("");

        assertEquals(1, result.size());
        verify(regionRepository, times(1)).findAll();
    }

    @Test
    void testGetRegionsWithUAVCount() {
        testUAV.getRegions().add(testRegion);
        List<UAV> uavs = Arrays.asList(testUAV);
        when(uavRepository.findByRegionId(1)).thenReturn(uavs);
        when(regionRepository.findAll()).thenReturn(Arrays.asList(testRegion));

        List<Map<String, Object>> result = regionService.getRegionsWithUAVCount();

        assertNotNull(result);
        assertEquals(1, result.size());
        
        Map<String, Object> regionData = result.get(0);
        assertEquals(1, regionData.get("id"));
        assertEquals("Test Region", regionData.get("name"));
        assertEquals(1, regionData.get("uavCount"));
        
        verify(regionRepository, times(1)).findAll();
        verify(uavRepository, times(1)).findByRegionId(1);
    }

    @Test
    void testGetRegionsWithUAVCountEmpty() {
        when(regionRepository.findAll()).thenReturn(Collections.emptyList());

        List<Map<String, Object>> result = regionService.getRegionsWithUAVCount();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(regionRepository, times(1)).findAll();
    }

    @Test
    void testCreateRegionWithValidation() {
        when(regionRepository.findByRegionName("Valid Region")).thenReturn(Optional.empty());
        when(regionRepository.save(any(Region.class))).thenReturn(testRegion);

        Region result = regionService.createRegionWithValidation("Valid Region");

        assertNotNull(result);
        verify(regionRepository, times(1)).findByRegionName("Valid Region");
        verify(regionRepository, times(1)).save(any(Region.class));
    }

    @Test
    void testCreateRegionWithValidationDuplicate() {
        when(regionRepository.findByRegionName("Test Region")).thenReturn(Optional.of(testRegion));

        assertThrows(IllegalArgumentException.class, () -> {
            regionService.createRegionWithValidation("Test Region");
        });

        verify(regionRepository, times(1)).findByRegionName("Test Region");
        verify(regionRepository, never()).save(any());
    }

    @Test
    void testCreateRegionWithValidationInvalidName() {
        assertThrows(IllegalArgumentException.class, () -> {
            regionService.createRegionWithValidation(null);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            regionService.createRegionWithValidation("");
        });

        assertThrows(IllegalArgumentException.class, () -> {
            regionService.createRegionWithValidation("   ");
        });

        verify(regionRepository, never()).save(any());
    }

    @Test
    void testBulkCreateRegions() {
        List<String> regionNames = Arrays.asList("Region 1", "Region 2", "Region 3");
        when(regionRepository.findByRegionName(anyString())).thenReturn(Optional.empty());
        when(regionRepository.save(any(Region.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Region> result = regionService.bulkCreateRegions(regionNames);

        assertEquals(3, result.size());
        verify(regionRepository, times(3)).findByRegionName(anyString());
        verify(regionRepository, times(3)).save(any(Region.class));
    }

    @Test
    void testBulkCreateRegionsWithDuplicates() {
        List<String> regionNames = Arrays.asList("Region 1", "Test Region", "Region 3");
        when(regionRepository.findByRegionName("Region 1")).thenReturn(Optional.empty());
        when(regionRepository.findByRegionName("Test Region")).thenReturn(Optional.of(testRegion));
        when(regionRepository.findByRegionName("Region 3")).thenReturn(Optional.empty());
        when(regionRepository.save(any(Region.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Region> result = regionService.bulkCreateRegions(regionNames);

        assertEquals(2, result.size()); // Only non-duplicates should be created
        verify(regionRepository, times(3)).findByRegionName(anyString());
        verify(regionRepository, times(2)).save(any(Region.class));
    }


}
