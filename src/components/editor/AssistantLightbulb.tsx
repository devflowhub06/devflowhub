'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Zap, 
  Code, 
  TestTube, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  Brain,
  Wand2
} from 'lucide-react'

interface Suggestion {
  id: string
  type: 'refactor' | 'optimize' | 'fix' | 'test' | 'explain' | 'generate'
  title: string
  description: string
  confidence: number
  estimatedCost: number
  code?: string
  rationale?: string
}

interface AssistantLightbulbProps {
  position: { line: number; column: number }
  onSuggestion: (suggestion: Suggestion) => void
  onPreview: (suggestion: Suggestion) => void
  projectId: string
  filePath: string
  selectedCode?: string
  isVisible: boolean
}

export function AssistantLightbulb({ 
  position, 
  onSuggestion, 
  onPreview, 
  projectId, 
  filePath, 
  selectedCode,
  isVisible 
}: AssistantLightbulbProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)

  useEffect(() => {
    if (isVisible && selectedCode) {
      generateSuggestions()
    }
  }, [isVisible, selectedCode])

  const generateSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/assistant/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          filePath,
          selectedCode,
          context: {
            language: getLanguageFromPath(filePath),
            position: { line: position.line, column: position.column }
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash'
    }
    return languageMap[ext || ''] || 'text'
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'refactor': return <RefreshCw className="h-4 w-4" />
      case 'optimize': return <Zap className="h-4 w-4" />
      case 'fix': return <AlertTriangle className="h-4 w-4" />
      case 'test': return <TestTube className="h-4 w-4" />
      case 'explain': return <Eye className="h-4 w-4" />
      case 'generate': return <Wand2 className="h-4 w-4" />
      default: return <Code className="h-4 w-4" />
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'refactor': return 'text-blue-400'
      case 'optimize': return 'text-green-400'
      case 'fix': return 'text-red-400'
      case 'test': return 'text-purple-400'
      case 'explain': return 'text-yellow-400'
      case 'generate': return 'text-pink-400'
      default: return 'text-slate-400'
    }
  }

  const formatConfidence = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High'
    if (confidence >= 0.7) return 'High'
    if (confidence >= 0.5) return 'Medium'
    return 'Low'
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  if (!isVisible) return null

  return (
    <div className="relative">
      {/* Lightbulb Button */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute -top-8 -left-8 h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Lightbulb className="h-4 w-4" />
      </Button>

      {/* Suggestions Panel */}
      {isOpen && (
        <div className="absolute -top-2 -left-80 w-80 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 z-20">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">AI Suggestions</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Generating suggestions...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                <Sparkles className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">No suggestions available</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSuggestion?.id === suggestion.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedSuggestion(suggestion)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`${getSuggestionColor(suggestion.type)} mt-0.5`}>
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-medium text-sm">
                            {suggestion.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="text-xs">
                              {formatConfidence(suggestion.confidence)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatCost(suggestion.estimatedCost)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs mb-2">
                          {suggestion.description}
                        </p>
                        {suggestion.rationale && (
                          <p className="text-slate-500 text-xs italic">
                            {suggestion.rationale}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedSuggestion && (
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => onPreview(selectedSuggestion)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSuggestion(selectedSuggestion)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}