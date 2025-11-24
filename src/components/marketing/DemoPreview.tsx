'use client'

import { useState } from 'react'
import { Play, Code, Terminal, Monitor, Smartphone } from 'lucide-react'

export default function DemoPreview() {
  const [activeDemo, setActiveDemo] = useState('editor')

  const demos = [
    { id: 'editor', label: 'AI Editor', icon: Code },
    { id: 'terminal', label: 'Smart Terminal', icon: Terminal },
    { id: 'mobile', label: 'Mobile Preview', icon: Smartphone }
  ]

  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            See DevFlowHub in Action
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance">
            Experience the power of AI-driven development with our interactive demo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Demo Controls */}
          <div>
            <div className="mb-8">
              <div className="flex space-x-4 mb-6">
                {demos.map((demo) => {
                  const Icon = demo.icon
                  return (
                    <button
                      key={demo.id}
                      onClick={() => setActiveDemo(demo.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeDemo === demo.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                          : 'glass-panel text-slate-300 hover:text-white hover:border-white/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{demo.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {activeDemo === 'editor' && 'AI-Powered Code Editor'}
                  {activeDemo === 'terminal' && 'Intelligent Terminal'}
                  {activeDemo === 'mobile' && 'Real-time Mobile Preview'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {activeDemo === 'editor' && 'Write code with AI assistance, get intelligent suggestions, and see your ideas come to life instantly.'}
                  {activeDemo === 'terminal' && 'Execute commands with AI context awareness, automatic error detection, and smart command suggestions.'}
                  {activeDemo === 'mobile' && 'Preview your app on multiple devices simultaneously with real-time updates and responsive design testing.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] transition-all duration-300 hover:scale-105">
                  <Play className="w-5 h-5" />
                  <span>Try Live Demo</span>
                </button>
                <button className="glass-panel text-white px-8 py-4 rounded-2xl font-semibold hover:border-white/30 transition-all duration-300 hover:scale-105">
                  Watch Video
                </button>
              </div>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="relative">
            <div className="glass-panel overflow-hidden shadow-2xl">
              {/* Browser Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <Monitor className="w-4 h-4" />
                  <span>DevFlowHub Demo</span>
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-8">
                {activeDemo === 'editor' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>AI Assistant Active</span>
                    </div>
                    <pre className="text-slate-300 font-mono text-sm">
                      <code>
                        <span className="text-cyan-400">const</span> <span className="text-yellow-400">app</span> = <span className="text-cyan-400">await</span> aiOS.<span className="text-green-400">create</span>({'{'}{'\n'}
                        {'  '}<span className="text-purple-400">framework</span>: <span className="text-green-400">'React'</span>,{'\n'}
                        {'  '}<span className="text-purple-400">features</span>: [<span className="text-green-400">'auth'</span>, <span className="text-green-400">'database'</span>],{'\n'}
                        {'  '}<span className="text-purple-400">deploy</span>: <span className="text-green-400">true</span>{'\n'}
                        {'}'});{'\n'}
                        <span className="text-slate-500">// ✨ Generated in 2.3s</span>
                      </code>
                    </pre>
                  </div>
                )}

                {activeDemo === 'terminal' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Smart Terminal Ready</span>
                    </div>
                    <pre className="text-slate-300 font-mono text-sm">
                      <code>
                        <span className="text-green-400">$</span> <span className="text-white">ai deploy --optimize</span>{'\n'}
                        <span className="text-slate-500">🤖 Analyzing codebase...</span>{'\n'}
                        <span className="text-slate-500">⚡ Optimizing bundle size...</span>{'\n'}
                        <span className="text-slate-500">🚀 Deploying to production...</span>{'\n'}
                        <span className="text-green-400">✅ Deployed successfully!</span>{'\n'}
                        <span className="text-slate-500">📊 Performance: 95/100</span>
                      </code>
                    </pre>
                  </div>
                )}

                {activeDemo === 'mobile' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Live Preview Active</span>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-slate-400 text-sm mb-2">📱 Mobile Preview</div>
                      <div className="text-white font-semibold">Your App Live</div>
                      <div className="text-slate-500 text-xs mt-1">Real-time updates</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
