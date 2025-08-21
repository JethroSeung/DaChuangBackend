package com.uav.dockingmanagement.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Geofence entity to define geographical boundaries for UAV operations
 * Supports both circular and polygonal geofences
 */
@Entity
@Table(name = "geofences", indexes = {
    @Index(name = "idx_geofence_name", columnList = "name"),
    @Index(name = "idx_geofence_type", columnList = "fence_type"),
    @Index(name = "idx_geofence_status", columnList = "status"),
    @Index(name = "idx_geofence_center", columnList = "center_latitude, center_longitude")
})
public class Geofence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "fence_type", nullable = false)
    private FenceType fenceType = FenceType.CIRCULAR;

    @Enumerated(EnumType.STRING)
    @Column(name = "boundary_type", nullable = false)
    private BoundaryType boundaryType = BoundaryType.INCLUSION;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FenceStatus status = FenceStatus.ACTIVE;

    // For circular geofences
    @Column(name = "center_latitude")
    private Double centerLatitude;

    @Column(name = "center_longitude")
    private Double centerLongitude;

    @Column(name = "radius_meters")
    private Double radiusMeters;

    // For polygonal geofences - stored as JSON or separate entity
    @Column(name = "polygon_coordinates", columnDefinition = "TEXT")
    private String polygonCoordinates; // JSON format: [[lat1,lon1],[lat2,lon2],...]

    @Column(name = "min_altitude_meters")
    private Double minAltitudeMeters;

    @Column(name = "max_altitude_meters")
    private Double maxAltitudeMeters;

    @Column(name = "priority_level")
    private Integer priorityLevel = 1; // Higher number = higher priority

    @Column(name = "violation_action", length = 50)
    private String violationAction; // ALERT, RETURN_TO_BASE, LAND, etc.

    @Column(name = "notification_emails", length = 500)
    private String notificationEmails; // Comma-separated email list

    @Column(name = "active_from")
    private LocalDateTime activeFrom;

    @Column(name = "active_until")
    private LocalDateTime activeUntil;

    @Column(name = "days_of_week", length = 20)
    private String daysOfWeek; // e.g., "MON,TUE,WED,THU,FRI"

    @Column(name = "time_from")
    private String timeFrom; // e.g., "08:00"

    @Column(name = "time_until")
    private String timeUntil; // e.g., "18:00"

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "last_violation_time")
    private LocalDateTime lastViolationTime;

    @Column(name = "total_violations")
    private Integer totalViolations = 0;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // Constructors
    public Geofence() {}

    public Geofence(String name, FenceType fenceType, BoundaryType boundaryType) {
        this.name = name;
        this.fenceType = fenceType;
        this.boundaryType = boundaryType;
    }

    // Static factory methods for common geofence types
    public static Geofence createCircularFence(String name, double centerLat, double centerLon, double radiusMeters, BoundaryType boundaryType) {
        Geofence fence = new Geofence(name, FenceType.CIRCULAR, boundaryType);
        fence.setCenterLatitude(centerLat);
        fence.setCenterLongitude(centerLon);
        fence.setRadiusMeters(radiusMeters);
        return fence;
    }

    public static Geofence createPolygonalFence(String name, String polygonCoordinates, BoundaryType boundaryType) {
        Geofence fence = new Geofence(name, FenceType.POLYGONAL, boundaryType);
        fence.setPolygonCoordinates(polygonCoordinates);
        return fence;
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

    public FenceType getFenceType() {
        return fenceType;
    }

    public void setFenceType(FenceType fenceType) {
        this.fenceType = fenceType;
    }

    public BoundaryType getBoundaryType() {
        return boundaryType;
    }

    public void setBoundaryType(BoundaryType boundaryType) {
        this.boundaryType = boundaryType;
    }

    public FenceStatus getStatus() {
        return status;
    }

    public void setStatus(FenceStatus status) {
        this.status = status;
    }

    public Double getCenterLatitude() {
        return centerLatitude;
    }

    public void setCenterLatitude(Double centerLatitude) {
        this.centerLatitude = centerLatitude;
    }

    public Double getCenterLongitude() {
        return centerLongitude;
    }

    public void setCenterLongitude(Double centerLongitude) {
        this.centerLongitude = centerLongitude;
    }

    public Double getRadiusMeters() {
        return radiusMeters;
    }

    public void setRadiusMeters(Double radiusMeters) {
        this.radiusMeters = radiusMeters;
    }

    public String getPolygonCoordinates() {
        return polygonCoordinates;
    }

    public void setPolygonCoordinates(String polygonCoordinates) {
        this.polygonCoordinates = polygonCoordinates;
    }

    public Double getMinAltitudeMeters() {
        return minAltitudeMeters;
    }

    public void setMinAltitudeMeters(Double minAltitudeMeters) {
        this.minAltitudeMeters = minAltitudeMeters;
    }

    public Double getMaxAltitudeMeters() {
        return maxAltitudeMeters;
    }

    public void setMaxAltitudeMeters(Double maxAltitudeMeters) {
        this.maxAltitudeMeters = maxAltitudeMeters;
    }

    public Integer getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(Integer priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public String getViolationAction() {
        return violationAction;
    }

    public void setViolationAction(String violationAction) {
        this.violationAction = violationAction;
    }

    public String getNotificationEmails() {
        return notificationEmails;
    }

    public void setNotificationEmails(String notificationEmails) {
        this.notificationEmails = notificationEmails;
    }

    public LocalDateTime getActiveFrom() {
        return activeFrom;
    }

    public void setActiveFrom(LocalDateTime activeFrom) {
        this.activeFrom = activeFrom;
    }

    public LocalDateTime getActiveUntil() {
        return activeUntil;
    }

    public void setActiveUntil(LocalDateTime activeUntil) {
        this.activeUntil = activeUntil;
    }

    public String getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(String daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public String getTimeFrom() {
        return timeFrom;
    }

    public void setTimeFrom(String timeFrom) {
        this.timeFrom = timeFrom;
    }

    public String getTimeUntil() {
        return timeUntil;
    }

    public void setTimeUntil(String timeUntil) {
        this.timeUntil = timeUntil;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getLastViolationTime() {
        return lastViolationTime;
    }

    public void setLastViolationTime(LocalDateTime lastViolationTime) {
        this.lastViolationTime = lastViolationTime;
    }

    public Integer getTotalViolations() {
        return totalViolations;
    }

    public void setTotalViolations(Integer totalViolations) {
        this.totalViolations = totalViolations;
    }

    public LocalDateTime getActivatedAt() {
        return activatedAt;
    }

    public void setActivatedAt(LocalDateTime activatedAt) {
        this.activatedAt = activatedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    // Utility methods
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return status == FenceStatus.ACTIVE &&
               (activeFrom == null || now.isAfter(activeFrom)) &&
               (activeUntil == null || now.isBefore(activeUntil));
    }

    public void recordViolation() {
        this.lastViolationTime = LocalDateTime.now();
        this.totalViolations = (this.totalViolations != null ? this.totalViolations : 0) + 1;
    }

    public boolean isPointInside(double latitude, double longitude) {
        if (fenceType == FenceType.CIRCULAR) {
            return isPointInCircle(latitude, longitude);
        } else if (fenceType == FenceType.POLYGONAL) {
            return isPointInPolygon(latitude, longitude);
        }
        return false;
    }

    private boolean isPointInCircle(double latitude, double longitude) {
        if (centerLatitude == null || centerLongitude == null || radiusMeters == null) {
            return false;
        }
        
        double distance = calculateDistance(centerLatitude, centerLongitude, latitude, longitude);
        return distance <= radiusMeters;
    }

    private boolean isPointInPolygon(double latitude, double longitude) {
        if (polygonCoordinates == null || polygonCoordinates.trim().isEmpty()) {
            return false;
        }

        try {
            // Parse polygon coordinates - expected format: [[lat1,lon1],[lat2,lon2],...]
            String coords = polygonCoordinates.trim();
            if (!coords.startsWith("[[") || !coords.endsWith("]]")) {
                return false;
            }

            // Remove outer brackets and split by coordinate pairs
            coords = coords.substring(2, coords.length() - 2);
            String[] pairs = coords.split("\\],\\[");

            if (pairs.length < 3) {
                return false; // Need at least 3 points for a polygon
            }

            // Convert to coordinate arrays
            double[] lats = new double[pairs.length];
            double[] lons = new double[pairs.length];

            for (int i = 0; i < pairs.length; i++) {
                String[] coords_pair = pairs[i].split(",");
                if (coords_pair.length != 2) {
                    return false;
                }
                lats[i] = Double.parseDouble(coords_pair[0]);
                lons[i] = Double.parseDouble(coords_pair[1]);
            }

            // Ray casting algorithm for point-in-polygon test
            boolean inside = false;
            int j = lats.length - 1;

            for (int i = 0; i < lats.length; i++) {
                if (((lats[i] > latitude) != (lats[j] > latitude)) &&
                    (longitude < (lons[j] - lons[i]) * (latitude - lats[i]) / (lats[j] - lats[i]) + lons[i])) {
                    inside = !inside;
                }
                j = i;
            }

            return inside;

        } catch (Exception e) {
            // If parsing fails, return false
            return false;
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c * 1000; // Distance in meters
    }

    // Enums
    public enum FenceType {
        CIRCULAR,
        POLYGONAL,
        RECTANGULAR
    }

    public enum BoundaryType {
        INCLUSION, // UAV must stay inside
        EXCLUSION  // UAV must stay outside
    }

    public enum FenceStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        EXPIRED
    }

    @Override
    public String toString() {
        return "Geofence{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type=" + fenceType +
                ", boundaryType=" + boundaryType +
                ", status=" + status +
                '}';
    }
}
