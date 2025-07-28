package com.example.uavdockingmanagementsystem.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

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
