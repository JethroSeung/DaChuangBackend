package com.example.uavdockingmanagementsystem.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Rate limiting configuration for API endpoints
 * Provides in-memory and Redis-based rate limiting
 */
@Configuration
@ConditionalOnProperty(name = "spring.data.redis.repositories.enabled", havingValue = "true", matchIfMissing = true)
public class RateLimitingConfig {

    @Bean
    public RateLimitService rateLimitService() {
        return new InMemoryRateLimitService();
    }

    @Bean
    @ConditionalOnClass(RedisConnectionFactory.class)
    @ConditionalOnProperty(name = "spring.data.redis.repositories.enabled", havingValue = "true", matchIfMissing = true)
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }

    /**
     * In-memory rate limiting service
     */
    public static class InMemoryRateLimitService implements RateLimitService {
        private final ConcurrentHashMap<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();
        private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        public InMemoryRateLimitService() {
            // Clean up expired buckets every minute
            scheduler.scheduleAtFixedRate(this::cleanupExpiredBuckets, 1, 1, TimeUnit.MINUTES);
        }

        @Override
        public boolean isAllowed(String key, int maxRequests, long windowSizeSeconds) {
            long currentTime = System.currentTimeMillis();
            long windowStart = currentTime - (windowSizeSeconds * 1000);

            RateLimitBucket bucket = buckets.computeIfAbsent(key, k -> new RateLimitBucket());
            
            synchronized (bucket) {
                // Remove old requests outside the window
                bucket.requests.removeIf(timestamp -> timestamp < windowStart);
                
                if (bucket.requests.size() < maxRequests) {
                    bucket.requests.add(currentTime);
                    bucket.lastAccess = currentTime;
                    return true;
                }
                
                bucket.lastAccess = currentTime;
                return false;
            }
        }

        @Override
        public RateLimitInfo getRateLimitInfo(String key, int maxRequests, long windowSizeSeconds) {
            long currentTime = System.currentTimeMillis();
            long windowStart = currentTime - (windowSizeSeconds * 1000);

            RateLimitBucket bucket = buckets.get(key);
            if (bucket == null) {
                return new RateLimitInfo(maxRequests, 0, windowSizeSeconds, 0);
            }

            synchronized (bucket) {
                bucket.requests.removeIf(timestamp -> timestamp < windowStart);
                int currentRequests = bucket.requests.size();
                int remaining = Math.max(0, maxRequests - currentRequests);
                
                long resetTime = bucket.requests.isEmpty() ? 0 : 
                    (bucket.requests.get(0) + (windowSizeSeconds * 1000) - currentTime) / 1000;
                
                return new RateLimitInfo(maxRequests, remaining, windowSizeSeconds, Math.max(0, resetTime));
            }
        }

        private void cleanupExpiredBuckets() {
            long currentTime = System.currentTimeMillis();
            long expireTime = 10 * 60 * 1000; // 10 minutes
            
            buckets.entrySet().removeIf(entry -> 
                currentTime - entry.getValue().lastAccess > expireTime);
        }
    }

    /**
     * Rate limit bucket for tracking requests
     */
    private static class RateLimitBucket {
        private final java.util.List<Long> requests = new java.util.ArrayList<>();
        private volatile long lastAccess = System.currentTimeMillis();
    }

    /**
     * Rate limiting service interface
     */
    public interface RateLimitService {
        boolean isAllowed(String key, int maxRequests, long windowSizeSeconds);
        RateLimitInfo getRateLimitInfo(String key, int maxRequests, long windowSizeSeconds);
    }

    /**
     * Rate limit information
     */
    public static class RateLimitInfo {
        private final int limit;
        private final int remaining;
        private final long windowSize;
        private final long resetTime;

        public RateLimitInfo(int limit, int remaining, long windowSize, long resetTime) {
            this.limit = limit;
            this.remaining = remaining;
            this.windowSize = windowSize;
            this.resetTime = resetTime;
        }

        public int getLimit() { return limit; }
        public int getRemaining() { return remaining; }
        public long getWindowSize() { return windowSize; }
        public long getResetTime() { return resetTime; }
    }
}
