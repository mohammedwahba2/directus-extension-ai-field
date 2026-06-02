/// <reference types="@directus/extensions/api.d.ts" />
import type { SandboxEndpointRouter } from 'directus:api'
import { request } from 'directus:api'

export function registerRoutes(router: SandboxEndpointRouter) {
  router.post('/generate', async (context) => {
    // Authentication check
    if (!context.accountability?.user) {
      return { status: 401, body: { message: 'Unauthorized. You must be logged in to use AI generation.' } }
    }

    const { prompt, provider, maxTokens = 500 } = context.body as any

    if (!prompt || typeof prompt !== 'string') {
      return { status: 400, body: { message: 'prompt is required and must be a string' } }
    }

    if (maxTokens < 1 || maxTokens > 4096) {
      return { status: 400, body: { message: 'maxTokens must be between 1 and 4096' } }
    }

    try {
      // ─── OpenAI ───────────────────────────────────────────────────────────
      if (provider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) return { status: 500, body: { message: 'OPENAI_API_KEY is not configured on this server.' } }

        const response = await request('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
          }),
        })

        if (response.status !== 200) {
          const err = typeof response.data === 'object' ? response.data as any : {}
          return { status: 502, body: { message: err?.error?.message || `OpenAI API error (${response.status})` } }
        }

        const data = response.data as any
        return { status: 200, body: { content: data.choices[0].message.content, provider: 'openai' } }
      }

      // ─── Gemini ───────────────────────────────────────────────────────────
      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return { status: 500, body: { message: 'GEMINI_API_KEY is not configured on this server.' } }

        const response = await request(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        )

        if (response.status !== 200) {
          const err = typeof response.data === 'object' ? response.data as any : {}
          return { status: 502, body: { message: err?.error?.message || `Gemini API error (${response.status})` } }
        }

        const data = response.data as any
        return { status: 200, body: { content: data.candidates[0].content.parts[0].text, provider: 'gemini' } }
      }

      // ─── Mistral ──────────────────────────────────────────────────────────
      if (provider === 'mistral') {
        const apiKey = process.env.MISTRAL_API_KEY
        if (!apiKey) return { status: 500, body: { message: 'MISTRAL_API_KEY is not configured on this server.' } }

        const response = await request('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
          }),
        })

        if (response.status !== 200) {
          const err = typeof response.data === 'object' ? response.data as any : {}
          return { status: 502, body: { message: err?.message || `Mistral API error (${response.status})` } }
        }

        const data = response.data as any
        return { status: 200, body: { content: data.choices[0].message.content, provider: 'mistral' } }
      }

      // ─── DeepSeek ─────────────────────────────────────────────────────────
      if (provider === 'deepseek') {
        const apiKey = process.env.DEEPSEEK_API_KEY
        if (!apiKey) return { status: 500, body: { message: 'DEEPSEEK_API_KEY is not configured on this server.' } }

        const response = await request('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
          }),
        })

        if (response.status !== 200) {
          const err = typeof response.data === 'object' ? response.data as any : {}
          return { status: 502, body: { message: err?.error?.message || `DeepSeek API error (${response.status})` } }
        }

        const data = response.data as any
        return { status: 200, body: { content: data.choices[0].message.content, provider: 'deepseek' } }
      }

      // ─── Claude (default) ─────────────────────────────────────────────────
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return { status: 500, body: { message: 'ANTHROPIC_API_KEY is not configured on this server.' } }

      const response = await request('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (response.status !== 200) {
        const err = typeof response.data === 'object' ? response.data as any : {}
        return { status: 502, body: { message: err?.error?.message || `Anthropic API error (${response.status})` } }
      }

      const data = response.data as any
      return { status: 200, body: { content: data.content[0].text, provider: 'claude' } }

    } catch (err: any) {
      return { status: 500, body: { message: err?.message || 'Failed to generate content. Please try again.' } }
    }
  })
}