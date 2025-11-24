import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { ensureWorkspace } from '@/lib/projects'

// Import the sessions map from session route
// In production, this should be a shared store (Redis, database, etc.)
// For now, we'll need to access it differently

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  if (!projectId) {
    return new Response('Project ID required', { status: 400 })
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const sessionId = `${projectId}-${session.user.id}`

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`))

      // Poll for terminal output
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/terminal/session?projectId=${projectId}`,
            {
              headers: {
                Cookie: request.headers.get('cookie') || ''
              }
            }
          )

          if (response.ok) {
            const data = await response.json()
            if (data.output && data.output.length > 0) {
              const newOutput = data.output.slice(-10).join('')
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'output', data: newOutput })}\n\n`))
            }
            
            // Detect ports in output
            const portMatch = data.output?.join('').match(/localhost:(\d+)|:\/\/localhost:(\d+)|port\s+(\d+)/i)
            if (portMatch) {
              const port = portMatch[1] || portMatch[2] || portMatch[3]
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'port', port: parseInt(port) })}\n\n`))
            }
          }
        } catch (error) {
          console.error('SSE polling error:', error)
        }
      }, 500) // Poll every 500ms

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

