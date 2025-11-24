import Stripe from 'stripe';

// For development, we'll create a mock Stripe instance if keys are not set
const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

export const stripe = isStripeConfigured 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null;

export const STRIPE_CONFIG = {
  // Pricing IDs - these should be created in Stripe Dashboard
  PRICE_IDS: {
    PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
    ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
    // Usage-based pricing for AI tokens
    AI_TOKENS: process.env.STRIPE_AI_TOKENS_PRICE_ID || 'price_ai_tokens',
    PREVIEW_MINUTES: process.env.STRIPE_PREVIEW_MINUTES_PRICE_ID || 'price_preview_minutes',
  },
  // Plan limits
  PLAN_LIMITS: {
    free: {
      aiTokens: 10000, // 10k tokens per month
      previewMinutes: 60, // 1 hour per month
      sandboxRuns: 10, // 10 runs per month
      deployments: 3, // 3 deployments per month
      projects: 3, // 3 projects max
    },
    pro: {
      aiTokens: 100000, // 100k tokens per month
      previewMinutes: 600, // 10 hours per month
      sandboxRuns: 100, // 100 runs per month
      deployments: 50, // 50 deployments per month
      projects: 50, // 50 projects max
    },
    enterprise: {
      aiTokens: 1000000, // 1M tokens per month
      previewMinutes: 6000, // 100 hours per month
      sandboxRuns: 1000, // 1000 runs per month
      deployments: 500, // 500 deployments per month
      projects: -1, // unlimited
    },
  },
  // Webhook events to handle
  WEBHOOK_EVENTS: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.subscription.trial_will_end',
    'usage_record.succeeded',
  ],
} as const;

export type PlanType = keyof typeof STRIPE_CONFIG.PLAN_LIMITS;

export function getPlanLimits(plan: PlanType) {
  return STRIPE_CONFIG.PLAN_LIMITS[plan];
}

export function isUsageExceeded(
  currentUsage: { aiTokens: number; previewMinutes: number; sandboxRuns: number; deployments: number },
  plan: PlanType
): boolean {
  const limits = getPlanLimits(plan);
  
  return (
    currentUsage.aiTokens > limits.aiTokens ||
    currentUsage.previewMinutes > limits.previewMinutes ||
    currentUsage.sandboxRuns > limits.sandboxRuns ||
    currentUsage.deployments > limits.deployments
  );
}

export function getUsagePercentage(
  currentUsage: { aiTokens: number; previewMinutes: number; sandboxRuns: number; deployments: number },
  plan: PlanType
): { aiTokens: number; previewMinutes: number; sandboxRuns: number; deployments: number } {
  const limits = getPlanLimits(plan);
  
  return {
    aiTokens: Math.round((currentUsage.aiTokens / limits.aiTokens) * 100),
    previewMinutes: Math.round((currentUsage.previewMinutes / limits.previewMinutes) * 100),
    sandboxRuns: Math.round((currentUsage.sandboxRuns / limits.sandboxRuns) * 100),
    deployments: Math.round((currentUsage.deployments / limits.deployments) * 100),
  };
}
