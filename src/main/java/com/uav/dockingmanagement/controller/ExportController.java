package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.service.ExportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * REST controller for data export operations
 */
@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "*")
public class ExportController {

    private static final Logger logger = LoggerFactory.getLogger(ExportController.class);

    @Autowired
    private ExportService exportService;

    /**
     * Export UAV data
     */
    @PostMapping("/uav")
    public ResponseEntity<Map<String, Object>> exportUAVData(
            @RequestParam(value = "format", defaultValue = "csv") String format,
            @RequestBody(required = false) Map<String, Object> filters) {

        logger.info("Exporting UAV data in format: {}", format);

        Map<String, Object> result = exportService.exportUAVData(format, filters);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Export flight log data
     */
    @PostMapping("/flight-logs")
    public ResponseEntity<Map<String, Object>> exportFlightLogData(
            @RequestParam(value = "format", defaultValue = "csv") String format,
            @RequestBody(required = false) Map<String, Object> filters) {

        logger.info("Exporting flight log data in format: {}", format);

        Map<String, Object> result = exportService.exportFlightLogData(format, filters);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Export battery data
     */
    @PostMapping("/battery")
    public ResponseEntity<Map<String, Object>> exportBatteryData(
            @RequestParam(value = "format", defaultValue = "csv") String format,
            @RequestBody(required = false) Map<String, Object> filters) {

        logger.info("Exporting battery data in format: {}", format);

        Map<String, Object> result = exportService.exportBatteryData(format, filters);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Export comprehensive system report
     */
    @PostMapping("/system-report")
    public ResponseEntity<Map<String, Object>> exportSystemReport(
            @RequestParam(value = "format", defaultValue = "excel") String format) {

        logger.info("Exporting system report in format: {}", format);

        Map<String, Object> result = exportService.exportSystemReport(format);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Download exported file
     */
    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadExportedFile(@PathVariable String filename) {

        try {
            Path filePath = Paths.get("./exports", filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filename);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                logger.warn("Export file not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            logger.error("Error downloading export file {}: {}", filename, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get export formats and options
     */
    @GetMapping("/formats")
    public ResponseEntity<Map<String, Object>> getExportFormats() {
        Map<String, Object> formats = Map.of(
                "supportedFormats", Map.of(
                        "csv", Map.of(
                                "name", "CSV (Comma Separated Values)",
                                "extension", "csv",
                                "mimeType", "text/csv",
                                "description", "Simple tabular data format"),
                        "excel", Map.of(
                                "name", "Microsoft Excel",
                                "extension", "xlsx",
                                "mimeType", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                "description", "Excel workbook with formatting"),
                        "json", Map.of(
                                "name", "JSON (JavaScript Object Notation)",
                                "extension", "json",
                                "mimeType", "application/json",
                                "description", "Structured data format")),
                "dataTypes", Map.of(
                        "uav", "UAV registration and status data",
                        "flight-logs", "Flight history and telemetry data",
                        "battery", "Battery status and health data",
                        "system-report", "Comprehensive system overview (Excel only)"),
                "filterOptions", Map.of(
                        "dateRange", "Filter by date range",
                        "status", "Filter by status values",
                        "uavId", "Filter by specific UAV",
                        "region", "Filter by region"));

        return ResponseEntity.ok(formats);
    }

    /**
     * Get export history/status
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getExportHistory() {
        // This could be enhanced to track export history
        Map<String, Object> history = Map.of(
                "recentExports", java.util.List.of(),
                "totalExports", 0,
                "availableDownloads", java.util.List.of());

        return ResponseEntity.ok(history);
    }

    /**
     * Export UAV data with GET request (for simple exports)
     */
    @GetMapping("/uav/{format}")
    public ResponseEntity<Map<String, Object>> exportUAVDataSimple(@PathVariable String format) {
        logger.info("Simple export of UAV data in format: {}", format);

        Map<String, Object> result = exportService.exportUAVData(format, null);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Export flight log data with GET request
     */
    @GetMapping("/flight-logs/{format}")
    public ResponseEntity<Map<String, Object>> exportFlightLogDataSimple(@PathVariable String format) {
        logger.info("Simple export of flight log data in format: {}", format);

        Map<String, Object> result = exportService.exportFlightLogData(format, null);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Export battery data with GET request
     */
    @GetMapping("/battery/{format}")
    public ResponseEntity<Map<String, Object>> exportBatteryDataSimple(@PathVariable String format) {
        logger.info("Simple export of battery data in format: {}", format);

        Map<String, Object> result = exportService.exportBatteryData(format, null);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Helper methods

    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

        switch (extension) {
            case "csv":
                return "text/csv";
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "json":
                return "application/json";
            case "pdf":
                return "application/pdf";
            default:
                return "application/octet-stream";
        }
    }
}
