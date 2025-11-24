'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            const paintEntry = entry as PerformancePaintTiming;
            if (paintEntry.name === 'first-contentful-paint') {
              const fcp = paintEntry.startTime;
              console.log(`▲ First Contentful Paint: ${Math.round(fcp)}ms (target: <1000ms)`);
              
              // Send to analytics if FCP is slow
              if (fcp > 1000) {
                // You can send this to your analytics service
                console.warn('Performance Warning: Slow First Contentful Paint detected');
              }
            }
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });

      // Track Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const lcp = entry.startTime;
          console.log(`▲ Largest Contentful Paint: ${Math.round(lcp)}ms (target: <2500ms)`);
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        if (clsValue > 0) {
          console.log(`▲ Cumulative Layout Shift: ${clsValue.toFixed(3)} (target: <0.1)`);
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return null; // This component doesn't render anything
} 