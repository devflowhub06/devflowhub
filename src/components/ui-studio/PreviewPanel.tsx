'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonacoCodeEditor } from './MonacoCodeEditor'
import { 
  Eye,
  Code,
  Download,
  ExternalLink,
  Copy,
  Play,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Palette
} from 'lucide-react'
import SandpackPreviewComponent from './SandpackPreview'
import { InsertComponentModal } from './InsertComponentModal'

interface PreviewPanelProps {
  component: any
  projectId: string
  onInsert: (componentData: any, targetPath: string) => void
}

export function PreviewPanel({ component, projectId, onInsert }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'props' | 'tests'>('preview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [showInsertDialog, setShowInsertDialog] = useState(false)

  const handleInsert = async (insertData: any) => {
    try {
      // Use edited code if available, otherwise use original
      const componentToInsert = editedCode ? { ...component, code: editedCode } : component
      await onInsert(componentToInsert, insertData.targetPath)
      setShowInsertDialog(false)
    } catch (error) {
      console.error('Insert failed:', error)
      throw error // Re-throw to let modal handle it
    }
  }

  const handleCodeSave = (newCode: string) => {
    setEditedCode(newCode)
    setIsEditing(false)
    // Update the component with new code for preview
    if (component) {
      component.code = newCode
    }
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedCode(component?.code || '')
    }
    setIsEditing(!isEditing)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Add toast notification
  }

  return (
    <div className="h-full flex flex-col">
      {/* Component Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">{component.name}</h2>
              <Badge className="bg-green-500 text-white text-xs">
                {Math.round(component.confidence * 100)}% confident
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(component.code)}
              className="flex items-center space-x-1"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Code</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowInsertDialog(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-1"
            >
              <Download className="h-3 w-3" />
              <span>Insert to Project</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
            <div className="bg-slate-800 px-4 py-2">
              <TabsList className="bg-slate-700">
                <TabsTrigger value="preview" className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center space-x-1">
                  <Code className="h-3 w-3" />
                  <span>Code</span>
                </TabsTrigger>
                <TabsTrigger value="props" className="flex items-center space-x-1">
                  <Settings className="h-3 w-3" />
                  <span>Props</span>
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Tests</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="preview" className="h-full m-0">
                <div className="h-full flex flex-col">
                  {/* Variant Selector */}
                  <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-300">Variants:</span>
                      {(Array.isArray(component.variants) ? component.variants : []).map((variant: any, index: number) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={selectedVariant === index ? "default" : "outline"}
                          onClick={() => setSelectedVariant(index)}
                          className="text-xs"
                        >
                          {variant.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview with Sandpack */}
                  <div className="flex-1">
                    <SandpackPreviewComponent 
                      component={component}
                      showCode={false}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="h-full m-0">
                <div className="h-full">
                  <MonacoCodeEditor
                    code={component?.code || '// No component code available'}
                    language="typescript"
                    readOnly={!isEditing}
                    onChange={setEditedCode}
                    onSave={handleCodeSave}
                    className="h-full"
                  />
                  
                  {!isEditing && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={handleEditToggle}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Edit Code
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="props" className="h-full m-0">
                <div className="p-4 space-y-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Component Props</h3>
                    <div className="space-y-3">
                      {(Array.isArray(component.props) ? component.props : []).map((prop: any, index: number) => (
                        <div key={index} className="border-b border-slate-700 pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <code className="text-purple-400 text-sm">{prop.name}</code>
                              <Badge variant="outline" className="text-xs">
                                {prop.type}
                              </Badge>
                              {prop.required && (
                                <Badge variant="destructive" className="text-xs">
                                  required
                                </Badge>
                              )}
                            </div>
                            {prop.default && (
                              <code className="text-green-400 text-xs">
                                default: {JSON.stringify(prop.default)}
                              </code>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{prop.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Score */}
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Accessibility</span>
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-2xl font-bold text-green-400">
                        {component.accessibility?.score || 95}
                      </div>
                      <div className="text-slate-400 text-sm">/ 100</div>
                    </div>
                    {(Array.isArray(component.accessibility?.issues) ? component.accessibility.issues : []).map((issue: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2 mt-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5" />
                        <div className="text-xs">
                          <div className="text-slate-300">{issue.description}</div>
                          <div className="text-slate-400">{issue.suggestion}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tests" className="h-full m-0">
                <div className="h-full bg-slate-900 p-4 space-y-4">
                  {/* Storybook Story */}
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2 text-sm">Storybook Story</h3>
                    <div className="bg-slate-900 rounded p-3 overflow-auto max-h-48">
                      <pre className="text-xs text-slate-300">
                        <code>{component.story}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Jest Test */}
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2 text-sm">Jest Test</h3>
                    <div className="bg-slate-900 rounded p-3 overflow-auto max-h-48">
                      <pre className="text-xs text-slate-300">
                        <code>{component.test}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Component Info Footer */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>TypeScript + Tailwind</span>
            <span>Accessible</span>
            <span>shadcn/ui compatible</span>
          </div>
          
          <div className="text-slate-500">
            {component.rationale}
          </div>
        </div>
      </div>

      {/* Insert Component Modal */}
      <InsertComponentModal
        isOpen={showInsertDialog}
        onClose={() => setShowInsertDialog(false)}
        component={component}
        projectId={projectId}
        onInsert={handleInsert}
      />
    </div>
  )
}
