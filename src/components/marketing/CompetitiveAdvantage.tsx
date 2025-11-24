'use client'

import { CheckCircle, XCircle, ArrowRight, Zap, Shield, Brain } from 'lucide-react'
import Link from 'next/link'

const keyReasons = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Build and deploy 10x faster with AI-powered automation that eliminates repetitive tasks and context switching.",
    gradient: "from-purple-500 to-blue-500"
  },
  {
    icon: Shield,
    title: "Enterprise Reliable",
    description: "99.9% uptime SLA with automatic scaling, monitoring, and rollback protection built for production.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Brain,
    title: "Context Aware",
    description: "AI that remembers your entire project, maintaining context across all development tools and workspaces.",
    gradient: "from-cyan-500 to-green-500"
  }
]

const competitors = [
  {
    name: "Replit",
    type: "Code Playground",
    limitations: [
      "Limited to browser-based coding",
      "No production deployment",
      "Basic AI assistance only",
      "No unified workspace"
    ],
    ourAdvantage: "Complete production-ready development OS"
  },
  {
    name: "Windsurf",
    type: "AI Code Editor",
    limitations: [
      "Single-purpose editor only",
      "No integrated testing or design",
      "No deployment pipeline",
      "Limited context memory"
    ],
    ourAdvantage: "Unified workspace with full project context"
  },
  {
    name: "Lovable",
    type: "No-Code Builder",
    limitations: [
      "Limited customization options",
      "Vendor lock-in risks",
      "No code export available",
      "Basic functionality only"
    ],
    ourAdvantage: "Full code control with AI assistance"
  }
]

export default function CompetitiveAdvantage() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-surface-800" id="why-us">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Why{' '}
            <span className="text-accent-warn">DevFlowHub</span>?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Three reasons why thousands of developers choose DevFlowHub as their AI development platform.
          </p>
        </div>

        {/* Key Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {keyReasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div
                key={index}
                className="bg-bg-900 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-accent-warn/50 transition-all duration-200 text-center"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${reason.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {reason.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  {reason.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Competitive Comparison */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            Complete Development OS
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            While others offer single-purpose tools, DevFlowHub is the only platform that maintains 
            full project context across all development stages.
          </p>
        </div>

        {/* Competitive Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {competitors.map((competitor) => (
            <div
              key={competitor.name}
              className="bg-bg-900 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-accent-warn/30 transition-all duration-200"
            >
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{competitor.name}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">{competitor.type}</p>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {competitor.limitations.map((limitation, idx) => (
                  <div key={idx} className="flex items-start space-x-2 sm:space-x-3">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-xs sm:text-sm">{limitation}</span>
                  </div>
                ))}
              </div>

              <div className="bg-accent-warn/10 border border-accent-warn/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent-warn flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-accent-warn font-semibold text-xs sm:text-sm mb-1">DevFlowHub Advantage:</p>
                    <p className="text-white text-xs sm:text-sm">{competitor.ourAdvantage}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center px-2">
          <div className="bg-bg-900 border border-accent-warn/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Ready to Build Faster?
            </h3>
            <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
              Join 2,000+ developers across 27 countries building faster with AI-powered workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-accent-warn text-white font-bold rounded-xl hover:bg-orange-600 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/20 text-sm sm:text-base"
              >
                Start Building Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/20 text-white hover:text-accent-warn hover:border-accent-warn rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
              >
                See Live Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}