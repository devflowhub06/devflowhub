'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, X, ArrowRight, Building2, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText } from '@/components/ui/responsive-container';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started with AI development',
    icon: Code,
    features: [
      '1 hour preview time/month',
      '10 sandbox runs/month',
      '3 deployments/month',
      '3 projects max',
      'Community support',
    ],
    limitations: [
      'Limited AI assistance',
      'Basic templates only',
      'No priority support',
    ],
    cta: 'Current Plan',
    popular: false,
    planId: 'FREE',
    color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    textColor: 'text-gray-600',
  },
  {
    name: 'Pro',
    price: '₹2,399',
    period: 'month',
    description: 'Full AI workspace access with advanced features',
    icon: Sparkles,
    features: [
      '10 hours preview time/month',
      '100 sandbox runs/month',
      '50 deployments/month',
      '50 projects max',
      'Priority support',
      'Advanced templates',
      'Team collaboration',
      'Usage analytics',
      'Custom domains',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    popular: true,
    planId: 'PRO',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    textColor: 'text-blue-600',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Custom solutions for large teams and organizations',
    icon: Building2,
    features: [
      'Unlimited AI tokens',
      'Unlimited preview time',
      'Unlimited sandbox runs',
      'Unlimited deployments',
      'Unlimited projects',
      'Dedicated support',
      'Custom templates',
      'Advanced collaboration',
      'Advanced analytics',
      'Custom integrations',
      'SLA guarantees',
      'On-premise deployment',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    planId: 'ENTERPRISE',
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
    textColor: 'text-purple-600',
  },
];

export default function PricingPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data;
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('FREE');

  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Handle payment flow resumption after login
  useEffect(() => {
    console.log('🔍 Pricing page useEffect triggered');
    console.log('🔐 Session status:', session?.user ? 'Logged in' : 'Not logged in');
    console.log('🌐 Environment:', process.env.NODE_ENV);
    console.log('📍 Current URL:', window.location.href);
    
    // Check if user just logged in and had a pending plan upgrade
    if (typeof window !== 'undefined' && session?.user) {
      const pendingPlan = sessionStorage.getItem('pendingPlanUpgrade');
      const returnToPayment = sessionStorage.getItem('returnToPayment');
      
      console.log('💾 SessionStorage pendingPlan:', pendingPlan);
      console.log('💾 SessionStorage returnToPayment:', returnToPayment);
      console.log('👤 User email:', session.user.email);
      
      if (pendingPlan && returnToPayment === 'true') {
        console.log('🔄 Resuming payment flow for plan:', pendingPlan);
        
        // Clear the flags
        sessionStorage.removeItem('pendingPlanUpgrade');
        sessionStorage.removeItem('returnToPayment');
        
        // Find the plan and trigger payment
        const selectedPlan = plans.find(p => p.planId === pendingPlan);
        if (selectedPlan) {
          console.log('✅ Found selected plan:', selectedPlan.name);
          // Delay to ensure everything is ready
          setTimeout(() => {
            console.log('🚀 About to trigger payment flow');
            toast({
              title: 'Welcome Back!',
              description: 'Continuing with your ' + selectedPlan.name + ' plan upgrade...',
            });
            handlePaymentFlow(selectedPlan);
          }, 1000);
        } else {
          console.log('❌ Selected plan not found for planId:', pendingPlan);
        }
      } else {
        console.log('ℹ️ No pending payment to resume - pendingPlan:', pendingPlan, 'returnToPayment:', returnToPayment);
      }
    } else {
      console.log('ℹ️ User not logged in or window undefined - skipping payment resumption');
      console.log('🔍 Session object:', session);
    }
  }, [session, toast]);

  // Handle payment flow (used when user is already logged in)
  const handlePaymentFlow = async (plan: typeof plans[0]) => {
    console.log('💳 Starting payment flow for plan:', plan.planId);
    
    if (plan.planId === 'FREE') {
      toast({
        title: 'Already on Free Plan',
        description: 'You are currently on the free plan.',
      });
      return;
    }

    if (plan.planId === 'ENTERPRISE') {
      window.open('mailto:abhinay@devflowhub.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    console.log('⏳ Setting loading state...');
    setLoading(true);

    try {
      // Use subscription flow for Pro plan
      const endpoint = '/api/payment/create-subscription';
      console.log('📡 Making request to endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: plan.planId }),
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();
      console.log('✅ Payment data received:', data);

      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        console.error('❌ Razorpay not loaded');
        throw new Error('Payment gateway not loaded. Please refresh the page.');
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'DevFlowHub',
        description: plan.description,
        amount: data.amount,
        currency: 'INR',
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async function (response: any) {
          console.log('💳 Payment response:', response);
          
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.planId,
              }),
            });

            if (verifyResponse.ok) {
              toast({
                title: 'Payment Successful! 🎉',
                description: `You've upgraded to ${plan.name} - full AI power unlocked!`,
              });
              
              // Redirect to dashboard
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('❌ Verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support if the amount was deducted.',
              variant: 'destructive',
            });
          }
        },
        modal: {
          ondismiss: function() {
            console.log('❌ Payment cancelled');
            toast({
              title: 'Payment Cancelled',
              description: 'You can try again anytime.',
            });
          }
        }
      };

      console.log('🚀 Opening Razorpay modal with options:', options);
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle plan selection (redirect to login if not authenticated)
  const handlePlanSelect = async (plan: typeof plans[0]) => {
    console.log('🚀 Starting plan selection for:', plan.planId);
    console.log('🔐 User session:', session?.user);
    console.log('🌐 Environment:', process.env.NODE_ENV);
    console.log('📍 Current URL:', window.location.href);
    
    if (!session?.user) {
      console.log('❌ No user session found - redirecting to login');
      
      // Store the selected plan in sessionStorage before redirecting
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingPlanUpgrade', plan.planId);
        sessionStorage.setItem('returnToPayment', 'true');
        console.log('💾 Stored in sessionStorage - pendingPlanUpgrade:', plan.planId);
        console.log('💾 Stored in sessionStorage - returnToPayment: true');
      }
      
      toast({
        title: 'Sign in to Continue',
        description: 'Sign in to upgrade to ' + plan.name + ' plan.',
      });
      
      // Redirect to login page with return URL to pricing page
      const loginUrl = `/login?callbackUrl=${encodeURIComponent('/pricing')}`;
      console.log('🔄 Redirecting to login URL:', loginUrl);
      router.push(loginUrl);
      return;
    }

    // If user is logged in, proceed with payment flow
    console.log('✅ User is logged in, proceeding with payment flow');
    await handlePaymentFlow(plan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Development Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Unlock the full potential of AI-powered development with our flexible pricing plans.
            Start free and scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.planId}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular
                    ? 'ring-2 ring-blue-500 shadow-2xl scale-105'
                    : 'hover:ring-1 hover:ring-gray-400'
                } ${plan.color} ${plan.textColor}`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center">
                        <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={loading || (session?.user && plan.planId === currentPlan)}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                        : 'bg-gray-800 hover:bg-gray-700'
                    } text-white`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : session?.user && plan.planId === currentPlan ? (
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </div>
                    ) : !session?.user ? (
                      <div className="flex items-center justify-center">
                        Sign In to {plan.cta}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        {plan.cta}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Compare All Features</h2>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 font-semibold">Features</th>
                    <th className="text-center py-4 px-6 font-semibold">Free</th>
                    <th className="text-center py-4 px-6 font-semibold">Pro</th>
                    <th className="text-center py-4 px-6 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6">AI Tokens</td>
                    <td className="text-center py-4 px-6">10K/month</td>
                    <td className="text-center py-4 px-6">100K/month</td>
                    <td className="text-center py-4 px-6">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6">Preview Time</td>
                    <td className="text-center py-4 px-6">1 hour/month</td>
                    <td className="text-center py-4 px-6">10 hours/month</td>
                    <td className="text-center py-4 px-6">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6">Sandbox Runs</td>
                    <td className="text-center py-4 px-6">10/month</td>
                    <td className="text-center py-4 px-6">100/month</td>
                    <td className="text-center py-4 px-6">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6">Projects</td>
                    <td className="text-center py-4 px-6">3 max</td>
                    <td className="text-center py-4 px-6">50 max</td>
                    <td className="text-center py-4 px-6">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6">Support</td>
                    <td className="text-center py-4 px-6">Community</td>
                    <td className="text-center py-4 px-6">Priority</td>
                    <td className="text-center py-4 px-6">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
