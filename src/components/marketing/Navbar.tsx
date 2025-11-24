'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Menu, X } from 'lucide-react'
import { fadeInUp, buttonHover } from '@/lib/motion'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10)
  })

  const navItems = [
    { href: '#features', label: 'Features', scroll: true },
    { href: '#pricing', label: 'Pricing', scroll: true },
    { href: '/login', label: 'Login', scroll: false }
  ]

  const handleNavClick = (item: any) => {
    if (item.scroll) {
      const element = document.querySelector(item.href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#0b1220]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_40px_-25px_rgba(59,130,246,0.35)]' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center space-x-3"
            >
              {/* Logo Icon */}
              <div className="w-10 h-10 flex-shrink-0">
                <img 
                  src="/devflowhub-original-logo.png" 
                  alt="DevFlowHub" 
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Brand Name - Hidden on mobile, visible on desktop */}
              <motion.span 
                className="hidden md:block text-xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
              >
                DevFlowHub
              </motion.span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <button
                  onClick={() => handleNavClick(item)}
                  className="text-slate-300 hover:text-white transition-all duration-300 relative group font-medium"
                >
                  {item.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 plasma-gradient rounded-full"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileHover={{ scaleX: 1, originX: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </button>
              </motion.div>
            ))}
            
            <motion.button
              variants={buttonHover}
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push('/signup')}
              className="plasma-gradient text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 relative overflow-hidden group shadow-lg"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button 
            className="lg:hidden p-3 text-white hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-white/10 mt-4 pt-6 pb-6"
            >
              <div className="flex flex-col space-y-4">
                {/* Mobile Brand Name */}
                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                  <div className="w-8 h-8">
                    <img 
                      src="/devflowhub-original-logo.png" 
                      alt="DevFlowHub" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-lg font-bold text-white">DevFlowHub</span>
                </div>
                
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <button
                      onClick={() => {
                        handleNavClick(item)
                        setIsMobileMenuOpen(false)
                      }}
                      className="block text-slate-300 hover:text-white transition-colors py-2 font-medium text-left"
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    router.push('/signup')
                    setIsMobileMenuOpen(false)
                  }}
                  className="plasma-gradient text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 mt-4"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
