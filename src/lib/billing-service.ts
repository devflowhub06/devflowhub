import { stripe, STRIPE_CONFIG } from './stripe';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Check if Stripe is configured
const isStripeConfigured = !!stripe;

const prisma = new PrismaClient();

export interface CreateCheckoutSessionParams {
  plan: 'pro' | 'enterprise';
  userId: string;
  projectId?: string;
  coupon?: string;
  trialDays?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
  coupon?: string;
  metadata?: Record<string, string>;
}

export interface UsageRecordParams {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: Date;
  projectId?: string;
  action: 'ai_tokens' | 'preview_minutes' | 'sandbox_runs' | 'deployments';
  metadata?: Record<string, any>;
}

export class BillingService {
  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession({
    plan,
    userId,
    projectId,
    coupon,
    trialDays = 14,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams) {
    if (!isStripeConfigured) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      };
    }

    try {
      // Get or create Stripe customer
      const customer = await this.getOrCreateStripeCustomer(userId);
      
      // Get price ID based on plan
      const priceId = this.getPriceIdForPlan(plan);
      
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customer.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?billing=success`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?billing=cancelled`,
        metadata: {
          userId,
          projectId: projectId || '',
          plan,
        },
        subscription_data: {
          trial_period_days: trialDays,
          metadata: {
            userId,
            projectId: projectId || '',
            plan,
          },
        },
      };

      // Add coupon if provided
      if (coupon) {
        sessionParams.discounts = [{ coupon }];
      }

      const session = await stripe.checkout.sessions.create(sessionParams, {
        idempotencyKey: `checkout-${userId}-${plan}-${Date.now()}`,
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a subscription directly (for server-side flows)
   */
  async createSubscription({
    customerId,
    priceId,
    trialDays,
    coupon,
    metadata = {},
  }: CreateSubscriptionParams) {
    try {
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        metadata,
      };

      if (coupon) {
        subscriptionParams.coupon = coupon;
      }

      const subscription = await stripe.subscriptions.create(subscriptionParams, {
        idempotencyKey: `subscription-${customerId}-${priceId}-${Date.now()}`,
      });

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record usage for metered billing
   */
  async recordUsage({
    subscriptionItemId,
    quantity,
    timestamp = new Date(),
    projectId,
    action,
    metadata = {},
  }: UsageRecordParams) {
    try {
      // Record usage in Stripe
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: Math.floor(timestamp.getTime() / 1000),
          action: 'increment',
        },
        {
          idempotencyKey: `usage-${subscriptionItemId}-${action}-${timestamp.getTime()}`,
        }
      );

      // Store usage record in our database
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionItemId: subscriptionItemId },
      });

      if (subscription) {
        await prisma.usageRecord.create({
          data: {
            subscriptionId: subscription.id,
            stripeSubscriptionItemId: subscriptionItemId,
            quantity,
            timestamp,
            projectId,
            action,
            metadata,
          },
        });
      }

      return {
        success: true,
        usageRecord,
      };
    } catch (error) {
      console.error('Error recording usage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(userId: string) {
    if (!isStripeConfigured) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      };
    }

    try {
      const customer = await this.getOrCreateStripeCustomer(userId);
      
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
      });

      return {
        success: true,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get customer billing information
   */
  async getCustomerBillingInfo(userId: string) {
    if (!isStripeConfigured) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      };
    }

    try {
      const customer = await prisma.stripeCustomer.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      if (!customer) {
        return {
          success: false,
          error: 'Customer not found',
        };
      }

      // Get active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ['active', 'trialing', 'past_due'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get recent invoices
      const invoices = await prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Get current usage for this month
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const usageRecords = await prisma.usageRecord.findMany({
        where: {
          subscriptionId: subscription?.id,
          timestamp: { gte: monthStart },
        },
      });

      const currentUsage = usageRecords.reduce(
        (acc, record) => {
          acc[record.action] = (acc[record.action] || 0) + record.quantity;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        success: true,
        customer,
        subscription,
        invoices,
        currentUsage,
      };
    } catch (error) {
      console.error('Error getting customer billing info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get or create Stripe customer
   */
  private async getOrCreateStripeCustomer(userId: string) {
    // Check if customer exists in our database
    let customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (customer) {
      return customer;
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId,
      },
    });

    // Store in our database
    customer = await prisma.stripeCustomer.create({
      data: {
        userId,
        stripeCustomerId: stripeCustomer.id,
        email: user.email,
        name: user.name,
      },
    });

    return customer;
  }

  /**
   * Get price ID for plan
   */
  private getPriceIdForPlan(plan: 'pro' | 'enterprise'): string {
    switch (plan) {
      case 'pro':
        return STRIPE_CONFIG.PRICE_IDS.PRO_MONTHLY;
      case 'enterprise':
        return STRIPE_CONFIG.PRICE_IDS.ENTERPRISE_MONTHLY;
      default:
        throw new Error(`Invalid plan: ${plan}`);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      console.log(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;
        case 'usage_record.succeeded':
          await this.handleUsageRecordSucceeded(event.data.object as Stripe.UsageRecord);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Record billing event
      await prisma.billingEvent.create({
        data: {
          eventType: event.type,
          stripeEventId: event.id,
          metadata: event.data.object,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error handling webhook event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    // Update user plan
    await prisma.user.update({
      where: { id: userId },
      data: { plan: session.metadata?.plan || 'pro' },
    });

    console.log(`Checkout completed for user ${userId}`);
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    // Create subscription record
    await prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id || '',
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        plan: subscription.metadata?.plan || 'pro',
        metadata: subscription.metadata,
      },
    });

    console.log(`Subscription created for user ${userId}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    });

    console.log(`Subscription updated: ${subscription.id}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    // Update user plan to free
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (subscriptionRecord) {
      await prisma.user.update({
        where: { id: subscriptionRecord.userId },
        data: { plan: 'free' },
      });
    }

    console.log(`Subscription canceled: ${subscription.id}`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const customer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!customer) return;

    // Create invoice record
    await prisma.invoice.create({
      data: {
        userId: customer.userId,
        stripeInvoiceId: invoice.id,
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status || 'paid',
        paid: invoice.paid,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
      },
    });

    console.log(`Invoice payment succeeded: ${invoice.id}`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const customer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!customer) return;

    // Create notification for failed payment
    await prisma.notification.create({
      data: {
        userId: customer.userId,
        type: 'billing_event',
        title: 'Payment Failed',
        message: `Your payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
        metadata: {
          invoiceId: invoice.id,
          amount: invoice.amount_due,
        },
      },
    });

    console.log(`Invoice payment failed: ${invoice.id}`);
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const customer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!customer) return;

    // Create notification for trial ending
    await prisma.notification.create({
      data: {
        userId: customer.userId,
        type: 'billing_event',
        title: 'Trial Ending Soon',
        message: 'Your free trial will end in 3 days. Add a payment method to continue using DevFlowHub.',
        metadata: {
          subscriptionId: subscription.id,
          trialEnd: subscription.trial_end,
        },
      },
    });

    console.log(`Trial will end for subscription: ${subscription.id}`);
  }

  private async handleUsageRecordSucceeded(usageRecord: Stripe.UsageRecord) {
    console.log(`Usage record succeeded: ${usageRecord.id}`);
    // Additional processing if needed
  }
}

export const billingService = new BillingService();
