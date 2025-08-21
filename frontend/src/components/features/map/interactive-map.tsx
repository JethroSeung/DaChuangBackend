'use client'

import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { UAV } from '@/types/uav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AnimatedUAVMarker,
  AnimatedGeofence,
  AnimatedFlightPath,
  AnimatedDockingStation
} from './animated-map-components'
import {
  Plane,
  Battery,
  MapPin,
  Clock,
  User,
  Eye,
  Navigation,
} from 'lucide-react'
import { formatRelativeTime, getStatusVariant } from '@/lib/utils'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom UAV icons
const createUAVIcon = (status: string, operationalStatus: string) => {
  const getColor = () => {
    if (operationalStatus === 'EMERGENCY') return '#dc2626'
    if (status === 'UNAUTHORIZED') return '#dc2626'
    if (operationalStatus === 'IN_FLIGHT') return '#2563eb'
    if (operationalStatus === 'HIBERNATING') return '#7c3aed'
    if (operationalStatus === 'CHARGING') return '#ea580c'
    if (operationalStatus === 'MAINTENANCE') return '#d97706'
    return '#16a34a' // AUTHORIZED and READY
  }

  const color = getColor()

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
    `,
    className: 'custom-uav-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

// Geofence data (mock)
const mockGeofences = [
  {
    id: 1,
    name: 'Restricted Zone A',
    center: [39.9042, 116.4074] as [number, number],
    radius: 1000,
    type: 'restricted',
    color: '#dc2626',
  },
  {
    id: 2,
    name: 'Safe Zone B',
    center: [39.9142, 116.4174] as [number, number],
    radius: 1500,
    type: 'safe',
    color: '#16a34a',
  },
  {
    id: 3,
    name: 'Warning Zone C',
    center: [39.8942, 116.3974] as [number, number],
    radius: 800,
    type: 'warning',
    color: '#ea580c',
  },
]

// Docking stations data (mock)
const mockDockingStations = [
  {
    id: 1,
    name: 'Station Alpha',
    position: [39.9000, 116.4000] as [number, number],
    capacity: 5,
    occupied: 2,
    status: 'operational',
  },
  {
    id: 2,
    name: 'Station Beta',
    position: [39.9100, 116.4100] as [number, number],
    capacity: 3,
    occupied: 1,
    status: 'operational',
  },
  {
    id: 3,
    name: 'Station Gamma',
    position: [39.8950, 116.4150] as [number, number],
    capacity: 4,
    occupied: 0,
    status: 'maintenance',
  },
]

interface MapControllerProps {
  center: [number, number]
  zoom: number
}

function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])

  return null
}

interface FlightPath {
  id: number
  uavId: number
  coordinates: { latitude: number; longitude: number }[]
  timestamp: string
}

interface InteractiveMapProps {
  uavs: UAV[]
  selectedUAV: UAV | null
  onUAVSelect: (uav: UAV) => void
  center: [number, number]
  zoom: number
  layers: {
    uavs: boolean
    geofences: boolean
    dockingStations: boolean
    flightPaths: boolean
    weather: boolean
  }
  className?: string
  flightPaths?: FlightPath[]
  showFlightPaths?: boolean
  loading?: boolean
  error?: string
  dockingStations?: any[]
  regions?: any[]
  mapLayer?: string
  onStationSelect?: (station: any) => void
  enableClustering?: boolean
  showZoomControl?: boolean
  showScaleControl?: boolean
  showFullscreenControl?: boolean
  'aria-label'?: string
  role?: string
}

export function InteractiveMap({
  uavs,
  selectedUAV,
  onUAVSelect,
  center,
  zoom,
  layers,
  className,
  flightPaths = [],
  showFlightPaths = false,
  loading = false,
  error,
  dockingStations = mockDockingStations,
  regions = [],
  mapLayer = 'default',
  onStationSelect,
  enableClustering = false,
  showZoomControl = false,
  showScaleControl = false,
  showFullscreenControl = false,
  'aria-label': ariaLabel,
  role,
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map>(null)

  // Normalize UAV data for map display, adding mock locations and polyfills for outdated properties.
  const uavsWithDisplayData = uavs.map((uav) => {
    const hasLocation = uav.location && uav.location.latitude != null && uav.location.longitude != null

    return {
      ...uav,
      currentLatitude: hasLocation
        ? uav.location!.latitude
        : 39.9042 + (Math.random() - 0.5) * 0.1,
      currentLongitude: hasLocation
        ? uav.location!.longitude
        : 116.4074 + (Math.random() - 0.5) * 0.1,
      currentAltitudeMeters:
        hasLocation && uav.location?.altitude != null
          ? uav.location.altitude
          : Math.floor(Math.random() * 500) + 50,
      operationalStatus: uav.status, // Polyfill for renamed/removed property
      batteryStatus: { currentChargePercentage: uav.batteryLevel }, // Polyfill for restructured property
      ownerName: 'N/A', // Placeholder for missing property
      model: 'N/A', // Placeholder for missing property
    }
  })

  // Handle loading state
  if (loading) {
    return (
      <div className={className}>
        <div
          data-testid="map-loading"
          className="flex items-center justify-center h-full bg-muted rounded-lg"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className={className}>
        <div
          role="alert"
          className="flex items-center justify-center h-full bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <div className="text-center p-4">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        data-testid="map-container"
        aria-label={ariaLabel}
        role={role}
        style={{ height: '100%', width: '100%' }}
      >
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* UAV Markers */}
        {layers.uavs && uavsWithDisplayData.map((uav) => (
          <AnimatedUAVMarker
            key={uav.id}
            uav={uav}
            isSelected={selectedUAV?.id === uav.id}
            onSelect={onUAVSelect}
            icon={createUAVIcon(uav.status, uav.operationalStatus)}
          />
        ))}

        {/* Legacy UAV Markers for complex popups */}
        {layers.uavs && uavsWithDisplayData.filter(uav => selectedUAV?.id === uav.id).map((uav) => (
          <Marker
            key={`detailed-${uav.id}`}
            position={[uav.currentLatitude!, uav.currentLongitude!]}
            icon={L.divIcon({ html: '', iconSize: [0, 0] })}
          >
            <Popup>
              <div className="p-2 min-w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{uav.rfidTag}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Badge variant={getStatusVariant(uav.status)}>
                      {uav.status}
                    </Badge>
                    <Badge variant={getStatusVariant(uav.operationalStatus)}>
                      {uav.operationalStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{uav.ownerName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Plane className="h-3 w-3 text-muted-foreground" />
                    <span>{uav.model}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs">
                      {uav.currentLatitude!.toFixed(6)}, {uav.currentLongitude!.toFixed(6)}
                    </span>
                  </div>

                  {uav.currentAltitudeMeters && (
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-3 w-3 text-muted-foreground" />
                      <span>{uav.currentAltitudeMeters}m altitude</span>
                    </div>
                  )}

                  {uav.batteryStatus && (
                    <div className="flex items-center space-x-2">
                      <Battery className="h-3 w-3 text-muted-foreground" />
                      <span>{uav.batteryStatus.currentChargePercentage}% battery</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatRelativeTime(uav.updatedAt)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onUAVSelect(uav)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Geofences */}
        {layers.geofences && mockGeofences.map((geofence) => (
          <AnimatedGeofence
            key={geofence.id}
            center={geofence.center}
            radius={geofence.radius}
            color={geofence.color}
            name={geofence.name}
            type={geofence.type}
            isVisible={layers.geofences}
          />
        ))}

        {/* Flight Paths */}
        {(layers.flightPaths || showFlightPaths) && flightPaths.map((flightPath) => (
          <AnimatedFlightPath
            key={flightPath.id}
            positions={flightPath.coordinates.map(coord => [coord.latitude, coord.longitude] as [number, number])}
            color="#2563eb"
            isVisible={layers.flightPaths || showFlightPaths}
          />
        ))}

        {/* Docking Stations */}
        {layers.dockingStations && dockingStations.map((station) => (
          <AnimatedDockingStation
            key={station.id}
            position={station.position}
            status={station.status}
            name={station.name}
            capacity={station.capacity}
            occupied={station.occupied}
            isVisible={layers.dockingStations}
          />
        ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default InteractiveMap
