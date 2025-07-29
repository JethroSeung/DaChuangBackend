package com.example.uavdockingmanagementsystem.repository;

import com.example.uavdockingmanagementsystem.model.DockingRecord;
import com.example.uavdockingmanagementsystem.model.DockingStation;
import com.example.uavdockingmanagementsystem.model.UAV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DockingRecord entity
 * Provides data access methods for docking history and operations
 */
@Repository
public interface DockingRecordRepository extends JpaRepository<DockingRecord, Long> {

    /**
     * Find docking records for a specific UAV
     */
    List<DockingRecord> findByUavOrderByDockTimeDesc(UAV uav);

    /**
     * Find docking records for a UAV by ID
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.uav.id = :uavId ORDER BY dr.dockTime DESC")
    List<DockingRecord> findByUavIdOrderByDockTimeDesc(@Param("uavId") Integer uavId);

    /**
     * Find docking records for a specific docking station
     */
    List<DockingRecord> findByDockingStationOrderByDockTimeDesc(DockingStation dockingStation);

    /**
     * Find docking records for a station by ID
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.dockingStation.id = :stationId ORDER BY dr.dockTime DESC")
    List<DockingRecord> findByDockingStationIdOrderByDockTimeDesc(@Param("stationId") Long stationId);

    /**
     * Find currently docked UAVs
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.status = 'DOCKED' AND dr.undockTime IS NULL")
    List<DockingRecord> findCurrentlyDockedUAVs();

    /**
     * Find currently docked UAVs at a specific station
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.dockingStation.id = :stationId AND dr.status = 'DOCKED' AND dr.undockTime IS NULL")
    List<DockingRecord> findCurrentlyDockedAtStation(@Param("stationId") Long stationId);

    /**
     * Find if UAV is currently docked
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.uav.id = :uavId AND dr.status = 'DOCKED' AND dr.undockTime IS NULL")
    Optional<DockingRecord> findCurrentDockingByUavId(@Param("uavId") Integer uavId);

    /**
     * Find active docking record by UAV ID (alias for test compatibility)
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.uav.id = :uavId AND dr.status = 'DOCKED' AND dr.undockTime IS NULL")
    Optional<DockingRecord> findActiveByUavId(@Param("uavId") Integer uavId);

    /**
     * Find docking records by status
     */
    List<DockingRecord> findByStatusOrderByDockTimeDesc(DockingRecord.DockingStatus status);

    /**
     * Find docking records within time range
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.dockTime BETWEEN :startTime AND :endTime ORDER BY dr.dockTime DESC")
    List<DockingRecord> findByDockTimeBetween(@Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);

    /**
     * Find docking records by purpose
     */
    List<DockingRecord> findByPurposeOrderByDockTimeDesc(String purpose);

    /**
     * Find long-duration docking records
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.totalDockingDurationMinutes > :minDurationMinutes ORDER BY dr.totalDockingDurationMinutes DESC")
    List<DockingRecord> findLongDurationDockings(@Param("minDurationMinutes") Long minDurationMinutes);

    /**
     * Find recent docking records (last N records)
     */
    @Query("SELECT dr FROM DockingRecord dr ORDER BY dr.dockTime DESC LIMIT :limit")
    List<DockingRecord> findRecentDockingRecords(@Param("limit") Integer limit);

    /**
     * Count docking records for UAV
     */
    long countByUav(UAV uav);

    /**
     * Count docking records for station
     */
    long countByDockingStation(DockingStation dockingStation);

    /**
     * Count dockings by purpose
     */
    long countByPurpose(String purpose);

    /**
     * Count completed dockings in time period
     */
    @Query("SELECT COUNT(dr) FROM DockingRecord dr WHERE dr.status = 'COMPLETED' AND dr.dockTime BETWEEN :startTime AND :endTime")
    long countCompletedDockingsInPeriod(@Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime);

    /**
     * Get average docking duration
     */
    @Query("SELECT AVG(dr.totalDockingDurationMinutes) FROM DockingRecord dr WHERE dr.totalDockingDurationMinutes IS NOT NULL")
    Double getAverageDockingDuration();

    /**
     * Get average docking duration for station
     */
    @Query("SELECT AVG(dr.totalDockingDurationMinutes) FROM DockingRecord dr WHERE dr.dockingStation.id = :stationId AND dr.totalDockingDurationMinutes IS NOT NULL")
    Double getAverageDockingDurationForStation(@Param("stationId") Long stationId);

    /**
     * Get average docking duration for UAV
     */
    @Query("SELECT AVG(dr.totalDockingDurationMinutes) FROM DockingRecord dr WHERE dr.uav.id = :uavId AND dr.totalDockingDurationMinutes IS NOT NULL")
    Double getAverageDockingDurationForUAV(@Param("uavId") Integer uavId);

    /**
     * Find docking records with battery information
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.batteryLevelOnArrival IS NOT NULL OR dr.batteryLevelOnDeparture IS NOT NULL ORDER BY dr.dockTime DESC")
    List<DockingRecord> findDockingRecordsWithBatteryInfo();

    /**
     * Find docking records with low battery on arrival
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.batteryLevelOnArrival <= :threshold ORDER BY dr.dockTime DESC")
    List<DockingRecord> findLowBatteryArrivals(@Param("threshold") Integer threshold);

    /**
     * Find docking records with services performed
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.servicesPerformed IS NOT NULL AND dr.servicesPerformed != '' ORDER BY dr.dockTime DESC")
    List<DockingRecord> findDockingRecordsWithServices();

    /**
     * Find emergency undockings
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.status = 'EMERGENCY_UNDOCK' ORDER BY dr.dockTime DESC")
    List<DockingRecord> findEmergencyUndockings();

    /**
     * Find aborted dockings
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.status = 'ABORTED' ORDER BY dr.dockTime DESC")
    List<DockingRecord> findAbortedDockings();

    /**
     * Get station utilization statistics
     */
    @Query("SELECT dr.dockingStation.id, COUNT(dr), AVG(dr.totalDockingDurationMinutes) " +
           "FROM DockingRecord dr WHERE dr.dockTime BETWEEN :startTime AND :endTime " +
           "GROUP BY dr.dockingStation.id")
    List<Object[]> getStationUtilizationStats(@Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);

    /**
     * Get UAV docking frequency
     */
    @Query("SELECT dr.uav.id, COUNT(dr) FROM DockingRecord dr WHERE dr.dockTime BETWEEN :startTime AND :endTime GROUP BY dr.uav.id ORDER BY COUNT(dr) DESC")
    List<Object[]> getUAVDockingFrequency(@Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);

    /**
     * Find overlapping dockings (for validation)
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.uav.id = :uavId AND dr.status = 'DOCKED' AND " +
           "dr.dockTime <= :endTime AND (dr.undockTime IS NULL OR dr.undockTime >= :startTime)")
    List<DockingRecord> findOverlappingDockings(@Param("uavId") Integer uavId,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);

    /**
     * Find docking records needing completion (docked for too long)
     */
    @Query("SELECT dr FROM DockingRecord dr WHERE dr.status = 'DOCKED' AND dr.undockTime IS NULL AND dr.dockTime < :cutoffTime")
    List<DockingRecord> findDockingsNeedingCompletion(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Get most used stations
     */
    @Query("SELECT dr.dockingStation, COUNT(dr) as usage_count FROM DockingRecord dr GROUP BY dr.dockingStation ORDER BY usage_count DESC")
    List<Object[]> getMostUsedStations();

    /**
     * Get busiest time periods
     */
    @Query("SELECT HOUR(dr.dockTime) as hour, COUNT(dr) as docking_count FROM DockingRecord dr GROUP BY HOUR(dr.dockTime) ORDER BY docking_count DESC")
    List<Object[]> getBusiestHours();

    /**
     * Delete old completed docking records
     */
    @Query("DELETE FROM DockingRecord dr WHERE dr.status = 'COMPLETED' AND dr.undockTime < :cutoffTime")
    void deleteOldCompletedRecords(@Param("cutoffTime") LocalDateTime cutoffTime);
}
