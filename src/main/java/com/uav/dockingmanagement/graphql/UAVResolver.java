package com.uav.dockingmanagement.graphql;

import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.model.FlightLog;
import com.uav.dockingmanagement.model.MaintenanceRecord;
import com.uav.dockingmanagement.model.BatteryStatus;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.repository.FlightLogRepository;
import com.uav.dockingmanagement.repository.MaintenanceRecordRepository;
import com.uav.dockingmanagement.repository.BatteryStatusRepository;
import com.uav.dockingmanagement.service.UAVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

/**
 * GraphQL resolver for UAV-related queries and mutations
 */
@Controller
public class UAVResolver {

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private FlightLogRepository flightLogRepository;

    @Autowired
    private MaintenanceRecordRepository maintenanceRecordRepository;

    @Autowired
    private BatteryStatusRepository batteryStatusRepository;

    @Autowired
    private UAVService uavService;

    /**
     * Get all UAVs with optional filtering and pagination
     */
    @QueryMapping
    public List<UAV> uavs(@Argument Map<String, Object> filter, @Argument Map<String, Object> pagination) {
        // For now, return all UAVs - can be enhanced with filtering later
        return uavRepository.findAll();
    }

    /**
     * Get UAV by ID
     */
    @QueryMapping
    public UAV uav(@Argument String id) {
        return uavRepository.findById(Integer.parseInt(id)).orElse(null);
    }

    /**
     * Get UAV by RFID tag
     */
    @QueryMapping
    public UAV uavByRfid(@Argument String rfidTag) {
        return uavRepository.findByRfidTag(rfidTag).orElse(null);
    }

    /**
     * Get UAV statistics
     */
    @QueryMapping
    public Map<String, Object> uavStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<UAV> allUAVs = uavRepository.findAll();

        stats.put("totalUAVs", allUAVs.size());
        stats.put("authorizedUAVs", allUAVs.stream().filter(u -> u.getStatus() == UAV.Status.AUTHORIZED).count());
        stats.put("unauthorizedUAVs", allUAVs.stream().filter(u -> u.getStatus() == UAV.Status.UNAUTHORIZED).count());
        stats.put("operationalUAVs",
                allUAVs.stream().filter(u -> u.getOperationalStatus() == UAV.OperationalStatus.READY).count());
        stats.put("hibernatingUAVs", allUAVs.stream().filter(UAV::isInHibernatePod).count());

        return stats;
    }

    /**
     * Create new UAV
     */
    @MutationMapping
    public Map<String, Object> createUAV(@Argument Map<String, Object> input) {
        Map<String, Object> result = new HashMap<>();

        try {
            UAV uav = new UAV();
            uav.setRfidTag((String) input.get("rfidTag"));
            uav.setOwnerName((String) input.get("ownerName"));
            uav.setModel((String) input.get("model"));

            if (input.containsKey("serialNumber")) {
                uav.setSerialNumber((String) input.get("serialNumber"));
            }
            if (input.containsKey("manufacturer")) {
                uav.setManufacturer((String) input.get("manufacturer"));
            }

            UAV savedUAV = uavService.addUAV(uav);

            result.put("success", true);
            result.put("uav", savedUAV);
            result.put("message", "UAV created successfully");

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error creating UAV: " + e.getMessage());
        }

        return result;
    }

    /**
     * Update UAV
     */
    @MutationMapping
    public Map<String, Object> updateUAV(@Argument String id, @Argument Map<String, Object> input) {
        Map<String, Object> result = new HashMap<>();

        try {
            Optional<UAV> uavOpt = uavRepository.findById(Integer.parseInt(id));
            if (uavOpt.isEmpty()) {
                result.put("success", false);
                result.put("message", "UAV not found");
                return result;
            }

            UAV uav = uavOpt.get();

            if (input.containsKey("ownerName")) {
                uav.setOwnerName((String) input.get("ownerName"));
            }
            if (input.containsKey("model")) {
                uav.setModel((String) input.get("model"));
            }
            if (input.containsKey("serialNumber")) {
                uav.setSerialNumber((String) input.get("serialNumber"));
            }
            if (input.containsKey("manufacturer")) {
                uav.setManufacturer((String) input.get("manufacturer"));
            }

            UAV savedUAV = uavRepository.save(uav);

            result.put("success", true);
            result.put("uav", savedUAV);
            result.put("message", "UAV updated successfully");

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error updating UAV: " + e.getMessage());
        }

        return result;
    }

    /**
     * Delete UAV
     */
    @MutationMapping
    public Map<String, Object> deleteUAV(@Argument String id) {
        Map<String, Object> result = new HashMap<>();

        try {
            if (uavRepository.existsById(Integer.parseInt(id))) {
                uavRepository.deleteById(Integer.parseInt(id));
                result.put("success", true);
                result.put("message", "UAV deleted successfully");
            } else {
                result.put("success", false);
                result.put("message", "UAV not found");
            }

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error deleting UAV: " + e.getMessage());
        }

        return result;
    }

    /**
     * Update UAV status
     */
    @MutationMapping
    public Map<String, Object> updateUAVStatus(@Argument String id, @Argument String status) {
        Map<String, Object> result = new HashMap<>();

        try {
            Optional<UAV> uavOpt = uavRepository.findById(Integer.parseInt(id));
            if (uavOpt.isEmpty()) {
                result.put("success", false);
                result.put("message", "UAV not found");
                return result;
            }

            UAV uav = uavOpt.get();
            uav.setStatus(UAV.Status.valueOf(status));
            UAV savedUAV = uavRepository.save(uav);

            result.put("success", true);
            result.put("uav", savedUAV);
            result.put("message", "UAV status updated successfully");

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error updating UAV status: " + e.getMessage());
        }

        return result;
    }

    // Schema mappings for nested fields

    /**
     * Resolve regions for UAV
     */
    @SchemaMapping
    public List<Region> regions(UAV uav) {
        return uav.getRegions().stream().toList();
    }

    /**
     * Resolve flight logs for UAV
     */
    @SchemaMapping
    public List<FlightLog> flightLogs(UAV uav, @Argument Integer limit) {
        if (limit == null)
            limit = 10;
        return flightLogRepository.findByUavOrderByCreatedAtDesc(uav).stream()
                .limit(limit)
                .toList();
    }

    /**
     * Resolve maintenance records for UAV
     */
    @SchemaMapping
    public List<MaintenanceRecord> maintenanceRecords(UAV uav, @Argument Integer limit) {
        if (limit == null)
            limit = 10;
        return maintenanceRecordRepository.findByUavOrderByCreatedAtDesc(uav).stream()
                .limit(limit)
                .toList();
    }

    /**
     * Resolve battery status for UAV
     */
    @SchemaMapping
    public BatteryStatus batteryStatus(UAV uav) {
        return batteryStatusRepository.findByUav(uav).orElse(null);
    }

    /**
     * Resolve computed field: needs maintenance
     */
    @SchemaMapping
    public Boolean needsMaintenance(UAV uav) {
        return uav.needsMaintenance();
    }

    /**
     * Resolve computed field: is operational
     */
    @SchemaMapping
    public Boolean isOperational(UAV uav) {
        return uav.getStatus() == UAV.Status.AUTHORIZED &&
                uav.getOperationalStatus() == UAV.OperationalStatus.READY;
    }

    /**
     * Resolve computed field: has low battery
     */
    @SchemaMapping
    public Boolean hasLowBattery(UAV uav) {
        BatteryStatus battery = batteryStatusRepository.findByUav(uav).orElse(null);
        return battery != null && battery.getCurrentChargePercentage() < 20;
    }

    /**
     * Resolve computed field: flight log count
     */
    @SchemaMapping
    public Integer flightLogCount(UAV uav) {
        return (int) flightLogRepository.countByUav(uav);
    }

    /**
     * Resolve computed field: maintenance record count
     */
    @SchemaMapping
    public Integer maintenanceRecordCount(UAV uav) {
        return (int) maintenanceRecordRepository.countByUav(uav);
    }
}
