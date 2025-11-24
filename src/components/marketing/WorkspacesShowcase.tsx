'use client'

import { motion } from 'framer-motion'
import { Code, Palette, Cpu, Rocket, Brain } from 'lucide-react'

const workspaces = [
  {
    icon: Code,
    title: 'Editor',
    description: 'Real-time AI pair-coding with intelligent autocomplete and context-aware suggestions.',
    features: ['AI Code Generation', 'Smart Autocomplete', 'Context Memory', 'Live Collaboration'],
    gradient: 'from-cyan-400 to-blue-500',
    route: '/dashboard/projects'
  },
  {
    icon: Cpu,
    title: 'Sandbox',
    description: 'Instant container testing with isolated environments and real-time debugging.',
    features: ['Instant Containers', 'Live Debugging', 'Environment Sync', 'Performance Monitoring'],
    gradient: 'from-green-400 to-emerald-500',
    route: '/dashboard/projects'
  },
  {
    icon: Palette,
    title: 'UI Studio',
    description: 'AI-assisted UI generation with responsive design and component library.',
    features: ['AI Design Generation', 'Component Library', 'Responsive Preview', 'Design System'],
    gradient: 'from-purple-400 to-pink-500',
    route: '/dashboard/projects'
  },
  {
    icon: Rocket,
    title: 'Deployer',
    description: 'Smart CI/CD monitoring with automated deployments and performance optimization.',
    features: ['Auto Deploy', 'CI/CD Pipeline', 'Performance Monitoring', 'Rollback Protection'],
    gradient: 'from-orange-400 to-red-500',
    route: '/dashboard/projects'
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    description: 'Context-aware companion that understands your entire project and provides intelligent assistance.',
    features: ['Project Memory', 'Smart Suggestions', 'Task Automation', 'Learning AI'],
    gradient: 'from-pink-400 to-violet-500',
    route: '/dashboard/projects'
  }
]

export default function WorkspacesShowcase() {
  return (
    <section id="platform" className="py-24 relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 2xl:px-20">
        <div className="text-center mb-20">
          <motion.h2 
            className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            The AI Workspaces
          </motion.h2>

          <motion.p 
            className="text-[clamp(1.1rem,1.3vw,1.25rem)] text-slate-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Five unified workspaces that share context and intelligence seamlessly. 
            Build, test, design, deploy, and collaborate with AI agents that understand your entire project.
          </motion.p>
        </div>

        {/* Cinematic Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workspaces.map((workspace, index) => {
            const Icon = workspace.icon
            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="glass-panel p-8 h-full hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(38,214,255,0.3)]">
                  
                  {/* Icon with Glow Effect */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${workspace.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-[0_0_30px_rgba(38,214,255,0.5)] transition-all duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className={`absolute inset-0 w-16 h-16 bg-gradient-to-r ${workspace.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300`} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    {workspace.title}
                  </h3>

                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {workspace.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2">
                    {workspace.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <span className="text-slate-400 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
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
          <a 
            href="/signup"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-2xl font-semibold hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-300 hover:scale-105"
          >
            Start Building with AI
          </a>
        </motion.div>
      </div>
    </section>
  )
}
