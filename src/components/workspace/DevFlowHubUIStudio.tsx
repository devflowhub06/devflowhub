'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles,
  Code,
  Eye,
  Download,
  Search,
  Palette,
  Wand2,
  ExternalLink,
  Copy,
  Play,
  Zap,
  Layers,
  Heart,
  Star,
  Filter,
  BarChart3
} from 'lucide-react'
import { PromptBox } from '@/components/ui-studio/PromptBox'
import { PreviewPanel } from '@/components/ui-studio/PreviewPanel'
import { ComponentLibrary } from '@/components/ui-studio/ComponentLibrary'
import { GenerationJobView } from '@/components/ui-studio/GenerationJobView'
import { MetricsPanel } from '@/components/ui-studio/MetricsPanel'
import { TestComponent } from '@/components/ui-studio/TestComponent'

interface DevFlowHubUIStudioProps {
  projectId: string
  onStatusChange?: (status: { status: string; message: string; progress: number }) => void
}

interface GenerationJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  prompt: string
  estimatedCost: number
  result?: any
  error?: string
  createdAt: string
}

interface ComponentEntry {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  previewHtml: string
  downloads: number
  likes: number
  createdAt: string
}

export function DevFlowHubUIStudio({ projectId, onStatusChange }: DevFlowHubUIStudioProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'jobs' | 'metrics' | 'test'>('generate')
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null)
  const [jobs, setJobs] = useState<GenerationJob[]>([])
  const [components, setComponents] = useState<ComponentEntry[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedComponent, setGeneratedComponent] = useState<any>(null)

  // Load component library
  const loadComponents = useCallback(async () => {
    try {
      const response = await fetch(`/api/ui-studio/components?projectId=${projectId}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || [])
      }
    } catch (error) {
      console.error('Error loading components:', error)
    }
  }, [projectId])

  // Load generation jobs
  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch(`/api/ui-studio/jobs?projectId=${projectId}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }, [projectId])

  // Handle component generation
  const handleGenerate = useCallback(async (prompt: string, options: any) => {
    try {
      setIsGenerating(true)
      onStatusChange?.({
        status: 'generating',
        message: 'AI is crafting your component...',
        progress: 25
      })

      const response = await fetch('/api/ui-studio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          prompt,
          variants: options.variants || 3,
          styleHints: options.styleHints || {},
          themeHints: options.themeHints || {},
          previewOnly: true
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'completed') {
          setGeneratedComponent(data.result)
          setCurrentJob({
            id: data.jobId,
            status: 'completed',
            prompt,
            estimatedCost: data.estimatedCost,
            result: data.result,
            createdAt: new Date().toISOString()
          })
          
          onStatusChange?.({
            status: 'completed',
            message: 'Component generated successfully!',
            progress: 100
          })
        } else {
          // Handle queued job
          setCurrentJob({
            id: data.jobId,
            status: data.status,
            prompt,
            estimatedCost: data.estimatedCost,
            createdAt: new Date().toISOString()
          })
          
          // Poll for completion
          pollJobStatus(data.jobId)
        }
        
        await loadJobs()
      } else {
        const error = await response.json()
        alert(`Generation failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating component:', error)
      alert('Failed to generate component')
    } finally {
      setIsGenerating(false)
    }
  }, [projectId, onStatusChange, loadJobs])

  // Poll job status for queued jobs
  const pollJobStatus = useCallback(async (jobId: string) => {
    const maxAttempts = 30 // 30 * 2 seconds = 1 minute max
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/ui-studio/job/${jobId}`, { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'completed') {
            setGeneratedComponent(data.result)
            setCurrentJob(prev => prev ? { ...prev, status: 'completed', result: data.result } : null)
            onStatusChange?.({
              status: 'completed',
              message: 'Component generated successfully!',
              progress: 100
            })
            return
          } else if (data.status === 'failed') {
            setCurrentJob(prev => prev ? { ...prev, status: 'failed', error: data.error } : null)
            onStatusChange?.({
              status: 'error',
              message: 'Generation failed',
              progress: 0
            })
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000) // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Error polling job status:', error)
      }
    }

    poll()
  }, [onStatusChange])

  // Load data on mount
  useEffect(() => {
    loadComponents()
    loadJobs()
  }, [loadComponents, loadJobs])

  // Handle component insertion
  const handleComponentInsert = useCallback(async (componentData: any, targetPath: string) => {
    try {
      onStatusChange?.({
        status: 'inserting',
        message: 'Creating assistant branch and inserting component...',
        progress: 50
      })

      const response = await fetch('/api/ui-studio/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          componentData,
          targetPath,
          commitMessage: `AI: Add ${componentData.name} component`,
          createTests: true,
          createStory: true
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        onStatusChange?.({
          status: 'completed',
          message: `Component inserted successfully! Created ${data.preview.filesCreated} files in branch: ${data.branchName}`,
          progress: 100
        })

        // Refresh component library
        await loadComponents()
        
        alert(`✅ Component inserted successfully!\n\nBranch: ${data.branchName}\nFiles created: ${data.preview.filesCreated}\n\nYou can now review and merge the changes.`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to insert component')
      }
    } catch (error) {
      console.error('Error inserting component:', error)
      onStatusChange?.({
        status: 'error',
        message: 'Failed to insert component',
        progress: 0
      })
      throw error // Re-throw for modal to handle
    }
  }, [projectId, onStatusChange, loadComponents])

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* UI Studio Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-purple-900 border-b border-slate-700 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DevFlowHub UI Studio</h1>
              <p className="text-sm text-slate-300">AI-powered component generation and design system</p>
            </div>
            <Badge variant="outline" className="text-purple-300 border-purple-400 bg-purple-900/20">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-4 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{components.length} components</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{jobs.length} generations</span>
              </div>
            </div>
            
            {currentJob && (
              <Badge className={`${
                currentJob.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : 
                currentJob.status === 'processing' ? 'bg-blue-500 hover:bg-blue-600' :
                currentJob.status === 'queued' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
              } text-white shadow-lg transition-all duration-200`}>
                <div className="flex items-center space-x-1">
                  {currentJob.status === 'processing' && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                  <span className="capitalize">{currentJob.status}</span>
                </div>
              </Badge>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                loadComponents()
                loadJobs()
              }}
              className="flex items-center space-x-2 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Zap className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-lg p-1">
                <TabsTrigger 
                  value="generate" 
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-600/50"
                >
                  <Wand2 className="h-4 w-4" />
                  <span className="font-medium">Generate</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-600/50"
                >
                  <Layers className="h-4 w-4" />
                  <span className="font-medium">Library</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs" 
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-600/50"
                >
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Jobs</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="metrics" 
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-600/50"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="test" 
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-600/50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Test</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'generate' && (
              <div className="p-4">
                <PromptBox 
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              </div>
            )}

            {activeTab === 'library' && (
              <div className="p-4">
                <ComponentLibrary 
                  projectId={projectId}
                  components={components}
                  onSelect={(component) => {
                    setGeneratedComponent(component)
                  }}
                />
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="p-4">
                <GenerationJobView 
                  jobs={jobs}
                  currentJob={currentJob}
                  onSelectJob={(job) => {
                    setCurrentJob(job)
                    if (job.result) {
                      setGeneratedComponent(job.result)
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="p-4">
                <MetricsPanel projectId={projectId} />
              </div>
            )}

            {activeTab === 'test' && (
              <div className="p-4">
                <TestComponent 
                  projectId={projectId} 
                  onGenerate={handleGenerate}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {generatedComponent ? (
            <div className="relative z-10">
              <PreviewPanel 
                component={generatedComponent}
                projectId={projectId}
                onInsert={handleComponentInsert}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center relative z-10">
              <div className="text-center max-w-lg mx-auto px-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Welcome to DevFlowHub UI Studio
                </h2>
                <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                  Generate beautiful, accessible React components with AI. 
                  Describe what you need and watch the magic happen!
                </p>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="flex items-center space-x-3 text-green-400 bg-green-400/10 px-4 py-3 rounded-lg">
                    <Palette className="h-5 w-5" />
                    <span className="font-medium">AI-Powered Design</span>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-400 bg-blue-400/10 px-4 py-3 rounded-lg">
                    <Code className="h-5 w-5" />
                    <span className="font-medium">TypeScript + Tailwind</span>
                  </div>
                  <div className="flex items-center space-x-3 text-purple-400 bg-purple-400/10 px-4 py-3 rounded-lg">
                    <Eye className="h-5 w-5" />
                    <span className="font-medium">Live Preview</span>
                  </div>
                  <div className="flex items-center space-x-3 text-orange-400 bg-orange-400/10 px-4 py-3 rounded-lg">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">Accessibility First</span>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-sm">
                    💡 <strong>Pro Tip:</strong> Be specific in your prompts for better results. 
                    Include details about styling, behavior, and accessibility requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-purple-900 border-t border-slate-700/50 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 font-medium">Components: {components.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300 font-medium">Generated: {jobs.filter(j => j.status === 'completed').length}</span>
            </div>
            {currentJob && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-slate-300 font-medium">Cost: ${currentJob.estimatedCost}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span className="text-slate-300 font-medium">AI Studio: GPT-4</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 font-medium">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
