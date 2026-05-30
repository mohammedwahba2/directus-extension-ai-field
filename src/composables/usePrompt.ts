import type { AiTone } from '../types'

export function usePrompt() {
  const toneInstructions: Record<AiTone, string> = {
    default: '',
    formal: 'Use a formal, professional tone.',
    casual: 'Use a casual, friendly tone.',
    technical: 'Use technical, precise language.',
  }

  const buildPrompt = (template: string, currentValue: string, tone: AiTone): string => {
    const toneNote = toneInstructions[tone]
    const base = template.replace('{{value}}', currentValue || '')
    return toneNote ? `${toneNote}\n\n${base}` : base
  }

  return { buildPrompt }
}