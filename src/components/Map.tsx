'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/utils/supabase'
import ReportModal from './ReportModal'
import AddStationModal from './AddStationModal'
import MapController from './MapController'
import type { User } from '@supabase/supabase-js'

// --- Types ---
interface Station {
  id: string
  name: string
  brand: string | null
  lat: number
  lng: number
  fuel_status: 'available' | 'low' | 'out_of_stock' | 'unknown'
  queue_status: 'short' | 'medium' | 'long' | 'unknown'
  updated_at: string
  approval_status: 'pending' | 'approved' | 'rejected'
  created_by?: string
  has_premium: boolean
  has_regular: boolean
  has_diesel: boolean
}

interface UserPoints {
  points: number
  level: number
}

// --- Icons ---
const createPinIcon = (color: string) => {
  if (typeof window === 'undefined') return null
  return new L.DivIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

const USER_ICON = typeof window !== 'undefined' ? new L.DivIcon({
  className: 'user-pin',
  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
}) : null

const STATUS_COLORS = {
  available: '#10b981',    // green
  low: '#f59e0b',          // yellow
  out_of_stock: '#ef4444', // red
  unknown: '#9ca3af'       // gray
}

// --- Constants ---
const CENTER: [number, number] = [17.974855, 102.630867] // Vientiane
const ZOOM = 13

export default function Map({ user }: { user: User | null }) {
  console.log('Map (Map.tsx) rendering with user:', user?.email)
  const [isMounted, setIsMounted] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [tempLatlng, setTempLatlng] = useState<{lat: number, lng: number} | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [viewedPoints, setViewedPoints] = useState<UserPoints | null>(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  // Load Map logic
  useEffect(() => {
    console.log('Map (Map.tsx) useEffect firing...')
    setIsMounted(true)
    fetchStations()
    if (user) fetchUserPoints()

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stations' }, (payload) => {
        console.log('Real-time change received:', payload)
        fetchStations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchStations = async () => {
    console.log('Fetching stations...')
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
      
      console.log(`Fetched ${data?.length || 0} stations from Supabase.`)
      
      // Filter logic: 
      // 1. Show all 'approved'
      // 2. Show 'pending' if it belongs to current user or if we're in "debug/restore" mode (all visible)
      const filtered = (data || []).filter((s: any) => {
        if (s.approval_status === 'approved') return true
        if (user && s.created_by === user.id) return true
        return false
      })
      
      console.log(`Displaying ${filtered.length} stations after filtering.`)
      setStations(filtered)
    } catch (err) {
      console.error('Error fetching stations:', err)
    }
  }

  const fetchUserPoints = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single()
    
    if (data) {
      const points = data.points || 0
      setViewedPoints({ points, level: Math.floor(points / 100) + 1 })
    }
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation([latitude, longitude])
        setIsLocating(false)
      },
      (error) => {
        console.warn('Geolocation failed:', error.message)
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('email, points')
      .order('points', { ascending: false })
      .limit(10)
    
    if (data) setLeaderboard(data)
    setShowLeaderboard(true)
  }

  const handleAddStation = (e: any) => {
    if (!user) return alert('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ')
    setTempLatlng(e.latlng)
    setIsAddModalOpen(true)
  }

  function MapEvents() {
    useMapEvents({
      contextmenu: (e) => handleAddStation(e),
    })
    return null
  }

  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <p>ກຳລັງໂຫລດແຜນທີ່...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={CENTER} 
        zoom={ZOOM} 
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Satellite">
            <TileLayer
              attribution="&copy; Google"
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapEvents />
        <MapController center={userLocation || undefined} />

        {stations.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 text-center">
            <p className="text-gray-800 font-bold">ບໍ່ພົບຂໍ້ມູນສະຖານີ</p>
            <p className="text-gray-500 text-xs mt-1">(ກະລຸນາລອງໃໝ່ ຫຼື ເພີ່ມສະຖານີໃໝ່)</p>
          </div>
        )}

        {stations.map((station) => {
          // Calculate distance if user location is available
          let distanceStr = ''
          if (userLocation) {
            const R = 6371 // km
            const dLat = (station.lat - userLocation[0]) * Math.PI / 180
            const dLon = (station.lng - userLocation[1]) * Math.PI / 180
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(station.lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            const d = R * c
            distanceStr = d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`
          }

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createPinIcon(STATUS_COLORS[station.fuel_status] || STATUS_COLORS.unknown)!}
              eventHandlers={{
                click: () => {
                  setSelectedStation(station)
                  setIsReportModalOpen(true)
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[160px]">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-gray-800 text-sm m-0 leading-tight">{station.name}</h3>
                    {station.brand && (
                      <p className="text-[10px] text-gray-500 font-medium">{station.brand}</p>
                    )}
                    
                    <div className="h-[1px] bg-gray-100 my-1" />
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <p className="text-gray-400 uppercase font-bold tracking-tighter">ນໍ້າມັນ</p>
                        <p className={`font-bold ${
                          station.fuel_status === 'available' ? 'text-green-600' : 
                          station.fuel_status === 'low' ? 'text-orange-500' : 
                          station.fuel_status === 'out_of_stock' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {station.fuel_status === 'available' ? 'ມີນໍ້າມັນ' : 
                           station.fuel_status === 'low' ? 'ນໍ້າມັນໜ້ອຍ' : 
                           station.fuel_status === 'out_of_stock' ? 'ນໍ້າມັນໝົດ' : 'ບໍ່ມີຂໍ້ມູນ'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase font-bold tracking-tighter">ຄິວ</p>
                        <p className="font-bold text-gray-700 capitalize">
                          {station.queue_status === 'short' ? 'ຄິວນ້ອຍ' :
                           station.queue_status === 'medium' ? 'ຄິວປານກາງ' :
                           station.queue_status === 'long' ? 'ຄິວຍາວ' : 'ບໍ່ມີຂໍ້ມູນ'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${station.has_premium ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400 line-through decoration-1 text-[7px]'}`}>
                        ພິເສດ
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${station.has_regular ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 line-through decoration-1 text-[7px]'}`}>
                        ທຳມະດາ
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${station.has_diesel ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 line-through decoration-1 text-[7px]'}`}>
                        ກະຊວນ
                      </span>
                    </div>

                    {distanceStr && (
                      <div className="mt-1 pt-1 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">ໄລຍະຫ່າງ</span>
                        <span className="text-[10px] font-bold text-blue-600">📍 {distanceStr}</span>
                      </div>
                    )}

                    {station.approval_status === 'pending' && (
                      <div className="mt-1 bg-orange-50 text-orange-600 text-[9px] py-1 px-2 rounded-md font-bold text-center font-phetsarath">
                        ກຳລັງກວດສອບ
                      </div>
                    )}
                    
                    {station.updated_at && (
                      <div className="mt-1 text-center font-phetsarath">
                        <span className="text-[8px] text-gray-400">ອັບເດດເມື່ອ: {new Date(station.updated_at).toLocaleString('lo-LA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </div>
                    )}
                    
                    <button className="mt-2 w-full py-1.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                      ຄລິກເພື່ອລາຍງານ
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {userLocation && USER_ICON && (
          <Marker position={userLocation} icon={USER_ICON} zIndexOffset={1000} />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-20 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20 font-phetsarath">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">ສັນຍະລັກ</h4>
        <div className="space-y-2">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-gray-600 capitalize">
                {status === 'available' ? 'ມີນໍ້າມັນ' : status === 'low' ? 'ນໍ້າມັນໜ້ອຍ' : status === 'out_of_stock' ? 'ນໍ້າມັນໝົດ' : 'ບໍ່ມີຂໍ້ມູນ'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Help Label */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <p className="text-white text-[10px] font-bold tracking-wide font-phetsarath flex items-center gap-2">
            <span>🖱️ ກົດຄ້າງໄວ້ເພື່ອເພີ່ມປ້ຳໃໝ່</span>
          </p>
        </div>
      </div>

      {/* UI Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
        {user?.email === 'chivang.ch@gmail.com' && (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="p-3 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 transition-all font-bold"
            title="ແຜງຄວບຄຸມ Admin"
          >
            ⚙️
          </button>
        )}
        <button
          onClick={fetchLeaderboard}
          className="p-3 bg-yellow-500 text-white rounded-full shadow-xl hover:bg-yellow-600 transition-all font-bold"
          title="ຕາຕະລາງຄະແນນ"
        >
          🏆
        </button>
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="p-3 bg-white text-green-700 rounded-full shadow-xl hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          {isLocating ? '...' : '📍'}
        </button>
      </div>

      {isAddModalOpen && tempLatlng && (
        <AddStationModal
          lat={tempLatlng.lat}
          lng={tempLatlng.lng}
          user={user}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchStations()
            setIsAddModalOpen(false)
          }}
        />
      )}

      {isReportModalOpen && selectedStation && (
        <ReportModal
          station={selectedStation}
          user={user}
          onClose={() => setIsReportModalOpen(false)}
          onReportSuccess={fetchStations}
        />
      )}

      {showAdminPanel && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4 font-phetsarath">Admin: ສະຖານີທີ່ລໍຖ້າການກວດສອບ</h2>
            <div className="space-y-4 font-phetsarath">
              {stations.filter(s => s.approval_status === 'pending').map(s => (
                <div key={s.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        await supabase.from('stations').update({ approval_status: 'approved' }).eq('id', s.id)
                        fetchStations()
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded"
                    >
                      ອະນຸມັດ
                    </button>
                    <button 
                      onClick={async () => {
                        await supabase.from('stations').update({ approval_status: 'rejected' }).eq('id', s.id)
                        fetchStations()
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded"
                    >
                      ປະຕິເສດ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAdminPanel(false)} className="mt-6 w-full py-2 bg-gray-200 rounded-lg">ປິດ</button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 font-phetsarath">
            <h2 className="text-xl font-bold mb-4 text-center">🏆 ຕາຕະລາງຄະແນນ</h2>
            <div className="space-y-3">
              {leaderboard.map((u, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b">
                  <span className="text-sm">{i+1}. {u.email.split('@')[0]}</span>
                  <span className="font-bold text-green-700">{u.points} pts</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowLeaderboard(false)} className="mt-6 w-full py-2 bg-gray-100 rounded-lg">ປິດ</button>
          </div>
        </div>
      )}
    </div>
  )
}
