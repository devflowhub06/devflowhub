import Razorpay from 'razorpay'
import crypto from 'crypto'

// Lazily initialize Razorpay to avoid import-time env issues in dev
let razorpayInstance: Razorpay | null = null
export function getRazorpay(): Razorpay {
  if (razorpayInstance) return razorpayInstance
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET')
  }
  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret })
  return razorpayInstance
}

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  keyId: process.env.RAZORPAY_KEY_ID!,
  currency: 'INR',
  plans: {
    FREE: {
      id: 'plan_free',
      amount: 0,
      interval: 'monthly',
      name: 'Free Plan',
      description: 'Basic features for getting started'
    },
    PRO: {
      id: process.env.RAZORPAY_PRO_PLAN_ID || 'plan_pro',
      amount: 239900, // ₹2,399 in paise
      interval: 'monthly',
      name: 'Pro Plan',
      description: 'Full AI workspace access with advanced features'
    },
    ENTERPRISE: {
      id: process.env.RAZORPAY_ENTERPRISE_PLAN_ID || 'plan_enterprise',
      amount: 0, // Custom pricing
      interval: 'monthly',
      name: 'Enterprise Plan',
      description: 'Custom solutions for large teams'
    }
  }
}

// Verify Razorpay signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(orderId + '|' + paymentId)
    .digest('hex')

  return expectedSignature === signature
}

// Create Razorpay order
export async function createRazorpayOrder(amount: number, currency: string = 'INR') {
  try {
    const order = await getRazorpay().orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        platform: 'DevFlowHub',
        version: '2.0'
      }
    })

    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw new Error('Failed to create payment order')
  }
}

// Create Razorpay subscription
export async function createRazorpaySubscription(
  planId: string,
  customerId: string,
  startDate?: number
) {
  try {
    // Set start_at to 1 minute from now to avoid "start_at cannot be lesser than the current time" error
    const startAt = startDate || Math.floor(Date.now() / 1000) + 60
    
    const subscription = await getRazorpay().subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: 12, // 12 months
      quantity: 1,
      start_at: startAt,
      notify_info: {
        notify_email: true,
        notify_sms: false
      }
    })

    return subscription
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error)
    throw new Error('Failed to create subscription')
  }
}

// Create Razorpay customer
export async function createRazorpayCustomer(
  email: string,
  name: string,
  contact?: string
) {
  try {
    console.log('🔍 Starting customer creation process for:', email)
    console.log('🔑 Razorpay instance available:', !!getRazorpay())
    
    // First try to find existing customer
    console.log('🔍 Looking for existing Razorpay customer with email:', email)
    const existingCustomers = await getRazorpay().customers.all({
      query: email,
    });
    
    console.log('📋 Existing customers found:', existingCustomers.items?.length || 0)
    
    if (existingCustomers.items && existingCustomers.items.length > 0) {
      console.log('✅ Found existing Razorpay customer:', existingCustomers.items[0].id)
      return existingCustomers.items[0];
    }

    // If no existing customer, create new one
    console.log('🆕 Creating new Razorpay customer for email:', email)
    const customer = await getRazorpay().customers.create({
      email,
      name,
      contact: contact || undefined,
      notes: {
        platform: 'DevFlowHub'
      }
    })

    console.log('✅ Created new Razorpay customer:', customer.id)
    return customer
  } catch (error: any) {
    console.error('❌ Error creating Razorpay customer:', error)
    console.error('❌ Error details:', {
      statusCode: error.statusCode,
      code: error.error?.code,
      description: error.error?.description,
      message: error.message
    })
    
    // If customer already exists, try to fetch it by email
    if (error.statusCode === 400 && error.error?.code === 'BAD_REQUEST_ERROR' && 
        error.error?.description?.includes('Customer already exists')) {
      console.log('🔄 Customer already exists, trying to fetch existing customer...')
      
      try {
        const existingCustomers = await getRazorpay().customers.all({
          query: email,
        });
        
        if (existingCustomers.items && existingCustomers.items.length > 0) {
          const existingCustomer = existingCustomers.items.find((c: any) => c.email === email);
          if (existingCustomer) {
            console.log('✅ Found existing customer:', existingCustomer.id)
            return existingCustomer;
          }
        }
      } catch (fetchError) {
        console.error('❌ Error fetching existing customer:', fetchError)
      }
    }
    
    throw new Error(`Failed to create or find customer: ${error.message || 'Unknown error'}`)
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await getRazorpay().subscriptions.fetch(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw new Error('Failed to fetch subscription details')
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await getRazorpay().subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}
