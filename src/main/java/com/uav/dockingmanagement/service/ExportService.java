package com.uav.dockingmanagement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.uav.dockingmanagement.model.*;
import com.uav.dockingmanagement.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for exporting data in various formats (CSV, Excel, JSON)
 */
@Service
public class ExportService {

    private static final Logger logger = LoggerFactory.getLogger(ExportService.class);

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private FlightLogRepository flightLogRepository;

    @Autowired
    private BatteryStatusRepository batteryStatusRepository;

    @Autowired
    private DockingStationRepository dockingStationRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Value("${app.storage.export-dir:./exports}")
    private String exportDir;

    private final ObjectMapper objectMapper;

    public ExportService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Export UAV data to specified format
     */
    public Map<String, Object> exportUAVData(String format, Map<String, Object> filters) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<UAV> uavs = uavRepository.findAll();

            // Apply filters if provided
            if (filters != null && !filters.isEmpty()) {
                uavs = applyUAVFilters(uavs, filters);
            }

            String filename = generateFilename("uav_data", format);
            Path filePath = Paths.get(exportDir, filename);
            Files.createDirectories(filePath.getParent());

            switch (format.toLowerCase()) {
                case "csv":
                    exportUAVToCSV(uavs, filePath);
                    break;
                case "excel":
                    exportUAVToExcel(uavs, filePath);
                    break;
                case "json":
                    exportUAVToJSON(uavs, filePath);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported export format: " + format);
            }

            result.put("success", true);
            result.put("message", "UAV data exported successfully");
            result.put("filename", filename);
            result.put("filePath", filePath.toString());
            result.put("recordCount", uavs.size());
            result.put("exportedAt", LocalDateTime.now());

            logger.info("UAV data exported successfully: {} records to {}", uavs.size(), filename);

        } catch (Exception e) {
            logger.error("Error exporting UAV data: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error exporting UAV data: " + e.getMessage());
        }

        return result;
    }

    /**
     * Export flight log data
     */
    public Map<String, Object> exportFlightLogData(String format, Map<String, Object> filters) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<FlightLog> flightLogs = flightLogRepository.findAll();

            // Apply filters if provided
            if (filters != null && !filters.isEmpty()) {
                flightLogs = applyFlightLogFilters(flightLogs, filters);
            }

            String filename = generateFilename("flight_log_data", format);
            Path filePath = Paths.get(exportDir, filename);
            Files.createDirectories(filePath.getParent());

            switch (format.toLowerCase()) {
                case "csv":
                    exportFlightLogToCSV(flightLogs, filePath);
                    break;
                case "excel":
                    exportFlightLogToExcel(flightLogs, filePath);
                    break;
                case "json":
                    exportFlightLogToJSON(flightLogs, filePath);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported export format: " + format);
            }

            result.put("success", true);
            result.put("message", "Flight log data exported successfully");
            result.put("filename", filename);
            result.put("filePath", filePath.toString());
            result.put("recordCount", flightLogs.size());
            result.put("exportedAt", LocalDateTime.now());

            logger.info("Flight log data exported successfully: {} records to {}", flightLogs.size(), filename);

        } catch (Exception e) {
            logger.error("Error exporting flight log data: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error exporting flight log data: " + e.getMessage());
        }

        return result;
    }

    /**
     * Export battery status data
     */
    public Map<String, Object> exportBatteryData(String format, Map<String, Object> filters) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<BatteryStatus> batteryStatuses = batteryStatusRepository.findAll();

            String filename = generateFilename("battery_data", format);
            Path filePath = Paths.get(exportDir, filename);
            Files.createDirectories(filePath.getParent());

            switch (format.toLowerCase()) {
                case "csv":
                    exportBatteryToCSV(batteryStatuses, filePath);
                    break;
                case "excel":
                    exportBatteryToExcel(batteryStatuses, filePath);
                    break;
                case "json":
                    exportBatteryToJSON(batteryStatuses, filePath);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported export format: " + format);
            }

            result.put("success", true);
            result.put("message", "Battery data exported successfully");
            result.put("filename", filename);
            result.put("filePath", filePath.toString());
            result.put("recordCount", batteryStatuses.size());
            result.put("exportedAt", LocalDateTime.now());

            logger.info("Battery data exported successfully: {} records to {}", batteryStatuses.size(), filename);

        } catch (Exception e) {
            logger.error("Error exporting battery data: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error exporting battery data: " + e.getMessage());
        }

        return result;
    }

    /**
     * Export comprehensive system report
     */
    public Map<String, Object> exportSystemReport(String format) {
        Map<String, Object> result = new HashMap<>();

        try {
            String filename = generateFilename("system_report", format);
            Path filePath = Paths.get(exportDir, filename);
            Files.createDirectories(filePath.getParent());

            if ("excel".equalsIgnoreCase(format)) {
                exportSystemReportToExcel(filePath);
            } else {
                throw new IllegalArgumentException("System report only supports Excel format");
            }

            result.put("success", true);
            result.put("message", "System report exported successfully");
            result.put("filename", filename);
            result.put("filePath", filePath.toString());
            result.put("exportedAt", LocalDateTime.now());

            logger.info("System report exported successfully to {}", filename);

        } catch (Exception e) {
            logger.error("Error exporting system report: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error exporting system report: " + e.getMessage());
        }

        return result;
    }

    // Private helper methods for UAV export

    private void exportUAVToCSV(List<UAV> uavs, Path filePath) throws IOException {
        try (PrintWriter writer = new PrintWriter(Files.newBufferedWriter(filePath))) {
            // Header
            writer.println(
                    "ID,RFID Tag,Owner Name,Model,Serial Number,Manufacturer,Status,Operational Status,In Hibernate Pod,Created At,Last Updated");

            // Data
            for (UAV uav : uavs) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        uav.getId(),
                        escapeCSV(uav.getRfidTag()),
                        escapeCSV(uav.getOwnerName()),
                        escapeCSV(uav.getModel()),
                        escapeCSV(uav.getSerialNumber()),
                        escapeCSV(uav.getManufacturer()),
                        uav.getStatus(),
                        uav.getOperationalStatus(),
                        uav.isInHibernatePod(),
                        uav.getCreatedAt(),
                        uav.getUpdatedAt());
            }
        }
    }

    private void exportUAVToExcel(List<UAV> uavs, Path filePath) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("UAV Data");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = { "ID", "RFID Tag", "Owner Name", "Model", "Serial Number", "Manufacturer",
                    "Status", "Operational Status", "In Hibernate Pod", "Created At", "Last Updated" };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Create data rows
            for (int i = 0; i < uavs.size(); i++) {
                UAV uav = uavs.get(i);
                Row row = sheet.createRow(i + 1);

                row.createCell(0).setCellValue(uav.getId());
                row.createCell(1).setCellValue(uav.getRfidTag());
                row.createCell(2).setCellValue(uav.getOwnerName());
                row.createCell(3).setCellValue(uav.getModel());
                row.createCell(4).setCellValue(uav.getSerialNumber());
                row.createCell(5).setCellValue(uav.getManufacturer());
                row.createCell(6).setCellValue(uav.getStatus().toString());
                row.createCell(7).setCellValue(uav.getOperationalStatus().toString());
                row.createCell(8).setCellValue(uav.isInHibernatePod());
                row.createCell(9).setCellValue(uav.getCreatedAt().toString());
                row.createCell(10).setCellValue(uav.getUpdatedAt().toString());
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            try (FileOutputStream fileOut = new FileOutputStream(filePath.toFile())) {
                workbook.write(fileOut);
            }
        }
    }

    private void exportUAVToJSON(List<UAV> uavs, Path filePath) throws IOException {
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("exportedAt", LocalDateTime.now());
        exportData.put("recordCount", uavs.size());
        exportData.put("data", uavs);

        objectMapper.writeValue(filePath.toFile(), exportData);
    }

    // Helper methods for other exports (similar pattern)

    private void exportFlightLogToCSV(List<FlightLog> flightLogs, Path filePath) throws IOException {
        try (PrintWriter writer = new PrintWriter(Files.newBufferedWriter(filePath))) {
            writer.println(
                    "ID,UAV RFID,Flight Status,Start Time,End Time,Duration Minutes,Distance Km,Max Altitude,Emergency Landing,Created At");

            for (FlightLog log : flightLogs) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        log.getId(),
                        log.getUav() != null ? log.getUav().getRfidTag() : "",
                        log.getFlightStatus(),
                        log.getFlightStartTime(),
                        log.getFlightEndTime(),
                        log.getFlightDurationMinutes(),
                        log.getDistanceTraveledKm(),
                        log.getMaxAltitudeMeters(),
                        log.getEmergencyLanding(),
                        log.getCreatedAt());
            }
        }
    }

    private void exportFlightLogToExcel(List<FlightLog> flightLogs, Path filePath) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Flight Log Data");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = { "ID", "UAV RFID", "Flight Status", "Start Time", "End Time",
                    "Duration Minutes", "Distance Km", "Max Altitude", "Emergency Landing", "Created At" };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Create data rows
            for (int i = 0; i < flightLogs.size(); i++) {
                FlightLog log = flightLogs.get(i);
                Row row = sheet.createRow(i + 1);

                row.createCell(0).setCellValue(log.getId());
                row.createCell(1).setCellValue(log.getUav() != null ? log.getUav().getRfidTag() : "");
                row.createCell(2).setCellValue(log.getFlightStatus().toString());
                row.createCell(3)
                        .setCellValue(log.getFlightStartTime() != null ? log.getFlightStartTime().toString() : "");
                row.createCell(4).setCellValue(log.getFlightEndTime() != null ? log.getFlightEndTime().toString() : "");
                row.createCell(5)
                        .setCellValue(log.getFlightDurationMinutes() != null ? log.getFlightDurationMinutes() : 0);
                row.createCell(6).setCellValue(log.getDistanceTraveledKm() != null ? log.getDistanceTraveledKm() : 0.0);
                row.createCell(7).setCellValue(log.getMaxAltitudeMeters() != null ? log.getMaxAltitudeMeters() : 0.0);
                row.createCell(8).setCellValue(log.getEmergencyLanding() != null ? log.getEmergencyLanding() : false);
                row.createCell(9).setCellValue(log.getCreatedAt().toString());
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            try (FileOutputStream fileOut = new FileOutputStream(filePath.toFile())) {
                workbook.write(fileOut);
            }
        }
    }

    private void exportFlightLogToJSON(List<FlightLog> flightLogs, Path filePath) throws IOException {
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("exportedAt", LocalDateTime.now());
        exportData.put("recordCount", flightLogs.size());
        exportData.put("data", flightLogs);

        objectMapper.writeValue(filePath.toFile(), exportData);
    }

    // Battery export methods (similar pattern)

    private void exportBatteryToCSV(List<BatteryStatus> batteryStatuses, Path filePath) throws IOException {
        try (PrintWriter writer = new PrintWriter(Files.newBufferedWriter(filePath))) {
            writer.println(
                    "ID,UAV RFID,Charge %,Voltage,Health %,Charging Status,Battery Condition,Is Charging,Last Updated");

            for (BatteryStatus battery : batteryStatuses) {
                writer.printf("%d,%s,%d,%.2f,%d,%s,%s,%s,%s%n",
                        battery.getId(),
                        battery.getUav() != null ? battery.getUav().getRfidTag() : "",
                        battery.getCurrentChargePercentage(),
                        battery.getVoltage(),
                        battery.getHealthPercentage(),
                        battery.getChargingStatus(),
                        battery.getBatteryCondition(),
                        battery.getIsCharging(),
                        battery.getLastUpdated());
            }
        }
    }

    private void exportBatteryToExcel(List<BatteryStatus> batteryStatuses, Path filePath) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Battery Data");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = { "ID", "UAV RFID", "Charge %", "Voltage", "Health %",
                    "Charging Status", "Battery Condition", "Is Charging", "Last Updated" };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Create data rows
            for (int i = 0; i < batteryStatuses.size(); i++) {
                BatteryStatus battery = batteryStatuses.get(i);
                Row row = sheet.createRow(i + 1);

                row.createCell(0).setCellValue(battery.getId());
                row.createCell(1).setCellValue(battery.getUav() != null ? battery.getUav().getRfidTag() : "");
                row.createCell(2).setCellValue(battery.getCurrentChargePercentage());
                row.createCell(3).setCellValue(battery.getVoltage() != null ? battery.getVoltage() : 0.0);
                row.createCell(4).setCellValue(battery.getHealthPercentage());
                row.createCell(5).setCellValue(battery.getChargingStatus().toString());
                row.createCell(6).setCellValue(battery.getBatteryCondition().toString());
                row.createCell(7).setCellValue(battery.getIsCharging() != null ? battery.getIsCharging() : false);
                row.createCell(8).setCellValue(battery.getLastUpdated().toString());
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            try (FileOutputStream fileOut = new FileOutputStream(filePath.toFile())) {
                workbook.write(fileOut);
            }
        }
    }

    private void exportBatteryToJSON(List<BatteryStatus> batteryStatuses, Path filePath) throws IOException {
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("exportedAt", LocalDateTime.now());
        exportData.put("recordCount", batteryStatuses.size());
        exportData.put("data", batteryStatuses);

        objectMapper.writeValue(filePath.toFile(), exportData);
    }

    private void exportSystemReportToExcel(Path filePath) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Create multiple sheets for comprehensive report
            createUAVSummarySheet(workbook);
            createFlightLogSummarySheet(workbook);
            createBatterySummarySheet(workbook);
            createSystemHealthSheet(workbook);

            try (FileOutputStream fileOut = new FileOutputStream(filePath.toFile())) {
                workbook.write(fileOut);
            }
        }
    }

    // Helper methods

    private String generateFilename(String prefix, String format) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return String.format("%s_%s.%s", prefix, timestamp, format.toLowerCase());
    }

    private String escapeCSV(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private List<UAV> applyUAVFilters(List<UAV> uavs, Map<String, Object> filters) {
        // Apply filters based on provided criteria
        return uavs; // Placeholder - implement filtering logic
    }

    private List<FlightLog> applyFlightLogFilters(List<FlightLog> flightLogs, Map<String, Object> filters) {
        // Apply filters based on provided criteria
        return flightLogs; // Placeholder - implement filtering logic
    }

    private void createUAVSummarySheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("UAV Summary");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Total UAVs");
        headerRow.createCell(1).setCellValue("Authorized");
        headerRow.createCell(2).setCellValue("Operational");

        Row dataRow = sheet.createRow(1);
        List<UAV> uavs = uavRepository.findAll();
        dataRow.createCell(0).setCellValue(uavs.size());
        dataRow.createCell(1).setCellValue(uavs.stream().filter(u -> u.getStatus() == UAV.Status.AUTHORIZED).count());
        dataRow.createCell(2).setCellValue(
                uavs.stream().filter(u -> u.getOperationalStatus() == UAV.OperationalStatus.READY).count());
    }

    private void createFlightLogSummarySheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Flight Summary");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Total Flights");
        headerRow.createCell(1).setCellValue("Completed");
        headerRow.createCell(2).setCellValue("Emergency Landings");

        Row dataRow = sheet.createRow(1);
        List<FlightLog> flights = flightLogRepository.findAll();
        dataRow.createCell(0).setCellValue(flights.size());
        dataRow.createCell(1).setCellValue(
                flights.stream().filter(f -> f.getFlightStatus() == FlightLog.FlightStatus.COMPLETED).count());
        dataRow.createCell(2).setCellValue(flights.stream().filter(FlightLog::getEmergencyLanding).count());
    }

    private void createBatterySummarySheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Battery Summary");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Total Batteries");
        headerRow.createCell(1).setCellValue("Low Battery");
        headerRow.createCell(2).setCellValue("Charging");

        Row dataRow = sheet.createRow(1);
        List<BatteryStatus> batteries = batteryStatusRepository.findAll();
        dataRow.createCell(0).setCellValue(batteries.size());
        dataRow.createCell(1).setCellValue(batteries.stream().filter(b -> b.getCurrentChargePercentage() < 20).count());
        dataRow.createCell(2).setCellValue(batteries.stream().filter(BatteryStatus::getIsCharging).count());
    }

    private void createSystemHealthSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("System Health");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Component");
        headerRow.createCell(1).setCellValue("Status");

        Row row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue("Database");
        row1.createCell(1).setCellValue("Operational");

        Row row2 = sheet.createRow(2);
        row2.createCell(0).setCellValue("UAV Service");
        row2.createCell(1).setCellValue("Operational");
    }
}
