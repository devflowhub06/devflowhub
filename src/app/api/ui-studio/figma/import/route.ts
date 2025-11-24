import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FigmaAdapter } from '@/lib/ui-studio/figmaAdapter'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      projectId,
      figmaToken,
      fileId,
      frameId
    } = await request.json()

    // Validate required fields
    if (!figmaToken || !fileId || !frameId) {
      return NextResponse.json({ 
        error: 'Missing required fields: figmaToken, fileId, frameId' 
      }, { status: 400 })
    }

    // Validate project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, name: true }
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Create generation job
    const job = await prisma.uIGenerationJob.create({
      data: {
        projectId,
        userId: session.user.id,
        prompt: `Figma import from file ${fileId}, frame ${frameId}`,
        status: 'queued',
        estimatedCost: 0.25 // Higher cost for Figma imports
      }
    })

    try {
      // Import from Figma and generate component
      const result = await FigmaAdapter.importFrame({
        figmaToken,
        fileId,
        frameId,
        projectId,
        userId: session.user.id
      })

      // Update job with results
      await prisma.uIGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          result: result,
          actualCost: 0.25,
          tokensUsed: Math.floor(result.code?.length * 1.5 || 2000),
          processingTime: Date.now() - job.createdAt.getTime()
        }
      })

      // Save to component library
      try {
        await prisma.componentLibraryEntry.create({
          data: {
            name: result.name,
            description: `Figma-imported ${result.name} component`,
            category: 'Figma Import',
            tags: ['figma', 'imported', result.name.toLowerCase()],
            code: result.code,
            props: result.props,
            variants: result.variants,
            previewHtml: result.previewHtml,
            story: result.story,
            test: result.test,
            projectId: projectId,
            createdBy: session.user.id,
            visibility: 'project'
          }
        })
      } catch (libraryError) {
        console.warn('Failed to save to component library:', libraryError)
        // Continue anyway
      }

      return NextResponse.json({
        jobId: job.id,
        status: 'completed',
        result,
        estimatedCost: 0.25
      })

    } catch (error) {
      // Update job with error
      await prisma.uIGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: (error as Error).message
        }
      })

      return NextResponse.json({
        jobId: job.id,
        status: 'failed',
        error: 'Figma import failed',
        details: (error as Error).message
      })
    }

  } catch (error) {
    console.error('Figma import API error:', error)
    return NextResponse.json(
      { error: 'Failed to import from Figma', details: (error as Error).message },
      { status: 500 }
    )
  }
}
