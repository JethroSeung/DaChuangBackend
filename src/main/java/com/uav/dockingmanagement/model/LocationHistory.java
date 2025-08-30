package com.uav.dockingmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Location History entity to track UAV position over time
 * Stores historical location data for flight path reconstruction and analysis
 */
@Entity
@Table(name = "location_history", indexes = {
        @Index(name = "idx_location_history_uav", columnList = "uav_id"),
        @Index(name = "idx_location_history_timestamp", columnList = "timestamp"),
        @Index(name = "idx_location_history_location", columnList = "latitude, longitude"),
        @Index(name = "idx_location_history_flight_log", columnList = "flight_log_id")
})
public class LocationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uav_id", nullable = false)
    @JsonBackReference
    private UAV uav;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_log_id")
    @JsonBackReference
    private FlightLog flightLog;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "altitude_meters")
    private Double altitudeMeters;

    @Column(name = "speed_kmh")
    private Double speedKmh;

    @Column(name = "heading_degrees")
    private Double headingDegrees;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_source")
    private LocationSource locationSource = LocationSource.GPS;

    @Column(name = "accuracy_meters")
    private Double accuracyMeters;

    @Column(name = "signal_strength")
    private Integer signalStrength;

    @Column(name = "weather_conditions", length = 100)
    private String weatherConditions;

    @Column(name = "notes", length = 300)
    private String notes;

    // Constructors
    public LocationHistory() {
    }

    public LocationHistory(UAV uav, Double latitude, Double longitude) {
        this.uav = uav;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public LocationHistory(UAV uav, Double latitude, Double longitude, Double altitudeMeters) {
        this.uav = uav;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitudeMeters = altitudeMeters;
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

    public FlightLog getFlightLog() {
        return flightLog;
    }

    public void setFlightLog(FlightLog flightLog) {
        this.flightLog = flightLog;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
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

    public Double getSpeedKmh() {
        return speedKmh;
    }

    public void setSpeedKmh(Double speedKmh) {
        this.speedKmh = speedKmh;
    }

    public Double getHeadingDegrees() {
        return headingDegrees;
    }

    public void setHeadingDegrees(Double headingDegrees) {
        this.headingDegrees = headingDegrees;
    }

    public Integer getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(Integer batteryLevel) {
        this.batteryLevel = batteryLevel;
    }

    public LocationSource getLocationSource() {
        return locationSource;
    }

    public void setLocationSource(LocationSource locationSource) {
        this.locationSource = locationSource;
    }

    public Double getAccuracyMeters() {
        return accuracyMeters;
    }

    public void setAccuracyMeters(Double accuracyMeters) {
        this.accuracyMeters = accuracyMeters;
    }

    public Integer getSignalStrength() {
        return signalStrength;
    }

    public void setSignalStrength(Integer signalStrength) {
        this.signalStrength = signalStrength;
    }

    public String getWeatherConditions() {
        return weatherConditions;
    }

    public void setWeatherConditions(String weatherConditions) {
        this.weatherConditions = weatherConditions;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Utility methods
    public boolean isHighAccuracy() {
        return accuracyMeters != null && accuracyMeters <= 5.0;
    }

    public boolean isGoodSignal() {
        return signalStrength != null && signalStrength >= 70;
    }

    public double distanceToPoint(double lat, double lon) {
        // Haversine formula for calculating distance between two points
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat - this.latitude);
        double lonDistance = Math.toRadians(lon - this.longitude);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(this.latitude)) * Math.cos(Math.toRadians(lat))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c * 1000; // Distance in meters
    }

    // Enums
    public enum LocationSource {
        GPS,
        CELLULAR,
        WIFI,
        MANUAL,
        ESTIMATED,
        RADAR
    }

    @Override
    public String toString() {
        return "LocationHistory{" +
                "id=" + id +
                ", uav=" + (uav != null ? uav.getRfidTag() : "null") +
                ", timestamp=" + timestamp +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", altitude=" + altitudeMeters +
                '}';
    }
}
