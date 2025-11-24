import { billingService } from './billing-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UsageEvent {
  userId: string;
  projectId?: string;
  action: 'ai_tokens' | 'preview_minutes' | 'sandbox_runs' | 'deployments';
  quantity: number;
  metadata?: Record<string, any>;
}

export class UsageTracker {
  /**
   * Track AI token usage
   */
  async trackAITokens(
    userId: string,
    tokens: number,
    projectId?: string,
    metadata?: Record<string, any>
  ) {
    await this.recordUsage({
      userId,
      projectId,
      action: 'ai_tokens',
      quantity: tokens,
      metadata,
    });
  }

  /**
   * Track preview time usage
   */
  async trackPreviewTime(
    userId: string,
    minutes: number,
    projectId?: string,
    metadata?: Record<string, any>
  ) {
    await this.recordUsage({
      userId,
      projectId,
      action: 'preview_minutes',
      quantity: minutes,
      metadata,
    });
  }

  /**
   * Track sandbox run usage
   */
  async trackSandboxRun(
    userId: string,
    projectId?: string,
    metadata?: Record<string, any>
  ) {
    await this.recordUsage({
      userId,
      projectId,
      action: 'sandbox_runs',
      quantity: 1,
      metadata,
    });
  }

  /**
   * Track deployment usage
   */
  async trackDeployment(
    userId: string,
    projectId?: string,
    metadata?: Record<string, any>
  ) {
    await this.recordUsage({
      userId,
      projectId,
      action: 'deployments',
      quantity: 1,
      metadata,
    });
  }

  /**
   * Record usage in both our database and Stripe
   */
  private async recordUsage(event: UsageEvent) {
    try {
      // Get user's active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: event.userId,
          status: { in: ['active', 'trialing'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription) {
        // No active subscription, just track in our database
        await this.trackInDatabase(event);
        return;
      }

      // Get the subscription item ID for the usage type
      const subscriptionItemId = await this.getSubscriptionItemId(
        subscription.stripeSubscriptionId,
        event.action
      );

      if (subscriptionItemId) {
        // Record usage in Stripe
        await billingService.recordUsage({
          subscriptionItemId,
          quantity: event.quantity,
          projectId: event.projectId,
          action: event.action,
          metadata: event.metadata,
        });
      }

      // Also track in our database for analytics
      await this.trackInDatabase(event);
    } catch (error) {
      console.error('Error recording usage:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Track usage in our database
   */
  private async trackInDatabase(event: UsageEvent) {
    const currentMonth = new Date();
    const period = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    // Update or create billing usage record
    await prisma.billingUsage.upsert({
      where: {
        userId_period: {
          userId: event.userId,
          period,
        },
      },
      update: {
        [event.action === 'ai_tokens' ? 'aiTokensUsed' : 
         event.action === 'preview_minutes' ? 'previewMinutes' :
         event.action === 'sandbox_runs' ? 'sandboxesStarted' :
         'deployments']: {
          increment: event.quantity,
        },
      },
      create: {
        userId: event.userId,
        period,
        [event.action === 'ai_tokens' ? 'aiTokensUsed' : 
         event.action === 'preview_minutes' ? 'previewMinutes' :
         event.action === 'sandbox_runs' ? 'sandboxesStarted' :
         'deployments']: event.quantity,
      },
    });
  }

  /**
   * Get subscription item ID for a specific usage type
   */
  private async getSubscriptionItemId(
    subscriptionId: string,
    action: string
  ): Promise<string | null> {
    try {
      // This would need to be implemented based on your Stripe setup
      // For now, return null to skip Stripe usage recording
      return null;
    } catch (error) {
      console.error('Error getting subscription item ID:', error);
      return null;
    }
  }

  /**
   * Get current usage for a user
   */
  async getCurrentUsage(userId: string) {
    const currentMonth = new Date();
    const period = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    const usage = await prisma.billingUsage.findUnique({
      where: {
        userId_period: {
          userId,
          period,
        },
      },
    });

    return {
      ai_tokens: usage?.aiTokensUsed || 0,
      preview_minutes: usage?.previewMinutes || 0,
      sandbox_runs: usage?.sandboxesStarted || 0,
      deployments: usage?.deployments || 0,
    };
  }

  /**
   * Check if user has exceeded their plan limits
   */
  async checkUsageLimits(userId: string) {
    const usage = await this.getCurrentUsage(userId);
    
    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) return { exceeded: false, limits: null };

    const plan = user.plan as 'free' | 'pro' | 'enterprise';
    
    // Import plan limits
    const { getPlanLimits, isUsageExceeded } = await import('./stripe');
    const limits = getPlanLimits(plan);
    const exceeded = isUsageExceeded(usage, plan);

    return {
      exceeded,
      limits,
      usage,
      usagePercentage: {
        ai_tokens: Math.round((usage.ai_tokens / limits.aiTokens) * 100),
        preview_minutes: Math.round((usage.preview_minutes / limits.previewMinutes) * 100),
        sandbox_runs: Math.round((usage.sandbox_runs / limits.sandboxRuns) * 100),
        deployments: Math.round((usage.deployments / limits.deployments) * 100),
      },
    };
  }
}

export const usageTracker = new UsageTracker();
