'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/utils/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type Station = {
  id: string
  name: string
  brand: string | null
  lat: number
  lng: number
  fuel_status: 'available' | 'low' | 'out_of_stock' | null
  queue_status: 'short' | 'medium' | 'long' | null
  updated_at: string | null
}

// ─── Marker colours per fuel_status ──────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  available: '#22c55e',   // green-500
  low: '#f97316',         // orange-500
  out_of_stock: '#ef4444', // red-500
}

const QUEUE_LABEL: Record<string, string> = {
  short: 'Short queue',
  medium: 'Medium queue',
  long: 'Long queue',
}

function createPinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.941 14 26 14 26S28 23.941 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.85"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Map() {
  const [stations, setStations] = useState<Station[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStations() {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name, brand, lat, lng, fuel_status, queue_status, updated_at')

      if (error) {
        setError(error.message)
        return
      }
      setStations(data ?? [])
    }
    fetchStations()
  }, [])

  return (
    <div className="relative h-screen w-full">
      {/* Error banner */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]
                        bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          Failed to load stations: {error}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 right-4 z-[1000]
                      bg-white/90 backdrop-blur rounded-xl shadow-xl px-4 py-3 text-sm">
        <p className="font-semibold text-gray-700 mb-2">Fuel Status</p>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 capitalize mb-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
            {status.replace('_', ' ')}
          </div>
        ))}
      </div>

      <MapContainer
        center={[18.625, 102.691]}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          const color = STATUS_COLOR[station.fuel_status ?? ''] ?? '#6b7280'
          const icon = createPinIcon(color)

          return (
            <Marker key={station.id} position={[station.lat, station.lng]} icon={icon}>
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-bold text-base">{station.name}</p>
                  {station.brand && (
                    <p className="text-gray-500 text-xs mb-2">{station.brand}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="capitalize">
                      {(station.fuel_status ?? 'unknown').replace('_', ' ')}
                    </span>
                  </div>
                  {station.queue_status && (
                    <p className="text-xs text-gray-500 mt-1">
                      {QUEUE_LABEL[station.queue_status]}
                    </p>
                  )}
                  {station.updated_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Updated {new Date(station.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
