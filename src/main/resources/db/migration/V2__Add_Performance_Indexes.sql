-- Performance optimization indexes for UAV Docking Management System
-- These indexes improve query performance for commonly used operations

-- UAV table indexes
CREATE INDEX IF NOT EXISTS idx_uav_rfid_tag ON uav(rfid_tag);
CREATE INDEX IF NOT EXISTS idx_uav_status ON uav(status);
CREATE INDEX IF NOT EXISTS idx_uav_operational_status ON uav(operational_status);
CREATE INDEX IF NOT EXISTS idx_uav_hibernate_pod ON uav(in_hibernate_pod);
CREATE INDEX IF NOT EXISTS idx_uav_location ON uav(current_latitude, current_longitude);
CREATE INDEX IF NOT EXISTS idx_uav_last_update ON uav(last_location_update);

-- Location History table indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_location_history_uav_id ON location_history(uav_id);
CREATE INDEX IF NOT EXISTS idx_location_history_timestamp ON location_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_history_uav_timestamp ON location_history(uav_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_location_history_coordinates ON location_history(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_location_history_geospatial ON location_history(latitude, longitude, timestamp);

-- Flight Log table indexes
CREATE INDEX IF NOT EXISTS idx_flight_log_uav_id ON flight_logs(uav_id);
CREATE INDEX IF NOT EXISTS idx_flight_log_created_at ON flight_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_flight_log_status ON flight_logs(flight_status);
CREATE INDEX IF NOT EXISTS idx_flight_log_start_location ON flight_logs(start_latitude, start_longitude);
CREATE INDEX IF NOT EXISTS idx_flight_log_end_location ON flight_logs(end_latitude, end_longitude);
CREATE INDEX IF NOT EXISTS idx_flight_log_duration ON flight_logs(flight_duration_minutes);

-- Docking Record table indexes
CREATE INDEX IF NOT EXISTS idx_docking_record_uav_id ON docking_records(uav_id);
CREATE INDEX IF NOT EXISTS idx_docking_record_station_id ON docking_records(docking_station_id);
CREATE INDEX IF NOT EXISTS idx_docking_record_dock_time ON docking_records(dock_time);
CREATE INDEX IF NOT EXISTS idx_docking_record_undock_time ON docking_records(undock_time);
CREATE INDEX IF NOT EXISTS idx_docking_record_status ON docking_records(status);

-- Docking Station table indexes
CREATE INDEX IF NOT EXISTS idx_docking_station_location ON docking_stations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_docking_station_status ON docking_stations(status);
CREATE INDEX IF NOT EXISTS idx_docking_station_capacity ON docking_stations(current_occupancy, total_capacity);

-- Geofence table indexes
CREATE INDEX IF NOT EXISTS idx_geofence_status ON geofences(status);
CREATE INDEX IF NOT EXISTS idx_geofence_type ON geofences(fence_type);
CREATE INDEX IF NOT EXISTS idx_geofence_boundary_type ON geofences(boundary_type);
CREATE INDEX IF NOT EXISTS idx_geofence_center_location ON geofences(center_latitude, center_longitude);
CREATE INDEX IF NOT EXISTS idx_geofence_priority ON geofences(priority_level);

-- Battery Status table indexes
CREATE INDEX IF NOT EXISTS idx_battery_status_uav_id ON battery_status(uav_id);
CREATE INDEX IF NOT EXISTS idx_battery_status_level ON battery_status(battery_level);
CREATE INDEX IF NOT EXISTS idx_battery_status_updated ON battery_status(last_updated);
CREATE INDEX IF NOT EXISTS idx_battery_status_critical ON battery_status(is_critical);

-- Maintenance Record table indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_record_uav_id ON maintenance_records(uav_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_record_created ON maintenance_records(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_record_type ON maintenance_records(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_record_status ON maintenance_records(status);

-- Region table indexes
CREATE INDEX IF NOT EXISTS idx_region_name ON regions(region_name);

-- UAV-Region junction table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_uav_regions_uav_id ON uav_regions(uav_id);
CREATE INDEX IF NOT EXISTS idx_uav_regions_region_id ON uav_regions(region_id);

-- Audit Log table indexes (for security and monitoring)
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_logs(user_id);

-- Security Event table indexes
CREATE INDEX IF NOT EXISTS idx_security_event_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_event_severity ON security_events(severity);

-- Notification table indexes
CREATE INDEX IF NOT EXISTS idx_notification_timestamp ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notifications(is_read);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_uav_status_location ON uav(status, current_latitude, current_longitude);
CREATE INDEX IF NOT EXISTS idx_location_history_recent ON location_history(uav_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_flight_log_uav_recent ON flight_logs(uav_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_docking_active ON docking_records(status, dock_time) WHERE status = 'DOCKED';
CREATE INDEX IF NOT EXISTS idx_geofence_active_circular ON geofences(fence_type, status, center_latitude, center_longitude) 
    WHERE fence_type = 'CIRCULAR' AND status = 'ACTIVE';

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_uav_active ON uav(id) WHERE status != 'INACTIVE';
CREATE INDEX IF NOT EXISTS idx_battery_low ON battery_status(uav_id, battery_level) WHERE battery_level < 30;
CREATE INDEX IF NOT EXISTS idx_maintenance_pending ON maintenance_records(uav_id, created_at) WHERE status = 'PENDING';

-- Comments for maintenance
COMMENT ON INDEX idx_location_history_geospatial IS 'Critical index for geospatial queries and real-time tracking';
COMMENT ON INDEX idx_uav_location IS 'Enables fast location-based UAV searches';
COMMENT ON INDEX idx_geofence_active_circular IS 'Optimizes geofence violation checking for circular fences';
