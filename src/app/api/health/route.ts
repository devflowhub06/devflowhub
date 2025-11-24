import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Verifies:
 * - API is responding
 * - Database connection is working
 * - Core services status
 */
export async function GET() {
  const startTime = Date.now()
  
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'ok',
      database: 'unknown',
      analytics: 'ok', // Always OK since we fail gracefully
    },
    version: '2.0.0',
    responseTime: 0,
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    status.services.database = 'ok'
  } catch (error: any) {
    console.error('Database health check failed:', error?.message || error)
    status.services.database = 'error'
    status.status = 'degraded'
  }

  status.responseTime = Date.now() - startTime

  // Return appropriate HTTP status code
  const httpStatus = status.status === 'ok' ? 200 : 503

  return NextResponse.json(status, { status: httpStatus })
}

