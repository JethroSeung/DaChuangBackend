package com.uav.dockingmanagement.repository;
import com.uav.dockingmanagement.model.UAV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UAVRepository extends JpaRepository<UAV, Integer> {
    @Query("SELECT DISTINCT u FROM UAV u LEFT JOIN FETCH u.regions")
    List<UAV> findAllWithRegions();

    @Query("SELECT DISTINCT u FROM UAV u JOIN u.regions r WHERE r.id = :regionId")
    List<UAV> findByRegionId(@Param("regionId") int regionId);

    Optional<UAV> findByRfidTag(String rfidTag);

    @Query("SELECT DISTINCT u FROM UAV u LEFT JOIN FETCH u.regions WHERE u.rfidTag = :rfidTag")
    Optional<UAV> findByRfidTagWithRegions(@Param("rfidTag") String rfidTag);

    /**
     * Find UAVs by hibernate pod status
     */
    List<UAV> findByInHibernatePod(boolean inHibernatePod);

    /**
     * Find UAVs by status
     */
    List<UAV> findByStatus(UAV.Status status);

    /**
     * Count UAVs in hibernate pod
     */
    long countByInHibernatePod(boolean inHibernatePod);

    /**
     * Find UAVs by operational status
     */
    List<UAV> findByOperationalStatus(UAV.OperationalStatus operationalStatus);

    /**
     * Find all UAVs with current location data
     */
    @Query("SELECT u FROM UAV u WHERE u.currentLatitude IS NOT NULL AND u.currentLongitude IS NOT NULL")
    List<UAV> findAllWithCurrentLocation();

    /**
     * Find UAVs in a specific area
     */
    @Query("SELECT u FROM UAV u WHERE u.currentLatitude BETWEEN :minLat AND :maxLat AND u.currentLongitude BETWEEN :minLon AND :maxLon")
    List<UAV> findUAVsInArea(@Param("minLat") Double minLatitude, @Param("maxLat") Double maxLatitude,
                            @Param("minLon") Double minLongitude, @Param("maxLon") Double maxLongitude);

    /**
     * Find nearby UAVs within radius (simplified version)
     */
    @Query("SELECT u FROM UAV u WHERE u.currentLatitude IS NOT NULL AND u.currentLongitude IS NOT NULL")
    List<UAV> findNearbyUAVs(@Param("latitude") Double latitude, @Param("longitude") Double longitude, @Param("radiusKm") Double radiusKm);

    /**
     * Count UAVs with location data
     */
    @Query("SELECT COUNT(u) FROM UAV u WHERE u.currentLatitude IS NOT NULL AND u.currentLongitude IS NOT NULL")
    long countUAVsWithLocation();
}


