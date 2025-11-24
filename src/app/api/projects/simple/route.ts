import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'

// POST /api/projects/simple - Simplified project creation for testing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      type, 
      language, 
      framework,
      selectedTool
    } = body

    if (!name || !type || !language) {
      return NextResponse.json({ error: 'Name, type, and language are required' }, { status: 400 })
    }

    // Create the project with current schema
    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        type,
        language,
        framework: framework || null,
        selectedTool,
        complexity: 'medium',
        status: 'active',
        userId: session.user.id,
        activeTool: 'SANDBOX',
        context: {
          files: [],
          requirements: [],
          codeSnippets: [],
          designDecisions: [],
          createdAt: new Date().toISOString(),
          createdBy: session.user.email,
          version: '1.0.0'
        }
      }
    })

    // Track analytics
    await trackAnalytics(session.user.id, 'project_created', {
      projectId: project.id,
      template: 'blank',
      language,
      framework: framework || null,
      createdAt: new Date().toISOString()
    })

    // Create initial activity
    await prisma.projectActivity.create({
      data: {
        projectId: project.id,
        type: 'project_created',
        description: `Project "${name}" created successfully`,
        metadata: {
          type,
          language,
          framework: framework || null
        }
      }
    })

    // Mark onboarding completion for first project creation
    await prisma.onboardingProgress.upsert({
      where: { userId: session.user.id },
      update: { createdFirstProject: true },
      create: { 
        userId: session.user.id,
        createdFirstProject: true 
      }
    })

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        language: project.language,
        framework: project.framework,
        status: project.status,
        createdAt: project.createdAt
      },
      workspaceUrl: `/dashboard/projects/${project.id}/workspace?module=editor`
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
