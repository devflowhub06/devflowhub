import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'

// GET /api/settings - Get user settings overview
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user settings, integrations, and API keys
    const [userSettings, integrations, apiKeys, notifications, billingUsage, memberships, teamMembers] = await Promise.all([
      prisma.userSettings.findUnique({
        where: { userId }
      }),
      prisma.integration.findMany({
        where: { userId },
        select: {
          id: true,
          provider: true,
          displayName: true,
          connectionState: true,
          lastTestedAt: true,
          errorMessage: true,
          scopes: true,
          createdAt: true
        }
      }),
      prisma.apiKey.findMany({
        where: { userId, revokedAt: null },
        select: {
          id: true,
          name: true,
          scope: true,
          lastUsedAt: true,
          lastUsedIp: true,
          createdAt: true
        }
      }),
      prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.billingUsage.findFirst({
        where: { userId },
        orderBy: { period: 'desc' }
      }),
      prisma.teamMember.findMany({
        where: { userId },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              description: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.teamMember.findMany({
        where: {
          team: {
            members: {
              some: { userId }
            }
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          team: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ])

    // Get user profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        plan: true,
        twoFactorEnabled: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      user,
      settings: userSettings,
      integrations,
      apiKeys,
      notifications,
      billingUsage,
      memberships,
      teamMembers
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
