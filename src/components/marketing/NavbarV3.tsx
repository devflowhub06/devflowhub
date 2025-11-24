'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { trackCTAClick, trackNavClick } from '@/lib/analytics'

function NavbarV3() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Product', href: '#product' },
    { name: 'Workspaces', href: '#workspaces' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Docs', href: '/docs' },
  ]

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-bg-900/98 backdrop-blur-xl border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 group">
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 group-hover:opacity-80 transition-opacity duration-200">
              <img 
                src="/devflowhub-original-logo.png" 
                alt="DevFlowHub" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-white tracking-tight group-hover:text-accent-warn transition-colors duration-200">
              devflowhub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-white/90 hover:text-white transition-colors duration-200 text-base font-medium"
                onClick={() => trackNavClick(link.name.toLowerCase(), 'navbar')}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-white/90 hover:text-white transition-colors duration-200 font-medium px-4 py-2"
              onClick={() => trackNavClick('nav_signin_click', 'navbar')}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-accent-warn text-white font-bold rounded-lg hover:bg-orange-600 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20"
              onClick={() => trackNavClick('nav_signup_click', 'navbar')}
            >
              Start Free
            </Link>
            <Link
              href="/book-demo"
              className="px-6 py-3 border border-white/20 text-white hover:text-accent-warn hover:border-accent-warn rounded-lg font-medium transition-all duration-200"
              onClick={() => trackCTAClick('Book a Demo', 'navbar')}
            >
              Book Demo
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-bg-900/98 backdrop-blur-xl border-t border-white/10">
          <div className="flex flex-col items-center py-8 space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-white hover:text-accent-warn transition-colors duration-200 text-base font-medium px-4 py-2" 
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  trackNavClick(link.name.toLowerCase(), 'navbar')
                }}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-3 pt-4 w-full px-6">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-200">
                  Sign In
                </button>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white rounded-lg bg-accent-warn hover:bg-orange-600 transition-colors duration-200">
                  Start Free
                </button>
              </Link>
              <Link href="/book-demo" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-200">
                  Book Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavbarV3