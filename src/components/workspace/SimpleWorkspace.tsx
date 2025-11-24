'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code2, Terminal, Sparkles, Rocket, Play, Save, GitBranch, Settings } from 'lucide-react'

interface SimpleWorkspaceProps {
  projectId: string
  activeTool?: string
  onStatusChange?: (status: any) => void
  onToolSwitch?: (tool: string) => void
}

export default function SimpleWorkspace({ 
  projectId, 
  activeTool = 'CURSOR', 
  onStatusChange, 
  onToolSwitch 
}: SimpleWorkspaceProps) {
  
  const tools = [
    { id: 'CURSOR', name: 'DevFlowHub Editor', icon: Code2, color: 'bg-green-600' },
    { id: 'REPLIT', name: 'DevFlowHub Sandbox', icon: Terminal, color: 'bg-blue-600' },
    { id: 'V0', name: 'DevFlowHub UI Studio', icon: Sparkles, color: 'bg-purple-600' },
    { id: 'BOLT', name: 'DevFlowHub Deployer', icon: Rocket, color: 'bg-orange-600' }
  ]

  const currentTool = tools.find(t => t.id === activeTool) || tools[0]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${currentTool.color}`}>
              <currentTool.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">{currentTool.name}</h1>
              <p className="text-sm text-slate-400">Project ID: {projectId}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs">Ready</span>
            </div>
          </Badge>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-slate-400 hover:text-white">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="text-slate-400 hover:text-white">
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Tool Selector Sidebar */}
        <div className="w-64 bg-slate-800/30 border-r border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">DevFlowHub Workspaces</h3>
          <div className="space-y-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isActive = tool.id === activeTool
              return (
                <Button
                  key={tool.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? `${tool.color} text-white` 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  onClick={() => onToolSwitch?.(tool.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tool.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 p-6">
          <Card className="h-full bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentTool.icon className="h-5 w-5" />
                <span>{currentTool.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12">
                <div className={`w-16 h-16 ${currentTool.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <currentTool.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Welcome to {currentTool.name}</h3>
                <p className="text-slate-400 mb-6">
                  This is a placeholder for the {currentTool.name} workspace.
                </p>
                
                {activeTool === 'CURSOR' && (
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="text-sm text-slate-300">• AI-powered code editor</p>
                    <p className="text-sm text-slate-300">• Intelligent autocomplete</p>
                    <p className="text-sm text-slate-300">• Context-aware suggestions</p>
                  </div>
                )}
                
                {activeTool === 'REPLIT' && (
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="text-sm text-slate-300">• Cloud development environment</p>
                    <p className="text-sm text-slate-300">• Instant code execution</p>
                    <p className="text-sm text-slate-300">• Real-time collaboration</p>
                  </div>
                )}
                
                {activeTool === 'V0' && (
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="text-sm text-slate-300">• AI-generated UI components</p>
                    <p className="text-sm text-slate-300">• Design system integration</p>
                    <p className="text-sm text-slate-300">• Responsive layouts</p>
                  </div>
                )}
                
                {activeTool === 'BOLT' && (
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="text-sm text-slate-300">• One-click deployments</p>
                    <p className="text-sm text-slate-300">• CI/CD automation</p>
                    <p className="text-sm text-slate-300">• Performance monitoring</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
