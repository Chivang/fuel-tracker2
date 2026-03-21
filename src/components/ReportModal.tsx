'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

type Station = {
  id: string
  name: string
  brand: string | null
  fuel_status: 'available' | 'low' | 'out_of_stock' | 'unknown' | null
  queue_status: 'short' | 'medium' | 'long' | 'unknown' | null
}

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
    avatar_url: string
    points: number
  }
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
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [userPoints, setUserPoints] = useState<number>(0)

  useEffect(() => {
    if (station) {
      setFuelStatus(station.fuel_status || 'available')
      setQueueStatus(station.queue_status || 'short')
      setError(null)
      fetchComments()
    }
  }, [station])

  useEffect(() => {
    if (user) {
      fetchUserPoints()
    }
  }, [user])

  const fetchUserPoints = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user?.id)
      .single()
    if (data) setUserPoints(data.points)
  }

  const fetchComments = async () => {
    if (!station) return
    const { data } = await supabase
      .from('comments')
      .select(`
        id, content, created_at, user_id,
        profiles (full_name, avatar_url, points)
      `)
      .eq('station_id', station.id)
      .order('created_at', { ascending: false })
    if (data) setComments(data as any)
  }

  useEffect(() => {
    if (!station) return

    const channel = supabase
      .channel(`comments-${station.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `station_id=eq.${station.id}`,
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [station?.id])

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
      
      // Increment points (+10 for report)
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()
      
      await supabase
        .from('profiles')
        .update({ points: (profile?.points || 0) + 10 })
        .eq('id', user.id)
      
      fetchUserPoints()
      onClose()
    } catch (err: any) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-phetsarath">
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
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block p-3.5 pr-10 transition-all hover:bg-white disabled:opacity-50 font-phetsarath"
              >
                <option value="available">ມີນ້ຳມັນ (Available)</option>
                <option value="low">ນ້ຳມັນໜ້ອຍ (Low)</option>
                <option value="out_of_stock">ນ້ຳມັນໝົດ (Out of Stock)</option>
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
                    <option value="short">ຄິວນ້ອຍ (Short)</option>
                    <option value="medium">ຄິວປານກາງ (Medium)</option>
                    <option value="long">ຄິວຍາວ (Long)</option>
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

        {/* Comments Section */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              💬 ຄວາມຄິດເຫັນ ({comments.length})
            </h3>
            {user && (
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                🏆 ຄະແນນຂອງທ່ານ: {userPoints}
              </span>
            )}
          </div>

          <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img src={comment.profiles.avatar_url || 'https://via.placeholder.com/32'} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-xs font-bold text-gray-700">{comment.profiles.full_name}</span>
                    <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">
                      Lv.{Math.floor(comment.profiles.points / 50) + 1}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-center text-gray-400 py-4 italic">ຍັງບໍ່ມີຄວາມຄິດເຫັນ</p>
            )}
          </div>

          {user ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ສະແດງຄວາມຄິດເຫັນ..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button
                onClick={async () => {
                  if (!newComment.trim()) return
                  setIsSubmittingComment(true)
                  const { error } = await supabase.from('comments').insert({
                    station_id: station.id,
                    user_id: user.id,
                    content: newComment
                  })
                  if (!error) {
                    setNewComment('')
                    
                    // Award points for commenting (+5)
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('points')
                      .eq('id', user.id)
                      .single()
                    
                    await supabase
                      .from('profiles')
                      .update({ points: (profile?.points || 0) + 5 })
                      .eq('id', user.id)

                    fetchComments()
                    fetchUserPoints() // Refresh points in modal
                  }
                  setIsSubmittingComment(false)
                }}
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmittingComment ? '...' : 'ສົ່ງ'}
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-center text-gray-400">ເຂົ້າສູ່ລະບົບເພື່ອສະແດງຄວາມຄິດເຫັນ</p>
          )}
        </div>
      </div>
    </div>
  )
}