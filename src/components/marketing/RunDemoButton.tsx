'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, ExternalLink } from 'lucide-react'
import { trackCTAClick } from '@/lib/analytics'

export default function RunDemoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRunDemo = async () => {
    setIsLoading(true)
    trackCTAClick('Run Demo', 'hero_code_card', { source: 'code_snippet' })

    try {
      // Simulate demo loading
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsModalOpen(true)
    } catch (error) {
      console.error('Demo failed to load:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={handleRunDemo}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:shadow-neon-sm transition-all duration-200 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Play className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
        )}
        {isLoading ? 'Starting...' : 'Run Demo'}
      </motion.button>

      {/* Demo Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-surface-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-100 mb-2">
                    Live Demo: AI Development OS
                  </h3>
                  <p className="text-body-text text-sm">
                    Experience DevFlowHub's AI workspaces in action
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-surface-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-70" />
                </button>
              </div>

              {/* Demo Content */}
              <div className="space-y-6">
                {/* Demo Terminal */}
                <div className="bg-bg-900 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-muted-70 text-xs">DevFlowHub AI Terminal</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-success-50">
                      $ aios.create-project --name "ecommerce-app" --template "react"
                    </div>
                    <div className="text-cyan-500">
                      ✓ Project created successfully
                    </div>
                    <div className="text-success-50">
                      $ aios.route --task "add user authentication" --context "react app"
                    </div>
                    <div className="text-purple-500">
                      → Routing to Editor workspace
                    </div>
                    <div className="text-success-50">
                      $ aios.deploy --environment "staging"
                    </div>
                    <div className="text-orange-500">
                      → Deploying to staging environment...
                    </div>
                    <div className="text-green-500">
                      ✓ Deployment successful: https://demo-ecommerce-app.vercel.app
                    </div>
                  </div>
                </div>

                {/* Demo Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="premium-card p-4">
                    <h4 className="font-semibold text-text-100 mb-2">AI Code Generation</h4>
                    <p className="text-body-text text-sm">
                      Watch as AI generates React components with proper TypeScript types and styling.
                    </p>
                  </div>
                  <div className="premium-card p-4">
                    <h4 className="font-semibold text-text-100 mb-2">Intelligent Routing</h4>
                    <p className="text-body-text text-sm">
                      See how AI routes tasks to the most appropriate workspace based on context.
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-4">
                  <motion.a
                    href="/signup"
                    className="inline-flex items-center px-6 py-3 accent-gradient text-white font-semibold rounded-lg hover:shadow-neon-md transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => trackCTAClick('Start Free Trial', 'demo_modal')}
                  >
                    Start Your Free Trial
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
