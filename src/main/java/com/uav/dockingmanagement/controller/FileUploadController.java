package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.service.FileUploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * REST controller for file upload and download operations
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload a single file
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category) {

        logger.info("Uploading file: {} to category: {}", file.getOriginalFilename(), category);

        Map<String, Object> result = fileUploadService.uploadFile(file, category);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Upload multiple files
     */
    @PostMapping("/upload/multiple")
    public ResponseEntity<Map<String, Object>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "category", defaultValue = "general") String category) {

        logger.info("Uploading {} files to category: {}", files.length, category);

        Map<String, Object> result = fileUploadService.uploadFiles(files, category);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Download a file
     */
    @GetMapping("/download/{category}/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String category,
            @PathVariable String filename) {

        try {
            Path filePath = Paths.get("./uploads", category, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                logger.warn("File not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            logger.error("Error downloading file {}: {}", filename, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get file information
     */
    @GetMapping("/info/{category}/{filename:.+}")
    public ResponseEntity<Map<String, Object>> getFileInfo(
            @PathVariable String category,
            @PathVariable String filename) {

        Map<String, Object> info = fileUploadService.getFileInfo(filename, category);

        if ((Boolean) info.get("exists")) {
            return ResponseEntity.ok(info);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * List files in a category
     */
    @GetMapping("/list/{category}")
    public ResponseEntity<List<Map<String, Object>>> listFiles(@PathVariable String category) {
        List<Map<String, Object>> files = fileUploadService.listFiles(category);
        return ResponseEntity.ok(files);
    }

    /**
     * Delete a file
     */
    @DeleteMapping("/delete/{category}/{filename:.+}")
    public ResponseEntity<Map<String, Object>> deleteFile(
            @PathVariable String category,
            @PathVariable String filename) {

        boolean deleted = fileUploadService.deleteFile(filename, category);

        Map<String, Object> result = Map.of(
                "success", deleted,
                "message", deleted ? "File deleted successfully" : "File not found or could not be deleted",
                "filename", filename);

        if (deleted) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    /**
     * Upload UAV documentation
     */
    @PostMapping("/upload/uav-docs")
    public ResponseEntity<Map<String, Object>> uploadUAVDocumentation(
            @RequestParam("file") MultipartFile file,
            @RequestParam("uavId") String uavId) {

        logger.info("Uploading UAV documentation for UAV ID: {}", uavId);

        Map<String, Object> result = fileUploadService.uploadFile(file, "uav-docs/" + uavId);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Upload maintenance reports
     */
    @PostMapping("/upload/maintenance-reports")
    public ResponseEntity<Map<String, Object>> uploadMaintenanceReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("uavId") String uavId,
            @RequestParam(value = "maintenanceId", required = false) String maintenanceId) {

        logger.info("Uploading maintenance report for UAV ID: {}", uavId);

        String category = "maintenance-reports/" + uavId;
        if (maintenanceId != null) {
            category += "/" + maintenanceId;
        }

        Map<String, Object> result = fileUploadService.uploadFile(file, category);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Upload flight log attachments
     */
    @PostMapping("/upload/flight-logs")
    public ResponseEntity<Map<String, Object>> uploadFlightLogAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("flightLogId") String flightLogId) {

        logger.info("Uploading flight log attachment for flight log ID: {}", flightLogId);

        Map<String, Object> result = fileUploadService.uploadFile(file, "flight-logs/" + flightLogId);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Upload system configuration files
     */
    @PostMapping("/upload/system-config")
    public ResponseEntity<Map<String, Object>> uploadSystemConfig(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "configType", defaultValue = "general") String configType) {

        logger.info("Uploading system configuration file of type: {}", configType);

        Map<String, Object> result = fileUploadService.uploadFile(file, "system-config/" + configType);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Get upload statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUploadStatistics() {
        // This could be enhanced to provide actual statistics
        Map<String, Object> stats = Map.of(
                "totalCategories", 5,
                "supportedFormats",
                List.of("jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "json"),
                "maxFileSize", "10MB",
                "categories", List.of("general", "uav-docs", "maintenance-reports", "flight-logs", "system-config"));

        return ResponseEntity.ok(stats);
    }
}
