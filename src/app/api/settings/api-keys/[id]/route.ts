import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'

// DELETE /api/settings/api-keys/[id] - Revoke API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeyId = params.id

    // Verify the API key belongs to the user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId: session.user.id,
        revokedAt: null
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Revoke the API key
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { revokedAt: new Date() }
    })

    // Track analytics event
    await trackAnalytics(session.user.id, 'api_key_revoked', {
      apiKeyId: apiKey.id
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'api_key_revoked',
        resourceType: 'api_key',
        resourceId: apiKey.id,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          name: apiKey.name
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking API key:', error)
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    )
  }
}
