'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Download,
  FileText,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Copy,
  FolderPlus
} from 'lucide-react'

interface InsertComponentModalProps {
  isOpen: boolean
  onClose: () => void
  component: any
  projectId: string
  onInsert: (data: InsertData) => Promise<void>
}

interface InsertData {
  componentData: any
  targetPath: string
  commitMessage: string
  createTests: boolean
  createStory: boolean
}

export function InsertComponentModal({ 
  isOpen, 
  onClose, 
  component, 
  projectId,
  onInsert 
}: InsertComponentModalProps) {
  const [targetPath, setTargetPath] = useState(`components/ui/${component?.name || 'Component'}.tsx`)
  const [commitMessage, setCommitMessage] = useState(`AI: Add ${component?.name || 'Component'} component`)
  const [createTests, setCreateTests] = useState(true)
  const [createStory, setCreateStory] = useState(true)
  const [isInserting, setIsInserting] = useState(false)

  const handleInsert = async () => {
    if (!component) return
    
    try {
      setIsInserting(true)
      
      const insertData: InsertData = {
        componentData: component,
        targetPath,
        commitMessage,
        createTests,
        createStory
      }
      
      await onInsert(insertData)
      onClose()
    } catch (error) {
      console.error('Failed to insert component:', error)
      alert('Failed to insert component. Please try again.')
    } finally {
      setIsInserting(false)
    }
  }

  const getFilesToCreate = () => {
    const files = [
      {
        path: targetPath,
        type: 'Component',
        size: `${Math.round((component?.code?.length || 0) / 1024 * 10) / 10}KB`
      }
    ]

    if (createTests && component?.test) {
      const testPath = targetPath.replace(/\.tsx?$/, '.test.tsx')
      files.push({
        path: testPath,
        type: 'Test',
        size: `${Math.round((component.test.length || 0) / 1024 * 10) / 10}KB`
      })
    }

    if (createStory && component?.story) {
      const storyPath = targetPath.replace(/\.tsx?$/, '.stories.tsx')
      files.push({
        path: storyPath,
        type: 'Story',
        size: `${Math.round((component.story.length || 0) / 1024 * 10) / 10}KB`
      })
    }

    return files
  }

  if (!component) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-purple-500" />
            <span>Insert Component into Project</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Component Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">{component.name}</h3>
              <Badge className="bg-purple-100 text-purple-800">
                {Math.round(component.confidence * 100)}% confident
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-3">{component.rationale}</p>
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span>{component.variants?.length || 0} variants</span>
              <span>{component.props?.length || 0} props</span>
              <span>TypeScript + Tailwind</span>
            </div>
          </div>

          {/* File Path Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetPath" className="text-sm font-medium">
                Component File Path
              </Label>
              <Input
                id="targetPath"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder="components/ui/Button.tsx"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Relative to project root. Will be created in assistant branch.
              </p>
            </div>

            <div>
              <Label htmlFor="commitMessage" className="text-sm font-medium">
                Commit Message
              </Label>
              <Input
                id="commitMessage"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="AI: Add Button component"
                className="mt-1"
              />
            </div>
          </div>

          {/* Additional Files */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Additional Files</h4>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="createTests"
                checked={createTests}
                onChange={(e) => setCreateTests(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="createTests" className="text-sm">
                Create Jest test file ({component.name}.test.tsx)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="createStory"
                checked={createStory}
                onChange={(e) => setCreateStory(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="createStory" className="text-sm">
                Create Storybook story ({component.name}.stories.tsx)
              </Label>
            </div>
          </div>

          {/* Files Preview */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Files to Create</span>
            </h4>
            
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              {getFilesToCreate().map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <FolderPlus className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-slate-700">{file.path}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                    <span className="text-slate-500">{file.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Safe Insertion Process</p>
                <p className="text-blue-700 mt-1">
                  Files will be created in a new assistant branch. You can review all changes 
                  before merging into your main codebase.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isInserting}>
              Cancel
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(component.code)
                  alert('Component code copied to clipboard!')
                }}
                disabled={isInserting}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Code
              </Button>
              
              <Button
                onClick={handleInsert}
                disabled={isInserting || !targetPath.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isInserting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Inserting...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-3 w-3 mr-1" />
                    Insert Component
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
