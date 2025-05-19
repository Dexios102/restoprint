// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: { enabled: true },
    ssr: false,
    app: {
        baseURL: "./",
        buildAssetsDir: "/_nuxt/",
    },
    nitro: {
        preset: "static",
    },
    modules:['@sentry/nuxt/module'
    ],
    sentry: {
        sourceMapsUploadOptions: {
          org: 'plateful-xd',
          project: 'plateful-capacitor',
          authToken: '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'
        }
      },
      sourcemap: { client: true },
});
