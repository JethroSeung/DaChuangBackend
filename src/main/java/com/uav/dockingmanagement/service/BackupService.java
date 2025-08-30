package com.uav.dockingmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Automated backup service for UAV management system
 * Handles database backups, file backups, and cleanup
 */
@Service
public class BackupService {

    private static final Logger logger = LoggerFactory.getLogger(BackupService.class);

    @Value("${app.backup.enabled:true}")
    private boolean backupEnabled;

    @Value("${app.backup.location:./backups}")
    private String backupLocation;

    @Value("${app.backup.retention-days:30}")
    private int retentionDays;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ErrorTrackingService errorTrackingService;

    /**
     * Scheduled backup execution (daily at 2 AM by default)
     */
    @Scheduled(cron = "${app.backup.schedule:0 0 2 * * ?}")
    public void performScheduledBackup() {
        if (!backupEnabled) {
            logger.debug("Backup is disabled, skipping scheduled backup");
            return;
        }

        logger.info("Starting scheduled backup process");

        try {
            BackupResult result = performFullBackup();

            if (result.isSuccess()) {
                logger.info("Scheduled backup completed successfully: {}", result.getBackupPath());
                cleanupOldBackups();
            } else {
                logger.error("Scheduled backup failed: {}", result.getErrorMessage());
                errorTrackingService.reportError("Backup failed: " + result.getErrorMessage(), "ERROR");
            }

        } catch (Exception e) {
            logger.error("Error during scheduled backup: {}", e.getMessage(), e);
            errorTrackingService.reportException(e, Map.of("operation", "scheduled_backup"));
        }
    }

    /**
     * Perform a full backup of the system
     */
    public BackupResult performFullBackup() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String backupDir = String.format("%s/backup_%s", backupLocation, timestamp);

        try {
            // Create backup directory
            Path backupPath = Paths.get(backupDir);
            Files.createDirectories(backupPath);

            logger.info("Starting full backup to: {}", backupDir);

            // Backup database
            CompletableFuture<Boolean> dbBackup = CompletableFuture.supplyAsync(() -> {
                try {
                    return backupDatabase(backupPath);
                } catch (Exception e) {
                    logger.error("Database backup failed: {}", e.getMessage(), e);
                    return false;
                }
            });

            // Backup configuration files
            CompletableFuture<Boolean> configBackup = CompletableFuture.supplyAsync(() -> {
                try {
                    return backupConfigurationFiles(backupPath);
                } catch (Exception e) {
                    logger.error("Configuration backup failed: {}", e.getMessage(), e);
                    return false;
                }
            });

            // Backup uploaded files
            CompletableFuture<Boolean> filesBackup = CompletableFuture.supplyAsync(() -> {
                try {
                    return backupUploadedFiles(backupPath);
                } catch (Exception e) {
                    logger.error("Files backup failed: {}", e.getMessage(), e);
                    return false;
                }
            });

            // Wait for all backups to complete
            CompletableFuture<Void> allBackups = CompletableFuture.allOf(dbBackup, configBackup, filesBackup);
            allBackups.join();

            boolean success = dbBackup.get() && configBackup.get() && filesBackup.get();

            if (success) {
                // Create backup manifest
                createBackupManifest(backupPath, timestamp);
                logger.info("Full backup completed successfully: {}", backupDir);
                return new BackupResult(true, backupDir, null);
            } else {
                logger.error("Some backup operations failed");
                return new BackupResult(false, null, "One or more backup operations failed");
            }

        } catch (Exception e) {
            logger.error("Full backup failed: {}", e.getMessage(), e);
            return new BackupResult(false, null, e.getMessage());
        }
    }

    /**
     * Backup database to SQL file
     */
    private boolean backupDatabase(Path backupPath) {
        try {
            logger.debug("Starting database backup");

            Path dbBackupFile = backupPath.resolve("database_backup.sql");

            try (Connection conn = dataSource.getConnection();
                    FileWriter writer = new FileWriter(dbBackupFile.toFile())) {

                // Get all table names
                List<String> tables = new ArrayList<>();
                try (Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery("SHOW TABLES")) {
                    while (rs.next()) {
                        tables.add(rs.getString(1));
                    }
                }

                // Export each table
                for (String table : tables) {
                    exportTable(conn, writer, table);
                }

                logger.debug("Database backup completed: {}", dbBackupFile);
                return true;
            }

        } catch (Exception e) {
            logger.error("Database backup failed: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Export a single table to SQL
     */
    private void exportTable(Connection conn, FileWriter writer, String tableName) throws Exception {
        writer.write(String.format("-- Table: %s\n", tableName));

        // Get table structure
        try (Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SHOW CREATE TABLE " + tableName)) {
            if (rs.next()) {
                writer.write(rs.getString(2) + ";\n\n");
            }
        }

        // Export data
        try (Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT * FROM " + tableName)) {

            int columnCount = rs.getMetaData().getColumnCount();

            while (rs.next()) {
                writer.write("INSERT INTO " + tableName + " VALUES (");
                for (int i = 1; i <= columnCount; i++) {
                    if (i > 1)
                        writer.write(", ");
                    Object value = rs.getObject(i);
                    if (value == null) {
                        writer.write("NULL");
                    } else if (value instanceof String) {
                        writer.write("'" + value.toString().replace("'", "''") + "'");
                    } else {
                        writer.write(value.toString());
                    }
                }
                writer.write(");\n");
            }
        }

        writer.write("\n");
    }

    /**
     * Backup configuration files
     */
    private boolean backupConfigurationFiles(Path backupPath) {
        try {
            logger.debug("Starting configuration files backup");

            Path configBackupDir = backupPath.resolve("config");
            Files.createDirectories(configBackupDir);

            // Copy application properties
            copyFileIfExists("src/main/resources/application.properties", configBackupDir);
            copyFileIfExists("src/main/resources/application-advanced.yml", configBackupDir);
            copyFileIfExists("src/main/resources/logback-spring.xml", configBackupDir);

            logger.debug("Configuration files backup completed");
            return true;

        } catch (Exception e) {
            logger.error("Configuration files backup failed: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Backup uploaded files
     */
    private boolean backupUploadedFiles(Path backupPath) {
        try {
            logger.debug("Starting uploaded files backup");

            Path uploadsDir = Paths.get("uploads");
            if (Files.exists(uploadsDir)) {
                Path filesBackupDir = backupPath.resolve("uploads");
                copyDirectory(uploadsDir, filesBackupDir);
            }

            logger.debug("Uploaded files backup completed");
            return true;

        } catch (Exception e) {
            logger.error("Uploaded files backup failed: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Create backup manifest with metadata
     */
    private void createBackupManifest(Path backupPath, String timestamp) throws IOException {
        Path manifestFile = backupPath.resolve("backup_manifest.json");

        Map<String, Object> manifest = new HashMap<>();
        manifest.put("timestamp", timestamp);
        manifest.put("version", "1.0.0");
        manifest.put("type", "full_backup");
        manifest.put("created_at", LocalDateTime.now().toString());

        // Add file sizes and checksums
        Map<String, Object> files = new HashMap<>();
        Files.walk(backupPath)
                .filter(Files::isRegularFile)
                .filter(path -> !path.getFileName().toString().equals("backup_manifest.json"))
                .forEach(path -> {
                    try {
                        files.put(path.getFileName().toString(), Files.size(path));
                    } catch (IOException e) {
                        logger.warn("Could not get size for file: {}", path);
                    }
                });

        manifest.put("files", files);

        // Write manifest
        try (FileWriter writer = new FileWriter(manifestFile.toFile())) {
            // Simple JSON writing (in production, use Jackson)
            writer.write(manifest.toString());
        }
    }

    /**
     * Clean up old backups based on retention policy
     */
    public void cleanupOldBackups() {
        try {
            Path backupDir = Paths.get(backupLocation);
            if (!Files.exists(backupDir)) {
                return;
            }

            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);

            Files.list(backupDir)
                    .filter(Files::isDirectory)
                    .filter(path -> path.getFileName().toString().startsWith("backup_"))
                    .forEach(path -> {
                        try {
                            LocalDateTime backupDate = Files.getLastModifiedTime(path).toInstant()
                                    .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();

                            if (backupDate.isBefore(cutoffDate)) {
                                deleteDirectory(path);
                                logger.info("Deleted old backup: {}", path);
                            }
                        } catch (Exception e) {
                            logger.warn("Could not process backup directory: {}", path, e);
                        }
                    });

        } catch (Exception e) {
            logger.error("Error during backup cleanup: {}", e.getMessage(), e);
        }
    }

    // Helper methods
    private void copyFileIfExists(String source, Path destination) throws IOException {
        Path sourcePath = Paths.get(source);
        if (Files.exists(sourcePath)) {
            Files.copy(sourcePath, destination.resolve(sourcePath.getFileName()));
        }
    }

    private void copyDirectory(Path source, Path destination) throws IOException {
        Files.walk(source)
                .forEach(sourcePath -> {
                    try {
                        Path destPath = destination.resolve(source.relativize(sourcePath));
                        if (Files.isDirectory(sourcePath)) {
                            Files.createDirectories(destPath);
                        } else {
                            Files.copy(sourcePath, destPath);
                        }
                    } catch (IOException e) {
                        logger.warn("Could not copy: {} to {}", sourcePath, destination, e);
                    }
                });
    }

    private void deleteDirectory(Path directory) throws IOException {
        Files.walk(directory)
                .sorted((a, b) -> b.compareTo(a)) // Reverse order for deletion
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        logger.warn("Could not delete: {}", path, e);
                    }
                });
    }

    /**
     * Backup result class
     */
    public static class BackupResult {
        private final boolean success;
        private final String backupPath;
        private final String errorMessage;

        public BackupResult(boolean success, String backupPath, String errorMessage) {
            this.success = success;
            this.backupPath = backupPath;
            this.errorMessage = errorMessage;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getBackupPath() {
            return backupPath;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
