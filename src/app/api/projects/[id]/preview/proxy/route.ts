import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Shared preview sessions store (in production, use Redis or database)
// This will be imported from the parent route in a real implementation
// For now, we'll use a simple approach - check via API

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get preview session from parent route
    const previewResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/projects/${projectId}/preview`,
      {
        headers: {
          Cookie: request.headers.get('cookie') || ''
        }
      }
    )

    if (!previewResponse.ok) {
      return new NextResponse('Preview not available. Start your project first.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    const previewData = await previewResponse.json()
    
    if (!previewData.running) {
      return new NextResponse('Preview not available. Start your project first.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Proxy request to the running application
    const targetUrl = `http://localhost:${previewData.port}${request.nextUrl.search || ''}`
    
    try {
      const proxyResponse = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'host': `localhost:${previewSession.port}`
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' 
          ? await request.text() 
          : undefined
      })

      const contentType = proxyResponse.headers.get('content-type') || 'text/html'
      const body = await proxyResponse.text()

      return new NextResponse(body, {
        status: proxyResponse.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
    } catch (proxyError: any) {
      console.error('Proxy error:', proxyError)
      return new NextResponse(
        `Failed to connect to preview server. Make sure your project is running on port ${previewData.port}.`,
        {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        }
      )
    }

  } catch (error) {
    console.error('Preview proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy preview' },
      { status: 500 }
    )
  }
}

