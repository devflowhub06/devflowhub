'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GitBranch, 
  GitCommit, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react'

interface GitStatus {
  currentBranch: string
  lastCommit: string
  lastSynced: string
  hasChanges: boolean
  stagedFiles: string[]
  unstagedFiles: string[]
}

interface GitStatusBarProps {
  status: GitStatus
  onRefresh: () => void
}

export function GitStatusBar({ status, onRefresh }: GitStatusBarProps) {
  const getStatusColor = (hasChanges: boolean) => {
    return hasChanges 
      ? 'text-amber-600 bg-amber-50 border-amber-200' 
      : 'text-green-600 bg-green-50 border-green-200'
  }

  const getStatusIcon = (hasChanges: boolean) => {
    return hasChanges ? (
      <AlertTriangle className="h-3 w-3" />
    ) : (
      <CheckCircle className="h-3 w-3" />
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Current Branch */}
      <div className="flex items-center space-x-1">
        <GitBranch className="h-3 w-3 text-gray-500" />
        <span className="text-sm text-gray-700">{status.currentBranch}</span>
      </div>

      {/* Last Commit */}
      <div className="flex items-center space-x-1">
        <GitCommit className="h-3 w-3 text-gray-500" />
        <span className="text-sm font-mono text-gray-600">
          {status.lastCommit.substring(0, 8)}
        </span>
      </div>

      {/* Last Synced */}
      <div className="flex items-center space-x-1">
        <Clock className="h-3 w-3 text-gray-500" />
        <span className="text-sm text-gray-600">
          {new Date(status.lastSynced).toLocaleTimeString()}
        </span>
      </div>

      {/* Changes Status */}
      <Badge 
        variant="outline" 
        className={`text-xs ${getStatusColor(status.hasChanges)}`}
      >
        <div className="flex items-center space-x-1">
          {getStatusIcon(status.hasChanges)}
          <span>
            {status.hasChanges 
              ? `${status.unstagedFiles.length} changes`
              : 'Clean'
            }
          </span>
        </div>
      </Badge>

      {/* Staged Files Count */}
      {status.stagedFiles.length > 0 && (
        <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-1">
            <Plus className="h-3 w-3" />
            <span>{status.stagedFiles.length} staged</span>
          </div>
        </Badge>
      )}

      {/* Unstaged Files Count */}
      {status.unstagedFiles.length > 0 && (
        <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50 border-amber-200">
          <div className="flex items-center space-x-1">
            <Minus className="h-3 w-3" />
            <span>{status.unstagedFiles.length} unstaged</span>
          </div>
        </Badge>
      )}

      {/* Refresh Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onRefresh}
        className="h-6 w-6 p-0 hover:bg-gray-100"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  )
}
