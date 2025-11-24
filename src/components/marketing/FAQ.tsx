'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqData = [
  {
    id: 1,
    question: "How does DevFlowHub's AI context work across all workspaces?",
    answer: "DevFlowHub's AI maintains complete project memory as you move between workspaces. Whether you're coding in Editor, testing in Sandbox, or deploying, the AI remembers your entire codebase, requirements, and architecture decisions. This eliminates context switching and ensures intelligent, relevant suggestions at every stage of development."
  },
  {
    id: 2,
    question: "What problem does DevFlowHub solve that other tools don't?",
    answer: "Traditional development requires juggling 5-10 separate tools (IDE, CI/CD, testing, design, deployment) with zero context sharing. DevFlowHub unifies everything into one AI-powered development OS where your AI assistant understands your entire project, reducing setup time by 90% and accelerating development 10x faster than traditional workflows."
  },
  {
    id: 3,
    question: "How is DevFlowHub different from Replit or other cloud IDEs?",
    answer: "While Replit focuses on browser-based coding, DevFlowHub is a complete development OS with production deployment, cross-workspace AI memory, team collaboration, and enterprise features. We don't just provide an editor—we provide the entire development lifecycle with intelligent automation."
  },
  {
    id: 4,
    question: "Can teams collaborate effectively on DevFlowHub?",
    answer: "Absolutely. Teams love DevFlowHub's shared AI context—when one developer works on a feature, the AI remembers it for everyone. Combined with real-time collaboration, version control, and workspace sharing, your team ships faster with better code quality and fewer miscommunications."
  },
  {
    id: 5,
    question: "Is DevFlowHub suitable for production applications?",
    answer: "Yes. Unlike playground tools, DevFlowHub is built for production. We offer enterprise-grade uptime (99.9% SLA), automatic scaling, monitoring, rollback protection, and support for all major cloud providers. Teams across 27 countries use DevFlowHub for mission-critical applications."
  },
  {
    id: 6,
    question: "How quickly can I start building on DevFlowHub?",
    answer: "Setup takes 2 minutes. Import from GitHub or start fresh—our AI immediately understands your project structure. No configuration needed. Just start coding, and watch AI assist you with context-aware suggestions across all workspaces."
  },
  {
    id: 7,
    question: "What makes DevFlowHub's AI superior to other coding assistants?",
    answer: "Most AI assistants only understand a single file. DevFlowHub's AI has context of your entire project across all workspaces—Editor, Sandbox, UI Studio, Deployer—making it 10x more accurate. It remembers your architecture, preferences, and decisions throughout your development journey."
  },
  {
    id: 8,
    question: "Can I export my code and switch away if needed?",
    answer: "Yes, absolutely. Unlike no-code platforms, you have full code ownership. Export to GitHub anytime. Your code is yours. DevFlowHub enhances your workflow—we never lock you in."
  }
]

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-bg-900" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Frequently{' '}
            <span className="text-accent-warn">Asked Questions</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about DevFlowHub's AI-powered development platform.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4">
          {faqData.map((item) => (
            <div
              key={item.id}
              className="bg-surface-800 border border-white/10 rounded-lg sm:rounded-xl overflow-hidden hover:border-accent-warn/30 transition-all duration-200"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/5 transition-colors duration-200"
              >
                <span className="text-white font-semibold text-base sm:text-lg pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openItems.includes(item.id) ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openItems.includes(item.id) && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}