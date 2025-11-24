'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface BillingInfo {
  success: boolean;
  customer?: any;
  subscription?: any;
  invoices?: any[];
  currentUsage?: Record<string, number>;
  error?: string;
}

interface BillingContextType {
  billingInfo: BillingInfo | null;
  loading: boolean;
  error: string | null;
  refreshBillingInfo: () => Promise<void>;
  createCheckoutSession: (plan: 'pro' | 'enterprise', options?: {
    projectId?: string;
    coupon?: string;
    trialDays?: number;
  }) => Promise<{ url: string } | null>;
  openBillingPortal: () => Promise<void>;
  recordUsage: (params: {
    subscriptionItemId: string;
    quantity: number;
    action: 'ai_tokens' | 'preview_minutes' | 'sandbox_runs' | 'deployments';
    projectId?: string;
  }) => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBillingInfo = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/customer');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch billing info');
      }

      if (data.success) {
        setBillingInfo(data);
      } else {
        setError(data.error || 'Failed to fetch billing info');
        setBillingInfo(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBillingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (
    plan: 'pro' | 'enterprise',
    options: {
      projectId?: string;
      coupon?: string;
      trialDays?: number;
    } = {}
  ) => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      return { url: data.url };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const openBillingPortal = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/billing/portal');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create billing portal session');
      }

      window.open(data.url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const recordUsage = async (params: {
    subscriptionItemId: string;
    quantity: number;
    action: 'ai_tokens' | 'preview_minutes' | 'sandbox_runs' | 'deployments';
    projectId?: string;
  }) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/billing/usage-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to record usage');
      }
    } catch (err) {
      console.error('Failed to record usage:', err);
      // Don't set error state for usage recording failures
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      refreshBillingInfo();
    }
  }, [session?.user?.id]);

  const value: BillingContextType = {
    billingInfo,
    loading,
    error,
    refreshBillingInfo,
    createCheckoutSession,
    openBillingPortal,
    recordUsage,
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
