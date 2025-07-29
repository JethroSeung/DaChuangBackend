@echo off
setlocal enabledelayedexpansion

REM UAV Docking Management System - Build Script (Windows)
REM This script builds the application with various options

REM Default values
set SKIP_TESTS=false
set CLEAN_BUILD=false
set PROFILE=local
set BUILD_TYPE=package
set DOCKER_BUILD=false
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
echo   -c, --clean          Clean build (mvn clean)
echo   -s, --skip-tests     Skip running tests
echo   -p, --profile PROF   Spring profile (local, dev, prod) [default: local]
echo   -t, --type TYPE      Build type (compile, package, install) [default: package]
echo   -d, --docker         Build Docker image after Maven build
echo.
echo Examples:
echo   %~nx0                           # Standard build with tests
echo   %~nx0 -c -s                     # Clean build, skip tests
echo   %~nx0 -p prod -t install        # Production profile, install to local repo
echo   %~nx0 -d                        # Build and create Docker image
goto :eof

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="-h" set SHOW_HELP=true & shift & goto :parse_args
if "%~1"=="--help" set SHOW_HELP=true & shift & goto :parse_args
if "%~1"=="-c" set CLEAN_BUILD=true & shift & goto :parse_args
if "%~1"=="--clean" set CLEAN_BUILD=true & shift & goto :parse_args
if "%~1"=="-s" set SKIP_TESTS=true & shift & goto :parse_args
if "%~1"=="--skip-tests" set SKIP_TESTS=true & shift & goto :parse_args
if "%~1"=="-p" set PROFILE=%~2 & shift & shift & goto :parse_args
if "%~1"=="--profile" set PROFILE=%~2 & shift & shift & goto :parse_args
if "%~1"=="-t" set BUILD_TYPE=%~2 & shift & shift & goto :parse_args
if "%~1"=="--type" set BUILD_TYPE=%~2 & shift & shift & goto :parse_args
if "%~1"=="-d" set DOCKER_BUILD=true & shift & goto :parse_args
if "%~1"=="--docker" set DOCKER_BUILD=true & shift & goto :parse_args
call :print_error "Unknown option: %~1"
call :show_usage
exit /b 1

:args_done
if "%SHOW_HELP%"=="true" (
    call :show_usage
    exit /b 0
)

REM Validate profile
if not "%PROFILE%"=="local" if not "%PROFILE%"=="dev" if not "%PROFILE%"=="prod" (
    call :print_error "Invalid profile: %PROFILE%. Must be one of: local, dev, prod"
    exit /b 1
)

REM Validate build type
if not "%BUILD_TYPE%"=="compile" if not "%BUILD_TYPE%"=="package" if not "%BUILD_TYPE%"=="install" (
    call :print_error "Invalid build type: %BUILD_TYPE%. Must be one of: compile, package, install"
    exit /b 1
)

call :print_info "Starting UAV Docking Management System build..."
call :print_info "Profile: %PROFILE%"
call :print_info "Build Type: %BUILD_TYPE%"
call :print_info "Skip Tests: %SKIP_TESTS%"
call :print_info "Clean Build: %CLEAN_BUILD%"
call :print_info "Docker Build: %DOCKER_BUILD%"

REM Detect JAVA_HOME and Maven
call :detect_java
if errorlevel 1 exit /b 1

call :detect_maven
if errorlevel 1 exit /b 1

REM Build Maven command
set MVN_ARGS=
if "%CLEAN_BUILD%"=="true" set MVN_ARGS=%MVN_ARGS% clean
set MVN_ARGS=%MVN_ARGS% %BUILD_TYPE%
if "%SKIP_TESTS%"=="true" set MVN_ARGS=%MVN_ARGS% -DskipTests
set MVN_ARGS=%MVN_ARGS% -Dspring.profiles.active=%PROFILE%

REM Execute Maven build
call :print_info "Executing: %MVN_CMD% %MVN_ARGS%"
%MVN_CMD% %MVN_ARGS%
if errorlevel 1 (
    call :print_error "Maven build failed"
    exit /b 1
)
call :print_success "Maven build completed successfully"

REM Build Docker image if requested
if "%DOCKER_BUILD%"=="true" (
    call :build_docker
    if errorlevel 1 exit /b 1
)

call :print_success "Build process completed successfully!"

REM Show build artifacts
if "%BUILD_TYPE%"=="package" (
    call :print_info "Build artifacts:"
    if exist "target\*.jar" (
        dir target\*.jar /b
    ) else (
        call :print_warning "No JAR files found in target directory"
    )
)

call :print_info "Build script finished."
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

REM Try common Java installation paths
for %%p in (
    "C:\Program Files\Java\jdk*\bin\java.exe"
    "C:\Program Files\Eclipse Adoptium\jdk*\bin\java.exe"
    "C:\Program Files\Microsoft\jdk*\bin\java.exe"
    "C:\Program Files (x86)\Java\jdk*\bin\java.exe"
) do (
    for /f "delims=" %%i in ('dir "%%p" /b /od 2^>nul') do (
        set JAVA_CMD=%%i
        call :print_info "Found Java at: %%i"
        goto :java_found
    )
)

call :print_error "Java not found. Please install Java 21 or set JAVA_HOME"
call :print_error "Download from: https://adoptium.net/"
exit /b 1

:java_found
REM Verify Java version
for /f "tokens=3" %%i in ('"%JAVA_CMD%" -version 2^>^&1 ^| findstr "version"') do (
    set JAVA_VERSION=%%i
    set JAVA_VERSION=!JAVA_VERSION:"=!
)
call :print_info "Java version: %JAVA_VERSION%"
exit /b 0

REM Function to detect Maven
:detect_maven
call :print_info "Detecting Maven installation..."

REM Check if mvnw.cmd exists
if exist "..\mvnw.cmd" (
    set MVN_CMD=..\mvnw.cmd
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

REM Check MAVEN_HOME
if defined MAVEN_HOME (
    if exist "%MAVEN_HOME%\bin\mvn.cmd" (
        set MVN_CMD=%MAVEN_HOME%\bin\mvn.cmd
        call :print_info "Using MAVEN_HOME: %MAVEN_HOME%"
        exit /b 0
    )
)

call :print_error "Maven not found and no Maven wrapper available"
call :print_error "Please install Maven or ensure mvnw.cmd is present"
exit /b 1

REM Function to build Docker image
:build_docker
call :print_info "Building Docker image..."

docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker not found"
    exit /b 1
)

REM Get version from pom.xml
for /f "tokens=*" %%i in ('%MVN_CMD% help:evaluate -Dexpression=project.version -q -DforceStdout 2^>nul') do set VERSION=%%i
set IMAGE_NAME=uav-docking-management-system:%VERSION%

docker build -t "%IMAGE_NAME%" .
if errorlevel 1 (
    call :print_error "Docker build failed"
    exit /b 1
)

call :print_success "Docker image built successfully: %IMAGE_NAME%"

REM Also tag as latest
docker tag "%IMAGE_NAME%" "uav-docking-management-system:latest"
call :print_success "Tagged as latest: uav-docking-management-system:latest"
exit /b 0

REM Parse command line arguments
call :parse_args %*
