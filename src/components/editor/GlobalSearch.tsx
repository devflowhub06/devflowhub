'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  Folder, 
  Code, 
  Filter, 
  X, 
  ChevronRight,
  ChevronDown,
  Clock,
  Star,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Zap,
  Bot,
  Sparkles,
  Settings,
  Package,
  Globe,
  Image,
  Music,
  Video,
  Archive,
  Database,
  Lock
} from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  matches: Array<{
    line: number
    text: string
    start: number
    end: number
  }>
  size?: number
  modified?: string
  gitStatus?: 'added' | 'modified' | 'deleted' | 'untracked' | 'staged'
  language?: string
  score: number
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: SearchResult) => void
  projectId: string
  placeholder?: string
}

export function GlobalSearch({
  isOpen,
  onClose,
  onFileSelect,
  projectId,
  placeholder = "Search files and content..."
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchType, setSearchType] = useState<'all' | 'files' | 'content'>('all')
  const [filters, setFilters] = useState({
    fileTypes: [] as string[],
    gitStatus: [] as string[],
    modified: 'all' as 'all' | 'today' | 'week' | 'month'
  })
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  // Load search history
  useEffect(() => {
    const history = localStorage.getItem(`search-history-${projectId}`)
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [projectId])

  // Save search history
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 10)
      localStorage.setItem(`search-history-${projectId}`, JSON.stringify(newHistory))
      return newHistory
    })
  }, [projectId])

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          type: searchType,
          filters
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      } else {
        // Fallback to mock search for demo
        const mockResults = generateMockResults(searchQuery)
        setResults(mockResults)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Search failed:', error)
      // Fallback to mock search
      const mockResults = generateMockResults(searchQuery)
      setResults(mockResults)
      setSelectedIndex(0)
    } finally {
      setIsSearching(false)
    }
  }, [projectId, searchType, filters])

  // Generate mock search results for demo
  const generateMockResults = (searchQuery: string): SearchResult[] => {
    const mockFiles = [
      { name: 'App.js', path: '/src/App.js', type: 'file' as const, language: 'javascript' },
      { name: 'index.html', path: '/public/index.html', type: 'file' as const, language: 'html' },
      { name: 'styles.css', path: '/src/styles.css', type: 'file' as const, language: 'css' },
      { name: 'package.json', path: '/package.json', type: 'file' as const, language: 'json' },
      { name: 'README.md', path: '/README.md', type: 'file' as const, language: 'markdown' },
      { name: 'components', path: '/src/components', type: 'folder' as const },
      { name: 'utils', path: '/src/utils', type: 'folder' as const },
      { name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file' as const, language: 'typescript' },
      { name: 'Modal.tsx', path: '/src/components/Modal.tsx', type: 'file' as const, language: 'typescript' },
      { name: 'api.ts', path: '/src/api.ts', type: 'file' as const, language: 'typescript' }
    ]

    return mockFiles
      .filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((file, index) => ({
        id: `result-${index}`,
        name: file.name,
        path: file.path,
        type: file.type,
        content: file.type === 'file' ? `// ${file.name} content with ${searchQuery} match` : undefined,
        matches: file.type === 'file' ? [
          { line: 1, text: `// ${file.name} content with ${searchQuery} match`, start: 0, end: searchQuery.length }
        ] : [],
        size: file.type === 'file' ? Math.floor(Math.random() * 10000) : undefined,
        modified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        gitStatus: ['added', 'modified', 'untracked'][Math.floor(Math.random() * 3)] as any,
        language: file.language,
        score: Math.random()
      }))
      .sort((a, b) => b.score - a.score)
  }

  // Handle search input
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    } else {
      setResults([])
    }
  }, [performSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          onFileSelect(results[selectedIndex])
          saveToHistory(query)
          onClose()
        }
        break
    }
  }, [results, selectedIndex, onFileSelect, query, saveToHistory, onClose])

  // Get file icon
  const getFileIcon = (result: SearchResult) => {
    if (result.type === 'folder') {
      return <Folder className="h-4 w-4 text-blue-400" />
    }

    const ext = result.name.split('.').pop()?.toLowerCase()
    const name = result.name.toLowerCase()

    // Special files
    if (name === 'package.json') return <Package className="h-4 w-4 text-orange-400" />
    if (name === 'readme.md' || name === 'readme') return <FileText className="h-4 w-4 text-blue-300" />
    if (name === '.gitignore') return <GitBranch className="h-4 w-4 text-gray-400" />
    if (name === '.env' || name.startsWith('.env.')) return <Settings className="h-4 w-4 text-green-400" />
    if (name === 'dockerfile') return <Package className="h-4 w-4 text-blue-300" />
    if (name === 'tsconfig.json') return <Settings className="h-4 w-4 text-blue-400" />

    // File type icons
    const iconMap: { [key: string]: React.ReactNode } = {
      'js': <Code className="h-4 w-4 text-yellow-400" />,
      'jsx': <Code className="h-4 w-4 text-yellow-400" />,
      'ts': <Code className="h-4 w-4 text-blue-400" />,
      'tsx': <Code className="h-4 w-4 text-blue-400" />,
      'py': <Code className="h-4 w-4 text-green-400" />,
      'html': <Globe className="h-4 w-4 text-red-400" />,
      'css': <Globe className="h-4 w-4 text-pink-400" />,
      'json': <Settings className="h-4 w-4 text-yellow-400" />,
      'md': <FileText className="h-4 w-4 text-gray-400" />,
      'txt': <FileText className="h-4 w-4 text-gray-400" />,
      'png': <Image className="h-4 w-4 text-purple-400" />,
      'jpg': <Image className="h-4 w-4 text-purple-400" />,
      'svg': <Image className="h-4 w-4 text-purple-400" />,
      'mp3': <Music className="h-4 w-4 text-pink-400" />,
      'mp4': <Video className="h-4 w-4 text-red-400" />,
      'zip': <Archive className="h-4 w-4 text-yellow-500" />,
      'sql': <Database className="h-4 w-4 text-blue-400" />
    }

    return iconMap[ext || ''] || <FileText className="h-4 w-4 text-slate-400" />
  }

  const getGitStatusIcon = (result: SearchResult) => {
    if (!result.gitStatus) return null

    const iconMap = {
      'added': <CheckCircle className="h-3 w-3 text-green-400" />,
      'modified': <AlertCircle className="h-3 w-3 text-yellow-400" />,
      'deleted': <X className="h-3 w-3 text-red-400" />,
      'untracked': <FileText className="h-3 w-3 text-blue-400" />,
      'staged': <GitBranch className="h-3 w-3 text-green-300" />
    }

    return iconMap[result.gitStatus] || null
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-slate-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Type Tabs */}
          <div className="flex items-center space-x-1 mt-3">
            {[
              { key: 'all', label: 'All', icon: Search },
              { key: 'files', label: 'Files', icon: FileText },
              { key: 'content', label: 'Content', icon: Code }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                size="sm"
                variant={searchType === key ? 'default' : 'ghost'}
                onClick={() => setSearchType(key as any)}
                className="h-7 px-3 text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <p>Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-500" />
              <p>No results found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-slate-700/50 ${
                    index === selectedIndex ? 'bg-slate-700' : ''
                  }`}
                  onClick={() => {
                    onFileSelect(result)
                    saveToHistory(query)
                    onClose()
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(result)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white truncate">
                          {highlightMatch(result.name, query)}
                        </span>
                        {getGitStatusIcon(result)}
                        {result.size && (
                          <span className="text-xs text-slate-500">
                            {formatFileSize(result.size)}
                          </span>
                        )}
                        {result.modified && (
                          <span className="text-xs text-slate-500">
                            {formatDate(result.modified)}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-slate-400 truncate">
                        {result.path}
                      </div>
                      
                      {result.matches.length > 0 && (
                        <div className="text-xs text-slate-300 mt-1">
                          {result.matches.slice(0, 2).map((match, matchIndex) => (
                            <div key={matchIndex} className="truncate">
                              <span className="text-slate-500">Line {match.line}:</span>{' '}
                              {highlightMatch(match.text, query)}
                            </div>
                          ))}
                          {result.matches.length > 2 && (
                            <div className="text-slate-500">
                              +{result.matches.length - 2} more matches
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search History */}
        {query === '' && searchHistory.length > 0 && (
          <div className="border-t border-slate-700 p-4">
            <div className="text-xs text-slate-400 mb-2">Recent searches</div>
            <div className="space-y-1">
              {searchHistory.slice(0, 5).map((historyItem, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-1 text-sm text-slate-300 hover:bg-slate-700/50 rounded flex items-center space-x-2"
                  onClick={() => handleSearch(historyItem)}
                >
                  <Clock className="h-3 w-3" />
                  <span>{historyItem}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-700 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>Esc Close</span>
            </div>
            <div>
              {results.length > 0 && `${results.length} result${results.length === 1 ? '' : 's'}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
