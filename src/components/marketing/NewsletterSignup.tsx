'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { trackCTAClick } from '@/lib/analytics'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    trackCTAClick('Newsletter Signup', 'footer', { email })

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In production, replace with actual API call
      setStatus('success')
      setMessage('Thanks for subscribing! Check your email for confirmation.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="premium-card p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-text-100 mb-2">
          Stay Updated
        </h3>
        <p className="text-body-text text-sm">
          Get the latest updates on AI development tools and features.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-70" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full pl-10 pr-4 py-3 bg-surface-800 border border-white/10 rounded-lg text-text-100 placeholder-muted-70 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
            disabled={status === 'loading'}
          />
        </div>

        <motion.button
          type="submit"
          className="w-full accent-gradient text-white font-semibold py-3 rounded-lg hover:shadow-neon-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={status === 'loading' || !email}
          whileHover={{ scale: status !== 'loading' ? 1.02 : 1 }}
          whileTap={{ scale: status !== 'loading' ? 0.98 : 1 }}
        >
          {status === 'loading' ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subscribing...
            </div>
          ) : (
            'Subscribe'
          )}
        </motion.button>

        {/* Status Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-center text-sm ${
              status === 'success' ? 'text-success-50' : 'text-red-400'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2" />
            )}
            {message}
          </motion.div>
        )}
      </form>

      <p className="text-xs text-muted-70 text-center mt-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}
