/**
 * UAV Tracking Map - Interactive map for real-time UAV monitoring
 * Features: Real-time tracking, geofencing, flight paths, docking stations
 */

class UAVTrackingMap {
    constructor() {
        this.map = null;
        this.uavMarkers = new Map();
        this.stationMarkers = new Map();
        this.geofenceShapes = new Map();
        this.flightPaths = new Map();
        this.websocket = null;
        this.stompClient = null;
        
        // Layer groups
        this.uavLayer = L.layerGroup();
        this.stationLayer = L.layerGroup();
        this.geofenceLayer = L.layerGroup();
        this.flightPathLayer = L.layerGroup();
        
        // State
        this.showUAVs = true;
        this.showStations = true;
        this.showGeofences = true;
        this.showFlightPaths = false;
        this.selectedUAV = null;
        this.timeRange = 60; // minutes
        
        this.init();
    }

    init() {
        this.initMap();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupWebSocket();
        this.startPeriodicUpdates();
    }

    initMap() {
        // Initialize map centered on New York City
        this.map = L.map('map').setView([40.7128, -74.0060], 12);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add layer groups to map
        this.uavLayer.addTo(this.map);
        this.stationLayer.addTo(this.map);
        this.geofenceLayer.addTo(this.map);
        this.flightPathLayer.addTo(this.map);

        // Add drawing controls for geofences
        this.setupDrawingControls();

        console.log('Map initialized');
    }

    setupDrawingControls() {
        const drawControl = new L.Control.Draw({
            position: 'topleft',
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true
                },
                circle: {
                    showRadius: true,
                    metric: true
                },
                rectangle: true,
                marker: false,
                polyline: false,
                circlemarker: false
            },
            edit: {
                featureGroup: this.geofenceLayer,
                remove: true
            }
        });

        this.map.addControl(drawControl);

        // Handle drawing events
        this.map.on('draw:created', (e) => {
            this.handleGeofenceCreated(e);
        });
    }

    setupEventListeners() {
        // Layer toggle buttons
        document.getElementById('toggleUAVs').addEventListener('click', () => {
            this.toggleLayer('uavs');
        });

        document.getElementById('toggleStations').addEventListener('click', () => {
            this.toggleLayer('stations');
        });

        document.getElementById('toggleGeofences').addEventListener('click', () => {
            this.toggleLayer('geofences');
        });

        document.getElementById('toggleFlightPaths').addEventListener('click', () => {
            this.toggleLayer('flightPaths');
        });

        // Time range selector
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.timeRange = parseInt(e.target.value);
            this.refreshFlightPaths();
        });

        // Control buttons
        document.getElementById('centerMap').addEventListener('click', () => {
            this.centerMapOnUAVs();
        });

        document.getElementById('refreshData').addEventListener('click', () => {
            this.refreshAllData();
        });

        document.getElementById('fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadUAVs(),
                this.loadDockingStations(),
                this.loadGeofences()
            ]);
            
            this.updateStatusIndicators();
            console.log('Initial data loaded');
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadUAVs() {
        try {
            const response = await fetch('/api/location/current');
            const uavs = await response.json();
            
            this.clearUAVMarkers();
            
            uavs.forEach(uav => {
                this.addUAVMarker(uav);
            });
            
            this.updateUAVList(uavs);
            document.getElementById('uavCount').textContent = uavs.length;
            document.getElementById('activeUAVCount').textContent = uavs.length;
            
        } catch (error) {
            console.error('Error loading UAVs:', error);
        }
    }

    async loadDockingStations() {
        try {
            const response = await fetch('/api/docking-stations');
            const stations = await response.json();
            
            this.clearStationMarkers();
            
            stations.forEach(station => {
                this.addStationMarker(station);
            });
            
            this.updateStationList(stations);
            document.getElementById('stationCount').textContent = stations.length;
            
            const onlineStations = stations.filter(s => s.status === 'OPERATIONAL').length;
            document.getElementById('onlineStationCount').textContent = onlineStations;
            
        } catch (error) {
            console.error('Error loading docking stations:', error);
        }
    }

    async loadGeofences() {
        try {
            const response = await fetch('/api/geofences/active');
            const geofences = await response.json();
            
            this.clearGeofenceShapes();
            
            geofences.forEach(geofence => {
                this.addGeofenceShape(geofence);
            });
            
            this.updateGeofenceList(geofences);
            document.getElementById('geofenceCount').textContent = geofences.length;
            document.getElementById('activeGeofenceCount').textContent = geofences.length;
            
        } catch (error) {
            console.error('Error loading geofences:', error);
        }
    }

    addUAVMarker(uav) {
        if (!uav.latitude || !uav.longitude) return;

        const color = uav.status === 'AUTHORIZED' ? '#2ecc71' : '#e74c3c';
        const icon = L.divIcon({
            className: 'uav-marker',
            html: `<i class="fas fa-drone" style="color: ${color}; font-size: 20px;"></i>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([uav.latitude, uav.longitude], { icon })
            .bindPopup(this.createUAVPopup(uav))
            .on('click', () => {
                this.selectUAV(uav);
            });

        this.uavMarkers.set(uav.uavId, marker);
        this.uavLayer.addLayer(marker);
    }

    addStationMarker(station) {
        const color = this.getStationColor(station.status);
        const icon = L.divIcon({
            className: 'station-marker',
            html: `<i class="fas fa-charging-station" style="color: ${color}; font-size: 18px;"></i>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const marker = L.marker([station.latitude, station.longitude], { icon })
            .bindPopup(this.createStationPopup(station))
            .on('click', () => {
                this.selectStation(station);
            });

        this.stationMarkers.set(station.id, marker);
        this.stationLayer.addLayer(marker);
    }

    addGeofenceShape(geofence) {
        let shape;
        
        if (geofence.fenceType === 'CIRCULAR') {
            const color = geofence.boundaryType === 'INCLUSION' ? '#3498db' : '#e74c3c';
            shape = L.circle([geofence.centerLatitude, geofence.centerLongitude], {
                radius: geofence.radiusMeters,
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2
            }).bindPopup(this.createGeofencePopup(geofence));
        }
        // TODO: Add support for polygonal geofences
        
        if (shape) {
            this.geofenceShapes.set(geofence.id, shape);
            this.geofenceLayer.addLayer(shape);
        }
    }

    createUAVPopup(uav) {
        const lastUpdate = uav.lastUpdate ? new Date(uav.lastUpdate).toLocaleString() : 'Unknown';
        return `
            <div class="popup-title">${uav.rfidTag}</div>
            <div class="popup-info">
                <strong>Owner:</strong> ${uav.ownerName || 'Unknown'}<br>
                <strong>Model:</strong> ${uav.model || 'Unknown'}<br>
                <strong>Status:</strong> <span class="uav-status ${uav.status.toLowerCase()}">${uav.status}</span><br>
                <strong>Operational:</strong> ${uav.operationalStatus || 'Unknown'}<br>
                <strong>Altitude:</strong> ${uav.altitude ? uav.altitude.toFixed(1) + 'm' : 'Unknown'}<br>
                <strong>Speed:</strong> ${uav.speed ? uav.speed.toFixed(1) + ' km/h' : 'Unknown'}<br>
                <strong>Battery:</strong> ${uav.batteryLevel ? uav.batteryLevel + '%' : 'Unknown'}<br>
                <strong>Last Update:</strong> ${lastUpdate}
            </div>
            <div class="popup-actions">
                <button class="popup-btn" onclick="trackingMap.showFlightPath(${uav.uavId})">
                    <i class="fas fa-route"></i> Flight Path
                </button>
                <button class="popup-btn" onclick="trackingMap.centerOnUAV(${uav.uavId})">
                    <i class="fas fa-crosshairs"></i> Center
                </button>
            </div>
        `;
    }

    createStationPopup(station) {
        const occupancyPercent = station.maxCapacity > 0 ? 
            Math.round((station.currentOccupancy / station.maxCapacity) * 100) : 0;
        
        return `
            <div class="popup-title">${station.name}</div>
            <div class="popup-info">
                <strong>Type:</strong> ${station.stationType}<br>
                <strong>Status:</strong> ${station.status}<br>
                <strong>Capacity:</strong> ${station.currentOccupancy}/${station.maxCapacity} (${occupancyPercent}%)<br>
                <strong>Charging:</strong> ${station.chargingAvailable ? 'Available' : 'Not Available'}<br>
                <strong>Maintenance:</strong> ${station.maintenanceAvailable ? 'Available' : 'Not Available'}<br>
                <strong>Weather Protected:</strong> ${station.weatherProtected ? 'Yes' : 'No'}<br>
                ${station.description ? '<strong>Description:</strong> ' + station.description : ''}
            </div>
            <div class="popup-actions">
                <button class="popup-btn" onclick="trackingMap.findNearestUAVs(${station.latitude}, ${station.longitude})">
                    <i class="fas fa-search"></i> Nearby UAVs
                </button>
            </div>
        `;
    }

    createGeofencePopup(geofence) {
        return `
            <div class="popup-title">${geofence.name}</div>
            <div class="popup-info">
                <strong>Type:</strong> ${geofence.fenceType}<br>
                <strong>Boundary:</strong> ${geofence.boundaryType}<br>
                <strong>Priority:</strong> ${geofence.priorityLevel}<br>
                <strong>Status:</strong> ${geofence.status}<br>
                <strong>Violations:</strong> ${geofence.totalViolations || 0}<br>
                ${geofence.description ? '<strong>Description:</strong> ' + geofence.description : ''}
            </div>
        `;
    }

    updateUAVList(uavs) {
        const uavList = document.getElementById('uavList');
        uavList.innerHTML = '';
        
        uavs.forEach(uav => {
            const item = document.createElement('div');
            item.className = 'uav-item';
            item.dataset.uavId = uav.uavId;
            
            const lastUpdate = uav.lastUpdate ? 
                new Date(uav.lastUpdate).toLocaleTimeString() : '--:--';
            
            item.innerHTML = `
                <div class="uav-rfid">${uav.rfidTag}</div>
                <div class="uav-status ${uav.status.toLowerCase()}">${uav.status}</div>
                <div class="uav-location">
                    ${uav.latitude ? uav.latitude.toFixed(4) : '--'}, 
                    ${uav.longitude ? uav.longitude.toFixed(4) : '--'}
                    <br>Updated: ${lastUpdate}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectUAV(uav);
                this.centerOnUAV(uav.uavId);
            });
            
            uavList.appendChild(item);
        });
    }

    updateStationList(stations) {
        const stationList = document.getElementById('stationList');
        stationList.innerHTML = '';
        
        stations.forEach(station => {
            const item = document.createElement('div');
            item.className = 'station-item';
            item.dataset.stationId = station.id;
            
            item.innerHTML = `
                <div class="station-name">${station.name}</div>
                <div class="station-status">
                    ${station.status} - ${station.currentOccupancy}/${station.maxCapacity}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectStation(station);
                this.map.setView([station.latitude, station.longitude], 15);
            });
            
            stationList.appendChild(item);
        });
    }

    updateGeofenceList(geofences) {
        const geofenceList = document.getElementById('geofenceList');
        geofenceList.innerHTML = '';
        
        geofences.forEach(geofence => {
            const item = document.createElement('div');
            item.className = 'geofence-item';
            item.dataset.geofenceId = geofence.id;
            
            item.innerHTML = `
                <div class="geofence-name">${geofence.name}</div>
                <div class="geofence-type">
                    ${geofence.fenceType} - ${geofence.boundaryType}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectGeofence(geofence);
                if (geofence.fenceType === 'CIRCULAR') {
                    this.map.setView([geofence.centerLatitude, geofence.centerLongitude], 14);
                }
            });
            
            geofenceList.appendChild(item);
        });
    }

    getStationColor(status) {
        switch (status) {
            case 'OPERATIONAL': return '#2ecc71';
            case 'MAINTENANCE': return '#f39c12';
            case 'OUT_OF_SERVICE': return '#e74c3c';
            case 'OFFLINE': return '#95a5a6';
            default: return '#3498db';
        }
    }

    toggleLayer(layerName) {
        const button = document.getElementById(`toggle${layerName.charAt(0).toUpperCase() + layerName.slice(1)}`);
        
        switch (layerName) {
            case 'uavs':
                this.showUAVs = !this.showUAVs;
                if (this.showUAVs) {
                    this.map.addLayer(this.uavLayer);
                } else {
                    this.map.removeLayer(this.uavLayer);
                }
                break;
            case 'stations':
                this.showStations = !this.showStations;
                if (this.showStations) {
                    this.map.addLayer(this.stationLayer);
                } else {
                    this.map.removeLayer(this.stationLayer);
                }
                break;
            case 'geofences':
                this.showGeofences = !this.showGeofences;
                if (this.showGeofences) {
                    this.map.addLayer(this.geofenceLayer);
                } else {
                    this.map.removeLayer(this.geofenceLayer);
                }
                break;
            case 'flightPaths':
                this.showFlightPaths = !this.showFlightPaths;
                if (this.showFlightPaths) {
                    this.map.addLayer(this.flightPathLayer);
                    this.loadFlightPaths();
                } else {
                    this.map.removeLayer(this.flightPathLayer);
                }
                break;
        }
        
        button.classList.toggle('active');
    }

    selectUAV(uav) {
        // Clear previous selection
        document.querySelectorAll('.uav-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select new UAV
        const uavItem = document.querySelector(`[data-uav-id="${uav.uavId}"]`);
        if (uavItem) {
            uavItem.classList.add('selected');
        }
        
        this.selectedUAV = uav;
    }

    selectStation(station) {
        // Implementation for station selection
        console.log('Selected station:', station.name);
    }

    selectGeofence(geofence) {
        // Implementation for geofence selection
        console.log('Selected geofence:', geofence.name);
    }

    centerOnUAV(uavId) {
        const marker = this.uavMarkers.get(uavId);
        if (marker) {
            this.map.setView(marker.getLatLng(), 16);
            marker.openPopup();
        }
    }

    centerMapOnUAVs() {
        if (this.uavMarkers.size === 0) return;
        
        const group = new L.featureGroup(Array.from(this.uavMarkers.values()));
        this.map.fitBounds(group.getBounds().pad(0.1));
    }

    clearUAVMarkers() {
        this.uavMarkers.forEach(marker => {
            this.uavLayer.removeLayer(marker);
        });
        this.uavMarkers.clear();
    }

    clearStationMarkers() {
        this.stationMarkers.forEach(marker => {
            this.stationLayer.removeLayer(marker);
        });
        this.stationMarkers.clear();
    }

    clearGeofenceShapes() {
        this.geofenceShapes.forEach(shape => {
            this.geofenceLayer.removeLayer(shape);
        });
        this.geofenceShapes.clear();
    }

    updateStatusIndicators() {
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    }

    refreshAllData() {
        this.loadInitialData();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // WebSocket setup for real-time updates
    setupWebSocket() {
        try {
            const socket = new SockJS('/ws');
            this.stompClient = Stomp.over(socket);
            
            this.stompClient.connect({}, () => {
                console.log('WebSocket connected');
                
                // Subscribe to location updates
                this.stompClient.subscribe('/topic/location-updates', (message) => {
                    const locationUpdate = JSON.parse(message.body);
                    this.handleLocationUpdate(locationUpdate);
                });
                
                // Subscribe to geofence violations
                this.stompClient.subscribe('/topic/geofence-violations', (message) => {
                    const violation = JSON.parse(message.body);
                    this.handleGeofenceViolation(violation);
                });
                
                // Subscribe to docking events
                this.stompClient.subscribe('/topic/docking-events', (message) => {
                    const event = JSON.parse(message.body);
                    this.handleDockingEvent(event);
                });
                
            }, (error) => {
                console.error('WebSocket connection error:', error);
            });
            
        } catch (error) {
            console.error('Error setting up WebSocket:', error);
        }
    }

    handleLocationUpdate(update) {
        // Update UAV marker position
        const marker = this.uavMarkers.get(update.uavId);
        if (marker) {
            marker.setLatLng([update.latitude, update.longitude]);
            marker.setPopupContent(this.createUAVPopup(update));
        } else {
            // Add new UAV marker
            this.addUAVMarker(update);
        }
        
        this.updateStatusIndicators();
    }

    handleGeofenceViolation(violation) {
        // Show violation alert
        this.showViolationAlert(violation);
        
        // Highlight violating UAV
        const marker = this.uavMarkers.get(violation.uavId);
        if (marker) {
            marker.setIcon(L.divIcon({
                className: 'uav-marker violation',
                html: `<i class="fas fa-drone" style="color: #e74c3c; font-size: 20px; animation: blink 1s infinite;"></i>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            }));
        }
    }

    handleDockingEvent(event) {
        // Refresh station data to update occupancy
        this.loadDockingStations();
        
        // Show notification
        console.log(`UAV ${event.uavRfidTag} ${event.eventType.toLowerCase()} at ${event.stationName}`);
    }

    showViolationAlert(violation) {
        // Create and show violation alert
        const alert = document.createElement('div');
        alert.className = 'violation-alert';
        alert.innerHTML = `
            <strong>Geofence Violation!</strong><br>
            UAV: ${violation.uavRfidTag}<br>
            Geofence: ${violation.geofenceName}<br>
            Action: ${violation.violationAction}
        `;
        
        // Add to map temporarily
        document.body.appendChild(alert);
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 5000);
    }

    startPeriodicUpdates() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadUAVs();
            this.updateStatusIndicators();
        }, 30000);
    }

    // Flight path methods
    async loadFlightPaths() {
        if (!this.selectedUAV) return;

        try {
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - (this.timeRange * 60 * 1000));

            const response = await fetch(
                `/api/location/flight-path/${this.selectedUAV.uavId}?` +
                `startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`
            );
            const flightPath = await response.json();

            this.displayFlightPath(this.selectedUAV.uavId, flightPath);

        } catch (error) {
            console.error('Error loading flight path:', error);
        }
    }

    displayFlightPath(uavId, pathData) {
        // Remove existing path
        const existingPath = this.flightPaths.get(uavId);
        if (existingPath) {
            this.flightPathLayer.removeLayer(existingPath);
        }

        if (pathData.length < 2) return;

        // Create path coordinates
        const coordinates = pathData.map(point => [point.latitude, point.longitude]);

        // Create polyline
        const pathLine = L.polyline(coordinates, {
            color: '#3498db',
            weight: 3,
            opacity: 0.7
        }).bindPopup(`Flight path for ${this.selectedUAV.rfidTag}`);

        // Add waypoint markers
        pathData.forEach((point, index) => {
            if (index % 5 === 0) { // Show every 5th point to avoid clutter
                const waypoint = L.circleMarker([point.latitude, point.longitude], {
                    radius: 3,
                    color: '#2c3e50',
                    fillColor: '#3498db',
                    fillOpacity: 0.8
                }).bindPopup(`
                    <strong>Waypoint</strong><br>
                    Time: ${new Date(point.timestamp).toLocaleString()}<br>
                    Altitude: ${point.altitudeMeters ? point.altitudeMeters.toFixed(1) + 'm' : 'Unknown'}<br>
                    Speed: ${point.speedKmh ? point.speedKmh.toFixed(1) + ' km/h' : 'Unknown'}
                `);

                this.flightPathLayer.addLayer(waypoint);
            }
        });

        this.flightPaths.set(uavId, pathLine);
        this.flightPathLayer.addLayer(pathLine);
    }

    showFlightPath(uavId) {
        // Find UAV data
        const uav = Array.from(this.uavMarkers.keys()).includes(uavId) ?
            { uavId: uavId, rfidTag: `UAV-${uavId}` } : null;

        if (uav) {
            this.selectedUAV = uav;
            this.showFlightPaths = true;
            this.map.addLayer(this.flightPathLayer);
            document.getElementById('toggleFlightPaths').classList.add('active');
            this.loadFlightPaths();
        }
    }

    refreshFlightPaths() {
        if (this.showFlightPaths && this.selectedUAV) {
            this.loadFlightPaths();
        }
    }

    // Geofence creation
    handleGeofenceCreated(e) {
        const layer = e.layer;
        const type = e.layerType;

        let geofenceData = {
            name: prompt('Enter geofence name:') || 'New Geofence',
            description: prompt('Enter description (optional):') || '',
            boundaryType: confirm('Is this an inclusion zone? (OK = Inclusion, Cancel = Exclusion)') ?
                'INCLUSION' : 'EXCLUSION',
            priorityLevel: parseInt(prompt('Enter priority level (1-5):') || '1'),
            violationAction: prompt('Enter violation action:') || 'ALERT'
        };

        if (type === 'circle') {
            geofenceData.fenceType = 'CIRCULAR';
            geofenceData.centerLatitude = layer.getLatLng().lat;
            geofenceData.centerLongitude = layer.getLatLng().lng;
            geofenceData.radiusMeters = layer.getRadius();
        } else if (type === 'polygon') {
            geofenceData.fenceType = 'POLYGONAL';
            geofenceData.polygonCoordinates = JSON.stringify(
                layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng])
            );
        }

        this.createGeofence(geofenceData);
    }

    async createGeofence(geofenceData) {
        try {
            const response = await fetch('/api/geofences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(geofenceData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('Geofence created successfully');
                this.loadGeofences(); // Refresh geofences
            } else {
                alert('Error creating geofence: ' + result.message);
            }

        } catch (error) {
            console.error('Error creating geofence:', error);
            alert('Error creating geofence');
        }
    }

    // Utility methods
    async findNearestUAVs(latitude, longitude) {
        try {
            const response = await fetch(
                `/api/location/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=5&minutesBack=30`
            );
            const nearbyUAVs = await response.json();

            // Highlight nearby UAVs
            nearbyUAVs.forEach(location => {
                const marker = this.uavMarkers.get(location.uavId);
                if (marker) {
                    marker.openPopup();
                }
            });

            console.log(`Found ${nearbyUAVs.length} UAVs within 5km`);

        } catch (error) {
            console.error('Error finding nearby UAVs:', error);
        }
    }

    // Cleanup method
    destroy() {
        if (this.stompClient) {
            this.stompClient.disconnect();
        }

        if (this.map) {
            this.map.remove();
        }
    }
}

// Global reference for popup actions
let trackingMap;

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    trackingMap = new UAVTrackingMap();
});

// Add CSS for violation alerts
const style = document.createElement('style');
style.textContent = `
    .violation-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px;
        border-radius: 6px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
    }

    .uav-marker.violation i {
        animation: blink 1s infinite;
    }
`;
document.head.appendChild(style);
