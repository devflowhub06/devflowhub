'use client'

import React from 'react'
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveText,
  ResponsiveSpacing,
  ResponsiveShow,
  useBreakpoint,
  useResponsiveValue,
} from '@/components/layout/ResponsiveContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Monitor,
  Tablet,
  Smartphone,
  Tv,
  Laptop,
  Sparkles,
  Zap,
  Rocket,
  Code,
  Palette,
} from 'lucide-react'

export default function ResponsiveDemoPage() {
  const breakpoint = useBreakpoint()
  
  const columns = useResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4,
    qhd: 4,
    '4k': 5,
    '5k': 6,
    '6k': 7,
    '8k': 8,
    default: 3,
  })

  const getBreakpointIcon = () => {
    switch (breakpoint) {
      case 'mobile':
        return <Smartphone className="icon-responsive-lg text-blue-500" />
      case 'tablet':
        return <Tablet className="icon-responsive-lg text-green-500" />
      case 'desktop':
        return <Laptop className="icon-responsive-lg text-purple-500" />
      case 'large':
        return <Monitor className="icon-responsive-lg text-orange-500" />
      default:
        return <Tv className="icon-responsive-lg text-red-500" />
    }
  }

  const getBreakpointInfo = () => {
    const info = {
      mobile: { name: 'Mobile', range: '< 768px', color: 'bg-blue-100 text-blue-800' },
      tablet: { name: 'Tablet', range: '768px - 1023px', color: 'bg-green-100 text-green-800' },
      desktop: { name: 'Desktop', range: '1024px - 1439px', color: 'bg-purple-100 text-purple-800' },
      large: { name: 'Large Desktop', range: '1440px - 1919px', color: 'bg-orange-100 text-orange-800' },
      qhd: { name: 'QHD/2K', range: '1920px - 2559px', color: 'bg-pink-100 text-pink-800' },
      '4k': { name: '4K/UHD', range: '2560px - 3839px', color: 'bg-red-100 text-red-800' },
      '5k': { name: '5K', range: '3840px - 5119px', color: 'bg-indigo-100 text-indigo-800' },
      '6k': { name: '6K', range: '5120px - 7679px', color: 'bg-cyan-100 text-cyan-800' },
      '8k': { name: '8K', range: '≥ 7680px', color: 'bg-fuchsia-100 text-fuchsia-800' },
    }
    return info[breakpoint] || info.desktop
  }

  const breakpointInfo = getBreakpointInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with breakpoint indicator */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <ResponsiveContainer maxWidth="4xl">
          <div className="py-responsive flex items-center justify-between">
            <div className="flex items-center gap-responsive">
              {getBreakpointIcon()}
              <div>
                <ResponsiveText size="xl" className="font-bold text-gray-900 dark:text-white">
                  DevFlowHub Responsive Demo
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                  Current: {breakpointInfo.name} ({breakpointInfo.range})
                </ResponsiveText>
              </div>
            </div>
            <Badge className={`${breakpointInfo.color} px-responsive py-2`}>
              {breakpoint.toUpperCase()}
            </Badge>
          </div>
        </ResponsiveContainer>
      </div>

      <ResponsiveContainer maxWidth="4xl" padding="responsive">
        <ResponsiveSpacing size="xl" />

        {/* Hero Section */}
        <div className="text-center">
          <ResponsiveText size="4xl" fluid className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            World-Class Responsive Design
          </ResponsiveText>
          <ResponsiveSpacing size="md" />
          <ResponsiveText size="lg" className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience seamless scaling from mobile (320px) to 8K displays (7680px+).
            Our design system adapts beautifully to every screen size.
          </ResponsiveText>
        </div>

        <ResponsiveSpacing size="2xl" />

        {/* Feature Cards Grid */}
        <ResponsiveGrid cols="auto" gap="responsive">
          <ResponsiveCard>
            <div className="flex items-start gap-responsive">
              <Sparkles className="icon-responsive-lg text-blue-500 flex-shrink-0" />
              <div>
                <ResponsiveText size="xl" className="font-semibold text-gray-900 dark:text-white mb-2">
                  Fluid Typography
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                  Text scales perfectly using CSS clamp() and viewport units for optimal readability.
                </ResponsiveText>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-start gap-responsive">
              <Zap className="icon-responsive-lg text-purple-500 flex-shrink-0" />
              <div>
                <ResponsiveText size="xl" className="font-semibold text-gray-900 dark:text-white mb-2">
                  Smart Spacing
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                  Padding and margins adapt automatically based on screen size.
                </ResponsiveText>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-start gap-responsive">
              <Rocket className="icon-responsive-lg text-green-500 flex-shrink-0" />
              <div>
                <ResponsiveText size="xl" className="font-semibold text-gray-900 dark:text-white mb-2">
                  Adaptive Layouts
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                  Grid columns adjust from 1 on mobile to 8 on 8K displays.
                </ResponsiveText>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-start gap-responsive">
              <Code className="icon-responsive-lg text-orange-500 flex-shrink-0" />
              <div>
                <ResponsiveText size="xl" className="font-semibold text-gray-900 dark:text-white mb-2">
                  Developer Friendly
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                  Simple React components and hooks for responsive behavior.
                </ResponsiveText>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-start gap-responsive">
              <Palette className="icon-responsive-lg text-pink-500 flex-shrink-0" />
              <div>
                <ResponsiveText size="xl" className="font-semibold text-gray-900 dark:text-white mb-2">
                  Beautiful at Any Size
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                  Consistent visual hierarchy across all devices.
                </ResponsiveText>
              </div>
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>

        <ResponsiveSpacing size="2xl" />

        {/* Grid Demonstration */}
        <Card className="p-responsive">
          <ResponsiveText size="2xl" className="font-bold text-gray-900 dark:text-white mb-responsive">
            Adaptive Grid Demo
          </ResponsiveText>
          <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400 mb-responsive">
            Currently showing {columns} columns
          </ResponsiveText>

          <div className="grid-responsive grid-responsive-auto">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="p-responsive text-center bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <ResponsiveText size="4xl" className="font-bold">
                  {i + 1}
                </ResponsiveText>
              </Card>
            ))}
          </div>
        </Card>

        <ResponsiveSpacing size="2xl" />

        {/* Typography Scale Demo */}
        <Card className="p-responsive">
          <ResponsiveText size="2xl" className="font-bold text-gray-900 dark:text-white mb-responsive">
            Typography Scale
          </ResponsiveText>
          
          <div className="space-y-4">
            <div>
              <ResponsiveText size="xs" className="text-gray-600 dark:text-gray-400">
                XS: The quick brown fox jumps over the lazy dog
              </ResponsiveText>
            </div>
            <div>
              <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                SM: The quick brown fox jumps over the lazy dog
              </ResponsiveText>
            </div>
            <div>
              <ResponsiveText size="base" className="text-gray-900 dark:text-white">
                BASE: The quick brown fox jumps over the lazy dog
              </ResponsiveText>
            </div>
            <div>
              <ResponsiveText size="lg" className="text-gray-900 dark:text-white">
                LG: The quick brown fox jumps over the lazy dog
              </ResponsiveText>
            </div>
            <div>
              <ResponsiveText size="xl" className="text-gray-900 dark:text-white font-semibold">
                XL: The quick brown fox jumps over the lazy dog
              </ResponsiveText>
            </div>
            <div>
              <ResponsiveText size="2xl" className="text-gray-900 dark:text-white font-semibold">
                2XL: The quick brown fox jumps over the lazy dog
              </ResponsiveText>
            </div>
            <div>
              <ResponsiveText size="3xl" className="text-gray-900 dark:text-white font-bold">
                3XL: The quick brown fox
              </ResponsiveText>
            </div>
            <div>
              <ResponsiveText size="4xl" fluid className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold">
                4XL (Fluid): Responsive!
              </ResponsiveText>
            </div>
          </div>
        </Card>

        <ResponsiveSpacing size="2xl" />

        {/* Conditional Display Demo */}
        <Card className="p-responsive">
          <ResponsiveText size="2xl" className="font-bold text-gray-900 dark:text-white mb-responsive">
            Conditional Display
          </ResponsiveText>
          
          <div className="space-y-4">
            <ResponsiveShow on={['mobile']}>
              <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
                📱 This message only appears on mobile devices
              </div>
            </ResponsiveShow>

            <ResponsiveShow on={['tablet']}>
              <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                💻 This message only appears on tablets
              </div>
            </ResponsiveShow>

            <ResponsiveShow above="desktop">
              <div className="p-4 bg-purple-100 text-purple-800 rounded-lg">
                🖥️ This message appears on desktop and larger screens
              </div>
            </ResponsiveShow>

            <ResponsiveShow on={['4k', '5k', '6k', '8k']}>
              <div className="p-4 bg-red-100 text-red-800 rounded-lg animate-pulse">
                🎉 Wow! You're on a 4K+ display! Welcome to the future!
              </div>
            </ResponsiveShow>
          </div>
        </Card>

        <ResponsiveSpacing size="2xl" />

        {/* Call to Action */}
        <div className="text-center">
          <Button className="btn-responsive-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Sparkles className="icon-responsive-md mr-2" />
            Try It Yourself - Resize Your Browser!
          </Button>
        </div>

        <ResponsiveSpacing size="2xl" />
      </ResponsiveContainer>
    </div>
  )
}

