package com.uav.dockingmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Docking Record entity to track UAV docking history
 * Records when UAVs dock and undock from stations
 */
@Entity
@Table(name = "docking_records", indexes = {
        @Index(name = "idx_docking_record_uav", columnList = "uav_id"),
        @Index(name = "idx_docking_record_station", columnList = "docking_station_id"),
        @Index(name = "idx_docking_record_dock_time", columnList = "dock_time"),
        @Index(name = "idx_docking_record_status", columnList = "status")
})
public class DockingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uav_id", nullable = false)
    @JsonBackReference("uav-dockingRecords")
    private UAV uav;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docking_station_id", nullable = false)
    @JsonBackReference("dockingStation-dockingRecords")
    private DockingStation dockingStation;

    @CreationTimestamp
    @Column(name = "dock_time", nullable = false, updatable = false)
    private LocalDateTime dockTime;

    @Column(name = "undock_time")
    private LocalDateTime undockTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DockingStatus status = DockingStatus.DOCKED;

    @Column(name = "purpose", length = 100)
    private String purpose; // CHARGING, MAINTENANCE, STORAGE, etc.

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "battery_level_on_arrival")
    private Integer batteryLevelOnArrival;

    @Column(name = "battery_level_on_departure")
    private Integer batteryLevelOnDeparture;

    @Column(name = "services_performed", length = 300)
    private String servicesPerformed;

    @Column(name = "total_docking_duration_minutes")
    private Long totalDockingDurationMinutes;

    // Constructors
    public DockingRecord() {
    }

    public DockingRecord(UAV uav, DockingStation dockingStation, String purpose) {
        this.uav = uav;
        this.dockingStation = dockingStation;
        this.purpose = purpose;
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

    public DockingStation getDockingStation() {
        return dockingStation;
    }

    public void setDockingStation(DockingStation dockingStation) {
        this.dockingStation = dockingStation;
    }

    public LocalDateTime getDockTime() {
        return dockTime;
    }

    public void setDockTime(LocalDateTime dockTime) {
        this.dockTime = dockTime;
    }

    public LocalDateTime getUndockTime() {
        return undockTime;
    }

    public void setUndockTime(LocalDateTime undockTime) {
        this.undockTime = undockTime;
    }

    public DockingStatus getStatus() {
        return status;
    }

    public void setStatus(DockingStatus status) {
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getBatteryLevelOnArrival() {
        return batteryLevelOnArrival;
    }

    public void setBatteryLevelOnArrival(Integer batteryLevelOnArrival) {
        this.batteryLevelOnArrival = batteryLevelOnArrival;
    }

    public Integer getBatteryLevelOnDeparture() {
        return batteryLevelOnDeparture;
    }

    public void setBatteryLevelOnDeparture(Integer batteryLevelOnDeparture) {
        this.batteryLevelOnDeparture = batteryLevelOnDeparture;
    }

    public String getServicesPerformed() {
        return servicesPerformed;
    }

    public void setServicesPerformed(String servicesPerformed) {
        this.servicesPerformed = servicesPerformed;
    }

    public Long getTotalDockingDurationMinutes() {
        return totalDockingDurationMinutes;
    }

    public void setTotalDockingDurationMinutes(Long totalDockingDurationMinutes) {
        this.totalDockingDurationMinutes = totalDockingDurationMinutes;
    }

    // Alias methods for test compatibility
    public void setDockingTime(LocalDateTime dockingTime) {
        this.dockTime = dockingTime;
    }

    public void setUndockingTime(LocalDateTime undockingTime) {
        this.undockTime = undockingTime;
    }

    // Utility methods
    public boolean isCurrentlyDocked() {
        return status == DockingStatus.DOCKED && undockTime == null;
    }

    public void completeDocking() {
        this.undockTime = LocalDateTime.now();
        this.status = DockingStatus.COMPLETED;
        if (dockTime != null) {
            this.totalDockingDurationMinutes = java.time.Duration.between(dockTime, undockTime).toMinutes();
        }
    }

    public long getDockingDurationMinutes() {
        if (dockTime == null)
            return 0;
        LocalDateTime endTime = undockTime != null ? undockTime : LocalDateTime.now();
        return java.time.Duration.between(dockTime, endTime).toMinutes();
    }

    // Enums
    public enum DockingStatus {
        DOCKED,
        COMPLETED,
        ABORTED,
        EMERGENCY_UNDOCK
    }

    @Override
    public String toString() {
        return "DockingRecord{" +
                "id=" + id +
                ", uav=" + (uav != null ? uav.getRfidTag() : "null") +
                ", station=" + (dockingStation != null ? dockingStation.getName() : "null") +
                ", status=" + status +
                ", dockTime=" + dockTime +
                ", undockTime=" + undockTime +
                '}';
    }
}
