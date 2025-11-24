'use client'

import { useEffect } from 'react'
import './globals.css'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // More aggressive sidebar hiding
    const hideSidebar = () => {
      // Hide by class names and data attributes
      const selectors = [
        '[data-sidebar]',
        '.sidebar',
        'nav[class*="sidebar"]',
        'aside',
        '.w-64', // Common sidebar width
        '[class*="w-64"]'
      ]
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          if (el && !el.closest('[data-workspace]')) {
            (el as HTMLElement).style.display = 'none'
          }
        })
      })

      // Make main content full width
      const mainContent = document.querySelector('main')
      if (mainContent) {
        mainContent.style.marginLeft = '0'
        mainContent.style.width = '100%'
        mainContent.style.paddingLeft = '0'
      }

      // Hide any flex containers that might be the sidebar
      const body = document.body
      body.style.overflow = 'hidden'
    }

    // Run immediately and on DOM changes
    hideSidebar()
    const observer = new MutationObserver(hideSidebar)
    observer.observe(document.body, { childList: true, subtree: true })
    
    return () => {
      observer.disconnect()
      // Restore on cleanup
      const elements = document.querySelectorAll('[style*="display: none"]')
      elements.forEach(el => {
        (el as HTMLElement).style.display = ''
      })
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div data-workspace className="h-screen w-full bg-slate-900 overflow-hidden">
      {children}
    </div>
  )
}