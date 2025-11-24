'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  FileText, 
  GitBranch, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Star,
  Pin,
  MoreHorizontal,
  Save,
  XCircle
} from 'lucide-react'

interface EditorTab {
  id: string
  name: string
  path: string
  content: string
  isDirty: boolean
  isPinned: boolean
  isActive: boolean
  lastSaved?: string
  gitStatus?: 'added' | 'modified' | 'deleted' | 'untracked' | 'staged'
  language?: string
  size?: number
}

interface EditorTabsProps {
  tabs: EditorTab[]
  activeTabId?: string
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabCloseAll: () => void
  onTabCloseOthers: (tabId: string) => void
  onTabCloseRight: (tabId: string) => void
  onTabCloseLeft: (tabId: string) => void
  onTabPin: (tabId: string) => void
  onTabUnpin: (tabId: string) => void
  onTabSave: (tabId: string) => void
  onTabSaveAll: () => void
  maxTabs?: number
}

export function EditorTabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabCloseAll,
  onTabCloseOthers,
  onTabCloseRight,
  onTabCloseLeft,
  onTabPin,
  onTabUnpin,
  onTabSave,
  onTabSaveAll,
  maxTabs = 10
}: EditorTabsProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null)
  const [showOverflow, setShowOverflow] = useState(false)

  const getFileIcon = (tab: EditorTab) => {
    const ext = tab.name.split('.').pop()?.toLowerCase()
    const iconMap: { [key: string]: React.ReactNode } = {
      'js': <FileText className="h-3 w-3 text-yellow-400" />,
      'jsx': <FileText className="h-3 w-3 text-yellow-400" />,
      'ts': <FileText className="h-3 w-3 text-blue-400" />,
      'tsx': <FileText className="h-3 w-3 text-blue-400" />,
      'py': <FileText className="h-3 w-3 text-green-400" />,
      'html': <FileText className="h-3 w-3 text-red-400" />,
      'css': <FileText className="h-3 w-3 text-pink-400" />,
      'json': <FileText className="h-3 w-3 text-yellow-400" />,
      'md': <FileText className="h-3 w-3 text-gray-400" />,
      'txt': <FileText className="h-3 w-3 text-gray-400" />
    }
    return iconMap[ext || ''] || <FileText className="h-3 w-3 text-slate-400" />
  }

  const getGitStatusIcon = (tab: EditorTab) => {
    if (!tab.gitStatus) return null

    const iconMap = {
      'added': <CheckCircle className="h-3 w-3 text-green-400" />,
      'modified': <AlertCircle className="h-3 w-3 text-yellow-400" />,
      'deleted': <X className="h-3 w-3 text-red-400" />,
      'untracked': <FileText className="h-3 w-3 text-blue-400" />,
      'staged': <GitBranch className="h-3 w-3 text-green-300" />
    }

    return iconMap[tab.gitStatus] || null
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const formatLastSaved = (lastSaved?: string) => {
    if (!lastSaved) return ''
    const date = new Date(lastSaved)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return date.toLocaleDateString()
  }

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, tabId })
  }

  const handleContextAction = (action: string, tabId: string) => {
    switch (action) {
      case 'close':
        onTabClose(tabId)
        break
      case 'closeOthers':
        onTabCloseOthers(tabId)
        break
      case 'closeRight':
        onTabCloseRight(tabId)
        break
      case 'closeLeft':
        onTabCloseLeft(tabId)
        break
      case 'pin':
        onTabPin(tabId)
        break
      case 'unpin':
        onTabUnpin(tabId)
        break
      case 'save':
        onTabSave(tabId)
        break
    }
    setContextMenu(null)
  }

  const visibleTabs = tabs.slice(0, maxTabs)
  const hiddenTabs = tabs.slice(maxTabs)

  return (
    <div className="bg-slate-800 border-b border-slate-700 flex items-center overflow-x-auto">
      {/* Tabs */}
      <div className="flex items-center min-w-0">
        {visibleTabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center space-x-2 px-3 py-2 border-r border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors min-w-0 max-w-48 ${
              tab.isActive ? 'bg-slate-700 border-b-2 border-blue-400' : ''
            } ${tab.isDirty ? 'border-l-2 border-orange-400' : ''}`}
            onClick={() => onTabSelect(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
          >
            {/* File Icon */}
            {getFileIcon(tab)}
            
            {/* Tab Name */}
            <span className={`text-sm truncate ${
              tab.isActive ? 'text-white font-medium' : 'text-slate-300'
            }`}>
              {tab.name}
              {tab.isDirty && <span className="text-orange-400 ml-1">•</span>}
            </span>
            
            {/* Git Status */}
            {getGitStatusIcon(tab)}
            
            {/* File Size */}
            {tab.size && (
              <span className="text-xs text-slate-500">
                {formatFileSize(tab.size)}
              </span>
            )}
            
            {/* Last Saved */}
            {tab.lastSaved && (
              <span className="text-xs text-slate-500" title={new Date(tab.lastSaved).toLocaleString()}>
                {formatLastSaved(tab.lastSaved)}
              </span>
            )}
            
            {/* Pin Indicator */}
            {tab.isPinned && (
              <Pin className="h-3 w-3 text-blue-400" />
            )}
            
            {/* Close Button */}
            <button
              className="opacity-0 group-hover:opacity-100 hover:bg-slate-600 rounded p-0.5 transition-all"
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Overflow Menu */}
      {hiddenTabs.length > 0 && (
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOverflow(!showOverflow)}
            className="h-8 px-2 text-slate-400 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="ml-1 text-xs">{hiddenTabs.length}</span>
          </Button>
          
          {showOverflow && (
            <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-48 max-h-64 overflow-y-auto">
              {hiddenTabs.map((tab) => (
                <button
                  key={tab.id}
                  className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center space-x-2"
                  onClick={() => {
                    onTabSelect(tab.id)
                    setShowOverflow(false)
                  }}
                >
                  {getFileIcon(tab)}
                  <span className="truncate">{tab.name}</span>
                  {tab.isDirty && <span className="text-orange-400">•</span>}
                  {getGitStatusIcon(tab)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Actions */}
      <div className="flex items-center space-x-1 ml-auto px-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onTabSaveAll}
          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
          title="Save All"
        >
          <Save className="h-3 w-3 mr-1" />
          Save All
        </Button>
        
        <div className="w-px h-4 bg-slate-600" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onTabCloseAll}
          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
          title="Close All"
        >
          <XCircle className="h-3 w-3" />
        </Button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 py-1 min-w-32"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('save', contextMenu.tabId)}
          >
            <Save className="h-3 w-3" />
            <span>Save</span>
          </button>
          
          <div className="border-t border-slate-600 my-1" />
          
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('closeOthers', contextMenu.tabId)}
          >
            <CloseOthers className="h-3 w-3" />
            <span>Close Others</span>
          </button>
          
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('closeRight', contextMenu.tabId)}
          >
            <X className="h-3 w-3" />
            <span>Close to Right</span>
          </button>
          
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('closeLeft', contextMenu.tabId)}
          >
            <CloseLeft className="h-3 w-3" />
            <span>Close to Left</span>
          </button>
          
          <div className="border-t border-slate-600 my-1" />
          
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => {
              const tab = tabs.find(t => t.id === contextMenu.tabId)
              if (tab) {
                if (tab.isPinned) {
                  onTabUnpin(tab.id)
                } else {
                  onTabPin(tab.id)
                }
              }
              setContextMenu(null)
            }}
          >
            <Pin className="h-3 w-3" />
            <span>{tabs.find(t => t.id === contextMenu.tabId)?.isPinned ? 'Unpin' : 'Pin'}</span>
          </button>
          
          <div className="border-t border-slate-600 my-1" />
          
          <button
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('close', contextMenu.tabId)}
          >
            <X className="h-3 w-3" />
            <span>Close</span>
          </button>
        </div>
      )}
    </div>
  )
}
