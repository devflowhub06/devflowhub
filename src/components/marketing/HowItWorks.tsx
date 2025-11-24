'use client'

import { ArrowRight, Code, Brain, Rocket, Zap } from 'lucide-react'

const steps = [
  {
    icon: Code,
    title: 'Define Task',
    description: 'Describe what you want to build or fix',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    icon: Brain,
    title: 'AI Router',
    description: 'Intelligent routing to the best workspace',
    color: 'from-purple-400 to-pink-500'
  },
  {
    icon: Rocket,
    title: 'Deploy',
    description: 'Automatic deployment with monitoring',
    color: 'from-green-400 to-emerald-500'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            How It Works
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance">
            Three simple steps to transform your development workflow with AI.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Flow */}
          <div className="hidden lg:flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-slate-300 text-center max-w-xs">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-slate-400 mx-8 mt-8" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile Flow */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex items-center space-x-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Zap className="w-4 h-4" />
                <span>AI Development OS</span>
              </div>
            </div>
            <pre className="text-slate-300 font-mono text-sm leading-relaxed">
              <code>
                <span className="text-slate-500">// Define your task</span>{'\n'}
                <span className="text-cyan-400">const</span> task = <span className="text-green-400">'Build a React dashboard'</span>;{'\n'}
                {'\n'}
                <span className="text-slate-500">// AI routes to best workspace</span>{'\n'}
                <span className="text-cyan-400">const</span> workspace = <span className="text-cyan-400">await</span> aiOS.<span className="text-yellow-400">route</span>(task);{'\n'}
                {'\n'}
                <span className="text-slate-500">// Deploy automatically</span>{'\n'}
                <span className="text-cyan-400">await</span> workspace.<span className="text-yellow-400">deploy</span>();{'\n'}
                <span className="text-slate-500">// ✨ Done in 2.3s</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
