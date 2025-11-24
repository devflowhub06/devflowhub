import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Replit create API called')
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const { projectId, name, language, description } = body

    if (!projectId) {
      console.log('❌ No projectId provided')
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    console.log('🔍 Looking for project:', projectId, 'for user:', session.user.id)
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

    // Create Replit project via API (simulated for now, but ready for real integration)
    const replitProject = {
      id: `repl_${Date.now()}`,
      name: name || `${project.name}-repl`,
      language: language || 'javascript',
      description: description || 'DevFlowHub Replit workspace',
      url: `https://replit.com/@devflowhub/${name || project.name}-repl`,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save to database
    const replitIntegration = await prisma.replitIntegration.upsert({
      where: { projectId },
      update: {
        replId: replitProject.id,
        replUrl: replitProject.url,
        embedUrl: replitProject.url,
        status: 'ready',
        updatedAt: new Date()
      },
      create: {
        projectId,
        replId: replitProject.id,
        replUrl: replitProject.url,
        embedUrl: replitProject.url,
        status: 'ready'
      }
    })

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: 'REPLIT',
        action: 'create_project',
        metadata: {
          projectName: replitProject.name,
          language: replitProject.language,
          success: true
        }
      }
    })

    return NextResponse.json({
      ok: true,
      replit: replitIntegration,
      project: replitProject,
      replUrl: replitProject.url,
      embedUrl: replitProject.url
    })

  } catch (error) {
    console.error('Failed to create Replit project:', error)
    return NextResponse.json(
      { error: 'Failed to create Replit project' },
      { status: 500 }
    )
  }
}