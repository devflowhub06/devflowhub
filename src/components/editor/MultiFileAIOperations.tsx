'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Brain, 
  FileText, 
  GitBranch, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Code,
  Settings,
  Play,
  RefreshCw
} from 'lucide-react'

interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: 'file' | 'directory'
  size: number
}

interface MultiFileAIOperationsProps {
  files: ProjectFile[]
  projectId: string
  onApplyChanges: (changes: any[]) => void
  onStatusChange?: (status: { status: string; message: string; progress?: number }) => void
}

interface FileChange {
  filePath: string
  fileName: string
  originalContent: string
  newContent: string
  diff: string
  changeType: 'modified' | 'created' | 'deleted'
  reasoning: string
}

export function MultiFileAIOperations({
  files,
  projectId,
  onApplyChanges,
  onStatusChange
}: MultiFileAIOperationsProps) {
  const [operation, setOperation] = useState('add_feature')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedChanges, setSelectedChanges] = useState<FileChange[]>([])

  const operations = [
    { value: 'add_feature', label: 'Add Feature', description: 'Add a new feature across multiple files' },
    { value: 'refactor', label: 'Refactor', description: 'Refactor code for better structure' },
    { value: 'fix_bugs', label: 'Fix Bugs', description: 'Fix bugs spanning multiple files' },
    { value: 'optimize', label: 'Optimize', description: 'Optimize performance across files' },
    { value: 'migrate', label: 'Migrate', description: 'Migrate to new patterns/frameworks' },
    { value: 'analyze', label: 'Analyze', description: 'Analyze project structure' }
  ]

  const handleExecute = useCallback(async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt describing what you want to do')
      return
    }

    setIsLoading(true)
    onStatusChange?.({ status: 'processing', message: 'Analyzing project files...', progress: 20 })

    try {
      const response = await fetch('/api/editor/ai/multi-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          files: files.map(f => ({
            path: f.path,
            name: f.name,
            type: f.type,
            content: f.content
          })),
          projectContext: `Project: ${projectId}`,
          prompt,
          language: 'javascript'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setSelectedChanges(data.fileChanges || [])
        onStatusChange?.({ 
          status: 'completed', 
          message: `Multi-file operation completed: ${data.operation}`, 
          progress: 100 
        })
      } else {
        throw new Error('Failed to execute multi-file operation')
      }
    } catch (error) {
      console.error('Multi-file operation error:', error)
      onStatusChange?.({ status: 'error', message: 'Failed to execute operation', progress: 0 })
      alert('Error executing multi-file operation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [operation, prompt, files, projectId, onApplyChanges, onStatusChange])

  const handleApplyChanges = useCallback(async () => {
    if (selectedChanges.length === 0) {
      alert('No changes selected to apply')
      return
    }

    try {
      onStatusChange?.({ status: 'applying', message: `Applying ${selectedChanges.length} file changes...`, progress: 50 })

      // Apply each change to the actual file system
      for (const change of selectedChanges) {
        try {
          const response = await fetch(`/api/projects/${projectId}/files`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: change.filePath,
              content: change.newContent,
              action: change.changeType === 'created' ? 'create' : 'update'
            }),
          })

          if (!response.ok) {
            throw new Error(`Failed to apply changes to ${change.fileName}`)
          }
        } catch (error) {
          console.error(`Error applying change to ${change.fileName}:`, error)
          throw error
        }
      }

      onStatusChange?.({ status: 'completed', message: `Successfully applied ${selectedChanges.length} changes`, progress: 100 })
      onApplyChanges(selectedChanges)
      setResult(null)
      setSelectedChanges([])
      setPrompt('')
    } catch (error) {
      console.error('Error applying changes:', error)
      onStatusChange?.({ status: 'error', message: 'Failed to apply some changes', progress: 0 })
      alert('Error applying changes. Please check the console for details.')
    }
  }, [selectedChanges, onApplyChanges, projectId, onStatusChange])

  const handleToggleChange = useCallback((change: FileChange) => {
    setSelectedChanges(prev => 
      prev.includes(change) 
        ? prev.filter(c => c !== change)
        : [...prev, change]
    )
  }, [])

  const renderFileChange = (change: FileChange, index: number) => (
    <Card key={index} className="mb-4 border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <CardTitle className="text-sm">{change.fileName}</CardTitle>
            <Badge variant={change.changeType === 'modified' ? 'default' : 'secondary'}>
              {change.changeType}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleChange(change)}
            className={selectedChanges.includes(change) ? 'bg-green-100' : ''}
          >
            {selectedChanges.includes(change) ? 'Selected' : 'Select'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{change.reasoning}</p>
        <div className="bg-gray-50 p-3 rounded-md">
          <pre className="text-xs overflow-x-auto">{change.diff}</pre>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Multi-File AI Operations</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {files.length} files
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Operation Type</label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operations.map(op => (
                  <SelectItem key={op.value} value={op.value}>
                    <div>
                      <div className="font-medium">{op.label}</div>
                      <div className="text-xs text-gray-500">{op.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleExecute}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? 'Processing...' : 'Execute Operation'}
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Describe what you want to do</label>
          <Textarea
            placeholder={`Example: Add a login system with authentication, user management, and protected routes across the project...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">AI is analyzing your project...</p>
            </div>
          </div>
        )}

        {result && !isLoading && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Operation Completed</h3>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {result.operation}
                  </Badge>
                </div>
                <Button onClick={handleApplyChanges} disabled={selectedChanges.length === 0}>
                  Apply {selectedChanges.length} Changes
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="mb-6">
                <h4 className="font-medium mb-2">AI Analysis</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap">{result.response}</pre>
                </div>
              </div>

              {result.fileChanges && result.fileChanges.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4">Proposed Changes</h4>
                  {result.fileChanges.map((change: FileChange, index: number) => 
                    renderFileChange(change, index)
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {!result && !isLoading && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Multi-File AI Operations</p>
              <p className="text-sm">Select an operation and describe what you want to accomplish</p>
              <p className="text-xs mt-2">The AI will analyze all {files.length} files in your project</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
