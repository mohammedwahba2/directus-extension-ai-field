import { defineEndpoint } from '@directus/extensions-sdk'
import { registerRoutes } from './router'

export default defineEndpoint({
  id: 'ai-field-api',
  handler: (router) => {
    registerRoutes(router)
  },
})