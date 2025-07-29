package com.example.uavdockingmanagementsystem.repository;

import com.example.uavdockingmanagementsystem.model.DockingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DockingStation entity
 * Provides data access methods for docking station operations
 */
@Repository
public interface DockingStationRepository extends JpaRepository<DockingStation, Long> {

    /**
     * Find docking stations by status
     */
    List<DockingStation> findByStatus(DockingStation.StationStatus status);

    /**
     * Find operational docking stations
     */
    @Query("SELECT ds FROM DockingStation ds WHERE ds.status = 'OPERATIONAL'")
    List<DockingStation> findOperationalStations();

    /**
     * Find available docking stations (operational and not full)
     */
    @Query("SELECT ds FROM DockingStation ds WHERE ds.status = 'OPERATIONAL' AND ds.currentOccupancy < ds.maxCapacity")
    List<DockingStation> findAvailableStations();

    /**
     * Find docking stations by type
     */
    List<DockingStation> findByStationType(DockingStation.StationType stationType);

    /**
     * Find docking stations with charging capability
     */
    List<DockingStation> findByChargingAvailableTrue();

    /**
     * Find docking stations with maintenance capability
     */
    List<DockingStation> findByMaintenanceAvailableTrue();

    /**
     * Find docking stations within a geographical area
     */
    @Query("SELECT ds FROM DockingStation ds WHERE " +
           "ds.latitude BETWEEN :minLat AND :maxLat AND " +
           "ds.longitude BETWEEN :minLon AND :maxLon")
    List<DockingStation> findStationsInArea(@Param("minLat") Double minLatitude,
                                           @Param("maxLat") Double maxLatitude,
                                           @Param("minLon") Double minLongitude,
                                           @Param("maxLon") Double maxLongitude);

    /**
     * Find nearest docking stations to a given point
     */
    @Query(value = "SELECT *, " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(latitude)))) AS distance " +
           "FROM docking_stations " +
           "WHERE status = 'OPERATIONAL' " +
           "ORDER BY distance LIMIT :limit", nativeQuery = true)
    List<DockingStation> findNearestStations(@Param("latitude") Double latitude,
                                           @Param("longitude") Double longitude,
                                           @Param("limit") Integer limit);

    /**
     * Find docking station by name
     */
    Optional<DockingStation> findByName(String name);

    /**
     * Find stations that need maintenance
     */
    @Query("SELECT ds FROM DockingStation ds WHERE ds.nextMaintenanceDue < CURRENT_TIMESTAMP")
    List<DockingStation> findStationsNeedingMaintenance();

    /**
     * Count stations by status
     */
    long countByStatus(DockingStation.StationStatus status);

    /**
     * Count stations with charging available
     */
    long countByChargingAvailable(Boolean chargingAvailable);

    /**
     * Count stations with maintenance available
     */
    long countByMaintenanceAvailable(Boolean maintenanceAvailable);

    /**
     * Count stations with weather protection
     */
    long countByWeatherProtected(Boolean weatherProtected);

    /**
     * Get total capacity across all operational stations
     */
    @Query("SELECT SUM(ds.maxCapacity) FROM DockingStation ds WHERE ds.status = 'OPERATIONAL'")
    Integer getTotalCapacity();

    /**
     * Get current total occupancy across all operational stations
     */
    @Query("SELECT SUM(ds.currentOccupancy) FROM DockingStation ds WHERE ds.status = 'OPERATIONAL'")
    Integer getCurrentTotalOccupancy();

    /**
     * Find stations with specific security level
     */
    List<DockingStation> findBySecurityLevel(String securityLevel);

    /**
     * Find weather protected stations
     */
    List<DockingStation> findByWeatherProtectedTrue();

    /**
     * Find stations with available capacity
     */
    @Query("SELECT ds FROM DockingStation ds WHERE ds.currentOccupancy < ds.maxCapacity AND ds.status = 'OPERATIONAL'")
    List<DockingStation> findStationsWithCapacity();

    /**
     * Find full stations
     */
    @Query("SELECT ds FROM DockingStation ds WHERE ds.currentOccupancy >= ds.maxCapacity")
    List<DockingStation> findFullStations();

    /**
     * Update station occupancy
     */
    @Query("UPDATE DockingStation ds SET ds.currentOccupancy = :occupancy WHERE ds.id = :stationId")
    void updateOccupancy(@Param("stationId") Long stationId, @Param("occupancy") Integer occupancy);

    /**
     * Find stations by multiple criteria
     */
    @Query("SELECT ds FROM DockingStation ds WHERE " +
           "(:status IS NULL OR ds.status = :status) AND " +
           "(:stationType IS NULL OR ds.stationType = :stationType) AND " +
           "(:chargingRequired IS NULL OR ds.chargingAvailable = :chargingRequired) AND " +
           "(:maintenanceRequired IS NULL OR ds.maintenanceAvailable = :maintenanceRequired)")
    List<DockingStation> findStationsByCriteria(@Param("status") DockingStation.StationStatus status,
                                               @Param("stationType") DockingStation.StationType stationType,
                                               @Param("chargingRequired") Boolean chargingRequired,
                                               @Param("maintenanceRequired") Boolean maintenanceRequired);
}
