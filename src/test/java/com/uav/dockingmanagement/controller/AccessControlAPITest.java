package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import com.uav.dockingmanagement.config.TestSecurityConfig;
import com.uav.dockingmanagement.config.TestWebConfig;
import com.uav.dockingmanagement.service.UAVService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for AccessControlAPI
 */
@WebMvcTest(AccessControlAPI.class)
@ActiveProfiles("test")
@Import({TestRateLimitingConfig.class, TestSecurityConfig.class, TestWebConfig.class})
class AccessControlAPITest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UAVService uavService;

    @Test
    void testValidateAccessSuccess() throws Exception {
        when(uavService.checkUAVRegionAccess("TEST001", "Test Region"))
                .thenReturn("OPEN THE DOOR");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", "Test Region")
                .accept(MediaType.TEXT_PLAIN))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string("OPEN THE DOOR"));

        verify(uavService, times(1)).checkUAVRegionAccess("TEST001", "Test Region");
    }

    @Test
    void testValidateAccessUAVNotFound() throws Exception {
        when(uavService.checkUAVRegionAccess("NONEXISTENT", "Test Region"))
                .thenReturn("UAV with RFID NONEXISTENT not found");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "NONEXISTENT")
                .param("regionName", "Test Region"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV with RFID NONEXISTENT not found"));

        verify(uavService, times(1)).checkUAVRegionAccess("NONEXISTENT", "Test Region");
    }

    @Test
    void testValidateAccessUnauthorized() throws Exception {
        when(uavService.checkUAVRegionAccess("TEST001", "Test Region"))
                .thenReturn("UAV is not authorized");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", "Test Region"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV is not authorized"));

        verify(uavService, times(1)).checkUAVRegionAccess("TEST001", "Test Region");
    }

    @Test
    void testValidateAccessNoRegionAccess() throws Exception {
        when(uavService.checkUAVRegionAccess("TEST001", "Restricted Region"))
                .thenReturn("UAV is not authorized for region: Restricted Region");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", "Restricted Region"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV is not authorized for region: Restricted Region"));

        verify(uavService, times(1)).checkUAVRegionAccess("TEST001", "Restricted Region");
    }

    @Test
    void testValidateAccessMissingRfidId() throws Exception {
        mockMvc.perform(post("/api/access/validate")
                .param("regionName", "Test Region"))
                .andExpect(status().isBadRequest());

        verify(uavService, never()).checkUAVRegionAccess(anyString(), anyString());
    }

    @Test
    void testValidateAccessMissingRegionName() throws Exception {
        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST001"))
                .andExpect(status().isBadRequest());

        verify(uavService, never()).checkUAVRegionAccess(anyString(), anyString());
    }

    @Test
    void testValidateAccessEmptyRfidId() throws Exception {
        when(uavService.checkUAVRegionAccess("", "Test Region"))
                .thenReturn("UAV with RFID  not found");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "")
                .param("regionName", "Test Region"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV with RFID  not found"));

        verify(uavService, times(1)).checkUAVRegionAccess("", "Test Region");
    }

    @Test
    void testValidateAccessEmptyRegionName() throws Exception {
        when(uavService.checkUAVRegionAccess("TEST001", ""))
                .thenReturn("UAV is not authorized for region: ");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", ""))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV is not authorized for region: "));

        verify(uavService, times(1)).checkUAVRegionAccess("TEST001", "");
    }

    @Test
    void testValidateAccessWithSpecialCharacters() throws Exception {
        when(uavService.checkUAVRegionAccess("TEST-001", "Test Region #1"))
                .thenReturn("OPEN THE DOOR");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST-001")
                .param("regionName", "Test Region #1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("OPEN THE DOOR"));

        verify(uavService, times(1)).checkUAVRegionAccess("TEST-001", "Test Region #1");
    }

    @Test
    void testValidateAccessCaseSensitive() throws Exception {
        when(uavService.checkUAVRegionAccess("test001", "test region"))
                .thenReturn("UAV with RFID test001 not found");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "test001")
                .param("regionName", "test region"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV with RFID test001 not found"));

        verify(uavService, times(1)).checkUAVRegionAccess("test001", "test region");
    }

    @Test
    void testValidateAccessWithWhitespace() throws Exception {
        when(uavService.checkUAVRegionAccess(" TEST001 ", " Test Region "))
                .thenReturn("OPEN THE DOOR");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", " TEST001 ")
                .param("regionName", " Test Region "))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("OPEN THE DOOR"));

        verify(uavService, times(1)).checkUAVRegionAccess(" TEST001 ", " Test Region ");
    }

    @Test
    void testValidateAccessLongRfidId() throws Exception {
        String longRfidId = "A".repeat(100);
        when(uavService.checkUAVRegionAccess(longRfidId, "Test Region"))
                .thenReturn("UAV with RFID " + longRfidId + " not found");

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", longRfidId)
                .param("regionName", "Test Region"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV with RFID " + longRfidId + " not found"));

        verify(uavService, times(1)).checkUAVRegionAccess(longRfidId, "Test Region");
    }

    @Test
    void testValidateAccessLongRegionName() throws Exception {
        String longRegionName = "B".repeat(100);
        when(uavService.checkUAVRegionAccess("TEST001", longRegionName))
                .thenReturn("UAV is not authorized for region: " + longRegionName);

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", longRegionName))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(content().string("UAV is not authorized for region: " + longRegionName));

        verify(uavService, times(1)).checkUAVRegionAccess("TEST001", longRegionName);
    }

    @Test
    void testValidateAccessMultipleRequests() throws Exception {
        when(uavService.checkUAVRegionAccess("TEST001", "Region1"))
                .thenReturn("OPEN THE DOOR");
        when(uavService.checkUAVRegionAccess("TEST002", "Region2"))
                .thenReturn("UAV is not authorized");
        when(uavService.checkUAVRegionAccess("TEST003", "Region3"))
                .thenReturn("UAV with RFID TEST003 not found");

        // First request
        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", "Region1"))
                .andExpect(status().isOk())
                .andExpect(content().string("OPEN THE DOOR"));

        // Second request
        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST002")
                .param("regionName", "Region2"))
                .andExpect(status().isOk())
                .andExpect(content().string("UAV is not authorized"));

        // Third request
        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "TEST003")
                .param("regionName", "Region3"))
                .andExpect(status().isOk())
                .andExpect(content().string("UAV with RFID TEST003 not found"));

        verify(uavService, times(1)).checkUAVRegionAccess("TEST001", "Region1");
        verify(uavService, times(1)).checkUAVRegionAccess("TEST002", "Region2");
        verify(uavService, times(1)).checkUAVRegionAccess("TEST003", "Region3");
    }

    @Test
    void testValidateAccessServiceException() throws Exception {
        when(uavService.checkUAVRegionAccess("ERROR001", "Test Region"))
                .thenThrow(new RuntimeException("Database connection error"));

        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "ERROR001")
                .param("regionName", "Test Region"))
                .andExpect(status().isInternalServerError());

        verify(uavService, times(1)).checkUAVRegionAccess("ERROR001", "Test Region");
    }

    @Test
    void testValidateAccessGetMethodNotAllowed() throws Exception {
        mockMvc.perform(get("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", "Test Region"))
                .andExpect(status().isMethodNotAllowed());

        verify(uavService, never()).checkUAVRegionAccess(anyString(), anyString());
    }

    @Test
    void testValidateAccessPutMethodNotAllowed() throws Exception {
        mockMvc.perform(put("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", "Test Region"))
                .andExpect(status().isMethodNotAllowed());

        verify(uavService, never()).checkUAVRegionAccess(anyString(), anyString());
    }

    @Test
    void testValidateAccessDeleteMethodNotAllowed() throws Exception {
        mockMvc.perform(delete("/api/access/validate")
                .param("rfidId", "TEST001")
                .param("regionName", "Test Region"))
                .andExpect(status().isMethodNotAllowed());

        verify(uavService, never()).checkUAVRegionAccess(anyString(), anyString());
    }
}
