'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  GitBranch, 
  GitCommit, 
  GitPullRequest,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Eye,
  Code,
  Diff
} from 'lucide-react'

interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  patch: string
}

interface FileDiff {
  path: string
  unifiedDiff: string
  hunks: DiffHunk[]
  oldContent?: string
  newContent?: string
}

interface PreviewChangesModalProps {
  isOpen: boolean
  onClose: () => void
  changes: FileDiff[]
  summary: string
  rationale: string
  estimatedCost?: number
  onApprove: () => void
  onReject: () => void
  isProcessing?: boolean
}

export function PreviewChangesModal({
  isOpen,
  onClose,
  changes,
  summary,
  rationale,
  estimatedCost,
  onApprove,
  onReject,
  isProcessing = false
}: PreviewChangesModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'diffs'>('summary')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase()
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext || '')) return '🟨'
    if (['py'].includes(ext || '')) return '🐍'
    if (['java'].includes(ext || '')) return '☕'
    if (['html', 'css', 'scss'].includes(ext || '')) return '🌐'
    if (['json', 'yaml', 'yml'].includes(ext || '')) return '📄'
    return '📄'
  }

  const getFileLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'jsx': 'React',
      'ts': 'TypeScript',
      'tsx': 'React TS',
      'py': 'Python',
      'java': 'Java',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'json': 'JSON',
      'yaml': 'YAML',
      'yml': 'YAML'
    }
    return languageMap[ext || ''] || 'Text'
  }

  const renderDiff = (diff: FileDiff) => {
    const lines = diff.unifiedDiff.split('\n')
    return (
      <div className="space-y-1">
        {lines.map((line, index) => {
          if (line.startsWith('@@')) {
            return (
              <div key={index} className="bg-slate-700 text-slate-300 px-2 py-1 text-sm font-mono">
                {line}
              </div>
            )
          } else if (line.startsWith('+')) {
            return (
              <div key={index} className="bg-green-900/30 text-green-300 px-2 py-1 text-sm font-mono">
                {line}
              </div>
            )
          } else if (line.startsWith('-')) {
            return (
              <div key={index} className="bg-red-900/30 text-red-300 px-2 py-1 text-sm font-mono">
                {line}
              </div>
            )
          } else {
            return (
              <div key={index} className="text-slate-300 px-2 py-1 text-sm font-mono">
                {line}
              </div>
            )
          }
        })}
      </div>
    )
  }

  const totalChanges = changes.reduce((acc, change) => acc + change.hunks.length, 0)
  const filesChanged = changes.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-400" />
            <span>Preview AI Changes</span>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500">
              {filesChanged} files • {totalChanges} changes
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review the proposed changes before applying them to your project
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Summary</span>
              </TabsTrigger>
              <TabsTrigger value="diffs" className="flex items-center space-x-2">
                <Diff className="h-4 w-4" />
                <span>Code Diffs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Summary Card */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Code className="h-5 w-5" />
                      <span>Change Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{summary}</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-slate-300">Rationale:</span>
                        <span className="text-sm text-slate-400">{rationale}</span>
                      </div>
                      {estimatedCost && (
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-slate-300">Estimated Cost:</span>
                          <Badge variant="outline" className="text-xs">
                            {estimatedCost} tokens
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Files Changed */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <FileText className="h-5 w-5" />
                      <span>Files Changed</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {changes.map((change, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-700 rounded border border-slate-600 hover:border-blue-500 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedFile(change.path)
                            setActiveTab('diffs')
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getFileIcon(change.path)}</span>
                            <div>
                              <div className="text-sm text-white font-medium">{change.path}</div>
                              <div className="text-xs text-slate-400">{getFileLanguage(change.path)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {change.hunks.length} changes
                            </Badge>
                            <Eye className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Safety Notice */}
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-300 mb-1">Safety Notice</h4>
                        <p className="text-xs text-amber-200">
                          These changes will be applied to a new branch. You can review and merge them later, or revert if needed.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="diffs" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {selectedFile ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-lg">{getFileIcon(selectedFile)}</span>
                      <span className="text-sm font-medium text-white">{selectedFile}</span>
                      <Badge variant="outline" className="text-xs">
                        {getFileLanguage(selectedFile)}
                      </Badge>
                    </div>
                    {renderDiff(changes.find(c => c.path === selectedFile)!)}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
                    <p className="text-slate-400">Select a file to view its changes</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            <span>This will create a new branch with your changes</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Reject</span>
            </Button>
            
            <Button
              onClick={onApprove}
              disabled={isProcessing}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Apply Changes</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}