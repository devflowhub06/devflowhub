'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Code, TestTube, Rocket, ArrowRight } from 'lucide-react'

const workflowSteps = [
  {
    icon: Lightbulb,
    title: 'Ideate',
    description: 'Brainstorm with AI',
    color: 'from-yellow-400 to-orange-500',
    gradient: 'from-yellow-400/20 to-orange-500/20'
  },
  {
    icon: Code,
    title: 'Code',
    description: 'AI pair-coding',
    color: 'from-cyan-400 to-blue-500',
    gradient: 'from-cyan-400/20 to-blue-500/20'
  },
  {
    icon: TestTube,
    title: 'Test',
    description: 'Instant sandbox',
    color: 'from-green-400 to-emerald-500',
    gradient: 'from-green-400/20 to-emerald-500/20'
  },
  {
    icon: Rocket,
    title: 'Deploy',
    description: 'One-click ship',
    color: 'from-purple-400 to-pink-500',
    gradient: 'from-purple-400/20 to-pink-500/20'
  }
]

export default function Vision() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 2xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white mb-6">
              From idea to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                production in minutes
              </span>
            </h2>

            <p className="text-[clamp(1.1rem,1.3vw,1.25rem)] text-slate-300 max-w-2xl mb-8 leading-relaxed">
              No tool-switching. No context loss. Just seamless flow from ideation to deployment, 
              all within the AI Development OS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#workspaces"
                className="inline-flex items-center justify-center text-cyan-400 hover:text-white transition-colors duration-300 font-medium"
              >
                Explore Workspaces
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Right: Workflow Board */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-panel p-8 rounded-2xl border border-slate-700/50">
              {/* Header */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Quick Workflow</h3>
                <p className="text-sm text-slate-400">Your typical development flow</p>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`relative flex-shrink-0 w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                          <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-xl opacity-0 hover:opacity-30 blur-md transition-opacity duration-300`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">{step.title}</h4>
                          <p className="text-sm text-slate-400">{step.description}</p>
                        </div>
                      </div>

                      {/* Progress Line */}
                      {index < workflowSteps.length - 1 && (
                        <motion.div
                          className="absolute left-6 top-12 w-0.5 h-12 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-500"
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                          style={{ transformOrigin: 'top' }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Status Indicator */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">AI OS Monitoring</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}