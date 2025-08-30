package com.uav.dockingmanagement.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Global exception handler for the UAV Docking Management System
 * Provides centralized error handling and user-friendly error messages
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle data integrity violations (e.g., duplicate RFID tags)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {

        System.err.println("Data integrity violation: " + ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Data integrity violation");

        String message = "A database constraint was violated. ";
        if (ex.getMessage().contains("rfid_tag")) {
            message += "RFID tag must be unique.";
        } else if (ex.getMessage().contains("owner_name")) {
            message += "Owner name is required.";
        } else {
            message += "Please check your input data.";
        }

        response.put("message", message);

        // Return JSON for API requests, redirect for web requests
        if (request.getRequestURI().startsWith("/api/")) {
            return ResponseEntity.badRequest().body(response);
        } else {
            // For web requests, we'll let the controller handle the error
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Handle entity not found exceptions
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(
            NoSuchElementException ex, HttpServletRequest request) {

        System.err.println("Entity not found: " + ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Entity not found");
        response.put("message", "The requested resource was not found.");

        if (request.getRequestURI().startsWith("/api/")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Handle missing servlet request parameter exceptions
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<String> handleMissingParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        System.err.println("Missing required parameter: " + ex.getMessage());

        // For AccessControlAPI, return plain text response to match the controller's
        // produces type
        if (request.getRequestURI().startsWith("/api/access/")) {
            return ResponseEntity.badRequest()
                    .header("Content-Type", "text/plain")
                    .body("Missing required parameter: " + ex.getParameterName());
        }

        // For other APIs, return JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Missing parameter");
        response.put("message", "Missing required parameter: " + ex.getParameterName());

        return ResponseEntity.badRequest().body(response.toString());
    }

    /**
     * Handle HTTP request method not supported exceptions
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<String> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        System.err.println("Method not supported: " + ex.getMessage());

        // For AccessControlAPI, return plain text response
        if (request.getRequestURI().startsWith("/api/access/")) {
            return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                    .header("Content-Type", "text/plain")
                    .body("Method not allowed: " + ex.getMethod());
        }

        // For other APIs, return JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Method not allowed");
        response.put("message", "HTTP method " + ex.getMethod() + " is not supported for this endpoint");

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response.toString());
    }

    /**
     * Handle HTTP media type not acceptable exceptions
     * Note: AccessControlAPI endpoints are excluded to allow proper content
     * negotiation
     */
    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<String> handleMediaTypeNotAcceptable(
            HttpMediaTypeNotAcceptableException ex, HttpServletRequest request) {

        System.err.println("Media type not acceptable: " + ex.getMessage());

        // Skip handling for AccessControlAPI - let Spring's default handling work
        if (request.getRequestURI().startsWith("/api/access/")) {
            return null; // Return null to indicate this handler doesn't apply
        }

        // For other APIs, return JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Media type not acceptable");
        response.put("message", "The request format is not acceptable");

        return ResponseEntity.badRequest().body(response.toString());
    }

    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {

        System.err.println("Illegal argument: " + ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Invalid argument");
        response.put("message", "Invalid input provided: " + ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle general runtime exceptions
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex, HttpServletRequest request) {

        System.err.println("Runtime exception: " + ex.getMessage());
        ex.printStackTrace();

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Runtime error");
        response.put("message", "An unexpected error occurred. Please try again.");

        if (request.getRequestURI().startsWith("/api/")) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {

        System.err.println("Unexpected exception: " + ex.getMessage());
        ex.printStackTrace();

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Internal server error");
        response.put("message", "An unexpected error occurred. Please contact support if the problem persists.");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Custom exception for UAV-specific business logic errors
     */
    public static class UAVBusinessException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        public UAVBusinessException(String message) {
            super(message);
        }

        public UAVBusinessException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * Handle UAV business logic exceptions
     */
    @ExceptionHandler(UAVBusinessException.class)
    public ResponseEntity<Map<String, Object>> handleUAVBusinessException(
            UAVBusinessException ex, HttpServletRequest request) {

        System.err.println("UAV business exception: " + ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Business logic error");
        response.put("message", ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }
}
