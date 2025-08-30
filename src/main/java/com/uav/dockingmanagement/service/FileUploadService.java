package com.uav.dockingmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for handling file uploads with validation and security
 */
@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    @Value("${app.storage.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.storage.max-file-size:10MB}")
    private String maxFileSize;

    @Value("${app.storage.allowed-types:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,csv}")
    private String allowedTypes;

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "json");

    /**
     * Upload a file with validation
     */
    public Map<String, Object> uploadFile(MultipartFile file, String category) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Validate file
            String validationError = validateFile(file);
            if (validationError != null) {
                result.put("success", false);
                result.put("message", validationError);
                return result;
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, category);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueFilename = timestamp + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Prepare result
            result.put("success", true);
            result.put("message", "File uploaded successfully");
            result.put("filename", uniqueFilename);
            result.put("originalFilename", originalFilename);
            result.put("filePath", filePath.toString());
            result.put("fileSize", file.getSize());
            result.put("contentType", file.getContentType());
            result.put("uploadedAt", LocalDateTime.now());

            logger.info("File uploaded successfully: {} -> {}", originalFilename, uniqueFilename);

        } catch (IOException e) {
            logger.error("Error uploading file: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error uploading file: " + e.getMessage());
        }

        return result;
    }

    /**
     * Upload multiple files
     */
    public Map<String, Object> uploadFiles(MultipartFile[] files, String category) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> uploadResults = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        for (MultipartFile file : files) {
            Map<String, Object> fileResult = uploadFile(file, category);
            uploadResults.add(fileResult);

            if ((Boolean) fileResult.get("success")) {
                successCount++;
            } else {
                failureCount++;
            }
        }

        result.put("success", failureCount == 0);
        result.put("message", String.format("Uploaded %d files successfully, %d failed", successCount, failureCount));
        result.put("totalFiles", files.length);
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("results", uploadResults);

        return result;
    }

    /**
     * Delete uploaded file
     */
    public boolean deleteFile(String filename, String category) {
        try {
            Path filePath = Paths.get(uploadDir, category, filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("File deleted successfully: {}", filename);
                return true;
            } else {
                logger.warn("File not found for deletion: {}", filename);
                return false;
            }
        } catch (IOException e) {
            logger.error("Error deleting file {}: {}", filename, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get file info
     */
    public Map<String, Object> getFileInfo(String filename, String category) {
        Map<String, Object> info = new HashMap<>();

        try {
            Path filePath = Paths.get(uploadDir, category, filename);
            if (Files.exists(filePath)) {
                info.put("exists", true);
                info.put("filename", filename);
                info.put("size", Files.size(filePath));
                info.put("lastModified", Files.getLastModifiedTime(filePath).toInstant());
                info.put("contentType", Files.probeContentType(filePath));
            } else {
                info.put("exists", false);
            }
        } catch (IOException e) {
            logger.error("Error getting file info for {}: {}", filename, e.getMessage(), e);
            info.put("exists", false);
            info.put("error", e.getMessage());
        }

        return info;
    }

    /**
     * List files in category
     */
    public List<Map<String, Object>> listFiles(String category) {
        List<Map<String, Object>> files = new ArrayList<>();

        try {
            Path categoryPath = Paths.get(uploadDir, category);
            if (Files.exists(categoryPath)) {
                Files.list(categoryPath)
                        .filter(Files::isRegularFile)
                        .forEach(path -> {
                            try {
                                Map<String, Object> fileInfo = new HashMap<>();
                                fileInfo.put("filename", path.getFileName().toString());
                                fileInfo.put("size", Files.size(path));
                                fileInfo.put("lastModified", Files.getLastModifiedTime(path).toInstant());
                                fileInfo.put("contentType", Files.probeContentType(path));
                                files.add(fileInfo);
                            } catch (IOException e) {
                                logger.error("Error reading file info: {}", e.getMessage());
                            }
                        });
            }
        } catch (IOException e) {
            logger.error("Error listing files in category {}: {}", category, e.getMessage(), e);
        }

        return files;
    }

    // Private helper methods

    private String validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            return "File is empty";
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            return "File size exceeds maximum allowed size of " + (MAX_FILE_SIZE_BYTES / 1024 / 1024) + "MB";
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            return "Invalid filename";
        }

        String extension = getFileExtension(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return "File type not allowed. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS);
        }

        // Check for potentially dangerous filenames
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return "Invalid filename characters";
        }

        return null; // No validation errors
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
