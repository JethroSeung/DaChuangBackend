package com.uav.dockingmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for integrating with weather APIs to provide weather information
 * for flight planning and safety assessments
 */
@Service
public class WeatherService {

    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    @Value("${app.weather.api-key:}")
    private String apiKey;

    @Value("${app.weather.api-url:https://api.openweathermap.org/data/2.5}")
    private String apiUrl;

    @Value("${app.weather.enabled:false}")
    private boolean weatherEnabled;

    private final RestTemplate restTemplate;

    public WeatherService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    /**
     * Get current weather conditions for a location
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getCurrentWeather(double latitude, double longitude) {
        Map<String, Object> result = new HashMap<>();

        if (!weatherEnabled || apiKey.isEmpty()) {
            logger.warn("Weather service is disabled or API key not configured");
            return getMockWeatherData(latitude, longitude, "current");
        }

        try {
            String url = String.format("%s/weather?lat=%f&lon=%f&appid=%s&units=metric",
                    apiUrl, latitude, longitude, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                result = parseCurrentWeatherResponse(response);
                result.put("success", true);
                result.put("source", "openweathermap");
            } else {
                logger.warn("No weather data received from API, falling back to mock data");
                return getMockWeatherData(latitude, longitude, "current");
            }

        } catch (Exception e) {
            logger.error("Error fetching current weather: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error fetching weather data: " + e.getMessage());

            // Return mock data as fallback
            return getMockWeatherData(latitude, longitude, "current");
        }

        return result;
    }

    /**
     * Get weather forecast for a location
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getWeatherForecast(double latitude, double longitude, int days) {
        Map<String, Object> result = new HashMap<>();

        if (!weatherEnabled || apiKey.isEmpty()) {
            logger.warn("Weather service is disabled or API key not configured");
            return getMockWeatherData(latitude, longitude, "forecast");
        }

        try {
            String url = String.format("%s/forecast?lat=%f&lon=%f&appid=%s&units=metric&cnt=%d",
                    apiUrl, latitude, longitude, apiKey, days * 8); // 8 forecasts per day (3-hour intervals)

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                result = parseWeatherForecastResponse(response);
                result.put("success", true);
                result.put("source", "openweathermap");
            } else {
                result.put("success", false);
                result.put("message", "No forecast data received");
            }

        } catch (Exception e) {
            logger.error("Error fetching weather forecast: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error fetching forecast data: " + e.getMessage());

            // Return mock data as fallback
            return getMockWeatherData(latitude, longitude, "forecast");
        }

        return result;
    }

    /**
     * Check if weather conditions are suitable for UAV flight
     */
    public Map<String, Object> checkFlightConditions(double latitude, double longitude) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> weather = getCurrentWeather(latitude, longitude);

        if (!(Boolean) weather.get("success")) {
            result.put("success", false);
            result.put("message", "Unable to get weather data");
            return result;
        }

        // Extract weather parameters
        double windSpeed = (Double) weather.getOrDefault("windSpeed", 0.0);
        double temperature = (Double) weather.getOrDefault("temperature", 20.0);
        double humidity = (Double) weather.getOrDefault("humidity", 50.0);
        double visibility = (Double) weather.getOrDefault("visibility", 10000.0);
        String conditions = (String) weather.getOrDefault("conditions", "clear");

        // Flight safety thresholds
        boolean windSafe = windSpeed < 15.0; // m/s
        boolean temperatureSafe = temperature > -10.0 && temperature < 50.0; // Celsius
        boolean humiditySafe = humidity < 90.0; // %
        boolean visibilitySafe = visibility > 1000.0; // meters
        boolean conditionsSafe = !conditions.toLowerCase().contains("storm") &&
                !conditions.toLowerCase().contains("severe");

        boolean overallSafe = windSafe && temperatureSafe && humiditySafe && visibilitySafe && conditionsSafe;

        result.put("success", true);
        result.put("flightSafe", overallSafe);
        result.put("conditions", Map.of(
                "windSpeed", Map.of("value", windSpeed, "safe", windSafe, "threshold", "< 15 m/s"),
                "temperature", Map.of("value", temperature, "safe", temperatureSafe, "threshold", "-10°C to 50°C"),
                "humidity", Map.of("value", humidity, "safe", humiditySafe, "threshold", "< 90%"),
                "visibility", Map.of("value", visibility, "safe", visibilitySafe, "threshold", "> 1000m"),
                "conditions", Map.of("value", conditions, "safe", conditionsSafe, "threshold", "No storms")));

        // Generate recommendations
        if (!overallSafe) {
            StringBuilder recommendations = new StringBuilder("Flight not recommended due to: ");
            if (!windSafe)
                recommendations.append("high wind speeds, ");
            if (!temperatureSafe)
                recommendations.append("extreme temperature, ");
            if (!humiditySafe)
                recommendations.append("high humidity, ");
            if (!visibilitySafe)
                recommendations.append("poor visibility, ");
            if (!conditionsSafe)
                recommendations.append("severe weather conditions, ");

            result.put("recommendations", recommendations.toString().replaceAll(", $", ""));
        } else {
            result.put("recommendations", "Weather conditions are suitable for UAV flight");
        }

        return result;
    }

    /**
     * Get weather alerts for a location
     */
    public Map<String, Object> getWeatherAlerts(double latitude, double longitude) {
        Map<String, Object> result = new HashMap<>();

        if (!weatherEnabled || apiKey.isEmpty()) {
            result.put("success", true);
            result.put("alerts", java.util.List.of());
            result.put("message", "Weather alerts service disabled");
            return result;
        }

        try {
            // This would integrate with weather alert APIs
            // For now, return empty alerts
            result.put("success", true);
            result.put("alerts", java.util.List.of());
            result.put("lastChecked", LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Error fetching weather alerts: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error fetching weather alerts: " + e.getMessage());
        }

        return result;
    }

    // Private helper methods

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseCurrentWeatherResponse(Map<String, Object> response) {
        Map<String, Object> result = new HashMap<>();

        try {
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            Map<String, Object> wind = (Map<String, Object>) response.get("wind");
            java.util.List<Map<String, Object>> weather = (java.util.List<Map<String, Object>>) response.get("weather");

            result.put("temperature", main.get("temp"));
            result.put("humidity", main.get("humidity"));
            result.put("pressure", main.get("pressure"));
            result.put("windSpeed", wind != null ? wind.get("speed") : 0.0);
            result.put("windDirection", wind != null ? wind.get("deg") : 0.0);
            result.put("visibility", response.getOrDefault("visibility", 10000));

            if (weather != null && !weather.isEmpty()) {
                Map<String, Object> weatherInfo = weather.get(0);
                result.put("conditions", weatherInfo.get("description"));
                result.put("icon", weatherInfo.get("icon"));
            }

            result.put("timestamp", LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Error parsing weather response: {}", e.getMessage(), e);
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseWeatherForecastResponse(Map<String, Object> response) {
        Map<String, Object> result = new HashMap<>();

        try {
            java.util.List<Map<String, Object>> list = (java.util.List<Map<String, Object>>) response.get("list");
            java.util.List<Map<String, Object>> forecast = new java.util.ArrayList<>();

            for (Map<String, Object> item : list) {
                Map<String, Object> forecastItem = new HashMap<>();
                Map<String, Object> main = (Map<String, Object>) item.get("main");
                Map<String, Object> wind = (Map<String, Object>) item.get("wind");
                java.util.List<Map<String, Object>> weather = (java.util.List<Map<String, Object>>) item.get("weather");

                forecastItem.put("datetime", item.get("dt_txt"));
                forecastItem.put("temperature", main.get("temp"));
                forecastItem.put("humidity", main.get("humidity"));
                forecastItem.put("windSpeed", wind != null ? wind.get("speed") : 0.0);

                if (weather != null && !weather.isEmpty()) {
                    Map<String, Object> weatherInfo = weather.get(0);
                    forecastItem.put("conditions", weatherInfo.get("description"));
                }

                forecast.add(forecastItem);
            }

            result.put("forecast", forecast);
            result.put("timestamp", LocalDateTime.now());

        } catch (Exception e) {
            logger.error("Error parsing forecast response: {}", e.getMessage(), e);
        }

        return result;
    }

    private Map<String, Object> getMockWeatherData(double latitude, double longitude, String type) {
        Map<String, Object> result = new HashMap<>();

        if ("current".equals(type)) {
            result.put("success", true);
            result.put("temperature", 22.0);
            result.put("humidity", 65.0);
            result.put("pressure", 1013.25);
            result.put("windSpeed", 5.2);
            result.put("windDirection", 180.0);
            result.put("visibility", 10000.0);
            result.put("conditions", "partly cloudy");
            result.put("icon", "02d");
            result.put("source", "mock");
            result.put("timestamp", LocalDateTime.now());
        } else if ("forecast".equals(type)) {
            result.put("success", true);
            result.put("forecast", java.util.List.of(
                    Map.of("datetime", "2024-01-01 12:00:00", "temperature", 20.0, "humidity", 60.0, "windSpeed", 4.0,
                            "conditions", "sunny"),
                    Map.of("datetime", "2024-01-01 15:00:00", "temperature", 23.0, "humidity", 55.0, "windSpeed", 6.0,
                            "conditions", "partly cloudy"),
                    Map.of("datetime", "2024-01-01 18:00:00", "temperature", 18.0, "humidity", 70.0, "windSpeed", 3.0,
                            "conditions", "cloudy")));
            result.put("source", "mock");
            result.put("timestamp", LocalDateTime.now());
        }

        return result;
    }
}
