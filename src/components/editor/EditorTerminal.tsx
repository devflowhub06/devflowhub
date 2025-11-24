'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Terminal as TerminalIcon, 
  Play, 
  Square, 
  Trash2, 
  Maximize2,
  Minimize2,
  Settings,
  Sparkles,
  Loader2,
  TestTube
} from 'lucide-react'
import { toast } from 'sonner'
import { clientTrackEvent } from '@/lib/client-analytics'

interface EditorTerminalProps {
  projectId: string
  onCommand?: (command: string) => void
  onOutput?: (output: string) => void
  onAISuggestCommand?: (codeContext: string) => Promise<string | null>
}

export function EditorTerminal({ projectId, onCommand, onOutput, onAISuggestCommand }: EditorTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<any>(null)
  const fitAddonRef = useRef<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [useSessionApi, setUseSessionApi] = useState(true)

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || typeof window === 'undefined') return

    const initTerminal = async () => {
      try {
        const { Terminal } = await import('@xterm/xterm')
        const { FitAddon } = await import('@xterm/addon-fit')
        const { WebLinksAddon } = await import('@xterm/addon-web-links')
        await import('@xterm/xterm/css/xterm.css')

        const terminal = new Terminal({
          theme: {
            background: '#0f172a',
            foreground: '#e2e8f0',
            cursor: '#f97316',
            black: '#1e293b',
            red: '#ef4444',
            green: '#22c55e',
            yellow: '#eab308',
            blue: '#3b82f6',
            magenta: '#a855f7',
            cyan: '#06b6d4',
            white: '#f1f5f9',
            brightBlack: '#475569',
            brightRed: '#f87171',
            brightGreen: '#4ade80',
            brightYellow: '#facc15',
            brightBlue: '#60a5fa',
            brightMagenta: '#c084fc',
            brightCyan: '#22d3ee',
            brightWhite: '#f8fafc'
          },
          fontSize: 14,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          cursorBlink: true,
          cursorStyle: 'block',
          scrollback: 1000,
          tabStopWidth: 4,
          convertEol: true,
          allowProposedApi: true
        })

        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()

        terminal.loadAddon(fitAddon)
        terminal.loadAddon(webLinksAddon)
        terminal.open(terminalRef.current!)
        fitAddon.fit()

        terminalInstanceRef.current = terminal
        fitAddonRef.current = fitAddon

        // Create terminal session
        const sessionCreated = await createSession()
        if (!sessionCreated) {
          setUseSessionApi(false)
          terminal.write('\x1b[33m[Streaming terminal unavailable in this environment. Switching to fallback execution mode.]\x1b[0m\r\n')
        }

        terminal.write('\x1b[32mWelcome to DevFlowHub Terminal\x1b[0m\r\n')
        terminal.write('\x1b[33mType commands or use AI suggestions (Ctrl+Space)\x1b[0m\r\n')
        terminal.write('$ ')

        let commandBuffer = ''

        terminal.onData(async (data) => {
          // Handle special keys
          if (data === '\r') {
            // Enter key
            const command = commandBuffer.trim()
            if (command) {
              setCommandHistory(prev => [command, ...prev.slice(0, 49)])
              terminal.write('\r\n')
              await executeCommand(command, terminal)
              commandBuffer = ''
            }
            terminal.write('$ ')
          } else if (data === '\x7f' || data === '\b') {
            // Backspace
            if (commandBuffer.length > 0) {
              commandBuffer = commandBuffer.slice(0, -1)
              terminal.write('\b \b')
            }
          } else if (data === '\x1b[A') {
            // Up arrow - history
            if (commandHistory.length > 0) {
              const prevCommand = commandHistory[0]
              commandBuffer = prevCommand
              terminal.write('\x1b[2K\r$ ' + prevCommand)
            }
          } else if (data === '\x1b[B') {
            // Down arrow
            commandBuffer = ''
            terminal.write('\x1b[2K\r$ ')
          } else if (data === '\x1b[C') {
            // Right arrow
            terminal.write(data)
          } else if (data === '\x1b[D') {
            // Left arrow
            terminal.write(data)
          } else if (data === '\x1b[20~') {
            // Ctrl+Space - AI suggestion
            if (onAISuggestCommand) {
              terminal.write('\r\n\x1b[33m[AI] Analyzing code context...\x1b[0m\r\n')
              const suggestion = await onAISuggestCommand('')
              if (suggestion) {
                commandBuffer = suggestion
                terminal.write(`$ ${suggestion}`)
              }
            }
          } else {
            // Regular character
            commandBuffer += data
            terminal.write(data)
          }
        })

        const handleResize = () => {
          fitAddon.fit()
        }

        // Listen for terminal commands from parent (Run button, etc.)
        const handleTerminalCommand = (event: CustomEvent) => {
          if (event.detail.projectId === projectId && event.detail.command) {
            const cmd = event.detail.command
            // Clear current buffer and write command
            terminal.write('\r\n')
            executeCommand(cmd, terminal)
          }
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('terminal-command', handleTerminalCommand as EventListener)
        setIsInitialized(true)

        return () => {
          window.removeEventListener('resize', handleResize)
          window.removeEventListener('terminal-command', handleTerminalCommand as EventListener)
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          terminal.dispose()
        }
      } catch (error) {
        console.error('Failed to initialize terminal:', error)
        toast.error('Failed to initialize terminal')
      }
    }

    initTerminal()
  }, [projectId])

  // Poll for terminal output updates and detect ports
  useEffect(() => {
    if (!useSessionApi || !sessionId || !isInitialized) return

    const pollOutput = async () => {
      try {
        const response = await fetch(`/api/terminal/session?projectId=${projectId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.output && data.output.length > terminalOutput.length && terminalInstanceRef.current) {
            const newOutput = data.output.slice(terminalOutput.length)
            const fullOutput = data.output.join('')
            
            // Write new output to terminal
            newOutput.forEach((line: string) => {
              terminalInstanceRef.current?.write(line)
            })
            setTerminalOutput(data.output)

            // Detect ports in output (localhost:3000, http://localhost:5173, etc.)
            const portPatterns = [
              /localhost:(\d+)/i,
              /:\/\/localhost:(\d+)/i,
              /http:\/\/localhost:(\d+)/i,
              /https:\/\/localhost:(\d+)/i,
              /running on port (\d+)/i,
              /listening on port (\d+)/i,
              /Server running at http:\/\/localhost:(\d+)/i,
              /Local:\s+http:\/\/localhost:(\d+)/i
            ]

            for (const pattern of portPatterns) {
              const match = fullOutput.match(pattern)
              if (match) {
                const detectedPort = parseInt(match[1])
                if (detectedPort && detectedPort > 0 && detectedPort < 65536) {
                  // Register preview session
                  try {
                    await fetch(`/api/projects/${projectId}/preview`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        port: detectedPort,
                        url: `http://localhost:${detectedPort}`
                      })
                    })
                    
                    // Notify parent component
                    if (terminalInstanceRef.current) {
                      terminalInstanceRef.current.write(
                        `\r\n\x1b[32m[Preview] Project detected on port ${detectedPort}. Open Preview tab to view.\x1b[0m\r\n`
                      )
                    }
                    
                    // Trigger custom event for preview ready
                    window.dispatchEvent(new CustomEvent('preview-ready', {
                      detail: { projectId, port: detectedPort }
                    }))
                  } catch (error) {
                    console.error('Failed to register preview:', error)
                  }
                  break // Only register once
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    pollingIntervalRef.current = setInterval(pollOutput, 500) // Poll every 500ms

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [sessionId, isInitialized, projectId, terminalOutput.length])

  const createSession = async () => {
    if (!useSessionApi) return null
    try {
      const response = await fetch('/api/terminal/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action: 'create' })
      })

      if (response.ok) {
        const data = await response.json()
        setSessionId(data.sessionId)
        return data.sessionId
      }
      if (response.status === 404 || response.status === 501) {
        setUseSessionApi(false)
      }
    } catch (error) {
      console.error('Failed to create terminal session:', error)
      setUseSessionApi(false)
    }
    return null
  }

  const executeCommand = async (command: string, terminal: any) => {
    if (useSessionApi) {
      if (!sessionId) {
        const newSession = await createSession()
        if (!newSession) {
          return executeFallbackCommand(command, terminal)
        }
      }
    } else {
      return executeFallbackCommand(command, terminal)
    }

    setIsRunning(true)
    onCommand?.(command)

    terminal.write(`\x1b[36m[Executing: ${command}]\x1b[0m\r\n`)
    clientTrackEvent('terminal_command_run', { projectId, command })

    try {
      const response = await fetch('/api/terminal/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId, 
          action: 'execute', 
          command 
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.stream) {
          // Long-running command - output will come via polling
          terminal.write(`\x1b[33m[Process running in background, PID: ${data.pid}]\x1b[0m\r\n`)
          terminal.write(`\x1b[90m[Output will stream here...]\x1b[0m\r\n`)
        } else {
          // Quick command - immediate output
          if (data.output) {
            terminal.write(data.output)
            onOutput?.(data.output)
          }
          if (data.error) {
            terminal.write(`\x1b[31mError: ${data.error}\x1b[0m\r\n`)
          }
        }
      } else {
        if (response.status === 404 || response.status === 500) {
          setUseSessionApi(false)
          terminal.write('\x1b[33m[Streaming terminal not available. Falling back to single-shot execution.]\x1b[0m\r\n')
          return executeFallbackCommand(command, terminal)
        } else {
          const error = await response.json()
          terminal.write(`\x1b[31mError: ${error.error || 'Command failed'}\x1b[0m\r\n`)
        }
      }
    } catch (error) {
      terminal.write(`\x1b[31mError executing command\x1b[0m\r\n`)
      console.error('Command execution error:', error)
    } finally {
  const executeFallbackCommand = async (command: string, terminal: any) => {
    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, command })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        terminal.write(`\x1b[31mError: ${error.error || 'Command failed'}\x1b[0m\r\n`)
        return
      }

      const data = await response.json()
      if (data.output) {
        terminal.write(`${data.output}\r\n`)
        onOutput?.(data.output)
      }
      if (data.error) {
        terminal.write(`\x1b[31m${data.error}\x1b[0m\r\n`)
      }
    } catch (error) {
      console.error('Fallback command error:', error)
      terminal.write('\x1b[31mFallback execution failed\x1b[0m\r\n')
    } finally {
      setIsRunning(false)
      terminal.write('$ ')
    }
  }

      setIsRunning(false)
    }
  }

  const killProcess = async () => {
    if (!sessionId) return

    try {
      await fetch('/api/terminal/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action: 'kill' })
      })
      
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\n\x1b[31m[Process killed]\x1b[0m\r\n$ ')
      }
      setIsRunning(false)
      toast.success('Process stopped')
    } catch (error) {
      console.error('Failed to kill process:', error)
    }
  }

  const runQuickCommand = async (command: string) => {
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.write(command + '\r')
      await executeCommand(command, terminalInstanceRef.current)
    }
  }

  const requestAISuggestion = async () => {
    if (!onAISuggestCommand) return

    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.write('\r\n\x1b[33m[AI] Analyzing code context...\x1b[0m\r\n')
    }

    try {
      const suggestion = await onAISuggestCommand('')
      if (suggestion && terminalInstanceRef.current) {
        terminalInstanceRef.current.write(`$ ${suggestion}`)
        setCurrentCommand(suggestion)
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\n\x1b[31m[AI] Failed to generate suggestion\x1b[0m\r\n$ ')
      }
    }
  }

  const toggleMaximize = () => {
    setIsMaximized(prev => {
      const newState = !prev
      setTimeout(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit()
        }
      }, 100)
      return newState
    })
  }

  const clearTerminal = () => {
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.clear()
      terminalInstanceRef.current.write('$ ')
    }
    setTerminalOutput([])
  }

  return (
    <div className={`h-full flex flex-col bg-slate-900 ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-slate-200">Terminal</span>
          <Badge variant="outline" className={`text-xs border-${isRunning ? 'orange' : 'green'}-500 text-${isRunning ? 'orange' : 'green'}-400`}>
            {isRunning ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Running
              </>
            ) : 'Ready'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          {onAISuggestCommand && (
            <Button
              size="sm"
              variant="ghost"
              onClick={requestAISuggestion}
              className="h-6 w-6 p-0"
              title="AI Command Suggestion (Ctrl+Space)"
            >
              <Sparkles className="h-3 w-3 text-accent-warn" />
            </Button>
          )}
          {isRunning && (
            <Button
              size="sm"
              variant="ghost"
              onClick={killProcess}
              className="h-6 w-6 p-0"
              title="Stop Process"
            >
              <Square className="h-3 w-3 text-red-400" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMaximize}
            className="h-6 w-6 p-0"
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearTerminal}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => runQuickCommand('npm run dev')}
            className="text-xs h-6"
            disabled={isRunning}
          >
            <Play className="h-3 w-3 mr-1" />
            npm run dev
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runQuickCommand('git status')}
            className="text-xs h-6"
            disabled={isRunning}
          >
            git status
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runQuickCommand('git add .')}
            className="text-xs h-6"
            disabled={isRunning}
          >
            git add .
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch(`/api/projects/${projectId}/tests/run`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ testCommand: 'npm test' })
                })
                if (response.ok) {
                  const data = await response.json()
                  runQuickCommand(data.command)
                  toast.success('Running tests...')
                  clientTrackEvent('tests_run_clicked', { projectId })
                } else {
                  toast.error('Failed to run tests')
                }
              } catch (error) {
                console.error('Error running tests:', error)
                toast.error('Failed to run tests')
              }
            }}
            className="text-xs h-6 bg-accent-warn/20 hover:bg-accent-warn/30 border-accent-warn/50"
            disabled={isRunning}
          >
            <TestTube className="h-3 w-3 mr-1" />
            Run Tests
          </Button>
          {onAISuggestCommand && (
            <Button
              size="sm"
              variant="outline"
              onClick={requestAISuggestion}
              className="text-xs h-6 border-accent-warn/50 text-accent-warn hover:bg-accent-warn/10"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI Suggest
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-hidden">
        <div 
          ref={terminalRef} 
          className="h-full w-full"
          style={{ minHeight: '300px' }}
        />
      </div>
    </div>
  )
}
