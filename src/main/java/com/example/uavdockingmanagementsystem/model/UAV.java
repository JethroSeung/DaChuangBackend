package com.example.uavdockingmanagementsystem.model;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Entity
public class UAV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String rfidTag;
    private String ownerName;
    private String model;
    boolean inHibernatePod;
    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinTable(
            name = "uav_regions",
            joinColumns = @JoinColumn(name = "uav_id"),
            inverseJoinColumns = @JoinColumn(name = "region_id")
    )
    private Set<Region> regions = new HashSet<>();

    // Flight logs relationship
    @OneToMany(mappedBy = "uav", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<FlightLog> flightLogs = new ArrayList<>();

    // Maintenance records relationship
    @OneToMany(mappedBy = "uav", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MaintenanceRecord> maintenanceRecords = new ArrayList<>();

    // Battery status relationship
    @OneToOne(mappedBy = "uav", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private BatteryStatus batteryStatus;

    // Additional UAV properties
    @Column(name = "serial_number", unique = true, length = 50)
    private String serialNumber;

    @Column(name = "manufacturer", length = 50)
    private String manufacturer;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "max_flight_time_minutes")
    private Integer maxFlightTimeMinutes;

    @Column(name = "max_altitude_meters")
    private Integer maxAltitudeMeters;

    @Column(name = "max_speed_kmh")
    private Integer maxSpeedKmh;

    @Column(name = "total_flight_hours")
    private Integer totalFlightHours = 0;

    @Column(name = "total_flight_cycles")
    private Integer totalFlightCycles = 0;

    @Column(name = "last_maintenance_date")
    private LocalDateTime lastMaintenanceDate;

    @Column(name = "next_maintenance_due")
    private LocalDateTime nextMaintenanceDue;

    @Column(name = "current_location_latitude")
    private Double currentLocationLatitude;

    @Column(name = "current_location_longitude")
    private Double currentLocationLongitude;

    @Column(name = "last_known_location_update")
    private LocalDateTime lastKnownLocationUpdate;

    @Enumerated(EnumType.STRING)
    @Column(name = "operational_status")
    private OperationalStatus operationalStatus = OperationalStatus.READY;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters
    public boolean isInHibernatePod() {
        return inHibernatePod;
    }

    public void setInHibernatePod(boolean inHibernatePod) {
        this.inHibernatePod = inHibernatePod;
    }

    public int getId() {
        return id;
    }

    public String getRfidTag() {
        return rfidTag;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getModel() {
        return model;
    }

    public Status getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setRfidTag(String rfidTag) {
        this.rfidTag = rfidTag;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<Region> getRegions() {
        return regions;
    }

    public void setRegions(Set<Region> regions) {
        this.regions = regions;
    }

    // Getters and setters for new fields
    public List<FlightLog> getFlightLogs() {
        return flightLogs;
    }

    public void setFlightLogs(List<FlightLog> flightLogs) {
        this.flightLogs = flightLogs;
    }

    public List<MaintenanceRecord> getMaintenanceRecords() {
        return maintenanceRecords;
    }

    public void setMaintenanceRecords(List<MaintenanceRecord> maintenanceRecords) {
        this.maintenanceRecords = maintenanceRecords;
    }

    public BatteryStatus getBatteryStatus() {
        return batteryStatus;
    }

    public void setBatteryStatus(BatteryStatus batteryStatus) {
        this.batteryStatus = batteryStatus;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Integer getMaxFlightTimeMinutes() {
        return maxFlightTimeMinutes;
    }

    public void setMaxFlightTimeMinutes(Integer maxFlightTimeMinutes) {
        this.maxFlightTimeMinutes = maxFlightTimeMinutes;
    }

    public Integer getMaxAltitudeMeters() {
        return maxAltitudeMeters;
    }

    public void setMaxAltitudeMeters(Integer maxAltitudeMeters) {
        this.maxAltitudeMeters = maxAltitudeMeters;
    }

    public Integer getMaxSpeedKmh() {
        return maxSpeedKmh;
    }

    public void setMaxSpeedKmh(Integer maxSpeedKmh) {
        this.maxSpeedKmh = maxSpeedKmh;
    }

    public Integer getTotalFlightHours() {
        return totalFlightHours;
    }

    public void setTotalFlightHours(Integer totalFlightHours) {
        this.totalFlightHours = totalFlightHours;
    }

    public Integer getTotalFlightCycles() {
        return totalFlightCycles;
    }

    public void setTotalFlightCycles(Integer totalFlightCycles) {
        this.totalFlightCycles = totalFlightCycles;
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

    public Double getCurrentLocationLatitude() {
        return currentLocationLatitude;
    }

    public void setCurrentLocationLatitude(Double currentLocationLatitude) {
        this.currentLocationLatitude = currentLocationLatitude;
    }

    public Double getCurrentLocationLongitude() {
        return currentLocationLongitude;
    }

    public void setCurrentLocationLongitude(Double currentLocationLongitude) {
        this.currentLocationLongitude = currentLocationLongitude;
    }

    public LocalDateTime getLastKnownLocationUpdate() {
        return lastKnownLocationUpdate;
    }

    public void setLastKnownLocationUpdate(LocalDateTime lastKnownLocationUpdate) {
        this.lastKnownLocationUpdate = lastKnownLocationUpdate;
    }

    public OperationalStatus getOperationalStatus() {
        return operationalStatus;
    }

    public void setOperationalStatus(OperationalStatus operationalStatus) {
        this.operationalStatus = operationalStatus;
    }

    // Utility methods for new features
    public boolean needsMaintenance() {
        return nextMaintenanceDue != null && nextMaintenanceDue.isBefore(LocalDateTime.now());
    }

    public boolean isOperational() {
        return operationalStatus == OperationalStatus.READY || operationalStatus == OperationalStatus.IN_FLIGHT;
    }

    public boolean hasLowBattery() {
        return batteryStatus != null && batteryStatus.isLowBattery();
    }

    public Integer getFlightLogCount() {
        return flightLogs != null ? flightLogs.size() : 0;
    }

    public Integer getMaintenanceRecordCount() {
        return maintenanceRecords != null ? maintenanceRecords.size() : 0;
    }

    public enum Status {
        AUTHORIZED, UNAUTHORIZED
    }

    public enum OperationalStatus {
        READY,
        IN_FLIGHT,
        MAINTENANCE,
        CHARGING,
        HIBERNATING,
        OUT_OF_SERVICE,
        EMERGENCY,
        LOST_COMMUNICATION
    }
}