'use client'

import { motion } from 'framer-motion'
import { Zap, Shield, Brain } from 'lucide-react'

export default function ElevatorParagraph() {
  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Build and deploy 10x faster with AI-powered automation that eliminates repetitive tasks."
    },
    {
      icon: Shield,
      title: "Enterprise Reliable", 
      description: "99.9% uptime SLA with automatic scaling, monitoring, and rollback protection."
    },
    {
      icon: Brain,
      title: "Context Aware",
      description: "AI that remembers your entire project, maintaining context across all development tools."
    }
  ]

  return (
    <section className="py-16 bg-bg-900 border-t border-surface-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-100 mb-6">
            Why DevFlowHub?
          </h2>
          <p className="text-lg text-body-text max-w-3xl mx-auto leading-relaxed">
            Three reasons why thousands of developers choose DevFlowHub as their AI development platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="premium-card p-8 hover:shadow-neon-md group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-text-100 mb-4 group-hover:text-cyan-500 transition-colors">
                      {benefit.title}
                    </h3>

                    <p className="text-body-text leading-relaxed">
                      {benefit.description}
                    </p>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
