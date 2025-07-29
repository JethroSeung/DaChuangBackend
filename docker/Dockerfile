# Multi-stage build for UAV Docking Management System
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder

# Install required packages
RUN apk add --no-cache curl

# Set the working directory
WORKDIR /app

# Create non-root user for build
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy Maven wrapper and POM first for better caching
COPY --chown=appuser:appgroup mvnw .
COPY --chown=appuser:appgroup .mvn .mvn
COPY --chown=appuser:appgroup pom.xml .

# Make the Maven wrapper script executable
RUN chmod +x ./mvnw

# Switch to non-root user
USER appuser

# Download dependencies first (will be cached if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY --chown=appuser:appgroup src src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# Extract JAR layers for better caching
RUN java -Djarmode=layertools -jar target/*.jar extract

# Runtime stage
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install required packages and security updates
RUN apk add --no-cache \
    curl \
    dumb-init \
    && apk upgrade --no-cache

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/logs /app/config && \
    chown -R appuser:appgroup /app

# Copy application layers from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appgroup /app/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/application/ ./

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with optimized JVM settings
CMD ["java", \
     "-XX:+UseContainerSupport", \
     "-XX:MaxRAMPercentage=75.0", \
     "-XX:+UseG1GC", \
     "-XX:+UseStringDeduplication", \
     "-XX:+OptimizeStringConcat", \
     "-Djava.security.egd=file:/dev/./urandom", \
     "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", \
     "org.springframework.boot.loader.JarLauncher"]