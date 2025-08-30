package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.repository.UAVRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Advanced health check and monitoring controller
 * Provides comprehensive system health information
 */
@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    private static final Logger logger = LoggerFactory.getLogger(HealthCheckController.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private CacheManager cacheManager;

    private final long startTime = System.currentTimeMillis();

    /**
     * Basic health check endpoint
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();

        try {
            // Overall system status
            health.put("status", "UP");
            health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            health.put("uptime", getUptime());

            // Component health checks
            health.put("database", checkDatabaseHealth());
            health.put("cache", checkCacheHealth());
            health.put("memory", getMemoryInfo());
            health.put("system", getSystemInfo());
            health.put("application", getApplicationInfo());

            return ResponseEntity.ok(health);

        } catch (Exception e) {
            logger.error("Health check failed: {}", e.getMessage());
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            return ResponseEntity.status(503).body(health);
        }
    }

    /**
     * Detailed system metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> metrics() {
        Map<String, Object> metrics = new HashMap<>();

        try {
            // JVM metrics
            metrics.put("jvm", getJVMMetrics());

            // System metrics
            metrics.put("system", getSystemMetrics());

            // Application metrics
            metrics.put("application", getApplicationMetrics());

            // Database metrics
            metrics.put("database", getDatabaseMetrics());

            // Cache metrics
            metrics.put("cache", getCacheMetrics());

            return ResponseEntity.ok(metrics);

        } catch (Exception e) {
            logger.error("Metrics collection failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Readiness probe for Kubernetes
     */
    @GetMapping("/ready")
    public ResponseEntity<Map<String, String>> ready() {
        try {
            // Check critical dependencies
            if (!isDatabaseReady() || !isCacheReady()) {
                return ResponseEntity.status(503).body(Map.of(
                        "status", "NOT_READY",
                        "message", "Critical dependencies not available"));
            }

            return ResponseEntity.ok(Map.of(
                    "status", "READY",
                    "timestamp", LocalDateTime.now().toString()));

        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of(
                    "status", "NOT_READY",
                    "error", e.getMessage()));
        }
    }

    /**
     * Liveness probe for Kubernetes
     */
    @GetMapping("/live")
    public ResponseEntity<Map<String, String>> live() {
        return ResponseEntity.ok(Map.of(
                "status", "ALIVE",
                "timestamp", LocalDateTime.now().toString(),
                "uptime", getUptime()));
    }

    private Map<String, Object> checkDatabaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();

        try (Connection connection = dataSource.getConnection()) {
            boolean isValid = connection.isValid(5); // 5 second timeout

            dbHealth.put("status", isValid ? "UP" : "DOWN");
            dbHealth.put("database", connection.getMetaData().getDatabaseProductName());
            dbHealth.put("version", connection.getMetaData().getDatabaseProductVersion());
            dbHealth.put("url", connection.getMetaData().getURL());

            // Test a simple query
            long uavCount = uavRepository.count();
            dbHealth.put("uavCount", uavCount);
            dbHealth.put("queryTime", System.currentTimeMillis());

        } catch (Exception e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
        }

        return dbHealth;
    }

    private Map<String, Object> checkCacheHealth() {
        Map<String, Object> cacheHealth = new HashMap<>();

        try {
            cacheHealth.put("status", "UP");
            cacheHealth.put("cacheNames", cacheManager.getCacheNames());
            cacheHealth.put("cacheManager", cacheManager.getClass().getSimpleName());

        } catch (Exception e) {
            cacheHealth.put("status", "DOWN");
            cacheHealth.put("error", e.getMessage());
        }

        return cacheHealth;
    }

    private Map<String, Object> getMemoryInfo() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        Map<String, Object> memory = new HashMap<>();

        long heapUsed = memoryBean.getHeapMemoryUsage().getUsed();
        long heapMax = memoryBean.getHeapMemoryUsage().getMax();
        long nonHeapUsed = memoryBean.getNonHeapMemoryUsage().getUsed();

        memory.put("heapUsed", formatBytes(heapUsed));
        memory.put("heapMax", formatBytes(heapMax));
        memory.put("heapUsedPercent", Math.round((double) heapUsed / heapMax * 100));
        memory.put("nonHeapUsed", formatBytes(nonHeapUsed));

        return memory;
    }

    private Map<String, Object> getSystemInfo() {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        Map<String, Object> system = new HashMap<>();

        system.put("os", osBean.getName());
        system.put("version", osBean.getVersion());
        system.put("arch", osBean.getArch());
        system.put("processors", osBean.getAvailableProcessors());
        system.put("loadAverage", osBean.getSystemLoadAverage());

        return system;
    }

    private Map<String, Object> getApplicationInfo() {
        Map<String, Object> app = new HashMap<>();

        app.put("name", "UAV Docking Management System");
        app.put("version", "1.0.0");
        app.put("startTime", new java.util.Date(startTime));
        app.put("uptime", getUptime());
        app.put("javaVersion", System.getProperty("java.version"));
        app.put("springBootVersion", org.springframework.boot.SpringBootVersion.getVersion());

        return app;
    }

    private Map<String, Object> getJVMMetrics() {
        Map<String, Object> jvm = new HashMap<>();

        Runtime runtime = Runtime.getRuntime();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();

        jvm.put("totalMemory", formatBytes(runtime.totalMemory()));
        jvm.put("freeMemory", formatBytes(runtime.freeMemory()));
        jvm.put("maxMemory", formatBytes(runtime.maxMemory()));
        jvm.put("usedMemory", formatBytes(runtime.totalMemory() - runtime.freeMemory()));
        jvm.put("heapMemory", memoryBean.getHeapMemoryUsage());
        jvm.put("nonHeapMemory", memoryBean.getNonHeapMemoryUsage());
        jvm.put("gcCount", ManagementFactory.getGarbageCollectorMXBeans().stream()
                .mapToLong(gc -> gc.getCollectionCount()).sum());

        return jvm;
    }

    private Map<String, Object> getSystemMetrics() {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        Map<String, Object> system = new HashMap<>();

        system.put("cpuCount", osBean.getAvailableProcessors());
        system.put("loadAverage", osBean.getSystemLoadAverage());
        system.put("osName", osBean.getName());
        system.put("osVersion", osBean.getVersion());

        return system;
    }

    private Map<String, Object> getApplicationMetrics() {
        Map<String, Object> app = new HashMap<>();

        try {
            app.put("uavCount", uavRepository.count());
            app.put("activeThreads", Thread.activeCount());
            app.put("uptime", getUptime());

        } catch (Exception e) {
            app.put("error", "Failed to collect application metrics: " + e.getMessage());
        }

        return app;
    }

    private Map<String, Object> getDatabaseMetrics() {
        Map<String, Object> db = new HashMap<>();

        try (Connection connection = dataSource.getConnection()) {
            long startTime = System.currentTimeMillis();
            boolean isValid = connection.isValid(1);
            long responseTime = System.currentTimeMillis() - startTime;

            db.put("connectionValid", isValid);
            db.put("responseTimeMs", responseTime);
            db.put("productName", connection.getMetaData().getDatabaseProductName());

        } catch (Exception e) {
            db.put("error", e.getMessage());
        }

        return db;
    }

    private Map<String, Object> getCacheMetrics() {
        Map<String, Object> cache = new HashMap<>();

        cache.put("cacheNames", cacheManager.getCacheNames());
        cache.put("cacheManager", cacheManager.getClass().getSimpleName());

        return cache;
    }

    private boolean isDatabaseReady() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isCacheReady() {
        try {
            return cacheManager.getCacheNames() != null;
        } catch (Exception e) {
            return false;
        }
    }

    private String getUptime() {
        long uptimeMs = System.currentTimeMillis() - startTime;
        long seconds = uptimeMs / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;

        return String.format("%d days, %d hours, %d minutes, %d seconds",
                days, hours % 24, minutes % 60, seconds % 60);
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024)
            return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
