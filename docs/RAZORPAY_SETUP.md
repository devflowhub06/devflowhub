# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for DevFlowHub 2.0.

## Prerequisites

1. Razorpay account (sign up at [razorpay.com](https://razorpay.com))
2. DevFlowHub application running locally
3. Environment variables configured

## Step 1: Razorpay Account Setup

### 1.1 Create Razorpay Account
1. Go to [razorpay.com](https://razorpay.com) and sign up
2. Complete KYC verification process
3. Activate your account

### 1.2 Get API Keys
1. Log into Razorpay Dashboard
2. Go to Settings > API Keys
3. Generate API Keys (Test keys for development, Live keys for production)
4. Copy the Key ID and Key Secret

### 1.3 Create Plans (Optional)
1. Go to Products > Plans
2. Create a plan for Pro subscription:
   - Plan Name: "DevFlowHub Pro"
   - Amount: ₹2,399
   - Interval: Monthly
   - Plan ID: `plan_pro` (note this down)

## Step 2: Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Plan IDs (if you created plans in Razorpay)
RAZORPAY_PRO_PLAN_ID=plan_pro
RAZORPAY_ENTERPRISE_PLAN_ID=plan_enterprise
```

### 2.1 Webhook Secret Setup
1. In Razorpay Dashboard, go to Settings > Webhooks
2. Create a new webhook with URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `subscription.charged`, `subscription.cancelled`, `subscription.completed`
4. Copy the webhook secret

## Step 3: Database Migration

Run the database migration to add Razorpay-related tables:

```bash
npx prisma db push
```

This will create the following tables:
- `RazorpayPayment`
- `RazorpaySubscription`
- `RazorpayInvoice`

## Step 4: Test the Integration

### 4.1 Start the Development Server
```bash
npm run dev
```

### 4.2 Test Payment Flow
1. Navigate to `/pricing`
2. Click "Start Free Trial" for Pro plan
3. Use Razorpay test card numbers:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

### 4.3 Verify Payment
1. Check the payment appears in Razorpay Dashboard
2. Verify user's plan is updated in your database
3. Check webhook events in Razorpay Dashboard

## Step 5: Production Deployment

### 5.1 Update Environment Variables
Replace test keys with live keys in production:
```env
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
```

### 5.2 Update Webhook URL
Update the webhook URL in Razorpay Dashboard to your production domain:
```
https://yourdomain.com/api/payment/webhook
```

### 5.3 SSL Certificate
Ensure your production domain has a valid SSL certificate (required by Razorpay).

## API Endpoints

### Payment Creation
```
POST /api/payment/create-order
```
Creates a Razorpay order for payment processing.

### Payment Verification
```
POST /api/payment/verify
```
Verifies payment signature and updates user subscription.

### Webhook Handler
```
POST /api/payment/webhook
```
Handles Razorpay webhook events for subscription management.

## Admin Dashboard

Access the admin dashboard at `/admin` to view:
- Revenue analytics
- Subscription statistics
- Payment history
- User plan distribution

## Security Considerations

1. **Never expose API keys** in client-side code
2. **Always verify signatures** before processing payments
3. **Use HTTPS** in production
4. **Validate webhook signatures** to prevent fraud
5. **Store sensitive data securely** in environment variables

## Troubleshooting

### Common Issues

1. **"Razorpay not configured" error**
   - Check environment variables are set correctly
   - Restart the development server after adding env vars

2. **Payment verification fails**
   - Ensure webhook secret is correct
   - Check signature verification logic

3. **Webhook not receiving events**
   - Verify webhook URL is accessible
   - Check SSL certificate validity
   - Ensure webhook events are enabled in Razorpay Dashboard

### Debug Mode

Enable debug logging by adding to your environment:
```env
RAZORPAY_DEBUG=true
```

This will log detailed information about API calls and webhook events.

## Support

For issues related to:
- **Razorpay API**: Contact Razorpay Support
- **DevFlowHub Integration**: Check the application logs and database
- **Webhook Issues**: Verify webhook configuration in Razorpay Dashboard

## Testing Checklist

- [ ] Payment creation works
- [ ] Payment verification succeeds
- [ ] User plan is updated after payment
- [ ] Webhook events are received
- [ ] Subscription management works
- [ ] Admin dashboard displays data
- [ ] Export functionality works
- [ ] Error handling is proper

## Production Checklist

- [ ] Live API keys configured
- [ ] Webhook URL updated to production domain
- [ ] SSL certificate installed
- [ ] Database migrations applied
- [ ] Error monitoring set up
- [ ] Backup strategy implemented
- [ ] Performance monitoring configured
