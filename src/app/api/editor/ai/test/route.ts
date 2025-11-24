import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'AI Editor APIs are working!',
      endpoints: {
        autocomplete: '/api/editor/ai/complete',
        edit: '/api/editor/ai/edit',
        assistant: '/api/editor/ai/assistant',
        tests: '/api/editor/ai/tests'
      },
      features: [
        'AI Inline Autocomplete',
        'AI Diff-Based Edits',
        'AI Assistant Modes (Explain/Debug/Refactor)',
        'AI Test Generation',
        'Multi-file Reasoning',
        'Project Memory Integration'
      ],
      status: 'operational'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'AI Editor test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
