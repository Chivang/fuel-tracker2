'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

type Station = {
  id: string
  name: string
  brand: string | null
  fuel_status: 'available' | 'low' | 'out_of_stock' | null
  queue_status: 'short' | 'medium' | 'long' | null
}

interface ReportModalProps {
  station: Station | null
  user: User | null
  onClose: () => void
  onReportSuccess: () => void
}

export default function ReportModal({ station, user, onClose, onReportSuccess }: ReportModalProps) {
  const [fuelStatus, setFuelStatus] = useState<string>('')
  const [queueStatus, setQueueStatus] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (station) {
      setFuelStatus(station.fuel_status || 'available')
      setQueueStatus(station.queue_status || 'short')
      setError(null)
    }
  }, [station])

  if (!station) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsUpdating(true)
    setError(null)

    try {
      // If out of stock, queue status should be empty (null)
      const finalQueueStatus = fuelStatus === 'out_of_stock' ? null : queueStatus

      // Update the main station status
      const { error: updateError } = await supabase
        .from('stations')
        .update({
          fuel_status: fuelStatus,
          queue_status: finalQueueStatus,
        })
        .eq('id', station.id)

      if (updateError) throw updateError

      // Record this update in the historical reports table
      await supabase
        .from('reports')
        .insert({
          station_id: station.id,
          user_id: user.id,
          fuel_status: fuelStatus,
          queue_status: finalQueueStatus,
        })

      onReportSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800 pr-8">{station.name}</h2>
          {station.brand && (
            <p className="text-sm text-gray-500 mt-1">{station.brand}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Fuel Status Select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              ⛽ ສະຖານະນໍ້າມັນ
            </label>
            <div className="relative group">
              <select
                value={fuelStatus}
                onChange={(e) => setFuelStatus(e.target.value)}
                disabled={isUpdating}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block p-3.5 pr-10 transition-all hover:bg-white disabled:opacity-50"
              >
                <option value="available">Available (ມີນ້ຳມັນ)</option>
                <option value="low">Low Fuel (ເຫຼືອນ້ຳໜ້ອຍ)</option>
                <option value="out_of_stock">Out of Stock (ນ້ຳມັນໝົດ)</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Queue Status Select */}
          <div className={`space-y-2 transition-opacity duration-200 ${fuelStatus === 'out_of_stock' ? 'opacity-50' : 'opacity-100'}`}>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              👥 ສະຖານະຄິວ {fuelStatus === 'out_of_stock' && '(ບໍ່ມີຄິວ)'}
            </label>
            <div className="relative group">
              <select
                value={fuelStatus === 'out_of_stock' ? '' : queueStatus}
                onChange={(e) => setQueueStatus(e.target.value)}
                disabled={isUpdating || fuelStatus === 'out_of_stock'}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block p-3.5 pr-10 transition-all hover:bg-white disabled:opacity-50"
              >
                {fuelStatus === 'out_of_stock' ? (
                  <option value="">- ບໍ່ມີຄິວ -</option>
                ) : (
                  <>
                    <option value="short">Short Queue (ຄິວນ້ອຍ)</option>
                    <option value="medium">Medium Queue (ຄິວປານກາງ)</option>
                    <option value="long">Long Queue (ຄິວຍາວ)</option>
                  </>
                )}
              </select>
              {fuelStatus !== 'out_of_stock' && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              )}
            </div>
          </div>

          {!user && (
            <p className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg text-center font-medium">
              ⚠️ ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນການລາຍງານ
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={isUpdating || !user}
              className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md shadow-green-200 disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  ກຳລັງບັນທຶກ...
                </>
              ) : (
                'ສົ່ງລາຍງານ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}