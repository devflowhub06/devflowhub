import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log analytics event for debugging
    console.log('Analytics Event:', {
      event: body.event,
      properties: body.properties,
      timestamp: body.timestamp,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    
    // For now, just return success
    // In production, you would send this to your analytics service
    // (PostHog, Google Analytics, Mixpanel, etc.)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    })
    
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track event' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Analytics tracking endpoint is active' 
  })
}