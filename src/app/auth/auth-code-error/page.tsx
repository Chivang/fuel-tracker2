'use client'
import { useLanguage } from '@/i18n/LanguageContext'

export default function AuthCodeError() {
  const { t } = useLanguage()

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 font-phetsarath">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-3xl mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          There was a problem exchanging your login code for a session. This can happen if the link has expired or was already used.
        </p>
        <a
          href="/"
          className="inline-block w-full px-6 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-200"
        >
          {t('privacy.back_to_app')}
        </a>
      </div>
    </div>
  )
}
