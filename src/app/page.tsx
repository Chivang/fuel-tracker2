'use client'

import dynamic from 'next/dynamic'
import Auth from '@/components/Auth'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

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
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="animate-pulse text-green-700 font-medium tracking-wide">
          ກຳລັງໂຫລດ...
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
              ຕິດຕາມນໍ້າມັນລາວ
            </h1>
            <p className="text-white/60 text-[10px] sm:text-xs hidden sm:block font-medium">
              ສະຖານີນໍ້າມັນໃກ້ທ່ານ
            </p>
          </div>
        </div>

        <Auth onUserChange={setUser} />
      </header>

      <main className="flex-grow w-full pt-[56px] relative">
        <Map user={user} />
      </main>
    </div>
  )
}
