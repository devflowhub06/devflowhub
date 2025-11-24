'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AnimatedCard, AnimatedCardContent, AnimatedCardDescription, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, PulseLoader } from '@/components/ui/loading-spinner'
import { FadeIn, SlideIn, Stagger, HoverScale } from '@/components/ui/transitions'
import { 
  Code, 
  Play, 
  Sparkles, 
  Rocket, 
  Brain, 
  BarChart3, 
  Zap, 
  Shield,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'

const workspaceFeatures = [
  {
    icon: Code,
    title: "DevFlowHub Editor",
    description: "Write and edit code with AI assistance",
    color: "from-blue-500 to-cyan-500",
    stats: "10x faster coding"
  },
  {
    icon: Play,
    title: "DevFlowHub Sandbox", 
    description: "Run and test your code in a live environment",
    color: "from-green-500 to-emerald-500",
    stats: "Instant previews"
  },
  {
    icon: Sparkles,
    title: "DevFlowHub UI Studio",
    description: "Design and prototype user interfaces with AI",
    color: "from-purple-500 to-pink-500", 
    stats: "AI-powered design"
  },
  {
    icon: Rocket,
    title: "DevFlowHub Deployer",
    description: "Deploy your applications to production",
    color: "from-orange-500 to-red-500",
    stats: "One-click deployment"
  }
]

const metrics = [
  { label: "Active Projects", value: "1,247", change: "+12%", icon: TrendingUp },
  { label: "AI Tokens Used", value: "2.3M", change: "+8%", icon: Zap },
  { label: "Deployments", value: "456", change: "+23%", icon: Rocket },
  { label: "Team Members", value: "89", change: "+5%", icon: Users }
]

export default function AnimatedDashboard() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] via-[#0F111A] to-[#0B0D17] flex items-center justify-center">
        <div className="text-center space-y-6">
          <LoadingSpinner size="xl" text="Loading DevFlowHub Dashboard..." />
          <PulseLoader className="max-w-md mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] via-[#0F111A] to-[#0B0D17] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <FadeIn delay={0.2}>
          <div className="text-center space-y-4">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              DevFlowHub Dashboard
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              The world's first AI Development Operating System
            </motion.p>
          </div>
        </FadeIn>

        {/* Metrics Cards */}
        <SlideIn direction="up" delay={0.5}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stagger delay={0.1}>
              {metrics.map((metric, index) => (
                <HoverScale key={index}>
                  <AnimatedCard 
                    hoverable 
                    delay={index * 0.1}
                    className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50"
                  >
                    <AnimatedCardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">{metric.label}</p>
                          <p className="text-2xl font-bold text-white">{metric.value}</p>
                          <p className="text-xs text-green-400 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {metric.change}
                          </p>
                        </div>
                        <metric.icon className="w-8 h-8 text-blue-400" />
                      </div>
                    </AnimatedCardContent>
                  </AnimatedCard>
                </HoverScale>
              ))}
            </Stagger>
          </div>
        </SlideIn>

        {/* Workspace Features */}
        <FadeIn delay={0.8}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">5 Unified AI Workspaces</h2>
              <p className="text-gray-400">Everything you need to build, test, and deploy</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Stagger delay={0.1}>
                {workspaceFeatures.map((feature, index) => (
                  <HoverScale key={index}>
                    <AnimatedCard 
                      hoverable 
                      delay={index * 0.1}
                      className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 group"
                    >
                      <AnimatedCardHeader className="pb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <AnimatedCardTitle className="text-lg text-white">
                          {feature.title}
                        </AnimatedCardTitle>
                        <AnimatedCardDescription className="text-gray-400">
                          {feature.description}
                        </AnimatedCardDescription>
                      </AnimatedCardHeader>
                      <AnimatedCardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-400 font-medium">
                            {feature.stats}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:text-white hover:border-blue-500"
                          >
                            Try Now
                          </Button>
                        </div>
                      </AnimatedCardContent>
                    </AnimatedCard>
                  </HoverScale>
                ))}
              </Stagger>
            </div>
          </div>
        </FadeIn>

        {/* AI Assistant Section */}
        <SlideIn direction="left" delay={1.2}>
          <AnimatedCard 
            hoverable 
            delay={1.2}
            className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/20"
          >
            <AnimatedCardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">AI Assistant</h3>
                  <p className="text-gray-300 mb-4">
                    Get instant help with your code, design decisions, and deployment strategies
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Start Chat
                    </Button>
                    <span className="text-sm text-gray-400 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Always online
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </SlideIn>

        {/* Call to Action */}
        <FadeIn delay={1.5}>
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Ready to revolutionize your development workflow?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Join thousands of developers building faster with the world's first AI Development OS
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3"
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:text-white hover:border-blue-500 px-8 py-3"
              >
                View Demo
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
