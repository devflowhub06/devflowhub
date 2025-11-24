export async function register() {
  // Temporarily disabled Sentry instrumentation
  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   const Sentry = await import('@sentry/nextjs');
    
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     tracesSampleRate: 1.0,
  //     debug: process.env.NODE_ENV === 'development',
  //     replaysOnErrorSampleRate: 1.0,
  //     replaysSessionSampleRate: 0.1,
  //     integrations: [
  //       Sentry.replayIntegration({
  //         maskAllText: false,
  //         blockAllMedia: false,
  //       }),
  //     ],
  //   });
  // }

  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   const Sentry = await import('@sentry/nextjs');
    
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     tracesSampleRate: 1.0,
  //     debug: process.env.NODE_ENV === 'development',
  //   });
  // }
} 