'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText } from '@/components/layout/ResponsiveContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Zap,
  Play,
  Pause,
  Trash2,
  Edit,
  Plus,
  Eye,
  GitBranch,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface Macro {
  id: string
  name: string
  description: string | null
  steps: any[]
  gitTrigger: any
  runCount: number
  lastRun: string | null
  createdAt: string
  runs: MacroRun[]
  _count: {
    runs: number
  }
}

interface MacroRun {
  id: string
  status: string
  outcome: string | null
  tokenUsage: number
  cost: number
  startedAt: string
  completedAt: string | null
  logs: any
}

export default function AIMacrosPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const [macros, setMacros] = useState<Macro[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMacro, setSelectedMacro] = useState<Macro | null>(null)
  const [runningMacros, setRunningMacros] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMacros()
  }, [])

  const fetchMacros = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ai/macros', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setMacros(data.macros || [])
      } else {
        toast.error('Failed to fetch macros')
      }
    } catch (error) {
      console.error('Error fetching macros:', error)
      toast.error('Error loading macros')
    } finally {
      setLoading(false)
    }
  }

  const executeMacro = async (macroId: string, dryRun: boolean = false) => {
    try {
      setRunningMacros(prev => new Set(prev).add(macroId))

      const response = await fetch(`/api/ai/macros/${macroId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ dryRun }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Macro execution started')

        // Poll for status
        pollMacroRun(data.runId, macroId)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to execute macro')
        setRunningMacros(prev => {
          const next = new Set(prev)
          next.delete(macroId)
          return next
        })
      }
    } catch (error) {
      console.error('Error executing macro:', error)
      toast.error('Error executing macro')
      setRunningMacros(prev => {
        const next = new Set(prev)
        next.delete(macroId)
        return next
      })
    }
  }

  const pollMacroRun = async (runId: string, macroId: string) => {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/ai/macros/runs/${runId}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          const run = data.run

          if (run.status === 'completed' || run.status === 'failed') {
            setRunningMacros(prev => {
              const next = new Set(prev)
              next.delete(macroId)
              return next
            })

            if (run.status === 'completed') {
              toast.success('Macro completed successfully!')
            } else {
              toast.error('Macro execution failed')
            }

            fetchMacros() // Refresh macros list
            return
          }

          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            toast.warning('Macro is still running. Check back later.')
            setRunningMacros(prev => {
              const next = new Set(prev)
              next.delete(macroId)
              return next
            })
          }
        }
      } catch (error) {
        console.error('Error polling macro run:', error)
        setRunningMacros(prev => {
          const next = new Set(prev)
          next.delete(macroId)
          return next
        })
      }
    }

    poll()
  }

  const deleteMacro = async (macroId: string) => {
    if (!confirm('Are you sure you want to delete this macro?')) {
      return
    }

    try {
      const response = await fetch(`/api/ai/macros/${macroId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Macro deleted')
        fetchMacros()
      } else {
        toast.error('Failed to delete macro')
      }
    } catch (error) {
      console.error('Error deleting macro:', error)
      toast.error('Error deleting macro')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <ResponsiveContainer maxWidth="4xl">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer maxWidth="4xl" padding="responsive">
      {/* Header */}
      <div className="flex items-center justify-between mb-responsive">
        <div>
          <ResponsiveText size="3xl" className="font-bold text-gray-900 dark:text-white">
            AI Macros
          </ResponsiveText>
          <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
            Automate repetitive tasks with AI-powered macros
          </ResponsiveText>
        </div>
        <Button className="btn-responsive-md bg-blue-600 hover:bg-blue-700">
          <Plus className="icon-responsive-sm mr-2" />
          Create Macro
        </Button>
      </div>

      {/* Stats Cards */}
      <ResponsiveGrid cols="auto" gap="responsive" className="mb-responsive">
        <Card className="card-responsive">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="icon-responsive-md text-blue-600" />
            </div>
            <div>
              <ResponsiveText size="xs" className="text-gray-500">
                Total Macros
              </ResponsiveText>
              <ResponsiveText size="2xl" className="font-bold text-gray-900">
                {macros.length}
              </ResponsiveText>
            </div>
          </div>
        </Card>

        <Card className="card-responsive">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="icon-responsive-md text-green-600" />
            </div>
            <div>
              <ResponsiveText size="xs" className="text-gray-500">
                Total Runs
              </ResponsiveText>
              <ResponsiveText size="2xl" className="font-bold text-gray-900">
                {macros.reduce((sum, m) => sum + m.runCount, 0)}
              </ResponsiveText>
            </div>
          </div>
        </Card>

        <Card className="card-responsive">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="icon-responsive-md text-purple-600" />
            </div>
            <div>
              <ResponsiveText size="xs" className="text-gray-500">
                Active Macros
              </ResponsiveText>
              <ResponsiveText size="2xl" className="font-bold text-gray-900">
                {runningMacros.size}
              </ResponsiveText>
            </div>
          </div>
        </Card>
      </ResponsiveGrid>

      {/* Macros List */}
      {macros.length === 0 ? (
        <Card className="card-responsive text-center">
          <div className="py-12">
            <Zap className="icon-responsive-xl mx-auto text-gray-400 mb-4" />
            <ResponsiveText size="xl" className="font-semibold text-gray-900 mb-2">
              No macros yet
            </ResponsiveText>
            <ResponsiveText size="sm" className="text-gray-600 mb-6">
              Create your first AI macro to automate repetitive tasks
            </ResponsiveText>
            <Button className="btn-responsive-md">
              <Plus className="icon-responsive-sm mr-2" />
              Create Your First Macro
            </Button>
          </div>
        </Card>
      ) : (
        <ResponsiveGrid cols="auto" gap="responsive">
          {macros.map((macro) => (
            <Card key={macro.id} className="card-responsive hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-responsive-lg flex items-center gap-2">
                      {macro.name}
                      {macro.gitTrigger && (
                        <Badge variant="outline" className="text-xs">
                          <GitBranch className="w-3 h-3 mr-1" />
                          Git Trigger
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-responsive-sm mt-1">
                      {macro.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Macro Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <ResponsiveText size="xs" className="text-gray-500">
                        Steps
                      </ResponsiveText>
                      <ResponsiveText size="lg" className="font-semibold">
                        {macro.steps?.length || 0}
                      </ResponsiveText>
                    </div>
                    <div>
                      <ResponsiveText size="xs" className="text-gray-500">
                        Runs
                      </ResponsiveText>
                      <ResponsiveText size="lg" className="font-semibold">
                        {macro.runCount}
                      </ResponsiveText>
                    </div>
                    <div>
                      <ResponsiveText size="xs" className="text-gray-500">
                        Last Run
                      </ResponsiveText>
                      <ResponsiveText size="xs" className="font-semibold">
                        {macro.lastRun
                          ? new Date(macro.lastRun).toLocaleDateString()
                          : 'Never'}
                      </ResponsiveText>
                    </div>
                  </div>

                  {/* Recent Runs */}
                  {macro.runs && macro.runs.length > 0 && (
                    <div className="border-t pt-4">
                      <ResponsiveText size="xs" className="text-gray-500 mb-2">
                        Recent Runs
                      </ResponsiveText>
                      <div className="space-y-2">
                        {macro.runs.slice(0, 3).map((run) => (
                          <div
                            key={run.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <Badge className={getStatusColor(run.status)}>
                              {run.status}
                            </Badge>
                            <span className="text-gray-500">
                              {new Date(run.startedAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => executeMacro(macro.id, true)}
                      variant="outline"
                      size="sm"
                      disabled={runningMacros.has(macro.id)}
                      className="flex-1"
                    >
                      {runningMacros.has(macro.id) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Dry Run
                    </Button>
                    <Button
                      onClick={() => executeMacro(macro.id, false)}
                      size="sm"
                      disabled={runningMacros.has(macro.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {runningMacros.has(macro.id) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Execute
                    </Button>
                    <Button
                      onClick={() => deleteMacro(macro.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      )}
    </ResponsiveContainer>
  )
}

