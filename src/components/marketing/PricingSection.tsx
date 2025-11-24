'use client'

import { CheckCircle, XCircle, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for individual developers",
    features: [
      "5 projects",
      "Basic AI assistance",
      "Community support",
      "1GB storage",
      "Standard templates"
    ],
    cta: "Start Building Free",
    ctaLink: "/signup",
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious developers and teams",
    features: [
      "Unlimited projects",
      "Advanced AI context",
      "Team collaboration",
      "50GB storage",
      "Premium templates",
      "Priority support",
      "Advanced analytics",
      "Custom domains"
    ],
    cta: "Start Pro Trial",
    ctaLink: "/signup?plan=pro",
    popular: true,
    savings: "Save $120/year"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large teams and enterprise",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Custom AI models",
      "On-premise deployment",
      "SLA guarantee",
      "Dedicated support",
      "Custom integrations",
      "Advanced security"
    ],
    cta: "Contact Sales",
    ctaLink: "/book-demo",
    popular: false
  }
]

export default function PricingSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-surface-800" id="pricing">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Simple, Transparent{' '}
            <span className="text-accent-warn">Pricing</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-bg-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 border transition-all duration-200 hover:scale-105 ${
                plan.popular 
                  ? 'border-accent-warn/50 ring-2 ring-accent-warn/20' 
                  : 'border-white/10 hover:border-accent-warn/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent-warn text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center space-x-1">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-base sm:text-lg">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="text-green-400 text-xs sm:text-sm font-semibold mb-2">
                    {plan.savings}
                  </div>
                )}
                <p className="text-gray-300 text-xs sm:text-sm">{plan.description}</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2 sm:space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-xs sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.ctaLink}
                className={`w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base ${
                  plan.popular
                    ? 'bg-accent-warn text-white hover:bg-orange-600 hover:shadow-xl'
                    : 'border-2 border-accent-warn/40 text-accent-warn hover:border-accent-warn hover:bg-accent-warn/10'
                }`}
              >
                {plan.cta}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center px-2">
          <div className="bg-bg-900 border border-accent-warn/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Still Not Sure? Try It Risk-Free
            </h3>
            <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
              14-day free trial • No credit card required • Cancel anytime
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-accent-warn text-white font-bold rounded-xl hover:bg-orange-600 transition-all duration-200 hover:shadow-xl text-sm sm:text-base"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/20 text-white hover:text-accent-warn hover:border-accent-warn rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
              >
                Book Demo Call
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}