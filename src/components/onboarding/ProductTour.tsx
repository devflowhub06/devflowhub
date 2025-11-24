'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles,
  FileText,
  Terminal,
  Eye,
  Rocket,
  Brain
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right'
  icon: React.ReactNode
}

const tourSteps: TourStep[] = [
  {
    id: 'editor',
    title: 'Code Editor',
    description: 'Write code with AI-powered autocomplete. Select code and use the AI assistant for explain, debug, or refactor.',
    target: '[data-tour="editor"]',
    position: 'right',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'terminal',
    title: 'Terminal',
    description: 'Run commands, install packages, and start your dev server. Output streams in real-time.',
    target: '[data-tour="terminal"]',
    position: 'top',
    icon: <Terminal className="h-5 w-5" />
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description: 'See your app running live. Click "Run" to start your dev server and view it here.',
    target: '[data-tour="preview"]',
    position: 'left',
    icon: <Eye className="h-5 w-5" />
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Get help with your code. Ask questions, explain code, debug issues, or refactor.',
    target: '[data-tour="ai-assistant"]',
    position: 'right',
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: 'deploy',
    title: 'Deploy',
    description: 'Deploy your project to production with one click. Connect to Vercel, Netlify, or custom domains.',
    target: '[data-tour="deploy"]',
    position: 'top',
    icon: <Rocket className="h-5 w-5" />
  }
]

interface ProductTourProps {
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
}

export function ProductTour({ isActive, onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({})
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const step = tourSteps[currentStep]
    if (!step) {
      onComplete()
      return
    }

    const targetElement = document.querySelector(step.target)
    if (!targetElement) {
      // Skip to next step if target not found
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        onComplete()
      }
      return
    }

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect()
      const scrollX = window.scrollX
      const scrollY = window.scrollY

      // Create overlay that highlights the target
      setOverlayStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9998,
        clipPath: `polygon(
          0% 0%, 
          0% 100%, 
          ${rect.left}px 100%, 
          ${rect.left}px ${rect.top}px, 
          ${rect.right}px ${rect.top}px, 
          ${rect.right}px ${rect.bottom}px, 
          ${rect.left}px ${rect.bottom}px, 
          ${rect.left}px 100%, 
          100% 100%, 
          100% 0%
        )`
      })

      // Position tooltip
      let tooltipTop = 0
      let tooltipLeft = 0

      switch (step.position) {
        case 'top':
          tooltipTop = rect.top + scrollY - 20
          tooltipLeft = rect.left + scrollX + rect.width / 2
          break
        case 'bottom':
          tooltipTop = rect.bottom + scrollY + 20
          tooltipLeft = rect.left + scrollX + rect.width / 2
          break
        case 'left':
          tooltipTop = rect.top + scrollY + rect.height / 2
          tooltipLeft = rect.left + scrollX - 20
          break
        case 'right':
          tooltipTop = rect.top + scrollY + rect.height / 2
          tooltipLeft = rect.right + scrollX + 20
          break
      }

      setTooltipStyle({
        position: 'absolute',
        top: `${tooltipTop}px`,
        left: `${tooltipLeft}px`,
        transform: step.position === 'top' || step.position === 'bottom' 
          ? 'translateX(-50%)' 
          : step.position === 'left' 
          ? 'translateX(-100%) translateY(-50%)' 
          : 'translateY(-50%)',
        zIndex: 9999
      })

      // Scroll target into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [currentStep, isActive, onComplete])

  if (!isActive) return null

  const step = tourSteps[currentStep]
  if (!step) return null

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return createPortal(
    <>
      {/* Overlay */}
      <div ref={overlayRef} style={overlayStyle} />

      {/* Tooltip */}
      <div style={tooltipStyle} className="w-80">
        <div className="bg-slate-800 border border-accent-warn/30 rounded-lg shadow-xl p-4">
          <div className="flex items-start space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-warn/20 text-accent-warn flex-shrink-0">
              {step.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-slate-300">
                {step.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-4 bg-accent-warn'
                      : index < currentStep
                      ? 'w-2 bg-accent-warn/50'
                      : 'w-1 bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              size="sm"
              className="bg-accent-warn hover:bg-accent-warn/90 text-white text-xs"
            >
              {currentStep < tourSteps.length - 1 ? 'Next' : 'Complete'}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}


