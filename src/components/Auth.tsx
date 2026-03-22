'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'
import { useLanguage } from '@/i18n/LanguageContext'

export default function Auth({ onUserChange }: { onUserChange: (user: User | null) => void }) {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) setShowOverlay(false)
      onUserChange(currentUser)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) setShowOverlay(false)
      onUserChange(currentUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [onUserChange])

  const handleGoogleLogin = async () => {
    // Determine the base URL: prefer the current origin for dev/staging, but redirect to the callback
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vajsiab.eu'
    const callbackUrl = `${origin}/auth/v1/callback`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    })

    if (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleFacebookLogin = async () => {
    // Facebook specifically redirects back with #_=_ which we handle in our callback route
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vajsiab.eu'
    const callbackUrl = `${origin}/auth/v1/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: callbackUrl,
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
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 font-phetsarath">
      {user ? (
        <div className="flex items-center gap-2 sm:gap-3 bg-white/10 p-1 pr-3 rounded-full border border-white/20 backdrop-blur-md">
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {user.email?.[0].toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] sm:text-xs font-bold text-white hover:text-green-200 transition-colors uppercase tracking-wider"
          >
            {t('navbar.logout')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {/* Minimal Header Login Buttons */}
            <button
              onClick={() => setShowOverlay(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 
                         text-white rounded-lg border border-white/20 transition-all 
                         active:scale-95 shadow-lg group"
            >
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {t('navbar.login')}
              </span>
            </button>
          </div>

          {/* Sleek Full-Screen Login Overlay */}
          {showOverlay && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
              <div 
                className="bg-white/90 backdrop-blur-md rounded-[2.5rem] w-full max-w-sm mx-4 p-8 sm:p-10 shadow-2xl border border-white/20 scale-in-center animate-in zoom-in-95 duration-300 relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
                
                <button 
                  onClick={() => setShowOverlay(false)}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center mb-10 mt-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-3xl mb-4 shadow-inner">
                    <span className="text-4xl text-green-600">⛽</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                    {t('navbar.login')}
                  </h2>
                  <p className="text-gray-500 text-sm font-medium">
                    {t('navbar.subtitle')}
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-white text-gray-800 rounded-2xl text-base font-bold hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xl shadow-gray-200/50 border border-gray-100"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>{t('navbar.login_google')}</span>
                  </button>

                  <button
                    onClick={handleFacebookLogin}
                    className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-[#1877F2] text-white rounded-2xl text-base font-bold hover:bg-[#166fe5] active:scale-[0.98] transition-all shadow-xl shadow-blue-200/50"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>{t('navbar.login_facebook')}</span>
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setShowOverlay(false)}
                    className="text-gray-400 hover:text-red-500 font-bold text-sm uppercase tracking-widest transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
