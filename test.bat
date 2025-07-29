@echo off
setlocal enabledelayedexpansion

REM UAV Docking Management System - Test Script (Windows)
REM This script runs various types of tests with reporting

REM Default values
set TEST_TYPE=all
set PROFILE=test
set COVERAGE=false
set INTEGRATION_TESTS=false
set GENERATE_REPORTS=false
set SHOW_HELP=false

REM Colors for output (Windows compatible)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Function to print colored output
:print_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to show usage
:show_usage
echo Usage: %~nx0 [OPTIONS]
echo.
echo Options:
echo   -h, --help           Show this help message
echo   -t, --type TYPE      Test type (unit, integration, all) [default: all]
echo   -p, --profile PROF   Spring profile for tests [default: test]
echo   -c, --coverage       Generate code coverage report
echo   -i, --integration    Run integration tests
echo   -r, --reports        Generate test reports
echo.
echo Examples:
echo   %~nx0                           # Run all tests
echo   %~nx0 -t unit -c                # Run unit tests with coverage
echo   %~nx0 -i -r                     # Run integration tests with reports
echo   %~nx0 -t all -c -r              # Run all tests with coverage and reports
goto :eof

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="-h" set SHOW_HELP=true & shift & goto :parse_args
if "%~1"=="--help" set SHOW_HELP=true & shift & goto :parse_args
if "%~1"=="-t" set TEST_TYPE=%~2 & shift & shift & goto :parse_args
if "%~1"=="--type" set TEST_TYPE=%~2 & shift & shift & goto :parse_args
if "%~1"=="-p" set PROFILE=%~2 & shift & shift & goto :parse_args
if "%~1"=="--profile" set PROFILE=%~2 & shift & shift & goto :parse_args
if "%~1"=="-c" set COVERAGE=true & shift & goto :parse_args
if "%~1"=="--coverage" set COVERAGE=true & shift & goto :parse_args
if "%~1"=="-i" set INTEGRATION_TESTS=true & shift & goto :parse_args
if "%~1"=="--integration" set INTEGRATION_TESTS=true & shift & goto :parse_args
if "%~1"=="-r" set GENERATE_REPORTS=true & shift & goto :parse_args
if "%~1"=="--reports" set GENERATE_REPORTS=true & shift & goto :parse_args
call :print_error "Unknown option: %~1"
call :show_usage
exit /b 1

:args_done
if "%SHOW_HELP%"=="true" (
    call :show_usage
    exit /b 0
)

REM Validate test type
if not "%TEST_TYPE%"=="unit" if not "%TEST_TYPE%"=="integration" if not "%TEST_TYPE%"=="all" (
    call :print_error "Invalid test type: %TEST_TYPE%. Must be one of: unit, integration, all"
    exit /b 1
)

call :print_info "Starting UAV Docking Management System tests..."
call :print_info "Test Type: %TEST_TYPE%"
call :print_info "Profile: %PROFILE%"
call :print_info "Coverage: %COVERAGE%"
call :print_info "Integration Tests: %INTEGRATION_TESTS%"
call :print_info "Generate Reports: %GENERATE_REPORTS%"

REM Detect JAVA_HOME and Maven
call :detect_java
if errorlevel 1 exit /b 1

call :detect_maven
if errorlevel 1 exit /b 1

REM Create test reports directory
if "%GENERATE_REPORTS%"=="true" (
    if not exist "reports\tests" mkdir "reports\tests"
    call :print_info "Test reports will be saved to reports\tests\"
)

REM Main test execution
set TEST_FAILED=false

if "%TEST_TYPE%"=="unit" (
    call :run_unit_tests
    if errorlevel 1 set TEST_FAILED=true
) else if "%TEST_TYPE%"=="integration" (
    call :run_integration_tests
    if errorlevel 1 set TEST_FAILED=true
) else if "%TEST_TYPE%"=="all" (
    call :run_unit_tests
    if errorlevel 1 set TEST_FAILED=true
    if "%INTEGRATION_TESTS%"=="true" (
        call :run_integration_tests
        if errorlevel 1 set TEST_FAILED=true
    )
)

REM Generate reports if requested
if "%GENERATE_REPORTS%"=="true" (
    call :generate_reports
)

REM Final status
if "%TEST_FAILED%"=="true" (
    call :print_error "Some tests failed!"
    exit /b 1
) else (
    call :print_success "All tests passed successfully!"
)

REM Show test results summary
call :show_test_summary

call :print_info "Test script finished."
goto :eof

REM Function to run unit tests
:run_unit_tests
call :print_info "Running unit tests..."

set MVN_ARGS=test -Dspring.profiles.active=%PROFILE%
if "%COVERAGE%"=="true" set MVN_ARGS=%MVN_ARGS% jacoco:prepare-agent

%MVN_CMD% %MVN_ARGS%
if errorlevel 1 (
    call :print_error "Unit tests failed"
    exit /b 1
)

call :print_success "Unit tests completed successfully"

if "%COVERAGE%"=="true" (
    call :print_info "Generating coverage report..."
    %MVN_CMD% jacoco:report
    if not errorlevel 1 (
        call :print_success "Coverage report generated in target\site\jacoco\"
    )
)
exit /b 0

REM Function to run integration tests
:run_integration_tests
call :print_info "Running integration tests..."

set MVN_ARGS=verify -Dspring.profiles.active=%PROFILE%

%MVN_CMD% %MVN_ARGS%
if errorlevel 1 (
    call :print_error "Integration tests failed"
    exit /b 1
)

call :print_success "Integration tests completed successfully"
exit /b 0

REM Function to generate test reports
:generate_reports
call :print_info "Generating test reports..."

REM Copy surefire reports
if exist "target\surefire-reports" (
    xcopy "target\surefire-reports\*" "reports\tests\" /s /y >nul 2>&1
    call :print_info "Unit test reports copied to reports\tests\"
)

REM Copy failsafe reports
if exist "target\failsafe-reports" (
    xcopy "target\failsafe-reports\*" "reports\tests\" /s /y >nul 2>&1
    call :print_info "Integration test reports copied to reports\tests\"
)

REM Copy coverage reports
if exist "target\site\jacoco" if "%COVERAGE%"=="true" (
    if not exist "reports\coverage" mkdir "reports\coverage"
    xcopy "target\site\jacoco\*" "reports\coverage\" /s /y >nul 2>&1
    call :print_info "Coverage reports copied to reports\coverage\"
)
goto :eof

REM Function to show test summary
:show_test_summary
call :print_info "Test Results Summary:"

if exist "target\surefire-reports\TEST-*.xml" (
    for /f %%i in ('dir "target\surefire-reports\TEST-*.xml" /b 2^>nul ^| find /c /v ""') do (
        call :print_info "Unit test classes: %%i"
    )
)

if exist "target\failsafe-reports\TEST-*.xml" (
    for /f %%i in ('dir "target\failsafe-reports\TEST-*.xml" /b 2^>nul ^| find /c /v ""') do (
        call :print_info "Integration test classes: %%i"
    )
)

if "%COVERAGE%"=="true" if exist "target\site\jacoco\index.html" (
    call :print_info "Coverage report available at: target\site\jacoco\index.html"
)
goto :eof

REM Function to detect Java
:detect_java
call :print_info "Detecting Java installation..."

REM Check JAVA_HOME first
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" (
        set JAVA_CMD=%JAVA_HOME%\bin\java.exe
        call :print_info "Using JAVA_HOME: %JAVA_HOME%"
        goto :java_found
    ) else (
        call :print_warning "JAVA_HOME is set but java.exe not found at %JAVA_HOME%\bin\java.exe"
    )
)

REM Try to find Java in PATH
java -version >nul 2>&1
if not errorlevel 1 (
    set JAVA_CMD=java
    call :print_info "Using Java from PATH"
    goto :java_found
)

call :print_error "Java not found. Please install Java 21 or set JAVA_HOME"
exit /b 1

:java_found
exit /b 0

REM Function to detect Maven
:detect_maven
call :print_info "Detecting Maven installation..."

REM Check if mvnw.cmd exists
if exist "mvnw.cmd" (
    set MVN_CMD=mvnw.cmd
    call :print_info "Using Maven wrapper"
    exit /b 0
)

REM Check if Maven is in PATH
mvn -version >nul 2>&1
if not errorlevel 1 (
    set MVN_CMD=mvn
    call :print_info "Using Maven from PATH"
    exit /b 0
)

call :print_error "Maven not found and no Maven wrapper available"
exit /b 1

REM Parse command line arguments
call :parse_args %*
