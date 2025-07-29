package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import com.uav.dockingmanagement.model.HibernatePod;
import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.RegionRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.service.UAVService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for UAVRestController
 */
@WebMvcTest(UAVRestController.class)
@ActiveProfiles("test")
@Import(TestRateLimitingConfig.class)
class UAVRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UAVRepository uavRepository;

    @MockBean
    private RegionRepository regionRepository;

    @MockBean
    private UAVService uavService;

    @MockBean
    private HibernatePod hibernatePod;

    @Autowired
    private ObjectMapper objectMapper;

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
    void testGetAllUAVs() throws Exception {
        List<UAV> uavs = Arrays.asList(testUAV);
        when(uavRepository.findAllWithRegions()).thenReturn(uavs);

        mockMvc.perform(get("/api/uav/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].rfidTag").value("TEST001"))
                .andExpect(jsonPath("$[0].ownerName").value("Test Owner"));

        verify(uavRepository, times(1)).findAllWithRegions();
    }

    @Test
    void testGetAllUAVsEmpty() throws Exception {
        when(uavRepository.findAllWithRegions()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/uav/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(uavRepository, times(1)).findAllWithRegions();
    }

    @Test
    void testToggleUAVStatus() throws Exception {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        mockMvc.perform(post("/api/uav/1/toggle-status"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("UAV status updated successfully"))
                .andExpect(jsonPath("$.oldStatus").value("AUTHORIZED"))
                .andExpect(jsonPath("$.newStatus").value("UNAUTHORIZED"));

        verify(uavRepository, times(1)).findById(1);
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testToggleUAVStatusNotFound() throws Exception {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/uav/999/toggle-status"))
                .andExpect(status().isNotFound());

        verify(uavRepository, times(1)).findById(999);
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testAddRegionToUAV() throws Exception {
        when(uavService.addRegionToUAV(1, 1)).thenReturn(testUAV);

        mockMvc.perform(post("/api/uav/1/regions/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Region added to UAV successfully"));

        verify(uavService, times(1)).addRegionToUAV(1, 1);
    }

    @Test
    void testAddRegionToUAVFailure() throws Exception {
        when(uavService.addRegionToUAV(1, 999)).thenReturn(null);

        mockMvc.perform(post("/api/uav/1/regions/999"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to add region to UAV"));

        verify(uavService, times(1)).addRegionToUAV(1, 999);
    }

    @Test
    void testRemoveRegionFromUAV() throws Exception {
        when(uavService.removeRegionFromUAV(1, 1)).thenReturn(testUAV);

        mockMvc.perform(delete("/api/uav/1/regions/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Region removed from UAV successfully"));

        verify(uavService, times(1)).removeRegionFromUAV(1, 1);
    }

    @Test
    void testRemoveRegionFromUAVFailure() throws Exception {
        when(uavService.removeRegionFromUAV(1, 999)).thenReturn(null);

        mockMvc.perform(delete("/api/uav/1/regions/999"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to remove region from UAV"));

        verify(uavService, times(1)).removeRegionFromUAV(1, 999);
    }

    @Test
    void testGetUAVRegions() throws Exception {
        testUAV.getRegions().add(testRegion);
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));

        mockMvc.perform(get("/api/uav/1/regions"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].regionName").value("Test Region"));

        verify(uavRepository, times(1)).findById(1);
    }

    @Test
    void testGetUAVRegionsNotFound() throws Exception {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/uav/999/regions"))
                .andExpect(status().isNotFound());

        verify(uavRepository, times(1)).findById(999);
    }

    @Test
    void testGetAvailableRegions() throws Exception {
        List<Region> availableRegions = Arrays.asList(testRegion);
        when(uavService.getUnassignedRegionsForUAV(1)).thenReturn(availableRegions);

        mockMvc.perform(get("/api/uav/1/available-regions"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].regionName").value("Test Region"));

        verify(uavService, times(1)).getUnassignedRegionsForUAV(1);
    }

    @Test
    void testValidateRfidTag() throws Exception {
        when(uavRepository.findByRfidTag("UNIQUE001")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/uav/validate-rfid/UNIQUE001"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.isUnique").value(true))
                .andExpect(jsonPath("$.message").value("RFID tag is available"));

        verify(uavRepository, times(1)).findByRfidTag("UNIQUE001");
    }

    @Test
    void testValidateRfidTagNotUnique() throws Exception {
        when(uavRepository.findByRfidTag("TEST001")).thenReturn(Optional.of(testUAV));

        mockMvc.perform(get("/api/uav/validate-rfid/TEST001"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.isUnique").value(false))
                .andExpect(jsonPath("$.message").value("RFID tag is already in use"));

        verify(uavRepository, times(1)).findByRfidTag("TEST001");
    }

    @Test
    void testGetUAVsByStatus() throws Exception {
        List<UAV> authorizedUAVs = Arrays.asList(testUAV);
        when(uavService.getUAVsByStatus(UAV.Status.AUTHORIZED)).thenReturn(authorizedUAVs);

        mockMvc.perform(get("/api/uav/status/AUTHORIZED"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("AUTHORIZED"));

        verify(uavService, times(1)).getUAVsByStatus(UAV.Status.AUTHORIZED);
    }

    @Test
    void testGetUAVsByStatusInvalid() throws Exception {
        mockMvc.perform(get("/api/uav/status/INVALID"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateUAV() throws Exception {
        when(uavService.validateUAV(any(UAV.class))).thenReturn(true);
        when(uavService.isRfidTagUnique("NEW001", null)).thenReturn(true);
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV newUAV = new UAV();
        newUAV.setRfidTag("NEW001");
        newUAV.setOwnerName("New Owner");
        newUAV.setModel("New Model");
        newUAV.setStatus(UAV.Status.AUTHORIZED);

        String uavJson = objectMapper.writeValueAsString(newUAV);

        mockMvc.perform(post("/api/uav")
                .contentType(MediaType.APPLICATION_JSON)
                .content(uavJson))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("UAV created successfully"));

        verify(uavService, times(1)).validateUAV(any(UAV.class));
        verify(uavService, times(1)).isRfidTagUnique("NEW001", null);
        verify(uavRepository, times(1)).save(any(UAV.class));
    }

    @Test
    void testCreateUAVInvalidData() throws Exception {
        when(uavService.validateUAV(any(UAV.class))).thenReturn(false);

        UAV invalidUAV = new UAV();
        // Missing required fields

        String uavJson = objectMapper.writeValueAsString(invalidUAV);

        mockMvc.perform(post("/api/uav")
                .contentType(MediaType.APPLICATION_JSON)
                .content(uavJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid UAV data"));

        verify(uavService, times(1)).validateUAV(any(UAV.class));
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testCreateUAVDuplicateRfid() throws Exception {
        when(uavService.validateUAV(any(UAV.class))).thenReturn(true);
        when(uavService.isRfidTagUnique("TEST001", null)).thenReturn(false);

        UAV duplicateUAV = new UAV();
        duplicateUAV.setRfidTag("TEST001");
        duplicateUAV.setOwnerName("Duplicate Owner");
        duplicateUAV.setModel("Duplicate Model");
        duplicateUAV.setStatus(UAV.Status.AUTHORIZED);

        String uavJson = objectMapper.writeValueAsString(duplicateUAV);

        mockMvc.perform(post("/api/uav")
                .contentType(MediaType.APPLICATION_JSON)
                .content(uavJson))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("RFID tag already exists"));

        verify(uavService, times(1)).validateUAV(any(UAV.class));
        verify(uavService, times(1)).isRfidTagUnique("TEST001", null);
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testUpdateUAV() throws Exception {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(uavService.validateUAV(any(UAV.class))).thenReturn(true);
        when(uavService.isRfidTagUnique("UPDATED001", 1)).thenReturn(true);
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        UAV updatedUAV = new UAV();
        updatedUAV.setRfidTag("UPDATED001");
        updatedUAV.setOwnerName("Updated Owner");
        updatedUAV.setModel("Updated Model");
        updatedUAV.setStatus(UAV.Status.AUTHORIZED);

        String uavJson = objectMapper.writeValueAsString(updatedUAV);

        mockMvc.perform(put("/api/uav/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(uavJson))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("UAV updated successfully"));

        verify(uavRepository, times(1)).findById(1);
        verify(uavService, times(1)).validateUAV(any(UAV.class));
        verify(uavService, times(1)).isRfidTagUnique("UPDATED001", 1);
        verify(uavRepository, times(1)).save(any(UAV.class));
    }

    @Test
    void testUpdateUAVNotFound() throws Exception {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        UAV updatedUAV = new UAV();
        updatedUAV.setRfidTag("UPDATED001");
        updatedUAV.setOwnerName("Updated Owner");
        updatedUAV.setModel("Updated Model");
        updatedUAV.setStatus(UAV.Status.AUTHORIZED);

        String uavJson = objectMapper.writeValueAsString(updatedUAV);

        mockMvc.perform(put("/api/uav/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(uavJson))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("UAV not found"));

        verify(uavRepository, times(1)).findById(999);
        verify(uavRepository, never()).save(any());
    }

    @Test
    void testDeleteUAV() throws Exception {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        doNothing().when(uavService).deleteUAV(1);

        mockMvc.perform(delete("/api/uav/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("UAV deleted successfully"));

        verify(uavRepository, times(1)).findById(1);
        verify(uavService, times(1)).deleteUAV(1);
    }

    @Test
    void testDeleteUAVNotFound() throws Exception {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/uav/999"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("UAV not found"));

        verify(uavRepository, times(1)).findById(999);
        verify(uavService, never()).deleteUAV(anyInt());
    }
}
