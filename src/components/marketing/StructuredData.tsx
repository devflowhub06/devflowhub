'use client'

import Script from 'next/script'

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DevFlowHub",
    "description": "The world's first AI Development OS. Unified AI workspaces that keep full project context across ideation, code, testing and deployment.",
    "url": "https://devflowhub.com",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free trial available"
    },
    "creator": {
      "@type": "Organization",
      "name": "DevFlowHub",
      "url": "https://devflowhub.com",
      "logo": "https://devflowhub.com/devflowhub-original-logo.png",
      "sameAs": [
        "https://twitter.com/devflowhub",
        "https://github.com/devflowhub"
      ]
    },
    "featureList": [
      "AI pair-coding that understands your repo",
      "Instant containers with live debugging", 
      "Design-to-code and component library",
      "One-click deploy, monitoring & rollback",
      "Cross-workspace memory and intelligent routing"
    ],
    "screenshot": "https://devflowhub.com/og-image.png",
    "softwareVersion": "3.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "DevFlowHub Team"
    }
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}
