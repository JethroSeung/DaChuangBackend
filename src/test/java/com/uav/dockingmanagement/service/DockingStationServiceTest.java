package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.*;
import com.uav.dockingmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DockingStationService
 */
@ExtendWith(MockitoExtension.class)
class DockingStationServiceTest {

    @Mock
    private DockingStationRepository dockingStationRepository;

    @Mock
    private UAVRepository uavRepository;

    @Mock
    private DockingRecordRepository dockingRecordRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private DockingStationService dockingStationService;

    private DockingStation testStation;
    private UAV testUAV;
    private DockingRecord testDockingRecord;

    @BeforeEach
    void setUp() {
        testStation = new DockingStation();
        testStation.setId(1L);
        testStation.setName("Test Station");
        testStation.setLatitude(40.7128);
        testStation.setLongitude(-74.0060);
        testStation.setMaxCapacity(5);
        testStation.setCurrentOccupancy(2);
        testStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        testStation.setChargingAvailable(true);
        testStation.setMaintenanceAvailable(false);

        testUAV = new UAV();
        testUAV.setId(1);
        testUAV.setRfidTag("TEST001");
        testUAV.setStatus(UAV.Status.AUTHORIZED);
        testUAV.setOperationalStatus(UAV.OperationalStatus.READY);

        testDockingRecord = new DockingRecord();
        testDockingRecord.setId(1L);
        testDockingRecord.setUav(testUAV);
        testDockingRecord.setDockingStation(testStation);
        testDockingRecord.setDockingTime(LocalDateTime.now());
    }

    @Test
    void testGetAllStations() {
        List<DockingStation> stations = Arrays.asList(testStation);
        when(dockingStationRepository.findAll()).thenReturn(stations);

        List<DockingStation> result = dockingStationService.getAllStations();

        assertEquals(1, result.size());
        assertEquals(testStation, result.get(0));
        verify(dockingStationRepository, times(1)).findAll();
    }

    @Test
    void testGetStationById() {
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));

        Optional<DockingStation> result = dockingStationService.getStationById(1L);

        assertTrue(result.isPresent());
        assertEquals(testStation, result.get());
        verify(dockingStationRepository, times(1)).findById(1L);
    }

    @Test
    void testGetStationByIdNotFound() {
        when(dockingStationRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<DockingStation> result = dockingStationService.getStationById(999L);

        assertFalse(result.isPresent());
        verify(dockingStationRepository, times(1)).findById(999L);
    }

    @Test
    void testCreateStation() {
        when(dockingStationRepository.save(any(DockingStation.class))).thenReturn(testStation);

        DockingStation result = dockingStationService.createStation(testStation);

        assertNotNull(result);
        assertEquals(testStation, result);
        verify(dockingStationRepository, times(1)).save(testStation);
    }

    @Test
    void testUpdateStation() {
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));
        when(dockingStationRepository.save(any(DockingStation.class))).thenReturn(testStation);

        testStation.setName("Updated Station");
        DockingStation result = dockingStationService.updateStation(1L, testStation);

        assertNotNull(result);
        assertEquals("Updated Station", result.getName());
        verify(dockingStationRepository, times(1)).findById(1L);
        verify(dockingStationRepository, times(1)).save(testStation);
    }

    @Test
    void testUpdateStationNotFound() {
        when(dockingStationRepository.findById(999L)).thenReturn(Optional.empty());

        DockingStation result = dockingStationService.updateStation(999L, testStation);

        assertNull(result);
        verify(dockingStationRepository, times(1)).findById(999L);
        verify(dockingStationRepository, never()).save(any());
    }

    @Test
    void testDeleteStation() {
        doNothing().when(dockingStationRepository).deleteById(1L);

        dockingStationService.deleteStation(1L);

        verify(dockingStationRepository, times(1)).deleteById(1L);
    }

    @Test
    void testGetAvailableStations() {
        List<DockingStation> availableStations = Arrays.asList(testStation);
        when(dockingStationRepository.findAvailableStations()).thenReturn(availableStations);

        List<DockingStation> result = dockingStationService.getAvailableStations();

        assertEquals(1, result.size());
        assertEquals(testStation, result.get(0));
        verify(dockingStationRepository, times(1)).findAvailableStations();
    }

    @Test
    void testDockUAVSuccess() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));
        when(dockingRecordRepository.save(any(DockingRecord.class))).thenReturn(testDockingRecord);
        when(dockingStationRepository.save(any(DockingStation.class))).thenReturn(testStation);
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        Map<String, Object> result = dockingStationService.dockUAV(1, 1L, "CHARGING");

        assertTrue((Boolean) result.get("success"));
        assertEquals("UAV docked successfully", result.get("message"));
        assertNotNull(result.get("dockingRecord"));
        
        verify(uavRepository, times(1)).findById(1);
        verify(dockingStationRepository, times(1)).findById(1L);
        verify(dockingRecordRepository, times(1)).save(any(DockingRecord.class));
        verify(dockingStationRepository, times(1)).save(testStation);
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testDockUAVNotFound() {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        Map<String, Object> result = dockingStationService.dockUAV(999, 1L, "CHARGING");

        assertFalse((Boolean) result.get("success"));
        assertEquals("UAV not found", result.get("message"));
        
        verify(uavRepository, times(1)).findById(999);
        verify(dockingStationRepository, never()).findById(anyLong());
    }

    @Test
    void testDockUAVStationNotFound() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(dockingStationRepository.findById(999L)).thenReturn(Optional.empty());

        Map<String, Object> result = dockingStationService.dockUAV(1, 999L, "CHARGING");

        assertFalse((Boolean) result.get("success"));
        assertEquals("Docking station not found", result.get("message"));
        
        verify(uavRepository, times(1)).findById(1);
        verify(dockingStationRepository, times(1)).findById(999L);
    }

    @Test
    void testDockUAVStationFull() {
        testStation.setCurrentOccupancy(5); // Full capacity
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));

        Map<String, Object> result = dockingStationService.dockUAV(1, 1L, "CHARGING");

        assertFalse((Boolean) result.get("success"));
        assertTrue(result.get("message").toString().contains("full"));
        
        verify(uavRepository, times(1)).findById(1);
        verify(dockingStationRepository, times(1)).findById(1L);
        verify(dockingRecordRepository, never()).save(any());
    }

    @Test
    void testDockUAVStationNotOperational() {
        testStation.setStatus(DockingStation.StationStatus.MAINTENANCE);
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(dockingStationRepository.findById(1L)).thenReturn(Optional.of(testStation));

        Map<String, Object> result = dockingStationService.dockUAV(1, 1L, "CHARGING");

        assertFalse((Boolean) result.get("success"));
        assertTrue(result.get("message").toString().contains("not operational"));
        
        verify(uavRepository, times(1)).findById(1);
        verify(dockingStationRepository, times(1)).findById(1L);
        verify(dockingRecordRepository, never()).save(any());
    }

    @Test
    void testUndockUAVSuccess() {
        testDockingRecord.setUndockingTime(null); // Still docked
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(dockingRecordRepository.findActiveByUavId(1)).thenReturn(Optional.of(testDockingRecord));
        when(dockingRecordRepository.save(any(DockingRecord.class))).thenReturn(testDockingRecord);
        when(dockingStationRepository.save(any(DockingStation.class))).thenReturn(testStation);
        when(uavRepository.save(any(UAV.class))).thenReturn(testUAV);

        Map<String, Object> result = dockingStationService.undockUAV(1);

        assertTrue((Boolean) result.get("success"));
        assertEquals("UAV undocked successfully", result.get("message"));
        assertNotNull(result.get("dockingRecord"));
        
        verify(uavRepository, times(1)).findById(1);
        verify(dockingRecordRepository, times(1)).findActiveByUavId(1);
        verify(dockingRecordRepository, times(1)).save(any(DockingRecord.class));
        verify(dockingStationRepository, times(1)).save(testStation);
        verify(uavRepository, times(1)).save(testUAV);
    }

    @Test
    void testUndockUAVNotFound() {
        when(uavRepository.findById(999)).thenReturn(Optional.empty());

        Map<String, Object> result = dockingStationService.undockUAV(999);

        assertFalse((Boolean) result.get("success"));
        assertEquals("UAV not found", result.get("message"));
        
        verify(uavRepository, times(1)).findById(999);
        verify(dockingRecordRepository, never()).findActiveByUavId(anyInt());
    }

    @Test
    void testUndockUAVNotDocked() {
        when(uavRepository.findById(1)).thenReturn(Optional.of(testUAV));
        when(dockingRecordRepository.findActiveByUavId(1)).thenReturn(Optional.empty());

        Map<String, Object> result = dockingStationService.undockUAV(1);

        assertFalse((Boolean) result.get("success"));
        assertTrue(result.get("message").toString().contains("not currently docked"));
        
        verify(uavRepository, times(1)).findById(1);
        verify(dockingRecordRepository, times(1)).findActiveByUavId(1);
    }

    @Test
    void testFindOptimalStationSuccess() {
        List<DockingStation> availableStations = Arrays.asList(testStation);
        when(dockingStationRepository.findAvailableStations()).thenReturn(availableStations);

        Optional<DockingStation> result = dockingStationService.findOptimalStation(40.7130, -74.0058, null);

        assertTrue(result.isPresent());
        assertEquals(testStation, result.get());
        verify(dockingStationRepository, times(1)).findAvailableStations();
    }

    @Test
    void testFindOptimalStationNoAvailable() {
        when(dockingStationRepository.findAvailableStations()).thenReturn(Collections.emptyList());

        Optional<DockingStation> result = dockingStationService.findOptimalStation(40.7130, -74.0058, null);

        assertFalse(result.isPresent());
        verify(dockingStationRepository, times(1)).findAvailableStations();
    }

    @Test
    void testFindOptimalStationForCharging() {
        testStation.setChargingAvailable(true);
        List<DockingStation> availableStations = Arrays.asList(testStation);
        when(dockingStationRepository.findAvailableStations()).thenReturn(availableStations);

        Optional<DockingStation> result = dockingStationService.findOptimalStation(40.7130, -74.0058, "CHARGING");

        assertTrue(result.isPresent());
        assertEquals(testStation, result.get());
        verify(dockingStationRepository, times(1)).findAvailableStations();
    }

    @Test
    void testFindOptimalStationForChargingNotAvailable() {
        testStation.setChargingAvailable(false);
        List<DockingStation> availableStations = Arrays.asList(testStation);
        when(dockingStationRepository.findAvailableStations()).thenReturn(availableStations);

        Optional<DockingStation> result = dockingStationService.findOptimalStation(40.7130, -74.0058, "CHARGING");

        assertFalse(result.isPresent());
        verify(dockingStationRepository, times(1)).findAvailableStations();
    }

    @Test
    void testFindOptimalStationForMaintenance() {
        testStation.setMaintenanceAvailable(true);
        List<DockingStation> availableStations = Arrays.asList(testStation);
        when(dockingStationRepository.findAvailableStations()).thenReturn(availableStations);

        Optional<DockingStation> result = dockingStationService.findOptimalStation(40.7130, -74.0058, "MAINTENANCE");

        assertTrue(result.isPresent());
        assertEquals(testStation, result.get());
        verify(dockingStationRepository, times(1)).findAvailableStations();
    }

    @Test
    void testGetStationStatistics() {
        when(dockingStationRepository.count()).thenReturn(10L);
        when(dockingStationRepository.countByStatus(DockingStation.StationStatus.OPERATIONAL)).thenReturn(8L);
        when(dockingStationRepository.countByChargingAvailable(true)).thenReturn(6L);
        when(dockingStationRepository.countByMaintenanceAvailable(true)).thenReturn(3L);
        when(dockingStationRepository.countByWeatherProtected(true)).thenReturn(5L);
        when(dockingStationRepository.findStationsNeedingMaintenance()).thenReturn(Collections.emptyList());

        Map<String, Object> result = dockingStationService.getStationStatistics();

        assertNotNull(result);
        assertEquals(10L, result.get("totalStations"));
        assertEquals(8L, result.get("operationalStations"));
        assertEquals(0, result.get("stationsNeedingMaintenance"));
        assertNotNull(result.get("features"));
        assertNotNull(result.get("timestamp"));
        
        verify(dockingStationRepository, times(1)).count();
        verify(dockingStationRepository, times(1)).countByStatus(DockingStation.StationStatus.OPERATIONAL);
    }
}
