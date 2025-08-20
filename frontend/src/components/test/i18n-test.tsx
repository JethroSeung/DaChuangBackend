'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import {
  Plane,
  Activity,
  Battery,
  AlertTriangle,
  Shield,
  Home,
  MapPin,
  Users,
  Settings,
  BarChart3
} from 'lucide-react'

export function I18nTest() {
  const { t, i18n } = useTranslation(['common', 'navigation', 'dashboard', 'uav', 'forms', 'map', 'battery', 'docking', 'hibernate', 'notifications', 'search'])

  const testSections = [
    {
      title: 'Common Translations',
      namespace: 'common',
      keys: [
        'appName',
        'appDescription',
        'loading',
        'save',
        'cancel',
        'delete',
        'edit',
        'add',
        'create',
        'search',
        'filter',
        'refresh'
      ]
    },
    {
      title: 'Navigation Translations',
      namespace: 'navigation',
      keys: [
        'dashboard',
        'uavmanagement',
        'mapview',
        'hibernatepod',
        'dockingstations',
        'batterymonitor',
        'settings'
      ]
    },
    {
      title: 'Dashboard Translations',
      namespace: 'dashboard',
      keys: [
        'title',
        'subtitle',
        'totalUAVs',
        'activeFlights',
        'lowBattery',
        'alerts',
        'systemStatus',
        'batteryStatus',
        'flightActivity'
      ]
    },
    {
      title: 'UAV Management Translations',
      namespace: 'uav',
      keys: [
        'title',
        'subtitle',
        'addUAV',
        'createUAV',
        'editUAV',
        'deleteUAV',
        'basicInformation',
        'rfidTag',
        'ownerName',
        'model',
        'status',
        'authorized',
        'unauthorized'
      ]
    },
    {
      title: 'Form Translations',
      namespace: 'forms',
      keys: [
        'validation.required',
        'validation.minLength',
        'validation.maxLength',
        'validation.email',
        'validation.positive',
        'buttons.submit',
        'buttons.save',
        'buttons.cancel',
        'messages.saveSuccess',
        'messages.saveError'
      ]
    },
    {
      title: 'Map Translations',
      namespace: 'map',
      keys: [
        'title',
        'subtitle',
        'searchPlaceholder',
        'filterByStatus',
        'interactiveMap',
        'selectedUAV',
        'batteryLevel',
        'region',
        'lastSeen'
      ]
    },
    {
      title: 'Battery Translations',
      namespace: 'battery',
      keys: [
        'title',
        'subtitle',
        'healthy',
        'warning',
        'low',
        'critical',
        'charging',
        'fleetBatteryAverage'
      ]
    },
    {
      title: 'Docking Translations',
      namespace: 'docking',
      keys: [
        'title',
        'subtitle',
        'totalStations',
        'capacity',
        'availability',
        'chargingPorts',
        'viewOnMap'
      ]
    },
    {
      title: 'Hibernate Translations',
      namespace: 'hibernate',
      keys: [
        'title',
        'subtitle',
        'podCapacity',
        'availableUAVs',
        'hibernatingUAVs',
        'readyForHibernation'
      ]
    },
    {
      title: 'Notifications Translations',
      namespace: 'notifications',
      keys: [
        'title',
        'subtitle',
        'markAllRead',
        'clearAll',
        'noNotifications',
        'markAsRead',
        'delete',
        'viewDetails'
      ]
    },
    {
      title: 'Search Translations',
      namespace: 'search',
      keys: [
        'title',
        'placeholder',
        'noResults',
        'recent',
        'suggestions',
        'uavs',
        'pages',
        'commands'
      ]
    }
  ]

  const quickStats = [
    {
      title: t('dashboard:totalUAVs'),
      value: 24,
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('dashboard:activeFlights'),
      value: 3,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: t('dashboard:lowBattery'),
      value: 2,
      icon: Battery,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: t('dashboard:alerts'),
      value: 1,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  const navigationItems = [
    { key: 'dashboard', icon: BarChart3 },
    { key: 'uavmanagement', icon: Plane },
    { key: 'mapview', icon: MapPin },
    { key: 'hibernatepod', icon: Home },
    { key: 'dockingstations', icon: Shield },
    { key: 'batterymonitor', icon: Battery },
    { key: 'users', icon: Users },
    { key: 'settings', icon: Settings }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('common:appName')} - I18n Test</h1>
          <p className="text-muted-foreground">{t('common:appDescription')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Current Language: <Badge variant="outline">{i18n.language}</Badge>
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Quick Stats Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Metrics Demo</CardTitle>
          <CardDescription>Testing dashboard translations with sample data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Translations Demo</CardTitle>
          <CardDescription>Testing navigation item translations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.key} className="flex items-center space-x-2 p-2 rounded-lg border">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t(`navigation:${item.key}`)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(`navigation:${item.key}Description`)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Translation Test Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>Namespace: {section.namespace}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.keys.map((key) => (
                  <div key={key} className="flex justify-between items-center p-2 rounded border">
                    <code className="text-sm text-muted-foreground">{key}</code>
                    <span className="text-sm">{t(`${section.namespace}:${key}`)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Form Translations Demo</CardTitle>
          <CardDescription>Testing form-related translations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button>{t('forms:buttons.save')}</Button>
              <Button variant="outline">{t('forms:buttons.cancel')}</Button>
              <Button variant="destructive">{t('common:delete')}</Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-green-600">{t('forms:messages.saveSuccess')}</p>
              <p className="text-sm text-red-600">{t('forms:messages.saveError')}</p>
              <p className="text-sm text-yellow-600">{t('forms:validation.required')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Info */}
      <Card>
        <CardHeader>
          <CardTitle>Language Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Current Language:</strong> {i18n.language}</p>
            <p><strong>Fallback Language:</strong> {i18n.options.fallbackLng}</p>
            <p><strong>Supported Languages:</strong> {i18n.options.supportedLngs?.join(', ')}</p>
            <p><strong>Loaded Namespaces:</strong> {i18n.options.ns?.join(', ')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
