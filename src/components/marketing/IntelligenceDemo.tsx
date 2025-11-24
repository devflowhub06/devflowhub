'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Code2, Palette, TestTube, Rocket, MessageSquare, Lightbulb, Settings, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { useLandingData } from '@/hooks/useLandingData'

interface Task {
  id: string
  name: string
  icon: React.ElementType
  target: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

interface Suggestion {
  id: string
  title: string
  description: string
  workspace: string
  confidence: number
}

const workspaceIcons = {
  'Editor': Code2,
  'UI Studio': Palette,
  'Sandbox': TestTube,
  'Deployer': Rocket,
}

const workspaceColors = {
  'Editor': 'text-cyan-500',
  'UI Studio': 'text-purple-500',
  'Sandbox': 'text-green-500',
  'Deployer': 'text-orange-500',
}

function IntelligenceDemo() {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  
  const { data: landingData } = useLandingData()

  const tasks: Task[] = [
    { 
      id: 'task1', 
      name: 'Generate new feature', 
      icon: Lightbulb, 
      target: 'Editor',
      description: 'Create a new user authentication feature',
      priority: 'high'
    },
    { 
      id: 'task2', 
      name: 'Fix UI bug', 
      icon: Palette, 
      target: 'UI Studio',
      description: 'Resolve responsive layout issues',
      priority: 'medium'
    },
    { 
      id: 'task3', 
      name: 'Optimize database query', 
      icon: Code2, 
      target: 'Editor',
      description: 'Improve query performance',
      priority: 'high'
    },
    { 
      id: 'task4', 
      name: 'Deploy to staging', 
      icon: Rocket, 
      target: 'Deployer',
      description: 'Deploy latest changes to staging environment',
      priority: 'medium'
    },
    { 
      id: 'task5', 
      name: 'Run integration tests', 
      icon: TestTube, 
      target: 'Sandbox',
      description: 'Execute comprehensive test suite',
      priority: 'low'
    },
  ]

  const handleTaskClick = async (task: Task) => {
    setActiveTask(task)
    setIsProcessing(true)
    setAiResponse(null)
    setSuggestions([])
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate AI response
    const response = `AI routes "${task.name}" to the ${task.target} workspace.`
    setAiResponse(response)
    
    // Generate suggestions based on task
    const taskSuggestions: Suggestion[] = [
      {
        id: 'suggestion1',
        title: 'Auto-generate boilerplate',
        description: 'Create initial file structure and imports',
        workspace: task.target,
        confidence: 0.95
      },
      {
        id: 'suggestion2',
        title: 'Apply best practices',
        description: 'Follow coding standards and patterns',
        workspace: task.target,
        confidence: 0.87
      },
      {
        id: 'suggestion3',
        title: 'Add error handling',
        description: 'Implement comprehensive error management',
        workspace: task.target,
        confidence: 0.82
      }
    ]
    
    setSuggestions(taskSuggestions)
    setIsProcessing(false)
    setShowSuggestions(true)
    
    // Auto-hide suggestions after 5 seconds
    setTimeout(() => {
      setShowSuggestions(false)
    }, 5000)
  }

  return (
    <section className="py-24 bg-bg-900" data-intelligence-demo-section>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-100 mb-6">
            Intelligent Routing, Seamless Workflow
          </h2>
          <p className="text-xl text-body-text max-w-2xl mx-auto">
            Our AI Assistant intelligently routes your tasks to the most relevant workspace, maintaining full context and providing intelligent suggestions.
          </p>
        </motion.div>

        <div className="relative premium-card p-8 md:p-12 flex flex-col lg:flex-row items-center justify-around gap-12">
          {/* AI Assistant Core */}
          <motion.div
            className="relative flex flex-col items-center p-6 bg-bg-900 rounded-full border border-purple-500 shadow-neon-md"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <Bot className="w-16 h-16 text-purple-500 mb-2" />
            <span className="text-lg font-semibold text-text-100">AI Router</span>
            
            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            
            <AnimatePresence>
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  className="absolute -top-20 bg-cyan-500 text-white text-sm px-4 py-2 rounded-full whitespace-nowrap shadow-lg max-w-xs text-center"
                >
                  {aiResponse}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Task Inputs */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold text-text-100 mb-4">Your Tasks:</h3>
            <div className="grid grid-cols-2 gap-4">
              {tasks.map((task) => {
                const TaskIcon = task.icon
                const isActive = activeTask?.id === task.id
                return (
                  <motion.button
                    key={task.id}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden
                      ${isActive 
                        ? 'bg-cyan-500 text-white shadow-neon-sm' 
                        : 'bg-surface-800 text-body-text hover:bg-surface-800/80 hover:text-text-100'
                      }`}
                    onClick={() => handleTaskClick(task)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isProcessing}
                  >
                    <TaskIcon className="w-4 h-4" />
                    <span className="truncate">{task.name}</span>
                    
                    {/* Priority indicator */}
                    <div className={`w-2 h-2 rounded-full ml-1 ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-surface-800 text-text-100 text-xs rounded-md px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {task.description}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Workspace Outputs */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold text-text-100 mb-4">Routed To:</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(workspaceIcons).map(([name, Icon]) => {
                const isActive = activeTask?.target === name
                return (
                  <motion.div
                    key={name}
                    className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-200 relative
                      ${isActive 
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-neon-sm' 
                        : 'border-surface-800 bg-surface-800'
                      }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    onMouseEnter={() => setSelectedWorkspace(name)}
                    onMouseLeave={() => setSelectedWorkspace(null)}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${isActive ? 'text-cyan-500' : 'text-body-text'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-text-100' : 'text-body-text'}`}>
                      {name}
                    </span>
                    
                    {/* Confidence indicator */}
                    {isActive && suggestions.length > 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-50 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-bg-900">
                          {Math.round(suggestions[0]?.confidence * 100)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 premium-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-100 flex items-center">
                  <Zap className="w-5 h-5 text-purple-500 mr-2" />
                  AI Suggestions
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-body-text hover:text-text-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-surface-800/50 rounded-lg border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-text-100">
                        {suggestion.title}
                      </h4>
                      <span className="text-xs text-success-50 font-mono">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-body-text mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-70">
                        {suggestion.workspace}
                      </span>
                      <button className="text-xs text-cyan-500 hover:text-cyan-400 flex items-center">
                        Apply
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Metrics */}
        {landingData?.data?.metrics && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="premium-card p-4">
                <div className="text-2xl font-bold text-success-50 mb-1">
                  {landingData.data.metrics.contextAccuracy || '94%'}
                </div>
                <div className="text-sm text-body-text">Context Accuracy</div>
              </div>
              <div className="premium-card p-4">
                <div className="text-2xl font-bold text-success-50 mb-1">
                  {landingData.data.metrics.routingSuccess || '96%'}
                </div>
                <div className="text-sm text-body-text">Routing Success</div>
              </div>
              <div className="premium-card p-4">
                <div className="text-2xl font-bold text-success-50 mb-1">
                  {landingData.data.metrics.suggestionsUsed || '89%'}
                </div>
                <div className="text-sm text-body-text">Suggestions Used</div>
              </div>
              <div className="premium-card p-4">
                <div className="text-2xl font-bold text-success-50 mb-1">
                  {landingData.data.metrics.avgResponseTime || '0.3s'}
                </div>
                <div className="text-sm text-body-text">Avg Response</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default IntelligenceDemo
