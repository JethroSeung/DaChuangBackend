package com.example.uavdockingmanagementsystem.interceptor;

import com.example.uavdockingmanagementsystem.config.RateLimitingConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.lang.NonNull;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Rate limiting interceptor for API endpoints
 * Implements sliding window rate limiting with different limits for different user types
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitInterceptor.class);

    @Autowired
    private RateLimitingConfig.RateLimitService rateLimitService;

    @Autowired
    private ObjectMapper objectMapper;

    // Rate limit configurations
    private static final Map<String, RateLimitConfig> RATE_LIMITS = new HashMap<>();
    
    static {
        // API endpoint rate limits (requests per minute)
        RATE_LIMITS.put("ADMIN", new RateLimitConfig(1000, 60)); // 1000 requests per minute
        RATE_LIMITS.put("OPERATOR", new RateLimitConfig(500, 60)); // 500 requests per minute
        RATE_LIMITS.put("USER", new RateLimitConfig(100, 60)); // 100 requests per minute
        RATE_LIMITS.put("ANONYMOUS", new RateLimitConfig(20, 60)); // 20 requests per minute
        RATE_LIMITS.put("API_KEY", new RateLimitConfig(2000, 60)); // 2000 requests per minute for API keys
        
        // Special limits for specific endpoints
        RATE_LIMITS.put("LOGIN", new RateLimitConfig(5, 300)); // 5 login attempts per 5 minutes
        RATE_LIMITS.put("PASSWORD_RESET", new RateLimitConfig(3, 3600)); // 3 password resets per hour
        RATE_LIMITS.put("EXPORT", new RateLimitConfig(10, 3600)); // 10 exports per hour
        RATE_LIMITS.put("BULK_OPERATION", new RateLimitConfig(5, 300)); // 5 bulk operations per 5 minutes
    }

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        // Skip rate limiting for non-API endpoints
        if (!requestURI.startsWith("/api/")) {
            return true;
        }

        // Get client identifier and user role
        String clientId = getClientIdentifier(request);
        String userRole = getUserRole();
        
        // Determine rate limit configuration
        RateLimitConfig config = getRateLimitConfig(requestURI, method, userRole);
        
        // Check rate limit
        String rateLimitKey = String.format("%s:%s:%s", userRole, clientId, getRateLimitCategory(requestURI));
        boolean allowed = rateLimitService.isAllowed(rateLimitKey, config.maxRequests, config.windowSeconds);
        
        // Get rate limit info for headers
        RateLimitingConfig.RateLimitInfo rateLimitInfo = rateLimitService.getRateLimitInfo(
            rateLimitKey, config.maxRequests, config.windowSeconds);
        
        // Add rate limit headers
        addRateLimitHeaders(response, rateLimitInfo);
        
        if (!allowed) {
            handleRateLimitExceeded(request, response, rateLimitInfo);
            return false;
        }
        
        // Log rate limit usage for monitoring
        if (rateLimitInfo.getRemaining() < config.maxRequests * 0.1) { // Less than 10% remaining
            logger.warn("Rate limit warning for {}: {}/{} requests used", 
                       clientId, config.maxRequests - rateLimitInfo.getRemaining(), config.maxRequests);
        }
        
        return true;
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // Try to get API key first
        String apiKey = request.getHeader("X-API-Key");
        if (apiKey != null && !apiKey.isEmpty()) {
            return "api_key:" + apiKey.substring(0, Math.min(8, apiKey.length()));
        }
        
        // Try to get authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return "user:" + auth.getName();
        }
        
        // Fall back to IP address
        String clientIP = getClientIP(request);
        return "ip:" + clientIP;
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }

    private String getUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "ANONYMOUS";
        }
        
        // Check for API key authentication
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_API_KEY"))) {
            return "API_KEY";
        }
        
        // Check user roles
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return "ADMIN";
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR"))) {
            return "OPERATOR";
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER"))) {
            return "USER";
        }
        
        return "USER"; // Default role
    }

    private RateLimitConfig getRateLimitConfig(String requestURI, String method, String userRole) {
        // Special endpoint rate limits
        if (requestURI.contains("/login") || requestURI.contains("/authenticate")) {
            return RATE_LIMITS.get("LOGIN");
        }
        
        if (requestURI.contains("/password-reset") || requestURI.contains("/forgot-password")) {
            return RATE_LIMITS.get("PASSWORD_RESET");
        }
        
        if (requestURI.contains("/export") || requestURI.contains("/download")) {
            return RATE_LIMITS.get("EXPORT");
        }
        
        if (requestURI.contains("/bulk") || (method.equals("POST") && requestURI.contains("/batch"))) {
            return RATE_LIMITS.get("BULK_OPERATION");
        }
        
        // Default rate limit based on user role
        return RATE_LIMITS.getOrDefault(userRole, RATE_LIMITS.get("USER"));
    }

    private String getRateLimitCategory(String requestURI) {
        if (requestURI.contains("/login") || requestURI.contains("/authenticate")) {
            return "auth";
        } else if (requestURI.contains("/export") || requestURI.contains("/download")) {
            return "export";
        } else if (requestURI.contains("/bulk") || requestURI.contains("/batch")) {
            return "bulk";
        } else {
            return "api";
        }
    }

    private void addRateLimitHeaders(HttpServletResponse response, RateLimitingConfig.RateLimitInfo rateLimitInfo) {
        response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimitInfo.getLimit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(rateLimitInfo.getRemaining()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() / 1000 + rateLimitInfo.getResetTime()));
        response.setHeader("X-RateLimit-Window", String.valueOf(rateLimitInfo.getWindowSize()));
    }

    private void handleRateLimitExceeded(HttpServletRequest request, HttpServletResponse response, 
                                       RateLimitingConfig.RateLimitInfo rateLimitInfo) throws IOException {
        
        String clientId = getClientIdentifier(request);
        logger.warn("Rate limit exceeded for client: {} on endpoint: {}", clientId, request.getRequestURI());
        
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Rate limit exceeded");
        errorResponse.put("message", "Too many requests. Please try again later.");
        errorResponse.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", request.getRequestURI());
        
        Map<String, Object> rateLimitDetails = new HashMap<>();
        rateLimitDetails.put("limit", rateLimitInfo.getLimit());
        rateLimitDetails.put("remaining", rateLimitInfo.getRemaining());
        rateLimitDetails.put("resetTime", rateLimitInfo.getResetTime());
        rateLimitDetails.put("windowSize", rateLimitInfo.getWindowSize());
        
        errorResponse.put("rateLimit", rateLimitDetails);
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }

    /**
     * Rate limit configuration
     */
    private static class RateLimitConfig {
        final int maxRequests;
        final long windowSeconds;

        RateLimitConfig(int maxRequests, long windowSeconds) {
            this.maxRequests = maxRequests;
            this.windowSeconds = windowSeconds;
        }
    }
}
