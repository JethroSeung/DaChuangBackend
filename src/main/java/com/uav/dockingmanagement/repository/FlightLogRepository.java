package com.uav.dockingmanagement.repository;

import com.uav.dockingmanagement.model.FlightLog;
import com.uav.dockingmanagement.model.UAV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for FlightLog entity
 * Provides data access methods for flight log operations
 */
@Repository
public interface FlightLogRepository extends JpaRepository<FlightLog, Long> {

       /**
        * Find all flight logs for a specific UAV
        */
       List<FlightLog> findByUavOrderByCreatedAtDesc(UAV uav);

       /**
        * Find flight logs by UAV ID
        */
       List<FlightLog> findByUavIdOrderByCreatedAtDesc(Integer uavId);

       /**
        * Find flight logs by status
        */
       List<FlightLog> findByFlightStatusOrderByCreatedAtDesc(FlightLog.FlightStatus status);

       /**
        * Find flight logs within a date range
        */
       @Query("SELECT fl FROM FlightLog fl WHERE fl.createdAt BETWEEN :startDate AND :endDate ORDER BY fl.createdAt DESC")
       List<FlightLog> findByDateRange(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       /**
        * Find flight logs by pilot name
        */
       List<FlightLog> findByPilotNameContainingIgnoreCaseOrderByCreatedAtDesc(String pilotName);

       /**
        * Find emergency flights
        */
       List<FlightLog> findByEmergencyLandingTrueOrderByCreatedAtDesc();

       /**
        * Find completed flights for a UAV
        */
       List<FlightLog> findByUavAndFlightStatusOrderByCreatedAtDesc(UAV uav, FlightLog.FlightStatus status);

       /**
        * Get total flight time for a UAV
        */
       @Query("SELECT COALESCE(SUM(fl.flightDurationMinutes), 0) FROM FlightLog fl WHERE fl.uav = :uav AND fl.flightStatus = 'COMPLETED'")
       Integer getTotalFlightTimeByUav(@Param("uav") UAV uav);

       /**
        * Get total distance traveled by a UAV
        */
       @Query("SELECT COALESCE(SUM(fl.distanceTraveledKm), 0.0) FROM FlightLog fl WHERE fl.uav = :uav AND fl.flightStatus = 'COMPLETED'")
       Double getTotalDistanceByUav(@Param("uav") UAV uav);

       /**
        * Count flights by UAV
        */
       long countByUav(UAV uav);

       /**
        * Count flights by status
        */
       long countByFlightStatus(FlightLog.FlightStatus status);

       /**
        * Count completed flights by UAV
        */
       long countByUavAndFlightStatus(UAV uav, FlightLog.FlightStatus status);

       /**
        * Find recent flight logs (last 30 days)
        */
       @Query("SELECT fl FROM FlightLog fl WHERE fl.createdAt >= :thirtyDaysAgo ORDER BY fl.createdAt DESC")
       List<FlightLog> findRecentFlightLogs(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);

       /**
        * Find flights by mission name pattern
        */
       List<FlightLog> findByMissionNameContainingIgnoreCaseOrderByCreatedAtDesc(String missionName);

       /**
        * Find flights with high altitude (above specified meters)
        */
       @Query("SELECT fl FROM FlightLog fl WHERE fl.maxAltitudeMeters > :altitude ORDER BY fl.maxAltitudeMeters DESC")
       List<FlightLog> findHighAltitudeFlights(@Param("altitude") Double altitude);

       /**
        * Find long duration flights (above specified minutes)
        */
       @Query("SELECT fl FROM FlightLog fl WHERE fl.flightDurationMinutes > :duration ORDER BY fl.flightDurationMinutes DESC")
       List<FlightLog> findLongDurationFlights(@Param("duration") Integer duration);

       /**
        * Get average flight duration for a UAV
        */
       @Query("SELECT AVG(fl.flightDurationMinutes) FROM FlightLog fl WHERE fl.uav = :uav AND fl.flightStatus = 'COMPLETED'")
       Double getAverageFlightDurationByUav(@Param("uav") UAV uav);

       /**
        * Get maximum altitude reached by a UAV
        */
       @Query("SELECT MAX(fl.maxAltitudeMeters) FROM FlightLog fl WHERE fl.uav = :uav AND fl.flightStatus = 'COMPLETED'")
       Double getMaxAltitudeByUav(@Param("uav") UAV uav);

       /**
        * Find flights with battery consumption above threshold
        */
       @Query("SELECT fl FROM FlightLog fl WHERE (fl.batteryStartPercentage - fl.batteryEndPercentage) > :threshold ORDER BY fl.createdAt DESC")
       List<FlightLog> findHighBatteryConsumptionFlights(@Param("threshold") Integer threshold);

       /**
        * Get flight statistics for dashboard
        */
       @Query("SELECT " +
                     "COUNT(fl) as totalFlights, " +
                     "COUNT(CASE WHEN fl.flightStatus = 'COMPLETED' THEN 1 END) as completedFlights, " +
                     "COUNT(CASE WHEN fl.flightStatus = 'IN_PROGRESS' THEN 1 END) as inProgressFlights, " +
                     "COUNT(CASE WHEN fl.emergencyLanding = true THEN 1 END) as emergencyFlights, " +
                     "AVG(fl.flightDurationMinutes) as avgFlightDuration, " +
                     "SUM(fl.distanceTraveledKm) as totalDistance " +
                     "FROM FlightLog fl")
       Object[] getFlightStatistics();

       /**
        * Find flights by weather conditions
        */
       List<FlightLog> findByWeatherConditionsContainingIgnoreCaseOrderByCreatedAtDesc(String weatherCondition);

       /**
        * Find flights within a geographic area (bounding box)
        */
       @Query("SELECT fl FROM FlightLog fl WHERE " +
                     "fl.startLatitude BETWEEN :minLat AND :maxLat AND " +
                     "fl.startLongitude BETWEEN :minLon AND :maxLon " +
                     "ORDER BY fl.createdAt DESC")
       List<FlightLog> findFlightsInArea(@Param("minLat") Double minLatitude,
                     @Param("maxLat") Double maxLatitude,
                     @Param("minLon") Double minLongitude,
                     @Param("maxLon") Double maxLongitude);

       /**
        * Find top performing UAVs by flight hours
        */
       @Query("SELECT fl.uav, SUM(fl.flightDurationMinutes) as totalMinutes FROM FlightLog fl " +
                     "WHERE fl.flightStatus = 'COMPLETED' " +
                     "GROUP BY fl.uav " +
                     "ORDER BY totalMinutes DESC")
       List<Object[]> findTopUAVsByFlightTime();

       /**
        * Batch load flight logs for multiple UAVs (for DataLoader)
        */
       @Query("SELECT fl FROM FlightLog fl WHERE fl.uav.id IN :uavIds ORDER BY fl.uav.id, fl.createdAt DESC")
       List<FlightLog> findByUavIdInOrderByCreatedAtDesc(@Param("uavIds") List<Integer> uavIds);

       /**
        * Delete old flight logs (older than specified date)
        */
       void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}
