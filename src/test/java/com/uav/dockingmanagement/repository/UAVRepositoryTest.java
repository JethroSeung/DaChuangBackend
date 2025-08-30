package com.uav.dockingmanagement.repository;

import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.model.UAV;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive repository tests for UAVRepository
 * Tests custom queries, JPA relationships, and data access patterns
 */
@DataJpaTest
@ActiveProfiles("test")
class UAVRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private RegionRepository regionRepository;

    private UAV testUAV1;
    private UAV testUAV2;
    private UAV testUAV3;
    private Region testRegion1;
    private Region testRegion2;

    @BeforeEach
    void setUp() {
        // Create test regions
        testRegion1 = new Region();
        testRegion1.setRegionName("North Region");
        testRegion1 = entityManager.persistAndFlush(testRegion1);

        testRegion2 = new Region();
        testRegion2.setRegionName("South Region");
        testRegion2 = entityManager.persistAndFlush(testRegion2);

        // Create test UAVs
        testUAV1 = new UAV();
        testUAV1.setRfidTag("UAV-001");
        testUAV1.setOwnerName("John Smith");
        testUAV1.setModel("DJI Phantom 4");
        testUAV1.setStatus(UAV.Status.AUTHORIZED);
        testUAV1.setOperationalStatus(UAV.OperationalStatus.READY);
        testUAV1.setCurrentLatitude(40.7589);
        testUAV1.setCurrentLongitude(-73.9851);
        testUAV1.setCurrentAltitudeMeters(50.0);
        testUAV1.setInHibernatePod(false);
        Set<Region> regions1 = new HashSet<>();
        regions1.add(testRegion1);
        testUAV1.setRegions(regions1);
        testUAV1 = entityManager.persistAndFlush(testUAV1);

        testUAV2 = new UAV();
        testUAV2.setRfidTag("UAV-002");
        testUAV2.setOwnerName("Jane Doe");
        testUAV2.setModel("DJI Mavic Pro");
        testUAV2.setStatus(UAV.Status.UNAUTHORIZED);
        testUAV2.setOperationalStatus(UAV.OperationalStatus.MAINTENANCE);
        testUAV2.setCurrentLatitude(40.7128);
        testUAV2.setCurrentLongitude(-74.0060);
        testUAV2.setCurrentAltitudeMeters(75.0);
        testUAV2.setInHibernatePod(true);
        Set<Region> regions2 = new HashSet<>();
        regions2.add(testRegion1);
        regions2.add(testRegion2);
        testUAV2.setRegions(regions2);
        testUAV2 = entityManager.persistAndFlush(testUAV2);

        testUAV3 = new UAV();
        testUAV3.setRfidTag("UAV-003");
        testUAV3.setOwnerName("Bob Johnson");
        testUAV3.setModel("Parrot Anafi");
        testUAV3.setStatus(UAV.Status.AUTHORIZED);
        testUAV3.setOperationalStatus(UAV.OperationalStatus.READY);
        testUAV3.setCurrentLatitude(40.6892);
        testUAV3.setCurrentLongitude(-74.0445);
        testUAV3.setCurrentAltitudeMeters(100.0);
        testUAV3.setInHibernatePod(false);
        testUAV3.setRegions(new HashSet<>()); // No regions assigned
        testUAV3 = entityManager.persistAndFlush(testUAV3);

        entityManager.clear();
    }

    @Test
    @DisplayName("Should find UAV by RFID tag")
    void testFindByRfidTag() {
        // When
        Optional<UAV> result = uavRepository.findByRfidTag("UAV-001");

        // Then
        assertTrue(result.isPresent());
        assertEquals("UAV-001", result.get().getRfidTag());
        assertEquals("John Smith", result.get().getOwnerName());
    }

    @Test
    @DisplayName("Should return empty when RFID tag not found")
    void testFindByRfidTagNotFound() {
        // When
        Optional<UAV> result = uavRepository.findByRfidTag("NONEXISTENT");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should find UAV by RFID tag with regions eagerly loaded")
    void testFindByRfidTagWithRegions() {
        // When
        Optional<UAV> result = uavRepository.findByRfidTagWithRegions("UAV-002");

        // Then
        assertTrue(result.isPresent());
        UAV uav = result.get();
        assertEquals("UAV-002", uav.getRfidTag());
        assertEquals(2, uav.getRegions().size());

        // Verify regions are loaded (no lazy loading exception)
        assertDoesNotThrow(() -> {
            uav.getRegions().forEach(region -> region.getRegionName());
        });
    }

    @Test
    @DisplayName("Should find all UAVs with regions eagerly loaded")
    void testFindAllWithRegions() {
        // When
        List<UAV> result = uavRepository.findAllWithRegions();

        // Then
        assertEquals(3, result.size());

        // Verify all UAVs have regions loaded
        result.forEach(uav -> {
            assertDoesNotThrow(() -> {
                uav.getRegions().forEach(region -> region.getRegionName());
            });
        });
    }

    @Test
    @DisplayName("Should find UAVs by region ID")
    void testFindByRegionId() {
        // When
        List<UAV> result = uavRepository.findByRegionId(testRegion1.getId());

        // Then
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(uav -> "UAV-001".equals(uav.getRfidTag())));
        assertTrue(result.stream().anyMatch(uav -> "UAV-002".equals(uav.getRfidTag())));
    }

    @Test
    @DisplayName("Should return empty list when no UAVs in region")
    void testFindByRegionIdEmpty() {
        // Create a new region with no UAVs
        Region emptyRegion = new Region();
        emptyRegion.setRegionName("Empty Region");
        emptyRegion = entityManager.persistAndFlush(emptyRegion);

        // When
        List<UAV> result = uavRepository.findByRegionId(emptyRegion.getId());

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should find UAVs in hibernate pod")
    void testFindByInHibernatePod() {
        // When
        List<UAV> result = uavRepository.findByInHibernatePod(true);

        // Then
        assertEquals(1, result.size());
        assertEquals("UAV-002", result.get(0).getRfidTag());
        assertTrue(result.get(0).isInHibernatePod());
    }

    @Test
    @DisplayName("Should find UAVs not in hibernate pod")
    void testFindByInHibernatePodFalse() {
        // When
        List<UAV> result = uavRepository.findByInHibernatePod(false);

        // Then
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(uav -> "UAV-001".equals(uav.getRfidTag())));
        assertTrue(result.stream().anyMatch(uav -> "UAV-003".equals(uav.getRfidTag())));
        assertTrue(result.stream().allMatch(uav -> !uav.isInHibernatePod()));
    }

    @Test
    @DisplayName("Should find UAVs by status")
    void testFindByStatus() {
        // When
        List<UAV> authorizedUAVs = uavRepository.findByStatus(UAV.Status.AUTHORIZED);
        List<UAV> unauthorizedUAVs = uavRepository.findByStatus(UAV.Status.UNAUTHORIZED);

        // Then
        assertEquals(2, authorizedUAVs.size());
        assertTrue(authorizedUAVs.stream().anyMatch(uav -> "UAV-001".equals(uav.getRfidTag())));
        assertTrue(authorizedUAVs.stream().anyMatch(uav -> "UAV-003".equals(uav.getRfidTag())));

        assertEquals(1, unauthorizedUAVs.size());
        assertEquals("UAV-002", unauthorizedUAVs.get(0).getRfidTag());
    }

    @Test
    @DisplayName("Should return correct count for existing status")
    void testFindByStatusCount() {
        // When
        List<UAV> authorizedResult = uavRepository.findByStatus(UAV.Status.AUTHORIZED);
        List<UAV> unauthorizedResult = uavRepository.findByStatus(UAV.Status.UNAUTHORIZED);

        // Then
        assertEquals(2, authorizedResult.size()); // UAV-001 and UAV-003
        assertEquals(1, unauthorizedResult.size()); // UAV-002
    }

    @Test
    @DisplayName("Should save and retrieve UAV with all properties")
    void testSaveAndRetrieveUAV() {
        // Given
        UAV newUAV = new UAV();
        newUAV.setRfidTag("UAV-NEW");
        newUAV.setOwnerName("New Owner");
        newUAV.setModel("New Model");
        newUAV.setStatus(UAV.Status.AUTHORIZED);
        newUAV.setOperationalStatus(UAV.OperationalStatus.MAINTENANCE);
        newUAV.setCurrentLatitude(41.0);
        newUAV.setCurrentLongitude(-74.5);
        newUAV.setCurrentAltitudeMeters(200.0);
        newUAV.setInHibernatePod(true);
        newUAV.setRegions(new HashSet<>());

        // When
        UAV savedUAV = uavRepository.save(newUAV);
        entityManager.flush();
        entityManager.clear();
        Optional<UAV> retrievedUAV = uavRepository.findById(savedUAV.getId());

        // Then
        assertTrue(retrievedUAV.isPresent());
        UAV uav = retrievedUAV.get();
        assertEquals("UAV-NEW", uav.getRfidTag());
        assertEquals("New Owner", uav.getOwnerName());
        assertEquals("New Model", uav.getModel());
        assertEquals(UAV.Status.AUTHORIZED, uav.getStatus());
        assertEquals(UAV.OperationalStatus.MAINTENANCE, uav.getOperationalStatus());
        assertEquals(41.0, uav.getCurrentLatitude());
        assertEquals(-74.5, uav.getCurrentLongitude());
        assertEquals(200.0, uav.getCurrentAltitudeMeters());
        assertTrue(uav.isInHibernatePod());
    }

    @Test
    @DisplayName("Should update UAV properties")
    void testUpdateUAV() {
        // Given
        UAV uav = uavRepository.findByRfidTag("UAV-001").orElseThrow();
        String originalOwner = uav.getOwnerName();

        // When
        uav.setOwnerName("Updated Owner");
        uav.setStatus(UAV.Status.UNAUTHORIZED);
        uavRepository.save(uav);
        entityManager.flush();
        entityManager.clear();

        // Then
        UAV retrievedUAV = uavRepository.findByRfidTag("UAV-001").orElseThrow();
        assertEquals("Updated Owner", retrievedUAV.getOwnerName());
        assertEquals(UAV.Status.UNAUTHORIZED, retrievedUAV.getStatus());
        assertNotEquals(originalOwner, retrievedUAV.getOwnerName());
    }

    @Test
    @DisplayName("Should delete UAV")
    void testDeleteUAV() {
        // Given
        UAV uav = uavRepository.findByRfidTag("UAV-003").orElseThrow();
        Integer uavId = uav.getId();

        // When
        uavRepository.delete(uav);
        entityManager.flush();

        // Then
        assertFalse(uavRepository.findById(uavId).isPresent());
        assertFalse(uavRepository.findByRfidTag("UAV-003").isPresent());
    }

    @Test
    @DisplayName("Should handle UAV-Region many-to-many relationship")
    void testUAVRegionRelationship() {
        // Given
        UAV uav = uavRepository.findByRfidTag("UAV-003").orElseThrow();
        assertTrue(uav.getRegions().isEmpty());

        // When - Add regions to UAV
        uav.getRegions().add(testRegion1);
        uav.getRegions().add(testRegion2);
        uavRepository.save(uav);
        entityManager.flush();
        entityManager.clear();

        // Then
        UAV retrievedUAV = uavRepository.findByRfidTagWithRegions("UAV-003").orElseThrow();
        assertEquals(2, retrievedUAV.getRegions().size());
        assertTrue(retrievedUAV.getRegions().stream()
                .anyMatch(region -> "North Region".equals(region.getRegionName())));
        assertTrue(retrievedUAV.getRegions().stream()
                .anyMatch(region -> "South Region".equals(region.getRegionName())));
    }

    @Test
    @DisplayName("Should count UAVs correctly")
    void testCountUAVs() {
        // When
        long count = uavRepository.count();

        // Then
        assertEquals(3, count);
    }

    @Test
    @DisplayName("Should check if UAV exists by RFID tag")
    void testExistsByRfidTag() {
        // When & Then
        assertTrue(uavRepository.findByRfidTag("UAV-001").isPresent());
        assertTrue(uavRepository.findByRfidTag("UAV-002").isPresent());
        assertTrue(uavRepository.findByRfidTag("UAV-003").isPresent());
        assertFalse(uavRepository.findByRfidTag("NONEXISTENT").isPresent());
    }

    @Test
    @DisplayName("Should handle case sensitivity in RFID tag search")
    void testRfidTagCaseSensitivity() {
        // When & Then
        assertTrue(uavRepository.findByRfidTag("UAV-001").isPresent());
        assertFalse(uavRepository.findByRfidTag("uav-001").isPresent());
        assertFalse(uavRepository.findByRfidTag("UAV-001 ").isPresent()); // With space
    }

    @Test
    @DisplayName("Should handle null and empty parameters gracefully")
    void testNullAndEmptyParameters() {
        // When & Then
        assertFalse(uavRepository.findByRfidTag(null).isPresent());
        assertFalse(uavRepository.findByRfidTag("").isPresent());

        assertTrue(uavRepository.findByRegionId(-1).isEmpty());

        assertNotNull(uavRepository.findByStatus(null));
    }
}
