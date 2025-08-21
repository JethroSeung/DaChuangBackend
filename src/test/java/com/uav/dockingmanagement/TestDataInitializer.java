package com.uav.dockingmanagement;

import com.uav.dockingmanagement.model.*;
import com.uav.dockingmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Test data initializer for integration tests
 * Creates test data programmatically instead of using SQL scripts
 */
@Component
public class TestDataInitializer {

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private BatteryStatusRepository batteryStatusRepository;

    @Transactional
    public void initializeTestData() {
        // Clear existing data
        clearAllData();

        // Create test regions
        Region region1 = createTestRegion(1L, "Test Region 1");
        Region region2 = createTestRegion(2L, "Test Region 2");
        Region region3 = createTestRegion(3L, "Test Region 3");

        // Create test docking stations
        DockingStation station1 = createTestDockingStation(1L, "Test Station 1", 40.7128, -74.0060, 5, 0, region1);
        DockingStation station2 = createTestDockingStation(2L, "Test Station 2", 40.7589, -73.9851, 3, 1, region1);
        DockingStation station3 = createTestDockingStation(3L, "Test Station 3", 40.7505, -73.9934, 4, 2, region2);

        // Create test UAVs
        UAV uav1 = createTestUAV(1L, "UAV001", "DJI Phantom 4", "DJI", "Test Owner 1", "RFID001", 40.7128, -74.0060, 100.0);
        UAV uav2 = createTestUAV(2L, "UAV002", "DJI Mavic Pro", "DJI", "Test Owner 2", "RFID002", 40.7589, -73.9851, 150.0);
        UAV uav3 = createTestUAV(3L, "UAV003", "Parrot Anafi", "Parrot", "Test Owner 3", "RFID003", 40.7505, -73.9934, 0.0);

        // Create test geofences
        Geofence geofence1 = createTestGeofence(1L, "Test Geofence 1", "Test restricted area", 40.7128, -74.0060, 1000, region1);
        Geofence geofence2 = createTestGeofence(2L, "Test Geofence 2", "Test safe zone", 40.7589, -73.9851, 500, region1);

        // Create test location history
        createTestLocationHistory(1L, uav1, 40.7128, -74.0060, 100.0);
        createTestLocationHistory(2L, uav2, 40.7589, -73.9851, 150.0);

        // Create test battery status
        createTestBatteryStatus(1L, uav1, 85, 12.6, 25.5);
        createTestBatteryStatus(2L, uav2, 60, 11.8, 28.0);
        createTestBatteryStatus(3L, uav3, 100, 12.8, 22.0);
    }

    @Transactional
    public void clearAllData() {
        // Delete in proper order to avoid foreign key constraint violations
        locationHistoryRepository.deleteAll();
        batteryStatusRepository.deleteAll();
        geofenceRepository.deleteAll();
        uavRepository.deleteAll();
        dockingStationRepository.deleteAll();
        regionRepository.deleteAll();
    }

    private Region createTestRegion(Long id, String name) {
        Region region = new Region();
        region.setRegionName(name);
        return regionRepository.save(region);
    }

    private DockingStation createTestDockingStation(Long id, String name, double lat, double lon, int capacity, int occupancy, Region region) {
        DockingStation station = new DockingStation();
        station.setName(name);
        station.setLatitude(lat);
        station.setLongitude(lon);
        station.setMaxCapacity(capacity);
        station.setCurrentOccupancy(occupancy);
        station.setStatus(DockingStation.StationStatus.OPERATIONAL);
        // Note: DockingStation doesn't have setRegion method, skip for now
        return dockingStationRepository.save(station);
    }

    private UAV createTestUAV(Long id, String serialNumber, String model, String manufacturer, String owner, String rfidTag, double lat, double lon, double alt) {
        UAV uav = new UAV();
        uav.setSerialNumber(serialNumber);
        uav.setModel(model);
        uav.setManufacturer(manufacturer);
        uav.setOwnerName(owner);
        uav.setRfidTag(rfidTag);
        uav.setCurrentLatitude(lat);
        uav.setCurrentLongitude(lon);
        uav.setCurrentAltitudeMeters(alt);
        uav.setStatus(UAV.Status.AUTHORIZED);
        uav.setOperationalStatus(UAV.OperationalStatus.READY);
        uav.setWeightKg(1.4);
        uav.setMaxAltitudeMeters(6000);
        uav.setMaxSpeedKmh(72);
        uav.setMaxFlightTimeMinutes(30);
        uav.setTotalFlightHours(50);
        uav.setTotalFlightCycles(25);
        uav.setLastMaintenanceDate(LocalDateTime.now().minusDays(30));
        uav.setNextMaintenanceDue(LocalDateTime.now().plusDays(335));
        uav.setCreatedAt(LocalDateTime.now());
        uav.setUpdatedAt(LocalDateTime.now());
        return uavRepository.save(uav);
    }

    private Geofence createTestGeofence(Long id, String name, String description, double lat, double lon, int radius, Region region) {
        Geofence geofence = new Geofence();
        geofence.setName(name);
        geofence.setDescription(description);
        geofence.setCenterLatitude(lat);
        geofence.setCenterLongitude(lon);
        geofence.setRadiusMeters((double) radius);
        geofence.setStatus(Geofence.FenceStatus.ACTIVE);
        geofence.setFenceType(Geofence.FenceType.CIRCULAR);
        geofence.setBoundaryType(Geofence.BoundaryType.INCLUSION);
        // Note: Geofence doesn't have setRegion method, skip for now
        return geofenceRepository.save(geofence);
    }

    private LocationHistory createTestLocationHistory(Long id, UAV uav, double lat, double lon, double alt) {
        LocationHistory history = new LocationHistory();
        history.setUav(uav);
        history.setLatitude(lat);
        history.setLongitude(lon);
        history.setAltitudeMeters((double) alt);
        history.setTimestamp(LocalDateTime.now());
        history.setSpeedKmh(25.5);
        history.setHeadingDegrees(180.0);
        return locationHistoryRepository.save(history);
    }

    private BatteryStatus createTestBatteryStatus(Long id, UAV uav, int charge, double voltage, double temp) {
        BatteryStatus battery = new BatteryStatus();
        battery.setUav(uav);
        battery.setCurrentChargePercentage(charge);
        battery.setVoltage(voltage);
        battery.setTemperatureCelsius(temp);

        // Set required fields
        battery.setCapacityMah(5000); // Required field - typical UAV battery capacity
        battery.setCycleCount(150);
        battery.setHealthPercentage(95);
        battery.setChargingStatus(BatteryStatus.ChargingStatus.DISCONNECTED);
        battery.setBatteryCondition(BatteryStatus.BatteryCondition.GOOD);
        battery.setIsCharging(false);

        // Set optional fields
        battery.setLastChargeDate(LocalDateTime.now());
        battery.setEstimatedFlightTimeMinutes(25);
        battery.setRemainingCapacityMah(4750);

        // Set both sides of the bidirectional relationship
        BatteryStatus savedBattery = batteryStatusRepository.save(battery);
        uav.setBatteryStatus(savedBattery);
        uavRepository.save(uav); // Update UAV with battery reference

        return savedBattery;
    }
}
