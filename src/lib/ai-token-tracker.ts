import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { usageTracker } from './usage-tracker'

/**
 * Track AI token usage from OpenAI API response
 */
export async function trackAITokenUsage(
  userId: string,
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  },
  metadata?: {
    model?: string
    endpoint?: string
    projectId?: string
    mode?: string
  }
) {
  try {
    // Track in BillingUsage (monthly aggregate)
    await usageTracker.trackAITokens(
      userId,
      usage.totalTokens,
      metadata?.projectId,
      {
        model: metadata?.model,
        endpoint: metadata?.endpoint,
        mode: metadata?.mode
      }
    )

    // Also track in AITokenUsage (detailed per-request)
    await prisma.aITokenUsage.create({
      data: {
        userId,
        projectId: metadata?.projectId,
        model: metadata?.model || 'gpt-4o-mini',
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        endpoint: metadata?.endpoint || 'unknown',
        cost: calculateCost(usage.totalTokens, metadata?.model || 'gpt-4o-mini'),
        successful: true
      }
    })
  } catch (error) {
    console.error('Error tracking AI token usage:', error)
    // Don't throw - tracking failures shouldn't break the main flow
  }
}

/**
 * Calculate cost based on token count and model
 * Pricing as of 2024 (approximate)
 */
function calculateCost(tokens: number, model: string): number {
  // Pricing per 1M tokens
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 }
  }

  const modelPricing = pricing[model] || pricing['gpt-4o-mini']
  // Rough estimate: assume 70% input, 30% output
  const inputCost = (tokens * 0.7 * modelPricing.input) / 1_000_000
  const outputCost = (tokens * 0.3 * modelPricing.output) / 1_000_000
  
  return inputCost + outputCost
}

/**
 * Extract usage from OpenAI completion response
 */
export function extractUsageFromResponse(response: any): {
  promptTokens: number
  completionTokens: number
  totalTokens: number
} {
  const usage = response.usage || {}
  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0
  }
}


