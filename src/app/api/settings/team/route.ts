import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'
import { z } from 'zod'
import crypto from 'crypto'

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor')
})

// GET /api/settings/team - Get team information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's team memberships
    const teamMemberships = await prisma.teamMember.findMany({
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
    })

    // Get team members for teams where user is admin or owner
    const adminTeams = teamMemberships
      .filter(m => ['owner', 'admin'].includes(m.role))
      .map(m => m.teamId)

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: { in: adminTeams }
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

    return NextResponse.json({
      memberships: teamMemberships,
      teamMembers: teamMembers
    })
  } catch (error) {
    console.error('Error fetching team info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team information' },
      { status: 500 }
    )
  }
}

// POST /api/settings/team/invite - Invite team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role } = inviteMemberSchema.parse(body)

    // Check if user has permission to invite (admin or owner)
    const userMembership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        role: { in: ['owner', 'admin'] }
      }
    })

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite members' },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Check if user is already a member
      const existingMembership = await prisma.teamMember.findFirst({
        where: {
          teamId: userMembership.teamId,
          userId: existingUser.id
        }
      })

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a team member' },
          { status: 400 }
        )
      }

      // Add user to team
      const teamMember = await prisma.teamMember.create({
        data: {
          teamId: userMembership.teamId,
          userId: existingUser.id,
          role,
          invitedBy: session.user.id,
          acceptedAt: new Date()
        }
      })

      // Track analytics event
      await trackAnalytics(session.user.id, 'team_member_added', {
        teamId: userMembership.teamId,
        memberId: existingUser.id,
        role
      })

      return NextResponse.json({
        success: true,
        member: {
          id: teamMember.id,
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            image: existingUser.image
          },
          role: teamMember.role,
          acceptedAt: teamMember.acceptedAt
        }
      })
    } else {
      // Create invitation token for new user
      const inviteToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

      // Store invitation (in production, use a separate invitations table)
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'team_invite_sent',
          resourceType: 'team',
          resourceId: userMembership.teamId,
          metadata: {
            email,
            role,
            inviteToken,
            expiresAt: expiresAt.toISOString()
          }
        }
      })

      // Track analytics event
      await trackAnalytics(session.user.id, 'team_invite_sent', {
        teamId: userMembership.teamId,
        email,
        role
      })

      // In production, send email with invitation link
      const inviteUrl = `${process.env.NEXTAUTH_URL}/invite?token=${inviteToken}`

      return NextResponse.json({
        success: true,
        inviteUrl,
        message: 'Invitation sent successfully'
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error inviting team member:', error)
    return NextResponse.json(
      { error: 'Failed to invite team member' },
      { status: 500 }
    )
  }
}
