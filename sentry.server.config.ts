import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: 'https://5d54f7f7cca6c99d60b779d3eb966674@o4508998165397504.ingest.us.sentry.io/4508998176604160',

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false
})
