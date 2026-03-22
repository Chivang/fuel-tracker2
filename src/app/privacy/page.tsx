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
            {t('common.privacy_policy')} - Fuel Tracker
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto py-10 px-6 sm:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 space-y-8">
          
          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              1. {t('common.privacy_policy')}
            </h2>
            <p className="indent-4">
              Fuel Tracker ("we", "us", or "our") operates the Fuel Tracker application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              2. Information Collection and Use
            </h2>
            <p className="indent-4">
              We collect information only for authentication and to improve your experience. When you log in with Google or Facebook, we receive:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li><strong>User Email Address:</strong> Used strictly for identifying your account and unique reports.</li>
              <li><strong>Profile Name:</strong> Used to display your name on reports or leaderboards (if opted-in).</li>
            </ul>
            <p className="indent-4">
              We do <strong>not</strong> sell, trade, or transfer your personal information to outside parties.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              3. Data Deletion
            </h2>
            <p className="indent-4">
              We respect your right to privacy and control over your data.
            </p>
            <p className="indent-4">
              Users can request the full removal of their account data, including email, profile name, and all associated reports, by contacting the administrator via the support channels provided in the app (e.g., via the Support button or messaging).
            </p>
            <p className="indent-4">
              Alternatively, you can contact us directly to initiate a data deletion request. Once requested, your data will be permanently deleted from our records within 7 business days.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              4. Security
            </h2>
            <p className="indent-4">
              The security of your data is important to us, and we strive to use commercially acceptable means to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">
              5. Changes to This Privacy Policy
            </h2>
            <p className="indent-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <div className="pt-8 border-t text-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors shadow-sm"
            >
              Back to App
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
