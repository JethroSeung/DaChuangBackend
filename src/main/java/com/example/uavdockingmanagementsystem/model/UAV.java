package com.example.uavdockingmanagementsystem.model;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Entity representing an Unmanned Aerial Vehicle (UAV) in the management system.
 *
 * <p>This entity serves as the core model for UAV management, containing comprehensive
 * information about each drone including identification, specifications, operational
 * status, location data, and relationships to other system entities.</p>
 *
 * <p>Key features and relationships:</p>
 * <ul>
 * <li><strong>Identification:</strong> RFID tag and serial number for unique identification</li>
 * <li><strong>Specifications:</strong> Physical and performance characteristics</li>
 * <li><strong>Location Tracking:</strong> Current position and historical data</li>
 * <li><strong>Region Access:</strong> Many-to-many relationship with authorized regions</li>
 * <li><strong>Flight History:</strong> One-to-many relationship with flight logs</li>
 * <li><strong>Maintenance:</strong> One-to-many relationship with maintenance records</li>
 * <li><strong>Battery Monitoring:</strong> One-to-one relationship with battery status</li>
 * </ul>
 *
 * <p>The entity supports both operational and administrative use cases, providing
 * real-time status information for flight operations and comprehensive data for
 * fleet management and analytics.</p>
 *
 * @author UAV Management System Team
 * @version 1.0
 * @since 1.0
 *
 * @see Region
 * @see FlightLog
 * @see MaintenanceRecord
 * @see BatteryStatus
 * @see LocationHistory
 */
@Entity
public class UAV {

    /**
     * Unique identifier for the UAV entity.
     * Auto-generated primary key used for database relationships.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * RFID tag identifier for physical UAV identification.
     * Used for access control and real-time tracking operations.
     * Must be unique across all UAVs in the system.
     */
    private String rfidTag;

    /**
     * Name of the UAV owner or operator.
     * Used for contact and responsibility tracking.
     */
    private String ownerName;

    /**
     * UAV model designation (e.g., "DJI Phantom 4", "DJI Mavic Pro").
     * Used for specifications lookup and maintenance planning.
     */
    private String model;

    /**
     * Flag indicating if the UAV is currently stored in the hibernate pod.
     * Used for capacity management and operational status tracking.
     */
    boolean inHibernatePod;

    /**
     * Authorization status of the UAV for system operations.
     * Determines access permissions and operational capabilities.
     */
    @Enumerated(EnumType.STRING)
    private Status status;

    /**
     * Many-to-many relationship with regions that this UAV is authorized to access.
     *
     * <p>This relationship defines the geographical areas where the UAV is permitted
     * to operate. Access control systems use this information to grant or deny
     * entry to restricted zones.</p>
     *
     * <p>The relationship is managed through a join table 'uav_regions' with
     * foreign keys to both UAV and Region entities.</p>
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinTable(
            name = "uav_regions",
            joinColumns = @JoinColumn(name = "uav_id"),
            inverseJoinColumns = @JoinColumn(name = "region_id")
    )
    private Set<Region> regions = new HashSet<>();

    /**
     * One-to-many relationship with flight log records.
     *
     * <p>Contains historical flight data including start/end times, routes,
     * performance metrics, and operational notes. Used for analytics,
     * compliance reporting, and operational analysis.</p>
     */
    @OneToMany(mappedBy = "uav", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<FlightLog> flightLogs = new ArrayList<>();

    /**
     * One-to-many relationship with maintenance records.
     *
     * <p>Tracks all maintenance activities including scheduled maintenance,
     * repairs, upgrades, and inspections. Critical for airworthiness
     * compliance and operational safety.</p>
     */
    @OneToMany(mappedBy = "uav", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MaintenanceRecord> maintenanceRecords = new ArrayList<>();

    /**
     * One-to-one relationship with current battery status.
     *
     * <p>Provides real-time battery information including charge level,
     * health status, and charging state. Essential for flight safety
     * and operational planning.</p>
     */
    @OneToOne(mappedBy = "uav", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private BatteryStatus batteryStatus;

    /**
     * Manufacturer's serial number for the UAV.
     * Must be unique across all UAVs for warranty and support purposes.
     */
    @Column(name = "serial_number", unique = true, length = 50)
    private String serialNumber;

    // Location tracking properties
    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "current_altitude_meters")
    private Double currentAltitudeMeters;

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

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

    // Location getters and setters
    public Double getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(Double currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public Double getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(Double currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public Double getCurrentAltitudeMeters() {
        return currentAltitudeMeters;
    }

    public void setCurrentAltitudeMeters(Double currentAltitudeMeters) {
        this.currentAltitudeMeters = currentAltitudeMeters;
    }

    public LocalDateTime getLastLocationUpdate() {
        return lastLocationUpdate;
    }

    public void setLastLocationUpdate(LocalDateTime lastLocationUpdate) {
        this.lastLocationUpdate = lastLocationUpdate;
    }

    public boolean hasLocationData() {
        return currentLatitude != null && currentLongitude != null;
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