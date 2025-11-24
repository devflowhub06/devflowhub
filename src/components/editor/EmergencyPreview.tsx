'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertTriangle,
  Play,
  RefreshCw,
  Code,
  Eye,
  Download,
  Upload,
  Zap,
  WifiOff,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface EmergencyPreviewProps {
  files: Array<{
    path: string
    content: string
  }>
  onStatusChange?: (status: { status: string; message: string; progress?: number }) => void
}

export function EmergencyPreview({ files, onStatusChange }: EmergencyPreviewProps) {
  const [previewHTML, setPreviewHTML] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const generatePreview = useCallback(() => {
    setIsGenerating(true)
    onStatusChange?.({ status: 'generating', message: 'Generating emergency preview...', progress: 50 })

    try {
      // Find the main file
      const mainFile = files.find(f => 
        f.path.includes('App.') || 
        f.path.includes('index.') || 
        f.path.includes('main.')
      ) || files[0]

      if (!mainFile) {
        throw new Error('No files found')
      }

      // Generate HTML preview
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emergency Preview - DevFlowHub</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 2rem; 
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .status-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .status-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .status-label {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-bottom: 0.5rem;
    }
    .status-value {
      font-size: 1.2rem;
      font-weight: bold;
    }
    .code-preview {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9rem;
      overflow-x: auto;
    }
    .emergency-notice {
      background: rgba(255, 193, 7, 0.2);
      border: 1px solid rgba(255, 193, 7, 0.5);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    .file-list {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .file-item:last-child {
      border-bottom: none;
    }
    .file-name {
      font-weight: 500;
    }
    .file-size {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Emergency Preview Mode</h1>
      <p>Live bundler is unavailable. This is a static HTML preview.</p>
    </div>

    <div class="emergency-notice">
      <h3>⚠️ Limited Functionality</h3>
      <p>This preview shows static content only. For full functionality, please check your connection or try refreshing.</p>
    </div>

    <div class="status-card">
      <h3>System Status</h3>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-label">Preview Mode</div>
          <div class="status-value">Emergency</div>
        </div>
        <div class="status-item">
          <div class="status-label">Files Loaded</div>
          <div class="status-value">${files.length}</div>
        </div>
        <div class="status-item">
          <div class="status-label">Hot Reload</div>
          <div class="status-value">Disabled</div>
        </div>
        <div class="status-item">
          <div class="status-label">Connection</div>
          <div class="status-value">Offline</div>
        </div>
      </div>
    </div>

    <div class="status-card">
      <h3>File Contents</h3>
      <div class="file-list">
        ${files.map(file => `
          <div class="file-item">
            <div class="file-name">${file.path}</div>
            <div class="file-size">${file.content.length} chars</div>
          </div>
        `).join('')}
      </div>
    </div>

    ${mainFile ? `
    <div class="status-card">
      <h3>Main File Preview (${mainFile.path})</h3>
      <div class="code-preview">
        <pre>${mainFile.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>
    </div>
    ` : ''}

    <div class="status-card">
      <h3>Quick Actions</h3>
      <p style="text-align: center; margin-top: 1rem; opacity: 0.8;">
        Try refreshing the page or check your internet connection to restore full functionality.
      </p>
    </div>
  </div>
</body>
</html>`

      setPreviewHTML(html)
      onStatusChange?.({ status: 'ready', message: 'Emergency preview generated', progress: 100 })
    } catch (error) {
      console.error('Error generating emergency preview:', error)
      onStatusChange?.({ status: 'error', message: 'Failed to generate preview', progress: 0 })
    } finally {
      setIsGenerating(false)
    }
  }, [files, onStatusChange])

  // Auto-generate on mount
  React.useEffect(() => {
    generatePreview()
  }, [generatePreview])

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Emergency Preview Mode</h2>
            <p className="text-sm text-gray-600">Live bundler unavailable - showing static preview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline Mode
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2"
          >
            {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
            {showCode ? 'Preview' : 'Code'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={generatePreview}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showCode ? (
          <div className="h-full overflow-auto p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Generated HTML Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={previewHTML}
                  readOnly
                  className="min-h-96 font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full">
            {previewHTML ? (
              <iframe
                srcDoc={previewHTML}
                className="w-full h-full border-0"
                title="Emergency Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Generating emergency preview...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-white text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Files: {files.length}</span>
          <span>Mode: Emergency</span>
          <span>Hot Reload: Disabled</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span>DevFlowHub Emergency Preview</span>
        </div>
      </div>
    </div>
  )
}
