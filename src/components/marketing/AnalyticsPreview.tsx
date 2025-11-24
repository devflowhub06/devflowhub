'use client'

import { BarChart3, TrendingUp, Users, Zap, Activity } from 'lucide-react'

const metrics = [
  { label: 'Projects Completed', value: '1,247', change: '+23%', color: 'text-green-400' },
  { label: 'AI Requests', value: '45.2K', change: '+156%', color: 'text-blue-400' },
  { label: 'Deployments', value: '892', change: '+89%', color: 'text-purple-400' },
  { label: 'Time Saved', value: '2.4K hrs', change: '+67%', color: 'text-cyan-400' }
]

const chartData = [
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 78 },
  { day: 'Wed', value: 82 },
  { day: 'Thu', value: 91 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 76 },
  { day: 'Sun', value: 69 }
]

export default function AnalyticsPreview() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            Real-time Analytics & Insights
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance">
            Track your development progress with comprehensive analytics and AI-powered insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Metrics */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="glass-panel p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-300 text-sm font-medium">{metric.label}</h3>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                  <div className={`text-sm font-medium ${metric.color}`}>{metric.change}</div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">AI Usage Breakdown</h3>
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Code Generation</span>
                  <span className="text-white font-medium">42%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Testing & Debugging</span>
                  <span className="text-white font-medium">28%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Deployment</span>
                  <span className="text-white font-medium">30%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Preview */}
          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold">Development Activity</h3>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-end justify-between h-32">
                {chartData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t"
                      style={{ height: `${data.value}%` }}
                    ></div>
                    <span className="text-slate-400 text-xs mt-2">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">Team Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-300">AI Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm mb-4">Example Dashboard Preview (demo data)</p>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-300 hover:scale-105">
            View Full Analytics
          </button>
        </div>
      </div>
    </section>
  )
}
