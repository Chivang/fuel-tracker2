'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

interface AddStationModalProps {
  lat: number
  lng: number
  user: User | null
  onClose: () => void
  onSuccess: () => void
}

export default function AddStationModal({ lat, lng, user, onClose, onSuccess }: AddStationModalProps) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [fuelStatus, setFuelStatus] = useState('unknown')
  const [queueStatus, setQueueStatus] = useState('unknown')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!name.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from('stations').insert({
        name: name.trim(),
        brand: brand.trim() || null,
        lat,
        lng,
        fuel_status: fuelStatus,
        queue_status: queueStatus,
        approval_status: 'pending',
        created_by: user.id
      })

      if (insertError) throw insertError

      onSuccess()
      onClose()
      alert('ເພີ່ມສະຖານີແລ້ວ! ລໍຖ້າການອະນຸມັດຈາກ admin.')
    } catch (err: any) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-phetsarath animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h2 className="text-xl font-bold text-green-800">ເພີ່ມປ້ຳໃໝ່</h2>
          <p className="text-xs text-gray-500 mt-1">ກະລຸນາໃສ່ຂໍ້ມູນສະຖານີໃຫ້ຄົບຖ້ວນ</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 px-1">ຊື່ສະຖານີ <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ຕົວຢ່າງ: PTT ໂພນທັນ"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 px-1">ຍີ່ຫໍ້ (ຖ້າມີ)</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="ຕົວຢ່າງ: PTT, Plus, PetroTrade"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fuel Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 px-1">ສະຖານະນໍ້າມັນ</label>
              <select
                value={fuelStatus}
                onChange={(e) => setFuelStatus(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm text-gray-900"
              >
                <option value="available">ມີນໍ້າມັນ</option>
                <option value="low">ນໍ້າມັນໜ້ອຍ</option>
                <option value="out_of_stock">ນໍ້າມັນໝົດ</option>
                <option value="unknown">ບໍ່ມີຂໍ້ມູນ</option>
              </select>
            </div>

            {/* Queue Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 px-1">ສະຖານະຄິວ</label>
              <select
                value={queueStatus}
                onChange={(e) => setQueueStatus(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm text-gray-900"
              >
                <option value="short">ຄິວນ້ອຍ</option>
                <option value="medium">ຄິວປານກາງ</option>
                <option value="long">ຄິວຍາວ</option>
                <option value="unknown">ບໍ່ມີຂໍ້ມູນ</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-[2] py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md shadow-green-100 disabled:opacity-50"
            >
              {isSubmitting ? 'ກຳລັງບັນທຶກ...' : 'ເພີ່ມສະຖານີ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
