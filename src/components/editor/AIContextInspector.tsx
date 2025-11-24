'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Code, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  Copy,
  CheckCircle,
  Search,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextFile {
  filename: string
  content: string
  relevance?: number
  snippet?: string
  lineNumbers?: { start: number; end: number }
}

interface AIContextInspectorProps {
  isOpen?: boolean
  onClose?: () => void
  contextFiles?: ContextFile[]
  query?: string
  projectId?: string
  onFileClick?: (filename: string) => void
}

export default function AIContextInspector({
  isOpen = false,
  onClose,
  contextFiles = [],
  query,
  projectId,
  onFileClick
}: AIContextInspectorProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  const toggleFile = (filename: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev)
      if (next.has(filename)) {
        next.delete(filename)
      } else {
        next.add(filename)
      }
      return next
    })
  }

  const copyToClipboard = async (content: string, filename: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(filename)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getRelevanceBadge = (relevance?: number) => {
    if (!relevance) return null
    if (relevance > 0.8) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High</Badge>
    if (relevance > 0.5) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>
    return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Low</Badge>
  }

  if (!isOpen) return null

  return (
    <Card className="h-full flex flex-col border-white/10 bg-slate-950/40 backdrop-blur-xl">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-accent-warn" />
            <CardTitle className="text-sm font-semibold">AI Context Inspector</CardTitle>
            {contextFiles.length > 0 && (
              <Badge variant="outline" className="bg-accent-warn/10 text-accent-warn border-accent-warn/20">
                {contextFiles.length} {contextFiles.length === 1 ? 'file' : 'files'}
              </Badge>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {query && (
          <p className="text-xs text-slate-400 mt-2">
            Context for: <span className="text-slate-300 font-mono">{query.substring(0, 60)}{query.length > 60 ? '...' : ''}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {contextFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm text-center">No context files available</p>
            <p className="text-xs text-slate-500 mt-2 text-center">
              AI suggestions will show relevant files here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {contextFiles.map((file, index) => {
                const isExpanded = expandedFiles.has(file.filename)
                const displayContent = file.snippet || file.content
                const previewLength = 200

                return (
                  <div
                    key={index}
                    className="border border-white/5 rounded-lg bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
                  >
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer"
                      onClick={() => toggleFile(file.filename)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                        <FileText className="h-4 w-4 text-accent-warn flex-shrink-0" />
                        <span className="text-xs font-mono text-slate-300 truncate flex-1">
                          {file.filename}
                        </span>
                        {getRelevanceBadge(file.relevance)}
                      </div>
                      <div className="flex items-center gap-1">
                        {onFileClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-accent-warn"
                            onClick={(e) => {
                              e.stopPropagation()
                              onFileClick(file.filename)
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-accent-warn"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(file.content, file.filename)
                          }}
                        >
                          {copiedFile === file.filename ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/5 p-3 bg-slate-950/40">
                        {file.lineNumbers && (
                          <div className="mb-2 text-xs text-slate-400">
                            Lines {file.lineNumbers.start}-{file.lineNumbers.end}
                          </div>
                        )}
                        <div className="relative">
                          <pre className="text-xs text-slate-200 overflow-x-auto bg-slate-950/60 p-3 rounded border border-white/5">
                            <code>{displayContent}</code>
                          </pre>
                        </div>
                        {file.content.length > previewLength && !file.snippet && (
                          <p className="text-xs text-slate-500 mt-2">
                            Showing first {previewLength} characters of {file.content.length} total
                          </p>
                        )}
                      </div>
                    )}

                    {!isExpanded && displayContent && (
                      <div className="px-3 pb-3">
                        <pre className="text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap line-clamp-2">
                          {displayContent.substring(0, previewLength)}
                          {displayContent.length > previewLength ? '...' : ''}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

