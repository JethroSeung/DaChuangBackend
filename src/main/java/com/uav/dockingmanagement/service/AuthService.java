package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.dto.AuthRequest;
import com.uav.dockingmanagement.dto.AuthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Authentication service for JWT-based authentication
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    // In-memory blacklist for logged out tokens (in production, use Redis)
    private final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

    /**
     * Authenticate user and generate JWT tokens
     */
    public AuthResponse authenticate(AuthRequest authRequest) {
        logger.debug("Authenticating user: {}", authRequest.getUsername());

        // Authenticate user credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.getUsername(),
                        authRequest.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Generate tokens
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Extract roles
        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toList());

        logger.info("Authentication successful for user: {}", authRequest.getUsername());

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtService.getExpirationTime(),
                userDetails.getUsername(),
                roles);
    }

    /**
     * Refresh access token using refresh token
     */
    public AuthResponse refreshToken(String refreshToken) {
        logger.debug("Refreshing token");

        if (isTokenBlacklisted(refreshToken)) {
            throw new RuntimeException("Refresh token is blacklisted");
        }

        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Invalid refresh token");
        }

        // Generate new access token
        String newAccessToken = jwtService.generateToken(userDetails);

        // Extract roles
        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toList());

        logger.debug("Token refresh successful for user: {}", username);

        return new AuthResponse(
                newAccessToken,
                refreshToken, // Keep the same refresh token
                jwtService.getExpirationTime(),
                userDetails.getUsername(),
                roles);
    }

    /**
     * Logout user by blacklisting the token
     */
    public void logout(String token) {
        logger.debug("Logging out user");
        tokenBlacklist.add(token);
        logger.debug("Token blacklisted successfully");
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            if (isTokenBlacklisted(token)) {
                return false;
            }

            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            return jwtService.isTokenValid(token, userDetails);
        } catch (Exception e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get current user information from token
     */
    public Map<String, Object> getCurrentUserInfo(String token) {
        if (isTokenBlacklisted(token)) {
            throw new RuntimeException("Token is blacklisted");
        }

        String username = jwtService.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(token, userDetails)) {
            throw new RuntimeException("Invalid token");
        }

        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toList());

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", userDetails.getUsername());
        userInfo.put("roles", roles);
        userInfo.put("enabled", userDetails.isEnabled());
        userInfo.put("accountNonExpired", userDetails.isAccountNonExpired());
        userInfo.put("accountNonLocked", userDetails.isAccountNonLocked());
        userInfo.put("credentialsNonExpired", userDetails.isCredentialsNonExpired());

        return userInfo;
    }

    /**
     * Check if token is blacklisted
     */
    private boolean isTokenBlacklisted(String token) {
        return tokenBlacklist.contains(token);
    }

    /**
     * Clear expired tokens from blacklist (should be called periodically)
     */
    public void cleanupExpiredTokens() {
        // In production, implement proper cleanup logic
        // For now, we'll keep it simple
        logger.debug("Cleaning up expired tokens from blacklist");
    }
}
