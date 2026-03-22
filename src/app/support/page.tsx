'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/i18n/LanguageContext'

export default function SupportPage() {
  const { t } = useLanguage()
  const [activeBank, setActiveBank] = useState<'bcel' | 'ldb'>('bcel')

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-phetsarath flex flex-col pt-10 pb-20 px-4">
      {/* Back Button */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors font-bold"
        >
          ← {t('common.close')}
        </Link>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Info Card */}
        <div className="bg-[#e7f9f1] border border-[#d1f2e4] p-6 rounded-2xl">
          <p className="text-[13px] leading-relaxed text-[#1a5d40] text-center">
            {t('support.explanation')}
          </p>
        </div>

        {/* Support Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-center p-8 space-y-8">
          {/* Cup Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#f8f9fa] rounded-full flex items-center justify-center text-3xl animate-bounce">
              ☕
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{t('support.title')}</h1>
            <p className="text-gray-500 text-sm">
              {t('support.scan_qr')}
            </p>
          </div>

          {/* Bank Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setActiveBank('bcel')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeBank === 'bcel'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t('support.bcel_one')}
            </button>
            <button
              onClick={() => setActiveBank('ldb')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeBank === 'ldb'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t('support.ldb_bank')}
            </button>
          </div>

          {/* QR Content */}
          <div className="space-y-6">
            <div className="aspect-square max-w-[320px] mx-auto bg-gray-50 rounded-3xl border-8 border-[#f8f9fa] overflow-hidden shadow-inner group relative">
              <img
                src={activeBank === 'bcel' ? '/images/bcel_qr.png' : '/images/ldb_qr.png'}
                alt="QR Code"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-4xl text-white/50">🔍</span>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest bg-gray-50 py-2 inline-block px-6 rounded-full border border-gray-100 italic">
              CHIVANG XIANENG MR
            </p>

            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = activeBank === 'bcel' ? '/images/bcel_qr.png' : '/images/ldb_qr.png'
                link.download = `${activeBank}_qr.png`
                link.click()
              }}
              className="w-full py-4 bg-[#f8f9fa] hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm border border-gray-200"
            >
              📥 {t('support.download_qr')}
            </button>
          </div>

          {/* Footer Message */}
          <div className="pt-4">
            <p className="text-[11px] text-gray-400 max-w-[300px] mx-auto leading-relaxed">
              {t('support.thank_you')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
