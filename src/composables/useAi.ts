import { ref } from 'vue'
import { useApi } from '@directus/extensions-sdk'
import type { AiProvider, AiTone } from '../types'

export function useAi() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const generate = async (
    prompt: string,
    provider: AiProvider,
    tone: AiTone,
    maxTokens: number
  ): Promise<string | null> => {
    loading.value = true
    error.value = null

    try {
      const res = await api.post('/ai-field-api/generate', {
        prompt,
        provider,
        tone,
        maxTokens,
      })
      return res.data.content
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Something went wrong'
      return null
    } finally {
      loading.value = false
    }
  }

  return { generate, loading, error }
}