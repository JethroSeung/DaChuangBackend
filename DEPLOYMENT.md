# UAV Docking Management System - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the UAV Docking Management System in various environments.

## Prerequisites

### System Requirements
- **Java**: JDK 21 or higher
- **Node.js**: Version 18 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Database**: PostgreSQL 13+ or H2 (for development)
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 1GB free space

### Development Tools
- Maven 3.8+ (included via Maven Wrapper)
- Git for version control

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd DaChuangBackend
```

### 2. Backend Setup
```bash
# Set Java environment (Windows)
$env:JAVA_HOME = "D:\Program Files\Microsoft\jdk-21.0.7.6-hotspot"

# Build the project (skipping tests for quick setup)
./mvnw clean package -DskipTests

# Run the application
./mvnw spring-boot:run
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install
pnpm build
```

## Production Deployment

### Option 1: Standalone JAR
```bash
# Build production JAR
./mvnw clean package -Pprod

# Run the JAR
java -jar target/uav-docking-management-system-1.0.0-SNAPSHOT.jar
```

### Option 2: Docker Deployment
```bash
# Build Docker image
docker build -t uav-docking-system .

# Run container
docker run -p 8080:8080 uav-docking-system
```

### Option 3: Cloud Deployment
The application is configured for cloud deployment with:
- Spring Boot Actuator for health checks
- Configurable database connections
- Environment-based configuration

## Configuration

### Database Configuration
Create `application-prod.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/uav_docking
    username: ${DB_USERNAME:uav_user}
    password: ${DB_PASSWORD:your_password}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

logging:
  level:
    com.uav: INFO
```

### Environment Variables
```bash
# Database
DB_USERNAME=uav_user
DB_PASSWORD=your_secure_password
DB_URL=jdbc:postgresql://localhost:5432/uav_docking

# Application
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Security
JWT_SECRET=your_jwt_secret_key
```

## Health Checks and Monitoring

### Health Endpoints
- **Health Check**: `GET /actuator/health`
- **Application Info**: `GET /actuator/info`
- **Metrics**: `GET /actuator/metrics`

### API Endpoints
- **Access Control**: `POST /api/access/validate`
- **Docking Stations**: `GET /api/docking-stations`
- **UAV Management**: `GET /api/uavs`

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in application.yml
   server:
     port: 8081
   ```

2. **Database Connection Issues**
   - Verify database is running
   - Check connection credentials
   - Ensure database exists

3. **Frontend Build Issues**
   ```bash
   cd frontend
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   pnpm build
   ```

### Logs
- Application logs: `logs/application.log`
- Access logs: `logs/access.log`
- Error logs: `logs/error.log`

## Performance Tuning

### JVM Options
```bash
java -Xmx2g -Xms1g -XX:+UseG1GC -jar target/uav-docking-management-system-1.0.0-SNAPSHOT.jar
```

### Database Optimization
- Configure connection pooling
- Set appropriate timeout values
- Monitor query performance

## Security Considerations

### Production Security
- Use HTTPS in production
- Configure proper CORS settings
- Set secure JWT secrets
- Enable security headers
- Regular security updates

### Network Security
- Configure firewall rules
- Use VPN for internal access
- Monitor access logs

## Backup and Recovery

### Database Backup
```bash
pg_dump uav_docking > backup_$(date +%Y%m%d).sql
```

### Application Backup
- Backup configuration files
- Backup uploaded files
- Backup logs for audit

## Scaling

### Horizontal Scaling
- Use load balancer
- Configure session management
- Database connection pooling

### Vertical Scaling
- Increase JVM heap size
- Optimize database queries
- Monitor resource usage

## Support

For deployment issues:
1. Check application logs
2. Verify configuration
3. Test database connectivity
4. Review system requirements

## Version Information
- **Application Version**: 1.0.0-SNAPSHOT
- **Spring Boot Version**: 3.4.4
- **Java Version**: 21
- **Node.js Version**: 18+
