'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'
import ReportModal from './ReportModal'
import MapController from './MapController'

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

const STATUS_COLOR: Record<string, string> = {
  available: '#22c55e',
  low: '#f97316',
  out_of_stock: '#ef4444',
}

const STATUS_LABEL: Record<string, string> = {
  available: 'ມີນ້ຳມັນ',
  low: 'ເຫຼືອນ້ຳໜ້ອຍ',
  out_of_stock: 'ນ້ຳມັນໝົດ',
}

const QUEUE_LABEL: Record<string, string> = {
  short: 'ຄິວນ້ອຍ',
  medium: 'ຄິວປານກາງ',
  long: 'ຄິວຍາວ',
}

function createPinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 28 16 28S32 27 32 16C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2.5"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -46],
  })
}

export default function Map({ user }: { user: User | null }) {
  const [stations, setStations] = useState<Station[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapFocus, setMapFocus] = useState<{ center: [number, number], zoom: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const fetchStations = useCallback(async () => {
    const { data, error } = await supabase
      .from('stations')
      .select('id, name, brand, lat, lng, fuel_status, queue_status, updated_at')

    if (error) {
      setError(error.message)
      return
    }
    setStations(data ?? [])
  }, [])

  useEffect(() => {
    fetchStations()
  }, [fetchStations])

  useEffect(() => {
    const channel = supabase
      .channel('stations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stations',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedStation = payload.new as Station
            setStations((prev) =>
              prev.map((s) =>
                s.id === updatedStation.id ? { ...s, ...updatedStation } : s
              )
            )
            if (selectedStation?.id === updatedStation.id) {
              setSelectedStation((prev) => prev ? { ...prev, ...updatedStation } : null)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedStation?.id])

  function handleMarkerClick(station: Station) {
    setSelectedStation(station)
  }

  function handleCloseModal() {
    setSelectedStation(null)
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('ບຣາວເຊີຂອງທ່ານບໍ່ຮອງຮັບ geolocation')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        setMapFocus({ center: [latitude, longitude], zoom: 15 })
        setIsLocating(false)
      },
      (err) => {
        console.error(err)
        alert('ບໍ່ສາມາດເຂົ້າເຖິງຕຳແໜ່ງຂອງທ່ານໄດ້. ກະລຸນາກວດສອບການອະນຸຍາດ GPS.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleFindNearest = () => {
    if (!userLocation) {
      handleLocateMe()
      return
    }

    if (stations.length === 0) return

    const sorted = [...stations].sort((a, b) => {
      const distA = calculateDistance(userLocation[0], userLocation[1], a.lat, a.lng)
      const distB = calculateDistance(userLocation[0], userLocation[1], b.lat, b.lng)
      return distA - distB
    })

    const nearest = sorted[0]
    setMapFocus({ center: [nearest.lat, nearest.lng], zoom: 16 })
    setSelectedStation(nearest)
  }

  return (
    <div className="relative h-screen w-full">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]
                        bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          ໂຫລດຂໍ້ມູນບໍ່ໄດ້: {error}
        </div>
      )}

      <div className="absolute bottom-8 right-4 z-[1000]
                      bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-5 min-w-[150px]">
        <p className="font-bold text-gray-800 mb-3 text-base">ສະຖານະນໍ້າມັນ</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full flex-shrink-0 shadow-md" style={{ backgroundColor: STATUS_COLOR.available }} />
            <span className="text-sm text-gray-700 font-medium">{STATUS_LABEL.available}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full flex-shrink-0 shadow-md" style={{ backgroundColor: STATUS_COLOR.low }} />
            <span className="text-sm text-gray-700 font-medium">{STATUS_LABEL.low}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full flex-shrink-0 shadow-md" style={{ backgroundColor: STATUS_COLOR.out_of_stock }} />
            <span className="text-sm text-gray-700 font-medium">{STATUS_LABEL.out_of_stock}</span>
          </div>
        </div>
        {user ? (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={handleFindNearest}
              className="w-full py-2.5 px-4 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md shadow-green-100 flex items-center justify-center gap-2"
            >
              📍 ສະຖານີໃກ້ສຸດ
            </button>
            <p className="text-green-600 text-[10px] text-center font-medium opacity-70">
              ກົດທີ່ໝາຍເລກເພື່ອລາຍງານ
            </p>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleFindNearest}
              className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 mb-2"
            >
              📍 ຊອກຫາສະຖານີໃກ້ສຸດ
            </button>
            <p className="text-gray-400 text-[10px] text-center">
              ເຂົ້າສູ່ລະບົບເພື່ອລາຍງານ
            </p>
          </div>
        )}
      </div>

      {/* Locate Me Floating Button */}
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute top-4 right-4 z-[1000] p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl shadow-xl active:scale-90 transition-all border border-gray-100 group"
        title="ຕຳແໜ່ງຂອງຂ້ອຍ"
      >
        {isLocating ? (
          <div className="h-6 w-6 border-3 border-green-600 border-t-transparent animate-spin rounded-full" />
        ) : (
          <svg className={`w-6 h-6 ${userLocation ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      <MapContainer
        center={[17.97, 102.63]}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapFocus && <MapController center={mapFocus.center} zoom={mapFocus.zoom} />}

        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="relative flex h-6 w-6">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-4 border-white shadow-lg"></span>
                    </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>ຕຳແໜ່ງຂອງທ່ານ</Popup>
          </Marker>
        )}

        {stations.map((station) => {
          const color = STATUS_COLOR[station.fuel_status ?? ''] ?? '#6b7280'
          const icon = createPinIcon(color)

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(station),
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-1 font-phetsarath">
                  <p className="font-bold text-base">{station.name}</p>
                  <div className="flex justify-between items-start mb-1">
                    {station.brand && (
                      <p className="text-gray-500 text-xs">{station.brand}</p>
                    )}
                    {userLocation && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                        {calculateDistance(userLocation[0], userLocation[1], station.lat, station.lng).toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-3">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-gray-700">
                      {STATUS_LABEL[station.fuel_status ?? ''] ?? 'ບໍ່ລະບຸ'}
                    </span>
                  </div>
                  {station.queue_status && (
                    <p className="text-xs text-gray-500 mt-1 pl-6">
                      ຄິວ: {QUEUE_LABEL[station.queue_status]}
                    </p>
                  )}
                  {station.updated_at && (
                    <p className="text-[10px] text-gray-400 mt-4 border-t pt-2 border-gray-50">
                      ອັບເດດລ່າສຸດ: {new Date(station.updated_at).toLocaleString('lo-LA')}
                    </p>
                  )}
                  {user && (
                    <p className="text-[11px] text-green-600 mt-2 font-bold flex items-center gap-1 bg-green-50/50 p-2 rounded-lg">
                      <span>👆</span> ກົດເພື່ອລາຍງານສັງຄົມ
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <ReportModal
        station={selectedStation}
        user={user}
        onClose={handleCloseModal}
        onReportSuccess={fetchStations}
      />
    </div>
  )
}
