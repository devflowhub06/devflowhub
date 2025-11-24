'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Move,
  Download,
  Upload,
  GitBranch,
  Eye,
  Code,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  Database,
  Settings,
  Package,
  Globe,
  Lock,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Zap,
  Bot,
  Sparkles
} from 'lucide-react'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  size?: number
  modified?: string
  children?: FileNode[]
  isOpen?: boolean
  isSelected?: boolean
  gitStatus?: 'added' | 'modified' | 'deleted' | 'untracked' | 'staged'
  isDirty?: boolean
  isNew?: boolean
  isHidden?: boolean
  permissions?: string
  mimeType?: string
}

interface FileTreeProps {
  files: FileNode[]
  selectedFile?: FileNode | null
  onFileSelect: (file: FileNode) => void
  onFileCreate: (name: string) => void
  onFolderCreate?: (name: string) => void
  onFileDelete: (file: FileNode) => void
  onFileRename: (oldPath: string, newPath: string) => void
  onFileMove?: (oldPath: string, newPath: string) => void
  onFileCopy?: (path: string) => void
  onRefresh?: () => void
  projectId: string
  isLoading?: boolean
}

export function FileTree({ 
  files, 
  selectedFile, 
  onFileSelect, 
  onFileCreate, 
  onFolderCreate,
  onFileDelete, 
  onFileRename, 
  onFileMove, 
  onFileCopy,
  onRefresh,
  projectId,
  isLoading = false
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(null)
  const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder' | null; parentId?: string }>({ type: null })
  const [newItemName, setNewItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'modified'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [draggedFile, setDraggedFile] = useState<FileNode | null>(null)
  const [dragOverFile, setDragOverFile] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-expand root folders by default
  useEffect(() => {
    const rootFolders = files.filter(f => f.type === 'directory')
    const newExpandedFolders = new Set(expandedFolders)
    rootFolders.forEach(folder => {
      newExpandedFolders.add(folder.id)
    })
    setExpandedFolders(newExpandedFolders)
  }, [files])

  // Focus input when creating new item
  useEffect(() => {
    if (isCreating.type && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isCreating])

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'directory') {
      const hasChildren = file.children && file.children.length > 0
      return expandedFolders.has(file.id) ? 
        <FolderOpen className="h-4 w-4 text-blue-400 drop-shadow-sm" /> : 
        <Folder className={`h-4 w-4 text-blue-400 drop-shadow-sm ${hasChildren ? 'opacity-100' : 'opacity-80'}`} />
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const name = file.name.toLowerCase()

    // Special files
    if (name === 'package.json') return <Package className="h-4 w-4 text-orange-400 drop-shadow-sm" />
    if (name === 'readme.md' || name === 'readme') return <FileText className="h-4 w-4 text-blue-300 drop-shadow-sm" />
    if (name === '.gitignore') return <GitBranch className="h-4 w-4 text-gray-400 drop-shadow-sm" />
    if (name === '.env' || name.startsWith('.env.')) return <Settings className="h-4 w-4 text-green-400 drop-shadow-sm" />
    if (name === 'dockerfile') return <Package className="h-4 w-4 text-blue-300 drop-shadow-sm" />
    if (name === 'docker-compose.yml') return <Package className="h-4 w-4 text-blue-300 drop-shadow-sm" />
    if (name === 'tsconfig.json') return <Settings className="h-4 w-4 text-blue-400 drop-shadow-sm" />
    if (name === 'next.config.js') return <Settings className="h-4 w-4 text-black drop-shadow-sm" />
    if (name === 'tailwind.config.js') return <Settings className="h-4 w-4 text-cyan-400 drop-shadow-sm" />
    if (name === 'prisma') return <Database className="h-4 w-4 text-purple-400 drop-shadow-sm" />

    // File type icons
    const iconMap: { [key: string]: React.ReactNode } = {
      // Code files
      'js': <Code className="h-4 w-4 text-yellow-400 drop-shadow-sm" />,
      'jsx': <Code className="h-4 w-4 text-yellow-400 drop-shadow-sm" />,
      'ts': <Code className="h-4 w-4 text-blue-400 drop-shadow-sm" />,
      'tsx': <Code className="h-4 w-4 text-blue-400 drop-shadow-sm" />,
      'py': <Code className="h-4 w-4 text-green-400 drop-shadow-sm" />,
      'java': <Code className="h-4 w-4 text-orange-400 drop-shadow-sm" />,
      'cpp': <Code className="h-4 w-4 text-blue-500 drop-shadow-sm" />,
      'c': <Code className="h-4 w-4 text-blue-500 drop-shadow-sm" />,
      'cs': <Code className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'php': <Code className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'rb': <Code className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'go': <Code className="h-4 w-4 text-cyan-400 drop-shadow-sm" />,
      'rs': <Code className="h-4 w-4 text-orange-500 drop-shadow-sm" />,
      'swift': <Code className="h-4 w-4 text-orange-400 drop-shadow-sm" />,
      'kt': <Code className="h-4 w-4 text-purple-500 drop-shadow-sm" />,
      'scala': <Code className="h-4 w-4 text-red-500 drop-shadow-sm" />,
      'dart': <Code className="h-4 w-4 text-blue-300 drop-shadow-sm" />,
      
      // Web files
      'html': <Globe className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'css': <Globe className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'scss': <Globe className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'sass': <Globe className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'less': <Globe className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'vue': <Globe className="h-4 w-4 text-green-400 drop-shadow-sm" />,
      'svelte': <Globe className="h-4 w-4 text-orange-400 drop-shadow-sm" />,
      
      // Data files
      'json': <Settings className="h-4 w-4 text-yellow-400 drop-shadow-sm" />,
      'xml': <Settings className="h-4 w-4 text-orange-400 drop-shadow-sm" />,
      'yaml': <Settings className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'yml': <Settings className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'toml': <Settings className="h-4 w-4 text-gray-400 drop-shadow-sm" />,
      'ini': <Settings className="h-4 w-4 text-gray-400 drop-shadow-sm" />,
      'conf': <Settings className="h-4 w-4 text-gray-400 drop-shadow-sm" />,
      'config': <Settings className="h-4 w-4 text-gray-400 drop-shadow-sm" />,
      
      // Documentation
      'md': <FileText className="h-4 w-4 text-gray-400 drop-shadow-sm" />,
      'txt': <FileText className="h-4 w-4 text-gray-400 drop-shadow-sm" />,
      'rtf': <FileText className="h-4 w-4 text-gray-400 drop-shadow-sm" />,
      'doc': <FileText className="h-4 w-4 text-blue-400 drop-shadow-sm" />,
      'docx': <FileText className="h-4 w-4 text-blue-400 drop-shadow-sm" />,
      'pdf': <FileText className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      
      // Images
      'png': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'jpg': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'jpeg': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'gif': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'svg': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'webp': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'ico': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'bmp': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      'tiff': <Image className="h-4 w-4 text-purple-400 drop-shadow-sm" />,
      
      // Media
      'mp3': <Music className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'wav': <Music className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'flac': <Music className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'aac': <Music className="h-4 w-4 text-pink-400 drop-shadow-sm" />,
      'mp4': <Video className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'avi': <Video className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'mov': <Video className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'wmv': <Video className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'flv': <Video className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      'webm': <Video className="h-4 w-4 text-red-400 drop-shadow-sm" />,
      
      // Archives
      'zip': <Archive className="h-4 w-4 text-yellow-500 drop-shadow-sm" />,
      'rar': <Archive className="h-4 w-4 text-yellow-500 drop-shadow-sm" />,
      '7z': <Archive className="h-4 w-4 text-yellow-500 drop-shadow-sm" />,
      'tar': <Archive className="h-4 w-4 text-yellow-500 drop-shadow-sm" />,
      'gz': <Archive className="h-4 w-4 text-yellow-500 drop-shadow-sm" />,
      'bz2': <Archive className="h-4 w-4 text-yellow-500 drop-shadow-sm" />,
      
      // Database
      'sql': <Database className="h-4 w-4 text-blue-400 drop-shadow-sm" />,
      'db': <Database className="h-4 w-4 text-blue-400 drop-shadow-sm" />,
      'sqlite': <Database className="h-4 w-4 text-blue-400 drop-shadow-sm" />,
      
      // Logs
      'log': <FileText className="h-4 w-4 text-gray-500 drop-shadow-sm" />,
      'lock': <Lock className="h-4 w-4 text-gray-500 drop-shadow-sm" />,
    }

    return iconMap[ext || ''] || <File className="h-4 w-4 text-slate-400 drop-shadow-sm" />
  }

  const getGitStatusIcon = (file: FileNode) => {
    if (!file.gitStatus) return null

    const iconMap = {
      'added': <CheckCircle className="h-3 w-3 text-green-400" />,
      'modified': <AlertCircle className="h-3 w-3 text-yellow-400" />,
      'deleted': <Trash2 className="h-3 w-3 text-red-400" />,
      'untracked': <Plus className="h-3 w-3 text-blue-400" />,
      'staged': <GitCommit className="h-3 w-3 text-green-300" />
    }

    return iconMap[file.gitStatus] || null
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, file })
  }

  const handleContextAction = (action: string, file: FileNode) => {
    switch (action) {
      case 'new-file':
        const fileName = prompt('Enter file name:', 'new-file.js')
        if (fileName) {
          // Pass the full path for context menu creation
          onFileCreate(`${file.path}/${fileName}`)
        }
        break
      case 'new-folder':
        const folderName = prompt('Enter folder name:', 'new-folder')
        if (folderName) {
          // Pass the full path for context menu creation
          onFolderCreate?.(`${file.path}/${folderName}`)
        }
        break
      case 'rename':
        const newName = prompt('Enter new name:', file.name)
        if (newName && newName !== file.name) {
          onFileRename(file.path, file.path.replace(file.name, newName))
        }
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${file.name}?`)) {
          onFileDelete(file)
        }
        break
      case 'copy':
        onFileCopy?.(file.path)
        break
      case 'move':
        const newPath = prompt('Enter new path:', file.path)
        if (newPath && newPath !== file.path) {
          onFileMove?.(file.path, newPath)
        }
        break
      case 'duplicate':
        const duplicateName = `${file.name.split('.')[0]}_copy.${file.name.split('.').pop()}`
        onFileRename(file.path, file.path.replace(file.name, duplicateName))
        break
    }
    setContextMenu(null)
  }

  const handleCreateNew = (type: 'file' | 'folder') => {
    setIsCreating({ type })
    setNewItemName('')
  }

  const handleCreateConfirm = () => {
    if (newItemName.trim()) {
      if (isCreating.type === 'folder' && onFolderCreate) {
        onFolderCreate(newItemName.trim())
      } else {
        onFileCreate(newItemName.trim())
      }
    }
    setIsCreating({ type: null })
    setNewItemName('')
  }

  const handleCreateCancel = () => {
    setIsCreating({ type: null })
    setNewItemName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateConfirm()
    } else if (e.key === 'Escape') {
      handleCreateCancel()
    }
  }

  const filteredFiles = files.filter(file => {
    if (!showHidden && file.isHidden) return false
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Organize files into hierarchical structure
  const organizeFilesHierarchically = (files: FileNode[]) => {
    const fileMap = new Map<string, FileNode>()
    const rootFiles: FileNode[] = []
    
    // First pass: create a map of all files and initialize children arrays
    files.forEach(file => {
      fileMap.set(file.path, { ...file, children: [] })
    })
    
    // Second pass: organize into hierarchy
    files.forEach(file => {
      const pathParts = file.path.split('/').filter(part => part !== '')
      
      if (pathParts.length === 1) {
        // Root level file/folder
        rootFiles.push(fileMap.get(file.path)!)
      } else {
        // Find parent folder
        const parentPath = '/' + pathParts.slice(0, -1).join('/')
        const parent = fileMap.get(parentPath)
        
        if (parent && parent.type === 'directory') {
          parent.children!.push(fileMap.get(file.path)!)
        } else {
          // If parent not found, add to root
          rootFiles.push(fileMap.get(file.path)!)
        }
      }
    })
    
    return rootFiles
  }

  const hierarchicalFiles = organizeFilesHierarchically(filteredFiles)

  // Recursive sorting function for hierarchical structure
  const sortFilesRecursively = (files: FileNode[]): FileNode[] => {
    return files.sort((a, b) => {
      // Always put folders first, then files
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = (a.size || 0) - (b.size || 0)
          break
        case 'modified':
          comparison = new Date(a.modified || 0).getTime() - new Date(b.modified || 0).getTime()
          break
      }
      
      const result = sortOrder === 'asc' ? comparison : -comparison
      
      // If files are equal, sort children recursively
      if (result === 0 && a.children && b.children) {
        return 0
      }
      
      return result
    }).map(file => ({
      ...file,
      children: file.children ? sortFilesRecursively(file.children) : undefined
    }))
  }

  const sortedFiles = sortFilesRecursively(hierarchicalFiles)

  const renderFileNode = (file: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(file.id)
    const isSelected = selectedFile?.id === file.id
    const isCreatingInThisFolder = isCreating.parentId === file.id

    return (
      <div key={file.id}>
        <div
          className={`group flex items-center space-x-2 py-1.5 px-2 rounded cursor-pointer hover:bg-slate-700/50 transition-all duration-150 ${
            isSelected ? 'bg-blue-500/20 border-l-2 border-blue-400 shadow-sm' : 
            file.type === 'directory' ? 'bg-slate-800/30 hover:bg-slate-700/60' : ''
          } ${file.isDirty ? 'border-l-2 border-orange-400' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (file.type === 'directory') {
              toggleFolder(file.id)
            } else {
              onFileSelect(file)
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, file)}
          draggable
          onDragStart={(e) => {
            setDraggedFile(file)
            e.dataTransfer.effectAllowed = 'move'
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverFile(file.id)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (draggedFile && file.type === 'directory' && draggedFile.id !== file.id) {
              onFileMove?.(draggedFile.path, `${file.path}/${draggedFile.name}`)
            }
            setDragOverFile(null)
            setDraggedFile(null)
          }}
        >
          {file.type === 'directory' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(file.id)
              }}
              className="p-0.5 hover:bg-slate-600 rounded transition-colors flex items-center justify-center"
              title={isExpanded ? 'Collapse folder' : 'Expand folder'}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-blue-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-blue-400" />
              )}
            </button>
          )}
          
          {file.type === 'file' && <div className="w-4" />}
          
          <div className={`${file.type === 'directory' ? 'text-blue-400' : ''}`}>
            {getFileIcon(file)}
          </div>
          
          <span className={`text-sm flex-1 truncate ${
            isSelected ? 'text-white font-medium' : file.type === 'directory' ? 'text-blue-300 font-medium' : 'text-slate-300'
          } ${file.isDirty ? 'italic' : ''}`}>
            {file.name}
            {file.isNew && <span className="text-blue-400 ml-1">•</span>}
          </span>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {getGitStatusIcon(file)}
            
            {file.size && (
              <span className="text-xs text-slate-500">
                {formatFileSize(file.size)}
              </span>
            )}
            
            {file.modified && (
              <span className="text-xs text-slate-500" title={new Date(file.modified).toLocaleString()}>
                {formatDate(file.modified)}
              </span>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleContextMenu(e, file)
              }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {file.type === 'folder' && isExpanded && (
          <div>
            {isCreatingInThisFolder && (
              <div className="flex items-center space-x-2 py-1 px-2 bg-slate-800/50 rounded" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
                <div className="w-4" />
                {isCreating.type === 'folder' ? (
                  <Folder className="h-4 w-4 text-yellow-400" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-400" />
                )}
                <Input
                  ref={inputRef}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleCreateCancel}
                  className="h-7 text-sm bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={`New ${isCreating.type}...`}
                  autoFocus
                />
              </div>
            )}
            {file.children && file.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <span>Explorer</span>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
              {sortedFiles.length} items
            </span>
          </h3>
          <div className="flex items-center space-x-1 bg-slate-800/30 rounded-lg p-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateNew('file')}
              className="h-8 w-8 p-0 bg-slate-800/50 border-slate-600 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 hover:text-blue-300 transition-all duration-200 shadow-sm"
              title="New File"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateNew('folder')}
              className="h-8 w-8 p-0 bg-slate-800/50 border-slate-600 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400 hover:text-yellow-300 transition-all duration-200 shadow-sm"
              title="New Folder"
            >
              <Folder className="h-4 w-4" />
            </Button>
            {onRefresh && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRefresh}
                className="h-8 w-8 p-0 bg-slate-800/50 border-slate-600 text-green-400 hover:bg-green-500/20 hover:border-green-400 hover:text-green-300 transition-all duration-200 shadow-sm"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="h-7 pl-7 text-xs bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>{sortedFiles.length} items</span>
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`hover:text-white transition-colors ${showHidden ? 'text-white' : ''}`}
            >
              {showHidden ? 'Hide' : 'Show'} hidden
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border-slate-600 text-slate-300 text-xs rounded px-1 py-0.5"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="size">Size</option>
              <option value="modified">Modified</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover:text-white transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 text-blue-400 animate-spin" />
            <p className="text-sm">Loading files...</p>
          </div>
        ) : sortedFiles.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            <FileText className="h-8 w-8 mx-auto mb-2 text-slate-500" />
            <p className="text-sm">No files found</p>
            <p className="text-xs">Create a file to get started</p>
          </div>
        ) : (
          <div className="py-2">
            {sortedFiles.map(file => renderFileNode(file))}
            
            {/* Root-level creation input */}
            {isCreating.type && !isCreating.parentId && (
              <div className="flex items-center space-x-2 py-1 px-2 bg-slate-800/50 rounded mx-2">
                {isCreating.type === 'folder' ? (
                  <Folder className="h-4 w-4 text-yellow-400" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-400" />
                )}
                <Input
                  ref={inputRef}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleCreateCancel}
                  className="h-7 text-sm bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={`New ${isCreating.type}...`}
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 py-1 min-w-32"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.file.type === 'directory' && (
            <>
              <button
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
                onClick={() => handleContextAction('new-file', contextMenu.file)}
              >
                <FileText className="h-3 w-3" />
                <span>New File</span>
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
                onClick={() => handleContextAction('new-folder', contextMenu.file)}
              >
                <Folder className="h-3 w-3" />
                <span>New Folder</span>
              </button>
              <div className="border-t border-slate-600 my-1" />
            </>
          )}
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('rename', contextMenu.file)}
          >
            <Edit className="h-3 w-3" />
            <span>Rename</span>
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('duplicate', contextMenu.file)}
          >
            <Copy className="h-3 w-3" />
            <span>Duplicate</span>
          </button>
          {onFileMove && (
            <button
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
              onClick={() => handleContextAction('move', contextMenu.file)}
            >
              <Move className="h-3 w-3" />
              <span>Move</span>
            </button>
          )}
          {onFileCopy && (
            <button
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
              onClick={() => handleContextAction('copy', contextMenu.file)}
            >
              <Copy className="h-3 w-3" />
              <span>Copy Path</span>
            </button>
          )}
          <div className="border-t border-slate-600 my-1" />
          <button
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center space-x-2"
            onClick={() => handleContextAction('delete', contextMenu.file)}
          >
            <Trash2 className="h-3 w-3" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}