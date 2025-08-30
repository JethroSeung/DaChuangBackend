package com.uav.dockingmanagement.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Docking Station entity to represent physical UAV docking locations
 * Tracks station status, capacity, and operational information
 */
@Entity
@Table(name = "docking_stations", indexes = {
        @Index(name = "idx_docking_station_name", columnList = "name"),
        @Index(name = "idx_docking_station_status", columnList = "status"),
        @Index(name = "idx_docking_station_location", columnList = "latitude, longitude")
})
public class DockingStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "altitude_meters")
    private Double altitudeMeters;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "current_occupancy", nullable = false)
    private Integer currentOccupancy = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StationStatus status = StationStatus.OPERATIONAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "station_type", nullable = false)
    private StationType stationType = StationType.STANDARD;

    @Column(name = "charging_available")
    private Boolean chargingAvailable = true;

    @Column(name = "maintenance_available")
    private Boolean maintenanceAvailable = false;

    @Column(name = "weather_protected")
    private Boolean weatherProtected = false;

    @Column(name = "security_level")
    private String securityLevel;

    @Column(name = "contact_info", length = 200)
    private String contactInfo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_maintenance_date")
    private LocalDateTime lastMaintenanceDate;

    @Column(name = "next_maintenance_due")
    private LocalDateTime nextMaintenanceDue;

    @Column(name = "operational_hours", length = 50)
    private String operationalHours;

    // Relationships
    @OneToMany(mappedBy = "dockingStation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("dockingStation-dockingRecords")
    private List<DockingRecord> dockingRecords = new ArrayList<>();

    // Constructors
    public DockingStation() {
    }

    public DockingStation(String name, Double latitude, Double longitude, Integer maxCapacity) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.maxCapacity = maxCapacity;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getAltitudeMeters() {
        return altitudeMeters;
    }

    public void setAltitudeMeters(Double altitudeMeters) {
        this.altitudeMeters = altitudeMeters;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public Integer getCurrentOccupancy() {
        return currentOccupancy;
    }

    public void setCurrentOccupancy(Integer currentOccupancy) {
        this.currentOccupancy = currentOccupancy;
    }

    public StationStatus getStatus() {
        return status;
    }

    public void setStatus(StationStatus status) {
        this.status = status;
    }

    public StationType getStationType() {
        return stationType;
    }

    public void setStationType(StationType stationType) {
        this.stationType = stationType;
    }

    public Boolean getChargingAvailable() {
        return chargingAvailable;
    }

    public void setChargingAvailable(Boolean chargingAvailable) {
        this.chargingAvailable = chargingAvailable;
    }

    public Boolean getMaintenanceAvailable() {
        return maintenanceAvailable;
    }

    public void setMaintenanceAvailable(Boolean maintenanceAvailable) {
        this.maintenanceAvailable = maintenanceAvailable;
    }

    public Boolean getWeatherProtected() {
        return weatherProtected;
    }

    public void setWeatherProtected(Boolean weatherProtected) {
        this.weatherProtected = weatherProtected;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastMaintenanceDate() {
        return lastMaintenanceDate;
    }

    public void setLastMaintenanceDate(LocalDateTime lastMaintenanceDate) {
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public LocalDateTime getNextMaintenanceDue() {
        return nextMaintenanceDue;
    }

    public void setNextMaintenanceDue(LocalDateTime nextMaintenanceDue) {
        this.nextMaintenanceDue = nextMaintenanceDue;
    }

    public String getOperationalHours() {
        return operationalHours;
    }

    public void setOperationalHours(String operationalHours) {
        this.operationalHours = operationalHours;
    }

    public List<DockingRecord> getDockingRecords() {
        return dockingRecords;
    }

    public void setDockingRecords(List<DockingRecord> dockingRecords) {
        this.dockingRecords = dockingRecords;
    }

    // Utility methods
    public boolean isAvailable() {
        return status == StationStatus.OPERATIONAL &&
                currentOccupancy != null &&
                currentOccupancy >= 0 &&
                maxCapacity != null &&
                maxCapacity > 0 &&
                currentOccupancy < maxCapacity;
    }

    public boolean isFull() {
        return currentOccupancy != null &&
                maxCapacity != null &&
                currentOccupancy >= maxCapacity;
    }

    public double getOccupancyPercentage() {
        return (maxCapacity != null && maxCapacity > 0 && currentOccupancy != null)
                ? (double) currentOccupancy / maxCapacity * 100
                : 0;
    }

    public boolean needsMaintenance() {
        return nextMaintenanceDue != null && nextMaintenanceDue.isBefore(LocalDateTime.now());
    }

    // Enums
    public enum StationStatus {
        OPERATIONAL,
        MAINTENANCE,
        OUT_OF_SERVICE,
        EMERGENCY,
        OFFLINE
    }

    public enum StationType {
        STANDARD,
        CHARGING,
        MAINTENANCE,
        EMERGENCY,
        TEMPORARY
    }

    @Override
    public String toString() {
        return "DockingStation{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", status=" + status +
                ", occupancy=" + (currentOccupancy != null ? currentOccupancy : "null") +
                "/" + (maxCapacity != null ? maxCapacity : "null") +
                '}';
    }
}
