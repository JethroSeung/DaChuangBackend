package com.uav.dockingmanagement.repository;

import com.uav.dockingmanagement.model.DockingStation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Comprehensive unit tests for DockingStationRepository
 * Tests all custom query methods, spatial queries, and aggregation functions
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("DockingStationRepository Tests")
class DockingStationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DockingStationRepository dockingStationRepository;

    private DockingStation operationalStation;
    private DockingStation maintenanceStation;
    private DockingStation outOfServiceStation;
    private DockingStation chargingStation;
    private DockingStation emergencyStation;

    @BeforeEach
    void setUp() {
        // Create test docking stations with different configurations
        operationalStation = new DockingStation();
        operationalStation.setName("Central Station");
        operationalStation.setDescription("Main operational docking station");
        operationalStation.setLatitude(40.7128);
        operationalStation.setLongitude(-74.0060);
        operationalStation.setAltitudeMeters(10.0);
        operationalStation.setMaxCapacity(10);
        operationalStation.setCurrentOccupancy(3);
        operationalStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        operationalStation.setStationType(DockingStation.StationType.STANDARD);
        operationalStation.setChargingAvailable(true);
        operationalStation.setMaintenanceAvailable(false);
        operationalStation.setWeatherProtected(true);
        operationalStation.setSecurityLevel("HIGH");
        operationalStation.setContactInfo("central@example.com");
        operationalStation.setOperationalHours("24/7");
        operationalStation.setLastMaintenanceDate(LocalDateTime.now().minusDays(30));
        operationalStation.setNextMaintenanceDue(LocalDateTime.now().plusDays(30));
        operationalStation = entityManager.persistAndFlush(operationalStation);

        maintenanceStation = new DockingStation();
        maintenanceStation.setName("Maintenance Hub");
        maintenanceStation.setDescription("Specialized maintenance facility");
        maintenanceStation.setLatitude(40.7589);
        maintenanceStation.setLongitude(-73.9851);
        maintenanceStation.setAltitudeMeters(15.0);
        maintenanceStation.setMaxCapacity(5);
        maintenanceStation.setCurrentOccupancy(2);
        maintenanceStation.setStatus(DockingStation.StationStatus.MAINTENANCE);
        maintenanceStation.setStationType(DockingStation.StationType.MAINTENANCE);
        maintenanceStation.setChargingAvailable(true);
        maintenanceStation.setMaintenanceAvailable(true);
        maintenanceStation.setWeatherProtected(true);
        maintenanceStation.setSecurityLevel("MEDIUM");
        maintenanceStation.setContactInfo("maintenance@example.com");
        maintenanceStation.setOperationalHours("8AM-6PM");
        maintenanceStation.setLastMaintenanceDate(LocalDateTime.now().minusDays(5));
        maintenanceStation.setNextMaintenanceDue(LocalDateTime.now().minusDays(1)); // Needs maintenance
        maintenanceStation = entityManager.persistAndFlush(maintenanceStation);

        outOfServiceStation = new DockingStation();
        outOfServiceStation.setName("Offline Station");
        outOfServiceStation.setDescription("Currently out of service");
        outOfServiceStation.setLatitude(40.6892);
        outOfServiceStation.setLongitude(-74.0445);
        outOfServiceStation.setAltitudeMeters(5.0);
        outOfServiceStation.setMaxCapacity(8);
        outOfServiceStation.setCurrentOccupancy(0);
        outOfServiceStation.setStatus(DockingStation.StationStatus.OUT_OF_SERVICE);
        outOfServiceStation.setStationType(DockingStation.StationType.STANDARD);
        outOfServiceStation.setChargingAvailable(false);
        outOfServiceStation.setMaintenanceAvailable(false);
        outOfServiceStation.setWeatherProtected(false);
        outOfServiceStation.setSecurityLevel("LOW");
        outOfServiceStation.setContactInfo("offline@example.com");
        outOfServiceStation.setOperationalHours("CLOSED");
        outOfServiceStation.setLastMaintenanceDate(LocalDateTime.now().minusDays(90));
        outOfServiceStation.setNextMaintenanceDue(LocalDateTime.now().minusDays(60));
        outOfServiceStation = entityManager.persistAndFlush(outOfServiceStation);

        chargingStation = new DockingStation();
        chargingStation.setName("Fast Charging Station");
        chargingStation.setDescription("High-speed charging facility");
        chargingStation.setLatitude(40.7505);
        chargingStation.setLongitude(-73.9934);
        chargingStation.setAltitudeMeters(12.0);
        chargingStation.setMaxCapacity(6);
        chargingStation.setCurrentOccupancy(6); // Full capacity
        chargingStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        chargingStation.setStationType(DockingStation.StationType.CHARGING);
        chargingStation.setChargingAvailable(true);
        chargingStation.setMaintenanceAvailable(false);
        chargingStation.setWeatherProtected(true);
        chargingStation.setSecurityLevel("HIGH");
        chargingStation.setContactInfo("charging@example.com");
        chargingStation.setOperationalHours("24/7");
        chargingStation.setLastMaintenanceDate(LocalDateTime.now().minusDays(15));
        chargingStation.setNextMaintenanceDue(LocalDateTime.now().plusDays(45));
        chargingStation = entityManager.persistAndFlush(chargingStation);

        emergencyStation = new DockingStation();
        emergencyStation.setName("Emergency Response Station");
        emergencyStation.setDescription("Emergency services docking");
        emergencyStation.setLatitude(40.7831);
        emergencyStation.setLongitude(-73.9712);
        emergencyStation.setAltitudeMeters(20.0);
        emergencyStation.setMaxCapacity(3);
        emergencyStation.setCurrentOccupancy(1);
        emergencyStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        emergencyStation.setStationType(DockingStation.StationType.EMERGENCY);
        emergencyStation.setChargingAvailable(true);
        emergencyStation.setMaintenanceAvailable(true);
        emergencyStation.setWeatherProtected(true);
        emergencyStation.setSecurityLevel("MAXIMUM");
        emergencyStation.setContactInfo("emergency@example.com");
        emergencyStation.setOperationalHours("24/7");
        emergencyStation.setLastMaintenanceDate(LocalDateTime.now().minusDays(7));
        emergencyStation.setNextMaintenanceDue(LocalDateTime.now().plusDays(23));
        emergencyStation = entityManager.persistAndFlush(emergencyStation);

        entityManager.clear();
    }

    @Test
    @DisplayName("Should find docking stations by status")
    void testFindByStatus() {
        // When
        List<DockingStation> operationalStations = dockingStationRepository
                .findByStatus(DockingStation.StationStatus.OPERATIONAL);
        List<DockingStation> maintenanceStations = dockingStationRepository
                .findByStatus(DockingStation.StationStatus.MAINTENANCE);
        List<DockingStation> outOfServiceStations = dockingStationRepository
                .findByStatus(DockingStation.StationStatus.OUT_OF_SERVICE);

        // Then
        assertThat(operationalStations).hasSize(3);
        assertThat(operationalStations).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Central Station", "Fast Charging Station", "Emergency Response Station");

        assertThat(maintenanceStations).hasSize(1);
        assertThat(maintenanceStations.get(0).getName()).isEqualTo("Maintenance Hub");

        assertThat(outOfServiceStations).hasSize(1);
        assertThat(outOfServiceStations.get(0).getName()).isEqualTo("Offline Station");
    }

    @Test
    @DisplayName("Should find operational stations")
    void testFindOperationalStations() {
        // When
        List<DockingStation> result = dockingStationRepository.findOperationalStations();

        // Then
        assertThat(result).hasSize(3);
        assertThat(result).allMatch(station -> station.getStatus() == DockingStation.StationStatus.OPERATIONAL);
    }

    @Test
    @DisplayName("Should find available stations (operational and not full)")
    void testFindAvailableStations() {
        // When
        List<DockingStation> result = dockingStationRepository.findAvailableStations();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Central Station", "Emergency Response Station");
        assertThat(result).allMatch(station -> station.getStatus() == DockingStation.StationStatus.OPERATIONAL &&
                station.getCurrentOccupancy() < station.getMaxCapacity());
    }

    @Test
    @DisplayName("Should find docking stations by type")
    void testFindByStationType() {
        // When
        List<DockingStation> standardStations = dockingStationRepository
                .findByStationType(DockingStation.StationType.STANDARD);
        List<DockingStation> chargingStations = dockingStationRepository
                .findByStationType(DockingStation.StationType.CHARGING);
        List<DockingStation> maintenanceStations = dockingStationRepository
                .findByStationType(DockingStation.StationType.MAINTENANCE);
        List<DockingStation> emergencyStations = dockingStationRepository
                .findByStationType(DockingStation.StationType.EMERGENCY);

        // Then
        assertThat(standardStations).hasSize(2);
        assertThat(standardStations).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Central Station", "Offline Station");

        assertThat(chargingStations).hasSize(1);
        assertThat(chargingStations.get(0).getName()).isEqualTo("Fast Charging Station");

        assertThat(maintenanceStations).hasSize(1);
        assertThat(maintenanceStations.get(0).getName()).isEqualTo("Maintenance Hub");

        assertThat(emergencyStations).hasSize(1);
        assertThat(emergencyStations.get(0).getName()).isEqualTo("Emergency Response Station");
    }

    @Test
    @DisplayName("Should find stations with charging capability")
    void testFindByChargingAvailableTrue() {
        // When
        List<DockingStation> result = dockingStationRepository.findByChargingAvailableTrue();

        // Then
        assertThat(result).hasSize(4);
        assertThat(result).allMatch(DockingStation::getChargingAvailable);
        assertThat(result).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Central Station", "Maintenance Hub",
                        "Fast Charging Station", "Emergency Response Station");
    }

    @Test
    @DisplayName("Should find stations with maintenance capability")
    void testFindByMaintenanceAvailableTrue() {
        // When
        List<DockingStation> result = dockingStationRepository.findByMaintenanceAvailableTrue();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(DockingStation::getMaintenanceAvailable);
        assertThat(result).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Maintenance Hub", "Emergency Response Station");
    }

    @Test
    @DisplayName("Should find stations within geographical area")
    void testFindStationsInArea() {
        // Given - Define a bounding box around NYC (expanded to include all test
        // stations)
        Double minLat = 40.6800;
        Double maxLat = 40.8000;
        Double minLon = -74.1000;
        Double maxLon = -73.9000;

        // When
        List<DockingStation> result = dockingStationRepository
                .findStationsInArea(minLat, maxLat, minLon, maxLon);

        // Then
        assertThat(result).hasSize(5); // All stations should be in this area
        assertThat(result).allMatch(station -> station.getLatitude() >= minLat && station.getLatitude() <= maxLat &&
                station.getLongitude() >= minLon && station.getLongitude() <= maxLon);
    }

    @Test
    @DisplayName("Should find docking station by name")
    void testFindByName() {
        // When
        Optional<DockingStation> result = dockingStationRepository.findByName("Central Station");
        Optional<DockingStation> notFound = dockingStationRepository.findByName("Non-existent Station");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Central Station");
        assertThat(result.get().getDescription()).isEqualTo("Main operational docking station");

        assertThat(notFound).isEmpty();
    }

    @Test
    @DisplayName("Should find stations needing maintenance")
    void testFindStationsNeedingMaintenance() {
        // When
        List<DockingStation> result = dockingStationRepository.findStationsNeedingMaintenance();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Maintenance Hub", "Offline Station");
        assertThat(result).allMatch(station -> station.getNextMaintenanceDue() != null &&
                station.getNextMaintenanceDue().isBefore(LocalDateTime.now()));
    }

    @Test
    @DisplayName("Should count stations by status")
    void testCountByStatus() {
        // When
        long operationalCount = dockingStationRepository.countByStatus(DockingStation.StationStatus.OPERATIONAL);
        long maintenanceCount = dockingStationRepository.countByStatus(DockingStation.StationStatus.MAINTENANCE);
        long outOfServiceCount = dockingStationRepository.countByStatus(DockingStation.StationStatus.OUT_OF_SERVICE);
        long emergencyCount = dockingStationRepository.countByStatus(DockingStation.StationStatus.EMERGENCY);

        // Then
        assertThat(operationalCount).isEqualTo(3);
        assertThat(maintenanceCount).isEqualTo(1);
        assertThat(outOfServiceCount).isEqualTo(1);
        assertThat(emergencyCount).isEqualTo(0);
    }

    @Test
    @DisplayName("Should count stations with charging available")
    void testCountByChargingAvailable() {
        // When
        long chargingAvailableCount = dockingStationRepository.countByChargingAvailable(true);
        long chargingNotAvailableCount = dockingStationRepository.countByChargingAvailable(false);

        // Then
        assertThat(chargingAvailableCount).isEqualTo(4);
        assertThat(chargingNotAvailableCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Should count stations with maintenance available")
    void testCountByMaintenanceAvailable() {
        // When
        long maintenanceAvailableCount = dockingStationRepository.countByMaintenanceAvailable(true);
        long maintenanceNotAvailableCount = dockingStationRepository.countByMaintenanceAvailable(false);

        // Then
        assertThat(maintenanceAvailableCount).isEqualTo(2);
        assertThat(maintenanceNotAvailableCount).isEqualTo(3);
    }

    @Test
    @DisplayName("Should count stations with weather protection")
    void testCountByWeatherProtected() {
        // When
        long weatherProtectedCount = dockingStationRepository.countByWeatherProtected(true);
        long notWeatherProtectedCount = dockingStationRepository.countByWeatherProtected(false);

        // Then
        assertThat(weatherProtectedCount).isEqualTo(4);
        assertThat(notWeatherProtectedCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Should get total capacity across operational stations")
    void testGetTotalCapacity() {
        // When
        Integer totalCapacity = dockingStationRepository.getTotalCapacity();

        // Then
        // Operational stations: Central (10) + Fast Charging (6) + Emergency (3) = 19
        assertThat(totalCapacity).isEqualTo(19);
    }

    @Test
    @DisplayName("Should get current total occupancy across operational stations")
    void testGetCurrentTotalOccupancy() {
        // When
        Integer totalOccupancy = dockingStationRepository.getCurrentTotalOccupancy();

        // Then
        // Operational stations: Central (3) + Fast Charging (6) + Emergency (1) = 10
        assertThat(totalOccupancy).isEqualTo(10);
    }

    @Test
    @DisplayName("Should find stations by security level")
    void testFindBySecurityLevel() {
        // When
        List<DockingStation> highSecurityStations = dockingStationRepository.findBySecurityLevel("HIGH");
        List<DockingStation> mediumSecurityStations = dockingStationRepository.findBySecurityLevel("MEDIUM");
        List<DockingStation> lowSecurityStations = dockingStationRepository.findBySecurityLevel("LOW");
        List<DockingStation> maxSecurityStations = dockingStationRepository.findBySecurityLevel("MAXIMUM");

        // Then
        assertThat(highSecurityStations).hasSize(2);
        assertThat(highSecurityStations).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Central Station", "Fast Charging Station");

        assertThat(mediumSecurityStations).hasSize(1);
        assertThat(mediumSecurityStations.get(0).getName()).isEqualTo("Maintenance Hub");

        assertThat(lowSecurityStations).hasSize(1);
        assertThat(lowSecurityStations.get(0).getName()).isEqualTo("Offline Station");

        assertThat(maxSecurityStations).hasSize(1);
        assertThat(maxSecurityStations.get(0).getName()).isEqualTo("Emergency Response Station");
    }

    @Test
    @DisplayName("Should find weather protected stations")
    void testFindByWeatherProtectedTrue() {
        // When
        List<DockingStation> result = dockingStationRepository.findByWeatherProtectedTrue();

        // Then
        assertThat(result).hasSize(4);
        assertThat(result).allMatch(DockingStation::getWeatherProtected);
        assertThat(result).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Central Station", "Maintenance Hub",
                        "Fast Charging Station", "Emergency Response Station");
    }

    @Test
    @DisplayName("Should find stations with available capacity")
    void testFindStationsWithCapacity() {
        // When
        List<DockingStation> result = dockingStationRepository.findStationsWithCapacity();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Central Station", "Emergency Response Station");
        assertThat(result).allMatch(station -> station.getCurrentOccupancy() < station.getMaxCapacity() &&
                station.getStatus() == DockingStation.StationStatus.OPERATIONAL);
    }

    @Test
    @DisplayName("Should find full stations")
    void testFindFullStations() {
        // When
        List<DockingStation> result = dockingStationRepository.findFullStations();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Fast Charging Station");
        assertThat(result.get(0).getCurrentOccupancy()).isEqualTo(result.get(0).getMaxCapacity());
    }

    @Test
    @DisplayName("Should find stations by multiple criteria")
    void testFindStationsByCriteria() {
        // When - Find operational charging stations
        List<DockingStation> operationalChargingStations = dockingStationRepository
                .findStationsByCriteria(DockingStation.StationStatus.OPERATIONAL,
                        DockingStation.StationType.CHARGING,
                        true, null);

        // When - Find stations with maintenance capability
        List<DockingStation> maintenanceCapableStations = dockingStationRepository
                .findStationsByCriteria(null, null, null, true);

        // When - Find operational standard stations
        List<DockingStation> operationalStandardStations = dockingStationRepository
                .findStationsByCriteria(DockingStation.StationStatus.OPERATIONAL,
                        DockingStation.StationType.STANDARD,
                        null, null);

        // Then
        assertThat(operationalChargingStations).hasSize(1);
        assertThat(operationalChargingStations.get(0).getName()).isEqualTo("Fast Charging Station");

        assertThat(maintenanceCapableStations).hasSize(2);
        assertThat(maintenanceCapableStations).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Maintenance Hub", "Emergency Response Station");

        assertThat(operationalStandardStations).hasSize(1);
        assertThat(operationalStandardStations.get(0).getName()).isEqualTo("Central Station");
    }

    @Test
    @DisplayName("Should handle empty results gracefully")
    void testEmptyResults() {
        // When
        List<DockingStation> nonExistentStatus = dockingStationRepository
                .findByStatus(DockingStation.StationStatus.EMERGENCY);
        List<DockingStation> nonExistentType = dockingStationRepository
                .findByStationType(DockingStation.StationType.TEMPORARY);
        List<DockingStation> nonExistentSecurity = dockingStationRepository
                .findBySecurityLevel("ULTRA");

        // Then
        assertThat(nonExistentStatus).isEmpty();
        assertThat(nonExistentType).isEmpty();
        assertThat(nonExistentSecurity).isEmpty();
    }

    @Test
    @DisplayName("Should handle null parameters in criteria search")
    void testFindStationsByCriteriaWithNulls() {
        // When - All parameters null should return all stations
        List<DockingStation> allStations = dockingStationRepository
                .findStationsByCriteria(null, null, null, null);

        // Then
        assertThat(allStations).hasSize(5);
    }

    @Test
    @DisplayName("Should handle boundary geographical searches")
    void testFindStationsInAreaBoundary() {
        // Given - Very narrow area that should include only one station
        Double minLat = 40.7120;
        Double maxLat = 40.7130;
        Double minLon = -74.0070;
        Double maxLon = -74.0050;

        // When
        List<DockingStation> result = dockingStationRepository
                .findStationsInArea(minLat, maxLat, minLon, maxLon);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Central Station");
    }

    @Test
    @DisplayName("Should handle edge cases for capacity calculations")
    void testCapacityCalculationsEdgeCases() {
        // Given - Create a station with zero capacity
        DockingStation zeroCapacityStation = new DockingStation();
        zeroCapacityStation.setName("Zero Capacity Station");
        zeroCapacityStation.setLatitude(40.0);
        zeroCapacityStation.setLongitude(-74.0);
        zeroCapacityStation.setMaxCapacity(0);
        zeroCapacityStation.setCurrentOccupancy(0);
        zeroCapacityStation.setStatus(DockingStation.StationStatus.OPERATIONAL);
        zeroCapacityStation.setStationType(DockingStation.StationType.STANDARD);
        entityManager.persistAndFlush(zeroCapacityStation);

        // When
        Integer totalCapacity = dockingStationRepository.getTotalCapacity();
        Integer totalOccupancy = dockingStationRepository.getCurrentTotalOccupancy();
        List<DockingStation> availableStations = dockingStationRepository.findAvailableStations();

        // Then
        assertThat(totalCapacity).isEqualTo(19); // Should not include zero capacity station
        assertThat(totalOccupancy).isEqualTo(10); // Should not change
        assertThat(availableStations).hasSize(2); // Zero capacity station should not be available
    }

    @Test
    @DisplayName("Should validate station data integrity")
    void testStationDataIntegrity() {
        // When
        List<DockingStation> allStations = dockingStationRepository.findAll();

        // Then
        assertThat(allStations).hasSize(5);
        assertThat(allStations).allMatch(station -> station.getName() != null);
        assertThat(allStations).allMatch(station -> station.getLatitude() != null);
        assertThat(allStations).allMatch(station -> station.getLongitude() != null);
        assertThat(allStations).allMatch(station -> station.getMaxCapacity() != null);
        assertThat(allStations).allMatch(station -> station.getCurrentOccupancy() != null);
        assertThat(allStations).allMatch(station -> station.getStatus() != null);
        assertThat(allStations).allMatch(station -> station.getStationType() != null);
        assertThat(allStations).allMatch(station -> station.getCurrentOccupancy() >= 0 &&
                station.getCurrentOccupancy() <= station.getMaxCapacity());
    }

    @Test
    @DisplayName("Should handle case-sensitive name searches")
    void testFindByNameCaseSensitive() {
        // When
        Optional<DockingStation> exactCase = dockingStationRepository.findByName("Central Station");
        Optional<DockingStation> wrongCase = dockingStationRepository.findByName("central station");
        Optional<DockingStation> partialName = dockingStationRepository.findByName("Central");

        // Then
        assertThat(exactCase).isPresent();
        assertThat(wrongCase).isEmpty(); // Should be case-sensitive
        assertThat(partialName).isEmpty(); // Should be exact match
    }

    @Test
    @DisplayName("Should validate maintenance due date logic")
    void testMaintenanceDueDateLogic() {
        // When
        List<DockingStation> needsMaintenance = dockingStationRepository.findStationsNeedingMaintenance();

        // Then
        assertThat(needsMaintenance).hasSize(2);
        assertThat(needsMaintenance).allMatch(station -> station.getNextMaintenanceDue() != null &&
                station.getNextMaintenanceDue().isBefore(LocalDateTime.now()));

        // Verify specific stations
        assertThat(needsMaintenance).extracting(DockingStation::getName)
                .containsExactlyInAnyOrder("Maintenance Hub", "Offline Station");
    }
}
