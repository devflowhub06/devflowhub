'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Download, Upload, GitMerge, FileText } from 'lucide-react'

export interface ConflictFile {
  path: string
  localContent: string
  remoteContent: string
  lastModified: {
    local: string
    remote: string
  }
  size: {
    local: number
    remote: number
  }
}

export interface SyncConflict {
  id: string
  projectId: string
  files: ConflictFile[]
  createdAt: string
  status: 'pending' | 'resolved' | 'cancelled'
}

interface SyncConflictModalProps {
  isOpen: boolean
  onClose: () => void
  conflict: SyncConflict | null
  onResolve: (resolution: ConflictResolution) => void
  isProcessing: boolean
}

export interface ConflictResolution {
  fileResolutions: {
    [filePath: string]: 'keep-local' | 'keep-remote' | 'merge'
  }
  customMerges?: {
    [filePath: string]: string
  }
}

export function SyncConflictModal({
  isOpen,
  onClose,
  conflict,
  onResolve,
  isProcessing
}: SyncConflictModalProps) {
  const [resolutions, setResolutions] = useState<{ [filePath: string]: 'keep-local' | 'keep-remote' | 'merge' }>({})
  const [customMerges, setCustomMerges] = useState<{ [filePath: string]: string }>({})
  const [activeTab, setActiveTab] = useState('summary')

  if (!conflict) return null

  const handleResolutionChange = (filePath: string, resolution: 'keep-local' | 'keep-remote' | 'merge') => {
    setResolutions(prev => ({
      ...prev,
      [filePath]: resolution
    }))
  }

  const handleCustomMergeChange = (filePath: string, content: string) => {
    setCustomMerges(prev => ({
      ...prev,
      [filePath]: content
    }))
  }

  const handleResolve = () => {
    const resolution: ConflictResolution = {
      fileResolutions: resolutions,
      customMerges: Object.keys(customMerges).length > 0 ? customMerges : undefined
    }
    onResolve(resolution)
  }

  const getResolutionIcon = (resolution: string) => {
    switch (resolution) {
      case 'keep-local':
        return <Download className="h-4 w-4 text-blue-600" />
      case 'keep-remote':
        return <Upload className="h-4 w-4 text-green-600" />
      case 'merge':
        return <GitMerge className="h-4 w-4 text-purple-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  const getResolutionLabel = (resolution: string) => {
    switch (resolution) {
      case 'keep-local':
        return 'Keep Local'
      case 'keep-remote':
        return 'Keep Remote'
      case 'merge':
        return 'Merge'
      default:
        return 'Choose Resolution'
    }
  }

  const allFilesResolved = conflict.files.every(file => resolutions[file.path])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Sync Conflicts Detected</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Sync Conflicts Found</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {conflict.files.length} file(s) have been modified both locally and remotely. 
                  Choose how to resolve each conflict.
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="files">File Details</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="space-y-3">
                {conflict.files.map((file, index) => {
                  const resolution = resolutions[file.path]
                  return (
                    <div
                      key={file.path}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm">{file.path}</div>
                          <div className="text-xs text-gray-500">
                            Local: {file.lastModified.local} • Remote: {file.lastModified.remote}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {resolution && (
                          <Badge variant="outline" className="flex items-center space-x-1">
                            {getResolutionIcon(resolution)}
                            <span>{getResolutionLabel(resolution)}</span>
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab('files')}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conflict.files.map((file, index) => {
                  const resolution = resolutions[file.path] || 'keep-local'
                  const customMerge = customMerges[file.path] || ''
                  
                  return (
                    <div key={file.path} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{file.path}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {file.size.local} bytes (local)
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {file.size.remote} bytes (remote)
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={resolution === 'keep-local' ? 'default' : 'outline'}
                            onClick={() => handleResolutionChange(file.path, 'keep-local')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Keep Local
                          </Button>
                          <Button
                            size="sm"
                            variant={resolution === 'keep-remote' ? 'default' : 'outline'}
                            onClick={() => handleResolutionChange(file.path, 'keep-remote')}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Keep Remote
                          </Button>
                          <Button
                            size="sm"
                            variant={resolution === 'merge' ? 'default' : 'outline'}
                            onClick={() => handleResolutionChange(file.path, 'merge')}
                          >
                            <GitMerge className="h-3 w-3 mr-1" />
                            Merge
                          </Button>
                        </div>

                        {resolution === 'merge' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Custom Merge Content:</label>
                            <textarea
                              className="w-full h-32 p-2 border rounded text-sm font-mono"
                              value={customMerge}
                              onChange={(e) => handleCustomMergeChange(file.path, e.target.value)}
                              placeholder="Enter merged content here..."
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Local Version</div>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs overflow-x-auto">
                              {file.localContent.substring(0, 200)}
                              {file.localContent.length > 200 && '...'}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Remote Version</div>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs overflow-x-auto">
                              {file.remoteContent.substring(0, 200)}
                              {file.remoteContent.length > 200 && '...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!allFilesResolved || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? 'Resolving...' : 'Resolve Conflicts'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
