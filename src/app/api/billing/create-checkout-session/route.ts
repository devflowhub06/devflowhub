import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { billingService } from '@/lib/billing-service';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  plan: z.enum(['pro', 'enterprise']),
  projectId: z.string().optional(),
  coupon: z.string().optional(),
  trialDays: z.number().min(0).max(30).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
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
    const validatedData = createCheckoutSchema.parse(body);

    const result = await billingService.createCheckoutSession({
      plan: validatedData.plan,
      userId: session.user.id,
      projectId: validatedData.projectId,
      coupon: validatedData.coupon,
      trialDays: validatedData.trialDays || 14,
      successUrl: validatedData.successUrl,
      cancelUrl: validatedData.cancelUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
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
