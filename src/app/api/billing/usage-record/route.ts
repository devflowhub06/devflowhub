import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { billingService } from '@/lib/billing-service';
import { z } from 'zod';

const usageRecordSchema = z.object({
  subscriptionItemId: z.string(),
  quantity: z.number().min(1),
  timestamp: z.string().datetime().optional(),
  projectId: z.string().optional(),
  action: z.enum(['ai_tokens', 'preview_minutes', 'sandbox_runs', 'deployments']),
  metadata: z.record(z.any()).optional(),
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
    const validatedData = usageRecordSchema.parse(body);

    const result = await billingService.recordUsage({
      subscriptionItemId: validatedData.subscriptionItemId,
      quantity: validatedData.quantity,
      timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : undefined,
      projectId: validatedData.projectId,
      action: validatedData.action,
      metadata: validatedData.metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      usageRecord: result.usageRecord,
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    
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
