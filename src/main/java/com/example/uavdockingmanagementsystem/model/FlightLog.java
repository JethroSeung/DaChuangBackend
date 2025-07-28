package com.example.uavdockingmanagementsystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Flight Log entity to track UAV flight operations
 * Records detailed information about each flight mission
 */
@Entity
@Table(name = "flight_logs")
public class FlightLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uav_id", nullable = false)
    @JsonBackReference
    private UAV uav;

    @Column(name = "mission_name", nullable = false, length = 100)
    private String missionName;

    @Column(name = "flight_duration_minutes")
    private Integer flightDurationMinutes;

    @Column(name = "max_altitude_meters")
    private Double maxAltitudeMeters;

    @Column(name = "distance_traveled_km")
    private Double distanceTraveledKm;

    @Column(name = "start_latitude")
    private Double startLatitude;

    @Column(name = "start_longitude")
    private Double startLongitude;

    @Column(name = "end_latitude")
    private Double endLatitude;

    @Column(name = "end_longitude")
    private Double endLongitude;

    @Column(name = "battery_start_percentage")
    private Integer batteryStartPercentage;

    @Column(name = "battery_end_percentage")
    private Integer batteryEndPercentage;

    @Column(name = "weather_conditions", length = 200)
    private String weatherConditions;

    @Enumerated(EnumType.STRING)
    @Column(name = "flight_status", nullable = false)
    private FlightStatus flightStatus = FlightStatus.PLANNED;

    @Column(name = "pilot_name", length = 100)
    private String pilotName;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "flight_start_time")
    private LocalDateTime flightStartTime;

    @Column(name = "flight_end_time")
    private LocalDateTime flightEndTime;

    @Column(name = "emergency_landing", nullable = false)
    private Boolean emergencyLanding = false;

    @Column(name = "payload_weight_kg")
    private Double payloadWeightKg;

    @Column(name = "average_speed_kmh")
    private Double averageSpeedKmh;

    @Column(name = "max_speed_kmh")
    private Double maxSpeedKmh;

    public enum FlightStatus {
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        ABORTED,
        EMERGENCY_LANDED,
        CANCELLED
    }

    // Constructors
    public FlightLog() {}

    public FlightLog(UAV uav, String missionName) {
        this.uav = uav;
        this.missionName = missionName;
        this.flightStatus = FlightStatus.PLANNED;
        this.emergencyLanding = false;
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

    public String getMissionName() {
        return missionName;
    }

    public void setMissionName(String missionName) {
        this.missionName = missionName;
    }

    public Integer getFlightDurationMinutes() {
        return flightDurationMinutes;
    }

    public void setFlightDurationMinutes(Integer flightDurationMinutes) {
        this.flightDurationMinutes = flightDurationMinutes;
    }

    public Double getMaxAltitudeMeters() {
        return maxAltitudeMeters;
    }

    public void setMaxAltitudeMeters(Double maxAltitudeMeters) {
        this.maxAltitudeMeters = maxAltitudeMeters;
    }

    public Double getDistanceTraveledKm() {
        return distanceTraveledKm;
    }

    public void setDistanceTraveledKm(Double distanceTraveledKm) {
        this.distanceTraveledKm = distanceTraveledKm;
    }

    public Double getStartLatitude() {
        return startLatitude;
    }

    public void setStartLatitude(Double startLatitude) {
        this.startLatitude = startLatitude;
    }

    public Double getStartLongitude() {
        return startLongitude;
    }

    public void setStartLongitude(Double startLongitude) {
        this.startLongitude = startLongitude;
    }

    public Double getEndLatitude() {
        return endLatitude;
    }

    public void setEndLatitude(Double endLatitude) {
        this.endLatitude = endLatitude;
    }

    public Double getEndLongitude() {
        return endLongitude;
    }

    public void setEndLongitude(Double endLongitude) {
        this.endLongitude = endLongitude;
    }

    public Integer getBatteryStartPercentage() {
        return batteryStartPercentage;
    }

    public void setBatteryStartPercentage(Integer batteryStartPercentage) {
        this.batteryStartPercentage = batteryStartPercentage;
    }

    public Integer getBatteryEndPercentage() {
        return batteryEndPercentage;
    }

    public void setBatteryEndPercentage(Integer batteryEndPercentage) {
        this.batteryEndPercentage = batteryEndPercentage;
    }

    public String getWeatherConditions() {
        return weatherConditions;
    }

    public void setWeatherConditions(String weatherConditions) {
        this.weatherConditions = weatherConditions;
    }

    public FlightStatus getFlightStatus() {
        return flightStatus;
    }

    public void setFlightStatus(FlightStatus flightStatus) {
        this.flightStatus = flightStatus;
    }

    public String getPilotName() {
        return pilotName;
    }

    public void setPilotName(String pilotName) {
        this.pilotName = pilotName;
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

    public LocalDateTime getFlightStartTime() {
        return flightStartTime;
    }

    public void setFlightStartTime(LocalDateTime flightStartTime) {
        this.flightStartTime = flightStartTime;
    }

    public LocalDateTime getFlightEndTime() {
        return flightEndTime;
    }

    public void setFlightEndTime(LocalDateTime flightEndTime) {
        this.flightEndTime = flightEndTime;
    }

    public Boolean getEmergencyLanding() {
        return emergencyLanding;
    }

    public void setEmergencyLanding(Boolean emergencyLanding) {
        this.emergencyLanding = emergencyLanding;
    }

    public Double getPayloadWeightKg() {
        return payloadWeightKg;
    }

    public void setPayloadWeightKg(Double payloadWeightKg) {
        this.payloadWeightKg = payloadWeightKg;
    }

    public Double getAverageSpeedKmh() {
        return averageSpeedKmh;
    }

    public void setAverageSpeedKmh(Double averageSpeedKmh) {
        this.averageSpeedKmh = averageSpeedKmh;
    }

    public Double getMaxSpeedKmh() {
        return maxSpeedKmh;
    }

    public void setMaxSpeedKmh(Double maxSpeedKmh) {
        this.maxSpeedKmh = maxSpeedKmh;
    }

    // Utility methods
    public Integer getBatteryConsumption() {
        if (batteryStartPercentage != null && batteryEndPercentage != null) {
            return batteryStartPercentage - batteryEndPercentage;
        }
        return null;
    }

    public boolean isFlightCompleted() {
        return flightStatus == FlightStatus.COMPLETED;
    }

    public boolean isEmergencyFlight() {
        return emergencyLanding || flightStatus == FlightStatus.EMERGENCY_LANDED;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FlightLog flightLog = (FlightLog) o;
        return Objects.equals(id, flightLog.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "FlightLog{" +
                "id=" + id +
                ", missionName='" + missionName + '\'' +
                ", flightStatus=" + flightStatus +
                ", flightDurationMinutes=" + flightDurationMinutes +
                ", distanceTraveledKm=" + distanceTraveledKm +
                ", createdAt=" + createdAt +
                '}';
    }
}
