'use client'

import Link from 'next/link'
import { useLanguage } from '@/i18n/LanguageContext'

export default function SupportButton() {
  const { t } = useLanguage()

  return (
    <Link
      href="/support"
      className="fixed bottom-6 left-6 z-[3000] flex items-center gap-2 bg-[#FFDD00] hover:bg-[#FFCC00] text-black px-4 py-2 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group font-phetsarath border border-white/50"
      title={t('common.buy_me_coffee')}
    >
      <div className="relative w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-inner overflow-hidden group-hover:rotate-12 transition-transform border border-yellow-100">
        <img
          src="/images/coffee.png"
          alt="Coffee"
          className="w-full h-full object-cover scale-125"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 leading-none">
          {t('common.support_dev')}
        </span>
        <span className="text-sm font-bold leading-tight">
          {t('common.buy_me_coffee')}
        </span>
      </div>

      {/* Decorative pulse effect */}
      <span className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20 -z-10 group-hover:opacity-40 transition-opacity"></span>
    </Link>
  )
}
