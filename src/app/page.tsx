'use client'

import dynamic from 'next/dynamic'
import Auth from '@/components/Auth'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <p className="text-sm text-gray-500">ກຳລັງໂຫລດແຜນທີ່...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1001] flex items-center justify-between
                         px-4 sm:px-6 py-2.5
                         bg-gradient-to-r from-green-800/80 to-green-700/80
                         backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛽</span>
          <div className="leading-tight">
            <p className="text-white font-bold text-sm sm:text-base tracking-wide">
              ຕິດຕາມນໍ້າມັນລາວ
            </p>
            <p className="text-white/60 text-xs hidden sm:block">
              ສະຖານີນໍ້າມັນໃກ້ທ່ານ
            </p>
          </div>
        </div>

        <Auth onUserChange={setUser} />
      </header>

      <main className="h-screen w-full">
        <Map user={user} />
      </main>
    </>
  )
}
