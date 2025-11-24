'use client'

import { useRouter } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '',
    description: 'Perfect for individual developers',
    features: [
      '1 project/month',
      'Basic AI routing',
      'Community support',
      'Basic templates'
    ],
    cta: 'Start Free',
    ctaLink: '/signup',
    gradient: 'from-slate-800/50 to-slate-900/50',
    borderColor: 'border-slate-700',
    buttonStyle: 'border border-slate-600 text-white hover:bg-slate-700'
  },
  {
    name: 'Pro',
    price: '₹2,399',
    period: '/month',
    description: 'For professional developers',
    features: [
      'Save 10+ hours/week',
      'Unlimited projects',
      'Full AI workspaces (Editor, Sandbox, UI Studio, Deployer)',
      'Advanced AI Assistant',
      'Real-time analytics',
      'Priority support'
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup',
    popular: true,
    gradient: 'from-blue-800/50 to-blue-900/50',
    borderColor: 'border-blue-700',
    buttonStyle: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(56,189,248,0.6)]'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations',
    features: [
      'Team collaboration',
      'On-prem deployment',
      'API/SDK integrations',
      'Dedicated support',
      'Custom SLAs'
    ],
    cta: 'Contact Sales',
    ctaLink: '/book-demo',
    gradient: 'from-purple-800/50 to-purple-900/50',
    borderColor: 'border-purple-700',
    buttonStyle: 'border border-purple-600 text-purple-400 hover:bg-purple-900'
  }
]

export default function Pricing() {
  const router = useRouter()

  return (
    <section id="pricing" className="py-20 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6">
            Simple, transparent pricing for every developer
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-3xl mx-auto">
            Start free, scale as you grow. Save 10+ hours per week with AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
                className={`relative bg-gradient-to-br ${plan.gradient} border ${plan.borderColor} rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-white/30 ${
                plan.popular ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push(plan.ctaLink)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${plan.buttonStyle} hover:scale-105`}
              >
                {plan.cta}
                {plan.cta === 'Start Free Trial' && <ArrowRight className="w-4 h-4 ml-2 inline" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}