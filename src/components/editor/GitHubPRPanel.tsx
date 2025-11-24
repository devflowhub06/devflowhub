'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  GitPullRequest, 
  Github, 
  ExternalLink, 
  Link2, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface GitHubPRPanelProps {
  projectId: string
  currentBranch?: string
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  default_branch: string
}

export function GitHubPRPanel({ projectId, currentBranch }: GitHubPRPanelProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [linkedRepo, setLinkedRepo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [isCreatingPR, setIsCreatingPR] = useState(false)
  const [isGitHubConnected, setIsGitHubConnected] = useState(false)
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)
  const [prTitle, setPrTitle] = useState('')
  const [prDescription, setPrDescription] = useState('')
  const [branchName, setBranchName] = useState(currentBranch || 'feature/ai-changes')
  const [baseBranch, setBaseBranch] = useState('main')

  useEffect(() => {
    checkGitHubConnection()
    checkLinkedRepo()
  }, [projectId])

  const checkGitHubConnection = async () => {
    try {
      setIsCheckingConnection(true)
      const response = await fetch('/api/settings/integrations')
      if (response.ok) {
        const data = await response.json()
        const githubIntegration = data.integrations?.find((i: any) => i.provider === 'github' && i.connectionState === 'connected')
        setIsGitHubConnected(!!githubIntegration)
        
        if (githubIntegration) {
          // Only load repos if GitHub is connected
          await loadRepos()
        }
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error)
      setIsGitHubConnected(false)
    } finally {
      setIsCheckingConnection(false)
    }
  }

  const loadRepos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/integrations/github/repos')
      if (response.ok) {
        const data = await response.json()
        setRepos(data.repos || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401 || errorData.error?.includes('not connected')) {
          setIsGitHubConnected(false)
          toast.error('GitHub is not connected. Please connect GitHub first.')
        } else {
          toast.error(errorData.error || 'Failed to load GitHub repositories')
        }
      }
    } catch (error) {
      console.error('Error loading repos:', error)
      toast.error('Failed to load GitHub repositories')
    } finally {
      setIsLoading(false)
    }
  }

  const connectGitHub = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'github' })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.oauthUrl) {
          // Open OAuth URL in same window
          window.location.href = data.oauthUrl
        } else {
          toast.success('GitHub connected successfully')
          setIsGitHubConnected(true)
          await loadRepos()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to connect GitHub')
      }
    } catch (error) {
      console.error('Error connecting GitHub:', error)
      toast.error('Failed to connect GitHub')
    } finally {
      setIsLoading(false)
    }
  }

  const checkLinkedRepo = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        const context = data.project?.context
        if (context?.githubRepo) {
          setLinkedRepo(context.githubRepo)
        }
      }
    } catch (error) {
      console.error('Error checking linked repo:', error)
    }
  }

  const linkRepository = async () => {
    if (!selectedRepo) {
      toast.error('Please select a repository')
      return
    }

    try {
      setIsLinking(true)
      const response = await fetch('/api/integrations/github/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, repoFullName: selectedRepo })
      })

      if (response.ok) {
        setLinkedRepo(selectedRepo)
        toast.success('Repository linked successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to link repository')
      }
    } catch (error) {
      console.error('Error linking repo:', error)
      toast.error('Failed to link repository')
    } finally {
      setIsLinking(false)
    }
  }

  const createPullRequest = async () => {
    if (!prTitle.trim()) {
      toast.error('Please enter a PR title')
      return
    }

    if (!branchName.trim()) {
      toast.error('Please enter a branch name')
      return
    }

    try {
      setIsCreatingPR(true)
      const response = await fetch(`/api/git/${projectId}/pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchName: branchName.trim(),
          title: prTitle.trim(),
          description: prDescription.trim(),
          baseBranch: baseBranch.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Pull request created successfully!')
        window.open(data.pr.html_url, '_blank')
        // Reset form
        setPrTitle('')
        setPrDescription('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create pull request')
      }
    } catch (error) {
      console.error('Error creating PR:', error)
      toast.error('Failed to create pull request')
    } finally {
      setIsCreatingPR(false)
    }
  }

  if (isCheckingConnection) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-accent-warn" />
      </div>
    )
  }

  // Show GitHub connection prompt if not connected
  if (!isGitHubConnected) {
    return (
      <div className="h-full overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="h-full flex items-center justify-center">
          <Card className="w-full max-w-lg mx-auto">
            <CardContent className="pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
              <div className="text-center py-4 sm:py-6 md:py-8">
                {/* GitHub Icon - Responsive */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <Github className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto text-slate-400 transition-all" />
                </div>
                
                {/* Heading - Responsive */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-200 mb-2 sm:mb-3 px-2">
                  Connect GitHub to Enable PR Creation
                </h3>
                
                {/* Description - Responsive */}
                <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6 max-w-md mx-auto px-2 leading-relaxed">
                  Connect your GitHub account to link repositories and create pull requests directly from DevFlowHub.
                </p>
                
                {/* Button - Responsive */}
                <div className="mb-3 sm:mb-4">
                  <Button
                    onClick={connectGitHub}
                    disabled={isLoading}
                    size="lg"
                    className="bg-accent-warn hover:bg-accent-warn/90 text-white w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                        <span className="whitespace-nowrap">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Github className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Connect GitHub</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Settings Link - Responsive */}
                <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 px-2">
                  Or connect GitHub from{' '}
                  <a
                    href="/dashboard/settings"
                    className="text-accent-warn hover:underline font-medium transition-colors"
                  >
                    Settings → Integrations
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
      {/* Repository Linking */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Github className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span>GitHub Repository</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
            Link your project to a GitHub repository to enable PR creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
          {linkedRepo ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base text-green-900 dark:text-green-100 truncate">
                    Linked: {linkedRepo}
                  </p>
                  <a
                    href={`https://github.com/${linkedRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-green-700 dark:text-green-300 hover:underline flex items-center space-x-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    <span>View on GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start sm:items-center space-x-2">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex-1">
                  No repository linked. Select a repository to link:
                </p>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-4 sm:py-6">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-accent-warn" />
                  <span className="ml-2 text-xs sm:text-sm text-slate-400">Loading repositories...</span>
                </div>
              ) : repos.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded text-white min-w-0"
                  >
                    <option value="">Select repository...</option>
                    {repos.map((repo) => (
                      <option key={repo.id} value={repo.full_name}>
                        {repo.full_name} {repo.private ? '(Private)' : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={linkRepository}
                    disabled={!selectedRepo || isLinking}
                    className="bg-accent-warn hover:bg-accent-warn/90 w-full sm:w-auto flex-shrink-0"
                  >
                    {isLinking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Link
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-3 sm:p-4 bg-slate-800 border border-slate-700 rounded-lg">
                  <p className="text-xs sm:text-sm text-slate-400 text-center">
                    No repositories found. Make sure you have repositories in your GitHub account.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Pull Request */}
      {linkedRepo && (
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <GitPullRequest className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span>Create Pull Request</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
              Create a pull request from your current branch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Branch Name</label>
              <Input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="feature/ai-changes"
                className="bg-slate-800 border-slate-700 text-white text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Base Branch</label>
              <Input
                value={baseBranch}
                onChange={(e) => setBaseBranch(e.target.value)}
                placeholder="main"
                className="bg-slate-800 border-slate-700 text-white text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">PR Title *</label>
              <Input
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                placeholder="[AI] Add new feature"
                className="bg-slate-800 border-slate-700 text-white text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">PR Description</label>
              <Textarea
                value={prDescription}
                onChange={(e) => setPrDescription(e.target.value)}
                placeholder="Describe the changes in this PR..."
                rows={5}
                className="bg-slate-800 border-slate-700 text-white text-sm sm:text-base resize-y"
              />
            </div>

            <Button
              onClick={createPullRequest}
              disabled={isCreatingPR || !prTitle.trim()}
              className="w-full bg-accent-warn hover:bg-accent-warn/90 text-sm sm:text-base py-2.5 sm:py-3"
            >
              {isCreatingPR ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating PR...
                </>
              ) : (
                <>
                  <GitPullRequest className="h-4 w-4 mr-2" />
                  Create Pull Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  )
}


