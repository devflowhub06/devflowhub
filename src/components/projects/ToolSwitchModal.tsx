'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowRight, X } from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  capabilities: string[]
  status: 'available' | 'connected'
  icon?: string
}

interface ToolSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  availableTools: Tool[]
  currentTool: string
  onToolSelect: (toolId: string) => void
  isLoading?: boolean
}

export function ToolSwitchModal({
  isOpen,
  onClose,
  availableTools,
  currentTool,
  onToolSelect,
  isLoading = false
}: ToolSwitchModalProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [animatingTool, setAnimatingTool] = useState<string | null>(null)

  if (!isOpen) return null

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
    onToolSelect(toolId)
    toast.success(`Switched to ${toolId.charAt(0).toUpperCase() + toolId.slice(1)}!`, {
      icon: '🔄',
      duration: 2000,
      description: 'Context synced successfully'
    })
    setAnimatingTool(toolId)
    setTimeout(() => setAnimatingTool(null), 500)
  }

  const filteredTools = availableTools.filter(tool => tool.id !== currentTool)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Switch Tool
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Select which AI tool you'd like to switch to:
        </p>
        
        <div className="space-y-3 mb-4">
          {filteredTools.map(tool => (
            <Card
              key={tool.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                selectedTool === tool.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } ${animatingTool === tool.id ? 'animate-bounce-in' : ''}`}
              onClick={() => !isLoading && handleToolSelect(tool.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="font-semibold text-blue-600">
                      {tool.icon || tool.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{tool.name}</div>
                    <div className="text-sm text-gray-500">{tool.description}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.capabilities.slice(0, 2).map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-blue-600">
                  <span className="text-sm mr-1">Switch</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredTools.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No other tools available to switch to</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
} 