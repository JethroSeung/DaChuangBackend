package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.DockingRecord;
import com.uav.dockingmanagement.model.DockingStation;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.DockingRecordRepository;
import com.uav.dockingmanagement.repository.DockingStationRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service class for docking station operations
 * Handles station management, docking operations, and monitoring
 */
@Service
public class DockingStationService {

    private static final Logger logger = LoggerFactory.getLogger(DockingStationService.class);

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private DockingRecordRepository dockingRecordRepository;

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Get all docking stations
     */
    public List<DockingStation> getAllStations() {
        try {
            return dockingStationRepository.findAll();
        } catch (Exception e) {
            logger.error("Error getting all stations: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get docking station by ID
     */
    public Optional<DockingStation> getStationById(Long id) {
        try {
            return dockingStationRepository.findById(id);
        } catch (Exception e) {
            logger.error("Error getting station by ID {}: {}", id, e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Create new docking station
     */
    @Transactional
    public DockingStation createStation(DockingStation station) {
        try {
            // Set default values if not provided
            if (station.getStatus() == null) {
                station.setStatus(DockingStation.StationStatus.OPERATIONAL);
            }
            if (station.getCurrentOccupancy() == null) {
                station.setCurrentOccupancy(0);
            }
            if (station.getCreatedAt() == null) {
                station.setCreatedAt(LocalDateTime.now());
            }

            DockingStation savedStation = dockingStationRepository.save(station);
            logger.info("Created new docking station: {}", savedStation.getName());
            return savedStation;
        } catch (Exception e) {
            logger.error("Error creating station: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create station: " + e.getMessage());
        }
    }

    /**
     * Update existing docking station
     */
    @Transactional
    public DockingStation updateStation(Long id, DockingStation updatedStation) {
        try {
            Optional<DockingStation> existingOpt = dockingStationRepository.findById(id);
            if (existingOpt.isEmpty()) {
                throw new RuntimeException("Station not found with ID: " + id);
            }

            DockingStation existing = existingOpt.get();

            // Update fields
            if (updatedStation.getName() != null) {
                existing.setName(updatedStation.getName());
            }
            if (updatedStation.getDescription() != null) {
                existing.setDescription(updatedStation.getDescription());
            }
            if (updatedStation.getLatitude() != null) {
                existing.setLatitude(updatedStation.getLatitude());
            }
            if (updatedStation.getLongitude() != null) {
                existing.setLongitude(updatedStation.getLongitude());
            }
            if (updatedStation.getMaxCapacity() != null) {
                existing.setMaxCapacity(updatedStation.getMaxCapacity());
            }
            if (updatedStation.getStatus() != null) {
                existing.setStatus(updatedStation.getStatus());
            }
            if (updatedStation.getStationType() != null) {
                existing.setStationType(updatedStation.getStationType());
            }
            if (updatedStation.getChargingAvailable() != null) {
                existing.setChargingAvailable(updatedStation.getChargingAvailable());
            }
            if (updatedStation.getMaintenanceAvailable() != null) {
                existing.setMaintenanceAvailable(updatedStation.getMaintenanceAvailable());
            }
            if (updatedStation.getWeatherProtected() != null) {
                existing.setWeatherProtected(updatedStation.getWeatherProtected());
            }
            if (updatedStation.getSecurityLevel() != null) {
                existing.setSecurityLevel(updatedStation.getSecurityLevel());
            }

            existing.setUpdatedAt(LocalDateTime.now());

            DockingStation savedStation = dockingStationRepository.save(existing);
            logger.info("Updated docking station: {}", savedStation.getName());
            return savedStation;
        } catch (Exception e) {
            logger.error("Error updating station {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to update station: " + e.getMessage());
        }
    }

    /**
     * Delete docking station
     */
    @Transactional
    public void deleteStation(Long id) {
        try {
            Optional<DockingStation> stationOpt = dockingStationRepository.findById(id);
            if (stationOpt.isEmpty()) {
                throw new RuntimeException("Station not found with ID: " + id);
            }

            DockingStation station = stationOpt.get();

            // Check if station has active dockings
            if (station.getCurrentOccupancy() > 0) {
                throw new RuntimeException("Cannot delete station with active dockings");
            }

            dockingStationRepository.deleteById(id);
            logger.info("Deleted docking station: {}", station.getName());
        } catch (Exception e) {
            logger.error("Error deleting station {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete station: " + e.getMessage());
        }
    }

    /**
     * Get available docking stations
     */
    public List<DockingStation> getAvailableStations() {
        try {
            return dockingStationRepository.findAvailableStations();
        } catch (Exception e) {
            logger.error("Error getting available stations: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get comprehensive station statistics
     */
    public Map<String, Object> getStationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Basic counts
            long totalStations = dockingStationRepository.count();
            long operationalStations = dockingStationRepository.countByStatus(DockingStation.StationStatus.OPERATIONAL);
            long maintenanceStations = dockingStationRepository.countByStatus(DockingStation.StationStatus.MAINTENANCE);
            long offlineStations = dockingStationRepository.countByStatus(DockingStation.StationStatus.OFFLINE);
            
            stats.put("totalStations", totalStations);
            stats.put("operationalStations", operationalStations);
            stats.put("maintenanceStations", maintenanceStations);
            stats.put("offlineStations", offlineStations);
            
            // Capacity statistics
            Integer totalCapacity = dockingStationRepository.getTotalCapacity();
            Integer currentOccupancy = dockingStationRepository.getCurrentTotalOccupancy();
            
            stats.put("totalCapacity", totalCapacity != null ? totalCapacity : 0);
            stats.put("currentOccupancy", currentOccupancy != null ? currentOccupancy : 0);
            stats.put("availableCapacity", (totalCapacity != null ? totalCapacity : 0) - (currentOccupancy != null ? currentOccupancy : 0));
            
            if (totalCapacity != null && totalCapacity > 0) {
                double occupancyRate = (double) (currentOccupancy != null ? currentOccupancy : 0) / totalCapacity * 100;
                stats.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);
            } else {
                stats.put("occupancyRate", 0.0);
            }
            
            // Station type breakdown
            long standardStations = dockingStationRepository.findByStationType(DockingStation.StationType.STANDARD).size();
            long chargingStations = dockingStationRepository.findByStationType(DockingStation.StationType.CHARGING).size();
            long maintenanceStationsType = dockingStationRepository.findByStationType(DockingStation.StationType.MAINTENANCE).size();
            long emergencyStations = dockingStationRepository.findByStationType(DockingStation.StationType.EMERGENCY).size();
            
            Map<String, Long> stationTypes = new HashMap<>();
            stationTypes.put("STANDARD", standardStations);
            stationTypes.put("CHARGING", chargingStations);
            stationTypes.put("MAINTENANCE", maintenanceStationsType);
            stationTypes.put("EMERGENCY", emergencyStations);
            stats.put("stationTypes", stationTypes);
            
            // Feature availability
            long chargingAvailable = dockingStationRepository.findByChargingAvailableTrue().size();
            long maintenanceAvailable = dockingStationRepository.findByMaintenanceAvailableTrue().size();
            long weatherProtected = dockingStationRepository.findByWeatherProtectedTrue().size();
            
            Map<String, Long> features = new HashMap<>();
            features.put("chargingAvailable", chargingAvailable);
            features.put("maintenanceAvailable", maintenanceAvailable);
            features.put("weatherProtected", weatherProtected);
            stats.put("features", features);
            
            // Stations needing maintenance
            List<DockingStation> stationsNeedingMaintenance = dockingStationRepository.findStationsNeedingMaintenance();
            stats.put("stationsNeedingMaintenance", stationsNeedingMaintenance.size());
            
            stats.put("timestamp", LocalDateTime.now());
            
        } catch (Exception e) {
            logger.error("Error getting station statistics: {}", e.getMessage(), e);
        }
        
        return stats;
    }

    /**
     * Dock UAV at station
     */
    @Transactional
    public Map<String, Object> dockUAV(Integer uavId, Long stationId, String purpose) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Validate UAV
            Optional<UAV> uavOpt = uavRepository.findById(uavId);
            if (uavOpt.isEmpty()) {
                result.put("success", false);
                result.put("message", "UAV not found");
                return result;
            }
            
            // Validate station
            Optional<DockingStation> stationOpt = dockingStationRepository.findById(stationId);
            if (stationOpt.isEmpty()) {
                result.put("success", false);
                result.put("message", "Docking station not found");
                return result;
            }
            
            UAV uav = uavOpt.get();
            DockingStation station = stationOpt.get();
            
            // Check if UAV is already docked
            Optional<DockingRecord> existingDocking = dockingRecordRepository.findCurrentDockingByUavId(uavId);
            if (existingDocking.isPresent()) {
                result.put("success", false);
                result.put("message", "UAV is already docked at another station");
                return result;
            }
            
            // Check if station is full first (more specific error)
            if (station.isFull()) {
                result.put("success", false);
                result.put("message", "Station is at full capacity");
                return result;
            }

            // Check other availability conditions
            if (!station.isAvailable()) {
                result.put("success", false);
                result.put("message", "Station is not available for docking");
                return result;
            }
            
            // Create docking record
            DockingRecord dockingRecord = new DockingRecord(uav, station, purpose);
            
            // Set battery level if available
            if (uav.getBatteryStatus() != null) {
                dockingRecord.setBatteryLevelOnArrival(uav.getBatteryStatus().getCurrentChargePercentage());
            }
            
            dockingRecordRepository.save(dockingRecord);
            
            // Update station occupancy
            station.setCurrentOccupancy(station.getCurrentOccupancy() + 1);
            dockingStationRepository.save(station);
            
            // Update UAV status if needed
            if (purpose != null && purpose.equalsIgnoreCase("CHARGING")) {
                uav.setOperationalStatus(UAV.OperationalStatus.CHARGING);
            } else if (purpose != null && purpose.equalsIgnoreCase("MAINTENANCE")) {
                uav.setOperationalStatus(UAV.OperationalStatus.MAINTENANCE);
            }
            uavRepository.save(uav);
            
            // Broadcast docking event
            broadcastDockingEvent("DOCKED", uav, station, dockingRecord);
            
            result.put("success", true);
            result.put("message", "UAV docked successfully");
            result.put("dockingRecord", dockingRecord);
            
            logger.info("UAV {} docked at station {} for {}", uav.getRfidTag(), station.getName(), purpose);
            
        } catch (Exception e) {
            logger.error("Error docking UAV: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error docking UAV: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * Undock UAV from station
     */
    @Transactional
    public Map<String, Object> undockUAV(Integer uavId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Find current docking
            Optional<DockingRecord> dockingOpt = dockingRecordRepository.findCurrentDockingByUavId(uavId);
            if (dockingOpt.isEmpty()) {
                result.put("success", false);
                result.put("message", "UAV is not currently docked");
                return result;
            }
            
            DockingRecord dockingRecord = dockingOpt.get();
            UAV uav = dockingRecord.getUav();
            DockingStation station = dockingRecord.getDockingStation();
            
            // Complete docking record
            dockingRecord.completeDocking();
            
            // Set battery level on departure if available
            if (uav.getBatteryStatus() != null) {
                dockingRecord.setBatteryLevelOnDeparture(uav.getBatteryStatus().getCurrentChargePercentage());
            }
            
            dockingRecordRepository.save(dockingRecord);
            
            // Update station occupancy
            station.setCurrentOccupancy(Math.max(0, station.getCurrentOccupancy() - 1));
            dockingStationRepository.save(station);
            
            // Update UAV status
            uav.setOperationalStatus(UAV.OperationalStatus.READY);
            uavRepository.save(uav);
            
            // Broadcast undocking event
            broadcastDockingEvent("UNDOCKED", uav, station, dockingRecord);
            
            result.put("success", true);
            result.put("message", "UAV undocked successfully");
            result.put("dockingRecord", dockingRecord);
            
            logger.info("UAV {} undocked from station {} after {} minutes", 
                       uav.getRfidTag(), station.getName(), dockingRecord.getDockingDurationMinutes());
            
        } catch (Exception e) {
            logger.error("Error undocking UAV: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error undocking UAV: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * Find optimal docking station for UAV
     */
    public Optional<DockingStation> findOptimalStation(Double uavLatitude, Double uavLongitude, String purpose) {
        try {
            List<DockingStation> availableStations = dockingStationRepository.findAvailableStations();
            
            if (availableStations.isEmpty()) {
                return Optional.empty();
            }
            
            // Filter by purpose if specified
            if (purpose != null) {
                if (purpose.equalsIgnoreCase("CHARGING")) {
                    availableStations = availableStations.stream()
                        .filter(DockingStation::getChargingAvailable)
                        .toList();
                } else if (purpose.equalsIgnoreCase("MAINTENANCE")) {
                    availableStations = availableStations.stream()
                        .filter(DockingStation::getMaintenanceAvailable)
                        .toList();
                }
            }
            
            if (availableStations.isEmpty()) {
                return Optional.empty();
            }
            
            // Find nearest station
            DockingStation nearestStation = null;
            double minDistance = Double.MAX_VALUE;
            
            for (DockingStation station : availableStations) {
                double distance = calculateDistance(uavLatitude, uavLongitude, 
                                                  station.getLatitude(), station.getLongitude());
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStation = station;
                }
            }
            
            return Optional.ofNullable(nearestStation);
            
        } catch (Exception e) {
            logger.error("Error finding optimal station: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }

    /**
     * Broadcast docking event via WebSocket
     */
    private void broadcastDockingEvent(String eventType, UAV uav, DockingStation station, DockingRecord dockingRecord) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "DOCKING_EVENT");
            event.put("eventType", eventType);
            event.put("timestamp", LocalDateTime.now());
            event.put("uavId", uav.getId());
            event.put("uavRfidTag", uav.getRfidTag());
            event.put("stationId", station.getId());
            event.put("stationName", station.getName());
            event.put("purpose", dockingRecord.getPurpose());
            event.put("dockingDuration", dockingRecord.getDockingDurationMinutes());
            
            // Broadcast to all clients
            messagingTemplate.convertAndSend("/topic/docking-events", event);
            
            // Broadcast to station-specific channel
            messagingTemplate.convertAndSend("/topic/station/" + station.getId() + "/events", event);
            
        } catch (Exception e) {
            logger.error("Error broadcasting docking event: {}", e.getMessage(), e);
        }
    }

    /**
     * Get station utilization report
     */
    public Map<String, Object> getStationUtilizationReport(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> report = new HashMap<>();
        
        try {
            List<Object[]> utilizationStats = dockingRecordRepository.getStationUtilizationStats(startTime, endTime);
            
            Map<String, Map<String, Object>> stationStats = new HashMap<>();
            
            for (Object[] stat : utilizationStats) {
                Long stationId = (Long) stat[0];
                Long dockingCount = (Long) stat[1];
                Double avgDuration = (Double) stat[2];
                
                Optional<DockingStation> stationOpt = dockingStationRepository.findById(stationId);
                if (stationOpt.isPresent()) {
                    DockingStation station = stationOpt.get();
                    
                    Map<String, Object> stationData = new HashMap<>();
                    stationData.put("stationName", station.getName());
                    stationData.put("dockingCount", dockingCount);
                    stationData.put("averageDurationMinutes", avgDuration != null ? avgDuration : 0.0);
                    stationData.put("maxCapacity", station.getMaxCapacity());
                    
                    stationStats.put(stationId.toString(), stationData);
                }
            }
            
            report.put("stationStats", stationStats);
            report.put("period", Map.of("start", startTime, "end", endTime));
            report.put("generatedAt", LocalDateTime.now());
            
        } catch (Exception e) {
            logger.error("Error generating station utilization report: {}", e.getMessage(), e);
        }
        
        return report;
    }

    /**
     * Initialize sample docking stations if none exist
     */
    @Transactional
    public void initializeSampleStations() {
        try {
            long count = dockingStationRepository.count();
            
            if (count == 0) {
                logger.info("Initializing sample docking stations...");
                
                // Create sample stations
                DockingStation station1 = new DockingStation("Central Hub", 40.7128, -74.0060, 10);
                station1.setDescription("Main docking facility in downtown area");
                station1.setStationType(DockingStation.StationType.CHARGING);
                station1.setChargingAvailable(true);
                station1.setMaintenanceAvailable(true);
                station1.setWeatherProtected(true);
                station1.setSecurityLevel("HIGH");
                
                DockingStation station2 = new DockingStation("North Terminal", 40.7589, -73.9851, 5);
                station2.setDescription("Secondary facility in north district");
                station2.setStationType(DockingStation.StationType.STANDARD);
                station2.setChargingAvailable(true);
                station2.setWeatherProtected(false);
                station2.setSecurityLevel("MEDIUM");
                
                DockingStation station3 = new DockingStation("Emergency Station Alpha", 40.6892, -74.0445, 3);
                station3.setDescription("Emergency response docking point");
                station3.setStationType(DockingStation.StationType.EMERGENCY);
                station3.setChargingAvailable(true);
                station3.setMaintenanceAvailable(false);
                station3.setWeatherProtected(true);
                station3.setSecurityLevel("HIGH");
                
                dockingStationRepository.save(station1);
                dockingStationRepository.save(station2);
                dockingStationRepository.save(station3);
                
                logger.info("Sample docking stations created successfully");
            }
            
        } catch (Exception e) {
            logger.error("Error initializing sample stations: {}", e.getMessage(), e);
        }
    }
}
