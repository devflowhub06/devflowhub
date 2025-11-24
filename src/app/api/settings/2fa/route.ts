import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'
import { z } from 'zod'
import crypto from 'crypto'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

const enable2FASchema = z.object({
  secret: z.string().optional(),
  token: z.string().length(6).optional()
})

// GET /api/settings/2fa - Get 2FA status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    })

    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false,
      hasSecret: !!user?.twoFactorSecret
    })
  } catch (error) {
    console.error('Error fetching 2FA status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch 2FA status' },
      { status: 500 }
    )
  }
}

// POST /api/settings/2fa/enable - Start 2FA setup
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { secret, token } = enable2FASchema.parse(body)

    // If no secret provided, generate a new one
    if (!secret) {
      const newSecret = authenticator.generateSecret()
      const serviceName = 'DevFlowHub'
      const accountName = session.user.email || 'user'

      const otpauthUrl = authenticator.keyuri(accountName, serviceName, newSecret)
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl)

      return NextResponse.json({
        secret: newSecret,
        qrCodeUrl,
        manualEntryKey: newSecret
      })
    }

    // If token provided, verify and enable 2FA
    if (token) {
      const isValid = authenticator.verify({
        token,
        secret
      })

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        )
      }

      // Enable 2FA for user
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: secret
        }
      })

      // Track analytics event
      await trackAnalytics(session.user.id, '2fa_enabled', {})

      // Log audit event
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2fa_enabled',
          resourceType: 'user',
          resourceId: session.user.id,
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error enabling 2FA:', error)
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    )
  }
}

// DELETE /api/settings/2fa - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Disable 2FA for user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    })

    // Track analytics event
    await trackAnalytics(session.user.id, '2fa_disabled', {})

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: '2fa_disabled',
        resourceType: 'user',
        resourceId: session.user.id,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}
