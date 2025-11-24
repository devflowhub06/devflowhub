'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, ExternalLink, AlertCircle, Play } from 'lucide-react'
import { toast } from 'sonner'
import { clientTrackEvent } from '@/lib/client-analytics'
import { AdvancedLivePreview } from '@/components/editor/AdvancedLivePreview'

interface ProjectPreviewProps {
  projectId: string
  files?: Array<{ path: string; content: string; type?: string }>
}

export function ProjectPreview({ projectId, files = [] }: ProjectPreviewProps) {
  const [previewStatus, setPreviewStatus] = useState<'checking' | 'running' | 'not-running' | 'error'>('checking')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [port, setPort] = useState<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const normalizedFiles = useMemo(() => {
    if (!files?.length) return []
    return files
      .filter(file => (file.type ?? 'file') !== 'directory')
      .map(file => ({
        path: file.path?.startsWith('/') ? file.path : `/${file.path}`,
        content: file.content ?? ''
      }))
  }, [files])

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      await checkPreviewStatus()
    }

    bootstrap()

    const handlePreviewReady = (event: CustomEvent) => {
      if (event.detail.projectId === projectId) {
        setPort(event.detail.port)
        setPreviewUrl(`/api/projects/${projectId}/preview/proxy`)
        setPreviewStatus('running')
        checkPreviewStatus()
      }
    }

    window.addEventListener('preview-ready', handlePreviewReady as EventListener)

    pollingIntervalRef.current = setInterval(() => {
      checkPreviewStatus()
    }, 3000) // Check every 3 seconds

    return () => {
      window.removeEventListener('preview-ready', handlePreviewReady as EventListener)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      isMounted = false
    }
  }, [projectId])

  const checkPreviewStatus = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/preview`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        if (data.running) {
          setPreviewStatus('running')
          setPreviewUrl(data.previewUrl || `/api/projects/${projectId}/preview/proxy`)
          setPort(data.port)
        } else {
          setPreviewStatus('not-running')
          setPreviewUrl(null)
        }
      } else {
        setPreviewStatus('not-running')
      }
    } catch (error) {
      console.error('Failed to check preview status:', error)
      setPreviewStatus('error')
    }
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
    clientTrackEvent('preview_refreshed', { projectId, status: previewStatus })
    toast.success('Preview refreshed')
  }

  const handleStartProject = async () => {
    clientTrackEvent('preview_start_clicked', { projectId })

    window.dispatchEvent(new CustomEvent('terminal-command', {
      detail: { command: 'npm run dev', projectId }
    }))
    toast.info('Trying to start your dev server… check the terminal.')
  }

  if (previewStatus === 'checking') {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-warn mx-auto mb-4" />
          <p className="text-slate-400">Checking preview status...</p>
        </div>
      </div>
    )
  }

  if (previewStatus === 'not-running') {
    return (
      <div className="h-full grid grid-rows-[auto,1fr] bg-slate-900">
        <div className="p-4 border-b border-slate-800 bg-slate-800/70 backdrop-blur-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-100">
            <AlertCircle className="h-5 w-5 text-accent-warn" />
            <div>
              <p className="font-medium text-sm">Live dev server not running</p>
              <p className="text-xs text-slate-400">We’ll render a sandboxed preview of your current files until `npm run dev` is up.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleStartProject}
              className="bg-accent-warn hover:bg-accent-warn/90 text-white text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Start Project (npm run dev)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={checkPreviewStatus}
              className="text-xs border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Retry
            </Button>
          </div>
        </div>
        <div className="h-full">
          {normalizedFiles.length > 0 ? (
            <AdvancedLivePreview
              files={normalizedFiles}
              template="react"
              isAutoRefresh={true}
              onStatusChange={(status) => {
                clientTrackEvent('preview_fallback_status', { projectId, status: status.status })
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <p>No runnable files detected yet. Create a file like <code className="px-2 py-1 bg-slate-800 rounded">src/index.js</code> to preview.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (previewStatus === 'running' && previewUrl) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              Running
            </Badge>
            {port && (
              <span className="text-sm text-slate-400">
                Port {port}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(previewUrl!, '_blank')}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open in New Tab
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Project Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            onError={() => {
              setPreviewStatus('error')
              toast.error('Failed to load preview')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">Preview error occurred. Showing fallback sandbox.</p>
        <div className="max-w-4xl mx-auto rounded-lg overflow-hidden border border-slate-800">
          {normalizedFiles.length > 0 ? (
            <AdvancedLivePreview
              files={normalizedFiles}
              template="react"
              isAutoRefresh={false}
              onStatusChange={(status) => {
                clientTrackEvent('preview_error_fallback', { projectId, status: status.status })
              }}
            />
          ) : (
            <div className="p-6 bg-slate-900 text-slate-500">
              Add some files to your project to render a fallback preview.
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            onClick={checkPreviewStatus}
            variant="outline"
          >
            Retry live preview
          </Button>
          <Button variant="outline" onClick={handleStartProject}>
            Start dev server
          </Button>
        </div>
      </div>
    </div>
  )
}

