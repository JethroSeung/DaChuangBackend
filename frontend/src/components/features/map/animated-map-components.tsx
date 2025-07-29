'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import { Marker, Circle, Polyline, Popup } from 'react-leaflet'
import { UAV } from '@/types/uav'
import { markerVariants, getAnimationVariants } from '@/lib/animations'

// Animated UAV Marker Component
interface AnimatedUAVMarkerProps {
  uav: UAV
  isSelected: boolean
  onSelect: (uav: UAV) => void
  icon: L.DivIcon
}

export function AnimatedUAVMarker({ uav, isSelected, onSelect, icon }: AnimatedUAVMarkerProps) {
  const markerRef = useRef<L.Marker>(null)

  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current
      const element = marker.getElement()
      
      if (element) {
        // Add CSS classes for animations
        element.style.transition = 'all 0.3s ease-out'
        
        if (isSelected) {
          element.style.transform = 'scale(1.3)'
          element.style.zIndex = '1000'
        } else {
          element.style.transform = 'scale(1)'
          element.style.zIndex = '500'
        }
      }
    }
  }, [isSelected])

  return (
    <Marker
      ref={markerRef}
      position={[uav.currentLatitude!, uav.currentLongitude!]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(uav),
        mouseover: (e) => {
          const element = e.target.getElement()
          if (element && !isSelected) {
            element.style.transform = 'scale(1.2)'
          }
        },
        mouseout: (e) => {
          const element = e.target.getElement()
          if (element && !isSelected) {
            element.style.transform = 'scale(1)'
          }
        },
      }}
    >
      <Popup>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="p-2"
        >
          <h4 className="font-semibold mb-1">{uav.rfidTag}</h4>
          <p className="text-sm text-muted-foreground">Owner: {uav.ownerName}</p>
          <p className="text-sm text-muted-foreground">Model: {uav.model}</p>
          <p className="text-sm text-muted-foreground">
            Status: {uav.status} | {uav.operationalStatus}
          </p>
          {uav.currentAltitudeMeters && (
            <p className="text-sm text-muted-foreground">
              Altitude: {uav.currentAltitudeMeters}m
            </p>
          )}
        </motion.div>
      </Popup>
    </Marker>
  )
}

// Animated Geofence Component
interface AnimatedGeofenceProps {
  center: [number, number]
  radius: number
  color: string
  name: string
  type: string
  isVisible: boolean
}

export function AnimatedGeofence({ 
  center, 
  radius, 
  color, 
  name, 
  type, 
  isVisible 
}: AnimatedGeofenceProps) {
  const circleRef = useRef<L.Circle>(null)

  useEffect(() => {
    if (circleRef.current) {
      const circle = circleRef.current
      
      // Animate the circle appearance
      if (isVisible) {
        circle.setStyle({
          fillOpacity: 0.1,
          opacity: 1,
        })
      } else {
        circle.setStyle({
          fillOpacity: 0,
          opacity: 0,
        })
      }
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <Circle
          ref={circleRef}
          center={center}
          radius={radius}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.1,
            weight: 2,
          }}
          eventHandlers={{
            mouseover: (e) => {
              e.target.setStyle({
                fillOpacity: 0.2,
                weight: 3,
              })
            },
            mouseout: (e) => {
              e.target.setStyle({
                fillOpacity: 0.1,
                weight: 2,
              })
            },
          }}
        >
          <Popup>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="p-2"
            >
              <h4 className="font-semibold mb-1">{name}</h4>
              <p className="text-sm text-muted-foreground">Type: {type}</p>
              <p className="text-sm text-muted-foreground">Radius: {radius}m</p>
            </motion.div>
          </Popup>
        </Circle>
      )}
    </AnimatePresence>
  )
}

// Animated Flight Path Component
interface AnimatedFlightPathProps {
  positions: [number, number][]
  color: string
  isVisible: boolean
}

export function AnimatedFlightPath({ positions, color, isVisible }: AnimatedFlightPathProps) {
  const pathRef = useRef<L.Polyline>(null)

  useEffect(() => {
    if (pathRef.current && isVisible) {
      const path = pathRef.current
      
      // Animate the path drawing
      let currentIndex = 0
      const animateDrawing = () => {
        if (currentIndex < positions.length) {
          const currentPositions = positions.slice(0, currentIndex + 1)
          path.setLatLngs(currentPositions)
          currentIndex++
          setTimeout(animateDrawing, 100) // Draw each segment with 100ms delay
        }
      }
      
      animateDrawing()
    }
  }, [positions, isVisible])

  return (
    <AnimatePresence>
      {isVisible && positions.length > 1 && (
        <Polyline
          ref={pathRef}
          positions={[]}
          pathOptions={{
            color: color,
            weight: 3,
            opacity: 0.8,
            dashArray: '5, 10',
          }}
        />
      )}
    </AnimatePresence>
  )
}

// Animated Docking Station Marker
interface AnimatedDockingStationProps {
  position: [number, number]
  status: 'operational' | 'maintenance'
  name: string
  capacity: number
  occupied: number
  isVisible: boolean
}

export function AnimatedDockingStation({ 
  position, 
  status, 
  name, 
  capacity, 
  occupied, 
  isVisible 
}: AnimatedDockingStationProps) {
  const markerRef = useRef<L.Marker>(null)

  const icon = L.divIcon({
    html: `
      <div style="
        background-color: ${status === 'operational' ? '#16a34a' : '#ea580c'};
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      ">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
      </div>
    `,
    className: 'custom-station-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  })

  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current
      const element = marker.getElement()
      
      if (element) {
        element.style.transition = 'all 0.3s ease-out'
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <Marker
          ref={markerRef}
          position={position}
          icon={icon}
          eventHandlers={{
            mouseover: (e) => {
              const element = e.target.getElement()
              if (element) {
                element.style.transform = 'scale(1.3)'
              }
            },
            mouseout: (e) => {
              const element = e.target.getElement()
              if (element) {
                element.style.transform = 'scale(1)'
              }
            },
          }}
        >
          <Popup>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="p-2"
            >
              <h4 className="font-semibold mb-1">{name}</h4>
              <p className="text-sm text-muted-foreground">Status: {status}</p>
              <p className="text-sm text-muted-foreground">
                Capacity: {occupied}/{capacity}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(occupied / capacity) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </motion.div>
          </Popup>
        </Marker>
      )}
    </AnimatePresence>
  )
}
