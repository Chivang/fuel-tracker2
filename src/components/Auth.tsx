'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.7-3-11.6-7.3l-6.5 5C9.5 40 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.8 36.2 44 30.5 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  )
}

interface AuthProps {
  onUserChange?: (user: User | null) => void
}

export default function Auth({ onUserChange }: AuthProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      onUserChange?.(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      onUserChange?.(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-32 animate-pulse rounded-full bg-white/30" />
      </div>
    )
  }

  if (user) {
    const email = user.email ?? 'ຜູ້ໃຊ້'
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:block max-w-[160px] truncate text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full">
          {email}
        </span>
        <button
          onClick={handleSignOut}
          className="rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-medium text-white
                     hover:bg-white/20 active:scale-95 transition-all duration-150 backdrop-blur-sm"
        >
          ອອກຈາກລະບົບ
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-md
                 hover:bg-gray-50 active:scale-95 transition-all duration-150"
    >
      <GoogleIcon />
      ເຂົ້າສູ່ລະບົບດ້ວຍ Google
    </button>
  )
}
