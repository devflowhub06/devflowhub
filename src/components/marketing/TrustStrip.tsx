'use client'

import { Users, TrendingUp, Shield, Zap } from 'lucide-react'

const metrics = [
  { icon: Users, value: '10,000+', label: 'Active Developers' },
  { icon: TrendingUp, value: '99.9%', label: 'Success Rate' },
  { icon: Shield, value: '50+', label: 'AI Models' },
  { icon: Zap, value: '3x', label: 'Faster Development' }
]

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Netflix', 'Spotify', 'OpenAI'
]

export default function TrustStrip() {
  return (
    <section className="py-16 bg-[#070A12] border-y border-white/5">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-cyan-400 mr-2" />
                  <span className="text-3xl font-bold text-white">{metric.value}</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">{metric.label}</p>
              </div>
            )
          })}
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="text-2xl font-bold text-white hover:opacity-100 transition-opacity duration-300">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
