'use client'

import { 
  Code2, 
  BoxSelect, 
  Palette, 
  Rocket, 
  Bot,
} from 'lucide-react'

const workspaces = [
  {
    name: 'Editor',
    description: 'AI pair-coding that understands your repo',
    icon: Code2,
    features: ['AI code completion', 'Context-aware suggestions', 'Multi-file understanding'],
    link: '/workspaces/editor',
    color: 'cyan'
  },
  {
    name: 'Sandbox',
    description: 'Instant containers with live debugging',
    icon: BoxSelect,
    features: ['Instant provisioning', 'Live debugging tools', 'Environment sync'],
    link: '/workspaces/sandbox',
    color: 'green'
  },
  {
    name: 'UI Studio',
    description: 'Design-to-code and component library',
    icon: Palette,
    features: ['Design-to-code conversion', 'Component library', 'Design system sync'],
    link: '/workspaces/ui-studio',
    color: 'purple'
  },
  {
    name: 'Deployer',
    description: 'One-click deploy, monitoring & rollback',
    icon: Rocket,
    features: ['Continuous deployment', 'Performance monitoring', 'Auto-scaling'],
    link: '/workspaces/deployer',
    color: 'orange'
  },
  {
    name: 'AI Assistant',
    description: 'Cross-workspace memory and intelligent routing',
    icon: Bot,
    features: ['Context-aware help', 'Intelligent routing', 'Workflow automation'],
    link: '/workspaces/ai-assistant',
    color: 'purple'
  }
]

const iconColors = {
  cyan: 'text-cyan-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
  orange: 'text-accent-warn',
}

export default function WorkspacesGrid() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-bg-900" id="workspaces">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Unified AI{' '}
            <span className="text-accent-warn">Workspaces</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Five powerful tools working together with shared AI context. 
            Switch seamlessly between ideation, coding, testing, design, and deployment.
          </p>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workspaces.map((workspace) => {
            const Icon = workspace.icon
            const iconColor = iconColors[workspace.color as keyof typeof iconColors] || 'text-gray-400'
            
            return (
              <div
                key={workspace.name}
                className="group bg-surface-800 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-accent-warn/50 transition-all duration-200"
              >
                {/* Icon and Title */}
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-accent-warn/10 transition-colors duration-200">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-accent-warn transition-colors duration-200">
                    {workspace.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                  {workspace.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 sm:space-y-3">
                  {workspace.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-400 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 bg-accent-warn rounded-full mr-2 sm:mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}