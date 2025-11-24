'use client'

import { BarChart3, FolderOpen } from 'lucide-react'

export default function Analytics() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            Advanced Analytics & Project Creation
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance">
            Track your development progress with real-time analytics and create projects with our intelligent wizard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Analytics Card */}
          <div className="glass-panel p-8 hover:border-white/30 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Real-time Analytics</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Track project metrics, AI usage, deployment success rates, and team performance with comprehensive analytics dashboard.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Tool usage breakdown
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Performance metrics
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Team collaboration insights
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Deployment success rates
              </li>
            </ul>
          </div>

          {/* Project Creation Card */}
          <div className="glass-panel p-8 hover:border-white/30 transition-all duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6">
              <FolderOpen className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Smart Project Creation</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Create projects from templates or scratch with our intelligent wizard that sets up everything you need automatically.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Template library
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Auto-provisioning
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                One-click setup
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Smart defaults
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
