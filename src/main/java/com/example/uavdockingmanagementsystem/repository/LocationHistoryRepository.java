package com.example.uavdockingmanagementsystem.repository;

import com.example.uavdockingmanagementsystem.model.LocationHistory;
import com.example.uavdockingmanagementsystem.model.UAV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for LocationHistory entity
 * Provides data access methods for UAV location tracking
 */
@Repository
public interface LocationHistoryRepository extends JpaRepository<LocationHistory, Long> {

    /**
     * Find location history for a specific UAV
     */
    List<LocationHistory> findByUavOrderByTimestampDesc(UAV uav);

    /**
     * Find location history for a UAV by ID
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.uav.id = :uavId ORDER BY lh.timestamp DESC")
    List<LocationHistory> findByUavIdOrderByTimestampDesc(@Param("uavId") Integer uavId);

    /**
     * Find recent location history for a UAV (last N records)
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.uav.id = :uavId ORDER BY lh.timestamp DESC LIMIT :limit")
    List<LocationHistory> findRecentLocationsByUavId(@Param("uavId") Integer uavId, @Param("limit") Integer limit);

    /**
     * Find location history by UAV ID and timestamp range ordered by timestamp descending
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.uav.id = :uavId AND lh.timestamp BETWEEN :startTime AND :endTime ORDER BY lh.timestamp DESC")
    List<LocationHistory> findByUavIdAndTimestampBetweenOrderByTimestampDesc(@Param("uavId") Integer uavId,
                                                                            @Param("startTime") LocalDateTime startTime,
                                                                            @Param("endTime") LocalDateTime endTime);

    /**
     * Find location history within a time range
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.uav.id = :uavId AND lh.timestamp BETWEEN :startTime AND :endTime ORDER BY lh.timestamp")
    List<LocationHistory> findByUavIdAndTimestampBetween(@Param("uavId") Integer uavId,
                                                        @Param("startTime") LocalDateTime startTime,
                                                        @Param("endTime") LocalDateTime endTime);

    /**
     * Find latest location for a UAV
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.uav.id = :uavId ORDER BY lh.timestamp DESC LIMIT 1")
    Optional<LocationHistory> findLatestLocationByUavId(@Param("uavId") Integer uavId);

    /**
     * Find location history within a geographical area
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE " +
           "lh.latitude BETWEEN :minLat AND :maxLat AND " +
           "lh.longitude BETWEEN :minLon AND :maxLon AND " +
           "lh.timestamp BETWEEN :startTime AND :endTime " +
           "ORDER BY lh.timestamp DESC")
    List<LocationHistory> findLocationsInArea(@Param("minLat") Double minLatitude,
                                            @Param("maxLat") Double maxLatitude,
                                            @Param("minLon") Double minLongitude,
                                            @Param("maxLon") Double maxLongitude,
                                            @Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);

    /**
     * Find all UAVs with location data in the last N minutes
     */
    @Query("SELECT DISTINCT lh.uav FROM LocationHistory lh WHERE lh.timestamp > :since")
    List<UAV> findActiveUAVsSince(@Param("since") LocalDateTime since);

    /**
     * Find location history for flight log
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.flightLog.id = :flightLogId ORDER BY lh.timestamp")
    List<LocationHistory> findByFlightLogId(@Param("flightLogId") Long flightLogId);

    /**
     * Find locations with high accuracy
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.accuracyMeters <= :maxAccuracy ORDER BY lh.timestamp DESC")
    List<LocationHistory> findHighAccuracyLocations(@Param("maxAccuracy") Double maxAccuracy);

    /**
     * Find locations by source type
     */
    List<LocationHistory> findByLocationSourceOrderByTimestampDesc(LocationHistory.LocationSource locationSource);

    /**
     * Count location records for a UAV
     */
    long countByUav(UAV uav);

    /**
     * Count location records for a UAV in time range
     */
    @Query("SELECT COUNT(lh) FROM LocationHistory lh WHERE lh.uav.id = :uavId AND lh.timestamp BETWEEN :startTime AND :endTime")
    long countByUavIdAndTimestampBetween(@Param("uavId") Integer uavId,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);

    /**
     * Delete old location records (for cleanup)
     */
    @Query("DELETE FROM LocationHistory lh WHERE lh.timestamp < :cutoffTime")
    void deleteOldRecords(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find locations with low battery
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.batteryLevel <= :threshold ORDER BY lh.timestamp DESC")
    List<LocationHistory> findLowBatteryLocations(@Param("threshold") Integer threshold);

    /**
     * Find locations with speed above threshold
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.speedKmh > :speedThreshold ORDER BY lh.timestamp DESC")
    List<LocationHistory> findHighSpeedLocations(@Param("speedThreshold") Double speedThreshold);

    /**
     * Find locations at high altitude
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.altitudeMeters > :altitudeThreshold ORDER BY lh.timestamp DESC")
    List<LocationHistory> findHighAltitudeLocations(@Param("altitudeThreshold") Double altitudeThreshold);

    /**
     * Get flight path for UAV (simplified)
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.uav.id = :uavId AND lh.timestamp BETWEEN :startTime AND :endTime ORDER BY lh.timestamp")
    List<LocationHistory> getFlightPath(@Param("uavId") Integer uavId,
                                      @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime);

    /**
     * Find locations near a point
     */
    @Query(value = "SELECT *, " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(latitude)))) AS distance " +
           "FROM location_history " +
           "WHERE timestamp > :since " +
           "HAVING distance <= :radiusKm " +
           "ORDER BY timestamp DESC", nativeQuery = true)
    List<LocationHistory> findLocationsNearPoint(@Param("latitude") Double latitude,
                                                @Param("longitude") Double longitude,
                                                @Param("radiusKm") Double radiusKm,
                                                @Param("since") LocalDateTime since);

    /**
     * Get average speed for UAV in time period
     */
    @Query("SELECT AVG(lh.speedKmh) FROM LocationHistory lh WHERE lh.uav.id = :uavId AND lh.timestamp BETWEEN :startTime AND :endTime AND lh.speedKmh IS NOT NULL")
    Double getAverageSpeed(@Param("uavId") Integer uavId,
                          @Param("startTime") LocalDateTime startTime,
                          @Param("endTime") LocalDateTime endTime);

    /**
     * Get maximum altitude for UAV in time period
     */
    @Query("SELECT MAX(lh.altitudeMeters) FROM LocationHistory lh WHERE lh.uav.id = :uavId AND lh.timestamp BETWEEN :startTime AND :endTime AND lh.altitudeMeters IS NOT NULL")
    Double getMaxAltitude(@Param("uavId") Integer uavId,
                         @Param("startTime") LocalDateTime startTime,
                         @Param("endTime") LocalDateTime endTime);

    /**
     * Find locations with poor signal strength
     */
    @Query("SELECT lh FROM LocationHistory lh WHERE lh.signalStrength < :threshold ORDER BY lh.timestamp DESC")
    List<LocationHistory> findPoorSignalLocations(@Param("threshold") Integer threshold);
}
