# Project Structure Guide

This document describes the reorganized project structure for the UAV Docking Management System.

## 📁 Directory Structure

```
DaChuangBackend/
├── 📁 docker/                    # Docker configuration files
│   ├── Dockerfile                # Main application Dockerfile
│   ├── Dockerfile.mysql          # MySQL-specific Dockerfile
│   └── docker-compose.yml        # Docker Compose configuration
├── 📁 scripts/                   # Build and deployment scripts
│   ├── build.bat                 # Windows build script
│   ├── build.sh                  # Unix/Linux build script
│   ├── deploy.bat                # Windows deployment script
│   ├── deploy.sh                 # Unix/Linux deployment script
│   ├── test.bat                  # Windows test script
│   ├── test.sh                   # Unix/Linux test script
│   ├── run-tests.bat             # Windows test runner
│   └── clean-orphans.sh          # Cleanup script
├── 📁 src/                       # Java source code
│   ├── main/java/com/example/uavdockingmanagementsystem/
│   └── test/java/com/example/uavdockingmanagementsystem/
├── 📁 frontend/                  # Next.js frontend application
├── 📁 docs/                      # Project documentation
├── 📁 db/                        # Database scripts and migrations
├── 📁 images/                    # Project images and assets
├── pom.xml                       # Maven configuration
├── mvnw, mvnw.cmd               # Maven wrapper
└── README.md                     # Main project documentation
```

## 🔄 Changes Made

### Phase 1: Cleanup
- ✅ Removed duplicate POM files (`pom.xml.backup`, `pom.xml.fixed`)
- ✅ Removed redundant Maven installation (`apache-maven-3.9.6/`, `maven.zip`)
- ✅ Removed build artifacts (`target/` directory)
- ✅ Removed frontend dependencies (`node_modules/`, `coverage/`)
- ✅ Removed runtime logs (`logs/` directory)

### Phase 2: Reorganization
- ✅ Created `docker/` directory for all Docker-related files
- ✅ Created `scripts/` directory for all build/deployment scripts
- ✅ Updated `docker-compose.yml` to reference correct paths
- ✅ Updated build scripts to work from new locations

## 🚀 Usage

### Building the Application

From the project root:
```bash
# Using scripts (recommended)
./scripts/build.sh

# Or directly with Maven wrapper
./mvnw clean package
```

### Running with Docker

From the project root:
```bash
# Build and run with Docker Compose
cd docker
docker-compose up --build

# Or build Docker image manually
docker build -f docker/Dockerfile -t uav-management .
```

### Running Scripts

All scripts are now located in the `scripts/` directory:
```bash
# Build the application
./scripts/build.sh

# Run tests
./scripts/test.sh

# Deploy the application
./scripts/deploy.sh
```

## 📋 Benefits

1. **Cleaner Root Directory**: Main project files are more visible
2. **Organized Docker Files**: All containerization files in one place
3. **Centralized Scripts**: All automation scripts easily accessible
4. **Reduced Redundancy**: ~500MB of duplicate files removed
5. **Better Maintainability**: Logical grouping of related files

## 🔧 Migration Notes

- All Docker commands should be run from the project root, not the `docker/` directory
- Build scripts automatically detect the new structure
- No changes needed to IDE configurations or Maven settings
- Git history is preserved for all moved files

## 📝 Next Steps

Consider these additional improvements:
1. Package refactoring: `com.example` → `com.uav.dockingmanagement`
2. Frontend optimization: Bundle analysis and performance improvements
3. Documentation consolidation: Merge redundant documentation files
