'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize i18n and wait for it to be ready
    const initializeI18n = async () => {
      try {
        // Check if i18n is already initialized
        if (i18n.isInitialized) {
          setIsInitialized(true)
          return
        }

        // Wait for i18n to initialize
        await i18n.init()
        setIsInitialized(true)
        
        // Set the HTML lang attribute
        document.documentElement.lang = i18n.language
      } catch (error) {
        console.error('Failed to initialize i18n:', error)
        setIsInitialized(true) // Still render the app even if i18n fails
      }
    }

    initializeI18n()

    // Listen for language changes to update the HTML lang attribute
    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng
    }

    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  // Show loading state while i18n is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}

export default I18nProvider
