package com.uav.dockingmanagement.repository;

import com.uav.dockingmanagement.model.Geofence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Geofence entity
 * Provides data access methods for geofence operations
 */
@Repository
public interface GeofenceRepository extends JpaRepository<Geofence, Long> {

    /**
     * Find geofences by status
     */
    List<Geofence> findByStatus(Geofence.FenceStatus status);

    /**
     * Find active geofences
     */
    @Query("SELECT g FROM Geofence g WHERE g.status = 'ACTIVE'")
    List<Geofence> findActiveGeofences();

    /**
     * Find geofences by type
     */
    List<Geofence> findByFenceType(Geofence.FenceType fenceType);

    /**
     * Find geofences by boundary type
     */
    List<Geofence> findByBoundaryType(Geofence.BoundaryType boundaryType);

    /**
     * Count geofences by fence type
     */
    long countByFenceType(Geofence.FenceType fenceType);

    /**
     * Count geofences by boundary type
     */
    long countByBoundaryType(Geofence.BoundaryType boundaryType);

    /**
     * Find geofence by name
     */
    Optional<Geofence> findByName(String name);

    /**
     * Find geofences created by user
     */
    List<Geofence> findByCreatedBy(String createdBy);

    /**
     * Find geofences that are currently active (considering time constraints)
     */
    @Query("SELECT g FROM Geofence g WHERE g.status = 'ACTIVE' AND " +
           "(g.activeFrom IS NULL OR g.activeFrom <= :now) AND " +
           "(g.activeUntil IS NULL OR g.activeUntil >= :now)")
    List<Geofence> findCurrentlyActiveGeofences(@Param("now") LocalDateTime now);

    /**
     * Find circular geofences that might contain a point
     */
    @Query("SELECT g FROM Geofence g WHERE g.fenceType = 'CIRCULAR' AND g.status = 'ACTIVE' AND " +
           "g.centerLatitude IS NOT NULL AND g.centerLongitude IS NOT NULL AND g.radiusMeters IS NOT NULL")
    List<Geofence> findActiveCircularGeofences();

    /**
     * Find geofences by priority level
     */
    List<Geofence> findByPriorityLevelOrderByPriorityLevelDesc(Integer priorityLevel);

    /**
     * Find high priority geofences
     */
    @Query("SELECT g FROM Geofence g WHERE g.priorityLevel >= :minPriority ORDER BY g.priorityLevel DESC")
    List<Geofence> findHighPriorityGeofences(@Param("minPriority") Integer minPriority);

    /**
     * Find geofences with violations
     */
    @Query("SELECT g FROM Geofence g WHERE g.totalViolations > 0 ORDER BY g.totalViolations DESC")
    List<Geofence> findGeofencesWithViolations();

    /**
     * Find geofences with recent violations
     */
    @Query("SELECT g FROM Geofence g WHERE g.lastViolationTime > :since ORDER BY g.lastViolationTime DESC")
    List<Geofence> findGeofencesWithRecentViolations(@Param("since") LocalDateTime since);

    /**
     * Find inclusion geofences (UAV must stay inside)
     */
    @Query("SELECT g FROM Geofence g WHERE g.boundaryType = 'INCLUSION' AND g.status = 'ACTIVE'")
    List<Geofence> findInclusionGeofences();

    /**
     * Find exclusion geofences (UAV must stay outside)
     */
    @Query("SELECT g FROM Geofence g WHERE g.boundaryType = 'EXCLUSION' AND g.status = 'ACTIVE'")
    List<Geofence> findExclusionGeofences();

    /**
     * Find geofences that overlap with a geographical area
     */
    @Query("SELECT g FROM Geofence g WHERE g.fenceType = 'CIRCULAR' AND g.status = 'ACTIVE' AND " +
           "g.centerLatitude BETWEEN :minLat AND :maxLat AND " +
           "g.centerLongitude BETWEEN :minLon AND :maxLon")
    List<Geofence> findGeofencesInArea(@Param("minLat") Double minLatitude,
                                     @Param("maxLat") Double maxLatitude,
                                     @Param("minLon") Double minLongitude,
                                     @Param("maxLon") Double maxLongitude);

    /**
     * Find expired geofences
     */
    @Query("SELECT g FROM Geofence g WHERE g.activeUntil < :now")
    List<Geofence> findExpiredGeofences(@Param("now") LocalDateTime now);

    /**
     * Find geofences that will expire soon
     */
    @Query("SELECT g FROM Geofence g WHERE g.activeUntil BETWEEN :now AND :soonThreshold")
    List<Geofence> findGeofencesExpiringSoon(@Param("now") LocalDateTime now,
                                           @Param("soonThreshold") LocalDateTime soonThreshold);

    /**
     * Count geofences by status
     */
    long countByStatus(Geofence.FenceStatus status);

    /**
     * Count active geofences
     */
    @Query("SELECT COUNT(g) FROM Geofence g WHERE g.status = 'ACTIVE'")
    long countActiveGeofences();

    /**
     * Find geofences with specific violation action
     */
    List<Geofence> findByViolationAction(String violationAction);

    /**
     * Find geofences with notification emails configured
     */
    @Query("SELECT g FROM Geofence g WHERE g.notificationEmails IS NOT NULL AND g.notificationEmails != ''")
    List<Geofence> findGeofencesWithNotifications();

    /**
     * Find geofences with altitude restrictions
     */
    @Query("SELECT g FROM Geofence g WHERE g.minAltitudeMeters IS NOT NULL OR g.maxAltitudeMeters IS NOT NULL")
    List<Geofence> findGeofencesWithAltitudeRestrictions();

    /**
     * Find geofences that are time-restricted
     */
    @Query("SELECT g FROM Geofence g WHERE g.timeFrom IS NOT NULL AND g.timeUntil IS NOT NULL")
    List<Geofence> findTimeRestrictedGeofences();

    /**
     * Find geofences active on specific days
     */
    @Query("SELECT g FROM Geofence g WHERE g.daysOfWeek IS NULL OR g.daysOfWeek LIKE %:dayOfWeek%")
    List<Geofence> findGeofencesActiveOnDay(@Param("dayOfWeek") String dayOfWeek);

    /**
     * Update geofence violation count
     */
    @Query("UPDATE Geofence g SET g.totalViolations = g.totalViolations + 1, g.lastViolationTime = :violationTime WHERE g.id = :geofenceId")
    void incrementViolationCount(@Param("geofenceId") Long geofenceId, @Param("violationTime") LocalDateTime violationTime);

    /**
     * Find geofences that need to be checked for a specific point
     * This is a simplified query - in production, you'd use spatial queries
     */
    @Query("SELECT g FROM Geofence g WHERE g.status = 'ACTIVE' AND " +
           "(g.activeFrom IS NULL OR g.activeFrom <= :now) AND " +
           "(g.activeUntil IS NULL OR g.activeUntil >= :now) " +
           "ORDER BY g.priorityLevel DESC")
    List<Geofence> findGeofencesToCheck(@Param("now") LocalDateTime now);

    /**
     * Find circular geofences near a point (for optimization)
     */
    @Query(value = "SELECT * FROM geofences g WHERE g.fence_type = 'CIRCULAR' AND g.status = 'ACTIVE' AND " +
           "g.center_latitude IS NOT NULL AND g.center_longitude IS NOT NULL AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(g.center_latitude)) * " +
           "cos(radians(g.center_longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(g.center_latitude)))) * 1000 <= " +
           "(g.radius_meters + :bufferMeters)", nativeQuery = true)
    List<Geofence> findCircularGeofencesNearPoint(@Param("latitude") Double latitude,
                                                 @Param("longitude") Double longitude,
                                                 @Param("bufferMeters") Double bufferMeters);

    /**
     * Delete inactive geofences older than specified date
     */
    @Query("DELETE FROM Geofence g WHERE g.status != 'ACTIVE' AND g.createdAt < :cutoffDate")
    void deleteOldInactiveGeofences(@Param("cutoffDate") LocalDateTime cutoffDate);
}
