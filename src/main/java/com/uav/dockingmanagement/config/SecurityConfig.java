package com.uav.dockingmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration for UAV Docking Management System
 * Provides basic authentication and authorization
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for API endpoints
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - no authentication required
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                .requestMatchers("/api/access/validate").permitAll() // Allow access control validation
                
                // Admin endpoints - require ADMIN role
                .requestMatchers("/api/uav/delete/**").hasRole("ADMIN")
                .requestMatchers("/api/hibernate-pod/add", "/api/hibernate-pod/remove").hasRole("ADMIN")
                .requestMatchers("/api/docking-stations/*/delete", "/api/docking-stations").hasRole("ADMIN")
                .requestMatchers("/api/geofences/*/delete", "/api/geofences").hasRole("ADMIN")

                // Operator endpoints - require OPERATOR or ADMIN role
                .requestMatchers("/api/uav/add", "/api/uav/update/**").hasAnyRole("OPERATOR", "ADMIN")
                .requestMatchers("/api/uav/*/add-region", "/api/uav/*/remove-region").hasAnyRole("OPERATOR", "ADMIN")
                .requestMatchers("/api/location/update/**", "/api/location/bulk-update").hasAnyRole("OPERATOR", "ADMIN")
                .requestMatchers("/api/docking-stations/**").hasAnyRole("OPERATOR", "ADMIN")
                .requestMatchers("/api/geofences/**").hasAnyRole("OPERATOR", "ADMIN")

                // Read-only endpoints - require USER, OPERATOR, or ADMIN role
                .requestMatchers("/api/uav/all", "/api/uav/*/regions").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/hibernate-pod/status", "/api/hibernate-pod/uavs").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/uav/statistics").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/location/current/**", "/api/location/history/**").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/location/flight-path/**", "/api/location/area", "/api/location/active").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/location/stats/**", "/api/location/nearby").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/docking-stations/operational", "/api/docking-stations/available").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/docking-stations/nearest", "/api/docking-stations/area").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/docking-stations/statistics").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/geofences/active", "/api/geofences/check-point").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/api/geofences/area", "/api/geofences/statistics").hasAnyRole("USER", "OPERATOR", "ADMIN")
                
                // Web interface - require authentication
                .requestMatchers("/uav/**").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/map").hasAnyRole("USER", "OPERATOR", "ADMIN")
                .requestMatchers("/").hasAnyRole("USER", "OPERATOR", "ADMIN")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> {}) // Enable HTTP Basic authentication
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/uav/", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        // Create default users for demonstration
        // In production, these should be stored in a database
        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder().encode("admin123"))
                .roles("ADMIN", "OPERATOR", "USER")
                .build();

        UserDetails operator = User.builder()
                .username("operator")
                .password(passwordEncoder().encode("operator123"))
                .roles("OPERATOR", "USER")
                .build();

        UserDetails user = User.builder()
                .username("user")
                .password(passwordEncoder().encode("user123"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, operator, user);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
