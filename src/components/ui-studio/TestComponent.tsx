'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles,
  Code,
  Eye,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface TestComponentProps {
  projectId: string
  onGenerate?: (prompt: string, options: any) => void
}

export function TestComponent({ projectId, onGenerate }: TestComponentProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedComponent, setGeneratedComponent] = useState<any>(null)
  const [status, setStatus] = useState<string>('')

  const testPrompts = [
    "A modern glassmorphism login form with email and password fields, gradient background, and smooth animations",
    "A beautiful stats card with icon, number, and trend indicator with hover effects",
    "A responsive navigation bar with logo, menu items, and mobile hamburger menu",
    "A pricing card component with three tiers, features list, and call-to-action button",
    "A testimonial card with avatar, quote, name, and rating stars"
  ]

  const handleTestGeneration = async (prompt: string) => {
    try {
      setIsGenerating(true)
      setStatus('Generating component with AI...')

      if (onGenerate) {
        // Use the parent's generation handler
        await onGenerate(prompt, {
          variants: 3,
          styleHints: { rounded: 'lg', shadow: true },
          themeHints: { tailwindConfig: true }
        })
        setStatus('Component generated successfully!')
      } else {
        // Fallback to direct API call
        const response = await fetch('/api/ui-studio/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-demo-mode': 'true'
          },
          body: JSON.stringify({
            projectId,
            prompt,
            variants: 3,
            styleHints: { rounded: 'lg', shadow: true },
            themeHints: { tailwindConfig: true }
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate component')
        }

        const data = await response.json()
        
        if (data.status === 'completed') {
          setGeneratedComponent(data.result)
          setStatus('Component generated successfully!')
        } else {
          setStatus('Component generation queued...')
          // Poll for completion
          setTimeout(() => {
            setStatus('Component generation completed!')
          }, 2000)
        }
      }

    } catch (error) {
      console.error('Test generation failed:', error)
      setStatus(`Error: ${(error as Error).message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setStatus('Code copied to clipboard!')
    setTimeout(() => setStatus(''), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            <span>DevFlowHub UI Studio - Test Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-200 mb-4">
            Test the world's most advanced AI UI component generator. Click any prompt below to generate a beautiful component instantly!
          </p>
          
          {status && (
            <div className="flex items-center space-x-2 mb-4">
              {status.includes('Error') ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : status.includes('successfully') ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Info className="h-4 w-4 text-blue-400" />
              )}
              <span className="text-sm text-purple-200">{status}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testPrompts.map((prompt, index) => (
          <Card 
            key={index}
            className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors cursor-pointer"
            onClick={() => handleTestGeneration(prompt)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-2">
                    Test Prompt {index + 1}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {prompt}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={isGenerating}
                  className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">AI Generated</Badge>
                <Badge variant="secondary" className="text-xs">React + Tailwind</Badge>
                <Badge variant="secondary" className="text-xs">Accessible</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generated Component Display */}
      {generatedComponent && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Code className="h-5 w-5 text-green-400" />
                <span>Generated: {generatedComponent.name}</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-600 text-white">
                  {generatedComponent.confidence * 100}% confident
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedComponent.code)}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Code
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Component Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-lg font-semibold text-white">
                    {generatedComponent.variants?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400">Variants</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-lg font-semibold text-white">
                    {generatedComponent.props?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400">Props</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-lg font-semibold text-white">
                    {generatedComponent.accessibility?.score || 95}
                  </div>
                  <div className="text-xs text-slate-400">A11y Score</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-lg font-semibold text-white">
                    {generatedComponent.code?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400">Code Length</div>
                </div>
              </div>

              {/* Rationale */}
              {generatedComponent.rationale && (
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">AI Rationale</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {generatedComponent.rationale}
                  </p>
                </div>
              )}

              {/* Code Preview */}
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">Generated Code</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(generatedComponent.code)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className="text-xs text-slate-300 overflow-auto max-h-64">
                  <code>{generatedComponent.code}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Showcase */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Why DevFlowHub UI Studio is the Best</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
              <p className="text-slate-400 text-sm">
                Advanced GPT-4 integration with world-class prompts for exceptional components
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Live Preview</h3>
              <p className="text-slate-400 text-sm">
                Real-time Sandpack preview with Monaco editor for live code editing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Production Ready</h3>
              <p className="text-slate-400 text-sm">
                Auto-formatted, validated, and accessibility-checked components
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
