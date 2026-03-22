'use client'

import Link from 'next/link'
import { useLanguage } from '@/i18n/LanguageContext'

export default function PrivacyPolicy() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 font-phetsarath">
      {/* Header */}
      <header className="bg-green-700 py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="text-white hover:text-green-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
            {t('privacy.title')} - Fuel Tracker
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto py-10 px-6 sm:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 space-y-8">

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              {t('privacy.intro_title')}
            </h2>
            <p className="indent-4">
              {t('privacy.intro_text')}
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              {t('privacy.collection_title')}
            </h2>
            <p className="indent-4">
              {t('privacy.collection_text')}
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li><strong>{t('privacy.collection_email').split(':')[0]}:</strong>{t('privacy.collection_email').split(':')[1]}</li>
              <li><strong>{t('privacy.collection_name').split(':')[0]}:</strong>{t('privacy.collection_name').split(':')[1]}</li>
            </ul>
            <p className="indent-4">
              {t('privacy.collection_footer')}
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              {t('privacy.deletion_title')}
            </h2>
            <p className="indent-4">
              {t('privacy.deletion_text1')}
            </p>
            <p className="indent-4">
              {t('privacy.deletion_text2')}
            </p>
            <p className="indent-4">
              {t('privacy.deletion_text3')}
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              {t('privacy.security_title')}
            </h2>
            <p className="indent-4">
              {t('privacy.security_text')}
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              {t('privacy.changes_title')}
            </h2>
            <p className="indent-4">
              {t('privacy.changes_text')}
            </p>
          </section>

          <div className="pt-8 border-t text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors shadow-sm"
            >
              {t('privacy.back_to_app')}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Fuel Tracker. All rights reserved.
      </footer>
    </div>
  )
}
