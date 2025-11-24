import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import cors from '@fastify/cors'
import { z } from 'zod'

import { registerWorkspaceRoutes } from './routes/workspaces'
import { registerTerminalRoutes } from './routes/terminal'
import { registerPreviewRoutes } from './routes/preview'

const PORT = Number(process.env.PORT || 8080)
const HOST = process.env.HOST || '0.0.0.0'

async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          }
        : undefined,
    },
  })

  await server.register(cors, {
    origin: true,
    credentials: true,
  })

  await server.register(websocket)

  // Health checks
  server.get('/healthz', async () => ({ status: 'ok', time: new Date().toISOString() }))
  server.get('/version', async () => ({
    name: 'devflowhub-workspace-service',
    version: process.env.npm_package_version || '0.0.0',
    node: process.version,
  }))

  // Routes
  registerWorkspaceRoutes(server)
  registerTerminalRoutes(server)
  registerPreviewRoutes(server)

  return server
}

async function start() {
  const server = await buildServer()

  try {
    await server.listen({ port: PORT, host: HOST })
    server.log.info(`Workspace service running on http://${HOST}:${PORT}`)
  } catch (err) {
    server.log.error(err, 'Failed to start workspace service')
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start()
}

export { buildServer }

