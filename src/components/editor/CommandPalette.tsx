'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  Terminal, 
  GitBranch, 
  Settings, 
  Zap,
  Code,
  TestTube,
  Save,
  Play,
  RefreshCw,
  Plus,
  FolderPlus,
  GitCommit,
  GitPullRequest,
  Eye,
  Trash2,
  Copy,
  Move,
  Edit
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (command: string, args?: any) => void
  projectId: string
}

interface Command {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: string
  shortcut?: string
  action: () => void
}

export function CommandPalette({ isOpen, onClose, onCommand, projectId }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [commands, setCommands] = useState<Command[]>([])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    const baseCommands: Command[] = [
      // File Operations
      {
        id: 'file:new',
        title: 'New File',
        description: 'Create a new file',
        icon: FileText,
        category: 'File',
        shortcut: 'Ctrl+N',
        action: () => onCommand('file:new')
      },
      {
        id: 'file:open',
        title: 'Open File',
        description: 'Open a file from the project',
        icon: Search,
        category: 'File',
        shortcut: 'Ctrl+O',
        action: () => onCommand('file:open')
      },
      {
        id: 'file:save',
        title: 'Save File',
        description: 'Save the current file',
        icon: Save,
        category: 'File',
        shortcut: 'Ctrl+S',
        action: () => onCommand('file:save')
      },
      {
        id: 'file:rename',
        title: 'Rename File',
        description: 'Rename the current file',
        icon: Edit,
        category: 'File',
        action: () => onCommand('file:rename')
      },
      {
        id: 'file:delete',
        title: 'Delete File',
        description: 'Delete the current file',
        icon: Trash2,
        category: 'File',
        action: () => onCommand('file:delete')
      },
      {
        id: 'file:copy',
        title: 'Copy File',
        description: 'Copy the current file',
        icon: Copy,
        category: 'File',
        action: () => onCommand('file:copy')
      },
      {
        id: 'file:move',
        title: 'Move File',
        description: 'Move the current file',
        icon: Move,
        category: 'File',
        action: () => onCommand('file:move')
      },
      {
        id: 'folder:new',
        title: 'New Folder',
        description: 'Create a new folder',
        icon: FolderPlus,
        category: 'File',
        action: () => onCommand('folder:new')
      },

      // Git Operations
      {
        id: 'git:status',
        title: 'Git Status',
        description: 'Show git status',
        icon: GitBranch,
        category: 'Git',
        action: () => onCommand('git:status')
      },
      {
        id: 'git:commit',
        title: 'Git Commit',
        description: 'Commit changes',
        icon: GitCommit,
        category: 'Git',
        shortcut: 'Ctrl+Shift+C',
        action: () => onCommand('git:commit')
      },
      {
        id: 'git:branch',
        title: 'Create Branch',
        description: 'Create a new branch',
        icon: GitBranch,
        category: 'Git',
        action: () => onCommand('git:branch')
      },
      {
        id: 'git:pr',
        title: 'Create Pull Request',
        description: 'Create a pull request',
        icon: GitPullRequest,
        category: 'Git',
        action: () => onCommand('git:pr')
      },

      // Terminal Operations
      {
        id: 'terminal:run',
        title: 'Run Terminal Command',
        description: 'Execute a terminal command',
        icon: Terminal,
        category: 'Terminal',
        action: () => onCommand('terminal:run')
      },
      {
        id: 'terminal:clear',
        title: 'Clear Terminal',
        description: 'Clear the terminal output',
        icon: Terminal,
        category: 'Terminal',
        action: () => onCommand('terminal:clear')
      },

      // AI Assistant
      {
        id: 'ai:suggest',
        title: 'AI Code Suggestions',
        description: 'Get AI code suggestions',
        icon: Zap,
        category: 'AI',
        shortcut: 'Ctrl+Shift+A',
        action: () => onCommand('ai:suggest')
      },
      {
        id: 'ai:refactor',
        title: 'AI Refactor',
        description: 'Refactor code with AI',
        icon: Code,
        category: 'AI',
        action: () => onCommand('ai:refactor')
      },
      {
        id: 'ai:test',
        title: 'Generate Tests',
        description: 'Generate unit tests',
        icon: TestTube,
        category: 'AI',
        action: () => onCommand('ai:test')
      },
      {
        id: 'ai:explain',
        title: 'Explain Code',
        description: 'Explain the selected code',
        icon: Eye,
        category: 'AI',
        action: () => onCommand('ai:explain')
      },

      // Project Operations
      {
        id: 'project:run',
        title: 'Run Project',
        description: 'Run the project',
        icon: Play,
        category: 'Project',
        shortcut: 'F5',
        action: () => onCommand('project:run')
      },
      {
        id: 'project:build',
        title: 'Build Project',
        description: 'Build the project',
        icon: RefreshCw,
        category: 'Project',
        action: () => onCommand('project:build')
      },
      {
        id: 'project:test',
        title: 'Run Tests',
        description: 'Run all tests',
        icon: TestTube,
        category: 'Project',
        action: () => onCommand('project:test')
      },

      // Settings
      {
        id: 'settings:open',
        title: 'Open Settings',
        description: 'Open editor settings',
        icon: Settings,
        category: 'Settings',
        shortcut: 'Ctrl+,',
        action: () => onCommand('settings:open')
      }
    ]

    setCommands(baseCommands)
  }, [onCommand])

  const filteredCommands = commands.filter(command => 
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="bg-transparent border-0 text-white placeholder:text-slate-400 focus:ring-0"
            />
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon
                return (
                  <button
                    key={command.id}
                    onClick={() => {
                      command.action()
                      onClose()
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-slate-700 ${
                      index === selectedIndex ? 'bg-slate-700' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{command.title}</span>
                        {command.shortcut && (
                          <Badge variant="outline" className="text-xs">
                            {command.shortcut}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{command.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {command.category}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>{filteredCommands.length} commands</span>
          </div>
        </div>
      </div>
    </div>
  )
}