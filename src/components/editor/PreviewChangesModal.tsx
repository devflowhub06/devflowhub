'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  GitBranch, 
  Zap, 
  Clock, 
  DollarSign,
  FileText,
  Code,
  AlertTriangle,
  Info
} from 'lucide-react'

interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  patch: string
  lines: Array<{
    type: 'context' | 'addition' | 'deletion'
    content: string
    lineNumber?: number
  }>
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
  onApprove: () => void
  onReject: () => void
  data: {
    summary: string
    rationale: string
    confidence: number
    estimatedCostTokens: number
    diffs: FileDiff[]
    branchName?: string
    commitMessage?: string
  }
}

export function PreviewChangesModal({ 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  data 
}: PreviewChangesModalProps) {
  const [activeTab, setActiveTab] = useState('summary')
  const [selectedFile, setSelectedFile] = useState<string | null>(
    data.diffs.length > 0 ? data.diffs[0].path : null
  )

  const formatConfidence = (confidence: number) => {
    if (confidence >= 0.9) return { text: 'Very High', color: 'text-green-400' }
    if (confidence >= 0.7) return { text: 'High', color: 'text-blue-400' }
    if (confidence >= 0.5) return { text: 'Medium', color: 'text-yellow-400' }
    return { text: 'Low', color: 'text-red-400' }
  }

  const formatCost = (tokens: number) => {
    const cost = tokens * 0.0001 // Approximate cost per token
    return `$${cost.toFixed(4)}`
  }

  const renderDiffLine = (line: any, index: number) => {
    const getLineColor = (type: string) => {
      switch (type) {
        case 'addition': return 'bg-green-900/30 text-green-300'
        case 'deletion': return 'bg-red-900/30 text-red-300'
        default: return 'text-slate-400'
      }
    }

    const getLineIcon = (type: string) => {
      switch (type) {
        case 'addition': return '+'
        case 'deletion': return '-'
        default: return ' '
      }
    }

    return (
      <div key={index} className={`flex items-start space-x-2 font-mono text-sm ${getLineColor(line.type)}`}>
        <span className="w-6 text-right text-slate-500 select-none">
          {line.lineNumber || ' '}
        </span>
        <span className="w-4 text-center select-none">
          {getLineIcon(line.type)}
        </span>
        <span className="flex-1 whitespace-pre-wrap">
          {line.content}
        </span>
      </div>
    )
  }

  const renderFileDiff = (fileDiff: FileDiff) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <span className="font-medium text-white">{fileDiff.path}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {fileDiff.hunks.length} changes
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          {fileDiff.hunks.map((hunk, hunkIndex) => (
            <div key={hunkIndex} className="bg-slate-900 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
                <span className="text-sm text-slate-300">
                  @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                </span>
              </div>
              <div className="p-4">
                {hunk.lines.map((line, lineIndex) => renderDiffLine(line, lineIndex))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-400" />
            <span>Preview AI Changes</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="diffs">File Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-4">
                {/* Summary Card */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Change Summary</h3>
                  <p className="text-slate-300 mb-4">{data.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-slate-400">Confidence</span>
                      </div>
                      <div className={`font-medium ${formatConfidence(data.confidence).color}`}>
                        {formatConfidence(data.confidence).text} ({(data.confidence * 100).toFixed(1)}%)
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-slate-400">Estimated Cost</span>
                      </div>
                      <div className="text-green-400 font-medium">
                        {formatCost(data.estimatedCostTokens)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rationale Card */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Rationale</h3>
                  <p className="text-slate-300">{data.rationale}</p>
                </div>

                {/* Branch Info */}
                {data.branchName && (
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Branch Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-300">Branch: </span>
                        <code className="bg-slate-700 px-2 py-1 rounded text-sm text-blue-400">
                          {data.branchName}
                        </code>
                      </div>
                      {data.commitMessage && (
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-blue-400" />
                          <span className="text-slate-300">Commit: </span>
                          <span className="text-slate-400">{data.commitMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Files Changed */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Files to be Changed</h3>
                  <div className="space-y-2">
                    {data.diffs.map((diff, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="text-white">{diff.path}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {diff.hunks.length} changes
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="diffs" className="flex-1 overflow-y-auto">
              <div className="p-4">
                {data.diffs.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    No file changes to preview
                  </div>
                ) : (
                  <div className="space-y-6">
                    {data.diffs.map((diff, index) => (
                      <div key={index}>
                        {renderFileDiff(diff)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Info className="h-4 w-4" />
            <span>Changes will be applied to a new branch</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onReject}
              className="text-red-400 border-red-400 hover:bg-red-900/20"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
