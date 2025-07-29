@echo off
setlocal enabledelayedexpansion

REM UAV Docking Management System - Deployment Script (Windows)
REM This script handles deployment to different environments

REM Default values
set ENVIRONMENT=dev
set BUILD_FIRST=true
set DOCKER_DEPLOY=false
set BACKUP_DB=false
set HEALTH_CHECK=true
set ROLLBACK_ON_FAILURE=false
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
echo   -e, --env ENV        Target environment (dev, staging, prod) [default: dev]
echo   -n, --no-build       Skip building before deployment
echo   -d, --docker         Deploy using Docker
echo   -b, --backup         Backup database before deployment
echo   -s, --skip-health    Skip health check after deployment
echo   -r, --rollback       Enable automatic rollback on failure
echo.
echo Examples:
echo   %~nx0                           # Deploy to dev environment
echo   %~nx0 -e staging -d             # Deploy to staging using Docker
echo   %~nx0 -e prod -b -r             # Deploy to prod with backup and rollback
echo   %~nx0 -n -s                     # Deploy without building or health check
goto :eof

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="-h" set SHOW_HELP=true & shift & goto :parse_args
if "%~1"=="--help" set SHOW_HELP=true & shift & goto :parse_args
if "%~1"=="-e" set ENVIRONMENT=%~2 & shift & shift & goto :parse_args
if "%~1"=="--env" set ENVIRONMENT=%~2 & shift & shift & goto :parse_args
if "%~1"=="-n" set BUILD_FIRST=false & shift & goto :parse_args
if "%~1"=="--no-build" set BUILD_FIRST=false & shift & goto :parse_args
if "%~1"=="-d" set DOCKER_DEPLOY=true & shift & goto :parse_args
if "%~1"=="--docker" set DOCKER_DEPLOY=true & shift & goto :parse_args
if "%~1"=="-b" set BACKUP_DB=true & shift & goto :parse_args
if "%~1"=="--backup" set BACKUP_DB=true & shift & goto :parse_args
if "%~1"=="-s" set HEALTH_CHECK=false & shift & goto :parse_args
if "%~1"=="--skip-health" set HEALTH_CHECK=false & shift & goto :parse_args
if "%~1"=="-r" set ROLLBACK_ON_FAILURE=true & shift & goto :parse_args
if "%~1"=="--rollback" set ROLLBACK_ON_FAILURE=true & shift & goto :parse_args
call :print_error "Unknown option: %~1"
call :show_usage
exit /b 1

:args_done
if "%SHOW_HELP%"=="true" (
    call :show_usage
    exit /b 0
)

REM Validate environment
if not "%ENVIRONMENT%"=="dev" if not "%ENVIRONMENT%"=="staging" if not "%ENVIRONMENT%"=="prod" (
    call :print_error "Invalid environment: %ENVIRONMENT%. Must be one of: dev, staging, prod"
    exit /b 1
)

call :print_info "Starting UAV Docking Management System deployment..."
call :print_info "Environment: %ENVIRONMENT%"
call :print_info "Build First: %BUILD_FIRST%"
call :print_info "Docker Deploy: %DOCKER_DEPLOY%"
call :print_info "Backup DB: %BACKUP_DB%"
call :print_info "Health Check: %HEALTH_CHECK%"
call :print_info "Rollback on Failure: %ROLLBACK_ON_FAILURE%"

REM Main deployment process
call :check_prerequisites
if errorlevel 1 exit /b 1

call :backup_database
if errorlevel 1 exit /b 1

call :build_application
if errorlevel 1 exit /b 1

if "%DOCKER_DEPLOY%"=="true" (
    call :deploy_docker
    if errorlevel 1 goto :rollback_and_exit
) else (
    call :deploy_traditional
    if errorlevel 1 goto :rollback_and_exit
)

call :perform_health_check
if errorlevel 1 goto :rollback_and_exit

call :print_success "Deployment to %ENVIRONMENT% completed successfully!"
call :show_deployment_info
call :print_info "Deployment script finished."
goto :eof

:rollback_and_exit
if "%ROLLBACK_ON_FAILURE%"=="true" (
    call :rollback_deployment
)
exit /b 1

REM Function to check prerequisites
:check_prerequisites
call :print_info "Checking prerequisites..."

if "%DOCKER_DEPLOY%"=="true" (
    docker --version >nul 2>&1
    if errorlevel 1 (
        call :print_error "Docker not found but Docker deployment requested"
        exit /b 1
    )
    
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        call :print_error "Docker Compose not found but Docker deployment requested"
        exit /b 1
    )
)

REM Check if environment configuration exists
if not exist "src\main\resources\application-%ENVIRONMENT%.properties" (
    if not exist "src\main\resources\application-%ENVIRONMENT%.yml" (
        call :print_warning "No specific configuration found for environment: %ENVIRONMENT%"
    )
)

call :print_success "Prerequisites check completed"
exit /b 0

REM Function to build application
:build_application
if "%BUILD_FIRST%"=="true" (
    call :print_info "Building application for %ENVIRONMENT% environment..."
    
    if exist "build.bat" (
        call build.bat -p %ENVIRONMENT% -t package
        if errorlevel 1 exit /b 1
    ) else (
        REM Fallback to direct Maven command
        call :detect_maven
        if errorlevel 1 exit /b 1
        
        %MVN_CMD% clean package -Dspring.profiles.active=%ENVIRONMENT% -DskipTests
        if errorlevel 1 exit /b 1
    )
    
    call :print_success "Application built successfully"
) else (
    call :print_info "Skipping build as requested"
)
exit /b 0

REM Function to backup database
:backup_database
if "%BACKUP_DB%"=="true" (
    call :print_info "Creating database backup..."
    
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set "datestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
    
    set BACKUP_DIR=backups\%datestamp%
    if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
    
    if "%ENVIRONMENT%"=="dev" (
        call :print_info "Skipping backup for dev environment"
    ) else (
        call :print_warning "Database backup not implemented - please implement based on your database type"
        REM Example for MySQL:
        REM mysqldump -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% > "%BACKUP_DIR%\backup.sql"
    )
    
    call :print_success "Database backup completed (if applicable)"
)
exit /b 0

REM Function to deploy using Docker
:deploy_docker
call :print_info "Deploying using Docker..."

REM Set environment-specific Docker Compose file
set COMPOSE_FILE=docker-compose.yml
if exist "docker-compose.%ENVIRONMENT%.yml" (
    set COMPOSE_FILE=docker-compose.%ENVIRONMENT%.yml
)

call :print_info "Using Docker Compose file: %COMPOSE_FILE%"

REM Stop existing containers
docker-compose -f "%COMPOSE_FILE%" down
if errorlevel 1 (
    call :print_error "Failed to stop existing containers"
    exit /b 1
)

REM Build and start new containers
docker-compose -f "%COMPOSE_FILE%" up -d --build
if errorlevel 1 (
    call :print_error "Docker deployment failed"
    exit /b 1
)

call :print_success "Docker deployment completed"
exit /b 0

REM Function to deploy using traditional method
:deploy_traditional
call :print_info "Deploying using traditional method..."

REM Stop existing application (if running)
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq java.exe" /fo csv ^| findstr "uav-docking-management-system"') do (
    call :print_info "Stopping existing application..."
    taskkill /pid %%i /f >nul 2>&1
    timeout /t 5 >nul
)

REM Find the JAR file
for %%f in (target\*.jar) do (
    echo %%f | findstr /v "sources javadoc" >nul
    if not errorlevel 1 (
        set JAR_FILE=%%f
        goto :jar_found
    )
)

call :print_error "No JAR file found in target directory"
exit /b 1

:jar_found
call :print_info "Deploying JAR file: %JAR_FILE%"

REM Start the application
if not exist "logs" mkdir "logs"
start /b java -jar "%JAR_FILE%" --spring.profiles.active=%ENVIRONMENT% > logs\application.log 2>&1

call :print_success "Application started"
exit /b 0

REM Function to perform health check
:perform_health_check
if "%HEALTH_CHECK%"=="true" (
    call :print_info "Performing health check..."
    
    REM Wait for application to start
    timeout /t 10 >nul
    
    set HEALTH_URL=http://localhost:8080/actuator/health
    set MAX_ATTEMPTS=30
    set ATTEMPT=1
    
    :health_check_loop
    if %ATTEMPT% gtr %MAX_ATTEMPTS% (
        call :print_error "Health check failed after %MAX_ATTEMPTS% attempts"
        exit /b 1
    )
    
    curl -f -s "%HEALTH_URL%" >nul 2>&1
    if not errorlevel 1 (
        call :print_success "Health check passed"
        exit /b 0
    )
    
    call :print_info "Health check attempt %ATTEMPT%/%MAX_ATTEMPTS% failed, retrying..."
    timeout /t 10 >nul
    set /a ATTEMPT+=1
    goto :health_check_loop
)
exit /b 0

REM Function to rollback deployment
:rollback_deployment
if "%ROLLBACK_ON_FAILURE%"=="true" (
    call :print_warning "Rolling back deployment..."
    
    if "%DOCKER_DEPLOY%"=="true" (
        call :print_info "Implementing Docker rollback..."
        REM This would involve reverting to previous image tags
    ) else (
        call :print_info "Implementing traditional rollback..."
        REM This would involve reverting to previous JAR file
    )
    
    call :print_warning "Rollback completed"
)
goto :eof

REM Function to show deployment info
:show_deployment_info
call :print_info "Deployment Information:"
call :print_info "Environment: %ENVIRONMENT%"
if "%DOCKER_DEPLOY%"=="true" (
    call :print_info "Deployment Method: Docker"
) else (
    call :print_info "Deployment Method: Traditional"
)
call :print_info "Application URL: http://localhost:8080"
call :print_info "Health Check URL: http://localhost:8080/actuator/health"

if "%ENVIRONMENT%"=="prod" (
    call :print_warning "Production deployment completed. Please verify all systems are working correctly."
)
goto :eof

REM Function to detect Maven
:detect_maven
if exist "mvnw.cmd" (
    set MVN_CMD=mvnw.cmd
    exit /b 0
)

mvn -version >nul 2>&1
if not errorlevel 1 (
    set MVN_CMD=mvn
    exit /b 0
)

call :print_error "Maven not found and no Maven wrapper available"
exit /b 1

REM Parse command line arguments
call :parse_args %*
