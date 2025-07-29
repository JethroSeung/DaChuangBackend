# Database Schema Documentation

## Overview

The UAV Docking Management System uses a relational database design optimized for UAV fleet management, real-time location tracking, and operational analytics. The schema is designed for MySQL 8.0 with support for spatial data, JSON columns, and advanced indexing strategies.

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      UAV        │    │     Region      │    │  LocationHistory│
│                 │    │                 │    │                 │
│ PK: id          │    │ PK: id          │    │ PK: id          │
│    rfid_tag     │    │    region_name  │    │ FK: uav_id      │
│    owner_name   │    │                 │    │    timestamp    │
│    model        │    │                 │    │    latitude     │
│    status       │    │                 │    │    longitude    │
│    ...          │    │                 │    │    altitude     │
└─────────────────┘    └─────────────────┘    │    ...          │
         │                       │             └─────────────────┘
         │                       │                      │
         │              ┌─────────────────┐             │
         │              │   uav_regions   │             │
         │              │                 │             │
         └──────────────┤ FK: uav_id      │             │
                        │ FK: region_id   │             │
                        └─────────────────┘             │
                                 │                      │
                                 └──────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FlightLog     │    │ MaintenanceRec  │    │  BatteryStatus  │
│                 │    │                 │    │                 │
│ PK: id          │    │ PK: id          │    │ PK: id          │
│ FK: uav_id      │    │ FK: uav_id      │    │ FK: uav_id      │
│    start_time   │    │    type         │    │    level        │
│    end_time     │    │    scheduled    │    │    voltage      │
│    duration     │    │    completed    │    │    temperature  │
│    distance     │    │    status       │    │    is_charging  │
│    ...          │    │    ...          │    │    ...          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌─────────────────┐
                        │      UAV        │
                        │                 │
                        │ (Central Entity)│
                        └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  DockingStation │    │    Geofence     │    │    ApiKey       │
│                 │    │                 │    │                 │
│ PK: id          │    │ PK: id          │    │ PK: id          │
│    name         │    │    name         │    │    key_value    │
│    latitude     │    │    fence_type   │    │    user_id      │
│    longitude    │    │    boundary     │    │    permissions  │
│    capacity     │    │    center_lat   │    │    expires_at   │
│    status       │    │    center_lon   │    │    ...          │
│    ...          │    │    radius       │    │                 │
└─────────────────┘    │    ...          │    └─────────────────┘
                       └─────────────────┘
```

## Core Tables

### 1. UAV Table

The central entity representing unmanned aerial vehicles.

```sql
CREATE TABLE uav (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_tag VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique RFID identifier',
    owner_name VARCHAR(100) NOT NULL COMMENT 'UAV owner or operator name',
    model VARCHAR(100) NOT NULL COMMENT 'UAV model designation',
    status ENUM('AUTHORIZED', 'UNAUTHORIZED') NOT NULL DEFAULT 'UNAUTHORIZED',
    operational_status ENUM('READY', 'IN_FLIGHT', 'MAINTENANCE', 'OFFLINE', 'HIBERNATING', 'OUT_OF_SERVICE') DEFAULT 'READY',
    in_hibernate_pod BOOLEAN DEFAULT FALSE COMMENT 'Whether UAV is in hibernate pod',
    
    -- Physical specifications
    serial_number VARCHAR(50) UNIQUE COMMENT 'Manufacturer serial number',
    manufacturer VARCHAR(50) COMMENT 'UAV manufacturer',
    weight_kg DECIMAL(5,2) COMMENT 'UAV weight in kilograms',
    max_flight_time_minutes INT COMMENT 'Maximum flight time in minutes',
    max_altitude_meters INT COMMENT 'Maximum operational altitude',
    max_speed_kmh INT COMMENT 'Maximum speed in km/h',
    
    -- Operational metrics
    total_flight_hours INT DEFAULT 0 COMMENT 'Total accumulated flight hours',
    total_flight_cycles INT DEFAULT 0 COMMENT 'Total number of flight cycles',
    last_maintenance_date TIMESTAMP NULL COMMENT 'Date of last maintenance',
    next_maintenance_due TIMESTAMP NULL COMMENT 'Next scheduled maintenance date',
    
    -- Current location data
    current_latitude DECIMAL(10,8) COMMENT 'Current latitude position',
    current_longitude DECIMAL(11,8) COMMENT 'Current longitude position',
    current_altitude_meters DECIMAL(8,2) COMMENT 'Current altitude in meters',
    last_location_update TIMESTAMP NULL COMMENT 'Timestamp of last location update',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_rfid_tag (rfid_tag),
    INDEX idx_status (status),
    INDEX idx_operational_status (operational_status),
    INDEX idx_location (current_latitude, current_longitude),
    INDEX idx_last_update (last_location_update),
    INDEX idx_manufacturer_model (manufacturer, model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Region Table

Defines geographical regions for access control.

```sql
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Human-readable region name',
    description TEXT COMMENT 'Detailed region description',
    
    -- Geographical boundaries (simplified - could be expanded to polygon)
    center_latitude DECIMAL(10,8) COMMENT 'Region center latitude',
    center_longitude DECIMAL(11,8) COMMENT 'Region center longitude',
    radius_meters DECIMAL(10,2) COMMENT 'Region radius in meters',
    
    -- Access control
    access_level ENUM('PUBLIC', 'RESTRICTED', 'CLASSIFIED') DEFAULT 'PUBLIC',
    requires_authorization BOOLEAN DEFAULT TRUE,
    
    -- Operational parameters
    max_altitude_meters INT COMMENT 'Maximum allowed altitude in region',
    operating_hours VARCHAR(100) COMMENT 'Allowed operating hours (e.g., 08:00-18:00)',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) COMMENT 'User who created the region',
    
    INDEX idx_region_name (region_name),
    INDEX idx_access_level (access_level),
    INDEX idx_location (center_latitude, center_longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. UAV-Region Association Table

Many-to-many relationship between UAVs and authorized regions.

```sql
CREATE TABLE uav_regions (
    uav_id INT NOT NULL,
    region_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100) COMMENT 'User who made the assignment',
    expires_at TIMESTAMP NULL COMMENT 'Optional expiration date for access',
    notes TEXT COMMENT 'Additional notes about the assignment',
    
    PRIMARY KEY (uav_id, region_id),
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    
    INDEX idx_uav_id (uav_id),
    INDEX idx_region_id (region_id),
    INDEX idx_assigned_at (assigned_at),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Location History Table

Tracks historical location data for all UAVs.

```sql
CREATE TABLE location_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uav_id INT NOT NULL,
    flight_log_id BIGINT NULL COMMENT 'Optional association with flight log',
    
    -- Timestamp and location data
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10,8) NOT NULL COMMENT 'GPS latitude',
    longitude DECIMAL(11,8) NOT NULL COMMENT 'GPS longitude',
    altitude_meters DECIMAL(8,2) COMMENT 'Altitude above sea level',
    
    -- Movement data
    speed_kmh DECIMAL(6,2) COMMENT 'Speed in kilometers per hour',
    heading_degrees DECIMAL(5,2) COMMENT 'Heading in degrees (0-360)',
    
    -- System data
    battery_level INT COMMENT 'Battery percentage (0-100)',
    location_source ENUM('GPS', 'CELLULAR', 'WIFI', 'MANUAL', 'ESTIMATED', 'RADAR') DEFAULT 'GPS',
    accuracy_meters DECIMAL(6,2) COMMENT 'Location accuracy in meters',
    signal_strength INT COMMENT 'GPS signal strength',
    
    -- Environmental data
    weather_conditions VARCHAR(100) COMMENT 'Weather conditions at time of reading',
    temperature_celsius DECIMAL(4,1) COMMENT 'Ambient temperature',
    wind_speed_kmh DECIMAL(5,2) COMMENT 'Wind speed',
    wind_direction_degrees DECIMAL(5,2) COMMENT 'Wind direction',
    
    -- Additional metadata
    notes VARCHAR(300) COMMENT 'Additional notes or observations',
    
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    FOREIGN KEY (flight_log_id) REFERENCES flight_logs(id) ON DELETE SET NULL,
    
    -- Performance indexes
    INDEX idx_uav_timestamp (uav_id, timestamp),
    INDEX idx_timestamp (timestamp),
    INDEX idx_location (latitude, longitude),
    INDEX idx_flight_log (flight_log_id),
    
    -- Partitioning by month for performance (optional)
    PARTITION BY RANGE (YEAR(timestamp) * 100 + MONTH(timestamp)) (
        PARTITION p202401 VALUES LESS THAN (202402),
        PARTITION p202402 VALUES LESS THAN (202403),
        -- Add more partitions as needed
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Flight Logs Table

Records complete flight sessions with start/end times and metrics.

```sql
CREATE TABLE flight_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uav_id INT NOT NULL,
    
    -- Flight timing
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration_minutes INT GENERATED ALWAYS AS (
        CASE 
            WHEN end_time IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, start_time, end_time)
            ELSE NULL 
        END
    ) STORED COMMENT 'Calculated flight duration',
    
    -- Flight metrics
    distance_km DECIMAL(8,2) COMMENT 'Total distance traveled',
    max_altitude_meters DECIMAL(8,2) COMMENT 'Maximum altitude reached',
    average_speed_kmh DECIMAL(6,2) COMMENT 'Average speed during flight',
    max_speed_kmh DECIMAL(6,2) COMMENT 'Maximum speed reached',
    
    -- Battery metrics
    start_battery_level INT COMMENT 'Battery level at flight start',
    end_battery_level INT COMMENT 'Battery level at flight end',
    battery_consumption_percent INT GENERATED ALWAYS AS (
        CASE 
            WHEN start_battery_level IS NOT NULL AND end_battery_level IS NOT NULL
            THEN start_battery_level - end_battery_level
            ELSE NULL 
        END
    ) STORED,
    
    -- Location data
    start_location_lat DECIMAL(10,8) COMMENT 'Starting latitude',
    start_location_lon DECIMAL(11,8) COMMENT 'Starting longitude',
    end_location_lat DECIMAL(10,8) COMMENT 'Ending latitude',
    end_location_lon DECIMAL(11,8) COMMENT 'Ending longitude',
    
    -- Flight details
    flight_purpose VARCHAR(200) COMMENT 'Purpose or mission of the flight',
    pilot_name VARCHAR(100) COMMENT 'Name of the pilot or operator',
    weather_conditions VARCHAR(200) COMMENT 'Weather conditions during flight',
    flight_mode ENUM('MANUAL', 'AUTONOMOUS', 'ASSISTED') DEFAULT 'MANUAL',
    
    -- Status and notes
    status ENUM('ACTIVE', 'COMPLETED', 'ABORTED', 'EMERGENCY_LANDING') DEFAULT 'ACTIVE',
    notes TEXT COMMENT 'Additional flight notes or observations',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    
    INDEX idx_uav_start_time (uav_id, start_time),
    INDEX idx_start_time (start_time),
    INDEX idx_status (status),
    INDEX idx_pilot (pilot_name),
    INDEX idx_duration (duration_minutes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. Maintenance Records Table

Tracks all maintenance activities for UAVs.

```sql
CREATE TABLE maintenance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uav_id INT NOT NULL,
    
    -- Maintenance details
    maintenance_type ENUM('ROUTINE', 'REPAIR', 'UPGRADE', 'INSPECTION', 'EMERGENCY') NOT NULL,
    description TEXT NOT NULL COMMENT 'Detailed description of maintenance work',
    
    -- Scheduling
    scheduled_date DATE NOT NULL COMMENT 'Originally scheduled date',
    completed_date DATE NULL COMMENT 'Actual completion date',
    estimated_duration_hours DECIMAL(4,1) COMMENT 'Estimated time required',
    actual_duration_hours DECIMAL(4,1) COMMENT 'Actual time taken',
    
    -- Status and priority
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE') DEFAULT 'SCHEDULED',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    
    -- Personnel and costs
    technician VARCHAR(100) COMMENT 'Technician performing maintenance',
    supervisor VARCHAR(100) COMMENT 'Supervising engineer',
    cost DECIMAL(10,2) COMMENT 'Total maintenance cost',
    
    -- Parts and components
    parts_replaced JSON COMMENT 'JSON array of replaced parts with details',
    
    -- Documentation
    work_order_number VARCHAR(50) COMMENT 'External work order reference',
    certification_required BOOLEAN DEFAULT FALSE,
    certification_number VARCHAR(100) COMMENT 'Certification reference if required',
    
    -- Notes and attachments
    notes TEXT COMMENT 'Additional maintenance notes',
    attachments JSON COMMENT 'JSON array of attachment file references',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    
    INDEX idx_uav_scheduled (uav_id, scheduled_date),
    INDEX idx_status (status),
    INDEX idx_type (maintenance_type),
    INDEX idx_priority (priority),
    INDEX idx_technician (technician),
    INDEX idx_overdue (status, scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Supporting Tables

### 7. Battery Status Table

Real-time battery monitoring for each UAV.

```sql
CREATE TABLE battery_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uav_id INT UNIQUE NOT NULL,
    
    -- Current status
    current_level INT NOT NULL COMMENT 'Current battery percentage (0-100)',
    voltage DECIMAL(4,2) COMMENT 'Current voltage reading',
    temperature_celsius DECIMAL(4,1) COMMENT 'Battery temperature',
    
    -- Charging information
    is_charging BOOLEAN DEFAULT FALSE,
    charge_rate_watts DECIMAL(6,2) COMMENT 'Current charging rate in watts',
    estimated_time_to_full_minutes INT COMMENT 'Estimated time to full charge',
    
    -- Battery health
    cycle_count INT DEFAULT 0 COMMENT 'Number of charge/discharge cycles',
    health_percentage INT DEFAULT 100 COMMENT 'Battery health (0-100)',
    capacity_mah INT COMMENT 'Current capacity in mAh',
    design_capacity_mah INT COMMENT 'Original design capacity in mAh',
    
    -- Timestamps
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_charged TIMESTAMP NULL COMMENT 'Last time battery was fully charged',
    
    FOREIGN KEY (uav_id) REFERENCES uav(id) ON DELETE CASCADE,
    
    INDEX idx_level (current_level),
    INDEX idx_charging (is_charging),
    INDEX idx_health (health_percentage),
    INDEX idx_last_updated (last_updated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8. Docking Stations Table

Physical docking stations for UAV storage and charging.

```sql
CREATE TABLE docking_stations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Location
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude_meters DECIMAL(8,2),
    address TEXT COMMENT 'Physical address of the station',
    
    -- Capacity and status
    capacity INT NOT NULL DEFAULT 1 COMMENT 'Maximum number of UAVs',
    current_occupancy INT DEFAULT 0 COMMENT 'Current number of docked UAVs',
    status ENUM('OPERATIONAL', 'MAINTENANCE', 'OFFLINE', 'FULL') DEFAULT 'OPERATIONAL',
    
    -- Station specifications
    station_type ENUM('CHARGING', 'MAINTENANCE', 'STORAGE', 'MULTI_PURPOSE') DEFAULT 'CHARGING',
    power_capacity_watts INT COMMENT 'Total power capacity for charging',
    charging_ports JSON COMMENT 'JSON array of charging port specifications',
    
    -- Operational details
    operational_hours VARCHAR(100) DEFAULT '24/7' COMMENT 'Operating hours',
    access_code VARCHAR(20) COMMENT 'Access code for automated systems',
    contact_info VARCHAR(200) COMMENT 'Contact information for the station',
    
    -- Environmental monitoring
    temperature_celsius DECIMAL(4,1) COMMENT 'Current ambient temperature',
    humidity_percent INT COMMENT 'Current humidity level',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_maintenance TIMESTAMP NULL,
    
    INDEX idx_location (latitude, longitude),
    INDEX idx_status (status),
    INDEX idx_type (station_type),
    INDEX idx_capacity (capacity, current_occupancy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9. Geofences Table

Geographical boundaries and restrictions.

```sql
CREATE TABLE geofences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Fence geometry
    fence_type ENUM('CIRCULAR', 'POLYGON') NOT NULL DEFAULT 'CIRCULAR',
    boundary_type ENUM('INCLUSION', 'EXCLUSION') NOT NULL DEFAULT 'INCLUSION',
    
    -- Circular fence parameters
    center_latitude DECIMAL(10,8) COMMENT 'Center latitude for circular fences',
    center_longitude DECIMAL(11,8) COMMENT 'Center longitude for circular fences',
    radius_meters DECIMAL(10,2) COMMENT 'Radius in meters for circular fences',
    
    -- Polygon fence parameters
    polygon_coordinates JSON COMMENT 'JSON array of [lat,lon] coordinates for polygon',
    
    -- Altitude restrictions
    min_altitude_meters DECIMAL(8,2) DEFAULT 0,
    max_altitude_meters DECIMAL(8,2) DEFAULT 120,
    
    -- Status and priority
    status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
    priority_level INT DEFAULT 1 COMMENT 'Higher number = higher priority',
    
    -- Violation handling
    violation_action VARCHAR(50) DEFAULT 'ALERT' COMMENT 'Action to take on violation',
    notification_emails TEXT COMMENT 'Comma-separated email list for notifications',
    
    -- Time-based restrictions
    active_from TIMESTAMP NULL COMMENT 'Start time for time-based geofences',
    active_until TIMESTAMP NULL COMMENT 'End time for time-based geofences',
    days_of_week VARCHAR(20) COMMENT 'Active days (e.g., MON,TUE,WED)',
    time_from TIME COMMENT 'Daily start time',
    time_until TIME COMMENT 'Daily end time',
    
    -- Statistics
    total_violations INT DEFAULT 0,
    last_violation_time TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    INDEX idx_name (name),
    INDEX idx_type (fence_type),
    INDEX idx_status (status),
    INDEX idx_center (center_latitude, center_longitude),
    INDEX idx_active_period (active_from, active_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Indexes and Performance Optimization

### Primary Indexes
- All tables have optimized primary keys with AUTO_INCREMENT
- Composite indexes on frequently queried column combinations
- Spatial indexes for geographical queries (future enhancement)

### Query Optimization Strategies
1. **Location Queries**: Composite indexes on (latitude, longitude)
2. **Time-based Queries**: Indexes on timestamp columns with partitioning
3. **Status Filtering**: Indexes on status and operational_status columns
4. **Foreign Key Performance**: Indexes on all foreign key columns

### Partitioning Strategy
- `location_history` table partitioned by month for better performance
- Consider partitioning `flight_logs` by year for large datasets

## Data Integrity Constraints

### Foreign Key Constraints
- Cascade deletes for dependent data (location_history, flight_logs)
- Restrict deletes for reference data (regions)

### Check Constraints
```sql
-- Battery level validation
ALTER TABLE battery_status ADD CONSTRAINT chk_battery_level 
CHECK (current_level >= 0 AND current_level <= 100);

-- Coordinate validation
ALTER TABLE uav ADD CONSTRAINT chk_latitude 
CHECK (current_latitude >= -90 AND current_latitude <= 90);

ALTER TABLE uav ADD CONSTRAINT chk_longitude 
CHECK (current_longitude >= -180 AND current_longitude <= 180);
```

### Triggers for Data Consistency
```sql
-- Update UAV location when new location history is inserted
DELIMITER //
CREATE TRIGGER update_uav_location 
AFTER INSERT ON location_history
FOR EACH ROW
BEGIN
    UPDATE uav 
    SET current_latitude = NEW.latitude,
        current_longitude = NEW.longitude,
        current_altitude_meters = NEW.altitude_meters,
        last_location_update = NEW.timestamp
    WHERE id = NEW.uav_id;
END//
DELIMITER ;
```

This schema provides a robust foundation for the UAV management system with proper normalization, performance optimization, and data integrity constraints.
