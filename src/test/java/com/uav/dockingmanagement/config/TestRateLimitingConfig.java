package com.uav.dockingmanagement.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

/**
 * Test configuration for rate limiting
 * Provides a simple mock rate limiting service for tests
 */
@TestConfiguration
@Profile("test")
public class TestRateLimitingConfig {

    /**
     * Mock rate limiting service for tests that always allows requests
     */
    @Bean
    @Primary
    public RateLimitingConfig.RateLimitService testRateLimitService() {
        return new MockRateLimitService();
    }

    /**
     * Mock implementation that always allows requests for testing
     */
    public static class MockRateLimitService implements RateLimitingConfig.RateLimitService {

        @Override
        public boolean isAllowed(String key, int maxRequests, long windowSizeSeconds) {
            // Always allow requests in tests
            return true;
        }

        @Override
        public RateLimitingConfig.RateLimitInfo getRateLimitInfo(String key, int maxRequests, long windowSizeSeconds) {
            // Return mock rate limit info
            return new RateLimitingConfig.RateLimitInfo(maxRequests, maxRequests, windowSizeSeconds, 0);
        }
    }
}
