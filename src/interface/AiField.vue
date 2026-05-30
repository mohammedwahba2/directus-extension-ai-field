<template>
    <div class="ai-field">
      <v-textarea
        v-if="isTextarea"
        :model-value="value"
        :placeholder="placeholder"
        @update:model-value="$emit('input', $event)"
      />
      <v-input
        v-else
        :model-value="value"
        :placeholder="placeholder"
        @update:model-value="$emit('input', $event)"
      />
  
      <div class="ai-field__actions">
        <AiButton :loading="loading" @click="handleGenerate" />
        <span v-if="error" class="ai-field__error">{{ error }}</span>
      </div>
  
      <div v-if="showPromptInput" class="ai-field__prompt">
        <v-input
          v-model="customPrompt"
          placeholder="Describe what you want to generate..."
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import AiButton from './AiButton.vue'
  import { useAi } from '../composables/useAi'
  import { usePrompt } from '../composables/usePrompt'
  import type { AiFieldOptions } from '../types'
  
  const props = defineProps<{
    value: string | null
    disabled: boolean
    placeholder?: string
    field: string
    collection: string
    width: string
    type: string
    options: AiFieldOptions
  }>()
  
  const emit = defineEmits<{
    input: [value: string]
  }>()
  
  const { generate, loading, error } = useAi()
  const { buildPrompt } = usePrompt()
  
  const customPrompt = ref('')
  const showPromptInput = ref(true)
  
  const isTextarea = computed(() =>
    ['text', 'string'].includes(props.type) && props.width === 'full'
  )
  
  const handleGenerate = async () => {
    const prompt = buildPrompt(
      customPrompt.value || props.options.promptTemplate || 'Write content for: {{value}}',
      props.value || '',
      props.options.tone || 'default'
    )
  
    const result = await generate(
      prompt,
      props.options.provider || 'claude',
      props.options.tone || 'default',
      props.options.maxTokens || 500
    )
  
    if (result) emit('input', result)
  }
  </script>
  
  <style scoped>
  .ai-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ai-field__actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ai-field__error {
    color: var(--theme--danger);
    font-size: 12px;
  }
  .ai-field__prompt {
    margin-top: 4px;
  }
  </style>