import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      razorpay_subscription_id
    } = await request.json()

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Verify the signature
    // For subscriptions, Razorpay still returns order_id in handler only for certain flows.
    // We accept either subscription-based or order-based verification using the same scheme when order_id exists.
    const baseId = razorpay_order_id || razorpay_subscription_id
    const isSignatureValid = baseId ? verifyRazorpaySignature(baseId, razorpay_payment_id, razorpay_signature) : false

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Get payment record from database
    const payment = razorpay_order_id ? await prisma.razorpayPayment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { user: true }
    }) : null

    // For subscription-based flow, there might be no matching razorpayPayment row.
    if (!payment && !razorpay_subscription_id) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    if (payment && payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized payment verification' }, { status: 403 })
    }

    // Update payment record
    if (payment) {
      await prisma.razorpayPayment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'paid'
        }
      })
    } else if (razorpay_subscription_id) {
      // Mark subscription active on first successful charge
      await prisma.razorpaySubscription.updateMany({
        where: { razorpaySubscriptionId: razorpay_subscription_id },
        data: { status: 'active' }
      })
    }

    // Update user plan and payment status
    const nextBillingDate = new Date()
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    const nextUserUpdate = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: payment?.plan || 'PRO',
        paymentStatus: 'ACTIVE',
        nextBillingDate: nextBillingDate
      }
    })

    // Create subscription record
    if (!razorpay_subscription_id && payment) {
      await prisma.razorpaySubscription.create({
        data: {
          razorpaySubscriptionId: `sub_${razorpay_payment_id}`,
          userId: session.user.id,
          plan: payment.plan,
          status: 'active',
          currentStart: new Date(),
          currentEnd: nextBillingDate,
          totalCount: 12,
          paidCount: 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      plan: (payment?.plan as any) || 'PRO',
      nextBillingDate: nextBillingDate.toISOString()
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
