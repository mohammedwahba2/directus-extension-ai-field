import type { Router } from 'express'

export function registerRoutes(router: Router) {
  router.post('/generate', async (req, res) => {
    const { prompt, provider, maxTokens = 500 } = req.body

    if (!prompt) {
      return res.status(400).json({ message: 'prompt is required' })
    }

    try {
      if (provider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) return res.status(500).json({ message: 'OPENAI_API_KEY not set' })

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

        const data = await response.json() as any
        return res.json({ content: data.choices[0].message.content, provider: 'openai' })
      }

      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY not set' })
      
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
      
        const data = await response.json() as any
        console.log('Gemini response:', JSON.stringify(data))
        return res.json({
          content: data.candidates[0].content.parts[0].text,
          provider: 'gemini',
        })
      }
      // Default: Claude
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return res.status(500).json({ message: 'ANTHROPIC_API_KEY not set' })

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

      const data = await response.json() as any
      return res.json({ content: data.content[0].text, provider: 'claude' })

    } catch (err) {
      return res.status(500).json({ message: 'Failed to generate content' })
    }
  })
}