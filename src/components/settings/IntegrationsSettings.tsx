'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Github, 
  Gitlab, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface IntegrationsSettingsProps {
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
  onUpdate: () => void
}

export function IntegrationsSettings({ integrations, onUpdate }: IntegrationsSettingsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="h-5 w-5" />
      case 'gitlab':
        return <Gitlab className="h-5 w-5" />
      case 'vercel':
        return <ExternalLink className="h-5 w-5" />
      case 'netlify':
        return <ExternalLink className="h-5 w-5" />
      case 'linear':
        return <ExternalLink className="h-5 w-5" />
      case 'jira':
        return <ExternalLink className="h-5 w-5" />
      default:
        return <ExternalLink className="h-5 w-5" />
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'GitHub'
      case 'gitlab':
        return 'GitLab'
      case 'vercel':
        return 'Vercel'
      case 'netlify':
        return 'Netlify'
      case 'linear':
        return 'Linear'
      case 'jira':
        return 'Jira'
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1)
    }
  }

  const getConnectionStatus = (state: string) => {
    switch (state) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{state}</Badge>
    }
  }

  const connectIntegration = async (provider: string) => {
    setIsLoading(provider)
    try {
      const response = await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.oauthUrl) {
          // Redirect to OAuth URL
          window.open(data.oauthUrl, '_blank')
          toast.success(`Redirecting to ${getProviderName(provider)}...`)
        } else {
          toast.success(`${getProviderName(provider)} connected successfully`)
          onUpdate()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to connect to ${getProviderName(provider)}`)
      }
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error)
      toast.error(`Failed to connect to ${getProviderName(provider)}`)
    } finally {
      setIsLoading(null)
    }
  }

  const disconnectIntegration = async (integrationId: string, provider: string) => {
    setIsLoading(integrationId)
    try {
      const response = await fetch(`/api/settings/integrations/${integrationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success(`${getProviderName(provider)} disconnected successfully`)
        onUpdate()
      } else {
        toast.error(`Failed to disconnect from ${getProviderName(provider)}`)
      }
    } catch (error) {
      console.error(`Error disconnecting from ${provider}:`, error)
      toast.error(`Failed to disconnect from ${getProviderName(provider)}`)
    } finally {
      setIsLoading(null)
    }
  }

  const testConnection = async (integrationId: string, provider: string) => {
    setIsLoading(`test-${integrationId}`)
    try {
      const response = await fetch(`/api/settings/integrations/${integrationId}/test`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success(`${getProviderName(provider)} connection test successful`)
        onUpdate()
      } else {
        toast.error(`${getProviderName(provider)} connection test failed`)
      }
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error)
      toast.error(`Failed to test ${getProviderName(provider)} connection`)
    } finally {
      setIsLoading(null)
    }
  }

  const availableProviders = [
    { id: 'github', name: 'GitHub', description: 'Connect your GitHub repositories' },
    { id: 'gitlab', name: 'GitLab', description: 'Connect your GitLab repositories' },
    { id: 'vercel', name: 'Vercel', description: 'Deploy to Vercel' },
    { id: 'netlify', name: 'Netlify', description: 'Deploy to Netlify' },
    { id: 'linear', name: 'Linear', description: 'Sync AI-generated tasks to Linear' },
    { id: 'jira', name: 'Jira', description: 'Sync AI-generated tasks to Jira' }
  ]

  const connectedProviders = integrations.map(i => i.provider)
  const unconnectedProviders = availableProviders.filter(p => !connectedProviders.includes(p.id))

  return (
    <div className="space-y-6">
      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Connect your favorite tools and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unconnectedProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getProviderIcon(provider.id)}
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {provider.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => connectIntegration(provider.id)}
                  disabled={isLoading === provider.id}
                  size="sm"
                >
                  {isLoading === provider.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Integrations</CardTitle>
            <CardDescription>
              Manage your connected services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getProviderIcon(integration.provider)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{integration.displayName}</h3>
                        {getConnectionStatus(integration.connectionState)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getProviderName(integration.provider)}
                        {integration.scopes.length > 0 && (
                          <span className="ml-2">
                            • {integration.scopes.join(', ')}
                          </span>
                        )}
                      </p>
                      {integration.lastTestedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last tested: {new Date(integration.lastTestedAt).toLocaleString()}
                        </p>
                      )}
                      {integration.errorMessage && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {integration.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {integration.connectionState === 'connected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(integration.id, integration.provider)}
                        disabled={isLoading === `test-${integration.id}`}
                      >
                        {isLoading === `test-${integration.id}` ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectIntegration(integration.id, integration.provider)}
                      disabled={isLoading === integration.id}
                    >
                      {isLoading === integration.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Help */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Learn more about our integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>GitHub/GitLab:</strong> Access your repositories and enable automated deployments
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>Vercel/Netlify:</strong> Deploy your projects with one click
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>API Keys:</strong> Use our API to integrate with your own tools
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
