package com.example.uavdockingmanagementsystem.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;



/**
 * Test configuration for rate limiting
 */
@TestConfiguration
@Profile("test")
public class TestRateLimitingConfig {

    /**
     * Simple in-memory rate limiting service for tests
     */
    @Bean
    @Primary
    public RateLimitingConfig.RateLimitService testRateLimitService() {
        return new RateLimitingConfig.InMemoryRateLimitService();
    }
}
