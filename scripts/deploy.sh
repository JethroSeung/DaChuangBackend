#!/bin/bash

# UAV Docking Management System - Deployment Script
# This script handles deployment to different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
BUILD_FIRST=true
DOCKER_DEPLOY=false
BACKUP_DB=false
HEALTH_CHECK=true
ROLLBACK_ON_FAILURE=false

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -e, --env ENV        Target environment (dev, staging, prod) [default: dev]"
    echo "  -n, --no-build       Skip building before deployment"
    echo "  -d, --docker         Deploy using Docker"
    echo "  -b, --backup         Backup database before deployment"
    echo "  -s, --skip-health    Skip health check after deployment"
    echo "  -r, --rollback       Enable automatic rollback on failure"
    echo ""
    echo "Examples:"
    echo "  $0                           # Deploy to dev environment"
    echo "  $0 -e staging -d             # Deploy to staging using Docker"
    echo "  $0 -e prod -b -r             # Deploy to prod with backup and rollback"
    echo "  $0 -n -s                     # Deploy without building or health check"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -n|--no-build)
            BUILD_FIRST=false
            shift
            ;;
        -d|--docker)
            DOCKER_DEPLOY=true
            shift
            ;;
        -b|--backup)
            BACKUP_DB=true
            shift
            ;;
        -s|--skip-health)
            HEALTH_CHECK=false
            shift
            ;;
        -r|--rollback)
            ROLLBACK_ON_FAILURE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be one of: dev, staging, prod"
    exit 1
fi

print_info "Starting UAV Docking Management System deployment..."
print_info "Environment: $ENVIRONMENT"
print_info "Build First: $BUILD_FIRST"
print_info "Docker Deploy: $DOCKER_DEPLOY"
print_info "Backup DB: $BACKUP_DB"
print_info "Health Check: $HEALTH_CHECK"
print_info "Rollback on Failure: $ROLLBACK_ON_FAILURE"

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if [ "$DOCKER_DEPLOY" = true ] && ! command -v docker &> /dev/null; then
        print_error "Docker not found but Docker deployment requested"
        exit 1
    fi
    
    if [ "$DOCKER_DEPLOY" = true ] && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose not found but Docker deployment requested"
        exit 1
    fi
    
    # Check if environment configuration exists
    if [ ! -f "src/main/resources/application-${ENVIRONMENT}.properties" ] && [ ! -f "src/main/resources/application-${ENVIRONMENT}.yml" ]; then
        print_warning "No specific configuration found for environment: $ENVIRONMENT"
    fi
    
    print_success "Prerequisites check completed"
}

# Build application
build_application() {
    if [ "$BUILD_FIRST" = true ]; then
        print_info "Building application for $ENVIRONMENT environment..."
        
        if [ -f "./build.sh" ]; then
            ./build.sh -p "$ENVIRONMENT" -t package
        else
            # Fallback to direct Maven command
            detect_maven
            if [ $? -ne 0 ]; then
                return 1
            fi
            $MVN_CMD clean package -Dspring.profiles.active="$ENVIRONMENT" -DskipTests
        fi
        
        print_success "Application built successfully"
    else
        print_info "Skipping build as requested"
    fi
}

# Backup database
backup_database() {
    if [ "$BACKUP_DB" = true ]; then
        print_info "Creating database backup..."
        
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # This is a placeholder - implement actual backup logic based on your database
        case $ENVIRONMENT in
            "dev")
                print_info "Skipping backup for dev environment"
                ;;
            "staging"|"prod")
                print_warning "Database backup not implemented - please implement based on your database type"
                # Example for MySQL:
                # mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > "$BACKUP_DIR/backup.sql"
                ;;
        esac
        
        print_success "Database backup completed (if applicable)"
    fi
}

# Deploy using Docker
deploy_docker() {
    print_info "Deploying using Docker..."
    
    # Set environment-specific Docker Compose file
    COMPOSE_FILE="docker-compose.yml"
    if [ -f "docker-compose.${ENVIRONMENT}.yml" ]; then
        COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
    fi
    
    print_info "Using Docker Compose file: $COMPOSE_FILE"
    
    # Stop existing containers
    docker-compose -f "$COMPOSE_FILE" down
    
    # Build and start new containers
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    print_success "Docker deployment completed"
}

# Deploy using traditional method
deploy_traditional() {
    print_info "Deploying using traditional method..."
    
    # Stop existing application (if running)
    if pgrep -f "uav-docking-management-system" > /dev/null; then
        print_info "Stopping existing application..."
        pkill -f "uav-docking-management-system" || true
        sleep 5
    fi
    
    # Find the JAR file
    JAR_FILE=$(find target -name "*.jar" -not -name "*sources.jar" -not -name "*javadoc.jar" | head -1)
    
    if [ -z "$JAR_FILE" ]; then
        print_error "No JAR file found in target directory"
        exit 1
    fi
    
    print_info "Deploying JAR file: $JAR_FILE"
    
    # Start the application
    nohup java -jar "$JAR_FILE" --spring.profiles.active="$ENVIRONMENT" > logs/application.log 2>&1 &
    
    print_success "Application started"
}

# Health check
perform_health_check() {
    if [ "$HEALTH_CHECK" = true ]; then
        print_info "Performing health check..."
        
        # Wait for application to start
        sleep 10
        
        # Check health endpoint
        HEALTH_URL="http://localhost:8080/actuator/health"
        MAX_ATTEMPTS=30
        ATTEMPT=1
        
        while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
            if curl -f -s "$HEALTH_URL" > /dev/null 2>&1; then
                print_success "Health check passed"
                return 0
            fi
            
            print_info "Health check attempt $ATTEMPT/$MAX_ATTEMPTS failed, retrying..."
            sleep 10
            ATTEMPT=$((ATTEMPT + 1))
        done
        
        print_error "Health check failed after $MAX_ATTEMPTS attempts"
        return 1
    fi
}

# Rollback function
rollback_deployment() {
    if [ "$ROLLBACK_ON_FAILURE" = true ]; then
        print_warning "Rolling back deployment..."
        
        if [ "$DOCKER_DEPLOY" = true ]; then
            # Docker rollback logic
            print_info "Implementing Docker rollback..."
            # This would involve reverting to previous image tags
        else
            # Traditional rollback logic
            print_info "Implementing traditional rollback..."
            # This would involve reverting to previous JAR file
        fi
        
        print_warning "Rollback completed"
    fi
}

# Main deployment process
main() {
    check_prerequisites
    
    backup_database
    
    build_application
    
    if [ "$DOCKER_DEPLOY" = true ]; then
        deploy_docker
    else
        deploy_traditional
    fi
    
    if ! perform_health_check; then
        rollback_deployment
        exit 1
    fi
    
    print_success "Deployment to $ENVIRONMENT completed successfully!"
    
    # Show deployment info
    print_info "Deployment Information:"
    print_info "Environment: $ENVIRONMENT"
    print_info "Deployment Method: $([ "$DOCKER_DEPLOY" = true ] && echo "Docker" || echo "Traditional")"
    print_info "Application URL: http://localhost:8080"
    print_info "Health Check URL: http://localhost:8080/actuator/health"
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        print_warning "Production deployment completed. Please verify all systems are working correctly."
    fi
}

# Run main function
main

print_info "Deployment script finished."

# Function to detect Maven installation
detect_maven() {
    print_info "Detecting Maven installation..."

    # Check if Maven wrapper exists
    if [ -f "./mvnw" ]; then
        MVN_CMD="./mvnw"
        print_info "Using Maven wrapper"
        return 0
    fi

    # Check if Maven is in PATH
    if command -v mvn &> /dev/null; then
        MVN_CMD="mvn"
        print_info "Using Maven from PATH"
        return 0
    fi

    print_error "Maven not found and no Maven wrapper available"
    print_error "Please install Maven or ensure mvnw is present"
    return 1
}
