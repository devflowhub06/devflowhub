import { NextRequest, NextResponse } from 'next/server'
import { templates, ProjectTemplate } from '@/lib/templates'

// GET /api/templates - List all available templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language')
    const type = searchParams.get('type')
    const framework = searchParams.get('framework')

    let filteredTemplates = templates

    // Filter templates based on query parameters
    if (language) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.language.toLowerCase() === language.toLowerCase()
      )
    }

    if (type) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.type.toLowerCase() === type.toLowerCase()
      )
    }

    if (framework) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.framework.toLowerCase() === framework.toLowerCase()
      )
    }

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}