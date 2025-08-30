package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import com.uav.dockingmanagement.config.TestSecurityConfig;
import com.uav.dockingmanagement.config.TestWebConfig;
import com.uav.dockingmanagement.model.DockingStation;
import com.uav.dockingmanagement.repository.DockingStationRepository;
import com.uav.dockingmanagement.service.DockingStationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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
 * Unit tests for DockingStationController
 */
@WebMvcTest(DockingStationController.class)
@ActiveProfiles("test")
@Import({TestRateLimitingConfig.class, TestSecurityConfig.class, TestWebConfig.class})
class DockingStationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DockingStationRepository dockingStationRepository;

    @MockitoBean
    private DockingStationService dockingStationService;

    @Autowired
    private ObjectMapper objectMapper;

    private DockingStation testStation;

    @BeforeEach
    void setUp() {
        testStation = new DockingStation();
        testStation.setId(1L);
        testStation.setName("Test Station");
        testStation.setDescription("Test Description");
        testStation.setLatitude(40.7128);
        testStation.setLongitude(-74.0060);
        testStation.setMaxCapacity(5);
        testStation.setCurrentOccupancy(2);
        testStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        testStation.setStationType(DockingStation.StationType.STANDARD);
        testStation.setChargingAvailable(true);
        testStation.setMaintenanceAvailable(false);
    }

    @Test
    void testGetAllStations() throws Exception {
        List<DockingStation> stations = Arrays.asList(testStation);
        when(dockingStationRepository.findAll()).thenReturn(stations);

        mockMvc.perform(get("/api/docking-stations"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Station"))
                .andExpect(jsonPath("$[0].latitude").value(40.7128))
                .andExpect(jsonPath("$[0].longitude").value(-74.0060));

        verify(dockingStationRepository, times(1)).findAll();
    }

    @Test
    void testGetAllStationsEmpty() throws Exception {
        when(dockingStationRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/docking-stations"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(dockingStationRepository, times(1)).findAll();
    }

    @Test
    void testGetStationById() throws Exception {
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));

        mockMvc.perform(get("/api/docking-stations/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Station"))
                .andExpect(jsonPath("$.status").value("OPERATIONAL"));

        verify(dockingStationRepository, times(1)).findById(1L);
    }

    @Test
    void testGetStationByIdNotFound() throws Exception {
        when(dockingStationRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/docking-stations/999"))
                .andExpect(status().isNotFound());

        verify(dockingStationRepository, times(1)).findById(999L);
    }

    @Test
    void testCreateStation() throws Exception {
        when(dockingStationRepository.save(any(DockingStation.class))).thenReturn(testStation);

        String stationJson = objectMapper.writeValueAsString(testStation);

        mockMvc.perform(post("/api/docking-stations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(stationJson))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.station.name").value("Test Station"));

        verify(dockingStationRepository, times(1)).save(any(DockingStation.class));
    }

    @Test
    void testUpdateStation() throws Exception {
        testStation.setName("Updated Station");
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));
        when(dockingStationRepository.save(any(DockingStation.class))).thenReturn(testStation);

        String stationJson = objectMapper.writeValueAsString(testStation);

        mockMvc.perform(put("/api/docking-stations/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(stationJson))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.station.id").value(1))
                .andExpect(jsonPath("$.success").value(true));

        verify(dockingStationRepository, times(1)).findById(1L);
        verify(dockingStationRepository, times(1)).save(any(DockingStation.class));
    }

    @Test
    void testUpdateStationNotFound() throws Exception {
        when(dockingStationRepository.findById(999L)).thenReturn(Optional.empty());

        String stationJson = objectMapper.writeValueAsString(testStation);

        mockMvc.perform(put("/api/docking-stations/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(stationJson))
                .andExpect(status().isNotFound());

        verify(dockingStationRepository, times(1)).findById(999L);
    }

    @Test
    void testDeleteStation() throws Exception {
        testStation.setCurrentOccupancy(0); // Ensure no active dockings
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));
        doNothing().when(dockingStationRepository).delete(testStation);

        mockMvc.perform(delete("/api/docking-stations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(dockingStationRepository, times(1)).findById(1L);
        verify(dockingStationRepository, times(1)).delete(testStation);
    }

    @Test
    void testGetAvailableStations() throws Exception {
        List<DockingStation> availableStations = Arrays.asList(testStation);
        when(dockingStationRepository.findAvailableStations()).thenReturn(availableStations);

        mockMvc.perform(get("/api/docking-stations/available"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("OPERATIONAL"));

        verify(dockingStationRepository, times(1)).findAvailableStations();
    }

    @Test
    void testDockUAV() throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "UAV docked successfully");

        when(dockingStationService.dockUAV(1, 1L, "CHARGING")).thenReturn(response);

        mockMvc.perform(post("/api/docking-stations/1/dock")
                .param("uavId", "1")
                .param("purpose", "CHARGING"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("UAV docked successfully"));

        verify(dockingStationService, times(1)).dockUAV(1, 1L, "CHARGING");
    }

    @Test
    void testDockUAVFailure() throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Station is full");

        when(dockingStationService.dockUAV(1, 1L, "CHARGING")).thenReturn(response);

        mockMvc.perform(post("/api/docking-stations/1/dock")
                .param("uavId", "1")
                .param("purpose", "CHARGING"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Station is full"));

        verify(dockingStationService, times(1)).dockUAV(1, 1L, "CHARGING");
    }

    @Test
    void testUndockUAV() throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "UAV undocked successfully");

        when(dockingStationService.undockUAV(1)).thenReturn(response);

        mockMvc.perform(post("/api/docking-stations/1/undock")
                .param("uavId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("UAV undocked successfully"));

        verify(dockingStationService, times(1)).undockUAV(1);
    }

    @Test
    void testFindOptimalStation() throws Exception {
        when(dockingStationService.findOptimalStation(40.7128, -74.0060, "CHARGING"))
                .thenReturn(Optional.of(testStation));

        mockMvc.perform(get("/api/docking-stations/optimal")
                .param("latitude", "40.7128")
                .param("longitude", "-74.0060")
                .param("purpose", "CHARGING"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Station"));

        verify(dockingStationService, times(1)).findOptimalStation(40.7128, -74.0060, "CHARGING");
    }

    @Test
    void testFindOptimalStationNotFound() throws Exception {
        when(dockingStationService.findOptimalStation(40.7128, -74.0060, "CHARGING"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/docking-stations/optimal")
                .param("latitude", "40.7128")
                .param("longitude", "-74.0060")
                .param("purpose", "CHARGING"))
                .andExpect(status().isNotFound());

        verify(dockingStationService, times(1)).findOptimalStation(40.7128, -74.0060, "CHARGING");
    }

    @Test
    void testGetStationsByType() throws Exception {
        List<DockingStation> stations = Arrays.asList(testStation);
        when(dockingStationRepository.findByStationType(DockingStation.StationType.STANDARD))
                .thenReturn(stations);

        mockMvc.perform(get("/api/docking-stations/type/STANDARD"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].stationType").value("STANDARD"));

        verify(dockingStationRepository, times(1)).findByStationType(DockingStation.StationType.STANDARD);
    }

    @Test
    void testGetStationsByTypeInvalid() throws Exception {
        mockMvc.perform(get("/api/docking-stations/type/INVALID"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetNearestStations() throws Exception {
        List<DockingStation> stations = Arrays.asList(testStation);
        when(dockingStationRepository.findNearestStations(40.7128, -74.0060, 5))
                .thenReturn(stations);

        mockMvc.perform(get("/api/docking-stations/nearest")
                .param("latitude", "40.7128")
                .param("longitude", "-74.0060")
                .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1));

        verify(dockingStationRepository, times(1)).findNearestStations(40.7128, -74.0060, 5);
    }

    @Test
    void testGetStationsInArea() throws Exception {
        List<DockingStation> stations = Arrays.asList(testStation);
        when(dockingStationRepository.findStationsInArea(40.7100, 40.7150, -74.0080, -74.0040))
                .thenReturn(stations);

        mockMvc.perform(get("/api/docking-stations/area")
                .param("minLatitude", "40.7100")
                .param("maxLatitude", "40.7150")
                .param("minLongitude", "-74.0080")
                .param("maxLongitude", "-74.0040"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1));

        verify(dockingStationRepository, times(1)).findStationsInArea(40.7100, 40.7150, -74.0080, -74.0040);
    }

    @Test
    void testGetStationStatistics() throws Exception {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStations", 10L);
        stats.put("operationalStations", 8L);
        stats.put("averageOccupancy", 65.5);

        when(dockingStationService.getStationStatistics()).thenReturn(stats);

        mockMvc.perform(get("/api/docking-stations/statistics"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalStations").value(10))
                .andExpect(jsonPath("$.operationalStations").value(8))
                .andExpect(jsonPath("$.averageOccupancy").value(65.5));

        verify(dockingStationService, times(1)).getStationStatistics();
    }

    @Test
    void testUpdateStationStatus() throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Station status updated successfully");

        Map<String, String> statusUpdate = new HashMap<>();
        statusUpdate.put("status", "MAINTENANCE");

        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));
        when(dockingStationRepository.save(any(DockingStation.class))).thenReturn(testStation);

        mockMvc.perform(put("/api/docking-stations/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Station status updated successfully"));

        verify(dockingStationRepository, times(1)).findById(1L);
        verify(dockingStationRepository, times(1)).save(any(DockingStation.class));
    }
}
