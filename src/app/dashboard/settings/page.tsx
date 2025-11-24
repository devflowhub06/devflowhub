'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Key,
  Github,
  Gitlab,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { PreferencesSettings } from '@/components/settings/PreferencesSettings'
import { NotificationsSettings } from '@/components/settings/NotificationsSettings'
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { BillingSettings } from '@/components/settings/BillingSettings'
import BillingDashboard from '@/components/billing/BillingDashboard'
import { TeamSettings } from '@/components/settings/TeamSettings'

interface SettingsData {
  user: {
    id: string
    name: string
    email: string
    image: string
    bio: string
    plan: string
    twoFactorEnabled: boolean
    createdAt: string
  } | null
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
  integrations: Array<{
    id: string
    provider: string
    displayName: string
    connectionState: string
    lastTestedAt: string
    errorMessage: string
    scopes: string[]
    createdAt: string
  }> | null
  apiKeys: Array<{
    id: string
    name: string
    scope: string[]
    lastUsedAt: string
    lastUsedIp: string
    createdAt: string
  }> | null
  notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    read: boolean
    createdAt: string
  }> | null
  billingUsage: {
    aiTokensUsed: number
    previewMinutes: number
    sandboxesStarted: number
    deployments: number
    storageBytes: number
    cost: number
  } | null
  memberships: Array<{
    id: string
    role: string
    team: {
      id: string
      name: string
      description: string
      createdAt: string
    }
  }> | null
  teamMembers: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
      image: string
    }
    team: {
      id: string
      name: string
    }
    invitedAt: string
    acceptedAt: string
  }> | null
}

export default function SettingsPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status
  const router = useRouter()
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchSettingsData()
  }, [status, router])

  const fetchSettingsData = async () => {
    try {
      const response = await fetch('/api/settings', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSettingsData(data)
      } else {
        console.error('Failed to fetch settings data')
      }
    } catch (error) {
      console.error('Error fetching settings data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settingsData) {
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Failed to load settings
          </h2>
          <Button onClick={fetchSettingsData}>
            Try Again
          </Button>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
          </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings 
              user={settingsData.user}
              onUpdate={fetchSettingsData}
            />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesSettings 
              settings={settingsData.settings}
              onUpdate={fetchSettingsData}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsSettings 
              notifications={settingsData.notifications}
              onUpdate={fetchSettingsData}
            />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsSettings 
              integrations={settingsData.integrations}
              onUpdate={fetchSettingsData}
            />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings 
              user={settingsData.user}
              apiKeys={settingsData.apiKeys}
              onUpdate={fetchSettingsData}
            />
          </TabsContent>

          <TabsContent value="billing">
            <BillingDashboard />
          </TabsContent>

          <TabsContent value="team">
            <TeamSettings 
              memberships={settingsData.memberships}
              teamMembers={settingsData.teamMembers}
              onUpdate={fetchSettingsData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 