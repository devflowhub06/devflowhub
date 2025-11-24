import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import IntegrationManager from '@/lib/services/integration-manager'

// POST /api/tools/route - Smart tool routing recommendation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectType, language, framework, complexity, goals, requirements } = body

    // Use the enhanced Integration Manager for smart tool recommendation
    const integrationManager = new IntegrationManager()
    
    // Convert goals to requirements format if needed
    const allRequirements = requirements || goals || []
    
    // Get the recommended tool using the enhanced logic
    const recommendedTool = integrationManager.getRecommendedTool(projectType, allRequirements)
    
    // Generate appropriate workflow based on the recommended tool
    let workflow: string[] = []
    let estimatedTimeline = '2-3 days'
    
    // Map provider to branded module identifiers
    const providerToModule = (p: string) => ({ cursor: 'editor', replit: 'sandbox', v0: 'ui-studio', bolt: 'deployer' } as any)[p] || p

    switch (recommendedTool) {
      case 'cursor':
        workflow = ['editor', 'ui-studio']
        estimatedTimeline = '1-2 days'
        break
      case 'replit':
        workflow = ['sandbox', 'editor']
        estimatedTimeline = '1-3 days'
        break
      case 'v0':
        workflow = ['ui-studio', 'editor', 'deployer']
        estimatedTimeline = '2-4 days'
        break
      case 'bolt':
        workflow = ['editor', 'ui-studio', 'deployer']
        estimatedTimeline = '3-5 days'
        break
    }

    return NextResponse.json({
      recommendedTool: providerToModule(recommendedTool),
      workflow,
      estimatedTimeline,
      reasoning: `Recommended ${providerToModule(recommendedTool)} for ${projectType} project with requirements: ${allRequirements.join(', ')}`
    })
  } catch (error) {
    console.error('Tool recommendation error:', error)
    return NextResponse.json({ error: 'Failed to get tool recommendation' }, { status: 500 })
  }
}

// POST /api/tools/sync - Sync context between tools
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { projectId, tool, context } = body

    // Update project context
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        context: {
          ...context,
          lastSyncedTool: tool,
          lastSyncedAt: new Date().toISOString(),
        },
      },
    })

    // Create activity record
    await prisma.projectActivity.create({
      data: {
        type: 'context_sync',
        projectId,
        description: `Context synced to ${tool}`,
        metadata: {
          tool,
          lastSyncedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync context' }, { status: 500 })
  }
}

// GET /api/tools/status - Check tool integration status
export async function GET() {
  try {
    // In a real implementation, this would check the actual status of each tool integration
    const tools = [
      { id: 'sandbox', name: 'DevFlowHub Sandbox', status: 'connected' },
      { id: 'editor', name: 'DevFlowHub Editor', status: 'available' },
      { id: 'ui-studio', name: 'DevFlowHub UI Studio', status: 'available' },
      { id: 'deployer', name: 'DevFlowHub Deployer', status: 'available' },
    ]

    return NextResponse.json(tools)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get tool status' }, { status: 500 })
  }
} 