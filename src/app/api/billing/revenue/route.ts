import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin (you might want to add an admin role check here)
    // For now, we'll allow any authenticated user to see revenue data
    
    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe not configured'
      }, { status: 500 });
    }

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch data from Stripe
    const [
      subscriptions,
      invoices,
      customers
    ] = await Promise.all([
      stripe.subscriptions.list({ limit: 100, status: 'active' }),
      stripe.invoices.list({ 
        limit: 100,
        created: {
          gte: Math.floor(startOfMonth.getTime() / 1000)
        }
      }),
      stripe.customers.list({ limit: 100 })
    ]);

    // Calculate metrics
    const activeSubscriptions = subscriptions.data.length;
    
    // Calculate monthly revenue
    const monthlyRevenue = invoices.data.reduce((sum, invoice) => {
      return sum + (invoice.amount_paid || 0);
    }, 0) / 100; // Convert from cents to dollars

    // Calculate total revenue (all time)
    const allInvoices = await stripe.invoices.list({ limit: 100 });
    const totalRevenue = allInvoices.data.reduce((sum, invoice) => {
      return sum + (invoice.amount_paid || 0);
    }, 0) / 100;

    // Calculate conversion rate (simplified)
    const totalCustomers = customers.data.length;
    const conversionRate = totalCustomers > 0 ? (activeSubscriptions / totalCustomers) * 100 : 0;

    // Calculate churn rate (simplified - would need more historical data for accuracy)
    const canceledSubscriptions = await stripe.subscriptions.list({ 
      limit: 100, 
      status: 'canceled',
      created: {
        gte: Math.floor(startOfMonth.getTime() / 1000)
      }
    });
    const churnRate = activeSubscriptions > 0 ? (canceledSubscriptions.data.length / activeSubscriptions) * 100 : 0;

    // Calculate ARPU
    const averageRevenuePerUser = activeSubscriptions > 0 ? monthlyRevenue / activeSubscriptions : 0;

    // Calculate growth rate (simplified)
    const lastMonthInvoices = await stripe.invoices.list({
      limit: 100,
      created: {
        gte: Math.floor(startOfLastMonth.getTime() / 1000),
        lt: Math.floor(endOfLastMonth.getTime() / 1000)
      }
    });
    const lastMonthRevenue = lastMonthInvoices.data.reduce((sum, invoice) => {
      return sum + (invoice.amount_paid || 0);
    }, 0) / 100;
    
    const growthRate = lastMonthRevenue > 0 ? 
      ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    const revenueData = {
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions,
      conversionRate,
      churnRate,
      averageRevenuePerUser,
      growthRate
    };

    return NextResponse.json(revenueData);

  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
