package com.uav.dockingmanagement.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Test security configuration that disables authentication for integration
 * tests
 * This allows tests to access all endpoints without authentication
 */
@TestConfiguration
@EnableWebSecurity
@Profile("test")
public class TestSecurityConfig {

    /**
     * Security filter chain for tests that permits all requests
     * This replaces the main SecurityConfig for test profile
     */
    @Bean
    public SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authz -> authz
                        .anyRequest().permitAll())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
