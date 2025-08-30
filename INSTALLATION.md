# UAV Docking Management System - Installation Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Environment Setup](#development-environment-setup)
3. [Database Setup](#database-setup)
4. [Application Installation](#application-installation)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Java**: JDK 21 or higher
- **Node.js**: Version 18.0.0 or higher
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free disk space
- **Network**: Internet connection for dependency downloads

### Recommended Development Tools

- **IDE**: IntelliJ IDEA, Eclipse, or VS Code
- **Database**: PostgreSQL 13+ (production) or H2 (development)
- **Package Manager**: pnpm (recommended) or npm
- **Version Control**: Git

## Development Environment Setup

### 1. Install Java JDK 21

#### Windows

```powershell
# Download and install from Microsoft or Oracle
# Set JAVA_HOME environment variable
$env:JAVA_HOME = "D:\Program Files\Microsoft\jdk-21.0.7.6-hotspot"
```

#### macOS

```bash
# Using Homebrew
brew install openjdk@21

# Set JAVA_HOME
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-21-jdk

# Set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

### 2. Install Node.js and pnpm

#### Windows

```powershell
# Download from nodejs.org or use Chocolatey
choco install nodejs

# Install pnpm
npm install -g pnpm
```

#### macOS

```bash
# Using Homebrew
brew install node
npm install -g pnpm
```

#### Linux

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

### 3. Verify Installation

```bash
java -version    # Should show Java 21
node -v         # Should show Node 18+
pnpm -v         # Should show pnpm version
```

## Database Setup

### Development (H2 Database)

No additional setup required. H2 is configured by default for development.

### Production (PostgreSQL)

#### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download installer from postgresql.org
```

#### Create Database

```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE uav_docking;
CREATE USER uav_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE uav_docking TO uav_user;
```

## Application Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd DaChuangBackend
```

### 2. Backend Installation

```bash
# Make Maven wrapper executable (Linux/macOS)
chmod +x mvnw

# Install dependencies and compile
./mvnw clean compile

# Run tests (optional)
./mvnw test -Pskip-frontend
```

### 3. Frontend Installation

```bash
cd frontend
pnpm install
```

## Configuration

### 1. Application Configuration

Create `src/main/resources/application-local.yml`:

```yaml
spring:
  profiles:
    active: local
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  h2:
    console:
      enabled: true
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true

server:
  port: 8080

logging:
  level:
    com.uav: DEBUG
    org.springframework.web: DEBUG
```

### 2. Production Configuration

Create `src/main/resources/application-prod.yml`:

```yaml
spring:
  profiles:
    active: prod
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/uav_docking}
    username: ${DB_USERNAME:uav_user}
    password: ${DB_PASSWORD:your_password}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

server:
  port: ${SERVER_PORT:8080}

logging:
  level:
    com.uav: INFO
    root: WARN
```

## Running the Application

### Development Mode

```bash
# Terminal 1: Start backend
./mvnw spring-boot:run -Dspring.profiles.active=local

# Terminal 2: Start frontend (if separate development)
cd frontend
pnpm dev
```

### Production Mode

```bash
# Build the application
./mvnw clean package -Pprod

# Run the packaged application
java -jar target/uav-docking-management-system-1.0.0-SNAPSHOT.jar
```

### Using Docker

```bash
# Build Docker image
docker build -t uav-docking-system .

# Run container
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/uav_docking \
  -e DB_USERNAME=uav_user \
  -e DB_PASSWORD=your_password \
  uav-docking-system
```

## Testing

### Backend Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=AccessControlAPITest

# Run tests with coverage
./mvnw test jacoco:report
```

### Frontend Tests

```bash
cd frontend
pnpm test
```

### Integration Tests

```bash
# Run integration tests
./mvnw test -Dtest=**/*IntegrationTest
```

## Troubleshooting

### Common Installation Issues

#### Java Issues

```bash
# Check Java installation
java -version
javac -version

# Set JAVA_HOME if not set
export JAVA_HOME=/path/to/java
```

#### Maven Issues

```bash
# Clean Maven cache
./mvnw dependency:purge-local-repository

# Force update dependencies
./mvnw clean compile -U
```

#### Node.js Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Database Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Reset database
dropdb uav_docking
createdb uav_docking
```

### Performance Issues

- Increase JVM heap size: `-Xmx4g`
- Check database connections
- Monitor system resources

### Network Issues

- Check firewall settings
- Verify port availability
- Test database connectivity

## Next Steps

After successful installation:

1. Access the application at `http://localhost:8080`
2. Check health endpoint: `http://localhost:8080/actuator/health`
3. Review logs for any issues
4. Configure production settings
5. Set up monitoring and backups

## Support

For installation issues:

1. Check the logs in `logs/` directory
2. Verify all prerequisites are met
3. Review configuration files
4. Test database connectivity
5. Check system resources
