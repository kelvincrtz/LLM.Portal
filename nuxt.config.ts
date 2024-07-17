// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head : {
      title: 'OpenAI Portal Demo',
      meta: [
        { name : 'description', content: 'AI portal demo'}
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL
    },
    currencyKey: process.env.CURRENCY_API_KEY
  }
})