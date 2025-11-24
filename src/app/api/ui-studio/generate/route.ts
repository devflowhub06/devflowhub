import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UIStudioService } from '@/lib/ui-studio/service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Demo mode: allow requests without authentication for testing
    const demoMode = process.env.NODE_ENV === 'development' && request.headers.get('x-demo-mode') === 'true'
    
    if (!session?.user?.id && !demoMode) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      projectId,
      prompt,
      variants = 3,
      styleHints = {},
      themeHints = {},
      previewOnly = false
    } = await request.json()

    // Guard: ensure OPENAI_API_KEY exists when not in demo mode
    if (!process.env.OPENAI_API_KEY && !demoMode) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is missing in server env' }, { status: 500 })
    }

    // Basic prompt length limit to reduce API errors from extremely long inputs
    const safePrompt = String(prompt || '').slice(0, 6000)
    
    // Debug visibility (safe preview only)
    console.log('UI Studio: starting generation', {
      hasKey: !!process.env.OPENAI_API_KEY,
      userId: session?.user?.id,
      projectId,
      variants,
      promptPreview: safePrompt.slice(0, 80)
    })

    // Validate project access (skip in demo mode)
    let project
    if (demoMode) {
      // Use mock project data for demo mode
      project = {
        id: projectId,
        userId: 'demo-user',
        framework: 'nextjs',
        files: []
      }
    } else {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { 
          id: true, 
          userId: true, 
          framework: true,
          files: {
            where: { path: { contains: 'tailwind' } },
            select: { content: true, path: true }
          }
        }
      })

      if (!project || project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
    }

    // Estimate cost before processing
    const estimatedCost = UIStudioService.estimateGenerationCost(prompt, variants)
    
    // Check user quota (skip in demo mode)
    if (!demoMode) {
      const userQuota = await UIStudioService.checkUserQuota(session.user.id)
      if (userQuota.exceeded) {
        return NextResponse.json({ 
          error: 'Quota exceeded', 
          quota: userQuota 
        }, { status: 429 })
      }
    }

    // Create generation job (skip in demo mode)
    let job
    if (demoMode) {
      job = {
        id: `demo-job-${Date.now()}`,
        projectId,
        userId: 'demo-user',
        prompt,
        status: 'queued',
        estimatedCost
      }
    } else {
      job = await prisma.uIGenerationJob.create({
        data: {
          projectId,
          userId: session.user.id,
          prompt,
          status: 'queued',
          estimatedCost
        }
      })
    }

    // Process generation (in background for production)
    if (previewOnly || estimatedCost < 0.50) {
      // Process immediately for small requests
      try {
        const result = await UIStudioService.generateComponent({
          projectId,
          prompt: safePrompt,
          variants,
          styleHints,
          themeHints,
          projectContext: {
            framework: project.framework,
            tailwindConfig: UIStudioService.extractTailwindConfig(project.files)
          }
        })

        // Ensure result is JSON-serializable for Prisma Json column
        const jsonReplacer = (_key: string, value: any) => {
          if (typeof value === 'function') return '[Function]'
          if (typeof value === 'bigint') return value.toString()
          if (value === undefined) return null
          // Handle Map/Set defensively
          if (value instanceof Map) return Object.fromEntries(value as any)
          if (value instanceof Set) return Array.from(value as any)
          return value
        }
        const dbSafeResult = JSON.parse(JSON.stringify(result, jsonReplacer))

        if (!demoMode) {
          await prisma.uIGenerationJob.update({
            where: { id: job.id },
            data: {
              status: 'completed',
              result: dbSafeResult,
              actualCost: result.actualCost,
              tokensUsed: result.tokensUsed,
              processingTime: result.processingTime
            }
          })
        }

        return NextResponse.json({
          jobId: job.id,
          status: 'completed',
          result: dbSafeResult,
          estimatedCost
        })

      } catch (error) {
        if (!demoMode) {
          await prisma.uIGenerationJob.update({
            where: { id: job.id },
            data: {
              status: 'failed',
              error: (error as Error).message
            }
          })
        }

        return NextResponse.json({
          jobId: job.id,
          status: 'failed',
          error: (error as Error).message || 'Component generation failed',
          estimatedCost
        }, { status: 500 })
      }
    } else {
      // Queue for background processing
      // TODO: Add to BullMQ queue for heavy jobs
      return NextResponse.json({
        jobId: job.id,
        status: 'queued',
        estimatedCost,
        message: 'Generation queued - poll for results'
      })
    }

  } catch (error) {
    console.error('UI Studio generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate component', details: (error as Error).message },
      { status: 500 }
    )
  }
}
