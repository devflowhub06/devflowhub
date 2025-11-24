import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { templates } from '@/lib/templates'
import { scaffoldProject } from '@/lib/scaffold'

// Route handler for /api/projects/analytics
export const dynamic = 'force-dynamic';

// Helper function to convert lowercase tool names to Prisma ToolType enum
function toToolType(tool: string | null): 'EDITOR' | 'SANDBOX' | 'UI_STUDIO' | 'DEPLOYER' {
  if (!tool) return 'EDITOR'
  const toolMap: Record<string, 'EDITOR' | 'SANDBOX' | 'UI_STUDIO' | 'DEPLOYER'> = {
    'editor': 'EDITOR',
    'sandbox': 'SANDBOX',
    'ui-studio': 'UI_STUDIO',
    'deployer': 'DEPLOYER',
    'EDITOR': 'EDITOR',
    'SANDBOX': 'SANDBOX',
    'UI_STUDIO': 'UI_STUDIO',
    'DEPLOYER': 'DEPLOYER'
  }
  return toolMap[tool.toLowerCase()] || 'EDITOR'
}

// GET /api/projects
export async function GET(request: Request) {
  // If the request is for /api/projects/analytics, delegate to GET_analytics
  if (new URL(request.url).pathname.endsWith('/api/projects/analytics')) {
    return GET_analytics(request);
  }
  // Otherwise, use the original GET for /api/projects
  const session = await getServerSession(authOptions)
  
  // Debug logging
  console.log('Projects API - Session check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    sessionUser: session?.user,
    cookies: request.headers.get('cookie')?.substring(0, 100)
  })
  
  if (!session?.user?.id) {
    console.log('Projects API - No session, returning empty projects list')
    return NextResponse.json({ 
      projects: [],
      totalCount: 0,
      page: 1,
      totalPages: 0,
      hasMore: false
    })
  }

  // Pagination
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '6', 10) // Reduced default limit
  const skip = (page - 1) * limit

  try {
    console.log('Projects API - Fetching projects for user:', session.user.id)
    
    // Optimized query with only necessary fields
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        type: true,
        selectedTool: true,
        createdAt: true,
        updatedAt: true,
        // Only select essential fields to reduce payload
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    console.log('Projects API - Found projects:', projects.length)
    
    // Add cache headers for better performance
    const response = NextResponse.json({ projects })
    response.headers.set('Cache-Control', 'private, max-age=60') // Cache for 1 minute
    return response
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Enhanced project creation with scaffolding
export async function POST(request: Request) {
  try {
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not configured')
      return NextResponse.json({ 
        error: 'Database configuration error',
        details: 'DATABASE_URL environment variable is missing'
      }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    console.log("SESSION IN PROJECT CREATE:", session);
    
    // Allow unauthenticated users to create temporary projects
    if (!session?.user?.id) {
      console.log("Creating temporary project for unauthenticated user")
      
      const body = await request.json()
      const { 
        name, 
        description, 
        type, 
        selectedTool, 
        language, 
        templateId,
        framework,
        template = 'blank',
        useAiScaffolding = false
      } = body

      if (!name || !type || !language) {
        return NextResponse.json({ error: 'Name, type, and language are required' }, { status: 400 })
      }

      // Try to create a temporary project in database, fallback to in-memory if database fails
      try {
        const tempProject = await prisma.project.create({
          data: {
            name,
            description: description || '',
            type,
            language,
            framework: framework || null,
            template: templateId ? templateId : template,
            selectedTool,
            complexity: 'medium',
            status: 'created',
            userId: 'temp_' + Date.now(),
            activeTool: toToolType(selectedTool),
            context: {
              files: [],
              requirements: [],
              codeSnippets: [],
              designDecisions: [],
              useAiScaffolding,
              createdAt: new Date().toISOString(),
              createdBy: 'anonymous',
              version: '1.0.0',
              isTemporary: true
            }
          }
        })

        return NextResponse.json({
          project: tempProject,
          workspaceUrl: `/dashboard/projects/${tempProject.id}/workspace?module=editor`,
          isTemporary: true,
          message: 'Project created successfully. Please sign up to save your project.'
        })
      } catch (dbError) {
        console.log('Database not available, creating in-memory project:', dbError)
        
        // Create a mock project object for demo purposes
        const mockProject = {
          id: 'demo_' + Date.now(),
          name,
          description: description || '',
          type,
          language,
          framework: framework || null,
          template: templateId ? templateId : template,
          selectedTool,
          complexity: 'medium',
          status: 'created',
          userId: 'temp_' + Date.now(),
          activeTool: 'SANDBOX',
          context: {
            files: [],
            requirements: [],
            codeSnippets: [],
            designDecisions: [],
            useAiScaffolding,
            createdAt: new Date().toISOString(),
            createdBy: 'anonymous',
            version: '1.0.0',
            isTemporary: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        return NextResponse.json({
          project: mockProject,
          workspaceUrl: `/dashboard/projects/${mockProject.id}/workspace?module=editor`,
          isTemporary: true,
          isDemo: true,
          message: 'Demo project created successfully. Please sign up to save your project permanently.'
        })
      }
    }

    const body = await request.json()
    console.log("Received project creation request body:", body)
    const { 
      name, 
      description, 
      type, 
      selectedTool, 
      language, 
      templateId,
      framework,
      template = 'blank', // Default to blank for start from scratch
      useAiScaffolding = false
    } = body

    if (!name || !type || !language) {
      return NextResponse.json({ error: 'Name, type, and language are required' }, { status: 400 })
    }

    // Test database connection
    try {
      await prisma.$connect()
      console.log("Database connection successful")
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to the database'
      }, { status: 500 })
    }

    // Create the project with enhanced fields
    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        type,
        language,
        framework: framework || null,
        template: templateId ? templateId : template,
        selectedTool,
        complexity: 'medium',
        status: 'created',
        userId: session.user.id,
        activeTool: toToolType(selectedTool),
        context: {
          files: [],
          requirements: [],
          codeSnippets: [],
          designDecisions: [],
          useAiScaffolding,
          createdAt: new Date().toISOString(),
          createdBy: session.user.email,
          version: '1.0.0'
        }
      }
    })

    console.log("Project created successfully:", project.id)
    
    // Scaffold the project (create files, init git, etc.)
    try {
      const scaffoldResult = await scaffoldProject(project.id, {
        name,
        language,
        framework: framework || null,
        template: templateId ? templateId : template,
        useAiScaffolding
      })

      // Update project with scaffold results
      await prisma.project.update({
        where: { id: project.id },
        data: {
          status: 'scaffolded',
          repoPath: scaffoldResult.path,
          repoCommit: scaffoldResult.commitHash
        }
      })

      // Track analytics (non-blocking)
      try {
        await prisma.analyticsEvent.create({
          data: {
            eventName: 'project_created',
            eventType: 'user_action',
            userId: session.user.id,
            projectId: project.id,
            metadata: {
              template: templateId ? templateId : template,
              language,
              framework: framework || null,
              useAiScaffolding,
              createdAt: new Date().toISOString()
            }
          }
        })
      } catch (analyticsError) {
        console.error('Analytics tracking failed (non-critical):', analyticsError)
      }

      // Create initial activity (non-blocking)
      try {
        await prisma.projectActivity.create({
          data: {
            projectId: project.id,
            type: 'project_created',
            description: `Project "${name}" created and scaffolded successfully`,
            metadata: {
              type,
              language,
              framework: framework || null,
              template: templateId ? templateId : template,
              repoPath: scaffoldResult.path,
              commitHash: scaffoldResult.commitHash
            }
          }
        })
      } catch (activityError) {
        console.error('Project activity creation failed (non-critical):', activityError)
      }

      // Mark onboarding completion (non-blocking)
      try {
        await prisma.onboardingProgress.upsert({
          where: { userId: session.user.id },
          update: { createdFirstProject: true },
          create: { 
            userId: session.user.id,
            createdFirstProject: true 
          }
        })
      } catch (onboardingError) {
        console.error('Onboarding progress update failed (non-critical):', onboardingError)
      }
      
      return NextResponse.json({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          type: project.type,
          language: project.language,
          framework: project.framework,
          status: 'scaffolded',
          createdAt: project.createdAt
        },
        workspaceUrl: `/dashboard/projects/${project.id}/workspace?module=editor`
      })
    } catch (scaffoldError) {
      console.error('Scaffolding failed:', scaffoldError)
      
      // Rollback project creation (best-effort)
      try {
        await prisma.project.delete({
          where: { id: project.id }
        })
      } catch (deleteError) {
        console.error('Failed to rollback project:', deleteError)
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to scaffold project',
          details: scaffoldError instanceof Error ? scaffoldError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating project:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json({ 
          error: 'Database connection failed',
          details: 'Please check your database configuration'
        }, { status: 500 })
      }
      
      if (error.message.includes('prisma')) {
        return NextResponse.json({ 
          error: 'Database operation failed',
          details: 'Please check your database schema and connection'
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create project',
      details: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

// GET /api/projects/analytics
async function GET_analytics(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: { activities: true },
    });

    // Summary
    const totalProjects = projects.length;
    let totalAgentRuns = 0;
    const toolUsage: Record<string, number> = {};
    let dailyActiveUsers = 1; // For single user SaaS, this is always 1
    const today = new Date();
    const projectNames = projects.map((p: any) => p.name);

    // Aggregate activities
    projects.forEach((project: any) => {
      project.activities.forEach((activity: any) => {
        if (activity.type === 'tool_switch' || activity.type === 'task_complete') {
          totalAgentRuns++;
          if (activity.tool) {
            toolUsage[activity.tool] = (toolUsage[activity.tool] || 0) + 1;
          }
        }
      });
    });

    // Most active tool
    let mostActiveTool = 'None';
    let maxToolCount = 0;
    Object.entries(toolUsage).forEach(([tool, count]) => {
      if (count > maxToolCount) {
        mostActiveTool = tool;
        maxToolCount = count;
      }
    });

    // Agent usage data (last 7 days)
    const agentUsageData = {
      labels: [] as string[],
      datasets: [
        {
          label: 'Agent Runs',
          data: [] as number[],
          fill: true,
          backgroundColor: 'rgba(59,130,246,0.1)',
          borderColor: '#3b82f6',
          tension: 0.4,
        },
      ],
    };
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      const label = day.toLocaleDateString('en-US', { weekday: 'short' });
      agentUsageData.labels.push(label);
      let count = 0;
      projects.forEach((project: any) => {
        project.activities.forEach((activity: any) => {
          const activityDate = new Date(activity.createdAt);
          if (
            (activity.type === 'tool_switch' || activity.type === 'task_complete') &&
            activityDate.toDateString() === day.toDateString()
          ) {
            count++;
          }
        });
      });
      agentUsageData.datasets[0].data.push(count);
    }

    // Project trends data (last 4 weeks)
    const projectTrendsData = {
      labels: [] as string[],
      datasets: [
        {
          label: 'Projects Created',
          data: [] as number[],
          fill: true,
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderColor: '#10b981',
          tension: 0.4,
        },
      ],
    };
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(today.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const label = `Week ${4 - i}`;
      projectTrendsData.labels.push(label);
      let count = 0;
      projects.forEach((project: any) => {
        const createdAt = new Date(project.createdAt);
        if (createdAt >= start && createdAt <= end) {
          count++;
        }
      });
      projectTrendsData.datasets[0].data.push(count);
    }

    // Agent table data (last 10 activities)
    const agentTableData: { name: string; project: string; lastRun: string; totalRuns: number; avgTime: string; status: { success: number; fail: number } }[] = [];
    projects.forEach((project: any) => {
      project.activities.slice(-10).forEach((activity: any) => {
        if (activity.type === 'tool_switch' || activity.type === 'task_complete') {
          agentTableData.push({
            name: activity.tool || 'Unknown',
            project: project.name,
            lastRun: new Date(activity.createdAt).toLocaleString(),
            totalRuns: 1, // Could aggregate by tool/project if needed
            avgTime: '-', // Not tracked
            status: { success: 100, fail: 0 }, // Not tracked
          });
        }
      });
    });

    // Filters
    const agentNames = Object.keys(toolUsage).length > 0 ? Object.keys(toolUsage) : ['All Agents'];
    const filters = {
      projects: ['All Projects', ...projectNames],
      agents: ['All Agents', ...agentNames],
      dateRanges: ['7 days', '30 days', 'Custom'],
    };

    // Summary cards
    const summary = [
      {
        label: 'Total Projects Created',
        value: totalProjects,
        icon: null,
      },
      {
        label: 'Total AI Agent Runs',
        value: totalAgentRuns,
        icon: null,
      },
      {
        label: 'Most Active Tool',
        value: mostActiveTool,
        icon: null,
      },
      {
        label: 'Daily Active Users',
        value: dailyActiveUsers,
        icon: null,
      },
    ];

    return NextResponse.json({ summary, agentUsageData, projectTrendsData, agentTableData, filters });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
} 