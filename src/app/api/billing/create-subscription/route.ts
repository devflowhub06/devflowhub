import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { billingService } from '@/lib/billing-service';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  priceId: z.string(),
  trialDays: z.number().min(0).max(30).optional(),
  coupon: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Get or create Stripe customer
    const customer = await billingService.getOrCreateStripeCustomer(session.user.id);
    
    const result = await billingService.createSubscription({
      customerId: customer.stripeCustomerId,
      priceId: validatedData.priceId,
      trialDays: validatedData.trialDays,
      coupon: validatedData.coupon,
      metadata: validatedData.metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      subscription: result.subscription,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
