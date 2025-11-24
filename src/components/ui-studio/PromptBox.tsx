'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Wand2,
  Sparkles,
  Palette,
  Code,
  Zap,
  DollarSign,
  Settings
} from 'lucide-react'

interface PromptBoxProps {
  onGenerate: (prompt: string, options: any) => void
  isGenerating: boolean
}

const EXAMPLE_PROMPTS = [
  "Primary login button with Google sign-in icon, gradient background, rounded corners",
  "Modern card component with image, title, description, and action buttons",
  "Navigation header with logo, menu items, and user profile dropdown",
  "Form input with floating label, validation states, and error messages",
  "Modal dialog with header, body, footer, and backdrop blur",
  "Dashboard stats card with icon, metric, and trend indicator"
]

const STYLE_PRESETS = [
  { name: "Modern", hints: { rounded: "lg", shadow: true, gradient: true } },
  { name: "Minimal", hints: { rounded: "sm", shadow: false, border: true } },
  { name: "Playful", hints: { rounded: "xl", shadow: true, colorful: true } },
  { name: "Corporate", hints: { rounded: "md", shadow: false, neutral: true } }
]

export function PromptBox({ onGenerate, isGenerating }: PromptBoxProps) {
  const [prompt, setPrompt] = useState('')
  const [variants, setVariants] = useState(3)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(0.12)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const styleHints = selectedPreset ? 
      STYLE_PRESETS.find(p => p.name === selectedPreset)?.hints || {} : {}

    try {
      await onGenerate(prompt, {
        variants,
        styleHints,
        themeHints: { tailwindConfig: true }
      })
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate component. Please try again.')
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  // Update cost estimate when prompt changes
  React.useEffect(() => {
    if (prompt) {
      const baseTokens = Math.min(prompt.length * 1.5, 2000)
      const cost = Math.round((baseTokens / 1000) * 0.09 * variants * 100) / 100
      setEstimatedCost(Math.max(cost, 0.05))
    }
  }, [prompt, variants])

  return (
    <div className="space-y-4">
      {/* Component Generation */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wand2 className="h-5 w-5 text-purple-400" />
            <span>Generate Component</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-slate-300">
                Describe your component
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A primary button with icon, gradient background, accessible..."
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-[80px]"
                disabled={isGenerating}
              />
            </div>

            {/* Style Presets */}
            <div className="space-y-2">
              <Label className="text-slate-300">Style Preset</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    size="sm"
                    variant={selectedPreset === preset.name ? "default" : "outline"}
                    onClick={() => setSelectedPreset(
                      selectedPreset === preset.name ? '' : preset.name
                    )}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-slate-400 hover:text-white p-0 h-auto"
              >
                <Settings className="h-3 w-3 mr-1" />
                Advanced Options
              </Button>

              {showAdvanced && (
                <div className="space-y-3 p-3 bg-slate-700 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="variants" className="text-slate-300 text-xs">
                      Variants ({variants})
                    </Label>
                    <Input
                      id="variants"
                      type="range"
                      min="1"
                      max="5"
                      value={variants}
                      onChange={(e) => setVariants(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cost & Generate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Estimated Cost: ${estimatedCost}</span>
                </div>
                <span>{variants} variant{variants !== 1 ? 's' : ''}</span>
              </div>

              <Button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Component
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Example Prompts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white text-sm">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span>Example Prompts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {EXAMPLE_PROMPTS.slice(0, 3).map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left p-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                disabled={isGenerating}
              >
                "{example}"
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-400">12</div>
              <div className="text-slate-400">Generated</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">8</div>
              <div className="text-slate-400">Inserted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
