/**
 * DevFlowHub Homepage v3.0 Rollout Configuration
 * Production-ready rollout strategy with A/B testing
 */

export const ROLLOUT_CONFIG = {
  // Feature Flag Configuration
  featureFlags: {
    HOMEPAGE_V3: {
      enabled: process.env.NEXT_PUBLIC_HOMEPAGE_V3 === 'true' || process.env.NODE_ENV === 'development',
      rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_HOMEPAGE_V3_ROLLOUT || '100'),
      description: 'Enable Homepage v3.0 with new design and A/B testing'
    },
    HERO_COPY_VARIANT: {
      enabled: process.env.NEXT_PUBLIC_HERO_COPY_VARIANT === 'true' || process.env.NODE_ENV === 'development',
      rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_HERO_COPY_ROLLOUT || '50'),
      description: 'Enable Hero copy A/B testing (A vs B variants)'
    }
  },

  // Rollout Phases
  phases: [
    {
      name: 'Phase 1: Soft Launch',
      description: '10% traffic, monitor core metrics',
      homepageRollout: 10,
      heroVariantRollout: 50,
      duration: '48 hours',
      metrics: ['SignUp conversion', 'BookDemo clicks', 'bounce rate', 'LCP']
    },
    {
      name: 'Phase 2: Gradual Increase',
      description: '50% traffic, validate performance',
      homepageRollout: 50,
      heroVariantRollout: 50,
      duration: '24 hours',
      metrics: ['Performance scores', 'accessibility', 'cross-browser compatibility']
    },
    {
      name: 'Phase 3: Full Rollout',
      description: '100% traffic, sunset old homepage',
      homepageRollout: 100,
      heroVariantRollout: 50,
      duration: 'Ongoing',
      metrics: ['Conversion rates', 'user satisfaction', 'technical performance']
    }
  ],

  // A/B Test Variants
  abTests: {
    heroCopy: {
      name: 'Hero Copy A/B Test',
      variants: {
        A: {
          headline: 'Build the future. Ship with AI.',
          subheadline: 'From idea to production in minutes — single platform, unified AI workspaces that keep context across tools.',
          weight: 50
        },
        B: {
          headline: 'Ship faster with an AI Development OS',
          subheadline: 'AI agents that understand your project. Build, test and deploy — without switching tools.',
          weight: 50
        }
      },
      successMetrics: ['CTA click rate', 'time on page', 'conversion rate'],
      duration: '2 weeks'
    }
  },

  // Analytics Events to Track
  analyticsEvents: {
    homepage: {
      launch: 'Homepage_v3_Launch',
      ctaStartTrial: 'Homepage_CTA_StartTrial',
      ctaBookDemo: 'Homepage_CTA_BookDemo',
      exploreWorkspace: 'Homepage_Link_ExploreWorkspace'
    },
    abTesting: {
      variantAView: 'Hero_Variant_A_View',
      variantBView: 'Hero_Variant_B_View',
      variantAClick: 'Hero_Variant_A_Click',
      variantBClick: 'Hero_Variant_B_Click'
    }
  },

  // Performance Targets
  performanceTargets: {
    lighthouse: {
      performance: 90,
      accessibility: 90,
      seo: 90,
      bestPractices: 90
    },
    coreWebVitals: {
      lcp: 2.5, // seconds
      fid: 100, // milliseconds
      cls: 0.1
    }
  },

  // Rollback Criteria
  rollbackCriteria: {
    performance: {
      lcpIncrease: 0.5, // seconds
      accessibilityScore: 85,
      errorRate: 0.01 // 1%
    },
    business: {
      conversionDrop: 0.05, // 5%
      bounceRateIncrease: 0.1, // 10%
      userComplaints: 10 // per hour
    }
  }
} as const

/**
 * Environment Variables Setup
 * Add these to your .env.local file:
 * 
 * # Homepage v3.0 Feature Flag
 * NEXT_PUBLIC_HOMEPAGE_V3=true
 * NEXT_PUBLIC_HOMEPAGE_V3_ROLLOUT=10
 * 
 * # Hero Copy A/B Testing
 * NEXT_PUBLIC_HERO_COPY_VARIANT=true
 * NEXT_PUBLIC_HERO_COPY_ROLLOUT=50
 */

/**
 * Rollout Checklist
 * 
 * Phase 1 (10% rollout):
 * [ ] Set NEXT_PUBLIC_HOMEPAGE_V3_ROLLOUT=10
 * [ ] Monitor analytics dashboard
 * [ ] Check error logs
 * [ ] Verify all CTAs work
 * [ ] Test accessibility
 * 
 * Phase 2 (50% rollout):
 * [ ] Set NEXT_PUBLIC_HOMEPAGE_V3_ROLLOUT=50
 * [ ] Monitor performance metrics
 * [ ] Check cross-browser compatibility
 * [ ] Verify A/B test distribution
 * 
 * Phase 3 (100% rollout):
 * [ ] Set NEXT_PUBLIC_HOMEPAGE_V3_ROLLOUT=100
 * [ ] Monitor conversion rates
 * [ ] Prepare to sunset old homepage
 * [ ] Document learnings
 */

export default ROLLOUT_CONFIG
