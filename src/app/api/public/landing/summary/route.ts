import { NextRequest, NextResponse } from 'next/server'

// Sanitized public data for landing page - no PII or sensitive data
const DEMO_PROJECT_DATA = {
  id: 'demo-project-001',
  name: 'E-commerce Platform',
  description: 'Modern React e-commerce with AI-powered recommendations',
  workspace: {
    editor: {
      name: 'Editor',
      description: 'AI pair-coding that understands your repo',
      features: ['AI code completion', 'Context-aware suggestions', 'Multi-file understanding'],
      icon: 'Code2',
      color: 'cyan',
      metrics: {
        avgBuildTime: '2.3s',
        codeQuality: '98%',
        suggestionsAccepted: '87%'
      }
    },
    sandbox: {
      name: 'Sandbox',
      description: 'Instant containers with live debugging',
      features: ['Instant provisioning', 'Live debugging tools', 'Environment sync'],
      icon: 'TestTube',
      color: 'green',
      metrics: {
        avgProvisionTime: '1.2s',
        uptime: '99.9%',
        debugSessions: '1.2k'
      }
    },
    uiStudio: {
      name: 'UI Studio',
      description: 'Design-to-code and component library',
      features: ['Design-to-code conversion', 'Component library', 'Design system sync'],
      icon: 'Palette',
      color: 'purple',
      metrics: {
        componentsGenerated: '156',
        designToCodeTime: '45s',
        componentReuse: '73%'
      }
    },
    deployer: {
      name: 'Deployer',
      description: 'One-click deploy, monitoring & rollback',
      features: ['Continuous deployment', 'Performance monitoring', 'Auto-scaling'],
      icon: 'Rocket',
      color: 'orange',
      metrics: {
        avgDeployTime: '3.1s',
        rollbackTime: '0.8s',
        uptime: '99.95%'
      }
    },
    aiAssistant: {
      name: 'AI Assistant',
      description: 'Cross-workspace memory and intelligent routing',
      features: ['Context-aware help', 'Intelligent routing', 'Workflow automation'],
      icon: 'Bot',
      color: 'violet',
      metrics: {
        contextAccuracy: '94%',
        routingSuccess: '96%',
        suggestionsUsed: '89%'
      }
    }
  },
  codeSnippet: {
    language: 'javascript',
    content: `// AI Development OS - Live Demo
const workflow = await aios.route(
  task: "optimize checkout flow",
  context: projectMemory,
  preferences: userSettings
);

// Routes to UI Studio for design updates
// Maintains full context across workspaces
// Zero configuration required`,
    highlights: [
      { line: 1, type: 'comment', text: 'AI Development OS - Live Demo' },
      { line: 2, type: 'keyword', text: 'const workflow = await aios.route(' },
      { line: 3, type: 'string', text: 'task: "optimize checkout flow",' },
      { line: 4, type: 'variable', text: 'context: projectMemory,' },
      { line: 5, type: 'variable', text: 'preferences: userSettings' },
      { line: 6, type: 'punctuation', text: ');' },
      { line: 8, type: 'comment', text: '// Routes to UI Studio for design updates' },
      { line: 9, type: 'comment', text: '// Maintains full context across workspaces' },
      { line: 10, type: 'comment', text: '// Zero configuration required' }
    ]
  },
  metrics: {
    totalProjects: '50k+',
    activeDevelopers: '12k+',
    avgBuildTime: '2.1s',
    uptime: '99.9%',
    customerSatisfaction: '4.8/5'
  },
  socialProof: {
    testimonials: [
      {
        quote: "DevFlowHub reduced our deployment time by 80% while maintaining perfect reliability.",
        author: "Sarah Chen",
        role: "CTO, TechFlow",
        avatar: "/avatars/sarah-chen.jpg"
      },
      {
        quote: "The AI context memory across workspaces is game-changing for our team productivity.",
        author: "Marcus Rodriguez",
        role: "Lead Developer, InnovateLab",
        avatar: "/avatars/marcus-rodriguez.jpg"
      }
    ],
    logos: [
      { name: "TechFlow", logo: "/logos/techflow.svg" },
      { name: "InnovateLab", logo: "/logos/innovatelab.svg" },
      { name: "CodeCraft", logo: "/logos/codecraft.svg" },
      { name: "DevStudio", logo: "/logos/devstudio.svg" }
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers for public access
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300, s-maxage=300' // 5 minute cache
    })

    // Return sanitized demo data
    return NextResponse.json({
      success: true,
      data: DEMO_PROJECT_DATA,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }, { headers })

  } catch (error) {
    console.error('Error fetching landing summary:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch landing data',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
