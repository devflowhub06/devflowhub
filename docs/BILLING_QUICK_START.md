# DevFlowHub Billing Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run the Setup Script
```bash
node scripts/setup-stripe.js
```

This interactive script will guide you through:
- Getting your Stripe API keys
- Creating products and prices
- Setting up webhooks
- Generating your `.env.local` file

### Step 2: Test the Integration
```bash
node scripts/test-stripe.js
```

This will verify that:
- Your API keys work
- Products are created correctly
- Checkout sessions can be created

### Step 3: Start Your Server
```bash
npm run dev
```

### Step 4: Test the Billing Flow
1. Go to `http://localhost:3000/pricing`
2. Click "Start Free Trial" on Pro plan
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check Stripe Dashboard for the subscription

## 🎯 What You'll Get

### Revenue Dashboard
- Real-time revenue metrics
- Subscription analytics
- Growth tracking
- Quick access to Stripe Dashboard

### Billing Features
- ✅ Stripe Checkout integration
- ✅ Subscription management
- ✅ Usage-based billing
- ✅ Webhook handling
- ✅ Customer portal
- ✅ Invoice management

### Pricing Plans
- **Free**: $0/month - 3 projects, basic features
- **Pro**: $29/month - 20 projects, advanced features, 14-day trial
- **Enterprise**: Custom pricing - unlimited everything

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Create Stripe Account
- Go to https://dashboard.stripe.com/
- Sign up and verify your account

### 2. Get API Keys
- Go to Developers → API Keys
- Copy your test keys (pk_test_... and sk_test_...)

### 3. Create Products
Create these products in Stripe Dashboard:

**DevFlowHub Pro**
- Price: $29.00 USD monthly
- Copy the Price ID

**DevFlowHub Enterprise**
- Price: $99.00 USD monthly
- Copy the Price ID

**Usage-Based Products**
- AI Tokens: $0.01 per unit
- Preview Minutes: $0.10 per unit
- Sandbox Runs: $0.50 per unit
- Deployments: $2.00 per unit

### 4. Set Up Webhook
- Go to Developers → Webhooks
- Add endpoint: `http://localhost:3000/api/billing/webhook`
- Select events: checkout.session.completed, customer.subscription.*, invoice.*

### 5. Update Environment Variables
Add to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_price_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_enterprise_price_id
STRIPE_AI_TOKENS_PRICE_ID=price_your_ai_tokens_price_id
STRIPE_PREVIEW_MINUTES_PRICE_ID=price_your_preview_minutes_price_id
STRIPE_SANDBOX_RUNS_PRICE_ID=price_your_sandbox_runs_price_id
STRIPE_DEPLOYMENTS_PRICE_ID=price_your_deployments_price_id
```

## 🧪 Testing

### Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### Test Scenarios
1. **Successful Subscription**: Use 4242 4242 4242 4242
2. **Failed Payment**: Use 4000 0000 0000 0002
3. **Trial Period**: Pro plan includes 14-day trial
4. **Usage Billing**: Test metered usage tracking

## 📊 Monitoring

### Stripe Dashboard
- Monitor revenue in real-time
- Track subscription metrics
- Handle customer support
- View payment analytics

### DevFlowHub Dashboard
- Access via `/dashboard/settings?tab=billing`
- View customer billing info
- Manage subscriptions
- Track usage limits

## 🚀 Going Live

### 1. Switch to Live Mode
- Update environment variables with live keys
- Test with real (small) transactions
- Set up live webhook endpoint

### 2. Deploy to Production
- Add environment variables to your hosting platform
- Update webhook URL to production domain
- Test end-to-end billing flow

### 3. Monitor and Optimize
- Track key metrics (MRR, churn, conversion)
- A/B test pricing strategies
- Implement customer success flows

## 🆘 Troubleshooting

### Common Issues
1. **"Stripe not configured"**: Check your API keys
2. **"Price not found"**: Verify price IDs are correct
3. **Webhook not working**: Check URL and signing secret
4. **Checkout not loading**: Verify publishable key

### Getting Help
- Check Stripe Dashboard for errors
- Review application logs
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`

## 📈 Next Steps

1. **Analytics**: Set up detailed revenue tracking
2. **A/B Testing**: Test different pricing strategies
3. **Customer Success**: Implement onboarding flows
4. **Enterprise Sales**: Add custom pricing options
5. **International**: Add multi-currency support

---

**Ready to start making money? Run `node scripts/setup-stripe.js` now!** 🚀
