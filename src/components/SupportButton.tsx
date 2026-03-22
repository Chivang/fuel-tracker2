'use client'

import Link from 'next/link'
import { useLanguage } from '@/i18n/LanguageContext'

export default function SupportButton() {
  const { t } = useLanguage()

  return (
    <Link
      href="/support"
      className="fixed bottom-24 left-6 z-[3000] flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 group border border-gray-200"
      title={t('common.buy_me_coffee')}
    >
      <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden">
        <img
          src="/images/coffee.png"
          alt="Coffee"
          className="w-full h-full object-contain animate-bounce"
        />
      </div>
    </Link>
  )
}
