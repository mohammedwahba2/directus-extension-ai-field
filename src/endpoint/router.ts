import type { Router } from 'express'

export function registerRoutes(router: Router) {
  router.post('/generate', async (req, res) => {
    // Authentication check — must be logged in to Directus
    const accountability = (req as any).accountability
    if (!accountability?.user) {
      return res.status(401).json({ message: 'Unauthorized. You must be logged in to use AI generation.' })
    }

    const { prompt, provider, maxTokens = 500 } = req.body

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'prompt is required and must be a string' })
    }

    if (maxTokens < 1 || maxTokens > 4096) {
      return res.status(400).json({ message: 'maxTokens must be between 1 and 4096' })
    }

    try {
      if (provider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) return res.status(500).json({ message: 'OPENAI_API_KEY is not configured on this server.' })

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
          }),
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({})) as any
          const msg = err?.error?.message || `OpenAI API error (${response.status})`
          return res.status(502).json({ message: msg })
        }

        const data = await response.json() as any
        return res.json({ content: data.choices[0].message.content, provider: 'openai' })
      }

      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on this server.' })

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        )

        if (!response.ok) {
          const err = await response.json().catch(() => ({})) as any
          const msg = err?.error?.message || `Gemini API error (${response.status})`
          return res.status(502).json({ message: msg })
        }

        const data = await response.json() as any
        return res.json({
          content: data.candidates[0].content.parts[0].text,
          provider: 'gemini',
        })
      }

      // Default: Claude
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return res.status(500).json({ message: 'ANTHROPIC_API_KEY is not configured on this server.' })

      const response = await fetch('https://api.anthropic.com/v1/messages', {
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

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as any
        const msg = err?.error?.message || `Anthropic API error (${response.status})`
        return res.status(502).json({ message: msg })
      }

      const data = await response.json() as any
      return res.json({ content: data.content[0].text, provider: 'claude' })

    } catch (err: any) {
      return res.status(500).json({ message: err?.message || 'Failed to generate content. Please try again.' })
    }
  })
}