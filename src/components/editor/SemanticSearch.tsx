'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  FileText, 
  Code, 
  Loader2,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clientTrackEvent } from '@/lib/client-analytics'

interface SearchResult {
  filename: string
  content: string
  relevance?: number
  snippet?: string
}

interface SemanticSearchProps {
  isOpen?: boolean
  onClose?: () => void
  projectId?: string
  onFileClick?: (filename: string) => void
}

export default function SemanticSearch({
  isOpen = false,
  onClose,
  projectId,
  onFileClick
}: SemanticSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !projectId) return

    setIsSearching(true)
    setHasSearched(true)
    
    clientTrackEvent('semantic_search_performed', {
      projectId,
      queryLength: query.length
    })

    try {
      const response = await fetch(`/api/assistant/context?projectId=${projectId}&query=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      // Parse the context to extract files
      if (data.context) {
        const fileMatches = data.context.match(/## ([^\n]+)\n```[\s\S]*?```/g) || []
        const parsedResults: SearchResult[] = fileMatches.map((match: string) => {
          const filenameMatch = match.match(/## ([^\n]+)/)
          const codeMatch = match.match(/```[\s\S]*?\n([\s\S]*?)```/)
          
          return {
            filename: filenameMatch ? filenameMatch[1].trim() : 'Unknown',
            content: codeMatch ? codeMatch[1].trim() : '',
            snippet: codeMatch ? codeMatch[1].trim().substring(0, 300) : ''
          }
        })

        setResults(parsedResults)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Semantic search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query, projectId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setHasSearched(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <Card className="h-full flex flex-col border-white/10 bg-slate-950/40 backdrop-blur-xl">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-warn" />
            <CardTitle className="text-sm font-semibold">Semantic Code Search</CardTitle>
            <Badge variant="outline" className="bg-accent-warn/10 text-accent-warn border-accent-warn/20 text-[10px]">
              AI-Powered
            </Badge>
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
      </CardHeader>

      <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
        {/* Search Input */}
        <div className="p-4 border-b border-white/5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search code semantically (e.g., 'authentication logic', 'error handling')..."
                className="pl-9 bg-slate-900/60 border-white/10 text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="bg-accent-warn hover:bg-orange-500 text-white"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Find code by meaning, not just keywords. Powered by AI embeddings.
          </p>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent-warn mb-4" />
                <p className="text-sm text-slate-400">Searching codebase...</p>
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">No results found</p>
                <p className="text-xs text-slate-500 mt-2">Try a different search query</p>
              </div>
            ) : hasSearched && results.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400">
                    Found {results.length} {results.length === 1 ? 'result' : 'results'}
                  </p>
                </div>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="border border-white/5 rounded-lg bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-accent-warn flex-shrink-0" />
                        <span className="text-xs font-mono text-slate-300 truncate">
                          {result.filename}
                        </span>
                      </div>
                      {onFileClick && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-accent-warn"
                          onClick={() => onFileClick(result.filename)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    {result.snippet && (
                      <pre className="text-xs text-slate-400 overflow-x-auto bg-slate-950/60 p-2 rounded border border-white/5 mt-2 line-clamp-3">
                        <code>{result.snippet}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Search className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm text-center mb-2">Semantic Code Search</p>
                <p className="text-xs text-slate-500 text-center max-w-xs">
                  Search your codebase by meaning. Find functions, patterns, and logic semantically.
                </p>
                <div className="mt-6 space-y-2 text-xs text-left w-full max-w-sm">
                  <div className="bg-slate-900/40 p-3 rounded border border-white/5">
                    <p className="text-slate-300 mb-1">Example searches:</p>
                    <ul className="text-slate-400 space-y-1 ml-4 list-disc">
                      <li>"authentication middleware"</li>
                      <li>"error handling patterns"</li>
                      <li>"database connection logic"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

