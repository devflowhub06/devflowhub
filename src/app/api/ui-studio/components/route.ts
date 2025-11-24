import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true }
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Build where clause
    const where: any = {
      OR: [
        { projectId: projectId },
        { visibility: 'public' }
      ]
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    if (category && category !== 'All') {
      where.category = category
    }

    if (tags) {
      const tagArray = tags.split(',')
      where.tags = { hasSome: tagArray }
    }

    // Get components
    const components = await prisma.componentLibraryEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        code: true,
        props: true,
        variants: true,
        previewHtml: true,
        story: true,
        test: true,
        projectId: true,
        createdBy: true,
        visibility: true,
        version: true,
        downloads: true,
        likes: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(components)

  } catch (error) {
    console.error('Components API error:', error)
    return NextResponse.json(
      { error: 'Failed to get components', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      projectId,
      name,
      description,
      category,
      tags,
      code,
      props,
      variants,
      previewHtml,
      story,
      test,
      visibility = 'project'
    } = await request.json()

    if (!projectId || !name || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true }
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Create component
    const component = await prisma.componentLibraryEntry.create({
      data: {
        name,
        description,
        category: category || 'Custom',
        tags: tags || [],
        code,
        props: props || {},
        variants: variants || [],
        previewHtml,
        story,
        test,
        projectId,
        createdBy: session.user.id,
        visibility
      }
    })

    return NextResponse.json(component)

  } catch (error) {
    console.error('Create component API error:', error)
    return NextResponse.json(
      { error: 'Failed to create component', details: (error as Error).message },
      { status: 500 }
    )
  }
}