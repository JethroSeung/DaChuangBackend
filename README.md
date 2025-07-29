# UAV Docking Management System

A comprehensive Spring Boot application for managing UAV (Unmanned Aerial Vehicle) docking operations, real-time location tracking, geofencing, and fleet management.

![Dashboard](images/dashboard.png)

## 🚁 Features

### Core Functionality
- **Real-time UAV Tracking**: Live location monitoring with GPS coordinates, altitude, speed, and heading
- **Docking Station Management**: Automated docking operations with capacity management
- **Geofencing**: Create and monitor geographical boundaries with violation alerts
- **Flight Path Visualization**: Historical flight data and route analysis
- **WebSocket Integration**: Real-time updates for location and status changes
- **Security**: Role-based access control (USER, OPERATOR, ADMIN)

### Advanced Features
- **Interactive Mapping**: Web-based map interface for UAV and station visualization
- **Bulk Operations**: Batch location updates and station management
- **Analytics**: Flight statistics, utilization reports, and performance metrics
- **Multi-database Support**: MySQL for production, H2 for development/testing
- **GraphQL API**: Flexible data querying alongside REST endpoints
- **Redis Caching**: Performance optimization for frequently accessed data

## 🛠️ Technology Stack

### Backend (Spring Boot)
- **Java 21** with **Spring Boot 3.4.4**
- **MySQL 8.0** for primary data storage
- **Redis** for caching and session management
- **Spring Security** for authentication and authorization
- **Spring Data JPA** with Hibernate for ORM
- **Spring WebSocket** for real-time communication
- **Spring GraphQL** for flexible API queries
- **Maven 3.9.6** for build management

### Frontend (Next.js)
- **Next.js 14** with App Router and TypeScript
- **React 18** with modern hooks and patterns
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for consistent component library
- **Zustand** for lightweight state management
- **React Hook Form** with Zod validation
- **Leaflet** for interactive mapping
- **Recharts** for data visualization

### DevOps & Tools
- **Docker** for containerization
- **Docker Compose** for development environment
- **Jest & React Testing Library** for frontend testing
- **JUnit 5** for backend testing
- **Playwright** for end-to-end testing

## 📚 Comprehensive Documentation

This project includes extensive documentation covering all aspects of the system:

### Core Documentation
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete REST and GraphQL API reference with examples
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design, patterns, data flow, and scalability considerations
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Detailed database design, relationships, and optimization strategies
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Setup instructions, workflow, testing, and contribution guidelines

### Component Documentation
- **[Backend Services](src/main/java/com/uav/dockingmanagement/service/README.md)** - Service layer architecture and business logic
- **[Frontend Components](frontend/src/components/README.md)** - React component library and usage patterns
- **[API Client Layer](frontend/src/api/README.md)** - Frontend-backend integration and error handling

### API Reference
- **OpenAPI Specification**: [docs/openapi.yaml](docs/openapi.yaml)
- **GraphQL Schema**: [docs/GRAPHQL_API.md](docs/GRAPHQL_API.md)
- **Interactive Documentation**: Available at `/swagger-ui.html` when running
- **GraphQL Playground**: Available at `/graphql`

## 🚀 Quick Start

### Prerequisites
- Java 21 or higher
- Maven 3.6+
- Docker & Docker Compose (optional)
- MySQL 8.0 (if not using Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DaChuangBackend
   ```

2. **Using Docker (Recommended)**
   ```bash
   # Start all services (MySQL, Redis, Application)
   docker-compose up -d
   
   # View logs
   docker-compose logs -f app
   ```

3. **Manual Setup**
   ```bash
   # Configure database (see Configuration section)
   # Start MySQL and Redis services
   
   # Build and run
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

4. **Access the application**
   - Application: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html
   - H2 Console (dev): http://localhost:8080/h2-console

## ⚙️ Configuration

### Database Configuration

**Development (H2)**
```properties
spring.profiles.active=local
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

**Production (MySQL)**
```properties
spring.profiles.active=prod
spring.datasource.url=jdbc:mysql://localhost:3306/uav_management
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=uav_management
DB_USERNAME=root
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-secret-key
```

## 📚 API Documentation

### REST Endpoints

#### Location Tracking
- `POST /api/location/update/{uavId}` - Update UAV location
- `GET /api/location/current` - Get all current locations
- `GET /api/location/history/{uavId}` - Location history
- `GET /api/location/flight-path/{uavId}` - Flight path data

#### Docking Stations
- `POST /api/docking-stations` - Create station
- `GET /api/docking-stations/nearest` - Find nearest stations
- `GET /api/docking-stations/available` - Available stations
- `PUT /api/docking-stations/{id}/status` - Update status

#### Geofencing
- `POST /api/geofences` - Create geofence
- `GET /api/geofences/active` - Active geofences
- `GET /api/geofences/check-point` - Check violations

For complete API documentation, see [docs/MAP_API_DOCUMENTATION.md](docs/MAP_API_DOCUMENTATION.md)

### GraphQL
Access GraphQL playground at `/graphql` for flexible data querying.

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=LocationControllerTest

# Run integration tests
./mvnw verify

# Generate test coverage report
./mvnw jacoco:report
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Build production image
docker build -t uav-management:latest .

# Run with external database
docker run -d \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-db-host \
  -e DB_USERNAME=username \
  -e DB_PASSWORD=password \
  uav-management:latest
```

## 📊 Monitoring & Logging

- **Application Logs**: `logs/application.log`
- **Audit Logs**: `logs/audit.log`
- **Security Logs**: `logs/security.log`
- **Health Check**: `/actuator/health`
- **Metrics**: `/actuator/metrics`

## 🔒 Security

### Authentication
The system uses role-based authentication with three levels:
- **USER**: Read-only access
- **OPERATOR**: Can update locations and manage operations
- **ADMIN**: Full system access

### API Security
- JWT token-based authentication
- HTTPS enforcement in production
- Input validation and sanitization
- SQL injection protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Java coding standards
- Write unit tests for new features
- Update documentation
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: Create an issue on GitHub
- **Email**: [Contact Information]

## 🗺️ Roadmap

- [ ] Mobile application integration
- [ ] Advanced analytics dashboard
- [ ] Machine learning for predictive maintenance
- [ ] Multi-tenant support
- [ ] Kubernetes deployment manifests

---

**Built with ❤️ for UAV fleet management**
