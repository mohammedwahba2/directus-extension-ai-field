import type { AiTone } from '../types'

export function usePrompt() {
  const toneInstructions: Record<AiTone, string> = {
    default: '',
    formal: 'Use a formal, professional tone.',
    casual: 'Use a casual, friendly tone.',
    technical: 'Use technical, precise language.',
  }

  // Builds the prompt and replaces placeholders with field values
  const buildPrompt = (
    template: string,
    currentValue: string,
    tone: AiTone,
    itemValues: Record<string, any> = {}
  ): string => {
    const toneNote = toneInstructions[tone]

    // Replace current field value
    let base = template.replace(/\{\{value\}\}/g, currentValue || '')

    // Replace values from other fields
    base = base.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
      if (fieldName in itemValues) {
        const val = itemValues[fieldName]
        return val !== null && val !== undefined ? String(val) : ''
      }

      return match
    })

    return toneNote ? `${toneNote}\n\n${base}` : base
  }

  return { buildPrompt }
}