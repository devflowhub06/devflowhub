import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'
import { z } from 'zod'
import crypto from 'crypto'

const integrationConnectSchema = z.object({
  provider: z.enum(['github', 'gitlab', 'vercel', 'netlify', 'sandbox_provider', 'linear', 'jira']),
  code: z.string().optional(),
  state: z.string().optional()
})

// GET /api/settings/integrations - Get user integrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrations = await prisma.integration.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        displayName: true,
        connectionState: true,
        lastTestedAt: true,
        errorMessage: true,
        scopes: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST /api/settings/integrations/connect - Start OAuth flow or connect integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, code, state } = integrationConnectSchema.parse(body)

    // Generate OAuth URLs for different providers
    const getOAuthUrl = (provider: string) => {
      const baseUrls = {
        github: 'https://github.com/login/oauth/authorize',
        gitlab: 'https://gitlab.com/oauth/authorize',
        vercel: 'https://vercel.com/oauth/authorize',
        netlify: 'https://app.netlify.com/oauth/authorize',
        linear: 'https://linear.app/oauth/authorize',
        jira: 'https://auth.atlassian.com/authorize'
      }

      const clientIds = {
        github: process.env.GITHUB_CLIENT_ID,
        gitlab: process.env.GITLAB_CLIENT_ID,
        vercel: process.env.VERCEL_CLIENT_ID,
        netlify: process.env.NETLIFY_CLIENT_ID,
        linear: process.env.LINEAR_CLIENT_ID,
        jira: process.env.JIRA_CLIENT_ID
      }

      const scopes = {
        github: 'repo,read:org',
        gitlab: 'read_api,read_user',
        vercel: 'deploy',
        netlify: 'deploy',
        linear: 'write',
        jira: 'write:jira-work'
      }

      const state = crypto.randomBytes(32).toString('hex')
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/settings/integrations/callback`

      const params = new URLSearchParams({
        client_id: clientIds[provider as keyof typeof clientIds] || '',
        redirect_uri: redirectUri,
        scope: scopes[provider as keyof typeof scopes] || '',
        state: state,
        response_type: 'code'
      })

      return {
        url: `${baseUrls[provider as keyof typeof baseUrls]}?${params.toString()}`,
        state
      }
    }

    // If this is a callback with code, handle the OAuth exchange
    if (code && state) {
      return await handleOAuthCallback(provider, code, state, session.user.id, request)
    }

    // Otherwise, return OAuth URL for user to visit
    const { url, state: oauthState } = getOAuthUrl(provider)

    // Store state for verification
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'oauth_state_generated',
        resourceType: 'integration',
        metadata: { provider, state: oauthState }
      }
    })

    return NextResponse.json({ 
      oauthUrl: url,
      state: oauthState 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error connecting integration:', error)
    return NextResponse.json(
      { error: 'Failed to connect integration' },
      { status: 500 }
    )
  }
}

// Handle OAuth callback and exchange code for tokens
async function handleOAuthCallback(
  provider: string,
  code: string,
  state: string,
  userId: string,
  request: NextRequest
) {
  try {
    // Verify state parameter
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        userId,
        action: 'oauth_state_generated',
        metadata: { path: ['provider'], equals: provider }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!auditLog || auditLog.metadata?.state !== state) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
    }

    // Exchange code for access token (simplified - in production, use proper OAuth libraries)
    const accessToken = await exchangeCodeForToken(provider, code)

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 })
    }

    // Get user info from provider
    const userInfo = await getUserInfoFromProvider(provider, accessToken)

    // Encrypt and store the token
    const encryptedToken = encryptToken(accessToken)

    // Create or update integration
    const integration = await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider
        }
      },
      update: {
        providerId: userInfo.id,
        displayName: userInfo.name || userInfo.login,
        config: { accessToken: encryptedToken },
        connectionState: 'connected',
        lastTestedAt: new Date(),
        errorMessage: null,
        scopes: userInfo.scopes || [],
        updatedAt: new Date()
      },
      create: {
        userId,
        provider,
        providerId: userInfo.id,
        displayName: userInfo.name || userInfo.login,
        config: { accessToken: encryptedToken },
        connectionState: 'connected',
        lastTestedAt: new Date(),
        scopes: userInfo.scopes || []
      }
    })

    // Track analytics event
    await trackAnalytics(userId, 'integration_connected', {
      provider,
      integrationId: integration.id
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'integration_connected',
        resourceType: 'integration',
        resourceId: integration.id,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { provider }
      }
    })

    return NextResponse.json({ 
      success: true,
      integration: {
        id: integration.id,
        provider: integration.provider,
        displayName: integration.displayName,
        connectionState: integration.connectionState
      }
    })
  } catch (error) {
    console.error('Error handling OAuth callback:', error)
    return NextResponse.json(
      { error: 'Failed to complete OAuth flow' },
      { status: 500 }
    )
  }
}

// Simplified token exchange (in production, use proper OAuth libraries)
async function exchangeCodeForToken(provider: string, code: string): Promise<string | null> {
  // This is a simplified implementation
  // In production, use proper OAuth libraries like `simple-oauth2` or `passport`
  return `mock_token_${provider}_${code}`
}

// Get user info from provider
async function getUserInfoFromProvider(provider: string, accessToken: string) {
  // This is a simplified implementation
  // In production, make actual API calls to provider endpoints
  return {
    id: `user_${provider}_${Date.now()}`,
    name: `User from ${provider}`,
    login: `user_${provider}`,
    scopes: ['repo', 'read:org']
  }
}

// Encrypt token for storage
function encryptToken(token: string): string {
  // In production, use proper encryption with rotating keys
  const algorithm = 'aes-256-gcm'
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default_key_32_chars_long!', 'utf8')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key)
  
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return `${iv.toString('hex')}:${encrypted}`
}
