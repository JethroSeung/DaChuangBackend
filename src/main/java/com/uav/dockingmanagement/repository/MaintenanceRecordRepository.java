package com.uav.dockingmanagement.repository;

import com.uav.dockingmanagement.model.MaintenanceRecord;
import com.uav.dockingmanagement.model.UAV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for MaintenanceRecord entity
 * Provides data access methods for maintenance record operations
 */
@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {

    /**
     * Find all maintenance records for a specific UAV
     */
    List<MaintenanceRecord> findByUavOrderByCreatedAtDesc(UAV uav);

    /**
     * Find maintenance records by UAV ID
     */
    List<MaintenanceRecord> findByUavIdOrderByCreatedAtDesc(Integer uavId);

    /**
     * Batch load maintenance records for multiple UAVs (for DataLoader)
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.uav.id IN :uavIds ORDER BY mr.uav.id, mr.createdAt DESC")
    List<MaintenanceRecord> findByUavIdInOrderByCreatedAtDesc(@Param("uavIds") List<Integer> uavIds);

    /**
     * Find maintenance records by status
     */
    List<MaintenanceRecord> findByStatusOrderByCreatedAtDesc(MaintenanceRecord.MaintenanceStatus status);

    /**
     * Find maintenance records by priority
     */
    List<MaintenanceRecord> findByPriorityOrderByCreatedAtDesc(MaintenanceRecord.Priority priority);

    /**
     * Find maintenance records by type
     */
    List<MaintenanceRecord> findByMaintenanceTypeOrderByCreatedAtDesc(MaintenanceRecord.MaintenanceType type);

    /**
     * Find overdue maintenance records
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.scheduledDate < :currentDate AND mr.status NOT IN ('COMPLETED', 'CANCELLED') ORDER BY mr.scheduledDate ASC")
    List<MaintenanceRecord> findOverdueMaintenanceRecords(@Param("currentDate") LocalDateTime currentDate);

    /**
     * Find upcoming maintenance (within next 7 days)
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.scheduledDate BETWEEN :now AND :sevenDaysFromNow AND mr.status = 'SCHEDULED' ORDER BY mr.scheduledDate ASC")
    List<MaintenanceRecord> findUpcomingMaintenance(@Param("now") LocalDateTime now,
            @Param("sevenDaysFromNow") LocalDateTime sevenDaysFromNow);

    /**
     * Find maintenance records by technician
     */
    List<MaintenanceRecord> findByTechnicianNameContainingIgnoreCaseOrderByCreatedAtDesc(String technicianName);

    /**
     * Find high priority maintenance records
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.priority IN ('HIGH', 'CRITICAL', 'EMERGENCY') ORDER BY mr.priority DESC, mr.scheduledDate ASC")
    List<MaintenanceRecord> findHighPriorityMaintenance();

    /**
     * Find maintenance records within date range
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.scheduledDate BETWEEN :startDate AND :endDate ORDER BY mr.scheduledDate ASC")
    List<MaintenanceRecord> findByScheduledDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Find completed maintenance records within date range
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.completedDate BETWEEN :startDate AND :endDate AND mr.status = 'COMPLETED' ORDER BY mr.completedDate DESC")
    List<MaintenanceRecord> findCompletedInDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Count maintenance records by UAV
     */
    long countByUav(UAV uav);

    /**
     * Count maintenance records by UAV and status
     */
    long countByUavAndStatus(UAV uav, MaintenanceRecord.MaintenanceStatus status);

    /**
     * Count overdue maintenance for a UAV
     */
    @Query("SELECT COUNT(mr) FROM MaintenanceRecord mr WHERE mr.uav = :uav AND mr.scheduledDate < :currentDate AND mr.status NOT IN ('COMPLETED', 'CANCELLED')")
    long countOverdueMaintenanceByUav(@Param("uav") UAV uav, @Param("currentDate") LocalDateTime currentDate);

    /**
     * Get total maintenance cost for a UAV
     */
    @Query("SELECT COALESCE(SUM(mr.cost), 0) FROM MaintenanceRecord mr WHERE mr.uav = :uav AND mr.status = 'COMPLETED'")
    BigDecimal getTotalMaintenanceCostByUav(@Param("uav") UAV uav);

    /**
     * Get average maintenance duration for a type
     */
    @Query("SELECT AVG(mr.actualDurationHours) FROM MaintenanceRecord mr WHERE mr.maintenanceType = :type AND mr.status = 'COMPLETED' AND mr.actualDurationHours IS NOT NULL")
    Double getAverageMaintenanceDurationByType(@Param("type") MaintenanceRecord.MaintenanceType type);

    /**
     * Find maintenance records by external service
     */
    List<MaintenanceRecord> findByExternalServiceTrueOrderByCreatedAtDesc();

    /**
     * Find warranty covered maintenance
     */
    List<MaintenanceRecord> findByWarrantyCoveredTrueOrderByCreatedAtDesc();

    /**
     * Find maintenance records by service provider
     */
    List<MaintenanceRecord> findByServiceProviderContainingIgnoreCaseOrderByCreatedAtDesc(String serviceProvider);

    /**
     * Find maintenance records with cost above threshold
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.cost > :threshold ORDER BY mr.cost DESC")
    List<MaintenanceRecord> findExpensiveMaintenanceRecords(@Param("threshold") BigDecimal threshold);

    /**
     * Get maintenance statistics for dashboard
     */
    @Query("SELECT " +
            "COUNT(mr) as totalRecords, " +
            "COUNT(CASE WHEN mr.status = 'COMPLETED' THEN 1 END) as completedRecords, " +
            "COUNT(CASE WHEN mr.status = 'SCHEDULED' THEN 1 END) as scheduledRecords, " +
            "COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as inProgressRecords, " +
            "COUNT(CASE WHEN mr.scheduledDate < CURRENT_TIMESTAMP AND mr.status NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) as overdueRecords, "
            +
            "AVG(mr.actualDurationHours) as avgDuration, " +
            "SUM(mr.cost) as totalCost " +
            "FROM MaintenanceRecord mr")
    Object[] getMaintenanceStatistics();

    /**
     * Find recent maintenance records (last 30 days)
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.createdAt >= :thirtyDaysAgo ORDER BY mr.createdAt DESC")
    List<MaintenanceRecord> findRecentMaintenanceRecords(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);

    /**
     * Find maintenance records by title pattern
     */
    List<MaintenanceRecord> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    /**
     * Find maintenance records with duration variance (actual vs estimated)
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.actualDurationHours IS NOT NULL AND mr.estimatedDurationHours IS NOT NULL AND ABS(mr.actualDurationHours - mr.estimatedDurationHours) > :threshold ORDER BY ABS(mr.actualDurationHours - mr.estimatedDurationHours) DESC")
    List<MaintenanceRecord> findMaintenanceWithHighDurationVariance(@Param("threshold") Integer threshold);

    /**
     * Get maintenance frequency by UAV (records per month)
     */
    @Query("SELECT mr.uav, COUNT(mr) as recordCount FROM MaintenanceRecord mr WHERE mr.createdAt >= :startDate GROUP BY mr.uav ORDER BY recordCount DESC")
    List<Object[]> getMaintenanceFrequencyByUav(@Param("startDate") LocalDateTime startDate);

    /**
     * Find UAVs requiring immediate maintenance
     */
    @Query("SELECT DISTINCT mr.uav FROM MaintenanceRecord mr WHERE mr.priority IN ('CRITICAL', 'EMERGENCY') AND mr.status IN ('SCHEDULED', 'IN_PROGRESS')")
    List<UAV> findUAVsRequiringImmediateMaintenance();

    /**
     * Get next scheduled maintenance date for a UAV
     */
    @Query("SELECT MIN(mr.scheduledDate) FROM MaintenanceRecord mr WHERE mr.uav = :uav AND mr.status = 'SCHEDULED' AND mr.scheduledDate > CURRENT_TIMESTAMP")
    LocalDateTime getNextScheduledMaintenanceDate(@Param("uav") UAV uav);

    /**
     * Find maintenance records by parts replaced
     */
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.partsReplaced IS NOT NULL AND LOWER(mr.partsReplaced) LIKE LOWER(CONCAT('%', :part, '%')) ORDER BY mr.createdAt DESC")
    List<MaintenanceRecord> findByPartsReplaced(@Param("part") String part);

    /**
     * Delete old maintenance records (older than specified date)
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}
