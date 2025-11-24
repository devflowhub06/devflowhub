'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Play, 
  GitCommit, 
  GitBranch, 
  GitPullRequest,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface EditorToolbarProps {
  onSave: () => void
  onRun: () => void
  onCommit: () => void
  onBranch: () => void
  onPR: () => void
  isSaving: boolean
  isDirty: boolean
  hasChanges: boolean
}

export function EditorToolbar({
  onSave,
  onRun,
  onCommit,
  onBranch,
  onPR,
  isSaving,
  isDirty,
  hasChanges
}: EditorToolbarProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* Save Button */}
      <Button
        size="sm"
        onClick={onSave}
        disabled={isSaving || !isDirty}
        className="flex items-center space-x-1"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span>Save</span>
        {isDirty && (
          <Badge variant="outline" className="text-xs ml-1">
            Unsaved
          </Badge>
        )}
      </Button>

      {/* Run Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={onRun}
        className="flex items-center space-x-1"
      >
        <Play className="h-4 w-4" />
        <span>Run</span>
      </Button>

      {/* Git Actions */}
      <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onBranch}
          className="flex items-center space-x-1"
        >
          <GitBranch className="h-4 w-4" />
          <span>Branch</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onCommit}
          disabled={!hasChanges}
          className="flex items-center space-x-1"
        >
          <GitCommit className="h-4 w-4" />
          <span>Commit</span>
          {hasChanges && (
            <Badge variant="outline" className="text-xs ml-1">
              {hasChanges ? 'Changes' : 'Clean'}
            </Badge>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onPR}
          disabled={!hasChanges}
          className="flex items-center space-x-1"
        >
          <GitPullRequest className="h-4 w-4" />
          <span>PR</span>
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-1">
        {isDirty ? (
          <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unsaved
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-green-600 bg-green-50 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Saved
          </Badge>
        )}
      </div>
    </div>
  )
}
