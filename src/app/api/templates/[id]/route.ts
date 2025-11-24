import { NextRequest, NextResponse } from 'next/server'
import { templates, ProjectTemplate } from '@/lib/templates'

// GET /api/templates/[id] - Get specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id
    const template = templates.find(t => t.id === templateId)

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// POST /api/templates/[id]/instantiate - Instantiate template with parameters
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id
    const template = templates.find(t => t.id === templateId)

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { 
      projectName, 
      projectDescription, 
      parameters = {},
      userId 
    } = body

    if (!projectName || !userId) {
      return NextResponse.json(
        { error: 'Project name and user ID are required' },
        { status: 400 }
      )
    }

    // Instantiate template with parameter substitution
    const instantiatedFiles = template.files.map(file => ({
      ...file,
      content: substituteTemplateParameters(file.content, {
        PROJECT_NAME: projectName,
        PROJECT_DESCRIPTION: projectDescription || '',
        ...parameters
      })
    }))

    return NextResponse.json({
      templateId,
      projectName,
      files: instantiatedFiles,
      metadata: {
        originalTemplate: template.name,
        language: template.language,
        framework: template.framework,
        recommendedTool: template.recommendedTool
      }
    })
  } catch (error) {
    console.error('Error instantiating template:', error)
    return NextResponse.json(
      { error: 'Failed to instantiate template' },
      { status: 500 }
    )
  }
}

// Helper function to substitute template parameters
function substituteTemplateParameters(content: string, parameters: Record<string, string>): string {
  let result = content
  
  // Replace {{PARAMETER_NAME}} with actual values
  Object.entries(parameters).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value)
  })

  // Replace common template variables
  result = result.replace(/\{\{TIMESTAMP\}\}/g, new Date().toISOString())
  result = result.replace(/\{\{YEAR\}\}/g, new Date().getFullYear().toString())
  
  return result
}
