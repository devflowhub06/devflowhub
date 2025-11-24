import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DeployerService } from '@/lib/deployer/service'
import { GitService } from '@/lib/deployer/git-service'
import { AIDeploymentSuggestions } from '@/lib/deployer/ai-suggestions'
import { DeployOptions } from '@/lib/deployer/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params
    const body = await request.json()

    // Validate request body
    const { 
      branch, 
      environment, 
      provider = 'vercel',
      commitHash,
      commitMessage,
      buildCommand,
      envVariables = {}
    } = body

    if (!branch || !environment) {
      return NextResponse.json(
        { error: 'Branch and environment are required' },
        { status: 400 }
      )
    }

    if (!['preview', 'staging', 'production'].includes(environment)) {
      return NextResponse.json(
        { error: 'Invalid environment. Must be preview, staging, or production' },
        { status: 400 }
      )
    }

    if (!['vercel', 'netlify', 'aws', 'gcp'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be vercel, netlify, aws, or gcp' },
        { status: 400 }
      )
    }

    // Create deploy options
    const deployOptions: DeployOptions = {
      branch,
      environment: environment as 'preview' | 'staging' | 'production',
      provider: provider as 'vercel' | 'netlify' | 'aws' | 'gcp',
      commitHash,
      commitMessage,
      buildCommand,
      envVariables
    }

    const deployerService = new DeployerService()
    
    // Check user quota
    const quota = await deployerService.checkUserQuota(session.user.id)
    
    // Check if environment is allowed for user's plan
    if (!quota.environments.includes(environment)) {
      return NextResponse.json(
        { 
          error: `Environment '${environment}' not available on ${quota.plan} plan`,
          quota 
        },
        { status: 403 }
      )
    }

    // Initialize AI and Git services
    const gitService = new GitService(projectId)
    const aiSuggestions = new AIDeploymentSuggestions(projectId)

    // Get Git status and AI suggestions
    const gitStatus = await gitService.getStatus()
    const changedFiles = await gitService.getFileChanges(gitStatus.lastCommit.hash)
    const aiPlan = await aiSuggestions.generateDeploymentPlan(
      gitStatus, 
      environment, 
      changedFiles
    )

            // Create deployment preview
            const preview = await deployerService.createDeployPreview(projectId, deployOptions)

            // Enhance preview with AI suggestions and Git data
            const enhancedPreview = {
              ...preview,
              branch: gitStatus.branch,
              commitHash: gitStatus.lastCommit.hash,
              commitMessage: gitStatus.lastCommit.message,
              changedFiles: changedFiles.map(f => f.path), // Convert to simple string array
              estimatedCost: aiPlan.estimatedCost,
              estimatedBuildTime: aiPlan.estimatedBuildTime,
              aiSuggestions: aiPlan.suggestions,
              risks: aiPlan.risks,
              confidence: aiPlan.confidence,
              rationale: aiPlan.rationale,
              recommendedEnvironment: aiPlan.recommendedEnvironment,
              aheadBy: gitStatus.aheadBy,
              isDirty: gitStatus.isDirty,
              buildCommand: preview.buildCommand || 'npm run build',
              envVariables: preview.envVariables || {}
            }

    return NextResponse.json({
      success: true,
      preview: enhancedPreview,
      quota
    })

  } catch (error) {
    console.error('Deployment preview failed:', error)
    return NextResponse.json(
      { error: 'Failed to create deployment preview', details: (error as Error).message },
      { status: 500 }
    )
  }
}
