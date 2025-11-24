import type { FastifyInstance } from 'fastify'

export function registerPreviewRoutes(server: FastifyInstance) {
  server.get('/preview/:workspaceId', async (request, reply) => {
    const { workspaceId } = request.params as { workspaceId: string }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    server.log.info({ workspaceId }, 'Preview stream opened (mock)')

    const send = (event: string, data: Record<string, unknown>) => {
      reply.raw.write(`event: ${event}\n`)
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    send('status', {
      state: 'awaiting-container',
      message: 'Dev server not running yet — waiting for workspace runtime.',
      timestamp: new Date().toISOString(),
    })

    const interval = setInterval(() => {
      send('heartbeat', { timestamp: new Date().toISOString() })
    }, 15000)

    request.socket.on('close', () => {
      clearInterval(interval)
      server.log.info({ workspaceId }, 'Preview stream closed')
    })

    return reply
  })
}

