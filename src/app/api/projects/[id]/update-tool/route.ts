import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { toDbEnum } from '@/lib/tools/tool-mapping'
import { completeOnboardingStep } from '@/lib/services/onboarding'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const { activeTool } = await request.json()

    if (!activeTool) {
      return NextResponse.json({ error: 'Active tool is required' }, { status: 400 })
    }

    // Accept branded module ids or provider/db enums and map to DB enum
    const dbEnum = ((): string | null => {
      if (['SANDBOX','EDITOR','UI_STUDIO','DEPLOYER'].includes(activeTool)) return activeTool
      const mapped = toDbEnum(activeTool)
      return mapped
    })()
    if (!dbEnum) {
      return NextResponse.json({ error: 'Invalid tool type' }, { status: 400 })
    }

    // First verify the project exists and belongs to the user
    const existingProject = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!existingProject) {
      return NextResponse.json({ 
        error: 'Project not found or access denied' 
      }, { status: 404 })
    }

    // Update project active tool
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { activeTool: dbEnum as any },
      include: {
        user: true,
        replit: true,
        cursorWs: true,
        v0: true,
        bolt: true
      }
    })

    // Mark onboarding: connectedIntegration
    await prisma.onboardingProgress.upsert({
      where: { userId: session.user.id },
      update: { connectedIntegration: true },
      create: { 
        userId: session.user.id,
        connectedIntegration: true 
      }
    })

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: (dbEnum as string).toLowerCase() as any,
        action: 'update_active_tool',
        metadata: { activeTool: dbEnum }
      }
    })

    return NextResponse.json({
      success: true,
      project: updatedProject
    })

  } catch (error) {
    console.error('Error updating project active tool:', error)
    return NextResponse.json(
      { error: 'Failed to update active tool' },
      { status: 500 }
    )
  }
}
