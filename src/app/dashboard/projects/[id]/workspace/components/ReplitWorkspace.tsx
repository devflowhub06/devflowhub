'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code2, 
  Play, 
  Save, 
  Terminal, 
  Plus, 
  FileText, 
  FolderOpen,
  Bot,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Settings,
  Sparkles,
  Download,
  Upload
} from 'lucide-react'
import AIAssistant from '@/components/workspace/AIAssistant'
import { SyncButton } from '@/components/workspace/SyncButton'
// Note: Monaco Editor removed to fix runtime error
// Using textarea instead for now

interface File {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  isActive?: boolean
}

interface ReplitStatus {
  isConnected: boolean
  replUrl?: string
  isRunning: boolean
  lastRun?: Date
  output: string[]
}

interface ReplitWorkspaceProps {
  projectId: string
  onStatusChange: (status: { status: string; message: string; progress?: number }) => void
  onToolSwitch?: (tool: string) => void
}

export default function ReplitWorkspace({ projectId, onStatusChange, onToolSwitch }: ReplitWorkspaceProps) {
  const [files, setFiles] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [activeTab, setActiveTab] = useState('editor')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [terminalInput, setTerminalInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [replitStatus, setReplitStatus] = useState<ReplitStatus>({
    isConnected: false,
    isRunning: false,
    output: []
  })
  
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize default project structure
    const defaultFiles: File[] = [
      {
        id: '1',
        name: 'src',
        path: 'src',
        type: 'folder'
      },
      {
        id: '2',
        name: 'index.js',
        path: 'index.js',
        type: 'file',
        content: `// DevFlowHub Sandbox Workspace
console.log('🚀 Welcome to DevFlowHub Sandbox!');

// Your main application code here
function main() {
  console.log('Application started successfully!');
  return 'Hello from DevFlowHub!';
}

// Export for module usage
module.exports = { main };

// Run if this is the main module
if (require.main === module) {
  main();
}`,
        language: 'javascript',
        isActive: true
      },
      {
        id: '3',
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        content: `{
  "name": "devflowhub-replit",
  "version": "1.0.0",
  "description": "DevFlowHub Replit Workspace",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": ["devflowhub", "replit", "ai"],
  "author": "DevFlowHub",
  "license": "MIT"
}`,
        language: 'json'
      }
    ]
    
    setFiles(defaultFiles)
    setCurrentFile(defaultFiles[1]) // Set index.js as active
    setFileContent(defaultFiles[1].content || '')
    
    // Simulate Replit connection
    setTimeout(() => {
      setReplitStatus(prev => ({
        ...prev,
        isConnected: true,
        replUrl: 'https://replit.com/@devflowhub/workspace'
      }))
      onStatusChange({ status: 'idle', message: 'Sandbox connected' })
    }, 1000)
  }, [onStatusChange])

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file.type === 'file') {
      setCurrentFile(file)
      setFileContent(file.content || '')
      setFiles(prev => (prev || []).map(f => ({ ...f, isActive: f.id === file.id })))
    }
  }

  // Handle save file
  const handleSaveFile = async () => {
    if (!currentFile) return
    
    setIsSaving(true)
    onStatusChange({ status: 'saving', message: 'Saving file...' })
    
    try {
      // Simulate API call to save file
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setFiles(prev => (prev || []).map(f => 
        f.id === currentFile.id 
          ? { ...f, content: fileContent }
          : f
      ))
      
      onStatusChange({ status: 'idle', message: 'File saved successfully' })
    } catch (error) {
      onStatusChange({ status: 'error', message: 'Failed to save file' })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle run code
  const handleRunCode = async () => {
    setIsRunning(true)
    onStatusChange({ status: 'running', message: 'Running code...' })
    
    try {
      // Simulate running code
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add output to terminal
      const newOutput = [
        `$ node index.js`,
        `🚀 Welcome to DevFlowHub Sandbox!`,
        `Application started successfully!`,
        `Hello from DevFlowHub!`,
        `$`
      ]
      
      setTerminalOutput(prev => [...prev, ...newOutput])
      setReplitStatus(prev => ({ ...prev, isRunning: false, lastRun: new Date() }))
      
      onStatusChange({ status: 'idle', message: 'Code executed successfully' })
    } catch (error) {
      onStatusChange({ status: 'error', message: 'Failed to run code' })
    } finally {
      setIsRunning(false)
    }
  }

  // Handle terminal command
  const handleTerminalCommand = async (command: string) => {
    if (!command.trim()) return
    
    setTerminalInput('')
    const newOutput = [`$ ${command}`]
    
    try {
      // Simulate command execution
      if (command === 'ls') {
        newOutput.push('index.js', 'package.json', 'src/')
      } else if (command === 'npm start') {
        newOutput.push('Starting application...')
        await handleRunCode()
      } else if (command === 'clear') {
        setTerminalOutput([])
        return
      } else {
        newOutput.push(`Command '${command}' not found`)
      }
    } catch (error) {
      newOutput.push(`Error: ${error}`)
    }
    
    setTerminalOutput(prev => [...prev, ...newOutput])
  }

  // Handle AI generation
  const handleAIGeneration = async () => {
    if (!aiPrompt.trim()) return
    
    setIsAiGenerating(true)
    onStatusChange({ status: 'building', message: 'Generating code with AI...' })
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const generatedCode = `// AI Generated Code: ${aiPrompt}
function aiGeneratedFunction() {
  console.log('This code was generated by AI based on: ${aiPrompt}');
  return 'AI Generated Result';
}

module.exports = { aiGeneratedFunction };`
      
      // Create new file with generated code
      const newFile: File = {
        id: Date.now().toString(),
        name: 'ai-generated.js',
        path: 'ai-generated.js',
        type: 'file',
        content: generatedCode,
        language: 'javascript'
      }
      
      setFiles(prev => [...prev, newFile])
      setCurrentFile(newFile)
      setFileContent(generatedCode)
      setAiPrompt('')
      
      onStatusChange({ status: 'idle', message: 'AI code generation completed' })
    } catch (error) {
      onStatusChange({ status: 'error', message: 'AI generation failed' })
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleAIAction = (action: any) => {
    console.log('AI Action received in Replit:', action)
    
    // Handle code changes - create new files from codeChanges
    if (action.codeChanges && action.codeChanges.length > 0) {
      const codeChange = action.codeChanges[0]
      const newFile: File = {
        id: Date.now().toString(),
        name: codeChange.file.split('/').pop() || 'ai-generated.js',
        path: codeChange.file,
        type: 'file',
        content: codeChange.content || '',
        language: 'javascript'
      }
      
      setFiles(prev => [newFile, ...prev])
      setCurrentFile(newFile)
      setFileContent(codeChange.content || '')
      onStatusChange({ status: 'success', message: `File created: ${newFile.name}` })
    } else if (action.type === 'create_file' && action.fileOperations && action.fileOperations.length > 0) {
      const fileOp = action.fileOperations[0]
      const newFile: File = {
        id: Date.now().toString(),
        name: fileOp.path.split('/').pop() || 'ai-generated.js',
        path: fileOp.path,
        type: 'file',
        content: fileOp.content || '',
        language: 'javascript'
      }
      
      setFiles(prev => [newFile, ...prev])
      setCurrentFile(newFile)
      setFileContent(fileOp.content || '')
      onStatusChange({ status: 'success', message: `File created: ${newFile.name}` })
    } else if (action.type === 'edit_file' && action.fileOperations && action.fileOperations.length > 0) {
      const fileOp = action.fileOperations[0]
      setFiles(prev => (prev || []).map(f => 
        f.path === fileOp.path 
          ? { ...f, content: fileOp.content || f.content }
          : f
      ))
      if (currentFile?.path === fileOp.path) {
        setFileContent(fileOp.content || '')
      }
      onStatusChange({ status: 'success', message: `File updated: ${fileOp.path}` })
    } else if (action.type === 'run_command') {
      onStatusChange({ status: 'info', message: `AI executed: ${action.description}` })
    } else {
      onStatusChange({ status: 'info', message: action.result || 'AI action completed' })
    }
  }

  // Get language from filename
  const getLanguageFromFileName = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js': return 'javascript'
      case 'ts': return 'typescript'
      case 'jsx': return 'javascript'
      case 'tsx': return 'typescript'
      case 'py': return 'python'
      case 'java': return 'java'
      case 'cpp': return 'cpp'
      case 'c': return 'c'
      case 'html': return 'html'
      case 'css': return 'css'
      case 'json': return 'json'
      default: return 'javascript'
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">DevFlowHub Sandbox</h2>
          <p className="text-slate-400">Create and run your code in the cloud</p>
        </div>
        <div className="flex items-center space-x-3">
          <SyncButton projectId={projectId} />
          <Badge className={`px-3 py-1 ${
            replitStatus.isConnected 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {replitStatus.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {replitStatus.replUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(replitStatus.replUrl, '_blank')}
              className="text-slate-400 hover:text-white border-slate-600 hover:border-slate-500"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Sandbox Provider
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {/* File Explorer */}
        <div className="col-span-1">
          <Card className="h-full bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Files</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    const newFile: File = {
                      id: Date.now().toString(),
                      name: 'new-file.js',
                      path: 'new-file.js',
                      type: 'file',
                      content: '// New file\nconsole.log("Hello World!");',
                      language: 'javascript'
                    }
                    setFiles(prev => [...prev, newFile])
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-8 px-2"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 px-3 pb-3">
                {(files || []).map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      file.isActive 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {file.type === 'folder' ? (
                      <FolderOpen className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span className="text-sm">{file.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor/Terminal Area */}
        <div className="col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
              <TabsTrigger value="editor" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-blue-600">
                <Code2 className="w-4 h-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="terminal" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-green-600">
                <Terminal className="w-4 h-4 mr-2" />
                Terminal
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-purple-600">
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="h-full mt-4">
              <Card className="h-full bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {currentFile?.name || 'No file selected'}
                      </CardTitle>
                      <p className="text-sm text-slate-400">
                        {currentFile?.path}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleSaveFile}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-9 px-4"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="bg-green-600 hover:bg-green-700 text-white border-0 h-9 px-4"
                      >
                        {isRunning ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Run
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-full p-0">
                  {currentFile ? (
                    <div className="h-full min-h-[520px]">
                      <textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="w-full h-full bg-slate-900 text-white p-4 font-mono text-sm resize-none border-0 focus:ring-0 focus:outline-none"
                        placeholder="Start coding here..."
                      />
                    </div>
                  ) : (
                    <div className="h-full min-h-[520px] bg-slate-800 flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Select a file to start editing</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terminal" className="h-full mt-4">
              <Card className="h-full bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">Terminal</CardTitle>
                  <p className="text-sm text-slate-400">Run commands and see output</p>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <div className="h-full min-h-[520px] flex flex-col">
                    {/* Terminal Output */}
                    <div className="flex-1 bg-slate-900 p-4 font-mono text-sm overflow-auto">
                      <div ref={terminalRef} className="space-y-1">
                        {(terminalOutput || []).map((line, index) => (
                          <div key={index} className="text-slate-300">
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Terminal Input */}
                    <div className="p-4 border-t border-slate-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 font-mono">$</span>
                        <Input
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleTerminalCommand(terminalInput)
                            }
                          }}
                          placeholder="Enter command..."
                          className="flex-1 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                        />
                        <Button
                          onClick={() => handleTerminalCommand(terminalInput)}
                          className="bg-green-600 hover:bg-green-700 text-white border-0 h-9 px-4"
                        >
                          Run
                        </Button>
                        <Button
                          onClick={() => setTerminalOutput([])}
                          variant="outline"
                          size="sm"
                          className="text-slate-400 hover:text-white border-slate-600 hover:border-slate-500 h-9 px-3"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="h-full mt-4">
              <AIAssistant
                projectId={projectId}
                activeTool="sandbox"
                projectContext={{
                  files: (files || []).map(f => ({
                    id: f.id,
                    name: f.name,
                    path: f.path,
                    type: f.type,
                    content: f.content,
                    lastModified: new Date()
                  })),
                  language: 'javascript',
                  dependencies: ['react', 'next', 'tailwindcss'],
                  gitStatus: 'clean'
                }}
                onActionExecute={handleAIAction}
                onToolSwitch={onToolSwitch}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
