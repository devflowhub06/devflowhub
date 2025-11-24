'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Zap, Brain, GitBranch, Play, Users, Star, TrendingUp } from 'lucide-react'

export default function Hero() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('ai-router')

  const tabs = [
    { id: 'ai-router', label: 'AI Router', icon: Zap, color: 'text-cyan-400' },
    { id: 'memory', label: 'Memory', icon: Brain, color: 'text-green-400' },
    { id: 'flow', label: 'Flow', icon: GitBranch, color: 'text-purple-400' }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="relative max-w-10xl mx-auto px-6 md:px-10 2xl:px-16 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400/25 via-blue-500/25 to-purple-500/25 border border-cyan-400/40 text-cyan-400 text-sm font-medium backdrop-blur-sm">
                <span className="mr-2">🚀</span>
                DevFlowHub v3.0 — Now Live
              </div>
            </div>

            <h1 className="text-[clamp(2.4rem,6.5vw,5.5rem)] font-bold text-white mb-8 leading-tight text-balance">
              The{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI Development Operating System
              </span>
            </h1>

            <p className="text-[clamp(1.1rem,1.3vw,1.25rem)] text-slate-300 mb-10 max-w-2xl leading-relaxed text-balance">
              Unify AI tools, keep full project memory, and ship apps end-to-end — faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] transition-all duration-300 hover:scale-105"
                aria-label="Start free trial — DevFlowHub"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push('/book-demo')}
                className="glass-panel text-white px-10 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:border-white/30 transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5" />
                <span>Book a Demo</span>
              </button>
            </div>
          </div>

          {/* Right Code Card */}
          <div className="relative">
            <div className="glass-panel overflow-hidden shadow-2xl">
              {/* Card Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                </div>
                <div className="flex space-x-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${tab.color}`} />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Code Content */}
              <div className="p-8 font-mono text-sm">
                <pre className="text-slate-300" aria-label="Example workflow code">
                  <code>
                    <span className="text-slate-500">// AI Development OS</span>{'\n'}
                    <span className="text-cyan-400">const</span> workflow = {'\n'}
                    <span className="text-cyan-400">  await</span> aios.<span className="text-yellow-400">route</span>({'\n'}
                    <span className="text-white">    task, context, memory</span>{'\n'}
                    <span className="text-white">  </span>);{'\n'}
                    <span className="text-slate-500">// Routes to best AI workspace</span>{'\n'}
                    <span className="text-slate-500">// Maintains full context</span>{'\n'}
                    <span className="text-slate-500">// Zero friction</span>{'\n'}
                  </code>
                </pre>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between p-6 border-t border-white/10 text-sm text-slate-400">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
                  <span className="font-medium">OS Active</span>
                </div>
                <span className="font-medium">DevFlowHub v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
