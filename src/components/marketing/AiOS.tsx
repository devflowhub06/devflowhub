'use client'

export default function AIOS() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
            </div>
          </div>
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            DevFlowHub AI OS
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance mb-8">
            One platform replaces 5+ coding tools. Build, test, and deploy with AI workspaces that share context and intelligence seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">5 unified AI workspaces</h3>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Context flows between tools</h3>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Save 10+ hours per week</h3>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time analytics & insights</h3>
          </div>
        </div>
      </div>
    </section>
  )
}
