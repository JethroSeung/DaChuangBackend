package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.FlightLog;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.FlightLogRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing flight logs
 * Provides business logic for flight log operations
 */
@Service
@Transactional
public class FlightLogService {

    private static final Logger logger = LoggerFactory.getLogger(FlightLogService.class);

    @Autowired
    private FlightLogRepository flightLogRepository;

    @Autowired
    private UAVRepository uavRepository;

    /**
     * Create a new flight log
     */
    @CacheEvict(value = { "flightLogs", "statistics" }, allEntries = true)
    public FlightLog createFlightLog(FlightLog flightLog) {
        logger.info("Creating new flight log for mission: {}", flightLog.getMissionName());

        // Validate UAV exists
        if (flightLog.getUav() == null || flightLog.getUav().getId() == 0) {
            throw new IllegalArgumentException("UAV is required for flight log");
        }

        // Set default values
        if (flightLog.getFlightStatus() == null) {
            flightLog.setFlightStatus(FlightLog.FlightStatus.PLANNED);
        }

        FlightLog savedLog = flightLogRepository.save(flightLog);
        logger.info("Flight log created with ID: {}", savedLog.getId());
        return savedLog;
    }

    /**
     * Get all flight logs
     */
    @Cacheable("flightLogs")
    public List<FlightLog> getAllFlightLogs() {
        logger.debug("Retrieving all flight logs");
        return flightLogRepository.findAll();
    }

    /**
     * Get flight log by ID
     */
    public Optional<FlightLog> getFlightLogById(Long id) {
        logger.debug("Retrieving flight log with ID: {}", id);
        return flightLogRepository.findById(id);
    }

    /**
     * Get flight logs by UAV
     */
    public List<FlightLog> getFlightLogsByUAV(UAV uav) {
        logger.debug("Retrieving flight logs for UAV: {}", uav.getRfidTag());
        return flightLogRepository.findByUavOrderByCreatedAtDesc(uav);
    }

    /**
     * Get flight logs by UAV ID
     */
    public List<FlightLog> getFlightLogsByUAVId(Integer uavId) {
        logger.debug("Retrieving flight logs for UAV ID: {}", uavId);
        return flightLogRepository.findByUavIdOrderByCreatedAtDesc(uavId);
    }

    /**
     * Get flight logs by status
     */
    public List<FlightLog> getFlightLogsByStatus(FlightLog.FlightStatus status) {
        logger.debug("Retrieving flight logs with status: {}", status);
        return flightLogRepository.findByFlightStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Start a flight
     */
    @CacheEvict(value = { "flightLogs", "statistics" }, allEntries = true)
    public FlightLog startFlight(Long flightLogId) {
        Optional<FlightLog> flightLogOpt = flightLogRepository.findById(flightLogId);
        if (flightLogOpt.isEmpty()) {
            throw new IllegalArgumentException("Flight log not found with ID: " + flightLogId);
        }

        FlightLog flightLog = flightLogOpt.get();
        flightLog.setFlightStatus(FlightLog.FlightStatus.IN_PROGRESS);
        flightLog.setFlightStartTime(LocalDateTime.now());

        // Update UAV operational status
        UAV uav = flightLog.getUav();
        uav.setOperationalStatus(UAV.OperationalStatus.IN_FLIGHT);
        uavRepository.save(uav);

        FlightLog savedLog = flightLogRepository.save(flightLog);
        logger.info("Flight started for mission: {} (ID: {})", flightLog.getMissionName(), flightLogId);
        return savedLog;
    }

    /**
     * Complete a flight
     */
    @CacheEvict(value = { "flightLogs", "statistics" }, allEntries = true)
    public FlightLog completeFlight(Long flightLogId, FlightLog flightData) {
        Optional<FlightLog> flightLogOpt = flightLogRepository.findById(flightLogId);
        if (flightLogOpt.isEmpty()) {
            throw new IllegalArgumentException("Flight log not found with ID: " + flightLogId);
        }

        FlightLog flightLog = flightLogOpt.get();
        flightLog.setFlightStatus(FlightLog.FlightStatus.COMPLETED);
        flightLog.setFlightEndTime(LocalDateTime.now());

        // Update flight data
        if (flightData.getFlightDurationMinutes() != null) {
            flightLog.setFlightDurationMinutes(flightData.getFlightDurationMinutes());
        }
        if (flightData.getMaxAltitudeMeters() != null) {
            flightLog.setMaxAltitudeMeters(flightData.getMaxAltitudeMeters());
        }
        if (flightData.getDistanceTraveledKm() != null) {
            flightLog.setDistanceTraveledKm(flightData.getDistanceTraveledKm());
        }
        if (flightData.getBatteryEndPercentage() != null) {
            flightLog.setBatteryEndPercentage(flightData.getBatteryEndPercentage());
        }
        if (flightData.getEndLatitude() != null) {
            flightLog.setEndLatitude(flightData.getEndLatitude());
        }
        if (flightData.getEndLongitude() != null) {
            flightLog.setEndLongitude(flightData.getEndLongitude());
        }
        if (flightData.getAverageSpeedKmh() != null) {
            flightLog.setAverageSpeedKmh(flightData.getAverageSpeedKmh());
        }
        if (flightData.getMaxSpeedKmh() != null) {
            flightLog.setMaxSpeedKmh(flightData.getMaxSpeedKmh());
        }

        // Update UAV statistics
        UAV uav = flightLog.getUav();
        if (flightLog.getFlightDurationMinutes() != null) {
            int currentHours = uav.getTotalFlightHours() != null ? uav.getTotalFlightHours() : 0;
            uav.setTotalFlightHours(currentHours + (flightLog.getFlightDurationMinutes() / 60));
        }
        int currentCycles = uav.getTotalFlightCycles() != null ? uav.getTotalFlightCycles() : 0;
        uav.setTotalFlightCycles(currentCycles + 1);
        uav.setOperationalStatus(UAV.OperationalStatus.READY);
        uavRepository.save(uav);

        FlightLog savedLog = flightLogRepository.save(flightLog);
        logger.info("Flight completed for mission: {} (ID: {})", flightLog.getMissionName(), flightLogId);
        return savedLog;
    }

    /**
     * Abort a flight
     */
    @CacheEvict(value = { "flightLogs", "statistics" }, allEntries = true)
    public FlightLog abortFlight(Long flightLogId, String reason) {
        Optional<FlightLog> flightLogOpt = flightLogRepository.findById(flightLogId);
        if (flightLogOpt.isEmpty()) {
            throw new IllegalArgumentException("Flight log not found with ID: " + flightLogId);
        }

        FlightLog flightLog = flightLogOpt.get();
        flightLog.setFlightStatus(FlightLog.FlightStatus.ABORTED);
        flightLog.setFlightEndTime(LocalDateTime.now());
        flightLog.setNotes(
                flightLog.getNotes() != null ? flightLog.getNotes() + "\nAborted: " + reason : "Aborted: " + reason);

        // Update UAV operational status
        UAV uav = flightLog.getUav();
        uav.setOperationalStatus(UAV.OperationalStatus.READY);
        uavRepository.save(uav);

        FlightLog savedLog = flightLogRepository.save(flightLog);
        logger.warn("Flight aborted for mission: {} (ID: {}). Reason: {}",
                flightLog.getMissionName(), flightLogId, reason);
        return savedLog;
    }

    /**
     * Record emergency landing
     */
    @CacheEvict(value = { "flightLogs", "statistics" }, allEntries = true)
    public FlightLog recordEmergencyLanding(Long flightLogId, Double latitude, Double longitude, String reason) {
        Optional<FlightLog> flightLogOpt = flightLogRepository.findById(flightLogId);
        if (flightLogOpt.isEmpty()) {
            throw new IllegalArgumentException("Flight log not found with ID: " + flightLogId);
        }

        FlightLog flightLog = flightLogOpt.get();
        flightLog.setFlightStatus(FlightLog.FlightStatus.EMERGENCY_LANDED);
        flightLog.setEmergencyLanding(true);
        flightLog.setFlightEndTime(LocalDateTime.now());
        flightLog.setEndLatitude(latitude);
        flightLog.setEndLongitude(longitude);
        flightLog.setNotes(flightLog.getNotes() != null ? flightLog.getNotes() + "\nEmergency Landing: " + reason
                : "Emergency Landing: " + reason);

        // Update UAV operational status
        UAV uav = flightLog.getUav();
        uav.setOperationalStatus(UAV.OperationalStatus.EMERGENCY);
        uav.setCurrentLocationLatitude(latitude);
        uav.setCurrentLocationLongitude(longitude);
        uav.setLastKnownLocationUpdate(LocalDateTime.now());
        uavRepository.save(uav);

        FlightLog savedLog = flightLogRepository.save(flightLog);
        logger.error("Emergency landing recorded for mission: {} (ID: {}). Reason: {}",
                flightLog.getMissionName(), flightLogId, reason);
        return savedLog;
    }

    /**
     * Update flight log
     */
    @CacheEvict(value = { "flightLogs", "statistics" }, allEntries = true)
    public FlightLog updateFlightLog(Long id, FlightLog updatedFlightLog) {
        Optional<FlightLog> existingLogOpt = flightLogRepository.findById(id);
        if (existingLogOpt.isEmpty()) {
            throw new IllegalArgumentException("Flight log not found with ID: " + id);
        }

        FlightLog existingLog = existingLogOpt.get();

        // Update fields
        if (updatedFlightLog.getMissionName() != null) {
            existingLog.setMissionName(updatedFlightLog.getMissionName());
        }
        if (updatedFlightLog.getPilotName() != null) {
            existingLog.setPilotName(updatedFlightLog.getPilotName());
        }
        if (updatedFlightLog.getWeatherConditions() != null) {
            existingLog.setWeatherConditions(updatedFlightLog.getWeatherConditions());
        }
        if (updatedFlightLog.getNotes() != null) {
            existingLog.setNotes(updatedFlightLog.getNotes());
        }
        if (updatedFlightLog.getPayloadWeightKg() != null) {
            existingLog.setPayloadWeightKg(updatedFlightLog.getPayloadWeightKg());
        }

        FlightLog savedLog = flightLogRepository.save(existingLog);
        logger.info("Flight log updated: {}", id);
        return savedLog;
    }

    /**
     * Delete flight log
     */
    @CacheEvict(value = { "flightLogs", "statistics" }, allEntries = true)
    public void deleteFlightLog(Long id) {
        if (!flightLogRepository.existsById(id)) {
            throw new IllegalArgumentException("Flight log not found with ID: " + id);
        }

        flightLogRepository.deleteById(id);
        logger.info("Flight log deleted: {}", id);
    }

    /**
     * Get recent flight logs (last 30 days)
     */
    public List<FlightLog> getRecentFlightLogs() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return flightLogRepository.findRecentFlightLogs(thirtyDaysAgo);
    }

    /**
     * Get emergency flights
     */
    public List<FlightLog> getEmergencyFlights() {
        return flightLogRepository.findByEmergencyLandingTrueOrderByCreatedAtDesc();
    }

    /**
     * Get flight statistics for a UAV
     */
    public FlightStatistics getFlightStatistics(UAV uav) {
        Integer totalFlightTime = flightLogRepository.getTotalFlightTimeByUav(uav);
        Double totalDistance = flightLogRepository.getTotalDistanceByUav(uav);
        long totalFlights = flightLogRepository.countByUav(uav);
        long completedFlights = flightLogRepository.countByUavAndFlightStatus(uav, FlightLog.FlightStatus.COMPLETED);
        Double averageFlightDuration = flightLogRepository.getAverageFlightDurationByUav(uav);
        Double maxAltitude = flightLogRepository.getMaxAltitudeByUav(uav);

        return new FlightStatistics(totalFlightTime, totalDistance, totalFlights,
                completedFlights, averageFlightDuration, maxAltitude);
    }

    /**
     * Search flight logs by mission name
     */
    public List<FlightLog> searchFlightLogsByMission(String missionName) {
        return flightLogRepository.findByMissionNameContainingIgnoreCaseOrderByCreatedAtDesc(missionName);
    }

    /**
     * Get flights within date range
     */
    public List<FlightLog> getFlightsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return flightLogRepository.findByDateRange(startDate, endDate);
    }

    /**
     * Inner class for flight statistics
     */
    public static class FlightStatistics {
        private final Integer totalFlightTimeMinutes;
        private final Double totalDistanceKm;
        private final long totalFlights;
        private final long completedFlights;
        private final Double averageFlightDurationMinutes;
        private final Double maxAltitudeMeters;

        public FlightStatistics(Integer totalFlightTimeMinutes, Double totalDistanceKm,
                long totalFlights, long completedFlights,
                Double averageFlightDurationMinutes, Double maxAltitudeMeters) {
            this.totalFlightTimeMinutes = totalFlightTimeMinutes;
            this.totalDistanceKm = totalDistanceKm;
            this.totalFlights = totalFlights;
            this.completedFlights = completedFlights;
            this.averageFlightDurationMinutes = averageFlightDurationMinutes;
            this.maxAltitudeMeters = maxAltitudeMeters;
        }

        // Getters
        public Integer getTotalFlightTimeMinutes() {
            return totalFlightTimeMinutes;
        }

        public Double getTotalDistanceKm() {
            return totalDistanceKm;
        }

        public long getTotalFlights() {
            return totalFlights;
        }

        public long getCompletedFlights() {
            return completedFlights;
        }

        public Double getAverageFlightDurationMinutes() {
            return averageFlightDurationMinutes;
        }

        public Double getMaxAltitudeMeters() {
            return maxAltitudeMeters;
        }
    }
}
