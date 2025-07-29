#!/bin/bash

# UAV Docking Management System - Build Script
# This script builds the application with various options

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SKIP_TESTS=false
CLEAN_BUILD=false
PROFILE="local"
BUILD_TYPE="package"
DOCKER_BUILD=false

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
    echo "  -c, --clean          Clean build (mvn clean)"
    echo "  -s, --skip-tests     Skip running tests"
    echo "  -p, --profile PROF   Spring profile (local, dev, prod) [default: local]"
    echo "  -t, --type TYPE      Build type (compile, package, install) [default: package]"
    echo "  -d, --docker         Build Docker image after Maven build"
    echo ""
    echo "Examples:"
    echo "  $0                           # Standard build with tests"
    echo "  $0 -c -s                     # Clean build, skip tests"
    echo "  $0 -p prod -t install        # Production profile, install to local repo"
    echo "  $0 -d                        # Build and create Docker image"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -p|--profile)
            PROFILE="$2"
            shift 2
            ;;
        -t|--type)
            BUILD_TYPE="$2"
            shift 2
            ;;
        -d|--docker)
            DOCKER_BUILD=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate profile
if [[ ! "$PROFILE" =~ ^(local|dev|prod)$ ]]; then
    print_error "Invalid profile: $PROFILE. Must be one of: local, dev, prod"
    exit 1
fi

# Validate build type
if [[ ! "$BUILD_TYPE" =~ ^(compile|package|install)$ ]]; then
    print_error "Invalid build type: $BUILD_TYPE. Must be one of: compile, package, install"
    exit 1
fi

print_info "Starting UAV Docking Management System build..."
print_info "Profile: $PROFILE"
print_info "Build Type: $BUILD_TYPE"
print_info "Skip Tests: $SKIP_TESTS"
print_info "Clean Build: $CLEAN_BUILD"
print_info "Docker Build: $DOCKER_BUILD"

# Detect JAVA_HOME and Maven
detect_java
if [ $? -ne 0 ]; then
    exit 1
fi

detect_maven
if [ $? -ne 0 ]; then
    exit 1
fi

# Build Maven command
MVN_ARGS=""

if [ "$CLEAN_BUILD" = true ]; then
    MVN_ARGS="$MVN_ARGS clean"
fi

MVN_ARGS="$MVN_ARGS $BUILD_TYPE"

if [ "$SKIP_TESTS" = true ]; then
    MVN_ARGS="$MVN_ARGS -DskipTests"
fi

MVN_ARGS="$MVN_ARGS -Dspring.profiles.active=$PROFILE"

# Execute Maven build
print_info "Executing: $MVN_CMD $MVN_ARGS"
if $MVN_CMD $MVN_ARGS; then
    print_success "Maven build completed successfully"
else
    print_error "Maven build failed"
    exit 1
fi

# Build Docker image if requested
if [ "$DOCKER_BUILD" = true ]; then
    print_info "Building Docker image..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found"
        exit 1
    fi
    
    # Get version from pom.xml
    VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout)
    IMAGE_NAME="uav-docking-management-system:$VERSION"
    
    if docker build -t "$IMAGE_NAME" .; then
        print_success "Docker image built successfully: $IMAGE_NAME"
        
        # Also tag as latest
        docker tag "$IMAGE_NAME" "uav-docking-management-system:latest"
        print_success "Tagged as latest: uav-docking-management-system:latest"
    else
        print_error "Docker build failed"
        exit 1
    fi
fi

print_success "Build process completed successfully!"

# Show build artifacts
if [ "$BUILD_TYPE" = "package" ] || [ "$BUILD_TYPE" = "install" ]; then
    print_info "Build artifacts:"
    if [ -d "target" ]; then
        ls -la target/*.jar 2>/dev/null || print_warning "No JAR files found in target directory"
    fi
fi

print_info "Build script finished."

# Function to detect Java installation
detect_java() {
    print_info "Detecting Java installation..."

    # Check JAVA_HOME first
    if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
        JAVA_CMD="$JAVA_HOME/bin/java"
        print_info "Using JAVA_HOME: $JAVA_HOME"
        return 0
    elif [ -n "$JAVA_HOME" ]; then
        print_warning "JAVA_HOME is set but java not found at $JAVA_HOME/bin/java"
    fi

    # Try to find Java in PATH
    if command -v java &> /dev/null; then
        JAVA_CMD="java"
        print_info "Using Java from PATH"
        return 0
    fi

    # Try common Java installation paths
    for java_path in \
        "/usr/lib/jvm/java-21-openjdk/bin/java" \
        "/usr/lib/jvm/java-21-openjdk-amd64/bin/java" \
        "/usr/lib/jvm/adoptopenjdk-21-hotspot/bin/java" \
        "/usr/lib/jvm/temurin-21-jdk/bin/java" \
        "/opt/java/openjdk/bin/java" \
        "/Library/Java/JavaVirtualMachines/*/Contents/Home/bin/java" \
        "/System/Library/Java/JavaVirtualMachines/*/Contents/Home/bin/java"; do

        if [ -x "$java_path" ]; then
            JAVA_CMD="$java_path"
            print_info "Found Java at: $java_path"
            return 0
        fi
    done

    # Try to find Java using find command (last resort)
    java_found=$(find /usr -name "java" -type f -executable 2>/dev/null | grep -E "(jdk|jre)" | head -1)
    if [ -n "$java_found" ] && [ -x "$java_found" ]; then
        JAVA_CMD="$java_found"
        print_info "Found Java at: $java_found"
        return 0
    fi

    print_error "Java not found. Please install Java 21 or set JAVA_HOME"
    print_error "Download from: https://adoptium.net/"
    print_error "Or install using package manager:"
    print_error "  Ubuntu/Debian: sudo apt install openjdk-21-jdk"
    print_error "  CentOS/RHEL: sudo yum install java-21-openjdk-devel"
    print_error "  macOS: brew install openjdk@21"
    return 1
}

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

    # Check MAVEN_HOME
    if [ -n "$MAVEN_HOME" ] && [ -x "$MAVEN_HOME/bin/mvn" ]; then
        MVN_CMD="$MAVEN_HOME/bin/mvn"
        print_info "Using MAVEN_HOME: $MAVEN_HOME"
        return 0
    fi

    # Try common Maven installation paths
    for maven_path in \
        "/usr/share/maven/bin/mvn" \
        "/opt/maven/bin/mvn" \
        "/usr/local/maven/bin/mvn" \
        "/usr/local/apache-maven*/bin/mvn"; do

        if [ -x "$maven_path" ]; then
            MVN_CMD="$maven_path"
            print_info "Found Maven at: $maven_path"
            return 0
        fi
    done

    print_error "Maven not found and no Maven wrapper available"
    print_error "Please install Maven or ensure mvnw is present"
    print_error "Download from: https://maven.apache.org/download.cgi"
    print_error "Or install using package manager:"
    print_error "  Ubuntu/Debian: sudo apt install maven"
    print_error "  CentOS/RHEL: sudo yum install maven"
    print_error "  macOS: brew install maven"
    return 1
}
