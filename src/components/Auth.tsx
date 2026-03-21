'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

export default function Auth({ onUserChange }: { onUserChange: (user: User | null) => void }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      onUserChange(currentUser)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      onUserChange(currentUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [onUserChange])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-xs font-phetsarath">
        <div className="w-3 h-3 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        ກຳລັງກວດສອບ...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 font-phetsarath">
      {user ? (
        <div className="flex items-center gap-2 sm:gap-3 bg-white/10 p-1 pr-3 rounded-full border border-white/20 backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {user.email?.[0].toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] sm:text-xs font-bold text-white hover:text-green-200 transition-colors uppercase tracking-wider"
          >
            ອອກຈາກລະບົບ
          </button>
        </div>
      ) : (
        <button
          onClick={handleGoogleLogin}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-md group"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="font-phetsarath">ເຂົ້າສູ່ລະບົບດ້ວຍ Google</span>
        </button>
      )}
    </div>
  )
}
