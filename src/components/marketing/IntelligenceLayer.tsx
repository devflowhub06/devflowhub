'use client'

import { motion, useAnimation } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Code, Palette, Cpu, Rocket, Brain, Zap } from 'lucide-react'

const nodes = [
  { id: 'editor', icon: Code, label: 'Editor', x: 0, y: 0, color: 'from-cyan-400 to-blue-500' },
  { id: 'ui-studio', icon: Palette, label: 'UI Studio', x: 200, y: -100, color: 'from-purple-400 to-pink-500' },
  { id: 'sandbox', icon: Cpu, label: 'Sandbox', x: 400, y: 0, color: 'from-green-400 to-emerald-500' },
  { id: 'deployer', icon: Rocket, label: 'Deployer', x: 600, y: -100, color: 'from-orange-400 to-red-500' },
  { id: 'ai-assistant', icon: Brain, label: 'AI Assistant', x: 300, y: 100, color: 'from-pink-400 to-violet-500' }
]

const taskFlow = [
  { from: 'editor', to: 'ui-studio', delay: 0 },
  { from: 'ui-studio', to: 'sandbox', delay: 2 },
  { from: 'sandbox', to: 'deployer', delay: 4 },
  { from: 'deployer', to: 'ai-assistant', delay: 6 }
]

export default function IntelligenceLayer() {
  const [activeFlow, setActiveFlow] = useState(0)
  const controls = useAnimation()

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % taskFlow.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

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
            Intelligence Layer Demo
          </motion.h2>

          <motion.p 
            className="text-[clamp(1.1rem,1.3vw,1.25rem)] text-slate-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Watch how DevFlowHub's AI router and memory system intelligently moves tasks across workspaces, 
            maintaining context and accelerating your development workflow.
          </motion.p>
        </div>

        {/* Interactive Flow Diagram */}
        <div className="relative">
          <div className="glass-panel p-12 max-w-4xl mx-auto">
            <div className="relative h-96 overflow-hidden">
              {/* Flow Lines */}
              {taskFlow.map((flow, index) => {
                const fromNode = nodes.find(n => n.id === flow.from)
                const toNode = nodes.find(n => n.id === flow.to)
                if (!fromNode || !toNode) return null

                return (
                  <motion.div
                    key={index}
                    className="absolute"
                    style={{
                      left: fromNode.x + 40,
                      top: fromNode.y + 40,
                      width: Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)),
                      height: 2,
                      transformOrigin: '0 0',
                      transform: `rotate(${Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * 180 / Math.PI}deg)`
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: activeFlow >= index ? 1 : 0,
                      opacity: activeFlow >= index ? 1 : 0.3
                    }}
                    transition={{ duration: 0.5, delay: flow.delay }}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                  </motion.div>
                )
              })}

              {/* Task Bubble */}
              <motion.div
                className="absolute w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  x: activeFlow === 0 ? 200 : activeFlow === 1 ? 400 : activeFlow === 2 ? 600 : 300,
                  y: activeFlow === 0 ? -100 : activeFlow === 1 ? 0 : activeFlow === 2 ? -100 : 100,
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.div>

              {/* Nodes */}
              {nodes.map((node, index) => {
                const Icon = node.icon
                return (
                  <motion.div
                    key={node.id}
                    className="absolute"
                    style={{ left: node.x, top: node.y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className={`w-20 h-20 bg-gradient-to-r ${node.color} rounded-2xl flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(38,214,255,0.5)] transition-all duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center mt-3">
                      <span className="text-white font-medium text-sm">{node.label}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">AI Router Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-400 text-sm font-medium">Context Flowing</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
              The AI router intelligently determines the best workspace for each task, 
              while the memory system maintains context across all workspaces. 
              No more switching tools or re-explaining context.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
