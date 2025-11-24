'use client'

import { Code, Cpu, Layers, Rocket, Brain, Zap, Shield, Globe } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: '10x faster development with AI-powered code generation and intelligent suggestions.',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance with SOC 2, GDPR, and HIPAA standards.',
    color: 'from-green-400 to-emerald-500'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Deploy to 200+ regions worldwide with automatic scaling and edge optimization.',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    icon: Brain,
    title: 'AI Memory',
    description: 'Context-aware AI that remembers your entire project history and preferences.',
    color: 'from-purple-400 to-pink-500'
  }
]

export default function FeaturesShowcase() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            Why Developers Choose DevFlowHub
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance">
            Experience the future of development with AI-powered tools that understand your workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="glass-panel p-8 text-center hover:border-white/30 transition-all duration-300 hover:scale-105 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Performance Metrics */}
        <div className="mt-20 grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">10x</div>
            <div className="text-slate-400">Faster Development</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-slate-400">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-slate-400">AI Models</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">200+</div>
            <div className="text-slate-400">Global Regions</div>
          </div>
        </div>
      </div>
    </section>
  )
}
