'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Code2, TestTube, Palette, Rocket, Bot, ArrowRight } from 'lucide-react'

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, boxShadow: "0px 0px 16px rgba(45, 212, 255, 0.4)" }
}

const connectorVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeOut" } }
}

const aiPulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(139, 87, 255, 0.6)", "0 0 0px rgba(0,0,0,0)"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

interface WorkflowNodeProps {
  icon: React.ElementType;
  title: string;
  color: string;
  tooltip: string;
  delay: number;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ icon: Icon, title, color, tooltip, delay }) => {
  return (
    <motion.div
      className="relative flex flex-col items-center group cursor-pointer"
      variants={nodeVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay }}
    >
      <div className="p-4 rounded-xl premium-card mb-3 group-hover:shadow-neon-sm transition-all duration-200">
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
      <span className="text-sm font-medium text-text-primary">{title}</span>
      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-bg-800 text-text-primary text-xs rounded-md px-3 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/10">
        {tooltip}
      </div>
    </motion.div>
  )
}

function WorkflowDiagram() {
  const nodes = [
    { icon: Code2, title: 'Editor', color: 'text-blue-500', tooltip: 'AI-powered code generation and refactoring.', delay: 0.2 },
    { icon: Palette, title: 'UI Studio', color: 'text-violet-500', tooltip: 'Generate UI components from natural language.', delay: 0.4 },
    { icon: TestTube, title: 'Sandbox', color: 'text-green-500', tooltip: 'Isolated testing and debugging environments.', delay: 0.6 },
    { icon: Rocket, title: 'Deployer', color: 'text-orange-500', tooltip: 'Automated CI/CD and one-click deployments.', delay: 0.8 },
  ]

  // Function to draw curved paths for connectors
  const getPathD = (fromX: number, fromY: number, toX: number, toY: number) => {
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    
    // Create smooth curves
    return `M ${fromX} ${fromY} Q ${midX} ${midY - 20} ${toX} ${toY}`
  }

  return (
    <section className="py-24 bg-bg-900" data-workflow-section>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            AI-Powered Workflow & Intelligence Layer
          </h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Experience seamless development with AI that understands and maintains full project context across every tool.
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center justify-center py-16 px-8 premium-card">
          {/* SVG Connectors */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Horizontal connectors */}
            <motion.path 
              d={getPathD(200, 150, 400, 150)} 
              stroke="#2DD4FF" 
              strokeWidth="2" 
              variants={connectorVariants} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.5 }} 
              transition={{ delay: 0.8 }} 
            />
            <motion.path 
              d={getPathD(400, 150, 600, 150)} 
              stroke="#2DD4FF" 
              strokeWidth="2" 
              variants={connectorVariants} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.5 }} 
              transition={{ delay: 1.0 }} 
            />
            <motion.path 
              d={getPathD(600, 150, 800, 150)} 
              stroke="#2DD4FF" 
              strokeWidth="2" 
              variants={connectorVariants} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.5 }} 
              transition={{ delay: 1.2 }} 
            />

            {/* AI Assistant feedback loop */}
            <motion.path 
              d="M500 250 C 550 350, 450 350, 500 250" 
              stroke="#8B5CF6" 
              strokeWidth="2" 
              strokeDasharray="8 8"
              variants={connectorVariants} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.5 }} 
              transition={{ delay: 1.5, duration: 2 }} 
            />
          </svg>

          {/* Workflow Nodes */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center space-y-12 md:space-y-0 md:space-x-20">
            {nodes.map((node, index) => (
              <WorkflowNode key={index} {...node} />
            ))}

            {/* AI Assistant Node */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 shadow-neon-lg flex flex-col items-center justify-center cursor-pointer will-change-transform gpu-accelerated"
              variants={aiPulseVariants}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView="pulse"
              viewport={{ once: true, amount: 0.7 }}
            >
              <Bot className="h-12 w-12 text-white mb-2" />
              <span className="text-sm font-semibold text-white whitespace-nowrap">AI Assistant</span>
              <div className="absolute inset-0 rounded-full border-4 border-transparent opacity-0" />
            </motion.div>
          </div>
        </div>

        {/* Description and CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-6">
            The AI Assistant acts as the central intelligence layer, maintaining shared project memory and routing context seamlessly between all your development tools.
          </p>
          <Link
            href="/docs/ai-workflow"
            className="inline-flex items-center text-blue-500 hover:text-blue-400 font-medium group"
          >
            Learn more about AI Workflow
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default WorkflowDiagram