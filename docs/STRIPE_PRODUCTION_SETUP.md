# Stripe Production Setup Guide for DevFlowHub

This guide will walk you through setting up Stripe billing for DevFlowHub to start generating revenue.

## Step 1: Create Stripe Account

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Sign up** for a new account or log in if you already have one
3. **Complete account verification**:
   - Add business information
   - Verify your identity
   - Add bank account details for payouts

## Step 2: Get API Keys

### Test Mode Keys (Start Here)
1. In Stripe Dashboard, make sure you're in **Test mode** (toggle in top-left)
2. Go to **Developers** → **API Keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Live Mode Keys (For Production)
1. Switch to **Live mode** in Stripe Dashboard
2. Go to **Developers** → **API Keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

## Step 3: Create Products and Prices

### Create Products
1. Go to **Products** in Stripe Dashboard
2. Click **Add product**

#### Product 1: DevFlowHub Pro
- **Name**: DevFlowHub Pro
- **Description**: Professional AI development workspace
- **Pricing**: 
  - **Recurring**: Monthly
  - **Price**: $29.00 USD
  - **Billing period**: Monthly
- **Save** and copy the **Price ID** (starts with `price_`)

#### Product 2: DevFlowHub Enterprise
- **Name**: DevFlowHub Enterprise
- **Description**: Enterprise AI development platform
- **Pricing**:
  - **Recurring**: Monthly
  - **Price**: $99.00 USD (or custom)
  - **Billing period**: Monthly
- **Save** and copy the **Price ID**

### Create Usage-Based Products (For Metered Billing)
1. Create additional products for usage tracking:

#### AI Tokens Usage
- **Name**: AI Tokens Usage
- **Description**: Pay-per-use AI token consumption
- **Pricing**:
  - **Recurring**: Monthly
  - **Price**: $0.01 USD per unit
  - **Billing period**: Monthly
  - **Usage type**: Metered
- **Save** and copy the **Price ID**

#### Preview Minutes Usage
- **Name**: Preview Minutes Usage
- **Description**: Pay-per-minute preview time
- **Pricing**:
  - **Recurring**: Monthly
  - **Price**: $0.10 USD per unit
  - **Billing period**: Monthly
  - **Usage type**: Metered
- **Save** and copy the **Price ID**

#### Sandbox Runs Usage
- **Name**: Sandbox Runs Usage
- **Description**: Pay-per-sandbox execution
- **Pricing**:
  - **Recurring**: Monthly
  - **Price**: $0.50 USD per unit
  - **Billing period**: Monthly
  - **Usage type**: Metered
- **Save** and copy the **Price ID**

#### Deployments Usage
- **Name**: Deployments Usage
- **Description**: Pay-per-deployment
- **Pricing**:
  - **Recurring**: Monthly
  - **Price**: $2.00 USD per unit
  - **Billing period**: Monthly
  - **Usage type**: Metered
- **Save** and copy the **Price ID**

## Step 4: Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/billing/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. **Save** and copy the **Webhook signing secret** (starts with `whsec_`)

## Step 5: Update Environment Variables

### For Development (.env.local)
```bash
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here

# Stripe Test Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_price_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_enterprise_monthly_price_id
STRIPE_AI_TOKENS_PRICE_ID=price_your_ai_tokens_price_id
STRIPE_PREVIEW_MINUTES_PRICE_ID=price_your_preview_minutes_price_id
STRIPE_SANDBOX_RUNS_PRICE_ID=price_your_sandbox_runs_price_id
STRIPE_DEPLOYMENTS_PRICE_ID=price_your_deployments_price_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production (.env.production)
```bash
# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here

# Stripe Live Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_live_pro_monthly_price_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_live_enterprise_monthly_price_id
STRIPE_AI_TOKENS_PRICE_ID=price_your_live_ai_tokens_price_id
STRIPE_PREVIEW_MINUTES_PRICE_ID=price_your_live_preview_minutes_price_id
STRIPE_SANDBOX_RUNS_PRICE_ID=price_your_live_sandbox_runs_price_id
STRIPE_DEPLOYMENTS_PRICE_ID=price_your_live_deployments_price_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 6: Test the Integration

### Test Checkout Flow
1. Start your development server: `npm run dev`
2. Go to `/pricing` page
3. Click "Start Free Trial" on Pro plan
4. Complete the Stripe checkout (use test card: 4242 4242 4242 4242)
5. Verify subscription is created in Stripe Dashboard

### Test Webhook
1. Use Stripe CLI to test webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```
2. Trigger test events to verify webhook handling

## Step 7: Deploy to Production

### Vercel Deployment
1. Add environment variables in Vercel dashboard
2. Deploy your application
3. Update webhook URL to production URL
4. Test with live Stripe keys

### Security Checklist
- [ ] Never commit live keys to version control
- [ ] Use environment variables for all sensitive data
- [ ] Verify webhook signatures
- [ ] Implement rate limiting
- [ ] Monitor for failed payments
- [ ] Set up alerts for billing issues

## Step 8: Monitor and Optimize

### Stripe Dashboard Monitoring
- Monitor daily/weekly/monthly revenue
- Track failed payments and churn
- Analyze customer behavior
- Set up alerts for unusual activity

### Key Metrics to Track
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Churn rate
- Conversion rate from free to paid

## Troubleshooting

### Common Issues
1. **Webhook not receiving events**: Check URL and signing secret
2. **Checkout not working**: Verify price IDs and API keys
3. **Subscription not updating**: Check webhook event handling
4. **Payment failures**: Monitor Stripe logs and customer support

### Support Resources
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com/
- DevFlowHub Billing Logs: Check application logs for errors

## Next Steps After Setup

1. **A/B Testing**: Test different pricing strategies
2. **Promotional Campaigns**: Create coupons and discounts
3. **Enterprise Sales**: Set up custom pricing for large customers
4. **Analytics**: Implement detailed billing analytics
5. **Customer Success**: Set up onboarding and support flows

---

**Important**: Always test thoroughly in Stripe test mode before going live with real payments!
