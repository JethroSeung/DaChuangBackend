package com.example.uavdockingmanagementsystem.service;

import com.example.uavdockingmanagementsystem.model.*;
import com.example.uavdockingmanagementsystem.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * Service to initialize sample data for the UAV management system
 * Creates sample UAVs, docking stations, geofences, and location data
 */
@Service
public class DataInitializationService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializationService.class);

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private LocationHistoryRepository locationHistoryRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private DockingStationService dockingStationService;

    @Autowired
    private GeofenceService geofenceService;

    @Autowired
    private RegionService regionService;

    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Starting data initialization...");
            
            // Initialize in order due to dependencies
            initializeRegions();
            initializeDockingStations();
            initializeGeofences();
            initializeUAVsWithLocations();
            
            logger.info("Data initialization completed successfully");
            
        } catch (Exception e) {
            logger.error("Error during data initialization: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void initializeRegions() {
        try {
            regionService.initializeSampleRegions();
            logger.info("Regions initialized");
        } catch (Exception e) {
            logger.error("Error initializing regions: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void initializeDockingStations() {
        try {
            dockingStationService.initializeSampleStations();
            logger.info("Docking stations initialized");
        } catch (Exception e) {
            logger.error("Error initializing docking stations: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void initializeGeofences() {
        try {
            geofenceService.initializeSampleGeofences();
            logger.info("Geofences initialized");
        } catch (Exception e) {
            logger.error("Error initializing geofences: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void initializeUAVsWithLocations() {
        try {
            long uavCount = uavRepository.count();
            
            if (uavCount < 5) {
                logger.info("Creating sample UAVs with location data...");
                
                // Create sample UAVs with realistic locations around New York City
                createSampleUAV("UAV-001", "John Smith", "DJI Phantom 4", 40.7589, -73.9851, UAV.Status.AUTHORIZED);
                createSampleUAV("UAV-002", "Jane Doe", "DJI Mavic Pro", 40.7505, -73.9934, UAV.Status.AUTHORIZED);
                createSampleUAV("UAV-003", "Bob Johnson", "Parrot Anafi", 40.7282, -74.0776, UAV.Status.UNAUTHORIZED);
                createSampleUAV("UAV-004", "Alice Brown", "Autel EVO", 40.6892, -74.0445, UAV.Status.AUTHORIZED);
                createSampleUAV("UAV-005", "Charlie Wilson", "DJI Mini 2", 40.7831, -73.9712, UAV.Status.AUTHORIZED);
                
                logger.info("Sample UAVs created with location data");
            }
            
        } catch (Exception e) {
            logger.error("Error initializing UAVs: {}", e.getMessage(), e);
        }
    }

    private void createSampleUAV(String rfidTag, String ownerName, String model, 
                                double latitude, double longitude, UAV.Status status) {
        try {
            // Check if UAV already exists
            if (uavRepository.findByRfidTag(rfidTag).isPresent()) {
                return;
            }
            
            UAV uav = new UAV();
            uav.setRfidTag(rfidTag);
            uav.setOwnerName(ownerName);
            uav.setModel(model);
            uav.setStatus(status);
            uav.setOperationalStatus(UAV.OperationalStatus.READY);
            uav.setInHibernatePod(false);
            
            // Set current location
            uav.setCurrentLatitude(latitude);
            uav.setCurrentLongitude(longitude);
            uav.setCurrentAltitudeMeters(random.nextDouble() * 100 + 10); // 10-110 meters
            uav.setLastLocationUpdate(LocalDateTime.now());
            
            // Set additional properties
            uav.setSerialNumber("SN" + rfidTag.replace("-", ""));
            uav.setManufacturer(getManufacturerFromModel(model));
            uav.setWeightKg(random.nextDouble() * 2 + 0.5); // 0.5-2.5 kg
            uav.setMaxFlightTimeMinutes(random.nextInt(20) + 20); // 20-40 minutes
            uav.setMaxAltitudeMeters(random.nextInt(100) + 100); // 100-200 meters
            uav.setMaxSpeedKmh(random.nextInt(30) + 40); // 40-70 km/h
            uav.setTotalFlightHours(random.nextInt(100));
            uav.setTotalFlightCycles(random.nextInt(500));
            
            // Assign to random regions
            assignRandomRegions(uav);
            
            UAV savedUAV = uavRepository.save(uav);
            
            // Create location history
            createLocationHistory(savedUAV, latitude, longitude);
            
            logger.debug("Created sample UAV: {}", rfidTag);
            
        } catch (Exception e) {
            logger.error("Error creating sample UAV {}: {}", rfidTag, e.getMessage(), e);
        }
    }

    private String getManufacturerFromModel(String model) {
        if (model.startsWith("DJI")) return "DJI";
        if (model.startsWith("Parrot")) return "Parrot";
        if (model.startsWith("Autel")) return "Autel";
        return "Unknown";
    }

    private void assignRandomRegions(UAV uav) {
        try {
            var regions = regionRepository.findAll();
            if (!regions.isEmpty()) {
                // Assign 1-2 random regions
                int regionCount = random.nextInt(2) + 1;
                for (int i = 0; i < regionCount && i < regions.size(); i++) {
                    int randomIndex = random.nextInt(regions.size());
                    uav.getRegions().add(regions.get(randomIndex));
                }
            }
        } catch (Exception e) {
            logger.error("Error assigning regions to UAV: {}", e.getMessage(), e);
        }
    }

    private void createLocationHistory(UAV uav, double centerLat, double centerLon) {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Create location history for the last 2 hours with 5-minute intervals
            for (int i = 0; i < 24; i++) {
                LocalDateTime timestamp = now.minusMinutes(i * 5);
                
                // Add some random movement around the center point
                double latOffset = (random.nextDouble() - 0.5) * 0.01; // ~1km radius
                double lonOffset = (random.nextDouble() - 0.5) * 0.01;
                
                double latitude = centerLat + latOffset;
                double longitude = centerLon + lonOffset;
                double altitude = random.nextDouble() * 80 + 20; // 20-100 meters
                
                LocationHistory location = new LocationHistory(uav, latitude, longitude, altitude);
                location.setTimestamp(timestamp);
                location.setSpeedKmh(random.nextDouble() * 40 + 10); // 10-50 km/h
                location.setHeadingDegrees(random.nextDouble() * 360);
                location.setBatteryLevel(random.nextInt(40) + 60); // 60-100%
                location.setLocationSource(LocationHistory.LocationSource.GPS);
                location.setAccuracyMeters(random.nextDouble() * 3 + 1); // 1-4 meters
                location.setSignalStrength(random.nextInt(30) + 70); // 70-100%
                
                locationHistoryRepository.save(location);
            }
            
            logger.debug("Created location history for UAV: {}", uav.getRfidTag());
            
        } catch (Exception e) {
            logger.error("Error creating location history for UAV {}: {}", uav.getRfidTag(), e.getMessage(), e);
        }
    }

    /**
     * Create additional sample data for testing
     */
    @Transactional
    public void createAdditionalTestData() {
        try {
            logger.info("Creating additional test data...");
            
            // Create more UAVs for stress testing
            for (int i = 6; i <= 15; i++) {
                String rfidTag = String.format("TEST-%03d", i);
                String ownerName = "Test User " + i;
                String model = getRandomModel();
                
                // Random location around NYC
                double latitude = 40.7128 + (random.nextDouble() - 0.5) * 0.1;
                double longitude = -74.0060 + (random.nextDouble() - 0.5) * 0.1;
                UAV.Status status = random.nextBoolean() ? UAV.Status.AUTHORIZED : UAV.Status.UNAUTHORIZED;
                
                createSampleUAV(rfidTag, ownerName, model, latitude, longitude, status);
            }
            
            // Create additional geofences
            createAdditionalGeofences();
            
            logger.info("Additional test data created");
            
        } catch (Exception e) {
            logger.error("Error creating additional test data: {}", e.getMessage(), e);
        }
    }

    private String getRandomModel() {
        String[] models = {
            "DJI Phantom 4", "DJI Mavic Pro", "DJI Mini 2", "DJI Air 2S",
            "Parrot Anafi", "Parrot Bebop 2", "Autel EVO", "Autel EVO II",
            "Skydio 2", "Yuneec Typhoon H"
        };
        return models[random.nextInt(models.length)];
    }

    private void createAdditionalGeofences() {
        try {
            // Create additional test geofences if needed
            long geofenceCount = geofenceRepository.count();
            
            if (geofenceCount < 8) {
                // Hospital no-fly zone
                Geofence hospitalZone = Geofence.createCircularFence(
                    "Hospital No-Fly Zone", 40.7614, -73.9776, 1000.0, Geofence.BoundaryType.EXCLUSION);
                hospitalZone.setDescription("No-fly zone around major hospital");
                hospitalZone.setPriorityLevel(4);
                hospitalZone.setViolationAction("EMERGENCY_LAND");
                geofenceRepository.save(hospitalZone);
                
                // Park recreational zone
                Geofence parkZone = Geofence.createCircularFence(
                    "Central Park Recreation Zone", 40.7829, -73.9654, 2000.0, Geofence.BoundaryType.INCLUSION);
                parkZone.setDescription("Recreational flying area in Central Park");
                parkZone.setPriorityLevel(2);
                parkZone.setViolationAction("ALERT");
                parkZone.setMaxAltitudeMeters(60.0);
                geofenceRepository.save(parkZone);
                
                // Construction site exclusion
                Geofence constructionZone = Geofence.createCircularFence(
                    "Construction Site", 40.7505, -73.9934, 300.0, Geofence.BoundaryType.EXCLUSION);
                constructionZone.setDescription("Active construction site - no UAV access");
                constructionZone.setPriorityLevel(3);
                constructionZone.setViolationAction("RETURN_TO_BASE");
                constructionZone.setTimeFrom("07:00");
                constructionZone.setTimeUntil("18:00");
                constructionZone.setDaysOfWeek("MON,TUE,WED,THU,FRI");
                geofenceRepository.save(constructionZone);
                
                logger.info("Additional geofences created");
            }
            
        } catch (Exception e) {
            logger.error("Error creating additional geofences: {}", e.getMessage(), e);
        }
    }

    /**
     * Simulate real-time location updates for testing
     */
    public void simulateLocationUpdates() {
        try {
            var uavs = uavRepository.findAll();
            
            for (UAV uav : uavs) {
                if (uav.hasLocationData()) {
                    // Add small random movement
                    double latOffset = (random.nextDouble() - 0.5) * 0.001; // ~100m
                    double lonOffset = (random.nextDouble() - 0.5) * 0.001;
                    
                    double newLat = uav.getCurrentLatitude() + latOffset;
                    double newLon = uav.getCurrentLongitude() + lonOffset;
                    double newAlt = Math.max(10, uav.getCurrentAltitudeMeters() + (random.nextDouble() - 0.5) * 10);
                    
                    // Update UAV location
                    uav.setCurrentLatitude(newLat);
                    uav.setCurrentLongitude(newLon);
                    uav.setCurrentAltitudeMeters(newAlt);
                    uav.setLastLocationUpdate(LocalDateTime.now());
                    uavRepository.save(uav);
                    
                    // Create new location history entry
                    LocationHistory location = new LocationHistory(uav, newLat, newLon, newAlt);
                    location.setSpeedKmh(random.nextDouble() * 30 + 5);
                    location.setHeadingDegrees(random.nextDouble() * 360);
                    location.setBatteryLevel(Math.max(20, random.nextInt(80) + 20));
                    location.setLocationSource(LocationHistory.LocationSource.GPS);
                    location.setAccuracyMeters(random.nextDouble() * 2 + 1);
                    location.setSignalStrength(random.nextInt(20) + 80);
                    
                    locationHistoryRepository.save(location);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error simulating location updates: {}", e.getMessage(), e);
        }
    }
}
