# DevFlowHub Billing System Setup Guide

This guide will help you set up the complete Stripe billing system for DevFlowHub v2.0.

## Prerequisites

1. Stripe account (test and live)
2. PostgreSQL database
3. Node.js 18+ environment

## 1. Stripe Configuration

### Create Stripe Products and Prices

1. **Pro Monthly Plan**
   ```bash
   stripe products create --name "DevFlowHub Pro" --description "Professional plan for developers"
   stripe prices create --product prod_xxx --unit-amount 2900 --currency usd --recurring interval=month
   ```

2. **Pro Yearly Plan**
   ```bash
   stripe prices create --product prod_xxx --unit-amount 29000 --currency usd --recurring interval=year
   ```

3. **Enterprise Plan**
   ```bash
   stripe products create --name "DevFlowHub Enterprise" --description "Enterprise plan for large teams"
   stripe prices create --product prod_xxx --unit-amount 9900 --currency usd --recurring interval=month
   ```

4. **Usage-based Pricing (AI Tokens)**
   ```bash
   stripe prices create --product prod_xxx --unit-amount 1 --currency usd --billing-scheme=per_unit --usage-type=metered
   ```

5. **Usage-based Pricing (Preview Minutes)**
   ```bash
   stripe prices create --product prod_xxx --unit-amount 10 --currency usd --billing-scheme=per_unit --usage-type=metered
   ```

### Set up Webhooks

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
   - `usage_record.succeeded`

## 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devflowhub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (from step 1)
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_YEARLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_..."
STRIPE_AI_TOKENS_PRICE_ID="price_..."
STRIPE_PREVIEW_MINUTES_PRICE_ID="price_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# OpenAI
OPENAI_API_KEY="sk-..."
```

## 3. Database Setup

1. **Run Prisma migrations:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Verify tables created:**
   - `StripeCustomer`
   - `Subscription`
   - `UsageRecord`
   - `Invoice`
   - `Coupon`
   - `BillingEvent`

## 4. Testing the Billing System

### Test Checkout Flow

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/pricing`
3. Click "Start Free Trial" for Pro plan
4. Complete Stripe checkout with test card: `4242 4242 4242 4242`
5. Verify subscription is created in database

### Test Webhooks Locally

1. Install Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```

2. Copy the webhook secret to your `.env.local`

3. Test webhook events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.created
   ```

### Test Usage Tracking

1. Use the usage tracker in your code:
   ```typescript
   import { usageTracker } from '@/lib/usage-tracker';
   
   // Track AI token usage
   await usageTracker.trackAITokens(userId, 1000, projectId);
   
   // Track preview time
   await usageTracker.trackPreviewTime(userId, 30, projectId);
   
   // Track sandbox run
   await usageTracker.trackSandboxRun(userId, projectId);
   
   // Track deployment
   await usageTracker.trackDeployment(userId, projectId);
   ```

## 5. Production Deployment

### Environment Setup

1. **Update environment variables for production:**
   ```env
   NODE_ENV="production"
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_PUBLISHABLE_KEY="pk_live_..."
   ```

2. **Set up production webhook endpoint:**
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events: Same as development

### Security Checklist

- [ ] Webhook signature verification enabled
- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] Rate limiting implemented
- [ ] Error logging configured

### Monitoring

1. **Set up monitoring for:**
   - Failed webhook events
   - Payment failures
   - Usage tracking errors
   - Subscription status changes

2. **Create alerts for:**
   - High webhook failure rate
   - Payment failures
   - Usage limit breaches

## 6. Usage Integration

### Add Usage Tracking to AI Features

```typescript
// In your AI assistant component
import { usageTracker } from '@/lib/usage-tracker';

const handleAIAssistant = async (prompt: string) => {
  // Your AI logic here
  const tokensUsed = calculateTokens(prompt, response);
  
  // Track usage
  await usageTracker.trackAITokens(userId, tokensUsed, projectId, {
    model: 'gpt-4',
    prompt_length: prompt.length,
  });
};
```

### Add Usage Tracking to Preview Features

```typescript
// In your preview component
import { usageTracker } from '@/lib/usage-tracker';

const startPreview = async () => {
  const startTime = Date.now();
  
  // Your preview logic here
  
  const endTime = Date.now();
  const minutes = Math.round((endTime - startTime) / 60000);
  
  // Track usage
  await usageTracker.trackPreviewTime(userId, minutes, projectId);
};
```

## 7. Analytics and Reporting

### Key Metrics to Track

1. **Revenue Metrics:**
   - Monthly Recurring Revenue (MRR)
   - Annual Recurring Revenue (ARR)
   - Customer Lifetime Value (CLV)
   - Churn Rate

2. **Usage Metrics:**
   - AI tokens consumed per user
   - Preview time per user
   - Sandbox runs per user
   - Deployments per user

3. **Conversion Metrics:**
   - Trial to paid conversion
   - Free to paid upgrade rate
   - Plan upgrade rate

### Dashboard Implementation

The billing dashboard shows:
- Current plan and status
- Usage breakdown with progress bars
- Recent invoices
- Billing information
- Upgrade options

## 8. Troubleshooting

### Common Issues

1. **Webhook signature verification fails:**
   - Check webhook secret in environment variables
   - Verify webhook endpoint URL

2. **Usage not being tracked:**
   - Check subscription status
   - Verify subscription item IDs
   - Check error logs

3. **Checkout session creation fails:**
   - Verify Stripe API keys
   - Check price IDs
   - Verify customer creation

### Debug Commands

```bash
# Check Stripe webhook events
stripe events list --limit 10

# Test webhook endpoint
stripe trigger checkout.session.completed

# Check subscription status
stripe subscriptions list --limit 10
```

## 9. Support and Maintenance

### Regular Tasks

1. **Monthly:**
   - Review failed payments
   - Check usage patterns
   - Update pricing if needed

2. **Quarterly:**
   - Analyze churn patterns
   - Review pricing strategy
   - Update plan limits

3. **Annually:**
   - Review Stripe fees
   - Update security measures
   - Plan feature roadmap

### Support Contacts

- Stripe Support: https://support.stripe.com
- DevFlowHub Support: support@devflowhub.com

## 10. Security Best Practices

1. **Never log sensitive data:**
   - Stripe secret keys
   - Customer payment info
   - Webhook payloads (in production)

2. **Use idempotency keys:**
   - For all Stripe API calls
   - For usage recording
   - For webhook processing

3. **Implement rate limiting:**
   - On billing API endpoints
   - On usage tracking
   - On webhook processing

4. **Monitor for anomalies:**
   - Unusual usage patterns
   - Failed payment spikes
   - Webhook failures

This completes the billing system setup for DevFlowHub v2.0. The system is now ready for production use with comprehensive usage tracking, subscription management, and analytics.
