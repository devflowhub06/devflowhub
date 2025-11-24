'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Eye, 
  Code2, 
  Plus,
  Bot,
  Loader2,
  Copy,
  Trash2,
  Save
} from 'lucide-react'
import dynamic from 'next/dynamic'
import AIAssistant from '@/components/workspace/AIAssistant'

// Dynamic import for Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => <div className="h-full bg-slate-800 flex items-center justify-center text-slate-400">Loading editor...</div>
})

interface GeneratedComponent {
  id: string
  name: string
  description: string
  code: string
  language: 'jsx' | 'tsx' | 'html' | 'css'
  category: 'ui' | 'form' | 'layout' | 'navigation' | 'data'
  createdAt: Date
  isActive?: boolean
}

interface V0WorkspaceProps {
  projectId: string
  onStatusChange: (status: { status: string; message: string; progress?: number }) => void
  onToolSwitch?: (tool: string) => void
}

export default function V0Workspace({ projectId, onStatusChange, onToolSwitch }: V0WorkspaceProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('generate')
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([])
  const [currentComponent, setCurrentComponent] = useState<GeneratedComponent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isInserting, setIsInserting] = useState(false)

  // Initialize with some sample components
  useEffect(() => {
    const sampleComponents: GeneratedComponent[] = [
      {
        id: '1',
        name: 'Modern Button',
        description: 'A sleek, modern button component with hover effects',
        code: `import React from 'react';

const ModernButton = ({ children, onClick, variant = 'primary' }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  return (
    <button
      className={\`\${baseClasses} \${variants[variant]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ModernButton;`,
        language: 'jsx',
        category: 'ui',
        createdAt: new Date(),
        isActive: true
      }
    ]
    
    setGeneratedComponents(sampleComponents)
    setCurrentComponent(sampleComponents[0])
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    onStatusChange({ status: 'building', message: 'Generating component with AI...' })
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newComponent: GeneratedComponent = {
        id: Date.now().toString(),
        name: `Generated Component ${generatedComponents.length + 1}`,
        description: `AI generated component based on: ${prompt}`,
        code: `// Generated component based on: ${prompt}
import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Generated Component</h2>
      <p className="text-gray-600">
        This component was generated based on your prompt: "${prompt}"
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Click me
      </button>
    </div>
  );
};

export default GeneratedComponent;`,
        language: 'jsx',
        category: 'ui',
        createdAt: new Date(),
        isActive: true
      }
      
      setGeneratedComponents(prev => [newComponent, ...prev])
      setCurrentComponent(newComponent)
      setActiveTab('preview')
      setPrompt('')
      
      onStatusChange({ status: 'success', message: 'Component generated successfully!' })
    } catch (error) {
      onStatusChange({ status: 'error', message: 'Failed to generate component' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAIAction = (action: any) => {
    console.log('AI Action received in V0:', action)
    
    if (action.type === 'generate_ui' && action.codeChanges && action.codeChanges.length > 0) {
      const newComponent: GeneratedComponent = {
        id: Date.now().toString(),
        name: `AI Generated Component ${generatedComponents.length + 1}`,
        description: action.result || 'AI generated component',
        code: action.codeChanges[0].content || '',
        language: 'jsx',
        category: 'ui',
        createdAt: new Date(),
        isActive: true
      }
      
      setGeneratedComponents(prev => [newComponent, ...prev])
      setCurrentComponent(newComponent)
      setActiveTab('preview')
      onStatusChange({ status: 'success', message: 'Component generated via AI Assistant!' })
    } else {
      onStatusChange({ status: 'info', message: action.result || 'AI action completed' })
    }
  }

  const handleCopyCode = () => {
    if (currentComponent) {
      navigator.clipboard.writeText(currentComponent.code)
      onStatusChange({ status: 'success', message: 'Code copied to clipboard!' })
    }
  }

  const handleInsertComponent = async () => {
    if (!currentComponent) return
    
    setIsInserting(true)
    onStatusChange({ status: 'building', message: 'Inserting component...' })
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onStatusChange({ status: 'success', message: 'Component inserted successfully!' })
    } catch (error) {
      onStatusChange({ status: 'error', message: 'Failed to insert component' })
    } finally {
      setIsInserting(false)
    }
  }

  const handleDeleteComponent = (id: string) => {
    setGeneratedComponents(prev => prev.filter(comp => comp.id !== id))
    if (currentComponent?.id === id) {
      const remaining = generatedComponents.filter(comp => comp.id !== id)
      setCurrentComponent(remaining[0] || null)
    }
    onStatusChange({ status: 'success', message: 'Component deleted successfully!' })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      ui: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      form: 'bg-green-500/20 text-green-400 border-green-500/30',
      layout: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      navigation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      data: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const filteredComponents = generatedComponents.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <Card className="bg-white/50 backdrop-blur border-0 shadow-sm flex-shrink-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">DevFlowHub UI Studio</CardTitle>
                <p className="text-gray-600">AI-powered UI component generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {generatedComponents.length} Components
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Component Library */}
        <div className="col-span-3">
          <Card className="bg-white/50 backdrop-blur border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Component Library</CardTitle>
                <Button
                  onClick={() => setActiveTab('generate')}
                  className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 h-full min-h-0 flex flex-col">
              {/* Search and Filter */}
              <div className="space-y-2 flex-shrink-0">
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  <option value="ui">UI Components</option>
                  <option value="form">Forms & Inputs</option>
                  <option value="layout">Layout</option>
                  <option value="navigation">Navigation</option>
                  <option value="data">Data Display</option>
                </select>
              </div>

              {/* Component List */}
              <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                {(filteredComponents || []).map((component) => (
                  <div
                    key={component.id}
                    onClick={() => {
                      setCurrentComponent(component)
                      setActiveTab('preview')
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentComponent?.id === component.id
                        ? 'bg-purple-100 border border-purple-300'
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {component.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {component.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={`text-xs ${getCategoryColor(component.category)}`}>
                            {component.category}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                            {component.language}
                          </Badge>
                        </div>
                      </div>
                      {component.isActive && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Code */}
        <div className="col-span-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>Generate</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center space-x-2">
                <Code2 className="w-4 h-4" />
                <span>Code</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="h-full">
              <Card className="bg-white/50 backdrop-blur border-0 shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <span>Generate New Component</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 h-full min-h-0 flex flex-col">
                  <div className="space-y-4 flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe your component
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Create a modern button with hover effects and multiple variants..."
                        className="w-full flex-1 min-h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Component
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="h-full">
              <Card className="bg-white/50 backdrop-blur border-0 shadow-sm h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Live Preview</span>
                    </CardTitle>
                    {currentComponent && (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={handleCopyCode}
                          className="bg-gray-600 hover:bg-gray-700 text-white h-8 px-3 text-sm"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          onClick={handleInsertComponent}
                          disabled={isInserting}
                          className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-sm"
                        >
                          {isInserting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Save className="w-4 h-4 mr-1" />
                          )}
                          {isInserting ? 'Inserting...' : 'Insert'}
                        </Button>
                        <Button
                          onClick={() => handleDeleteComponent(currentComponent.id)}
                          className="bg-red-600 hover:bg-red-700 text-white h-8 px-3 text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="h-full min-h-0 flex flex-col">
                  {currentComponent ? (
                    <div className="h-full space-y-4 flex-1 min-h-0 flex flex-col">
                      <div className="flex items-center justify-between flex-shrink-0">
                        <div>
                          <h3 className="text-lg font-semibold">{currentComponent.name}</h3>
                          <p className="text-sm text-gray-600">{currentComponent.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(currentComponent.category)}>
                            {currentComponent.category}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            {currentComponent.language}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 flex items-center justify-center min-h-0">
                        <div className="text-center text-gray-500">
                          <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Component preview will appear here</p>
                          <p className="text-sm">Switch to Code tab to see the generated code</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Select a component to preview</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="h-full">
              <Card className="bg-white/50 backdrop-blur border-0 shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Code2 className="w-5 h-5" />
                    <span>Source Code</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0 min-h-0">
                  {currentComponent ? (
                    <Editor
                      height="100%"
                      language={currentComponent.language}
                      value={currentComponent.code}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        readOnly: false
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Code2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Select a component to view its code</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Assistant */}
        <div className="col-span-3">
          <AIAssistant
            projectId={projectId}
            activeTool="ui-studio"
            projectContext={{
              files: [],
              language: 'javascript',
              dependencies: ['react', 'tailwindcss'],
              gitStatus: 'clean'
            }}
            onActionExecute={handleAIAction}
            onToolSwitch={onToolSwitch}
          />
        </div>
      </div>
    </div>
  )
}