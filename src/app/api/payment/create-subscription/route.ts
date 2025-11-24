import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createRazorpayCustomer, createRazorpaySubscription, RAZORPAY_CONFIG } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating subscription for plan:', request.body);
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log('❌ No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()
    console.log('📋 Plan requested:', plan);

    if (!plan || !['PRO', 'ENTERPRISE'].includes(plan)) {
      console.log('❌ Invalid plan:', plan);
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user details
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      console.log('❌ User not found for ID:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found:', user.email, user.name);

    // Enterprise remains contact-sales flow
    if (plan === 'ENTERPRISE') {
      return NextResponse.json({ type: 'contact_sales' })
    }

    // Check if already active on the same plan
    if (user.paymentStatus === 'ACTIVE' && user.plan === plan) {
      return NextResponse.json({ error: 'Subscription already active' }, { status: 400 })
    }

    // Check environment variables
    console.log('🔑 Environment check:');
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING');
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING');
    console.log('RAZORPAY_PRO_PLAN_ID:', process.env.RAZORPAY_PRO_PLAN_ID ? 'SET' : 'MISSING');

    const planConfig = RAZORPAY_CONFIG.plans[plan as keyof typeof RAZORPAY_CONFIG.plans]
    console.log('🔧 Plan config:', planConfig);
    console.log('🔑 Razorpay key ID:', RAZORPAY_CONFIG.keyId);

    if (!planConfig.id) {
      console.log('❌ Plan ID is missing');
      return NextResponse.json({ error: 'Plan configuration missing' }, { status: 500 })
    }

    // Create Razorpay customer for this transaction
    console.log('🔄 Creating Razorpay customer...');
    const customer = await createRazorpayCustomer(user.email!, user.name || 'DevFlowHub User')
    const razorpayCustomerId = customer.id
    console.log('✅ Created/found Razorpay customer:', razorpayCustomerId)

    // Create a Razorpay subscription for the Pro plan
    console.log('🔄 Creating Razorpay subscription...');
    const subscription = await createRazorpaySubscription(planConfig.id, razorpayCustomerId!)

    // Record (or upsert) a subscription row in DB with status from Razorpay
    console.log('🔄 Saving subscription to database...');
    await prisma.razorpaySubscription.upsert({
      where: { razorpaySubscriptionId: subscription.id },
      create: {
        razorpaySubscriptionId: subscription.id,
        userId: user.id,
        plan: plan as any,
        status: subscription.status || 'created',
        currentStart: subscription.current_start ? new Date(subscription.current_start * 1000) : undefined,
        currentEnd: subscription.current_end ? new Date(subscription.current_end * 1000) : undefined,
        totalCount: subscription.total_count ?? 12,
        paidCount: subscription.paid_count ?? 0,
      },
      update: {
        status: subscription.status || 'created',
        currentStart: subscription.current_start ? new Date(subscription.current_start * 1000) : undefined,
        currentEnd: subscription.current_end ? new Date(subscription.current_end * 1000) : undefined,
        totalCount: subscription.total_count ?? 12,
        paidCount: subscription.paid_count ?? 0,
      }
    })

    // Note: Subscription ID stored in razorpaySubscription table for webhook linkage
    console.log('✅ Created Razorpay subscription:', subscription.id)

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: RAZORPAY_CONFIG.keyId,
      customerId: razorpayCustomerId,
    })
  } catch (error: any) {
    console.error('❌ Error creating Razorpay subscription:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      error: error.error
    });
    return NextResponse.json({ 
      error: 'Failed to create subscription',
      details: error.message 
    }, { status: 500 })
  }
}


