'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Terminal, 
  GitBranch, 
  Search, 
  Settings, 
  Play,
  Save,
  GitCommit,
  GitPullRequest,
  Eye,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { FileTree } from '@/components/editor/FileTree'
import { MonacoEditorWrapper } from '@/components/editor/MonacoEditorWrapper'
import { EditorTerminal } from '@/components/editor/EditorTerminal'
import { PreviewChangesModal } from '@/components/modals/PreviewChangesModal'
import { AssistantLightbulb } from '@/components/editor/AssistantLightbulb'
import { CommandPalette } from '@/components/editor/CommandPalette'
import { GitStatusBar } from '@/components/editor/GitStatusBar'
import { EditorToolbar } from '@/components/editor/EditorToolbar'

interface EditorPageProps {
  params: { id: string }
}

interface ProjectFile {
  id: string
  path: string
  content: string
  type: 'file' | 'directory'
  size: number
  lastModified: string
}

interface GitStatus {
  currentBranch: string
  lastCommit: string
  lastSynced: string
  hasChanges: boolean
  stagedFiles: string[]
  unstagedFiles: string[]
}

interface AssistantSuggestion {
  id: string
  type: 'refactor' | 'test' | 'optimize' | 'fix'
  title: string
  description: string
  confidence: number
  estimatedCost: number
  changes: Array<{
    path: string
    op: 'add' | 'edit' | 'delete'
    newContent?: string
    oldContent?: string
  }>
}

export default function DevFlowHubEditor({ params }: EditorPageProps) {
  const projectId = params.id
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [assistantSuggestions, setAssistantSuggestions] = useState<AssistantSuggestion[]>([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'git'>('editor')
  const [isDirty, setIsDirty] = useState(false)

  // Load project files
  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/${projectId}/files`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
        if (data.files && data.files.length > 0) {
          setSelectedFile(data.files[0])
          setFileContent(data.files[0].content)
        }
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  // Load git status
  const loadGitStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/git/${projectId}/status`)
      if (response.ok) {
        const data = await response.json()
        setGitStatus(data)
      }
    } catch (error) {
      console.error('Error loading git status:', error)
    }
  }, [projectId])

  // Load assistant suggestions
  const loadAssistantSuggestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/assistant/suggestions/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setAssistantSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error loading assistant suggestions:', error)
    }
  }, [projectId])

  // Save file content
  const saveFile = useCallback(async (content: string) => {
    if (!selectedFile) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: selectedFile.path,
          content: content,
          action: 'update'
        }),
      })

      if (response.ok) {
        setIsDirty(false)
        // Reload files to get updated content
        await loadFiles()
        await loadGitStatus()
      }
    } catch (error) {
      console.error('Error saving file:', error)
    } finally {
      setIsSaving(false)
    }
  }, [projectId, selectedFile, loadFiles, loadGitStatus])

  // Handle file selection
  const handleFileSelect = useCallback((file: ProjectFile) => {
    if (isDirty) {
      // Ask user if they want to save changes
      if (confirm('You have unsaved changes. Save before switching files?')) {
        saveFile(fileContent)
      }
    }
    setSelectedFile(file)
    setFileContent(file.content)
    setIsDirty(false)
  }, [isDirty, fileContent, saveFile])

  // Handle content change
  const handleContentChange = useCallback((content: string) => {
    setFileContent(content)
    setIsDirty(true)
  }, [])

  // Handle assistant suggestion
  const handleAssistantSuggestion = useCallback(async (suggestion: AssistantSuggestion) => {
    try {
      const response = await fetch('/api/assistant/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          changes: suggestion.changes,
          summary: suggestion.title,
          rationale: suggestion.description
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewData({
          ...data,
          suggestionId: suggestion.id,
          suggestion: suggestion
        })
        setShowPreviewModal(true)
      }
    } catch (error) {
      console.error('Error previewing assistant suggestion:', error)
    }
  }, [projectId])

  // Handle preview approval
  const handlePreviewApproval = useCallback(async (approved: boolean) => {
    if (approved && previewData) {
      try {
        const response = await fetch('/api/assistant/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            changes: previewData.diffs,
            summary: previewData.summary,
            rationale: previewData.rationale
          }),
        })

        if (response.ok) {
          const data = await response.json()
          // Reload files and git status
          await loadFiles()
          await loadGitStatus()
          await loadAssistantSuggestions()
        }
      } catch (error) {
        console.error('Error applying assistant changes:', error)
      }
    }
    setShowPreviewModal(false)
    setPreviewData(null)
  }, [previewData, projectId, loadFiles, loadGitStatus, loadAssistantSuggestions])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            if (selectedFile) {
              saveFile(fileContent)
            }
            break
          case 'p':
            e.preventDefault()
            setShowCommandPalette(true)
            break
          case 'k':
            e.preventDefault()
            setShowCommandPalette(true)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedFile, fileContent, saveFile])

  // Load initial data
  useEffect(() => {
    loadFiles()
    loadGitStatus()
    loadAssistantSuggestions()
  }, [loadFiles, loadGitStatus, loadAssistantSuggestions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DevFlowHub Editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">DevFlowHub Editor</h1>
            </div>
            {gitStatus && (
              <GitStatusBar 
                status={gitStatus}
                onRefresh={loadGitStatus}
              />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <EditorToolbar
              onSave={() => selectedFile && saveFile(fileContent)}
              onRun={() => {/* TODO: Implement run command */}}
              onCommit={() => {/* TODO: Implement commit */}}
              onBranch={() => {/* TODO: Implement branch creation */}}
              onPR={() => {/* TODO: Implement PR creation */}}
              isSaving={isSaving}
              isDirty={isDirty}
              hasChanges={gitStatus?.hasChanges || false}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Tree */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search files..."
                className="flex-1 text-sm border-0 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowCommandPalette(true)
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileCreate={() => {/* TODO: Implement file creation */}}
              onFileDelete={() => {/* TODO: Implement file deletion */}}
            />
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value="terminal" className="flex items-center space-x-2">
                <Terminal className="h-4 w-4" />
                <span>Terminal</span>
              </TabsTrigger>
              <TabsTrigger value="git" className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4" />
                <span>Git</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 flex flex-col">
              {selectedFile ? (
                <div className="flex-1 flex flex-col">
                  <MonacoEditorWrapper
                    file={selectedFile}
                    content={fileContent}
                    onChange={handleContentChange}
                    onSave={saveFile}
                    suggestions={assistantSuggestions}
                    onSuggestionClick={handleAssistantSuggestion}
                  />
                  <AssistantLightbulb
                    suggestions={assistantSuggestions}
                    onSuggestionClick={handleAssistantSuggestion}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a file to start editing</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="terminal" className="flex-1">
              <EditorTerminal projectId={projectId} />
            </TabsContent>

            <TabsContent value="git" className="flex-1 p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GitBranch className="h-5 w-5" />
                      <span>Git Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {gitStatus ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Branch:</span>
                          <Badge variant="outline">{gitStatus.currentBranch}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Commit:</span>
                          <span className="text-sm font-mono">{gitStatus.lastCommit.substring(0, 8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Synced:</span>
                          <span className="text-sm">{new Date(gitStatus.lastSynced).toLocaleString()}</span>
                        </div>
                        {gitStatus.hasChanges && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                            <p className="text-sm text-amber-800">
                              {gitStatus.unstagedFiles.length} unstaged changes
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Loading git status...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onFileSelect={handleFileSelect}
          files={files}
        />
      )}

      {/* Preview Changes Modal */}
      {showPreviewModal && previewData && (
        <PreviewChangesModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          changes={previewData.diffs}
          summary={previewData.summary}
          rationale={previewData.rationale}
          estimatedCost={previewData.estimatedCostTokens}
          onApprove={() => handlePreviewApproval(true)}
          onReject={() => handlePreviewApproval(false)}
        />
      )}
    </div>
  )
}
