'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import lo from './lo.json'
import en from './en.json'

type Language = 'lo' | 'en'
type Dictionary = typeof lo

const dictionaries: Record<Language, Dictionary> = { lo, en }

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('lo')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'lo' || saved === 'en')) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }

  const t = (keyPath: string): string => {
    const keys = keyPath.split('.')
    let current: any = dictionaries[language]
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        console.warn(`Translation key not found: ${keyPath}`)
        return keyPath
      }
    }
    
    return typeof current === 'string' ? current : keyPath
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
