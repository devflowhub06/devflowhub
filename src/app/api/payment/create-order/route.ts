import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createRazorpayOrder, createRazorpayCustomer, RAZORPAY_CONFIG } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!plan || !['PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has an active subscription
    if (user.paymentStatus === 'ACTIVE' && user.plan === plan) {
      return NextResponse.json({ error: 'Subscription already active' }, { status: 400 })
    }

    const planConfig = RAZORPAY_CONFIG.plans[plan as keyof typeof RAZORPAY_CONFIG.plans]
    
    // Create Razorpay customer for this transaction
    const customer = await createRazorpayCustomer(
      user.email!,
      user.name || 'DevFlowHub User'
    )
    const razorpayCustomerId = customer.id
    console.log('Created/found Razorpay customer:', razorpayCustomerId)

    // For Enterprise plan, redirect to contact sales
    if (plan === 'ENTERPRISE') {
      return NextResponse.json({
        type: 'contact_sales',
        message: 'Please contact our sales team for Enterprise pricing'
      })
    }

    // Create Razorpay order for Pro plan
    const order = await createRazorpayOrder(planConfig.amount / 100) // Convert paise to rupees

    // Store payment record in database
    await prisma.razorpayPayment.create({
      data: {
        razorpayOrderId: order.id,
        userId: user.id,
        plan: plan as any,
        amount: planConfig.amount,
        currency: 'INR',
        status: 'created',
        metadata: {
          customerId: razorpayCustomerId,
          planName: planConfig.name
        }
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_CONFIG.keyId,
      customerId: razorpayCustomerId
    })

  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
