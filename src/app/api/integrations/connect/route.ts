import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import IntegrationManager from '@/lib/services/integration-manager'

const integrationManager = new IntegrationManager()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tool, apiKey } = await request.json()

    if (!tool || !apiKey) {
      return NextResponse.json(
        { error: 'Tool and API key are required' },
        { status: 400 }
      )
    }

    let isConnected = false

    switch (tool) {
      case 'cursor':
        isConnected = await integrationManager.connectCursor(apiKey)
        break
      case 'replit':
        isConnected = await integrationManager.connectReplit(apiKey)
        break
      case 'v0':
        // TODO: Implement v0 integration
        return NextResponse.json(
          { error: 'v0 integration not yet implemented' },
          { status: 501 }
        )
      case 'bolt':
        // TODO: Implement bolt integration
        return NextResponse.json(
          { error: 'Bolt integration not yet implemented' },
          { status: 501 }
        )
      default:
        return NextResponse.json(
          { error: 'Unsupported tool' },
          { status: 400 }
        )
    }

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: `Successfully connected to ${tool}`,
        tool,
        lastSync: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        { error: `Failed to connect to ${tool}. Please check your API key.` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Integration connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to tool' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connections = await integrationManager.checkAllConnections()
    
    return NextResponse.json({
      connections,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Integration status error:', error)
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    )
  }
} 