import { defineInterface } from '@directus/extensions-sdk'
import AiField from './AiField.vue'

export default defineInterface({
  id: 'ai-field',
  name: 'AI Field',
  icon: 'auto_awesome',
  description: 'Generate content using Claude, GPT, Gemini, Mistral, or DeepSeek directly inside Directus.',
  component: AiField,
  types: ['string', 'text'],
  options: [
    {
      field: 'provider',
      name: 'AI Provider',
      type: 'string',
      schema: { default_value: 'claude' },
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Claude (Anthropic)', value: 'claude' },
            { text: 'GPT-4o mini (OpenAI)', value: 'openai' },
            { text: 'Gemini 2.0 Flash (Google)', value: 'gemini' },
            { text: 'Mistral Small (Mistral AI)', value: 'mistral' },
            { text: 'DeepSeek Chat (DeepSeek)', value: 'deepseek' },
          ],
        },
      },
    },
    {
      field: 'tone',
      name: 'Tone',
      type: 'string',
      schema: { default_value: 'default' },
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Default', value: 'default' },
            { text: 'Formal', value: 'formal' },
            { text: 'Casual', value: 'casual' },
            { text: 'Technical', value: 'technical' },
          ],
        },
      },
    },
    {
      field: 'promptTemplate',
      name: 'Prompt Template',
      type: 'string',
      schema: { default_value: 'Write content for: {{value}}' },
      meta: {
        interface: 'input',
        note: 'Use {{value}} for the current field, or {{fieldName}} for any other field in the same item.',
      },
    },
    {
      field: 'maxTokens',
      name: 'Max Tokens',
      type: 'integer',
      schema: { default_value: 500 },
      meta: { interface: 'input' },
    },
  ],
})