'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Plus, 
  Minus, 
  Edit3, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { FileChange } from './PreviewChangesModal'

interface DiffViewerProps {
  files: FileChange[]
}

interface DiffLine {
  type: 'added' | 'removed' | 'context'
  content: string
  lineNumber?: number
}

function generateDiffLines(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const diffLines: DiffLine[] = []
  
  let oldIndex = 0
  let newIndex = 0
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex] || ''
    const newLine = newLines[newIndex] || ''
    
    if (oldLine === newLine) {
      // Context line
      diffLines.push({
        type: 'context',
        content: oldLine,
        lineNumber: oldIndex + 1
      })
      oldIndex++
      newIndex++
    } else if (oldIndex < oldLines.length && newIndex < newLines.length) {
      // Check if this is a modification
      const nextOldLine = oldLines[oldIndex + 1] || ''
      const nextNewLine = newLines[newIndex + 1] || ''
      
      if (nextOldLine === newLine) {
        // Line was removed
        diffLines.push({
          type: 'removed',
          content: oldLine,
          lineNumber: oldIndex + 1
        })
        oldIndex++
      } else if (oldLine === nextNewLine) {
        // Line was added
        diffLines.push({
          type: 'added',
          content: newLine,
          lineNumber: newIndex + 1
        })
        newIndex++
      } else {
        // Both lines are different - treat as remove + add
        diffLines.push({
          type: 'removed',
          content: oldLine,
          lineNumber: oldIndex + 1
        })
        diffLines.push({
          type: 'added',
          content: newLine,
          lineNumber: newIndex + 1
        })
        oldIndex++
        newIndex++
      }
    } else if (oldIndex < oldLines.length) {
      // Remaining old lines
      diffLines.push({
        type: 'removed',
        content: oldLine,
        lineNumber: oldIndex + 1
      })
      oldIndex++
    } else {
      // Remaining new lines
      diffLines.push({
        type: 'added',
        content: newLine,
        lineNumber: newIndex + 1
      })
      newIndex++
    }
  }
  
  return diffLines
}

function FileDiff({ file }: { file: FileChange }) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const getFileIcon = () => {
    switch (file.type) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'modify':
        return <Edit3 className="h-4 w-4 text-blue-600" />
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFileTypeColor = () => {
    switch (file.type) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'modify':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderContent = () => {
    if (file.type === 'create') {
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 mb-2">New file content:</div>
          <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            {file.newContent}
          </pre>
        </div>
      )
    }

    if (file.type === 'delete') {
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 mb-2">File will be deleted:</div>
          <pre className="bg-red-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            {file.oldContent}
          </pre>
        </div>
      )
    }

    // Modify - show diff
    if (!file.oldContent || !file.newContent) {
      return (
        <div className="text-sm text-gray-500 italic">
          No content available for comparison
        </div>
      )
    }

    const diffLines = generateDiffLines(file.oldContent, file.newContent)
    
    return (
      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">Changes:</div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <ScrollArea className="h-96">
            <div className="font-mono text-sm">
              {diffLines.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${
                    line.type === 'added' ? 'bg-green-50' :
                    line.type === 'removed' ? 'bg-red-50' :
                    'bg-white'
                  }`}
                >
                  <div className="flex items-center px-2 py-1 border-r border-gray-200 bg-gray-50 text-gray-500 text-xs w-12 justify-center">
                    {line.lineNumber}
                  </div>
                  <div className="flex items-center px-2 py-1 w-8 justify-center">
                    {line.type === 'added' && <Plus className="h-3 w-3 text-green-600" />}
                    {line.type === 'removed' && <Minus className="h-3 w-3 text-red-600" />}
                    {line.type === 'context' && <div className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 px-2 py-1 overflow-x-auto">
                    <code className="whitespace-pre">
                      {line.content || ' '}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getFileIcon()}
            <CardTitle className="text-base font-mono">{file.path}</CardTitle>
            <Badge className={getFileTypeColor()}>
              {file.type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {renderContent()}
        </CardContent>
      )}
    </Card>
  )
}

export function DiffViewer({ files }: DiffViewerProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No files to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">File Changes</h3>
        <Badge variant="outline">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {files.map((file, index) => (
            <FileDiff key={index} file={file} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
