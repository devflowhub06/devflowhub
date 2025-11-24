import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id]/status - Get project status for onboarding checklist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = params

    // Get project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        files: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get user's integrations
    const integrations = await prisma.integration.findMany({
      where: { userId: session.user.id }
    })

    // Get onboarding progress
    const onboardingProgress = await prisma.onboardingProgress.findUnique({
      where: { userId: session.user.id }
    })

    // Determine project status
    const status = {
      // Project created
      createdFirstProject: true, // This project exists
      
      // Integration connected
      connectedIntegration: integrations.length > 0,
      
      // Sandbox running (check if sandbox is provisioned and running)
      ranInSandbox: checkSandboxStatus(project),
      
      // Deployed to staging (check if deployment exists)
      deployedToStaging: checkDeploymentStatus(project),
      
      // Used assistant (check if assistant has been used)
      usedAssistant: checkAssistantUsage(project)
    }

    return NextResponse.json({
      projectId,
      status,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        language: project.language,
        framework: project.framework
      },
      integrations: integrations.map(i => ({
        id: i.id,
        provider: i.provider,
        status: i.status
      })),
      onboardingProgress
    })
  } catch (error) {
    console.error('Error fetching project status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project status' },
      { status: 500 }
    )
  }
}

// Helper functions to check various statuses
function checkSandboxStatus(project: any): boolean {
  // Check if sandbox is provisioned and running
  const context = project.context as any
  const provisioning = context?.provisioning
  
  if (provisioning?.status === 'completed' && provisioning?.previewUrl) {
    return true
  }
  
  // Check if project has sandbox-related files or configurations
  const hasSandboxFiles = project.files?.some((file: any) => 
    file.path.includes('sandbox') || 
    file.path.includes('docker') ||
    file.path.includes('container')
  )
  
  return hasSandboxFiles || false
}

function checkDeploymentStatus(project: any): boolean {
  // Check if project has been deployed
  const context = project.context as any
  
  // Look for deployment indicators in context
  if (context?.deployments?.length > 0) {
    return context.deployments.some((deployment: any) => 
      deployment.status === 'deployed' || deployment.status === 'staging'
    )
  }
  
  // Check for deployment-related files
  const hasDeployFiles = project.files?.some((file: any) => 
    file.path.includes('deploy') ||
    file.path.includes('vercel.json') ||
    file.path.includes('netlify.toml') ||
    file.path.includes('Dockerfile')
  )
  
  return hasDeployFiles || false
}

function checkAssistantUsage(project: any): boolean {
  // Check if AI assistant has been used for this project
  const context = project.context as any
  
  // Look for assistant usage in context
  if (context?.assistantHistory?.length > 0) {
    return true
  }
  
  // Check if assistant has been used recently
  if (context?.lastAssistantUsage) {
    const lastUsage = new Date(context.lastAssistantUsage)
    const now = new Date()
    const diffDays = (now.getTime() - lastUsage.getTime()) / (1000 * 60 * 60 * 24)
    
    return diffDays < 30 // Used within last 30 days
  }
  
  return false
}
