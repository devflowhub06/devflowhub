import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'
import { z } from 'zod'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scope: z.array(z.string()).default(['read'])
})

// GET /api/settings/api-keys - Get user API keys
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { 
        userId: session.user.id,
        revokedAt: null 
      },
      select: {
        id: true,
        name: true,
        scope: true,
        lastUsedAt: true,
        lastUsedIp: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

// POST /api/settings/api-keys - Create new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, scope } = createApiKeySchema.parse(body)

    // Generate API key
    const rawKey = `dfh_${crypto.randomBytes(32).toString('hex')}`
    const keyHash = await bcrypt.hash(rawKey, 12)

    // Create API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash,
        scope: scope as any
      },
      select: {
        id: true,
        name: true,
        scope: true,
        createdAt: true
      }
    })

    // Track analytics event
    await trackAnalytics(session.user.id, 'api_key_created', {
      apiKeyId: apiKey.id,
      scope: scope
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'api_key_created',
        resourceType: 'api_key',
        resourceId: apiKey.id,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          name,
          scope
        }
      }
    })

    return NextResponse.json({ 
      apiKey: {
        ...apiKey,
        rawKey // Only returned once during creation
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}
