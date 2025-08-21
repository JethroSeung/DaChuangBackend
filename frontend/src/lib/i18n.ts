import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`../locales/${language}/${namespace}.json`)
    })
  )
  .init({
    // Default language
    lng: 'en-US',
    fallbackLng: 'en-US',

    // Supported languages - include generic codes to prevent warnings
    supportedLngs: ['en-US', 'zh-CN', 'en', 'zh'],
    nonExplicitSupportedLngs: true,

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'navigation', 'dashboard', 'uav', 'forms', 'errors', 'map', 'battery', 'docking', 'hibernate', 'notifications', 'search'],

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options
    react: {
      useSuspense: false,
    },

    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
  })

export default i18n
