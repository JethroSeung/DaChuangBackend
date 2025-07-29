#!/bin/bash

# UAV Docking Management System - Test Script
# This script runs various types of tests with reporting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
PROFILE="test"
COVERAGE=false
INTEGRATION_TESTS=false
GENERATE_REPORTS=false

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
    echo "  -t, --type TYPE      Test type (unit, integration, all) [default: all]"
    echo "  -p, --profile PROF   Spring profile for tests [default: test]"
    echo "  -c, --coverage       Generate code coverage report"
    echo "  -i, --integration    Run integration tests"
    echo "  -r, --reports        Generate test reports"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all tests"
    echo "  $0 -t unit -c                # Run unit tests with coverage"
    echo "  $0 -i -r                     # Run integration tests with reports"
    echo "  $0 -t all -c -r              # Run all tests with coverage and reports"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -p|--profile)
            PROFILE="$2"
            shift 2
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -i|--integration)
            INTEGRATION_TESTS=true
            shift
            ;;
        -r|--reports)
            GENERATE_REPORTS=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate test type
if [[ ! "$TEST_TYPE" =~ ^(unit|integration|all)$ ]]; then
    print_error "Invalid test type: $TEST_TYPE. Must be one of: unit, integration, all"
    exit 1
fi

print_info "Starting UAV Docking Management System tests..."
print_info "Test Type: $TEST_TYPE"
print_info "Profile: $PROFILE"
print_info "Coverage: $COVERAGE"
print_info "Integration Tests: $INTEGRATION_TESTS"
print_info "Generate Reports: $GENERATE_REPORTS"

# Detect JAVA_HOME and Maven
detect_java
if [ $? -ne 0 ]; then
    exit 1
fi

detect_maven
if [ $? -ne 0 ]; then
    exit 1
fi

# Create test reports directory
if [ "$GENERATE_REPORTS" = true ]; then
    mkdir -p reports/tests
    print_info "Test reports will be saved to reports/tests/"
fi

# Function to run unit tests
run_unit_tests() {
    print_info "Running unit tests..."
    
    MVN_ARGS="test -Dspring.profiles.active=$PROFILE"
    
    if [ "$COVERAGE" = true ]; then
        MVN_ARGS="$MVN_ARGS jacoco:prepare-agent"
    fi
    
    if $MVN_CMD $MVN_ARGS; then
        print_success "Unit tests completed successfully"
        
        if [ "$COVERAGE" = true ]; then
            print_info "Generating coverage report..."
            $MVN_CMD jacoco:report
            print_success "Coverage report generated in target/site/jacoco/"
        fi
        
        return 0
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_info "Running integration tests..."
    
    MVN_ARGS="verify -Dspring.profiles.active=$PROFILE"
    
    if $MVN_CMD $MVN_ARGS; then
        print_success "Integration tests completed successfully"
        return 0
    else
        print_error "Integration tests failed"
        return 1
    fi
}

# Function to generate test reports
generate_reports() {
    print_info "Generating test reports..."
    
    # Copy surefire reports
    if [ -d "target/surefire-reports" ]; then
        cp -r target/surefire-reports/* reports/tests/ 2>/dev/null || true
        print_info "Unit test reports copied to reports/tests/"
    fi
    
    # Copy failsafe reports
    if [ -d "target/failsafe-reports" ]; then
        cp -r target/failsafe-reports/* reports/tests/ 2>/dev/null || true
        print_info "Integration test reports copied to reports/tests/"
    fi
    
    # Copy coverage reports
    if [ -d "target/site/jacoco" ] && [ "$COVERAGE" = true ]; then
        cp -r target/site/jacoco reports/coverage 2>/dev/null || true
        print_info "Coverage reports copied to reports/coverage/"
    fi
}

# Main test execution
TEST_FAILED=false

case $TEST_TYPE in
    "unit")
        run_unit_tests || TEST_FAILED=true
        ;;
    "integration")
        run_integration_tests || TEST_FAILED=true
        ;;
    "all")
        run_unit_tests || TEST_FAILED=true
        if [ "$INTEGRATION_TESTS" = true ] || [ "$TEST_TYPE" = "all" ]; then
            run_integration_tests || TEST_FAILED=true
        fi
        ;;
esac

# Generate reports if requested
if [ "$GENERATE_REPORTS" = true ]; then
    generate_reports
fi

# Final status
if [ "$TEST_FAILED" = true ]; then
    print_error "Some tests failed!"
    exit 1
else
    print_success "All tests passed successfully!"
fi

# Show test results summary
print_info "Test Results Summary:"
if [ -f "target/surefire-reports/TEST-*.xml" ]; then
    UNIT_TESTS=$(find target/surefire-reports -name "TEST-*.xml" | wc -l)
    print_info "Unit test classes: $UNIT_TESTS"
fi

if [ -f "target/failsafe-reports/TEST-*.xml" ]; then
    INTEGRATION_TESTS_COUNT=$(find target/failsafe-reports -name "TEST-*.xml" | wc -l)
    print_info "Integration test classes: $INTEGRATION_TESTS_COUNT"
fi

if [ "$COVERAGE" = true ] && [ -f "target/site/jacoco/index.html" ]; then
    print_info "Coverage report available at: target/site/jacoco/index.html"
fi

print_info "Test script finished."

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

    print_error "Java not found. Please install Java 21 or set JAVA_HOME"
    print_error "Download from: https://adoptium.net/"
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

    print_error "Maven not found and no Maven wrapper available"
    print_error "Please install Maven or ensure mvnw is present"
    return 1
}
