'use client'

import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  MapPin,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemSettings {
  general: {
    systemName: string
    timezone: string
    language: string
    theme: 'light' | 'dark' | 'auto'
    autoRefresh: boolean
    refreshInterval: number
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    criticalAlerts: boolean
    maintenanceAlerts: boolean
    batteryAlerts: boolean
    communicationAlerts: boolean
    alertSound: boolean
  }
  security: {
    sessionTimeout: number
    passwordExpiry: number
    twoFactorAuth: boolean
    auditLogging: boolean
    ipWhitelist: boolean
    maxLoginAttempts: number
  }
  operations: {
    maxFlightAltitude: number
    defaultFlightSpeed: number
    batteryLowThreshold: number
    batteryCriticalThreshold: number
    autoReturnBattery: number
    geofenceEnabled: boolean
    weatherIntegration: boolean
  }
  system: {
    dataRetention: number
    backupFrequency: string
    logLevel: string
    maintenanceMode: boolean
    debugMode: boolean
  }
}

// Mock settings data
const mockSettings: SystemSettings = {
  general: {
    systemName: 'UAV Docking Management System',
    timezone: 'UTC+8',
    language: 'en-US',
    theme: 'auto',
    autoRefresh: true,
    refreshInterval: 30
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    criticalAlerts: true,
    maintenanceAlerts: true,
    batteryAlerts: true,
    communicationAlerts: true,
    alertSound: false
  },
  security: {
    sessionTimeout: 60,
    passwordExpiry: 90,
    twoFactorAuth: false,
    auditLogging: true,
    ipWhitelist: false,
    maxLoginAttempts: 5
  },
  operations: {
    maxFlightAltitude: 150,
    defaultFlightSpeed: 25,
    batteryLowThreshold: 30,
    batteryCriticalThreshold: 15,
    autoReturnBattery: 20,
    geofenceEnabled: true,
    weatherIntegration: true
  },
  system: {
    dataRetention: 365,
    backupFrequency: 'daily',
    logLevel: 'info',
    maintenanceMode: false,
    debugMode: false
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(mockSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(mockSettings)
    setHasChanges(false)
  }

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'operations', label: 'Operations', icon: MapPin },
    { id: 'system', label: 'System', icon: Database }
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              System Settings
            </h1>
            <p className="text-muted-foreground">
              Configure system preferences and operational parameters
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              <Save className={cn("h-4 w-4 mr-2", saving && "animate-spin")} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {hasChanges && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center space-x-2 py-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                You have unsaved changes. Don&apos;t forget to save your settings.
              </span>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors",
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>General Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Basic system configuration and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">System Name</Label>
                      <Input
                        id="systemName"
                        value={settings.general.systemName}
                        onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="UTC+8">UTC+8 (Beijing)</option>
                        <option value="UTC+0">UTC+0 (London)</option>
                        <option value="UTC-5">UTC-5 (New York)</option>
                        <option value="UTC-8">UTC-8 (Los Angeles)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        value={settings.general.language}
                        onChange={(e) => updateSetting('general', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="zh-CN">中文 (简体)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <select
                        id="theme"
                        value={settings.general.theme}
                        onChange={(e) => updateSetting('general', 'theme', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Refresh</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically refresh data at regular intervals
                        </p>
                      </div>
                      <Switch
                        checked={settings.general.autoRefresh}
                        onCheckedChange={(checked) => updateSetting('general', 'autoRefresh', checked)}
                      />
                    </div>

                    {settings.general.autoRefresh && (
                      <div className="space-y-2">
                        <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                        <Input
                          id="refreshInterval"
                          type="number"
                          min="10"
                          max="300"
                          value={settings.general.refreshInterval}
                          onChange={(e) => updateSetting('general', 'refreshInterval', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure alert and notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alert Sound</Label>
                        <p className="text-sm text-muted-foreground">
                          Play sound for critical alerts
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.alertSound}
                        onCheckedChange={(checked) => updateSetting('notifications', 'alertSound', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Alert Types</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Critical Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          System failures and emergencies
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.criticalAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'criticalAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Battery Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Low battery warnings
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.batteryAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'batteryAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Scheduled maintenance reminders
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.maintenanceAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'maintenanceAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Communication Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Connection and network issues
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.communicationAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'communicationAlerts', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure security and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="15"
                        max="480"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        min="30"
                        max="365"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full md:w-1/2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Require 2FA for all user accounts
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactorAuth}
                        onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">
                          Log all user actions and system events
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.auditLogging}
                        onCheckedChange={(checked) => updateSetting('security', 'auditLogging', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>IP Whitelist</Label>
                        <p className="text-sm text-muted-foreground">
                          Restrict access to whitelisted IP addresses
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.ipWhitelist}
                        onCheckedChange={(checked) => updateSetting('security', 'ipWhitelist', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'operations' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Operational Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure UAV operational parameters and safety limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxFlightAltitude">Max Flight Altitude (m)</Label>
                      <Input
                        id="maxFlightAltitude"
                        type="number"
                        min="50"
                        max="500"
                        value={settings.operations.maxFlightAltitude}
                        onChange={(e) => updateSetting('operations', 'maxFlightAltitude', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultFlightSpeed">Default Flight Speed (m/s)</Label>
                      <Input
                        id="defaultFlightSpeed"
                        type="number"
                        min="5"
                        max="50"
                        value={settings.operations.defaultFlightSpeed}
                        onChange={(e) => updateSetting('operations', 'defaultFlightSpeed', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Battery Thresholds</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="batteryLowThreshold">Low Battery (%)</Label>
                        <Input
                          id="batteryLowThreshold"
                          type="number"
                          min="20"
                          max="50"
                          value={settings.operations.batteryLowThreshold}
                          onChange={(e) => updateSetting('operations', 'batteryLowThreshold', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batteryCriticalThreshold">Critical Battery (%)</Label>
                        <Input
                          id="batteryCriticalThreshold"
                          type="number"
                          min="5"
                          max="25"
                          value={settings.operations.batteryCriticalThreshold}
                          onChange={(e) => updateSetting('operations', 'batteryCriticalThreshold', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="autoReturnBattery">Auto Return (%)</Label>
                        <Input
                          id="autoReturnBattery"
                          type="number"
                          min="10"
                          max="30"
                          value={settings.operations.autoReturnBattery}
                          onChange={(e) => updateSetting('operations', 'autoReturnBattery', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Geofence Enabled</Label>
                        <p className="text-sm text-muted-foreground">
                          Enforce geographical boundaries for UAV operations
                        </p>
                      </div>
                      <Switch
                        checked={settings.operations.geofenceEnabled}
                        onCheckedChange={(checked) => updateSetting('operations', 'geofenceEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weather Integration</Label>
                        <p className="text-sm text-muted-foreground">
                          Consider weather conditions for flight planning
                        </p>
                      </div>
                      <Switch
                        checked={settings.operations.weatherIntegration}
                        onCheckedChange={(checked) => updateSetting('operations', 'weatherIntegration', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'system' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>System Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure system maintenance and data management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Data Retention (days)</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        min="30"
                        max="1095"
                        value={settings.system.dataRetention}
                        onChange={(e) => updateSetting('system', 'dataRetention', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <select
                        id="backupFrequency"
                        value={settings.system.backupFrequency}
                        onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logLevel">Log Level</Label>
                    <select
                      id="logLevel"
                      value={settings.system.logLevel}
                      onChange={(e) => updateSetting('system', 'logLevel', e.target.value)}
                      className="w-full md:w-1/2 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable maintenance mode to restrict system access
                        </p>
                      </div>
                      <Switch
                        checked={settings.system.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Debug Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable debug mode for troubleshooting
                        </p>
                      </div>
                      <Switch
                        checked={settings.system.debugMode}
                        onCheckedChange={(checked) => updateSetting('system', 'debugMode', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
