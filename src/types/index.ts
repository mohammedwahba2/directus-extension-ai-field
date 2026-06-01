export type AiProvider = 'claude' | 'openai' | 'gemini' | 'mistral' | 'deepseek'

export type AiTone = 'default' | 'formal' | 'casual' | 'technical'

export interface AiFieldOptions {
  provider: AiProvider
  tone: AiTone
  promptTemplate: string
  maxTokens: number
}

export interface GenerateRequest {
  prompt: string
  provider: AiProvider
  tone: AiTone
  maxTokens: number
}

export interface GenerateResponse {
  content: string
  provider: AiProvider
}

export interface GenerationHistory {
  content: string
  provider: AiProvider
  timestamp: number
}