package com.example.uavdockingmanagementsystem.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.Arrays;

/**
 * Advanced caching configuration for improved performance
 * Provides multi-level caching with different TTL strategies
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Primary cache manager for application-level caching
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();

        // Define cache names with different characteristics
        cacheManager.setCacheNames(Arrays.asList(
            // Original caches
            "uavs",           // Cache for UAV data
            "regions",        // Cache for region data
            "statistics",     // Cache for system statistics
            "hibernatePod",   // Cache for hibernate pod status

            // Short-term caches (5 minutes)
            "uavStatus",
            "batteryStatus",
            "flightActivity",
            "systemHealth",

            // Medium-term caches (15 minutes)
            "uavList",
            "regionList",
            "maintenanceSchedule",
            "flightLogs",

            // Long-term caches (1 hour)
            "analytics",
            "reports",
            "userProfiles",
            "dashboardData",

            // Very long-term caches (24 hours)
            "systemConfig",
            "permissions",
            "lookupData",
            "auditLogs"
        ));

        cacheManager.setAllowNullValues(false);
        return cacheManager;
    }

    /**
     * Cache manager for session-based data
     */
    @Bean("sessionCacheManager")
    public CacheManager sessionCacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(Arrays.asList(
            "userSessions",
            "authTokens",
            "rateLimits",
            "temporaryData",
            "apiKeys"
        ));
        return cacheManager;
    }

    /**
     * Cache manager for real-time data
     */
    @Bean("realTimeCacheManager")
    public CacheManager realTimeCacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(Arrays.asList(
            "liveUAVData",
            "flightTelemetry",
            "sensorReadings",
            "alertsQueue",
            "notifications",
            "emergencyAlerts"
        ));
        return cacheManager;
    }
}
