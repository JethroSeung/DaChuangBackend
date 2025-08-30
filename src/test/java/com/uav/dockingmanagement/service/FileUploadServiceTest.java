package com.uav.dockingmanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive tests for FileUploadService
 */
class FileUploadServiceTest {

    private FileUploadService fileUploadService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileUploadService = new FileUploadService();
        ReflectionTestUtils.setField(fileUploadService, "uploadDir", tempDir.toString());
    }

    @Test
    @DisplayName("Should upload file successfully")
    void testUploadFileSuccess() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Test content".getBytes());

        // When
        Map<String, Object> result = fileUploadService.uploadFile(file, "test");

        // Then
        assertTrue((Boolean) result.get("success"));
        assertEquals("File uploaded successfully", result.get("message"));
        assertNotNull(result.get("filename"));
        assertNotNull(result.get("filePath"));
        assertEquals(file.getSize(), result.get("fileSize"));
    }

    @Test
    @DisplayName("Should reject empty file")
    void testUploadEmptyFile() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.txt", "text/plain", new byte[0]);

        // When
        Map<String, Object> result = fileUploadService.uploadFile(file, "test");

        // Then
        assertFalse((Boolean) result.get("success"));
        assertEquals("File is empty", result.get("message"));
    }

    @Test
    @DisplayName("Should reject file with invalid extension")
    void testUploadInvalidExtension() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.exe", "application/octet-stream", "Test content".getBytes());

        // When
        Map<String, Object> result = fileUploadService.uploadFile(file, "test");

        // Then
        assertFalse((Boolean) result.get("success"));
        assertTrue(((String) result.get("message")).contains("File type not allowed"));
    }

    @Test
    @DisplayName("Should upload multiple files")
    void testUploadMultipleFiles() {
        // Given
        MockMultipartFile[] files = {
                new MockMultipartFile("file1", "test1.txt", "text/plain", "Content 1".getBytes()),
                new MockMultipartFile("file2", "test2.txt", "text/plain", "Content 2".getBytes())
        };

        // When
        Map<String, Object> result = fileUploadService.uploadFiles(files, "test");

        // Then
        assertTrue((Boolean) result.get("success"));
        assertEquals(2, result.get("totalFiles"));
        assertEquals(2, result.get("successCount"));
        assertEquals(0, result.get("failureCount"));
    }

    @Test
    @DisplayName("Should get file info")
    void testGetFileInfo() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Test content".getBytes());
        Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "test");
        String filename = (String) uploadResult.get("filename");

        // When
        Map<String, Object> info = fileUploadService.getFileInfo(filename, "test");

        // Then
        assertTrue((Boolean) info.get("exists"));
        assertEquals(filename, info.get("filename"));
        assertNotNull(info.get("size"));
        assertNotNull(info.get("lastModified"));
    }

    @Test
    @DisplayName("Should list files in category")
    void testListFiles() {
        // Given
        MockMultipartFile file1 = new MockMultipartFile(
                "file1", "test1.txt", "text/plain", "Content 1".getBytes());
        MockMultipartFile file2 = new MockMultipartFile(
                "file2", "test2.txt", "text/plain", "Content 2".getBytes());

        Map<String, Object> result1 = fileUploadService.uploadFile(file1, "test");
        Map<String, Object> result2 = fileUploadService.uploadFile(file2, "test");

        // When
        List<Map<String, Object>> files = fileUploadService.listFiles("test");

        // Then
        assertEquals(2, files.size());
        // Check that both uploaded files are in the list by checking the actual generated filenames
        String uploadedFilename1 = (String) result1.get("filename");
        String uploadedFilename2 = (String) result2.get("filename");
        assertTrue(files.stream().anyMatch(f -> uploadedFilename1.equals(f.get("filename"))));
        assertTrue(files.stream().anyMatch(f -> uploadedFilename2.equals(f.get("filename"))));
    }

    @Test
    @DisplayName("Should delete file")
    void testDeleteFile() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Test content".getBytes());
        Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "test");
        String filename = (String) uploadResult.get("filename");

        // When
        boolean deleted = fileUploadService.deleteFile(filename, "test");

        // Then
        assertTrue(deleted);

        // Verify file no longer exists
        Map<String, Object> info = fileUploadService.getFileInfo(filename, "test");
        assertFalse((Boolean) info.get("exists"));
    }

    @Test
    @DisplayName("Should handle file with dangerous filename")
    void testDangerousFilename() {
        // Given - use a filename with dangerous characters but valid extension
        MockMultipartFile file = new MockMultipartFile(
                "file", "../../../etc/passwd.txt", "text/plain", "Test content".getBytes());

        // When
        Map<String, Object> result = fileUploadService.uploadFile(file, "test");

        // Then
        assertFalse((Boolean) result.get("success"));
        assertEquals("Invalid filename characters", result.get("message"));
    }

    @Test
    @DisplayName("Should handle null filename")
    void testNullFilename() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", null, "text/plain", "Test content".getBytes());

        // When
        Map<String, Object> result = fileUploadService.uploadFile(file, "test");

        // Then
        assertFalse((Boolean) result.get("success"));
        assertEquals("Invalid filename", result.get("message"));
    }

    @Test
    @DisplayName("Should handle whitespace in filename")
    void testWhitespaceFilename() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "   ", "text/plain", "Test content".getBytes());

        // When
        Map<String, Object> result = fileUploadService.uploadFile(file, "test");

        // Then
        assertFalse((Boolean) result.get("success"));
        assertEquals("Invalid filename", result.get("message"));
    }

    @Test
    @DisplayName("Should handle mixed success and failure in batch upload")
    void testMixedBatchUpload() {
        // Given
        MockMultipartFile[] files = {
                new MockMultipartFile("file1", "test1.txt", "text/plain", "Content 1".getBytes()),
                new MockMultipartFile("file2", "test2.exe", "application/octet-stream", "Content 2".getBytes()),
                new MockMultipartFile("file3", "test3.txt", "text/plain", "Content 3".getBytes())
        };

        // When
        Map<String, Object> result = fileUploadService.uploadFiles(files, "test");

        // Then
        assertFalse((Boolean) result.get("success")); // Overall failure due to one failed file
        assertEquals(3, result.get("totalFiles"));
        assertEquals(2, result.get("successCount"));
        assertEquals(1, result.get("failureCount"));
    }

    @Test
    @DisplayName("Should handle non-existent file deletion")
    void testDeleteNonExistentFile() {
        // When
        boolean deleted = fileUploadService.deleteFile("nonexistent.txt", "test");

        // Then
        assertFalse(deleted);
    }

    @Test
    @DisplayName("Should handle empty category listing")
    void testListEmptyCategory() {
        // When
        List<Map<String, Object>> files = fileUploadService.listFiles("empty");

        // Then
        assertTrue(files.isEmpty());
    }

    @Test
    @DisplayName("Should handle file info for non-existent file")
    void testGetInfoNonExistentFile() {
        // When
        Map<String, Object> info = fileUploadService.getFileInfo("nonexistent.txt", "test");

        // Then
        assertFalse((Boolean) info.get("exists"));
    }
}
