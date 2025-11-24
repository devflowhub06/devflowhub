import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log error for debugging
    console.error('Client Error Report:', {
      error: body.error,
      stack: body.stack,
      url: body.url,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    })
    
    // Return success to prevent further error loops
    return NextResponse.json({ 
      success: true, 
      message: 'Error reported successfully' 
    })
    
  } catch (error) {
    console.error('Error reporting endpoint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to report error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Error reporting endpoint is active' 
  })
}