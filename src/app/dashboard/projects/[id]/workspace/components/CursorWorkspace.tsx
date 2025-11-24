'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FileText, Terminal, GitBranch, Code, Play, Save, FolderOpen } from 'lucide-react'
import AIAssistant from '@/components/workspace/AIAssistant'
import { brandLabelFromAny } from '@/lib/tools/tool-mapping'

interface CursorWorkspaceProps {
  projectId: string
  onToolSwitch: (tool: string) => void
}

export default function CursorWorkspace({ projectId, onToolSwitch }: CursorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('editor')
  const [files, setFiles] = useState([
    { name: 'index.js', content: 'console.log("Hello World!");', type: 'javascript' },
    { name: 'package.json', content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}', type: 'json' },
    { name: 'README.md', content: '# My Project\n\nThis is a sample project.', type: 'markdown' }
  ])
  const [selectedFile, setSelectedFile] = useState(files[0])
  const [code, setCode] = useState(selectedFile.content)
  const [terminalOutput, setTerminalOutput] = useState('$ Ready to run commands...\n')
  const [gitStatus, setGitStatus] = useState({ status: 'clean', branch: 'main' })

  useEffect(() => {
    setCode(selectedFile.content)
  }, [selectedFile])

  const handleFileSelect = (file: any) => {
    setSelectedFile(file)
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    setFiles(prev => (prev || []).map(f => f.name === selectedFile.name ? { ...f, content: newCode } : f))
  }

  const handleSave = () => {
    // Simulate save
    console.log('Saving file:', selectedFile.name)
  }

  const handleRun = () => {
    setTerminalOutput(prev => prev + `$ Running ${selectedFile.name}...\n`)
    setTerminalOutput(prev => prev + `Output: Hello World!\n`)
  }

  const handleAIAction = useCallback(async (action: any) => {
    console.log('AI Action in Cursor:', action)
    
    if (action.codeChanges) {
      action.codeChanges.forEach((change: any) => {
        if (change.operation === 'create' || change.operation === 'edit') {
          const newFile = {
            name: change.file,
            content: change.content,
            type: change.file.split('.').pop() || 'text'
          }
          setFiles(prev => [...prev.filter(f => f.name !== change.file), newFile])
          if (change.file === selectedFile.name) {
            setCode(change.content)
          }
        }
      })
    }
  }, [selectedFile.name])

    return (
    <div className="h-full flex flex-col space-y-2 sm:space-y-4 p-fluid-2 sm:p-fluid-4">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-fluid-lg sm:text-fluid-xl font-semibold truncate">DevFlowHub Editor</h2>
          <p className="text-fluid-sm text-gray-500">Code editing and file management</p>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <Badge variant="outline" className="flex items-center space-x-1 text-fluid-xs">
            <GitBranch className="w-3 h-3" />
            <span className="hidden sm:inline">{gitStatus.branch}</span>
            <span className="sm:hidden">{gitStatus.branch.slice(0, 8)}</span>
          </Badge>
          <Badge variant={gitStatus.status === 'clean' ? 'default' : 'destructive'} className="text-fluid-xs">
            {gitStatus.status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 min-h-0">
        {/* File Explorer - Responsive */}
        <Card className="w-full lg:w-64 flex-shrink-0 lg:flex-shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-fluid-sm flex items-center space-x-2">
              <FolderOpen className="w-4 h-4" />
              <span>Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1 max-h-40 lg:max-h-none overflow-y-auto">
              {(files || []).map((file) => (
                <div
                  key={file.name}
                  className={`p-2 rounded cursor-pointer text-fluid-sm touch-target ${
                    selectedFile.name === file.name
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Responsive */}
        <div className="flex-1 flex flex-col space-y-2 sm:space-y-4 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 touch-target">
              <TabsTrigger value="editor" className="text-fluid-xs sm:text-fluid-sm touch-target">
                <span className="hidden sm:inline">Editor</span>
                <span className="sm:hidden">Code</span>
              </TabsTrigger>
              <TabsTrigger value="terminal" className="text-fluid-xs sm:text-fluid-sm touch-target">
                <span className="hidden sm:inline">Terminal</span>
                <span className="sm:hidden">Term</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-fluid-xs sm:text-fluid-sm touch-target">
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <CardTitle className="text-fluid-sm truncate min-w-0 flex-1">{selectedFile.name}</CardTitle>
                    <div className="flex space-x-1 sm:space-x-2 w-full sm:w-auto">
                      <Button size="sm" variant="outline" onClick={handleSave} className="flex-1 sm:flex-none touch-target">
                        <Save className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Save</span>
                        <span className="sm:hidden">S</span>
                      </Button>
                      <Button size="sm" onClick={handleRun} className="flex-1 sm:flex-none touch-target">
                        <Play className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Run</span>
                        <span className="sm:hidden">R</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 min-h-0">
                  <div className="h-full border rounded">
                    <textarea
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="w-full h-full p-fluid-2 sm:p-fluid-4 font-mono text-fluid-sm resize-none border-0 focus:outline-none"
                      placeholder="Start coding..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-fluid-sm flex items-center space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span>Terminal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 min-h-0">
                  <div className="h-full bg-black text-green-400 p-fluid-2 sm:p-fluid-4 font-mono text-fluid-sm overflow-auto">
                    <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 flex flex-col min-h-0">
              <AIAssistant
                projectId={projectId}
                activeTool="editor"
                projectContext={{
                  files: (files || []).map(f => ({
                    id: f.name,
                    name: f.name,
                    path: f.name,
                    type: 'file' as const,
                    content: f.content,
                    lastModified: new Date()
                  })),
                  lastEdited: new Date(),
                  language: 'javascript',
                  dependencies: ['react', 'next'],
                  gitStatus: 'clean' as const
                }}
                onActionExecute={(action) => {
                  console.log('AI Action executed:', action)
                  // Handle AI actions here
                }}
                onToolSwitch={onToolSwitch}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

