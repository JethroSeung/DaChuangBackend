# Developer Guide - UAV Docking Management System

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
8. [Contribution Guidelines](#contribution-guidelines)
9. [Release Process](#release-process)

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Java JDK** | 21+ | Backend development |
| **Node.js** | 18.0+ | Frontend development |
| **npm** | 8.0+ | Package management |
| **Maven** | 3.6+ | Build tool |
| **MySQL** | 8.0+ | Database |
| **Redis** | 6.0+ | Caching and sessions |
| **Docker** | 20.0+ | Containerization |
| **Git** | 2.30+ | Version control |

### Recommended Tools

| Tool | Purpose |
|------|---------|
| **IntelliJ IDEA** | Java/Spring Boot development |
| **VS Code** | Frontend development |
| **MySQL Workbench** | Database management |
| **Postman** | API testing |
| **Docker Desktop** | Container management |

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DaChuangBackend
```

### 2. Backend Setup (Spring Boot)

#### Environment Configuration

Create environment-specific configuration files:

```bash
# Copy example configuration
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
```

Edit `application-local.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/uav_management_dev
spring.datasource.username=dev_user
spring.datasource.password=dev_password

# Redis Configuration
spring.redis.host=localhost
spring.redis.port=6379

# Development Settings
spring.jpa.show-sql=true
logging.level.com.example.uavdockingmanagementsystem=DEBUG
```

#### Database Setup

```bash
# Start MySQL (using Docker)
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=uav_management_dev \
  -e MYSQL_USER=dev_user \
  -e MYSQL_PASSWORD=dev_password \
  -p 3306:3306 \
  -d mysql:8.0

# Start Redis
docker run --name redis-dev -p 6379:6379 -d redis:alpine
```

#### Build and Run Backend

```bash
# Install dependencies and build
./mvnw clean install

# Run with development profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Or run with IDE
# Set VM options: -Dspring.profiles.active=local
```

### 3. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
```

Edit `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

#### Run Frontend

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### 4. Docker Development Environment

For a complete development environment using Docker:

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Project Structure

### Backend Structure

```
src/
├── main/
│   ├── java/com/example/uavdockingmanagementsystem/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── model/          # Entity classes
│   │   ├── repository/     # Data access layer
│   │   ├── service/        # Business logic layer
│   │   ├── dto/            # Data transfer objects
│   │   ├── exception/      # Custom exceptions
│   │   └── util/           # Utility classes
│   └── resources/
│       ├── application.properties
│       ├── application-*.properties
│       ├── static/         # Static web assets
│       └── templates/      # Thymeleaf templates
└── test/
    ├── java/               # Unit and integration tests
    └── resources/          # Test resources
```

### Frontend Structure

```
frontend/
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   ├── features/     # Feature-specific components
│   │   └── layout/       # Layout components
│   ├── stores/           # Zustand state stores
│   ├── api/              # API client functions
│   ├── types/            # TypeScript type definitions
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── styles/           # CSS and styling
├── public/               # Static assets
├── __tests__/            # Test files
└── docs/                 # Component documentation
```

## Development Workflow

### 1. Feature Development Process

```bash
# 1. Create feature branch
git checkout -b feature/UAV-123-new-feature

# 2. Make changes and commit frequently
git add .
git commit -m "feat: add new UAV validation logic"

# 3. Keep branch updated
git fetch origin
git rebase origin/main

# 4. Run tests before pushing
npm test                    # Frontend tests
./mvnw test                # Backend tests

# 5. Push and create pull request
git push origin feature/UAV-123-new-feature
```

### 2. Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(uav): add RFID tag validation
fix(location): resolve GPS coordinate precision issue
docs(api): update endpoint documentation
test(service): add unit tests for UAVService
```

### 3. Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **hotfix/***: Critical bug fixes
- **release/***: Release preparation branches

## Code Standards

### Backend (Java/Spring Boot)

#### Code Style
- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use 4 spaces for indentation
- Maximum line length: 120 characters
- Use meaningful variable and method names

#### Naming Conventions
```java
// Classes: PascalCase
public class UAVService { }

// Methods and variables: camelCase
public UAV findUAVByRfidTag(String rfidTag) { }

// Constants: UPPER_SNAKE_CASE
private static final String DEFAULT_STATUS = "READY";

// Packages: lowercase with dots
package com.example.uavdockingmanagementsystem.service;
```

#### Documentation Standards
```java
/**
 * Service for managing UAV operations and business logic.
 * 
 * <p>This service provides comprehensive UAV management including
 * CRUD operations, validation, and integration with external systems.</p>
 * 
 * @author Developer Name
 * @version 1.0
 * @since 1.0
 */
@Service
public class UAVService {
    
    /**
     * Creates a new UAV in the system.
     * 
     * @param uav The UAV entity to create
     * @return The created UAV with generated ID
     * @throws ValidationException if UAV data is invalid
     * @throws DuplicateRfidException if RFID tag already exists
     */
    public UAV createUAV(UAV uav) {
        // Implementation
    }
}
```

#### Error Handling
```java
// Use specific exception types
@RestController
public class UAVController {
    
    @ExceptionHandler(UAVNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUAVNotFound(UAVNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("UAV_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

### Frontend (TypeScript/React)

#### Code Style
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use TypeScript strict mode

#### Naming Conventions
```typescript
// Components: PascalCase
export function UAVManagement() { }

// Functions and variables: camelCase
const fetchUAVData = async () => { };

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:8080';

// Types and interfaces: PascalCase
interface UAVData {
  id: number;
  rfidTag: string;
}
```

#### Component Documentation
```typescript
/**
 * UAV management component for displaying and managing UAV fleet.
 * 
 * @component
 * @example
 * ```tsx
 * <UAVManagement 
 *   onUAVSelect={(uav) => console.log(uav)}
 *   showFilters={true}
 * />
 * ```
 */
interface UAVManagementProps {
  /** Callback fired when a UAV is selected */
  onUAVSelect?: (uav: UAV) => void;
  /** Whether to show filter controls */
  showFilters?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function UAVManagement({ 
  onUAVSelect, 
  showFilters = true, 
  className 
}: UAVManagementProps) {
  // Implementation
}
```

## Testing Guidelines

### Backend Testing

#### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class UAVServiceTest {
    
    @Mock
    private UAVRepository uavRepository;
    
    @InjectMocks
    private UAVService uavService;
    
    @Test
    @DisplayName("Should create UAV with valid data")
    void shouldCreateUAVWithValidData() {
        // Given
        UAV uav = new UAV();
        uav.setRfidTag("TEST-001");
        uav.setOwnerName("Test Owner");
        
        when(uavRepository.save(any(UAV.class))).thenReturn(uav);
        
        // When
        UAV result = uavService.createUAV(uav);
        
        // Then
        assertThat(result.getRfidTag()).isEqualTo("TEST-001");
        verify(uavRepository).save(uav);
    }
}
```

#### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = "spring.profiles.active=test")
class UAVControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldCreateUAVSuccessfully() {
        // Given
        CreateUAVRequest request = new CreateUAVRequest();
        request.setRfidTag("TEST-001");
        request.setOwnerName("Test Owner");
        
        // When
        ResponseEntity<UAV> response = restTemplate.postForEntity(
            "/api/uav", request, UAV.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getRfidTag()).isEqualTo("TEST-001");
    }
}
```

### Frontend Testing

#### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UAVCard } from './UAVCard';

describe('UAVCard', () => {
  const mockUAV = {
    id: 1,
    rfidTag: 'UAV-001',
    ownerName: 'John Doe',
    model: 'DJI Phantom 4',
    status: 'AUTHORIZED'
  };

  it('should display UAV information correctly', () => {
    render(<UAVCard uav={mockUAV} />);
    
    expect(screen.getByText('UAV-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('DJI Phantom 4')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<UAVCard uav={mockUAV} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onSelect).toHaveBeenCalledWith(mockUAV);
  });
});
```

#### E2E Tests
```typescript
import { test, expect } from '@playwright/test';

test.describe('UAV Management', () => {
  test('should create new UAV', async ({ page }) => {
    await page.goto('/uavs');
    
    // Click create button
    await page.click('[data-testid="create-uav-button"]');
    
    // Fill form
    await page.fill('[data-testid="rfid-input"]', 'TEST-001');
    await page.fill('[data-testid="owner-input"]', 'Test Owner');
    await page.fill('[data-testid="model-input"]', 'Test Model');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Verify creation
    await expect(page.locator('[data-testid="uav-list"]')).toContainText('TEST-001');
  });
});
```

### Test Commands

```bash
# Backend tests
./mvnw test                           # Run unit tests
./mvnw verify                         # Run integration tests
./mvnw test -Dtest=UAVServiceTest     # Run specific test class
./mvnw jacoco:report                  # Generate coverage report

# Frontend tests
npm test                              # Run unit tests
npm run test:watch                    # Run tests in watch mode
npm run test:coverage                 # Run with coverage
npm run e2e                          # Run E2E tests
npm run e2e:headed                    # Run E2E tests with browser
```

## Debugging and Troubleshooting

### Backend Debugging

#### IntelliJ IDEA Setup
1. Create run configuration for Spring Boot
2. Set VM options: `-Dspring.profiles.active=local`
3. Set breakpoints and debug

#### Common Issues

**Database Connection Issues:**
```bash
# Check MySQL status
docker ps | grep mysql

# Check connection
mysql -h localhost -u dev_user -p uav_management_dev

# Reset database
docker-compose down -v
docker-compose up -d mysql
```

**Port Conflicts:**
```bash
# Check what's using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Frontend Debugging

#### Browser DevTools
- Use React Developer Tools extension
- Check Network tab for API calls
- Use Console for JavaScript errors

#### Common Issues

**API Connection Issues:**
```typescript
// Check API client configuration
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);

// Test API endpoint directly
curl http://localhost:8080/api/uav/all
```

**Build Issues:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

## Contribution Guidelines

### 1. Before Contributing

- Read this developer guide thoroughly
- Set up the development environment
- Run existing tests to ensure everything works
- Check the issue tracker for existing work

### 2. Making Changes

- Create a feature branch from `develop`
- Write tests for new functionality
- Follow code standards and conventions
- Update documentation as needed
- Ensure all tests pass

### 3. Pull Request Process

1. **Create Pull Request**
   - Use descriptive title and description
   - Reference related issues
   - Include screenshots for UI changes

2. **Code Review Checklist**
   - [ ] Code follows style guidelines
   - [ ] Tests are included and passing
   - [ ] Documentation is updated
   - [ ] No breaking changes (or properly documented)
   - [ ] Performance impact considered

3. **Merge Requirements**
   - At least one approval from code owner
   - All CI checks passing
   - No merge conflicts
   - Up-to-date with target branch

### 4. Code Review Guidelines

#### For Authors
- Keep PRs small and focused
- Provide clear description and context
- Respond to feedback promptly
- Test changes thoroughly

#### For Reviewers
- Review within 24 hours
- Provide constructive feedback
- Check for security issues
- Verify tests cover edge cases

## Release Process

### 1. Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### 2. Release Steps

```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version numbers
# - pom.xml (backend)
# - package.json (frontend)

# 3. Update CHANGELOG.md

# 4. Run full test suite
./mvnw clean verify
npm run test:ci

# 5. Create release PR to main

# 6. After merge, tag release
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# 7. Deploy to production
```

### 3. Hotfix Process

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/v1.2.1 main

# 2. Fix the issue

# 3. Update version and changelog

# 4. Create PR to main and develop

# 5. Tag and deploy
```

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library Documentation](https://testing-library.com/)
- [Docker Documentation](https://docs.docker.com/)

## Getting Help

- **Documentation**: Check this guide and API documentation
- **Issues**: Create GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Request review from team members

---

**Happy coding! 🚁**
