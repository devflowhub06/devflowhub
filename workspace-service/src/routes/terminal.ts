import type { FastifyInstance } from 'fastify'
import type { FastifyWebsocket } from '@fastify/websocket'

export function registerTerminalRoutes(server: FastifyInstance) {
  server.register(async (instance) => {
    instance.get(
      '/terminal/:workspaceId',
      { websocket: true },
      (connection, req) => {
        const { workspaceId } = req.params as { workspaceId: string }
        instance.log.info({ workspaceId }, 'Terminal client connected (mock)')

        connection.socket.send(
          JSON.stringify({
            type: 'info',
            message: `Workspace ${workspaceId} terminal bridge not provisioned yet.`,
          })
        )

        connection.socket.on('message', (message: Buffer) => {
          const text = message.toString()
          instance.log.debug({ workspaceId, text }, 'Terminal input (echo)')

          connection.socket.send(
            JSON.stringify({
              type: 'echo',
              message: text,
            })
          )
        })

        connection.socket.on('close', () => {
          instance.log.info({ workspaceId }, 'Terminal connection closed')
        })
      }
    )
  })
}

