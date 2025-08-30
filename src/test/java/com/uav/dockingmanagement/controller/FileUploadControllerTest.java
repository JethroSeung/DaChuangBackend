package com.uav.dockingmanagement.controller;

import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import com.uav.dockingmanagement.config.TestSecurityConfig;
import com.uav.dockingmanagement.config.TestWebConfig;
import com.uav.dockingmanagement.service.FileUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive tests for FileUploadController
 */
@WebMvcTest(FileUploadController.class)
@ActiveProfiles("test")
@Import({ TestRateLimitingConfig.class, TestSecurityConfig.class, TestWebConfig.class })
class FileUploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FileUploadService fileUploadService;

    @BeforeEach
    void setUp() {
        // Setup common mock responses
    }

    @Test
    @DisplayName("Should upload file successfully")
    void testUploadFileSuccess() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Test content".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "filename", "test_123.txt",
                "fileSize", 12L,
                "uploadedAt", LocalDateTime.now());

        when(fileUploadService.uploadFile(any(), eq("general"))).thenReturn(successResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload")
                .file(file)
                .param("category", "general"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("File uploaded successfully"))
                .andExpect(jsonPath("$.filename").value("test_123.txt"));
    }

    @Test
    @DisplayName("Should handle upload failure")
    void testUploadFileFailure() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.exe", "application/octet-stream", "Test content".getBytes());

        Map<String, Object> failureResponse = Map.of(
                "success", false,
                "message", "File type not allowed");

        when(fileUploadService.uploadFile(any(), eq("general"))).thenReturn(failureResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload")
                .file(file)
                .param("category", "general"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("File type not allowed"));
    }

    @Test
    @DisplayName("Should upload multiple files")
    void testUploadMultipleFiles() throws Exception {
        // Given
        MockMultipartFile file1 = new MockMultipartFile(
                "files", "test1.txt", "text/plain", "Content 1".getBytes());
        MockMultipartFile file2 = new MockMultipartFile(
                "files", "test2.txt", "text/plain", "Content 2".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "Uploaded 2 files successfully, 0 failed",
                "totalFiles", 2,
                "successCount", 2,
                "failureCount", 0);

        when(fileUploadService.uploadFiles(any(), eq("general"))).thenReturn(successResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload/multiple")
                .file(file1)
                .file(file2)
                .param("category", "general"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.totalFiles").value(2))
                .andExpect(jsonPath("$.successCount").value(2));
    }

    @Test
    @DisplayName("Should get file info")
    void testGetFileInfo() throws Exception {
        // Given
        Map<String, Object> fileInfo = Map.of(
                "exists", true,
                "filename", "test.txt",
                "size", 1024L,
                "contentType", "text/plain");

        when(fileUploadService.getFileInfo("test.txt", "general")).thenReturn(fileInfo);

        // When & Then
        mockMvc.perform(get("/api/files/info/general/test.txt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true))
                .andExpect(jsonPath("$.filename").value("test.txt"))
                .andExpect(jsonPath("$.size").value(1024));
    }

    @Test
    @DisplayName("Should handle file not found")
    void testGetFileInfoNotFound() throws Exception {
        // Given
        Map<String, Object> fileInfo = Map.of("exists", false);

        when(fileUploadService.getFileInfo("nonexistent.txt", "general")).thenReturn(fileInfo);

        // When & Then
        mockMvc.perform(get("/api/files/info/general/nonexistent.txt"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should list files in category")
    void testListFiles() throws Exception {
        // Given
        List<Map<String, Object>> files = List.of(
                Map.of("filename", "file1.txt", "size", 1024L),
                Map.of("filename", "file2.txt", "size", 2048L));

        when(fileUploadService.listFiles("general")).thenReturn(files);

        // When & Then
        mockMvc.perform(get("/api/files/list/general"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].filename").value("file1.txt"))
                .andExpect(jsonPath("$[1].filename").value("file2.txt"));
    }

    @Test
    @DisplayName("Should delete file successfully")
    void testDeleteFileSuccess() throws Exception {
        // Given
        when(fileUploadService.deleteFile("test.txt", "general")).thenReturn(true);

        // When & Then
        mockMvc.perform(delete("/api/files/delete/general/test.txt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("File deleted successfully"));
    }

    @Test
    @DisplayName("Should handle delete file not found")
    void testDeleteFileNotFound() throws Exception {
        // Given
        when(fileUploadService.deleteFile("nonexistent.txt", "general")).thenReturn(false);

        // When & Then
        mockMvc.perform(delete("/api/files/delete/general/nonexistent.txt"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should upload UAV documentation")
    void testUploadUAVDocumentation() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "manual.pdf", "application/pdf", "PDF content".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "filename", "manual_123.pdf");

        when(fileUploadService.uploadFile(any(), eq("uav-docs/UAV001"))).thenReturn(successResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload/uav-docs")
                .file(file)
                .param("uavId", "UAV001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.filename").value("manual_123.pdf"));
    }

    @Test
    @DisplayName("Should upload maintenance report")
    void testUploadMaintenanceReport() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "maintenance.pdf", "application/pdf", "Report content".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "filename", "maintenance_123.pdf");

        when(fileUploadService.uploadFile(any(), eq("maintenance-reports/UAV001/MAINT001")))
                .thenReturn(successResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload/maintenance-reports")
                .file(file)
                .param("uavId", "UAV001")
                .param("maintenanceId", "MAINT001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Should upload flight log attachment")
    void testUploadFlightLogAttachment() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "flight_data.csv", "text/csv", "CSV content".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "filename", "flight_data_123.csv");

        when(fileUploadService.uploadFile(any(), eq("flight-logs/FL001"))).thenReturn(successResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload/flight-logs")
                .file(file)
                .param("flightLogId", "FL001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Should upload system configuration")
    void testUploadSystemConfig() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "config.json", "application/json", "Config content".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "filename", "config_123.json");

        when(fileUploadService.uploadFile(any(), eq("system-config/database"))).thenReturn(successResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload/system-config")
                .file(file)
                .param("configType", "database"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Should get upload statistics")
    void testGetUploadStatistics() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/files/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCategories").value(5))
                .andExpect(jsonPath("$.maxFileSize").value("10MB"))
                .andExpect(jsonPath("$.supportedFormats").isArray())
                .andExpect(jsonPath("$.categories").isArray());
    }

    @Test
    @DisplayName("Should handle upload with default category")
    void testUploadWithDefaultCategory() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Test content".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "File uploaded successfully");

        when(fileUploadService.uploadFile(any(), eq("general"))).thenReturn(successResponse);

        // When & Then - No category parameter provided, should default to "general"
        mockMvc.perform(multipart("/api/files/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Should handle upload with custom category")
    void testUploadWithCustomCategory() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Test content".getBytes());

        Map<String, Object> successResponse = Map.of(
                "success", true,
                "message", "File uploaded successfully");

        when(fileUploadService.uploadFile(any(), eq("custom"))).thenReturn(successResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload")
                .file(file)
                .param("category", "custom"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
