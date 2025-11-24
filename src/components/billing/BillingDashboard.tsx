'use client';

import React from 'react';
import { useBilling } from '@/contexts/BillingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

export default function BillingDashboard() {
  const { billingInfo, loading, openBillingPortal } = useBilling();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unable to load billing information
        </h3>
        <p className="text-gray-600">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    );
  }

  const { customer, subscription, invoices, currentUsage } = billingInfo;
  const plan = subscription?.plan || 'free';
  const safeInvoices = invoices || [];
  const safeCurrentUsage = currentUsage || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'trialing':
        return <Clock className="h-4 w-4" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing & Usage</h2>
        <p className="text-gray-600">
          Manage your subscription and monitor your usage
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>
                {subscription ? (
                  <>
                    {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                    {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                      <span className="ml-2 text-blue-600">
                        (Trial until {format(new Date(subscription.trialEnd), 'MMM dd, yyyy')})
                      </span>
                    )}
                  </>
                ) : (
                  'Free Plan'
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {subscription && (
                <Badge className={getStatusColor(subscription.status)}>
                  {getStatusIcon(subscription.status)}
                  <span className="ml-1 capitalize">{subscription.status}</span>
                </Badge>
              )}
              <Button variant="outline" onClick={openBillingPortal}>
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Overview */}
      {subscription && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Tokens</p>
                  <p className="text-2xl font-bold">
                    {safeCurrentUsage.ai_tokens?.toLocaleString() || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
              <Progress 
                value={Math.min((safeCurrentUsage.ai_tokens || 0) / 100000 * 100, 100)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Preview Time</p>
                  <p className="text-2xl font-bold">
                    {Math.round((safeCurrentUsage.preview_minutes || 0) / 60 * 10) / 10}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <Progress 
                value={Math.min((safeCurrentUsage.preview_minutes || 0) / 600 * 100, 100)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sandbox Runs</p>
                  <p className="text-2xl font-bold">
                    {safeCurrentUsage.sandbox_runs || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <Progress 
                value={Math.min((safeCurrentUsage.sandbox_runs || 0) / 100 * 100, 100)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deployments</p>
                  <p className="text-2xl font-bold">
                    {safeCurrentUsage.deployments || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
              <Progress 
                value={Math.min((safeCurrentUsage.deployments || 0) / 50 * 100, 100)} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Your latest billing statements and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {safeInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invoices yet
            </div>
          ) : (
            <div className="space-y-4">
              {safeInvoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {invoice.paid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        ${(invoice.amountDue / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={invoice.paid ? 'default' : 'secondary'}
                    >
                      {invoice.paid ? 'Paid' : 'Pending'}
                    </Badge>
                    {invoice.hostedInvoiceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Your account and payment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Email:</span> {customer?.email}
                </p>
                <p>
                  <span className="text-gray-600">Name:</span> {customer?.name || 'Not provided'}
                </p>
                <p>
                  <span className="text-gray-600">Customer ID:</span> {customer?.stripeCustomerId}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Subscription Details</h4>
              <div className="space-y-2 text-sm">
                {subscription ? (
                  <>
                    <p>
                      <span className="text-gray-600">Status:</span> {subscription.status}
                    </p>
                    <p>
                      <span className="text-gray-600">Current Period:</span>{' '}
                      {format(new Date(subscription.currentPeriodStart), 'MMM dd')} -{' '}
                      {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                    </p>
                    {subscription.cancelAtPeriodEnd && (
                      <p className="text-orange-600">
                        <span className="text-gray-600">Cancels:</span> At period end
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No active subscription</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
