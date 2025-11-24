'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Terminal, 
  Search, 
  Filter, 
  Download,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle
} from 'lucide-react'

interface LogEntry {
  timestamp: Date
  level: 'info' | 'error' | 'warn' | 'debug'
  source: 'build' | 'runtime' | 'system'
  message: string
}

interface LogsViewProps {
  runId?: string
  isStreaming?: boolean
  onToggleStreaming?: () => void
  onClearLogs?: () => void
}

export function LogsView({
  runId,
  isStreaming = false,
  onToggleStreaming,
  onClearLogs
}: LogsViewProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Simulate log streaming
  useEffect(() => {
    if (!runId || !isStreaming) return

    const mockLogs: LogEntry[] = [
      {
        timestamp: new Date(),
        level: 'info',
        source: 'build',
        message: '[BUILD] Starting build process for project...'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'build',
        message: '[BUILD] Installing dependencies with npm...'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'build',
        message: '[BUILD] ✓ Dependencies installed successfully'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'build',
        message: '[BUILD] Compiling TypeScript files...'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'build',
        message: '[BUILD] ✓ Build completed in 45.2s'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'runtime',
        message: '[RUNTIME] Starting application server...'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'runtime',
        message: '[RUNTIME] ✓ Server listening on port 3000'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'system',
        message: '[SYSTEM] Runtime ready - preview URL active'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'runtime',
        message: '[RUNTIME] GET / - 200 OK (45ms)'
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'runtime',
        message: '[RUNTIME] WebSocket connection established'
      }
    ]

    let logIndex = 0
    const interval = setInterval(() => {
      if (logIndex < mockLogs.length) {
        const newLog = {
          ...mockLogs[logIndex],
          timestamp: new Date()
        }
        setLogs(prev => [...prev, newLog])
        logIndex++
      } else {
        // Add occasional runtime logs
        const runtimeLogs = [
          '[RUNTIME] Health check - OK',
          '[RUNTIME] Memory usage: 128MB',
          '[RUNTIME] CPU usage: 15%',
          '[SYSTEM] Auto-save snapshot created'
        ]
        const randomLog: LogEntry = {
          timestamp: new Date(),
          level: 'info',
          source: Math.random() > 0.5 ? 'runtime' : 'system',
          message: runtimeLogs[Math.floor(Math.random() * runtimeLogs.length)]
        }
        setLogs(prev => [...prev, randomLog])
      }
    }, 1000 + Math.random() * 2000)

    return () => clearInterval(interval)
  }, [runId, isStreaming])

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = logs

    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchQuery, levelFilter, sourceFilter])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-3 w-3 text-red-400" />
      case 'warn': return <AlertTriangle className="h-3 w-3 text-yellow-400" />
      case 'info': return <Info className="h-3 w-3 text-blue-400" />
      case 'debug': return <Eye className="h-3 w-3 text-gray-400" />
      default: return <CheckCircle className="h-3 w-3 text-green-400" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-300'
      case 'warn': return 'text-yellow-300'
      case 'info': return 'text-blue-300'
      case 'debug': return 'text-gray-400'
      default: return 'text-white'
    }
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'build': return 'bg-purple-500'
      case 'runtime': return 'bg-green-500'
      case 'system': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span>Runtime Logs</span>
            {runId && (
              <Badge variant="outline" className="text-xs">
                {runId}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleStreaming}
              className="flex items-center space-x-1"
            >
              {isStreaming ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Stream</span>
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearLogs}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 pt-2">
          <div className="flex items-center space-x-1 flex-1">
            <Search className="h-3 w-3 text-slate-400" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white text-xs h-7"
            />
          </div>
          
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white text-xs h-7 rounded px-2"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white text-xs h-7 rounded px-2"
          >
            <option value="all">All Sources</option>
            <option value="build">Build</option>
            <option value="runtime">Runtime</option>
            <option value="system">System</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full bg-slate-900 rounded border border-slate-700 overflow-hidden flex flex-col">
          {/* Logs Container */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No logs available</p>
                <p className="text-xs">Start a runtime to see logs</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 hover:bg-slate-800 px-2 py-1 rounded">
                    <span className="text-slate-500 text-xs whitespace-nowrap">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    
                    <Badge className={`${getSourceBadgeColor(log.source)} text-white text-xs`}>
                      {log.source.toUpperCase()}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <span className={`${getLevelColor(log.level)} flex-1 break-all`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>

          {/* Log Stats */}
          <div className="border-t border-slate-700 px-3 py-2 bg-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{filteredLogs.length} / {logs.length} logs</span>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-scroll</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
