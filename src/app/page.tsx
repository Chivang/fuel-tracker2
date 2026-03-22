'use client'

import dynamic from 'next/dynamic'
import Auth from '@/components/Auth'
import { useState, useEffect } from 'react'
import SupportButton from '@/components/SupportButton'
import type { User } from '@supabase/supabase-js'
import { useLanguage } from '@/i18n/LanguageContext'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-phetsarath">
      <p className="animate-pulse text-green-700 font-medium tracking-wide">
        ກຳລັງໂຫລດແຜນທີ່...
      </p>
    </div>
  ),
})

export default function Home() {
  const { t, language, setLanguage } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 font-phetsarath">
        <p className="animate-pulse text-green-700 font-medium tracking-wide">
          {t('common.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-[1001] flex items-center justify-between
                         px-4 sm:px-6 py-2.5
                         bg-gradient-to-r from-green-800/80 to-green-700/80
                         backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <span className="text-xl sm:text-2xl">⛽</span>
          </div>
          <div className="leading-tight">
            <h1 className="text-white font-bold text-sm sm:text-base tracking-wide uppercase">
              {t('navbar.title')}
            </h1>
            <p className="text-white/60 text-[10px] sm:text-xs hidden sm:block font-medium">
              {t('navbar.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'lo' ? 'en' : 'lo')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 
                       rounded-lg border border-white/20 transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {language === 'lo' ? '🇺🇸 EN' : '🇱🇦 LA'}
            </span>
          </button>
          
          <Auth onUserChange={setUser} />
        </div>
      </header>

      <main className="flex-1 relative">
        <Map user={user} />
      </main>

      {/* Floating Support Button */}
      <SupportButton />

      {/* Privacy Policy Link */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1001] pointer-events-auto shadow-lg">
        <a 
          href="/privacy" 
          className="text-[10px] sm:text-xs font-medium text-gray-500 hover:text-green-700 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200/50 shadow-sm transition-all"
        >
          {t('common.privacy_policy')}
        </a>
      </div>
    </div>
  )
}
