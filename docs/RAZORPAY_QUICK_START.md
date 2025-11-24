# Razorpay Integration - Quick Start

Get your Razorpay payment integration up and running in 5 minutes.

## Quick Setup

### 1. Get Razorpay Test Keys
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings > API Keys
3. Copy your test Key ID and Secret

### 2. Add Environment Variables
Add to your `.env.local`:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

### 3. Test Payment Flow
1. Start your app: `npm run dev`
2. Go to `/pricing`
3. Click "Start Free Trial"
4. Use test card: `4111 1111 1111 1111`
5. Complete payment

### 4. Verify Success
- Check Razorpay Dashboard for payment
- Verify user plan updated in database
- Check admin dashboard at `/admin`

## Test Card Numbers

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any | Any future date | Success |
| 5555 5555 5555 4444 | Any | Any future date | Success |
| 4000 0000 0000 0002 | Any | Any future date | Declined |

## Features Included

✅ **Payment Processing**
- One-time payments for Pro plan
- Secure signature verification
- Payment status tracking

✅ **Subscription Management**
- Monthly recurring billing
- Automatic plan upgrades
- Subscription cancellation

✅ **Admin Dashboard**
- Revenue analytics
- Payment history
- User statistics
- Export functionality

✅ **Webhook Integration**
- Real-time payment events
- Automatic subscription updates
- Failed payment handling

## Next Steps

1. **Set up webhooks** for production
2. **Configure live keys** for production
3. **Add more payment methods** (UPI, Net Banking, etc.)
4. **Implement refund handling**
5. **Add invoice generation**

## Support

- Razorpay Documentation: [docs.razorpay.com](https://docs.razorpay.com)
- DevFlowHub Issues: Check application logs
- Test Mode: Use test keys and cards only
