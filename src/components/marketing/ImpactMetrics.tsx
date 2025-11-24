'use client'

import { Users, Rocket, Zap, Shield, CheckCircle } from 'lucide-react'

const metrics = [
  {
    icon: Users,
    value: '2,000+',
    label: 'Active Users',
    description: 'Building with DevFlowHub',
    trend: 'Growing rapidly',
    color: 'cyan'
  },
  {
    icon: Rocket,
    value: '27',
    label: 'Countries',
    description: 'Global reach',
    trend: 'Worldwide adoption',
    color: 'purple'
  },
  {
    icon: Zap,
    value: '10x',
    label: 'Faster Development',
    description: 'AI-powered workflow',
    trend: 'Than traditional tools',
    color: 'green'
  },
  {
    icon: Shield,
    value: '99.9%',
    label: 'Reliability',
    description: 'Enterprise ready',
    trend: 'Production stable',
    color: 'orange'
  },
]

export default function ImpactMetrics() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-bg-900" id="metrics">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Growing{' '}
            <span className="text-accent-warn">Globally</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers across 27 countries building faster with AI.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-surface-800 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center hover:border-accent-warn/50 transition-all duration-200"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-warn/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <metric.icon className="w-6 h-6 sm:w-8 sm:h-8 text-accent-warn" />
              </div>

              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {metric.value}
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                {metric.label}
              </h3>

              <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                {metric.description}
              </p>

              <div className="flex items-center justify-center space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 text-xs font-semibold">
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}