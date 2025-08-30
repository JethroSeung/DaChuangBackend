package com.uav.dockingmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting service implementation
 * Uses in-memory storage for simplicity (in production, use Redis)
 */
@Service
public class RateLimitingService {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingService.class);

    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.rate-limit.default-limit:100}")
    private int defaultLimit;

    @Value("${app.rate-limit.default-window:60}")
    private int defaultWindowSeconds;

    @Value("${app.rate-limit.admin-limit:1000}")
    private int adminLimit;

    @Value("${app.rate-limit.api-key-limit:2000}")
    private int apiKeyLimit;

    // In-memory storage for rate limiting (use Redis in production)
    private final Map<String, RateLimitEntry> rateLimitMap = new ConcurrentHashMap<>();

    /**
     * Check if request is allowed under rate limiting rules
     */
    public boolean isAllowed(String identifier, String userRole) {
        if (!rateLimitEnabled) {
            return true;
        }

        int limit = determineLimit(userRole);
        return checkRateLimit(identifier, limit, defaultWindowSeconds);
    }

    /**
     * Check if request is allowed with custom limits
     */
    public boolean isAllowed(String identifier, int limit, int windowSeconds) {
        if (!rateLimitEnabled) {
            return true;
        }

        return checkRateLimit(identifier, limit, windowSeconds);
    }

    /**
     * Get current rate limit status for identifier
     */
    public RateLimitStatus getRateLimitStatus(String identifier, String userRole) {
        int limit = determineLimit(userRole);
        RateLimitEntry entry = rateLimitMap.get(identifier);

        if (entry == null || isWindowExpired(entry)) {
            return new RateLimitStatus(limit, limit, getResetTime());
        }

        int remaining = Math.max(0, limit - entry.getCount().get());
        return new RateLimitStatus(limit, remaining, entry.getResetTime());
    }

    /**
     * Reset rate limit for identifier (admin function)
     */
    public void resetRateLimit(String identifier) {
        rateLimitMap.remove(identifier);
        logger.info("Rate limit reset for identifier: {}", identifier);
    }

    /**
     * Clean up expired entries (should be called periodically)
     */
    public void cleanupExpiredEntries() {
        LocalDateTime now = LocalDateTime.now();
        rateLimitMap.entrySet().removeIf(entry -> entry.getValue().getResetTime().isBefore(now));

        logger.debug("Cleaned up expired rate limit entries");
    }

    /**
     * Get rate limiting statistics
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("enabled", rateLimitEnabled);
        stats.put("totalEntries", rateLimitMap.size());
        stats.put("defaultLimit", defaultLimit);
        stats.put("defaultWindow", defaultWindowSeconds);
        stats.put("adminLimit", adminLimit);
        stats.put("apiKeyLimit", apiKeyLimit);

        return stats;
    }

    private boolean checkRateLimit(String identifier, int limit, int windowSeconds) {
        LocalDateTime now = LocalDateTime.now();

        rateLimitMap.compute(identifier, (key, entry) -> {
            if (entry == null || isWindowExpired(entry)) {
                // Create new entry or reset expired one
                return new RateLimitEntry(new AtomicInteger(1), now.plusSeconds(windowSeconds));
            } else {
                // Increment existing entry
                entry.getCount().incrementAndGet();
                return entry;
            }
        });

        RateLimitEntry entry = rateLimitMap.get(identifier);
        boolean allowed = entry.getCount().get() <= limit;

        if (!allowed) {
            logger.warn("Rate limit exceeded for identifier: {} (count: {}, limit: {})",
                    identifier, entry.getCount().get(), limit);
        }

        return allowed;
    }

    private boolean isWindowExpired(RateLimitEntry entry) {
        return LocalDateTime.now().isAfter(entry.getResetTime());
    }

    private int determineLimit(String userRole) {
        if (userRole == null) {
            return defaultLimit;
        }

        switch (userRole.toUpperCase()) {
            case "ADMIN":
                return adminLimit;
            case "API_KEY":
                return apiKeyLimit;
            default:
                return defaultLimit;
        }
    }

    private LocalDateTime getResetTime() {
        return LocalDateTime.now().plusSeconds(defaultWindowSeconds);
    }

    /**
     * Rate limit entry for tracking requests
     */
    private static class RateLimitEntry {
        private final AtomicInteger count;
        private final LocalDateTime resetTime;

        public RateLimitEntry(AtomicInteger count, LocalDateTime resetTime) {
            this.count = count;
            this.resetTime = resetTime;
        }

        public AtomicInteger getCount() {
            return count;
        }

        public LocalDateTime getResetTime() {
            return resetTime;
        }
    }

    /**
     * Rate limit status information
     */
    public static class RateLimitStatus {
        private final int limit;
        private final int remaining;
        private final LocalDateTime resetTime;

        public RateLimitStatus(int limit, int remaining, LocalDateTime resetTime) {
            this.limit = limit;
            this.remaining = remaining;
            this.resetTime = resetTime;
        }

        public int getLimit() {
            return limit;
        }

        public int getRemaining() {
            return remaining;
        }

        public LocalDateTime getResetTime() {
            return resetTime;
        }

        public long getResetTimeSeconds() {
            return ChronoUnit.SECONDS.between(LocalDateTime.now(), resetTime);
        }
    }
}
