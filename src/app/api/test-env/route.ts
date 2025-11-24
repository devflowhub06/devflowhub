import { NextResponse } from 'next/server'

export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY
  const hasKey = !!openaiKey
  const keyPrefix = openaiKey ? openaiKey.substring(0, 20) + '...' : 'NOT_SET'
  const actualKey = openaiKey || 'NOT_SET'
  
  // Debug: Log all environment variables
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI')))
  console.log('OPENAI_API_KEY value:', openaiKey)
  console.log('OPENAI_API_KEY length:', openaiKey?.length)
  
  return NextResponse.json({
    hasOpenAIKey: hasKey,
    keyPrefix: keyPrefix,
    actualKey: actualKey,
    keyLength: openaiKey?.length || 0,
    envVars: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
    }
  })
}
