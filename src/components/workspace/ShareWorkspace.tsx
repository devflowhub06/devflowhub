'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface ShareWorkspaceProps {
  projectId: string
}

export function ShareWorkspace({ projectId }: ShareWorkspaceProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [shareEnabled, setShareEnabled] = useState(false)

  useEffect(() => {
    loadShareInfo()
  }, [projectId])

  const loadShareInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/${projectId}/share`)
      if (response.ok) {
        const data = await response.json()
        setShareUrl(data.shareUrl)
        setExpiresAt(data.expiresAt)
        setShareEnabled(data.shareEnabled)
      }
    } catch (error) {
      console.error('Error loading share info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateShareLink = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 7 })
      })

      if (response.ok) {
        const data = await response.json()
        setShareUrl(data.shareUrl)
        setExpiresAt(data.expiresAt)
        setShareEnabled(true)
        toast.success('Share link created successfully')
      } else {
        toast.error('Failed to create share link')
      }
    } catch (error) {
      console.error('Error generating share link:', error)
      toast.error('Failed to create share link')
    } finally {
      setIsGenerating(false)
    }
  }

  const revokeShareLink = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShareUrl(null)
        setExpiresAt(null)
        setShareEnabled(false)
        toast.success('Share link revoked')
      } else {
        toast.error('Failed to revoke share link')
      }
    } catch (error) {
      console.error('Error revoking share link:', error)
      toast.error('Failed to revoke share link')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent-warn" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5" />
          <span>Share Workspace</span>
        </CardTitle>
        <CardDescription>
          Create a read-only share link to collaborate with others. Includes terminal output and logs for better collaboration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {shareEnabled && shareUrl ? (
          <>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Share link is active
                </span>
              </div>
              {expiresAt && (
                <p className="text-xs text-green-700 dark:text-green-300">
                  Expires: {formatExpiryDate(expiresAt)}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Input
                value={shareUrl}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-slate-800 border-slate-700 text-white font-mono text-sm cursor-text py-2.5"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1 bg-accent-warn hover:bg-accent-warn/90 text-white font-medium py-2.5 shadow-lg shadow-accent-warn/20 transition-all"
                  title="Copy link to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => window.open(shareUrl, '_blank')}
                  variant="outline"
                  className="flex-1 bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white font-medium py-2.5"
                  title="Open share link in new tab"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  <span>Open Link</span>
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Click the URL field above to select, or use the buttons to copy or open
              </p>
            </div>

            <Button
              onClick={revokeShareLink}
              disabled={isGenerating}
              variant="destructive"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Share Link'
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                  No share link active
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Create a read-only share link to let others view your workspace, including code, terminal output, and activity logs. The link will expire in 7 days.
                </p>
              </div>
            </div>

            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full bg-accent-warn hover:bg-accent-warn/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Generate Share Link
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

