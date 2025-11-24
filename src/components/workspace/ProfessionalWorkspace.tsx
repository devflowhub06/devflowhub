'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Code2, 
  Terminal, 
  Sparkles, 
  Rocket, 
  FileText, 
  Search, 
  Settings, 
  GitBranch, 
  Play, 
  Save,
  Maximize2,
  Minimize2,
  X,
  Menu,
  Zap,
  Bot,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelRight
} from 'lucide-react'
import DevFlowHubEditor from './DevFlowHubEditor'
import DevFlowHubSandbox from './DevFlowHubSandbox'
import { DevFlowHubUIStudio } from './DevFlowHubUIStudio'
import { DevFlowHubDeployer } from './DevFlowHubDeployer'
import { 
  LegacyToolType, 
  getDisplayName, 
  getShortLabel, 
  getAllModules,
  toDevFlowHubModule,
  getModuleMapping 
} from '@/lib/module-mapping'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { cn } from '@/lib/utils'

interface ProfessionalWorkspaceProps {
  projectId: string
  activeTool?: string
  onStatusChange?: (status: any) => void
  onToolSwitch?: (tool: string) => void
}

export default function ProfessionalWorkspace({ 
  projectId, 
  activeTool: initialActiveTool = 'CURSOR',
  onStatusChange, 
  onToolSwitch 
}: ProfessionalWorkspaceProps) {
  const [internalActiveTool, setInternalActiveTool] = useState(initialActiveTool)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Always use the prop if provided, otherwise use internal state
  const activeTool = initialActiveTool || internalActiveTool

  // Update internal state when prop changes
  useEffect(() => {
    if (initialActiveTool) {
      setInternalActiveTool(initialActiveTool)
    }
  }, [initialActiveTool])

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      
      // Auto-collapse sidebar on mobile
      if (width < 768) {
        setSidebarCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // ResizeObserver for main content area
  const mainContentRef = useResizeObserver((entry) => {
    // Trigger layout updates for embedded components like Monaco Editor
    const event = new CustomEvent('workspace-resize', { 
      detail: { 
        width: entry.contentRect.width, 
        height: entry.contentRect.height 
      } 
    })
    window.dispatchEvent(event)
  })

  const modules = getAllModules()
  const tools = (modules || []).map(mapping => ({
    key: mapping.legacyTool,
    icon: mapping.icon === 'Code2' ? Code2 : 
          mapping.icon === 'Terminal' ? Terminal :
          mapping.icon === 'Sparkles' ? Sparkles :
          mapping.icon === 'Rocket' ? Rocket : Terminal,
    label: isFeatureEnabled('REBRAND_V1_0') ? getShortLabel(mapping.legacyTool) : 
           mapping.legacyTool === 'CURSOR' ? 'Editor' :
           mapping.legacyTool === 'REPLIT' ? 'Sandbox' :
           mapping.legacyTool === 'V0' ? 'UI Studio' :
           mapping.legacyTool === 'BOLT' ? 'Deployer' : 'Unknown',
    color: mapping.color,
    description: mapping.description
  }))

  const handleToolSwitch = (toolKey: string) => {
    setInternalActiveTool(toolKey)
    
    // Convert legacy tool to module parameter when feature flag is enabled
    if (isFeatureEnabled('REBRAND_V1_0')) {
      try {
        const mapping = getModuleMapping(toolKey as LegacyToolType)
        onToolSwitch?.(mapping.legacyKey)
      } catch (error) {
        // Fallback to legacy tool key
        onToolSwitch?.(toolKey.toLowerCase())
      }
    } else {
      // Legacy behavior
      onToolSwitch?.(toolKey.toLowerCase())
    }
  }

  return (
    <div className={`h-screen w-full bg-slate-900 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Menu Bar - Responsive */}
      <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-2 sm:px-4 text-xs">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <span className="text-slate-300 font-medium hidden sm:inline">DevFlowHub</span>
          <span className="text-slate-300 font-medium sm:hidden">DH</span>
          <div className={cn(
            "flex items-center space-x-1 sm:space-x-2",
            isMobile && "hidden"
          )}>
            <Button size="sm" variant="ghost" className="h-6 px-1 sm:px-2 text-xs">
              <span className="hidden sm:inline">File</span>
              <span className="sm:hidden">F</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-1 sm:px-2 text-xs">
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">E</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-1 sm:px-2 text-xs">
              <span className="hidden sm:inline">View</span>
              <span className="sm:hidden">V</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-1 sm:px-2 text-xs">
              <span className="hidden sm:inline">Terminal</span>
              <span className="sm:hidden">T</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-1 sm:px-2 text-xs">
              <span className="hidden sm:inline">Help</span>
              <span className="sm:hidden">H</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs border-green-500 text-green-400">
            Live
          </Badge>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Activity Bar - Responsive */}
        <div className={cn(
          "bg-slate-800 border-r border-slate-700 flex flex-col items-center py-2 space-y-2 transition-all duration-200",
          isMobile ? "w-0 overflow-hidden" : "w-12",
          sidebarCollapsed && !isMobile ? "w-0 overflow-hidden" : "w-12"
        )}>
          <div className={cn(
            "flex flex-col items-center space-y-2 w-12",
            (isMobile || sidebarCollapsed) && "opacity-0"
          )}>
            <Button
              size="sm"
              variant={activeTool === 'CURSOR' ? 'default' : 'ghost'}
              className="h-8 w-8 p-0 touch-target"
              onClick={() => handleToolSwitch('CURSOR')}
            >
              <Terminal className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'REPLIT' ? 'default' : 'ghost'}
              className="h-8 w-8 p-0 touch-target"
              onClick={() => handleToolSwitch('REPLIT')}
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'V0' ? 'default' : 'ghost'}
              className="h-8 w-8 p-0 touch-target"
              onClick={() => handleToolSwitch('V0')}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'BOLT' ? 'default' : 'ghost'}
              className="h-8 w-8 p-0 touch-target"
              onClick={() => handleToolSwitch('BOLT')}
            >
              <Rocket className="h-4 w-4" />
            </Button>
            
            <div className="w-6 h-px bg-slate-600 my-2" />
            
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 touch-target">
              <Search className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 touch-target">
              <GitBranch className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 touch-target">
              <Bot className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 touch-target">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar Toggle Button - Mobile/Tablet */}
        {(isMobile || isTablet) && (
          <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-12 left-2 z-10 h-8 w-8 p-0 bg-slate-800 border border-slate-600 touch-target"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-slate-800 border-slate-700">
              <div className="flex flex-col items-center py-4 space-y-2">
                <Button
                  size="sm"
                  variant={activeTool === 'CURSOR' ? 'default' : 'ghost'}
                  className="w-full justify-start h-10 touch-target"
                  onClick={() => {
                    handleToolSwitch('CURSOR')
                    setShowSidebar(false)
                  }}
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  Editor
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === 'REPLIT' ? 'default' : 'ghost'}
                  className="w-full justify-start h-10 touch-target"
                  onClick={() => {
                    handleToolSwitch('REPLIT')
                    setShowSidebar(false)
                  }}
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Sandbox
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === 'V0' ? 'default' : 'ghost'}
                  className="w-full justify-start h-10 touch-target"
                  onClick={() => {
                    handleToolSwitch('V0')
                    setShowSidebar(false)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  UI Studio
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === 'BOLT' ? 'default' : 'ghost'}
                  className="w-full justify-start h-10 touch-target"
                  onClick={() => {
                    handleToolSwitch('BOLT')
                    setShowSidebar(false)
                  }}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Deployer
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Main Editor Area - Responsive */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Toolbar - Responsive */}
          <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-2 sm:px-4">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              {/* Tool Switcher - Desktop */}
              <div className={cn(
                "flex items-center space-x-2",
                isMobile && "hidden"
              )}>
                {(tools || []).map(({ key, icon: Icon, label, color }) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={activeTool === key ? 'default' : 'ghost'}
                    className={`h-7 px-2 sm:px-3 text-xs touch-target ${activeTool === key ? color : ''}`}
                    onClick={() => handleToolSwitch(key)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                ))}
              </div>
              
              {/* Current Tool Indicator - Mobile */}
              {isMobile && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {tools?.find(t => t.key === activeTool)?.label || 'Editor'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 touch-target"
                    onClick={() => setShowSidebar(true)}
                  >
                    <Menu className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="hidden sm:block w-px h-6 bg-slate-600" />
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button size="sm" variant="ghost" className="h-7 px-2 touch-target">
                  <Save className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 touch-target">
                  <Play className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Run</span>
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 touch-target">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-slate-300 flex-shrink-0">
              <span className="hidden sm:inline">Project: {projectId}</span>
              <span className="sm:hidden">{projectId.slice(0, 8)}...</span>
              <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                Git: Clean
              </Badge>
            </div>
          </div>

          {/* Editor Content - With ResizeObserver */}
          <div ref={mainContentRef} className="flex-1 overflow-hidden">
            {activeTool === 'CURSOR' && (
              <DevFlowHubEditor 
                projectId={projectId} 
                onStatusChange={onStatusChange}
                onToolSwitch={onToolSwitch}
              />
            )}
            {activeTool === 'REPLIT' && (
              <DevFlowHubSandbox 
                projectId={projectId} 
                onStatusChange={onStatusChange}
                onToolSwitch={onToolSwitch}
              />
            )}
            {activeTool === 'V0' && (
              <DevFlowHubUIStudio 
                projectId={projectId}
                onStatusChange={onStatusChange}
              />
            )}
            {activeTool === 'BOLT' && (
              <DevFlowHubDeployer 
                projectId={projectId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
