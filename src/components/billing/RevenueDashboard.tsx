'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  conversionRate: number;
  churnRate: number;
  averageRevenuePerUser: number;
  growthRate: number;
}

export default function RevenueDashboard() {
  const { billingInfo, loading } = useBilling();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRevenueData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/billing/revenue');
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h2>
          <p className="text-gray-600">
            Monitor your billing performance and revenue metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRevenueData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Stripe Dashboard
          </Button>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData ? formatCurrency(revenueData.totalRevenue) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData ? formatCurrency(revenueData.monthlyRevenue) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData ? revenueData.activeSubscriptions : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            {revenueData && revenueData.growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData ? formatPercentage(revenueData.growthRate) : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
            <CardDescription>
              Free to paid conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {revenueData ? `${revenueData.conversionRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Users upgrading to paid plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Churn Rate</CardTitle>
            <CardDescription>
              Monthly subscription cancellations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {revenueData ? `${revenueData.churnRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Customers lost this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ARPU</CardTitle>
            <CardDescription>
              Average Revenue Per User
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {revenueData ? formatCurrency(revenueData.averageRevenuePerUser) : '$0.00'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Monthly average per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your billing and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => window.open('https://dashboard.stripe.com/customers', '_blank')}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              View Customers
            </Button>
            <Button
              onClick={() => window.open('https://dashboard.stripe.com/subscriptions', '_blank')}
              variant="outline"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View Subscriptions
            </Button>
            <Button
              onClick={() => window.open('https://dashboard.stripe.com/payments', '_blank')}
              variant="outline"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              View Payments
            </Button>
            <Button
              onClick={() => window.open('https://dashboard.stripe.com/analytics', '_blank')}
              variant="outline"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
