'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, FileText, GitBranch, AlertCircle } from 'lucide-react'

interface FileDiff {
  filePath: string
  originalContent: string
  newContent: string
  changes: Array<{
    type: 'added' | 'removed' | 'modified'
    line: number
    content: string
  }>
}

interface AIDiffModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (acceptedChanges: FileDiff[]) => void
  onReject: () => void
  diffs?: FileDiff[]
  title?: string
  description?: string
}

export default function AIDiffModal({
  isOpen,
  onClose,
  onAccept,
  onReject,
  diffs = [],
  title = 'AI Generated Changes',
  description = 'Review the changes before applying them to your project.'
}: AIDiffModalProps) {
  // Ensure diffs is always an array with proper fallback
  const safeDiffs = Array.isArray(diffs) ? diffs : []
  
  // Initialize state with safe defaults
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  
  // Early return if no diffs to show or modal is not open
  if (!isOpen || safeDiffs.length === 0) {
    return null
  }

  // Update selectedFiles when diffs change and modal opens
  React.useEffect(() => {
    if (isOpen && safeDiffs.length > 0) {
      setSelectedFiles(new Set(safeDiffs.map(d => d.filePath)))
    }
  }, [isOpen, safeDiffs])

  const toggleFileSelection = (filePath: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath)
    } else {
      newSelected.add(filePath)
    }
    setSelectedFiles(newSelected)
  }

  const toggleFileExpansion = (filePath: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath)
    } else {
      newExpanded.add(filePath)
    }
    setExpandedFiles(newExpanded)
  }

  const handleAcceptAll = () => {
    onAccept(safeDiffs)
    onClose()
  }

  const handleAcceptSelected = () => {
    const acceptedDiffs = safeDiffs.filter(diff => selectedFiles.has(diff.filePath))
    onAccept(acceptedDiffs)
    onClose()
  }

  const handleReject = () => {
    onReject()
    onClose()
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'removed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'modified': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added': return '+'
      case 'removed': return '-'
      case 'modified': return '~'
      default: return '?'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-500" />
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">AI Generated Changes</p>
              <p className="text-xs text-muted-foreground">
                {safeDiffs.length} file(s) will be modified. Review each change before accepting.
              </p>
            </div>
            <Badge variant="outline" className="text-blue-500 border-blue-500">
              {safeDiffs.length} files
            </Badge>
          </div>

          {/* File List */}
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {safeDiffs.map((diff, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  {/* File Header */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(diff.filePath)}
                        onChange={() => toggleFileSelection(diff.filePath)}
                        className="rounded border-gray-300"
                      />
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{diff.filePath}</span>
                      <Badge variant="outline" className="text-xs">
                        {diff.changes.length} changes
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFileExpansion(diff.filePath)}
                      className="text-xs"
                    >
                      {expandedFiles.has(diff.filePath) ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>

                  {/* File Changes */}
                  {expandedFiles.has(diff.filePath) && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-1">
                        {diff.changes.map((change, changeIndex) => (
                          <div
                            key={changeIndex}
                            className={`flex items-start gap-2 p-2 rounded border ${getChangeTypeColor(change.type)}`}
                          >
                            <span className="text-xs font-mono w-6 text-center">
                              {change.line}
                            </span>
                            <span className="text-xs font-mono w-4 text-center">
                              {getChangeTypeIcon(change.type)}
                            </span>
                            <code className="text-xs flex-1 font-mono">
                              {change.content}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFiles(new Set(safeDiffs.map(d => d.filePath)))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFiles(new Set())}
            >
              Select None
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReject}>
              <X className="h-4 w-4 mr-2" />
              Reject All
            </Button>
            <Button variant="outline" onClick={handleAcceptSelected} disabled={selectedFiles.size === 0}>
              <Check className="h-4 w-4 mr-2" />
              Accept Selected ({selectedFiles.size})
            </Button>
            <Button onClick={handleAcceptAll}>
              <Check className="h-4 w-4 mr-2" />
              Accept All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}