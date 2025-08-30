package com.uav.dockingmanagement.repository;

import com.uav.dockingmanagement.model.BatteryStatus;
import com.uav.dockingmanagement.model.UAV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for BatteryStatus entity
 * Provides data access methods for battery status operations
 */
@Repository
public interface BatteryStatusRepository extends JpaRepository<BatteryStatus, Long> {

       /**
        * Find battery status by UAV
        */
       Optional<BatteryStatus> findByUav(UAV uav);

       /**
        * Find battery status by UAV ID
        */
       Optional<BatteryStatus> findByUavId(Integer uavId);

       /**
        * Find batteries with low charge (below specified percentage)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.currentChargePercentage < :threshold ORDER BY bs.currentChargePercentage ASC")
       List<BatteryStatus> findLowBatteryUAVs(@Param("threshold") Integer threshold);

       /**
        * Find batteries with critical charge (below 10%)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.currentChargePercentage < 10 ORDER BY bs.currentChargePercentage ASC")
       List<BatteryStatus> findCriticalBatteryUAVs();

       /**
        * Find batteries by charging status
        */
       List<BatteryStatus> findByChargingStatusOrderByLastUpdatedDesc(BatteryStatus.ChargingStatus chargingStatus);

       /**
        * Find batteries by condition
        */
       List<BatteryStatus> findByBatteryConditionOrderByLastUpdatedDesc(BatteryStatus.BatteryCondition condition);

       /**
        * Find batteries currently charging
        */
       List<BatteryStatus> findByIsChargingTrueOrderByLastUpdatedDesc();

       /**
        * Find batteries with poor health (below specified percentage)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.healthPercentage < :threshold ORDER BY bs.healthPercentage ASC")
       List<BatteryStatus> findPoorHealthBatteries(@Param("threshold") Integer threshold);

       /**
        * Find batteries with high cycle count (above threshold)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.cycleCount > :threshold ORDER BY bs.cycleCount DESC")
       List<BatteryStatus> findHighCycleBatteries(@Param("threshold") Integer threshold);

       /**
        * Find overheating batteries
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.temperatureCelsius > :threshold ORDER BY bs.temperatureCelsius DESC")
       List<BatteryStatus> findOverheatingBatteries(@Param("threshold") Double threshold);

       /**
        * Find batteries requiring maintenance
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.chargingCyclesSinceMaintenance > 100 OR bs.healthPercentage < 80 OR bs.batteryCondition IN ('POOR', 'CRITICAL') ORDER BY bs.healthPercentage ASC")
       List<BatteryStatus> findBatteriesRequiringMaintenance();

       /**
        * Find batteries requiring replacement
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.batteryCondition IN ('REPLACE_SOON', 'REPLACE_NOW') OR bs.healthPercentage < 50 ORDER BY bs.healthPercentage ASC")
       List<BatteryStatus> findBatteriesRequiringReplacement();

       /**
        * Find batteries by manufacturer
        */
       List<BatteryStatus> findByManufacturerContainingIgnoreCaseOrderByLastUpdatedDesc(String manufacturer);

       /**
        * Find batteries by model
        */
       List<BatteryStatus> findByModelContainingIgnoreCaseOrderByLastUpdatedDesc(String model);

       /**
        * Find batteries with warranty expiring soon (within 30 days)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.warrantyExpiryDate BETWEEN CURRENT_TIMESTAMP AND :thirtyDaysFromNow ORDER BY bs.warrantyExpiryDate ASC")
       List<BatteryStatus> findBatteriesWithExpiringWarranty(
                     @Param("thirtyDaysFromNow") LocalDateTime thirtyDaysFromNow);

       /**
        * Find batteries with expired warranty
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.warrantyExpiryDate < CURRENT_TIMESTAMP ORDER BY bs.warrantyExpiryDate ASC")
       List<BatteryStatus> findBatteriesWithExpiredWarranty();

       /**
        * Get battery statistics for dashboard
        */
       @Query("SELECT " +
                     "COUNT(bs) as totalBatteries, " +
                     "COUNT(CASE WHEN bs.currentChargePercentage < 20 THEN 1 END) as lowBatteryCount, " +
                     "COUNT(CASE WHEN bs.currentChargePercentage < 10 THEN 1 END) as criticalBatteryCount, " +
                     "COUNT(CASE WHEN bs.isCharging = true THEN 1 END) as chargingCount, " +
                     "COUNT(CASE WHEN bs.batteryCondition IN ('POOR', 'CRITICAL', 'REPLACE_SOON', 'REPLACE_NOW') THEN 1 END) as problemBatteryCount, "
                     +
                     "AVG(bs.currentChargePercentage) as avgChargePercentage, " +
                     "AVG(bs.healthPercentage) as avgHealthPercentage, " +
                     "AVG(bs.cycleCount) as avgCycleCount " +
                     "FROM BatteryStatus bs")
       Object[] getBatteryStatistics();

       /**
        * Find batteries with deep discharge issues
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.deepDischargeCount > :threshold ORDER BY bs.deepDischargeCount DESC")
       List<BatteryStatus> findBatteriesWithDeepDischargeIssues(@Param("threshold") Integer threshold);

       /**
        * Find batteries with overcharge issues
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.overchargeCount > :threshold ORDER BY bs.overchargeCount DESC")
       List<BatteryStatus> findBatteriesWithOverchargeIssues(@Param("threshold") Integer threshold);

       /**
        * Get average battery health by manufacturer
        */
       @Query("SELECT bs.manufacturer, AVG(bs.healthPercentage) as avgHealth FROM BatteryStatus bs WHERE bs.manufacturer IS NOT NULL GROUP BY bs.manufacturer ORDER BY avgHealth DESC")
       List<Object[]> getAverageBatteryHealthByManufacturer();

       /**
        * Get average cycle count by battery model
        */
       @Query("SELECT bs.model, AVG(bs.cycleCount) as avgCycles FROM BatteryStatus bs WHERE bs.model IS NOT NULL GROUP BY bs.model ORDER BY avgCycles DESC")
       List<Object[]> getAverageCycleCountByModel();

       /**
        * Find batteries not updated recently (stale data)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.lastUpdated < :cutoffTime ORDER BY bs.lastUpdated ASC")
       List<BatteryStatus> findStaleData(@Param("cutoffTime") LocalDateTime cutoffTime);

       /**
        * Find batteries with estimated flight time below threshold
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.estimatedFlightTimeMinutes IS NOT NULL AND bs.estimatedFlightTimeMinutes < :threshold ORDER BY bs.estimatedFlightTimeMinutes ASC")
       List<BatteryStatus> findBatteriesWithLowFlightTime(@Param("threshold") Integer threshold);

       /**
        * Find batteries by serial number pattern
        */
       List<BatteryStatus> findByBatterySerialNumberContainingIgnoreCaseOrderByLastUpdatedDesc(String serialNumber);

       /**
        * Get charging efficiency statistics
        */
       @Query("SELECT " +
                     "AVG(bs.estimatedChargingTimeMinutes) as avgEstimatedChargingTime, " +
                     "COUNT(CASE WHEN bs.chargingStatus = 'CHARGING_ERROR' THEN 1 END) as chargingErrorCount, " +
                     "COUNT(CASE WHEN bs.chargingStatus = 'OVERHEATING' THEN 1 END) as overheatingCount " +
                     "FROM BatteryStatus bs")
       Object[] getChargingStatistics();

       /**
        * Find batteries with voltage issues (outside normal range)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.voltage IS NOT NULL AND (bs.voltage < :minVoltage OR bs.voltage > :maxVoltage) ORDER BY bs.voltage")
       List<BatteryStatus> findBatteriesWithVoltageIssues(@Param("minVoltage") Double minVoltage,
                     @Param("maxVoltage") Double maxVoltage);

       /**
        * Find batteries with temperature issues
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.temperatureCelsius IS NOT NULL AND (bs.temperatureCelsius < :minTemp OR bs.temperatureCelsius > :maxTemp) ORDER BY bs.temperatureCelsius DESC")
       List<BatteryStatus> findBatteriesWithTemperatureIssues(@Param("minTemp") Double minTemp,
                     @Param("maxTemp") Double maxTemp);

       /**
        * Get battery performance trends (last 30 days)
        */
       @Query("SELECT bs FROM BatteryStatus bs WHERE bs.lastUpdated >= :thirtyDaysAgo ORDER BY bs.lastUpdated DESC")
       List<BatteryStatus> getBatteryPerformanceTrends(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);

       /**
        * Count batteries by condition
        */
       @Query("SELECT bs.batteryCondition, COUNT(bs) FROM BatteryStatus bs GROUP BY bs.batteryCondition")
       List<Object[]> countBatteriesByCondition();

       /**
        * Count batteries by charging status
        */
       @Query("SELECT bs.chargingStatus, COUNT(bs) FROM BatteryStatus bs GROUP BY bs.chargingStatus")
       List<Object[]> countBatteriesByChargingStatus();
}
