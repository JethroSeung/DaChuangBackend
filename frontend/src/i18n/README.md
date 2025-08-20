# Internationalization (i18n) Implementation

This document describes the comprehensive internationalization implementation for the UAV Docking Management System frontend application.

## Overview

The application supports multiple languages with a robust i18n infrastructure built on `react-i18next`. Currently implemented languages:
- **English (en-US)** - Default language
- **Chinese (zh-CN)** - Simplified Chinese

## Architecture

### Core Dependencies
- `react-i18next` - React integration for i18next
- `i18next` - Core internationalization framework
- `i18next-browser-languagedetector` - Automatic language detection
- `i18next-resources-to-backend` - Dynamic resource loading

### File Structure
```
src/
├── lib/
│   └── i18n.ts                 # i18n configuration
├── locales/
│   ├── en-US/                  # English translations
│   │   ├── common.json         # Common UI elements
│   │   ├── navigation.json     # Navigation items
│   │   ├── dashboard.json      # Dashboard content
│   │   ├── uav.json           # UAV management
│   │   ├── forms.json         # Form elements
│   │   └── errors.json        # Error messages
│   └── zh-CN/                  # Chinese translations
│       ├── common.json
│       ├── navigation.json
│       ├── dashboard.json
│       ├── uav.json
│       ├── forms.json
│       └── errors.json
└── components/
    ├── providers/
    │   └── i18n-provider.tsx   # i18n context provider
    └── layout/
        └── language-switcher.tsx # Language selection component
```

## Configuration

### i18n Setup (`src/lib/i18n.ts`)
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => {
    return import(`../locales/${language}/${namespace}.json`)
  }))
  .init({
    lng: 'en-US',
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'zh-CN'],
    defaultNS: 'common',
    ns: ['common', 'navigation', 'dashboard', 'uav', 'forms', 'errors', 'map', 'battery', 'docking', 'hibernate', 'notifications', 'search'],
    // ... other options
  })
```

### Provider Integration
The `I18nProvider` is integrated at the root level in `src/components/providers/index.tsx`:

```typescript
export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <QueryProvider>
        <MotionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </MotionProvider>
      </QueryProvider>
    </I18nProvider>
  )
}
```

## Translation Namespaces

### 1. Common (`common.json`)
General UI elements, buttons, and universal terms:
- Basic actions: save, cancel, delete, edit, add, create
- Status indicators: active, inactive, online, offline
- Common labels: name, description, status, date, time

### 2. Navigation (`navigation.json`)
Navigation menu items and descriptions:
- Page names: dashboard, uavManagement, mapView
- Descriptions for each navigation item

### 3. Dashboard (`dashboard.json`)
Dashboard-specific content:
- Metrics labels: totalUAVs, activeFlights, lowBattery
- Section titles: systemStatus, batteryStatus, flightActivity
- Quick actions and overview content

### 4. UAV (`uav.json`)
UAV management interface:
- Form labels: rfidTag, ownerName, model, status
- Actions: addUAV, editUAV, deleteUAV, hibernateUAV
- Status values: authorized, unauthorized

### 5. Forms (`forms.json`)
Form-related content:
- Validation messages with interpolation support
- Button labels and form actions
- Success/error messages
- Placeholder text

### 6. Errors (`errors.json`)
Error messages and system notifications:
- General errors: networkError, serverError, timeoutError
- UAV-specific errors: notFound, alreadyExists, communicationLost
- Form validation errors
- Authentication errors

### 7. Map (`map.json`)
Map view interface content:
- Search and filter labels: searchPlaceholder, filterByStatus
- Map layers and controls: mapLayers, interactiveMap
- UAV selection and details: selectedUAV, batteryLevel, region
- Status indicators: authorized, unauthorized, active, hibernating

### 8. Battery (`battery.json`)
Battery monitoring interface:
- Status categories: healthy, warning, low, critical, charging
- Battery ranges: above60, range30to60, range15to30, below15
- Fleet metrics: fleetBatteryAverage, currentlyCharging
- Alerts and messages: criticalBatteryAlert, immediateAction

### 9. Docking (`docking.json`)
Docking station management:
- Station overview: totalStations, capacity, availability
- Port management: chargingPorts, available, occupied, error
- Actions: viewOnMap, managePorts, maintenanceRequired
- Status translations: stationStatus, portStatus

### 10. Hibernate (`hibernate.json`)
Hibernate pod management:
- Pod metrics: podCapacity, availableUAVs, hibernatingUAVs
- Actions: add, remove, readyForHibernation
- Alerts: podNearlyFull, podFullAlert
- Success/error messages with interpolation

## Usage Examples

### Basic Translation
```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('common')
  
  return (
    <button>{t('save')}</button>
  )
}
```

### Multiple Namespaces
```typescript
function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common'])
  
  return (
    <div>
      <h1>{t('dashboard:title')}</h1>
      <button>{t('common:refresh')}</button>
    </div>
  )
}
```

### Interpolation
```typescript
// Translation: "Must be at least {{min}} characters"
const message = t('forms:validation.minLength', { min: 3 })
```

### Pluralization
```typescript
// Translation: "{{count}} UAV(s) selected"
const message = t('uav:selectedCount', { count: selectedUAVs.length })
```

## Language Switching

The `LanguageSwitcher` component provides an intuitive interface for language selection:

```typescript
import { LanguageSwitcher } from '@/components/layout/language-switcher'

// Usage in header or navigation
<LanguageSwitcher />
```

Features:
- Dropdown menu with flag icons
- Native language names
- Persistent selection (localStorage)
- Automatic HTML lang attribute updates

## Language Detection

The system automatically detects user language preferences:
1. **localStorage** - Previously selected language
2. **navigator** - Browser language settings
3. **htmlTag** - HTML lang attribute
4. **fallback** - Default to English (en-US)

## Implementation Status

### ✅ Completed
- [x] Core i18n infrastructure setup
- [x] Translation files for English and Chinese (10 namespaces)
- [x] Language switcher component
- [x] Provider integration
- [x] Navigation component internationalization
- [x] Header component internationalization
- [x] Dashboard metrics internationalization
- [x] UAV management components internationalization
- [x] Map view components internationalization
- [x] Battery monitoring components internationalization
- [x] Docking station components internationalization
- [x] Hibernate pod components internationalization
- [x] Comprehensive test page with all namespaces

### 🚧 In Progress
- [ ] Complete remaining form validation messages
- [ ] Alert and notification components
- [ ] Error handling internationalization

### 📋 Remaining Tasks
- [ ] Date/time formatting localization
- [ ] Number formatting localization
- [ ] Chart and graph labels
- [ ] Mobile responsive components
- [ ] Accessibility improvements
- [ ] Complete form validation translations
- [ ] Toast notification translations

## Testing

A comprehensive test page is available at `/i18n-test` that demonstrates:
- Translation functionality across all namespaces
- Language switching
- Dynamic content updates
- Form and validation translations
- Dashboard metrics with sample data

## Best Practices

### 1. Translation Keys
- Use descriptive, hierarchical keys: `dashboard.metrics.totalUAVs`
- Group related translations in appropriate namespaces
- Use camelCase for consistency

### 2. Component Implementation
```typescript
// ✅ Good
const { t } = useTranslation(['dashboard', 'common'])
return <h1>{t('dashboard:title')}</h1>

// ❌ Avoid
return <h1>Dashboard</h1>
```

### 3. Validation Messages
```typescript
// ✅ Good - with interpolation
const schema = z.string().min(3, t('forms:validation.minLength', { min: 3 }))

// ❌ Avoid - hardcoded
const schema = z.string().min(3, 'Must be at least 3 characters')
```

### 4. Conditional Text
```typescript
// ✅ Good
const buttonText = isEditing ? t('common:update') : t('common:create')

// ❌ Avoid
const buttonText = isEditing ? 'Update' : 'Create'
```

## Contributing

When adding new features or components:

1. **Add translation keys** to appropriate namespace files
2. **Update both languages** (en-US and zh-CN)
3. **Use the `useTranslation` hook** in components
4. **Test language switching** functionality
5. **Update this documentation** if adding new namespaces

## Troubleshooting

### Common Issues

1. **Missing translations**: Check console for missing key warnings
2. **Language not switching**: Verify localStorage and browser settings
3. **Interpolation not working**: Ensure proper syntax: `{{variable}}`
4. **Namespace not loading**: Check import paths and namespace registration

### Debug Mode
Enable debug mode in development:
```typescript
// In src/lib/i18n.ts
debug: process.env.NODE_ENV === 'development'
```

This will log translation loading and missing key information to the console.
