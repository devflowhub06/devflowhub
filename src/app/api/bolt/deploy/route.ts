import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, environment, branch, message } = await request.json()

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        environment: environment || 'staging',
        branch: branch || 'main',
        commitMessage: message || 'Deployment via DevFlowHub',
        status: 'PENDING'
      }
    })

    // Simulate deployment process (in production, this would call Vercel/Netlify API)
    const deploymentResult = await simulateDeployment(deployment, project)

    // Update deployment status
    const updatedDeployment = await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: deploymentResult.success ? 'SUCCESS' : 'FAILED',
        url: deploymentResult.url
      }
    })

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: 'BOLT',
        action: 'deploy_requested',
        metadata: {
          environment,
          branch,
          deploymentId: deployment.id,
          success: deploymentResult.success,
          url: deploymentResult.url
        }
      }
    })

    // Note: ProjectActivity creation removed to prevent database errors

    return NextResponse.json({
      success: true,
      deployment: updatedDeployment
    })

  } catch (error) {
    console.error('Failed to trigger deployment:', error)
    return NextResponse.json(
      { error: 'Failed to trigger deployment' },
      { status: 500 }
    )
  }
}

async function simulateDeployment(deployment: any, project: any) {
  // Simulate deployment process with realistic timing
  const deploymentSteps = [
    { step: 'Building project', duration: 2000 },
    { step: 'Running tests', duration: 1500 },
    { step: 'Optimizing bundle', duration: 1000 },
    { step: 'Deploying to CDN', duration: 3000 }
  ]

  // Simulate each step
  for (const step of deploymentSteps) {
    await new Promise(resolve => setTimeout(resolve, step.duration))
  }

  // 95% success rate simulation
  const isSuccess = Math.random() > 0.05
  
  if (isSuccess) {
    const deploymentId = `deploy_${Date.now()}`
    const url = `https://${project.name.toLowerCase()}-${deployment.environment}.vercel.app`
    
    return {
      success: true,
      url,
      metadata: {
        deploymentId,
        steps: deploymentSteps,
        buildTime: deploymentSteps.reduce((acc, step) => acc + step.duration, 0),
        provider: 'vercel'
      }
    }
  } else {
    return {
      success: false,
      url: null,
      metadata: {
        error: 'Build failed during optimization step',
        steps: deploymentSteps.slice(0, 2),
        buildTime: deploymentSteps.slice(0, 2).reduce((acc, step) => acc + step.duration, 0)
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get recent deployments
    const deployments = await prisma.deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      deployments
    })

  } catch (error) {
    console.error('Failed to fetch deployments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    )
  }
}
