import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    console.log('Razorpay webhook event:', event.event)

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break

      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity)
        break

      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload.subscription.entity)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    // Update payment record
    await prisma.razorpayPayment.updateMany({
      where: { razorpayPaymentId: payment.id },
      data: { status: 'paid' }
    })

    console.log('Payment captured:', payment.id)
  } catch (error) {
    console.error('Error handling payment captured:', error)
  }
}

async function handleSubscriptionCharged(subscription: any) {
  try {
    // Update subscription record
    await prisma.razorpaySubscription.updateMany({
      where: { razorpaySubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentStart: subscription.current_start ? new Date(subscription.current_start * 1000) : undefined,
        currentEnd: subscription.current_end ? new Date(subscription.current_end * 1000) : undefined,
        paidCount: subscription.paid_count || 0
      }
    })

    // Update user's next billing date
    if (subscription.current_end) {
      await prisma.user.updateMany({
        where: {
          razorpaySubscriptionId: subscription.id
        },
        data: {
          nextBillingDate: new Date(subscription.current_end * 1000)
        }
      })
    }

    console.log('Subscription charged:', subscription.id)
  } catch (error) {
    console.error('Error handling subscription charged:', error)
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    // Update subscription record
    await prisma.razorpaySubscription.updateMany({
      where: { razorpaySubscriptionId: subscription.id },
      data: {
        status: 'cancelled',
        endedAt: new Date()
      }
    })

    // Downgrade user to free plan
    await prisma.user.updateMany({
      where: {
        razorpaySubscriptionId: subscription.id
      },
      data: {
        plan: 'FREE',
        paymentStatus: 'CANCELLED',
        nextBillingDate: null
      }
    })

    console.log('Subscription cancelled:', subscription.id)
  } catch (error) {
    console.error('Error handling subscription cancelled:', error)
  }
}

async function handleSubscriptionCompleted(subscription: any) {
  try {
    // Update subscription record
    await prisma.razorpaySubscription.updateMany({
      where: { razorpaySubscriptionId: subscription.id },
      data: {
        status: 'completed',
        endedAt: new Date()
      }
    })

    // Downgrade user to free plan
    await prisma.user.updateMany({
      where: {
        razorpaySubscriptionId: subscription.id
      },
      data: {
        plan: 'FREE',
        paymentStatus: 'EXPIRED',
        nextBillingDate: null
      }
    })

    console.log('Subscription completed:', subscription.id)
  } catch (error) {
    console.error('Error handling subscription completed:', error)
  }
}
