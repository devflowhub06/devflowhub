'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SecuritySettingsProps {
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
  apiKeys: Array<{
    id: string
    name: string
    scope: string[]
    lastUsedAt: string
    lastUsedIp: string
    createdAt: string
  }>
  onUpdate: () => void
}

export function SecuritySettings({ user, apiKeys, onUpdate }: SecuritySettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateKey, setShowCreateKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyScope, setNewKeyScope] = useState<string[]>(['read'])
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName,
          scope: newKeyScope
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedKey(data.apiKey.rawKey)
        setShowKey(true)
        toast.success('API key created successfully')
        onUpdate()
        setNewKeyName('')
        setNewKeyScope(['read'])
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create API key')
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Failed to create API key')
    } finally {
      setIsLoading(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/settings/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('API key revoked successfully')
        onUpdate()
      } else {
        toast.error('Failed to revoke API key')
      }
    } catch (error) {
      console.error('Error revoking API key:', error)
      toast.error('Failed to revoke API key')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const scopeOptions = [
    { value: 'read', label: 'Read', description: 'Read access to your projects' },
    { value: 'write', label: 'Write', description: 'Write access to your projects' },
    { value: 'deploy', label: 'Deploy', description: 'Deploy your projects' },
    { value: 'admin', label: 'Admin', description: 'Full administrative access' }
  ]

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">2FA Status</h3>
                <Badge variant={user.twoFactorEnabled ? 'default' : 'secondary'}>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {user.twoFactorEnabled 
                  ? 'Your account is protected with two-factor authentication'
                  : 'Enable two-factor authentication to secure your account'
                }
              </p>
            </div>
            <Button variant={user.twoFactorEnabled ? 'outline' : 'default'}>
              {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateKey(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No API keys
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create an API key to access DevFlowHub programmatically
              </p>
              <Button onClick={() => setShowCreateKey(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{key.name}</h3>
                      <Badge variant="outline">
                        {key.scope.join(', ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && (
                        <span className="ml-2">
                          • Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {key.lastUsedIp && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last used from: {key.lastUsedIp}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeApiKey(key.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Modal */}
      {showCreateKey && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key for programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., My App Integration"
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {scopeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={option.value}
                      checked={newKeyScope.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKeyScope([...newKeyScope, option.value])
                        } else {
                          setNewKeyScope(newKeyScope.filter(s => s !== option.value))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={option.value} className="text-sm">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        - {option.description}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateKey(false)
                  setNewKeyName('')
                  setNewKeyScope(['read'])
                }}
              >
                Cancel
              </Button>
              <Button onClick={createApiKey} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Key'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Created Key Display */}
      {createdKey && showKey && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              API Key Created
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Copy this key now - you won't be able to see it again
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                value={createdKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(createdKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowKey(false)
                  setCreatedKey(null)
                }}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • Keep your API keys secure and never share them publicly
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • Use environment variables to store API keys in your applications
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • Regularly rotate your API keys for better security
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • Enable two-factor authentication for additional account protection
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
