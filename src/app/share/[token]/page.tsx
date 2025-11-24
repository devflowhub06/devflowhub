import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SharedWorkspaceView from '@/components/workspace/SharedWorkspaceView'

export default async function SharePage({
  params
}: {
  params: { token: string }
}) {
  const { token } = params

  // Find all projects and check for matching share token
  const projects = await prisma.project.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  const project = projects.find(p => {
    const context = p.context as any
    return context?.shareToken === token
  })

  if (!project) {
    notFound()
  }

  // Check if share is enabled and not expired
  const context = project.context as any
  if (!context?.shareEnabled) {
    notFound()
  }

  if (context?.shareTokenExpiresAt) {
    const expiresAt = new Date(context.shareTokenExpiresAt)
    if (expiresAt < new Date()) {
      notFound()
    }
  }

  return <SharedWorkspaceView project={project} shareToken={token} />
}

