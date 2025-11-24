'use client';

import React from 'react';
import { useBilling } from '@/contexts/BillingContext';
import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getPlanLimits, getUsagePercentage } from '@/lib/stripe';

export default function UsageWarning() {
  const { billingInfo, createCheckoutSession } = useBilling();

  if (!billingInfo?.subscription) {
    return null;
  }

  const plan = billingInfo.subscription.plan;
  const currentUsage = billingInfo.currentUsage || {};
  
  // Transform the usage data to match the expected format
  const transformedUsage = {
    aiTokens: currentUsage.ai_tokens || 0,
    previewMinutes: currentUsage.preview_minutes || 0,
    sandboxRuns: currentUsage.sandbox_runs || 0,
    deployments: currentUsage.deployments || 0,
  };
  
  const limits = getPlanLimits(plan);
  const usagePercentage = getUsagePercentage(transformedUsage, plan);

  // Check if any usage is over 80%
  const isNearLimit = Object.values(usagePercentage).some(percentage => percentage >= 80);
  const isOverLimit = Object.values(usagePercentage).some(percentage => percentage >= 100);

  if (!isNearLimit && !isOverLimit) {
    return null;
  }

  const getUsageItems = () => {
    const items = [];
    
    if (usagePercentage.aiTokens >= 80) {
      items.push({
        name: 'AI Tokens',
        current: transformedUsage.aiTokens,
        limit: limits.aiTokens,
        percentage: usagePercentage.aiTokens,
        overLimit: usagePercentage.aiTokens >= 100,
      });
    }
    
    if (usagePercentage.previewMinutes >= 80) {
      items.push({
        name: 'Preview Time',
        current: Math.round(transformedUsage.previewMinutes / 60 * 10) / 10,
        limit: Math.round(limits.previewMinutes / 60 * 10) / 10,
        percentage: usagePercentage.previewMinutes,
        overLimit: usagePercentage.previewMinutes >= 100,
        unit: 'hours',
      });
    }
    
    if (usagePercentage.sandboxRuns >= 80) {
      items.push({
        name: 'Sandbox Runs',
        current: transformedUsage.sandboxRuns,
        limit: limits.sandboxRuns,
        percentage: usagePercentage.sandboxRuns,
        overLimit: usagePercentage.sandboxRuns >= 100,
      });
    }
    
    if (usagePercentage.deployments >= 80) {
      items.push({
        name: 'Deployments',
        current: transformedUsage.deployments,
        limit: limits.deployments,
        percentage: usagePercentage.deployments,
        overLimit: usagePercentage.deployments >= 100,
      });
    }
    
    return items;
  };

  const usageItems = getUsageItems();

  if (usageItems.length === 0) {
    return null;
  }

  const handleUpgrade = async () => {
    const result = await createCheckoutSession('pro', {
      trialDays: 14,
    });
    
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <Alert className={`mb-6 ${isOverLimit ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isOverLimit ? 'text-red-500' : 'text-yellow-500'}`} />
      <AlertDescription>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              {isOverLimit ? 'Usage Limit Exceeded' : 'Approaching Usage Limits'}
            </h4>
            <p className="text-sm text-gray-600">
              {isOverLimit 
                ? 'You have exceeded your plan limits. Upgrade to continue using DevFlowHub.'
                : 'You are approaching your plan limits. Consider upgrading to avoid interruptions.'
              }
            </p>
          </div>

          <div className="space-y-3">
            {usageItems.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className={item.overLimit ? 'text-red-600' : 'text-yellow-600'}>
                    {item.current.toLocaleString()}{item.unit ? ` ${item.unit}` : ''} / {item.limit.toLocaleString()}{item.unit ? ` ${item.unit}` : ''}
                  </span>
                </div>
                <Progress 
                  value={item.percentage} 
                  className={`h-2 ${item.overLimit ? '[&>div]:bg-red-500' : '[&>div]:bg-yellow-500'}`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-600">
              {plan === 'free' ? (
                'Upgrade to Pro for higher limits and more features.'
              ) : (
                'Consider upgrading to Enterprise for unlimited usage.'
              )}
            </div>
            <Button
              onClick={handleUpgrade}
              className={`${isOverLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}
            >
              <Zap className="h-4 w-4 mr-2" />
              {plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Enterprise'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
