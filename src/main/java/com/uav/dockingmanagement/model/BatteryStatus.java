package com.uav.dockingmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Battery Status entity to monitor UAV battery health and charging status
 * Tracks detailed battery information and performance metrics
 */
@Entity
@Table(name = "battery_status")
public class BatteryStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uav_id", nullable = false, unique = true)
    @JsonBackReference("uav-batteryStatus")
    private UAV uav;

    @Column(name = "current_charge_percentage", nullable = false)
    private Integer currentChargePercentage;

    @Column(name = "voltage")
    private Double voltage;

    @Column(name = "current_amperage")
    private Double currentAmperage;

    @Column(name = "temperature_celsius")
    private Double temperatureCelsius;

    @Column(name = "capacity_mah", nullable = false)
    private Integer capacityMah;

    @Column(name = "remaining_capacity_mah")
    private Integer remainingCapacityMah;

    @Column(name = "cycle_count", nullable = false)
    private Integer cycleCount = 0;

    @Column(name = "health_percentage", nullable = false)
    private Integer healthPercentage = 100;

    @Enumerated(EnumType.STRING)
    @Column(name = "charging_status", nullable = false)
    private ChargingStatus chargingStatus = ChargingStatus.DISCONNECTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "battery_condition", nullable = false)
    private BatteryCondition batteryCondition = BatteryCondition.GOOD;

    @Column(name = "estimated_flight_time_minutes")
    private Integer estimatedFlightTimeMinutes;

    @Column(name = "last_charge_date")
    private LocalDateTime lastChargeDate;

    @Column(name = "last_discharge_date")
    private LocalDateTime lastDischargeDate;

    @Column(name = "charging_cycles_since_maintenance")
    private Integer chargingCyclesSinceMaintenance = 0;

    @Column(name = "deep_discharge_count")
    private Integer deepDischargeCount = 0;

    @Column(name = "overcharge_count")
    private Integer overchargeCount = 0;

    @Column(name = "max_temperature_recorded")
    private Double maxTemperatureRecorded;

    @Column(name = "min_voltage_recorded")
    private Double minVoltageRecorded;

    @Column(name = "battery_serial_number", length = 50)
    private String batterySerialNumber;

    @Column(name = "manufacturer", length = 50)
    private String manufacturer;

    @Column(name = "model", length = 50)
    private String model;

    @Column(name = "manufacture_date")
    private LocalDateTime manufactureDate;

    @Column(name = "warranty_expiry_date")
    private LocalDateTime warrantyExpiryDate;

    @Column(name = "is_charging", nullable = false)
    private Boolean isCharging = false;

    @Column(name = "charging_start_time")
    private LocalDateTime chargingStartTime;

    @Column(name = "estimated_charging_time_minutes")
    private Integer estimatedChargingTimeMinutes;

    @CreationTimestamp
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    public enum ChargingStatus {
        DISCONNECTED,
        CONNECTED_NOT_CHARGING,
        CHARGING,
        FULLY_CHARGED,
        CHARGING_ERROR,
        OVERHEATING,
        MAINTENANCE_MODE
    }

    public enum BatteryCondition {
        EXCELLENT,
        GOOD,
        FAIR,
        POOR,
        CRITICAL,
        REPLACE_SOON,
        REPLACE_NOW
    }

    // Constructors
    public BatteryStatus() {
    }

    public BatteryStatus(UAV uav, Integer capacityMah) {
        this.uav = uav;
        this.capacityMah = capacityMah;
        this.currentChargePercentage = 100;
        this.healthPercentage = 100;
        this.cycleCount = 0;
        this.chargingStatus = ChargingStatus.DISCONNECTED;
        this.batteryCondition = BatteryCondition.GOOD;
        this.isCharging = false;
        this.chargingCyclesSinceMaintenance = 0;
        this.deepDischargeCount = 0;
        this.overchargeCount = 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UAV getUav() {
        return uav;
    }

    public void setUav(UAV uav) {
        this.uav = uav;
    }

    public Integer getCurrentChargePercentage() {
        return currentChargePercentage;
    }

    public void setCurrentChargePercentage(Integer currentChargePercentage) {
        this.currentChargePercentage = currentChargePercentage;
    }

    public Double getVoltage() {
        return voltage;
    }

    public void setVoltage(Double voltage) {
        this.voltage = voltage;
    }

    public Double getCurrentAmperage() {
        return currentAmperage;
    }

    public void setCurrentAmperage(Double currentAmperage) {
        this.currentAmperage = currentAmperage;
    }

    public Double getTemperatureCelsius() {
        return temperatureCelsius;
    }

    public void setTemperatureCelsius(Double temperatureCelsius) {
        this.temperatureCelsius = temperatureCelsius;
    }

    public Integer getCapacityMah() {
        return capacityMah;
    }

    public void setCapacityMah(Integer capacityMah) {
        this.capacityMah = capacityMah;
    }

    public Integer getRemainingCapacityMah() {
        return remainingCapacityMah;
    }

    public void setRemainingCapacityMah(Integer remainingCapacityMah) {
        this.remainingCapacityMah = remainingCapacityMah;
    }

    public Integer getCycleCount() {
        return cycleCount;
    }

    public void setCycleCount(Integer cycleCount) {
        this.cycleCount = cycleCount;
    }

    public Integer getHealthPercentage() {
        return healthPercentage;
    }

    public void setHealthPercentage(Integer healthPercentage) {
        this.healthPercentage = healthPercentage;
    }

    public ChargingStatus getChargingStatus() {
        return chargingStatus;
    }

    public void setChargingStatus(ChargingStatus chargingStatus) {
        this.chargingStatus = chargingStatus;
    }

    public BatteryCondition getBatteryCondition() {
        return batteryCondition;
    }

    public void setBatteryCondition(BatteryCondition batteryCondition) {
        this.batteryCondition = batteryCondition;
    }

    public Integer getEstimatedFlightTimeMinutes() {
        return estimatedFlightTimeMinutes;
    }

    public void setEstimatedFlightTimeMinutes(Integer estimatedFlightTimeMinutes) {
        this.estimatedFlightTimeMinutes = estimatedFlightTimeMinutes;
    }

    public LocalDateTime getLastChargeDate() {
        return lastChargeDate;
    }

    public void setLastChargeDate(LocalDateTime lastChargeDate) {
        this.lastChargeDate = lastChargeDate;
    }

    public LocalDateTime getLastDischargeDate() {
        return lastDischargeDate;
    }

    public void setLastDischargeDate(LocalDateTime lastDischargeDate) {
        this.lastDischargeDate = lastDischargeDate;
    }

    public Integer getChargingCyclesSinceMaintenance() {
        return chargingCyclesSinceMaintenance;
    }

    public void setChargingCyclesSinceMaintenance(Integer chargingCyclesSinceMaintenance) {
        this.chargingCyclesSinceMaintenance = chargingCyclesSinceMaintenance;
    }

    public Integer getDeepDischargeCount() {
        return deepDischargeCount;
    }

    public void setDeepDischargeCount(Integer deepDischargeCount) {
        this.deepDischargeCount = deepDischargeCount;
    }

    public Integer getOverchargeCount() {
        return overchargeCount;
    }

    public void setOverchargeCount(Integer overchargeCount) {
        this.overchargeCount = overchargeCount;
    }

    public Double getMaxTemperatureRecorded() {
        return maxTemperatureRecorded;
    }

    public void setMaxTemperatureRecorded(Double maxTemperatureRecorded) {
        this.maxTemperatureRecorded = maxTemperatureRecorded;
    }

    public Double getMinVoltageRecorded() {
        return minVoltageRecorded;
    }

    public void setMinVoltageRecorded(Double minVoltageRecorded) {
        this.minVoltageRecorded = minVoltageRecorded;
    }

    public String getBatterySerialNumber() {
        return batterySerialNumber;
    }

    public void setBatterySerialNumber(String batterySerialNumber) {
        this.batterySerialNumber = batterySerialNumber;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public LocalDateTime getManufactureDate() {
        return manufactureDate;
    }

    public void setManufactureDate(LocalDateTime manufactureDate) {
        this.manufactureDate = manufactureDate;
    }

    public LocalDateTime getWarrantyExpiryDate() {
        return warrantyExpiryDate;
    }

    public void setWarrantyExpiryDate(LocalDateTime warrantyExpiryDate) {
        this.warrantyExpiryDate = warrantyExpiryDate;
    }

    public Boolean getIsCharging() {
        return isCharging;
    }

    public void setIsCharging(Boolean isCharging) {
        this.isCharging = isCharging;
    }

    public LocalDateTime getChargingStartTime() {
        return chargingStartTime;
    }

    public void setChargingStartTime(LocalDateTime chargingStartTime) {
        this.chargingStartTime = chargingStartTime;
    }

    public Integer getEstimatedChargingTimeMinutes() {
        return estimatedChargingTimeMinutes;
    }

    public void setEstimatedChargingTimeMinutes(Integer estimatedChargingTimeMinutes) {
        this.estimatedChargingTimeMinutes = estimatedChargingTimeMinutes;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    // Utility methods
    public boolean needsMaintenance() {
        return chargingCyclesSinceMaintenance > 100 ||
                healthPercentage < 80 ||
                batteryCondition == BatteryCondition.POOR ||
                batteryCondition == BatteryCondition.CRITICAL;
    }

    public boolean needsReplacement() {
        return batteryCondition == BatteryCondition.REPLACE_SOON ||
                batteryCondition == BatteryCondition.REPLACE_NOW ||
                healthPercentage < 50;
    }

    public boolean isLowBattery() {
        return currentChargePercentage != null && currentChargePercentage < 20;
    }

    public boolean isCriticalBattery() {
        return currentChargePercentage != null && currentChargePercentage < 10;
    }

    public boolean isOverheating() {
        return temperatureCelsius != null && temperatureCelsius > 60.0;
    }

    public Integer getChargingTimeElapsedMinutes() {
        if (chargingStartTime != null && isCharging) {
            return (int) java.time.Duration.between(chargingStartTime, LocalDateTime.now()).toMinutes();
        }
        return null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        BatteryStatus that = (BatteryStatus) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "BatteryStatus{" +
                "id=" + id +
                ", currentChargePercentage=" + currentChargePercentage +
                ", healthPercentage=" + healthPercentage +
                ", chargingStatus=" + chargingStatus +
                ", batteryCondition=" + batteryCondition +
                ", cycleCount=" + cycleCount +
                '}';
    }
}
