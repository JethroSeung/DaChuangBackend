package com.uav.dockingmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for error tracking and monitoring integration
 * Provides centralized error reporting and analytics
 */
@Service
public class ErrorTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(ErrorTrackingService.class);

    @Value("${app.error-tracking.enabled:false}")
    private boolean errorTrackingEnabled;

    @Value("${app.error-tracking.service:sentry}")
    private String errorTrackingService;

    @Value("${app.error-tracking.api-key:}")
    private String apiKey;

    @Value("${app.error-tracking.project-id:}")
    private String projectId;

    private final RestTemplate restTemplate;
    private final List<Map<String, Object>> errorLog = new ArrayList<>();

    public ErrorTrackingService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    /**
     * Report an error to the tracking service
     */
    public void reportError(String message, String level, Map<String, Object> context, Exception exception) {
        Map<String, Object> errorReport = new HashMap<>();
        errorReport.put("message", message);
        errorReport.put("level", level);
        errorReport.put("timestamp", LocalDateTime.now());
        errorReport.put("context", context != null ? context : new HashMap<>());

        if (exception != null) {
            errorReport.put("exception", Map.of(
                    "type", exception.getClass().getSimpleName(),
                    "message", exception.getMessage(),
                    "stackTrace", Arrays.toString(exception.getStackTrace())));
        }

        // Store locally
        synchronized (errorLog) {
            errorLog.add(errorReport);
            // Keep only last 1000 errors
            if (errorLog.size() > 1000) {
                errorLog.remove(0);
            }
        }

        // Send to external service if enabled
        if (errorTrackingEnabled && !apiKey.isEmpty()) {
            try {
                sendToExternalService(errorReport);
            } catch (Exception e) {
                logger.error("Failed to send error to tracking service: {}", e.getMessage());
            }
        }

        logger.error("Error reported: {} - {}", level, message, exception);
    }

    /**
     * Report a simple error message
     */
    public void reportError(String message, String level) {
        reportError(message, level, null, null);
    }

    /**
     * Report an exception
     */
    public void reportException(Exception exception, Map<String, Object> context) {
        reportError(exception.getMessage(), "ERROR", context, exception);
    }

    /**
     * Report a warning
     */
    public void reportWarning(String message, Map<String, Object> context) {
        reportError(message, "WARNING", context, null);
    }

    /**
     * Report an info message
     */
    public void reportInfo(String message, Map<String, Object> context) {
        reportError(message, "INFO", context, null);
    }

    /**
     * Get error statistics
     */
    public Map<String, Object> getErrorStatistics() {
        Map<String, Object> stats = new HashMap<>();

        synchronized (errorLog) {
            stats.put("totalErrors", errorLog.size());

            // Count by level
            Map<String, Long> levelCounts = new HashMap<>();
            Map<String, Long> recentCounts = new HashMap<>();
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);

            for (Map<String, Object> error : errorLog) {
                String level = (String) error.get("level");
                levelCounts.put(level, levelCounts.getOrDefault(level, 0L) + 1);

                LocalDateTime timestamp = (LocalDateTime) error.get("timestamp");
                if (timestamp.isAfter(oneHourAgo)) {
                    recentCounts.put(level, recentCounts.getOrDefault(level, 0L) + 1);
                }
            }

            stats.put("errorsByLevel", levelCounts);
            stats.put("recentErrors", recentCounts);
            stats.put("lastError", errorLog.isEmpty() ? null : errorLog.get(errorLog.size() - 1));
        }

        stats.put("trackingEnabled", errorTrackingEnabled);
        stats.put("trackingService", errorTrackingService);
        stats.put("generatedAt", LocalDateTime.now());

        return stats;
    }

    /**
     * Get recent errors
     */
    public List<Map<String, Object>> getRecentErrors(int limit) {
        synchronized (errorLog) {
            int start = Math.max(0, errorLog.size() - limit);
            return new ArrayList<>(errorLog.subList(start, errorLog.size()));
        }
    }

    /**
     * Get errors by level
     */
    public List<Map<String, Object>> getErrorsByLevel(String level, int limit) {
        synchronized (errorLog) {
            return errorLog.stream()
                    .filter(error -> level.equals(error.get("level")))
                    .skip(Math.max(0, errorLog.size() - limit))
                    .toList();
        }
    }

    /**
     * Clear error log
     */
    public void clearErrorLog() {
        synchronized (errorLog) {
            errorLog.clear();
        }
        logger.info("Error log cleared");
    }

    /**
     * Get error trends over time
     */
    public Map<String, Object> getErrorTrends() {
        Map<String, Object> trends = new HashMap<>();

        synchronized (errorLog) {
            Map<String, Integer> hourlyTrends = new HashMap<>();
            LocalDateTime now = LocalDateTime.now();

            // Initialize last 24 hours
            for (int i = 23; i >= 0; i--) {
                String hour = now.minusHours(i).getHour() + ":00";
                hourlyTrends.put(hour, 0);
            }

            // Count errors by hour
            for (Map<String, Object> error : errorLog) {
                LocalDateTime timestamp = (LocalDateTime) error.get("timestamp");
                if (timestamp.isAfter(now.minusHours(24))) {
                    String hour = timestamp.getHour() + ":00";
                    hourlyTrends.put(hour, hourlyTrends.getOrDefault(hour, 0) + 1);
                }
            }

            trends.put("hourlyTrends", hourlyTrends);
        }

        trends.put("generatedAt", LocalDateTime.now());
        return trends;
    }

    /**
     * Report system health check
     */
    public void reportHealthCheck(String component, boolean healthy, Map<String, Object> details) {
        Map<String, Object> context = new HashMap<>();
        context.put("component", component);
        context.put("healthy", healthy);
        context.put("details", details);

        String level = healthy ? "INFO" : "WARNING";
        String message = String.format("Health check for %s: %s", component, healthy ? "HEALTHY" : "UNHEALTHY");

        reportError(message, level, context, null);
    }

    /**
     * Report performance metric
     */
    public void reportPerformanceMetric(String operation, long durationMs, Map<String, Object> context) {
        Map<String, Object> perfContext = new HashMap<>();
        perfContext.put("operation", operation);
        perfContext.put("durationMs", durationMs);
        perfContext.put("context", context);

        String level = durationMs > 5000 ? "WARNING" : "INFO"; // Warn if operation takes > 5 seconds
        String message = String.format("Performance: %s took %dms", operation, durationMs);

        reportError(message, level, perfContext, null);
    }

    /**
     * Report security event
     */
    public void reportSecurityEvent(String event, String severity, Map<String, Object> details) {
        Map<String, Object> context = new HashMap<>();
        context.put("securityEvent", event);
        context.put("severity", severity);
        context.put("details", details);

        String message = String.format("Security event: %s (severity: %s)", event, severity);
        reportError(message, "ERROR", context, null);
    }

    /**
     * Report business logic error
     */
    public void reportBusinessError(String operation, String errorCode, String description,
            Map<String, Object> context) {
        Map<String, Object> businessContext = new HashMap<>();
        businessContext.put("operation", operation);
        businessContext.put("errorCode", errorCode);
        businessContext.put("description", description);
        businessContext.put("context", context);

        String message = String.format("Business error in %s: %s (%s)", operation, description, errorCode);
        reportError(message, "ERROR", businessContext, null);
    }

    // Private helper methods

    private void sendToExternalService(Map<String, Object> errorReport) {
        if ("sentry".equalsIgnoreCase(errorTrackingService)) {
            sendToSentry(errorReport);
        } else if ("custom".equalsIgnoreCase(errorTrackingService)) {
            sendToCustomService(errorReport);
        }
    }

    private void sendToSentry(Map<String, Object> errorReport) {
        try {
            // This would integrate with Sentry API
            // For now, just log that we would send it
            logger.debug("Would send error to Sentry: {}", errorReport.get("message"));
        } catch (Exception e) {
            logger.error("Failed to send error to Sentry: {}", e.getMessage());
        }
    }

    private void sendToCustomService(Map<String, Object> errorReport) {
        try {
            // This would integrate with a custom error tracking service
            // For now, just log that we would send it
            logger.debug("Would send error to custom service: {}", errorReport.get("message"));
        } catch (Exception e) {
            logger.error("Failed to send error to custom service: {}", e.getMessage());
        }
    }
}
