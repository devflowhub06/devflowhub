import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { FeedbackData } from '@/lib/feedback'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const feedbackData: FeedbackData = body

    // Validate required fields
    if (!feedbackData.type || !feedbackData.title || !feedbackData.description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, description' },
        { status: 400 }
      )
    }

    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        type: feedbackData.type,
        title: feedbackData.title,
        description: feedbackData.description,
        priority: feedbackData.priority,


        userId: session?.user?.id || null,
        status: 'open',
      },
    })

    // Log activity if user is authenticated
    if (session?.user?.id) {
      await prisma.projectActivity.create({
        data: {
          projectId: 'general',
          type: 'feedback_submitted',
          description: `Feedback submitted: ${feedbackData.type}`,
          metadata: {
            feedbackId: feedback.id,
            type: feedbackData.type,
            priority: feedbackData.priority,
          },
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      id: feedback.id,
      message: 'Feedback submitted successfully' 
    })

  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's feedback submissions
    const feedback = await prisma.feedback.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        priority: true,

        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ feedback })

  } catch (error) {
    console.error('Feedback retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve feedback' },
      { status: 500 }
    )
  }
} 