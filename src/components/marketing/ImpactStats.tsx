'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { TrendingUp, Globe, Users, Zap } from 'lucide-react'

const stats = [
  {
    icon: TrendingUp,
    value: 10,
    suffix: '×',
    label: 'faster app creation with AI context',
    color: 'from-cyan-400 to-blue-500'
  },
  {
    icon: Globe,
    value: 27,
    suffix: '+',
    label: 'countries using DevFlowHub',
    color: 'from-green-400 to-emerald-500'
  },
  {
    icon: Users,
    value: 10000,
    suffix: '+',
    label: 'developers building with AI',
    color: 'from-purple-400 to-pink-500'
  },
  {
    icon: Zap,
    value: 50000,
    suffix: '+',
    label: 'projects built in DevFlowHub',
    color: 'from-orange-400 to-red-500'
  }
]

export default function ImpactStats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [counts, setCounts] = useState(stats.map(() => 0))

  useEffect(() => {
    if (!isInView) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    stats.forEach((stat, index) => {
      const target = stat.value
      const increment = target / steps
      
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        
        setCounts(prev => {
          const newCounts = [...prev]
          newCounts[index] = Math.floor(current)
          return newCounts
        })
      }, stepDuration)
    })
  }, [isInView])

  return (
    <section className="py-24 relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 2xl:px-20">
        <div className="text-center mb-20">
          <motion.h2 
            className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            Impact & Scale
          </motion.h2>

          <motion.p 
            className="text-[clamp(1.1rem,1.3vw,1.25rem)] text-slate-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of developers worldwide who are building the future with AI. 
            See the impact DevFlowHub is making in the global developer community.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="glass-panel p-8 hover:border-white/30 transition-all duration-300 hover:scale-105">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Animated Counter */}
                  <div className="mb-4">
                    <motion.span 
                      className="text-4xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isInView ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                      {counts[index].toLocaleString()}
                    </motion.span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                      {stat.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <p className="text-slate-300 leading-relaxed">
                    {stat.label}
                  </p>

                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-slate-400 mb-6">
            Ready to join the AI development revolution?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-300 hover:scale-105">
              Start Free Trial
            </button>
            <button className="glass-panel text-white px-8 py-3 rounded-xl font-semibold hover:border-white/30 transition-all duration-300 hover:scale-105">
              Book a Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
