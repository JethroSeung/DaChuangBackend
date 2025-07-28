package com.example.uavdockingmanagementsystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Maintenance Record entity to track UAV maintenance and service history
 * Records detailed information about maintenance activities
 */
@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uav_id", nullable = false)
    @JsonBackReference
    private UAV uav;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false)
    private MaintenanceType maintenanceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "technician_name", length = 100)
    private String technicianName;

    @Column(name = "estimated_duration_hours")
    private Integer estimatedDurationHours;

    @Column(name = "actual_duration_hours")
    private Integer actualDurationHours;

    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "parts_replaced", columnDefinition = "TEXT")
    private String partsReplaced;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    @Column(name = "started_date")
    private LocalDateTime startedDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(name = "next_maintenance_date")
    private LocalDateTime nextMaintenanceDate;

    @Column(name = "flight_hours_at_maintenance")
    private Integer flightHoursAtMaintenance;

    @Column(name = "cycles_at_maintenance")
    private Integer cyclesAtMaintenance;

    @Column(name = "warranty_covered", nullable = false)
    private Boolean warrantyCovered = false;

    @Column(name = "external_service", nullable = false)
    private Boolean externalService = false;

    @Column(name = "service_provider", length = 100)
    private String serviceProvider;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum MaintenanceType {
        ROUTINE_INSPECTION,
        PREVENTIVE_MAINTENANCE,
        CORRECTIVE_MAINTENANCE,
        EMERGENCY_REPAIR,
        BATTERY_SERVICE,
        PROPELLER_REPLACEMENT,
        MOTOR_SERVICE,
        SENSOR_CALIBRATION,
        SOFTWARE_UPDATE,
        STRUCTURAL_REPAIR,
        ANNUAL_INSPECTION,
        PRE_FLIGHT_CHECK,
        POST_FLIGHT_CHECK
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL,
        EMERGENCY
    }

    public enum MaintenanceStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED,
        WAITING_PARTS,
        WAITING_APPROVAL
    }

    // Constructors
    public MaintenanceRecord() {}

    public MaintenanceRecord(UAV uav, MaintenanceType maintenanceType, String title) {
        this.uav = uav;
        this.maintenanceType = maintenanceType;
        this.title = title;
        this.status = MaintenanceStatus.SCHEDULED;
        this.priority = Priority.MEDIUM;
        this.warrantyCovered = false;
        this.externalService = false;
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

    public MaintenanceType getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(MaintenanceType maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public MaintenanceStatus getStatus() {
        return status;
    }

    public void setStatus(MaintenanceStatus status) {
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTechnicianName() {
        return technicianName;
    }

    public void setTechnicianName(String technicianName) {
        this.technicianName = technicianName;
    }

    public Integer getEstimatedDurationHours() {
        return estimatedDurationHours;
    }

    public void setEstimatedDurationHours(Integer estimatedDurationHours) {
        this.estimatedDurationHours = estimatedDurationHours;
    }

    public Integer getActualDurationHours() {
        return actualDurationHours;
    }

    public void setActualDurationHours(Integer actualDurationHours) {
        this.actualDurationHours = actualDurationHours;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public String getPartsReplaced() {
        return partsReplaced;
    }

    public void setPartsReplaced(String partsReplaced) {
        this.partsReplaced = partsReplaced;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDateTime getStartedDate() {
        return startedDate;
    }

    public void setStartedDate(LocalDateTime startedDate) {
        this.startedDate = startedDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public LocalDateTime getNextMaintenanceDate() {
        return nextMaintenanceDate;
    }

    public void setNextMaintenanceDate(LocalDateTime nextMaintenanceDate) {
        this.nextMaintenanceDate = nextMaintenanceDate;
    }

    public Integer getFlightHoursAtMaintenance() {
        return flightHoursAtMaintenance;
    }

    public void setFlightHoursAtMaintenance(Integer flightHoursAtMaintenance) {
        this.flightHoursAtMaintenance = flightHoursAtMaintenance;
    }

    public Integer getCyclesAtMaintenance() {
        return cyclesAtMaintenance;
    }

    public void setCyclesAtMaintenance(Integer cyclesAtMaintenance) {
        this.cyclesAtMaintenance = cyclesAtMaintenance;
    }

    public Boolean getWarrantyCovered() {
        return warrantyCovered;
    }

    public void setWarrantyCovered(Boolean warrantyCovered) {
        this.warrantyCovered = warrantyCovered;
    }

    public Boolean getExternalService() {
        return externalService;
    }

    public void setExternalService(Boolean externalService) {
        this.externalService = externalService;
    }

    public String getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(String serviceProvider) {
        this.serviceProvider = serviceProvider;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    // Utility methods
    public boolean isOverdue() {
        return scheduledDate != null && scheduledDate.isBefore(LocalDateTime.now()) && 
               status != MaintenanceStatus.COMPLETED && status != MaintenanceStatus.CANCELLED;
    }

    public boolean isCompleted() {
        return status == MaintenanceStatus.COMPLETED;
    }

    public boolean isHighPriority() {
        return priority == Priority.HIGH || priority == Priority.CRITICAL || priority == Priority.EMERGENCY;
    }

    public Integer getDurationVariance() {
        if (estimatedDurationHours != null && actualDurationHours != null) {
            return actualDurationHours - estimatedDurationHours;
        }
        return null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MaintenanceRecord that = (MaintenanceRecord) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "MaintenanceRecord{" +
                "id=" + id +
                ", maintenanceType=" + maintenanceType +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", priority=" + priority +
                ", scheduledDate=" + scheduledDate +
                '}';
    }
}
