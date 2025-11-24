import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'
import { z } from 'zod'

const preferencesUpdateSchema = z.object({
  defaultWorkspaceModule: z.enum(['editor', 'ui_studio', 'sandbox', 'deployer']).optional(),
  editorTheme: z.string().optional(),
  editorFontSize: z.number().min(8).max(32).optional(),
  editorTabSize: z.number().min(1).max(8).optional(),
  editorWordWrap: z.boolean().optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional()
})

// GET /api/settings/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Create default settings if they don't exist
    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({ settings: userSettings })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = preferencesUpdateSchema.parse(body)

    // Upsert user settings
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        ...validatedData
      }
    })

    // Track analytics event
    await trackAnalytics(session.user.id, 'preferences_updated', {
      updatedFields: Object.keys(validatedData)
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'preferences_updated',
        resourceType: 'user_settings',
        resourceId: updatedSettings.id,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          updatedFields: Object.keys(validatedData)
        }
      }
    })

    return NextResponse.json({ settings: updatedSettings })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
