import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { workspaceStore } from '../services/workspace-store'

export function registerWorkspaceRoutes(server: FastifyInstance) {
  server.post(
    '/workspaces',
    {
      schema: {
        body: z
          .object({
            projectId: z.string(),
            template: z.string().default('node'),
            ttlMinutes: z.number().int().min(5).max(12 * 60).default(120),
          })
          .strict(),
      },
    },
    async (request, reply) => {
      const body = request.body as { projectId: string; template: string; ttlMinutes: number }
      const workspace = workspaceStore.create(body.projectId, {
        template: body.template,
        ttlMinutes: body.ttlMinutes,
      })

      request.log.info({ workspace }, 'Workspace created (mock)')
      return reply.code(201).send(workspace)
    }
  )

  server.get(
    '/workspaces/:id',
    {
      schema: {
        params: z.object({ id: z.string() }).strict(),
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const workspace = workspaceStore.get(id)

      if (!workspace) {
        return reply.code(404).send({ error: 'Workspace not found' })
      }

      return workspace
    }
  )

  server.delete(
    '/workspaces/:id',
    {
      schema: {
        params: z.object({ id: z.string() }).strict(),
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      workspaceStore.delete(id)
      return reply.code(204).send()
    }
  )
}

