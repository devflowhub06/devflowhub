'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface EnvManagerProps {
  projectId: string
}

interface EnvironmentVariable {
  key: string
  value: string
  isSecret: boolean
}

export function EnvManager({ projectId }: EnvManagerProps) {
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([])
  const [newVar, setNewVar] = useState({ key: '', value: '', isSecret: false })
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadEnvironmentVariables()
  }, [projectId])

  const loadEnvironmentVariables = async () => {
    try {
      setIsLoading(true)
      // Mock environment variables for demo
      setEnvVars([
        { key: 'NODE_ENV', value: 'production', isSecret: false },
        { key: 'DATABASE_URL', value: 'postgresql://user:pass@localhost:5432/db', isSecret: true },
        { key: 'API_KEY', value: 'sk-1234567890abcdef', isSecret: true },
        { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.example.com', isSecret: false }
      ])
    } catch (error) {
      console.error('Failed to load environment variables:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVariable = () => {
    if (newVar.key.trim() && newVar.value.trim()) {
      setEnvVars([...envVars, { ...newVar }])
      setNewVar({ key: '', value: '', isSecret: false })
    }
  }

  const handleRemoveVariable = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index))
  }

  const handleToggleSecretVisibility = (index: number) => {
    const newVisibleSecrets = new Set(visibleSecrets)
    const key = `${index}`
    if (newVisibleSecrets.has(key)) {
      newVisibleSecrets.delete(key)
    } else {
      newVisibleSecrets.add(key)
    }
    setVisibleSecrets(newVisibleSecrets)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // In a real implementation, this would save to the backend
      console.log('Saving environment variables:', envVars)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error('Failed to save environment variables:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const maskValue = (value: string) => {
    return '•'.repeat(Math.min(value.length, 20))
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading environment variables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Environment Variables</h2>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Add New Variable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-600" />
                <span>Add Environment Variable</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="key">Variable Name</Label>
                  <Input
                    id="key"
                    placeholder="e.g., DATABASE_URL"
                    value={newVar.key}
                    onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type={newVar.isSecret ? 'password' : 'text'}
                    placeholder="Enter value..."
                    value={newVar.value}
                    onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                  />
                </div>
                
                <div className="flex items-end space-x-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isSecret"
                      checked={newVar.isSecret}
                      onChange={(e) => setNewVar({ ...newVar, isSecret: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isSecret" className="text-sm">
                      Secret
                    </Label>
                  </div>
                  
                  <Button onClick={handleAddVariable} disabled={!newVar.key.trim() || !newVar.value.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables List */}
          <Card>
            <CardHeader>
              <CardTitle>Current Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              {envVars.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Environment Variables</h3>
                  <p className="text-slate-600">Add environment variables to configure your deployment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {envVars.map((envVar, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-sm font-medium">{envVar.key}</span>
                          {envVar.isSecret && (
                            <Badge variant="secondary" className="text-xs">
                              Secret
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm text-slate-600">
                            {envVar.isSecret && !visibleSecrets.has(index.toString())
                              ? maskValue(envVar.value)
                              : envVar.value
                            }
                          </span>
                          
                          {envVar.isSecret && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleSecretVisibility(index)}
                            >
                              {visibleSecrets.has(index.toString()) ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveVariable(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Security Notice</h4>
                  <p className="text-sm text-yellow-700">
                    Environment variables marked as "Secret" will be encrypted and masked in logs. 
                    Never commit sensitive values to your repository.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
