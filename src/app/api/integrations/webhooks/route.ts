import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET - Get webhook configuration for integrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrations = await prisma.integration.findMany({
      where: {
        userId: session.user.id,
        provider: { in: ['linear', 'jira'] }
      }
    })

    const webhooks = integrations.map(integration => ({
      id: integration.id,
      provider: integration.provider,
      webhookUrl: (integration.config as any)?.webhookUrl || null,
      enabled: (integration.config as any)?.webhookEnabled || false
    }))

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    )
  }
}

// POST - Configure webhook for integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { integrationId, webhookUrl, enabled } = await request.json()

    if (!integrationId || !webhookUrl) {
      return NextResponse.json(
        { error: 'Integration ID and webhook URL are required' },
        { status: 400 }
      )
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        userId: session.user.id
      }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    const config = integration.config as any || {}
    config.webhookUrl = webhookUrl
    config.webhookEnabled = enabled !== false

    await prisma.integration.update({
      where: { id: integrationId },
      data: { config }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error configuring webhook:', error)
    return NextResponse.json(
      { error: 'Failed to configure webhook' },
      { status: 500 }
    )
  }
}


