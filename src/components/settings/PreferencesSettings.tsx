'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Save, Monitor, Code, Globe, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface PreferencesSettingsProps {
  settings: {
    id: string
    defaultWorkspaceModule: string
    editorTheme: string
    editorFontSize: number
    editorTabSize: number
    editorWordWrap: boolean
    preferredLanguage: string
    timezone: string
    dateFormat: string
    timeFormat: string
    emailNotifications: boolean
    inAppNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
  } | null
  onUpdate: () => void
}

export function PreferencesSettings({ settings, onUpdate }: PreferencesSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Default values for when settings is null
  const defaultSettings = {
    defaultWorkspaceModule: 'editor',
    editorTheme: 'vs-dark',
    editorFontSize: 14,
    editorTabSize: 2,
    editorWordWrap: true,
    preferredLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    emailNotifications: true,
    inAppNotifications: true,
    pushNotifications: false,
    marketingEmails: false
  }
  
  const [formData, setFormData] = useState({
    defaultWorkspaceModule: settings?.defaultWorkspaceModule || defaultSettings.defaultWorkspaceModule,
    editorTheme: settings?.editorTheme || defaultSettings.editorTheme,
    editorFontSize: settings?.editorFontSize || defaultSettings.editorFontSize,
    editorTabSize: settings?.editorTabSize || defaultSettings.editorTabSize,
    editorWordWrap: settings?.editorWordWrap ?? defaultSettings.editorWordWrap,
    preferredLanguage: settings?.preferredLanguage || defaultSettings.preferredLanguage,
    timezone: settings?.timezone || defaultSettings.timezone,
    dateFormat: settings?.dateFormat || defaultSettings.dateFormat,
    timeFormat: settings?.timeFormat || defaultSettings.timeFormat,
    emailNotifications: settings?.emailNotifications ?? defaultSettings.emailNotifications,
    inAppNotifications: settings?.inAppNotifications ?? defaultSettings.inAppNotifications,
    pushNotifications: settings?.pushNotifications ?? defaultSettings.pushNotifications,
    marketingEmails: settings?.marketingEmails ?? defaultSettings.marketingEmails
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Preferences updated successfully')
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const workspaceModules = [
    { value: 'editor', label: 'Code Editor', description: 'Start with the code editor' },
    { value: 'ui_studio', label: 'UI Studio', description: 'Start with the UI design tool' },
    { value: 'sandbox', label: 'Sandbox', description: 'Start with the live preview' },
    { value: 'deployer', label: 'Deployer', description: 'Start with deployment tools' }
  ]

  const editorThemes = [
    { value: 'vs-dark', label: 'Dark (VS Code)' },
    { value: 'vs-light', label: 'Light (VS Code)' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'github', label: 'GitHub' },
    { value: 'solarized-dark', label: 'Solarized Dark' },
    { value: 'solarized-light', label: 'Solarized Light' }
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' }
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' }
  ]

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workspace Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Workspace Preferences
            </CardTitle>
            <CardDescription>
              Configure your default workspace settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Default Workspace Module</Label>
              <Select
                value={formData.defaultWorkspaceModule}
                onValueChange={(value) => setFormData(prev => ({ ...prev, defaultWorkspaceModule: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workspaceModules.map((module) => (
                    <SelectItem key={module.value} value={module.value}>
                      <div>
                        <div className="font-medium">{module.label}</div>
                        <div className="text-sm text-gray-500">{module.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Editor Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Editor Preferences
            </CardTitle>
            <CardDescription>
              Customize your code editor experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={formData.editorTheme}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, editorTheme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editorThemes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Size: {formData.editorFontSize}px</Label>
                <Slider
                  value={[formData.editorFontSize]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, editorFontSize: value }))}
                  min={8}
                  max={32}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Tab Size: {formData.editorTabSize}</Label>
                <Slider
                  value={[formData.editorTabSize]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, editorTabSize: value }))}
                  min={1}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Word Wrap</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.editorWordWrap}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, editorWordWrap: checked }))}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.editorWordWrap ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Localization
            </CardTitle>
            <CardDescription>
              Set your language and timezone preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={formData.preferredLanguage}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Input
                  value={formData.dateFormat}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateFormat: e.target.value }))}
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select
                  value={formData.timeFormat}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timeFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Show notifications within the application
                  </p>
                </div>
                <Switch
                  checked={formData.inAppNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inAppNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive product updates and promotional content
                  </p>
                </div>
                <Switch
                  checked={formData.marketingEmails}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
