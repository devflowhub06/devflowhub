'use client'

export default function OldVsNew() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            The Old Way vs. The New Way
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance">
            See how DevFlowHub transforms fragmented AI tools into a unified development experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Old Way Card */}
          <div className="glass-panel p-8 border border-red-500/30 hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                <span className="text-red-400 text-2xl">&lt; &gt;</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Fragmented AI Tools</h3>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Today's AI coding tools are powerful but disconnected. You lose hours switching between different platforms—repeating context, losing momentum, and breaking your development flow.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Switch between 5+ different tools
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Re-explain context every time
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Lose momentum and break flow
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                No unified project memory
              </li>
            </ul>
          </div>

          {/* New Way Card */}
          <div className="glass-panel p-8 border border-green-500/30 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                <span className="text-green-400 text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Unified AI OS</h3>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              DevFlowHub brings all AI development tools into one intelligent platform. Context flows seamlessly between workspaces, maintaining your momentum and accelerating your development.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                One dashboard for all AI workflows
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Context flows between tools
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Continuous project memory
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Build end-to-end without friction
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}