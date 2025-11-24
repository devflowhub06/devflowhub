'use client'

import { Code, Brain, Rocket, CheckCircle } from 'lucide-react'

const benefits = [
  {
    icon: Code,
    title: 'Unified AI Workspaces',
    description: '5 integrated tools that share context and memory across your entire development workflow.'
  },
  {
    icon: Brain,
    title: 'Project Memory',
    description: 'AI that remembers your entire project history, preferences, and context — no more re-explaining.'
  },
  {
    icon: Rocket,
    title: 'End-to-End Deployment',
    description: 'From code to production in minutes with intelligent CI/CD and real-time monitoring.'
  }
]

export default function ProductElevator() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            The AI Development Operating System
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance leading-relaxed">
            DevFlowHub unifies AI tools into one intelligent platform. Build, test, and deploy with AI workspaces that share context and intelligence seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="glass-panel p-8 text-center hover:border-white/30 transition-all duration-300 hover:scale-105 group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Key Features List */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>No more switching between 5+ different tools</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Context flows between all workspaces</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Continuous project memory and learning</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Build end-to-end without friction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
