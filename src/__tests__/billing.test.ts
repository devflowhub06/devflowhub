import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { billingService } from '@/lib/billing-service';
import { usageTracker } from '@/lib/usage-tracker';

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    stripeCustomer: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    usageRecord: {
      create: vi.fn(),
    },
    billingEvent: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    invoice: {
      create: vi.fn(),
    },
  })),
}));

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    customers: {
      create: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
    },
    subscriptionItems: {
      createUsageRecord: vi.fn(),
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  STRIPE_CONFIG: {
    PRICE_IDS: {
      PRO_MONTHLY: 'price_pro_monthly',
      PRO_YEARLY: 'price_pro_yearly',
      ENTERPRISE_MONTHLY: 'price_enterprise_monthly',
      AI_TOKENS: 'price_ai_tokens',
      PREVIEW_MINUTES: 'price_preview_minutes',
    },
    PLAN_LIMITS: {
      free: {
        aiTokens: 10000,
        previewMinutes: 60,
        sandboxRuns: 10,
        deployments: 3,
        projects: 3,
      },
      pro: {
        aiTokens: 100000,
        previewMinutes: 600,
        sandboxRuns: 100,
        deployments: 50,
        projects: 50,
      },
      enterprise: {
        aiTokens: 1000000,
        previewMinutes: 6000,
        sandboxRuns: 1000,
        deployments: 500,
        projects: -1,
      },
    },
  },
}));

describe('BillingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session for Pro plan', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      };

      vi.mocked(billingService.createCheckoutSession).mockResolvedValue({
        success: true,
        sessionId: mockSession.id,
        url: mockSession.url,
      });

      const result = await billingService.createCheckoutSession({
        plan: 'pro',
        userId: 'user_123',
        projectId: 'project_123',
        trialDays: 14,
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(mockSession.id);
      expect(result.url).toBe(mockSession.url);
    });

    it('should handle errors when creating checkout session', async () => {
      vi.mocked(billingService.createCheckoutSession).mockResolvedValue({
        success: false,
        error: 'Stripe error',
      });

      const result = await billingService.createCheckoutSession({
        plan: 'pro',
        userId: 'user_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe error');
    });
  });

  describe('recordUsage', () => {
    it('should record usage for AI tokens', async () => {
      const mockUsageRecord = {
        id: 'ur_test_123',
        quantity: 1000,
      };

      vi.mocked(billingService.recordUsage).mockResolvedValue({
        success: true,
        usageRecord: mockUsageRecord,
      });

      const result = await billingService.recordUsage({
        subscriptionItemId: 'si_test_123',
        quantity: 1000,
        action: 'ai_tokens',
        projectId: 'project_123',
      });

      expect(result.success).toBe(true);
      expect(result.usageRecord).toEqual(mockUsageRecord);
    });
  });
});

describe('UsageTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackAITokens', () => {
    it('should track AI token usage', async () => {
      vi.mocked(usageTracker.trackAITokens).mockResolvedValue(undefined);

      await usageTracker.trackAITokens('user_123', 1000, 'project_123', {
        model: 'gpt-4',
        prompt: 'test prompt',
      });

      expect(usageTracker.trackAITokens).toHaveBeenCalledWith(
        'user_123',
        1000,
        'project_123',
        {
          model: 'gpt-4',
          prompt: 'test prompt',
        }
      );
    });
  });

  describe('getCurrentUsage', () => {
    it('should return current usage for a user', async () => {
      const mockUsage = {
        ai_tokens: 5000,
        preview_minutes: 30,
        sandbox_runs: 5,
        deployments: 2,
      };

      vi.mocked(usageTracker.getCurrentUsage).mockResolvedValue(mockUsage);

      const result = await usageTracker.getCurrentUsage('user_123');

      expect(result).toEqual(mockUsage);
    });
  });

  describe('checkUsageLimits', () => {
    it('should check if user has exceeded free plan limits', async () => {
      const mockLimits = {
        exceeded: true,
        limits: {
          aiTokens: 10000,
          previewMinutes: 60,
          sandboxRuns: 10,
          deployments: 3,
          projects: 3,
        },
        usage: {
          ai_tokens: 12000,
          preview_minutes: 30,
          sandbox_runs: 5,
          deployments: 2,
        },
        usagePercentage: {
          ai_tokens: 120,
          preview_minutes: 50,
          sandbox_runs: 50,
          deployments: 67,
        },
      };

      vi.mocked(usageTracker.checkUsageLimits).mockResolvedValue(mockLimits);

      const result = await usageTracker.checkUsageLimits('user_123');

      expect(result.exceeded).toBe(true);
      expect(result.usagePercentage.ai_tokens).toBe(120);
    });
  });
});
