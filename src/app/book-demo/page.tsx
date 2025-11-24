'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Video, Users, Zap, Shield, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BookDemoPage() {
  const router = useRouter()

  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg-900 text-white">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-bg-900 via-surface-800 to-bg-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-purple-500/20" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => router.push('/')}
            className="group flex items-center space-x-2 text-muted-70 hover:text-text-100 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                >
                  <h1 className="text-6xl lg:text-7xl font-bold text-text-100 leading-tight">
                    Book a{' '}
                    <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse">
                      Demo
                    </span>
                  </h1>
                  <div className="mt-4">
                    <span className="text-2xl lg:text-3xl font-semibold text-muted-70">
                      with{' '}
                      <span className="text-accent-warn font-bold">Abhinay</span>
                    </span>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl lg:text-2xl text-body-text leading-relaxed max-w-2xl"
                >
                  Experience the future of AI-powered development. See how DevFlowHub transforms your workflow in just 30 minutes.
                </motion.p>
              </div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="grid sm:grid-cols-2 gap-6"
              >
                <div className="premium-card p-6 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-100 mb-2">Live Product Tour</h3>
                  <p className="text-body-text text-sm leading-relaxed">
                    See DevFlowHub's AI workspaces in action with real-time coding and deployment.
                  </p>
                </div>

                <div className="premium-card p-6 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-100 mb-2">Personalized Experience</h3>
                  <p className="text-body-text text-sm leading-relaxed">
                    Tailored demo based on your specific use cases and development needs.
                  </p>
                </div>

                <div className="premium-card p-6 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-100 mb-2">10× Faster Development</h3>
                  <p className="text-body-text text-sm leading-relaxed">
                    Learn how to build, test, and deploy applications at unprecedented speed.
                  </p>
                </div>

                <div className="premium-card p-6 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-100 mb-2">Enterprise Ready</h3>
                  <p className="text-body-text text-sm leading-relaxed">
                    Discover team collaboration features and enterprise-grade security.
                  </p>
                </div>
              </motion.div>

              {/* What You'll Learn */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="premium-card p-8"
              >
                <div className="flex items-center mb-6">
                  <Star className="w-6 h-6 text-accent-warn mr-3" />
                  <h3 className="text-2xl font-bold text-text-100">What You'll Discover</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-body-text">AI-powered code generation & completion</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-body-text">Unified workspace management</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-body-text">One-click deployment & rollback</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-body-text">Advanced analytics & monitoring</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-body-text">Team collaboration tools</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-body-text">Custom integrations & APIs</span>
                  </div>
                </div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-center"
              >
                <p className="text-muted-70 text-sm mb-4">Trusted by developers worldwide</p>
                <div className="flex justify-center items-center space-x-8 opacity-60">
                  <div className="text-xs font-semibold text-muted-70">50K+ Developers</div>
                  <div className="w-1 h-1 bg-muted-70 rounded-full"></div>
                  <div className="text-xs font-semibold text-muted-70">99.9% Uptime</div>
                  <div className="w-1 h-1 bg-muted-70 rounded-full"></div>
                  <div className="text-xs font-semibold text-muted-70">Enterprise Grade</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Enhanced Calendly Widget */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="premium-card p-8 min-h-[800px] relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-text-100 mb-2">Schedule Your Demo</h3>
                    <p className="text-body-text">Choose a time that works for you</p>
                  </div>
                  
                  <div
                    className="calendly-inline-widget"
                    data-url="https://calendly.com/abhinay-devflowhub/30min?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=22d3ee"
                    style={{ minWidth: '320px', height: '700px' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

