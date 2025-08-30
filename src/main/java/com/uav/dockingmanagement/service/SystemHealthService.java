package com.uav.dockingmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import com.sun.management.OperatingSystemMXBean;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * System health monitoring service
 * Provides comprehensive health checks and system metrics
 */
@Service
public class SystemHealthService {

    private static final Logger logger = LoggerFactory.getLogger(SystemHealthService.class);

    @Value("${app.monitoring.alert-thresholds.memory-usage:85}")
    private int memoryThreshold;

    @Value("${app.monitoring.alert-thresholds.cpu-usage:80}")
    private int cpuThreshold;

    @Value("${app.monitoring.alert-thresholds.disk-usage:90}")
    private int diskThreshold;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private RateLimitingService rateLimitingService;

    @Autowired
    private ErrorTrackingService errorTrackingService;

    /**
     * Main health check implementation
     */
    public Map<String, Object> health() {
        try {
            Map<String, Object> details = new HashMap<>();
            boolean isHealthy = true;

            // Check database connectivity
            CompletableFuture<Boolean> dbHealth = checkDatabaseHealth();

            // Check system resources
            Map<String, Object> systemMetrics = getSystemMetrics();
            details.put("system", systemMetrics);

            // Check memory usage
            double memoryUsage = (Double) systemMetrics.get("memoryUsagePercent");
            if (memoryUsage > memoryThreshold) {
                isHealthy = false;
                details.put("memoryAlert", "Memory usage above threshold: " + memoryUsage + "%");
            }

            // Check database
            boolean dbHealthy = dbHealth.get();
            details.put("database", dbHealthy ? "UP" : "DOWN");
            if (!dbHealthy) {
                isHealthy = false;
            }

            // Check rate limiting service
            Map<String, Object> rateLimitStats = rateLimitingService.getStatistics();
            details.put("rateLimiting", rateLimitStats);

            // Add timestamp
            details.put("timestamp", LocalDateTime.now());
            details.put("uptime", getUptime());

            details.put("status", isHealthy ? "UP" : "DOWN");
            return details;

        } catch (Exception e) {
            logger.error("Health check failed: {}", e.getMessage(), e);
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("status", "DOWN");
            errorDetails.put("error", e.getMessage());
            errorDetails.put("timestamp", LocalDateTime.now());
            return errorDetails;
        }
    }

    /**
     * Get comprehensive system metrics
     */
    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        try {
            // Memory metrics
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
            long maxMemory = memoryBean.getHeapMemoryUsage().getMax();
            double memoryUsagePercent = (double) usedMemory / maxMemory * 100;

            metrics.put("memoryUsed", usedMemory);
            metrics.put("memoryMax", maxMemory);
            metrics.put("memoryUsagePercent", Math.round(memoryUsagePercent * 100.0) / 100.0);

            // CPU metrics
            OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
            double cpuLoad = osBean.getProcessCpuLoad() * 100;
            metrics.put("cpuUsagePercent", Math.round(cpuLoad * 100.0) / 100.0);
            metrics.put("availableProcessors", osBean.getAvailableProcessors());

            // System load
            double systemLoad = osBean.getSystemLoadAverage();
            metrics.put("systemLoadAverage", systemLoad);

            // JVM metrics
            metrics.put("jvmUptime", ManagementFactory.getRuntimeMXBean().getUptime());
            metrics.put("threadCount", ManagementFactory.getThreadMXBean().getThreadCount());

            // Disk space (simplified)
            java.io.File root = new java.io.File("/");
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;
            double diskUsagePercent = (double) usedSpace / totalSpace * 100;

            metrics.put("diskTotal", totalSpace);
            metrics.put("diskUsed", usedSpace);
            metrics.put("diskFree", freeSpace);
            metrics.put("diskUsagePercent", Math.round(diskUsagePercent * 100.0) / 100.0);

        } catch (Exception e) {
            logger.error("Error collecting system metrics: {}", e.getMessage(), e);
            metrics.put("error", "Failed to collect metrics: " + e.getMessage());
        }

        return metrics;
    }

    /**
     * Check database connectivity
     */
    private CompletableFuture<Boolean> checkDatabaseHealth() {
        return CompletableFuture.supplyAsync(() -> {
            try (Connection connection = dataSource.getConnection()) {
                return connection.isValid(5); // 5 second timeout
            } catch (Exception e) {
                logger.error("Database health check failed: {}", e.getMessage());
                return false;
            }
        });
    }

    /**
     * Get application uptime
     */
    private String getUptime() {
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        long seconds = uptimeMs / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;

        return String.format("%d days, %d hours, %d minutes",
                days, hours % 24, minutes % 60);
    }

    /**
     * Perform comprehensive system diagnostics
     */
    public Map<String, Object> performDiagnostics() {
        Map<String, Object> diagnostics = new HashMap<>();

        try {
            // System health
            Map<String, Object> healthData = health();
            diagnostics.put("overallHealth", healthData.get("status"));
            diagnostics.put("healthDetails", healthData);

            // Performance metrics
            diagnostics.put("systemMetrics", getSystemMetrics());

            // Service status checks
            diagnostics.put("services", checkServicesStatus());

            // Recent errors
            diagnostics.put("recentErrors", getRecentErrorSummary());

            diagnostics.put("timestamp", LocalDateTime.now());
            diagnostics.put("diagnosticsVersion", "1.0");

        } catch (Exception e) {
            logger.error("Diagnostics failed: {}", e.getMessage(), e);
            diagnostics.put("error", "Diagnostics failed: " + e.getMessage());
        }

        return diagnostics;
    }

    /**
     * Check status of various services
     */
    private Map<String, Object> checkServicesStatus() {
        Map<String, Object> services = new HashMap<>();

        try {
            // Rate limiting service
            services.put("rateLimiting", rateLimitingService.getStatistics());

            // Database connection pool
            services.put("database", checkDatabaseHealth().get());

            // Add more service checks as needed
            services.put("timestamp", LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Service status check failed: {}", e.getMessage(), e);
            services.put("error", e.getMessage());
        }

        return services;
    }

    /**
     * Get summary of recent errors
     */
    private Map<String, Object> getRecentErrorSummary() {
        Map<String, Object> errorSummary = new HashMap<>();

        try {
            // This would typically query error logs or error tracking service
            errorSummary.put("errorCount", 0);
            errorSummary.put("warningCount", 0);
            errorSummary.put("lastError", null);
            errorSummary.put("period", "last 24 hours");

        } catch (Exception e) {
            logger.error("Error summary failed: {}", e.getMessage(), e);
            errorSummary.put("error", e.getMessage());
        }

        return errorSummary;
    }

    /**
     * Check if system is under stress
     */
    public boolean isSystemUnderStress() {
        try {
            Map<String, Object> metrics = getSystemMetrics();

            double memoryUsage = (Double) metrics.get("memoryUsagePercent");
            double cpuUsage = (Double) metrics.get("cpuUsagePercent");
            double diskUsage = (Double) metrics.get("diskUsagePercent");

            return memoryUsage > memoryThreshold ||
                    cpuUsage > cpuThreshold ||
                    diskUsage > diskThreshold;

        } catch (Exception e) {
            logger.error("Stress check failed: {}", e.getMessage(), e);
            return true; // Assume stress if we can't check
        }
    }

    /**
     * Generate health report
     */
    public Map<String, Object> generateHealthReport() {
        Map<String, Object> report = new HashMap<>();

        try {
            report.put("summary", health());
            report.put("diagnostics", performDiagnostics());
            report.put("systemStress", isSystemUnderStress());
            report.put("recommendations", generateRecommendations());
            report.put("generatedAt", LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Health report generation failed: {}", e.getMessage(), e);
            report.put("error", e.getMessage());
        }

        return report;
    }

    /**
     * Generate system recommendations based on current state
     */
    private Map<String, Object> generateRecommendations() {
        Map<String, Object> recommendations = new HashMap<>();

        try {
            Map<String, Object> metrics = getSystemMetrics();

            double memoryUsage = (Double) metrics.get("memoryUsagePercent");
            double cpuUsage = (Double) metrics.get("cpuUsagePercent");
            double diskUsage = (Double) metrics.get("diskUsagePercent");

            if (memoryUsage > memoryThreshold) {
                recommendations.put("memory", "Consider increasing heap size or optimizing memory usage");
            }

            if (cpuUsage > cpuThreshold) {
                recommendations.put("cpu", "High CPU usage detected - consider scaling or optimization");
            }

            if (diskUsage > diskThreshold) {
                recommendations.put("disk", "Disk space running low - cleanup or expansion needed");
            }

            if (recommendations.isEmpty()) {
                recommendations.put("status", "System is operating within normal parameters");
            }

        } catch (Exception e) {
            logger.error("Recommendations generation failed: {}", e.getMessage(), e);
            recommendations.put("error", e.getMessage());
        }

        return recommendations;
    }
}
