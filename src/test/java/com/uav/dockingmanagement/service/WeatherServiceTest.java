package com.uav.dockingmanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Comprehensive tests for WeatherService
 */
class WeatherServiceTest {

    private WeatherService weatherService;

    @Mock
    private RestTemplateBuilder restTemplateBuilder;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(restTemplateBuilder.build()).thenReturn(restTemplate);
        
        weatherService = new WeatherService(restTemplateBuilder);
        
        // Set up test configuration
        ReflectionTestUtils.setField(weatherService, "weatherEnabled", false);
        ReflectionTestUtils.setField(weatherService, "apiKey", "");
        ReflectionTestUtils.setField(weatherService, "apiUrl", "https://api.openweathermap.org/data/2.5");
    }

    @Test
    @DisplayName("Should return mock weather data when service disabled")
    void testGetCurrentWeatherDisabled() {
        // When
        Map<String, Object> result = weatherService.getCurrentWeather(40.7589, -73.9851);

        // Then
        assertTrue((Boolean) result.get("success"));
        assertEquals("mock", result.get("source"));
        assertNotNull(result.get("temperature"));
        assertNotNull(result.get("humidity"));
        assertNotNull(result.get("windSpeed"));
        assertNotNull(result.get("conditions"));
    }

    @Test
    @DisplayName("Should return mock forecast data when service disabled")
    void testGetWeatherForecastDisabled() {
        // When
        Map<String, Object> result = weatherService.getWeatherForecast(40.7589, -73.9851, 3);

        // Then
        assertTrue((Boolean) result.get("success"));
        assertEquals("mock", result.get("source"));
        assertNotNull(result.get("forecast"));
        assertTrue(result.get("forecast") instanceof java.util.List);
    }

    @Test
    @DisplayName("Should check flight conditions with mock data")
    void testCheckFlightConditions() {
        // When
        Map<String, Object> result = weatherService.checkFlightConditions(40.7589, -73.9851);

        // Then
        assertTrue((Boolean) result.get("success"));
        assertNotNull(result.get("flightSafe"));
        assertNotNull(result.get("conditions"));
        assertNotNull(result.get("recommendations"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> conditions = (Map<String, Object>) result.get("conditions");
        assertTrue(conditions.containsKey("windSpeed"));
        assertTrue(conditions.containsKey("temperature"));
        assertTrue(conditions.containsKey("humidity"));
        assertTrue(conditions.containsKey("visibility"));
    }

    @Test
    @DisplayName("Should return empty alerts when service disabled")
    void testGetWeatherAlertsDisabled() {
        // When
        Map<String, Object> result = weatherService.getWeatherAlerts(40.7589, -73.9851);

        // Then
        assertTrue((Boolean) result.get("success"));
        assertNotNull(result.get("alerts"));
        assertTrue(((java.util.List<?>) result.get("alerts")).isEmpty());
        assertEquals("Weather alerts service disabled", result.get("message"));
    }

    @Test
    @DisplayName("Should handle enabled service with API key")
    void testGetCurrentWeatherEnabled() {
        // Given
        ReflectionTestUtils.setField(weatherService, "weatherEnabled", true);
        ReflectionTestUtils.setField(weatherService, "apiKey", "test-api-key");
        
        Map<String, Object> mockResponse = Map.of(
                "main", Map.of("temp", 22.0, "humidity", 65, "pressure", 1013.25),
                "wind", Map.of("speed", 5.2, "deg", 180),
                "weather", java.util.List.of(Map.of("description", "clear sky", "icon", "01d")),
                "visibility", 10000
        );
        
        when(restTemplate.getForObject(any(String.class), eq(Map.class))).thenReturn(mockResponse);

        // When
        Map<String, Object> result = weatherService.getCurrentWeather(40.7589, -73.9851);

        // Then
        assertTrue((Boolean) result.get("success"));
        assertEquals("openweathermap", result.get("source"));
        assertEquals(22.0, result.get("temperature"));
        assertEquals(65, result.get("humidity"));
        assertEquals(5.2, result.get("windSpeed"));
        assertEquals("clear sky", result.get("conditions"));
    }

    @Test
    @DisplayName("Should handle API error gracefully")
    void testGetCurrentWeatherApiError() {
        // Given
        ReflectionTestUtils.setField(weatherService, "weatherEnabled", true);
        ReflectionTestUtils.setField(weatherService, "apiKey", "test-api-key");
        
        when(restTemplate.getForObject(any(String.class), eq(Map.class)))
                .thenThrow(new RuntimeException("API Error"));

        // When
        Map<String, Object> result = weatherService.getCurrentWeather(40.7589, -73.9851);

        // Then
        assertTrue((Boolean) result.get("success")); // Should fallback to mock data
        assertEquals("mock", result.get("source"));
    }

    @Test
    @DisplayName("Should evaluate flight safety correctly")
    void testFlightSafetyEvaluation() {
        // Test with safe conditions (mock data should be safe)
        Map<String, Object> result = weatherService.checkFlightConditions(40.7589, -73.9851);
        
        assertTrue((Boolean) result.get("success"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> conditions = (Map<String, Object>) result.get("conditions");
        
        // Verify all safety checks are present
        assertTrue(conditions.containsKey("windSpeed"));
        assertTrue(conditions.containsKey("temperature"));
        assertTrue(conditions.containsKey("humidity"));
        assertTrue(conditions.containsKey("visibility"));
        assertTrue(conditions.containsKey("conditions"));
        
        // Each condition should have value, safe flag, and threshold
        @SuppressWarnings("unchecked")
        Map<String, Object> windSpeed = (Map<String, Object>) conditions.get("windSpeed");
        assertTrue(windSpeed.containsKey("value"));
        assertTrue(windSpeed.containsKey("safe"));
        assertTrue(windSpeed.containsKey("threshold"));
    }

    @Test
    @DisplayName("Should handle null API response")
    void testNullApiResponse() {
        // Given
        ReflectionTestUtils.setField(weatherService, "weatherEnabled", true);
        ReflectionTestUtils.setField(weatherService, "apiKey", "test-api-key");
        
        when(restTemplate.getForObject(any(String.class), eq(Map.class))).thenReturn(null);

        // When
        Map<String, Object> result = weatherService.getCurrentWeather(40.7589, -73.9851);

        // Then
        assertTrue((Boolean) result.get("success")); // Should fallback to mock data
        assertEquals("mock", result.get("source"));
    }

    @Test
    @DisplayName("Should handle forecast with enabled service")
    void testGetWeatherForecastEnabled() {
        // Given
        ReflectionTestUtils.setField(weatherService, "weatherEnabled", true);
        ReflectionTestUtils.setField(weatherService, "apiKey", "test-api-key");
        
        Map<String, Object> mockResponse = Map.of(
                "list", java.util.List.of(
                        Map.of(
                                "dt_txt", "2024-01-01 12:00:00",
                                "main", Map.of("temp", 20.0, "humidity", 60),
                                "wind", Map.of("speed", 4.0),
                                "weather", java.util.List.of(Map.of("description", "sunny"))
                        )
                )
        );
        
        when(restTemplate.getForObject(any(String.class), eq(Map.class))).thenReturn(mockResponse);

        // When
        Map<String, Object> result = weatherService.getWeatherForecast(40.7589, -73.9851, 1);

        // Then
        assertTrue((Boolean) result.get("success"));
        assertEquals("openweathermap", result.get("source"));
        assertNotNull(result.get("forecast"));
        
        @SuppressWarnings("unchecked")
        java.util.List<Map<String, Object>> forecast = (java.util.List<Map<String, Object>>) result.get("forecast");
        assertFalse(forecast.isEmpty());
        
        Map<String, Object> firstItem = forecast.get(0);
        assertEquals("2024-01-01 12:00:00", firstItem.get("datetime"));
        assertEquals(20.0, firstItem.get("temperature"));
        assertEquals(60, firstItem.get("humidity"));
        assertEquals(4.0, firstItem.get("windSpeed"));
        assertEquals("sunny", firstItem.get("conditions"));
    }

    @Test
    @DisplayName("Should handle forecast API error")
    void testGetWeatherForecastApiError() {
        // Given
        ReflectionTestUtils.setField(weatherService, "weatherEnabled", true);
        ReflectionTestUtils.setField(weatherService, "apiKey", "test-api-key");
        
        when(restTemplate.getForObject(any(String.class), eq(Map.class)))
                .thenThrow(new RuntimeException("Forecast API Error"));

        // When
        Map<String, Object> result = weatherService.getWeatherForecast(40.7589, -73.9851, 3);

        // Then
        assertTrue((Boolean) result.get("success")); // Should fallback to mock data
        assertEquals("mock", result.get("source"));
        assertNotNull(result.get("forecast"));
    }

    @Test
    @DisplayName("Should validate flight conditions parameters")
    void testFlightConditionsValidation() {
        // When
        Map<String, Object> result = weatherService.checkFlightConditions(40.7589, -73.9851);

        // Then
        assertTrue((Boolean) result.get("success"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> conditions = (Map<String, Object>) result.get("conditions");
        
        // Verify safety thresholds are applied correctly
        @SuppressWarnings("unchecked")
        Map<String, Object> windSpeed = (Map<String, Object>) conditions.get("windSpeed");
        assertEquals("< 15 m/s", windSpeed.get("threshold"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> temperature = (Map<String, Object>) conditions.get("temperature");
        assertEquals("-10°C to 50°C", temperature.get("threshold"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> humidity = (Map<String, Object>) conditions.get("humidity");
        assertEquals("< 90%", humidity.get("threshold"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> visibility = (Map<String, Object>) conditions.get("visibility");
        assertEquals("> 1000m", visibility.get("threshold"));
    }
}
