'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lock, 
  Eye, 
  FileText, 
  Code,
  Calendar,
  User
} from 'lucide-react'
import { FileTree } from '@/components/editor/FileTree'
import { MonacoEditorWrapper } from '@/components/editor/MonacoEditorWrapper'
import { ActivityFeed } from './ActivityFeed'

interface SharedWorkspaceViewProps {
  project: any
  shareToken: string
}

export default function SharedWorkspaceView({ project, shareToken }: SharedWorkspaceViewProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [files, setFiles] = useState<any[]>([])

  useEffect(() => {
    loadFiles()
  }, [project.id, shareToken])

  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/files?readOnly=true`, {
        headers: {
          'x-share-token': shareToken
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const handleFileSelect = async (file: any) => {
    setSelectedFile(file)
    try {
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(file.path)}&projectId=${project.id}&readOnly=true`, {
        headers: {
          'x-share-token': shareToken
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFileContent(data.content || '')
      }
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="font-semibold">{project.name}</h1>
              <p className="text-sm text-slate-400">Read-only shared workspace</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          <Eye className="h-3 w-3 mr-1" />
          Read Only
        </Badge>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/30 border-r border-slate-700 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Project Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">
                    {project.user?.name || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-slate-400 mt-2">{project.description}</p>
                )}
              </CardContent>
            </Card>

            {/* File Tree */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Files</span>
              </h3>
              <FileTree
                files={files}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                readOnly={true}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <div className="flex-1 flex flex-col">
              <div className="h-12 bg-slate-800/50 border-b border-slate-700 flex items-center px-4">
                <Code className="h-4 w-4 mr-2 text-slate-400" />
                <span className="text-sm font-mono text-slate-300">{selectedFile.path}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <MonacoEditorWrapper
                  value={fileContent}
                  language={selectedFile.name.split('.').pop() || 'text'}
                  onChange={() => {}} // Read-only
                  readOnly={true}
                  theme="vs-dark"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-400">Select a file to view</p>
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed Sidebar */}
        <div className="w-80 bg-slate-800/30 border-l border-slate-700 overflow-y-auto p-4">
          <ActivityFeed projectId={project.id} readOnly={true} />
        </div>
      </div>
    </div>
  )
}

