<template>
  <div class="ai-field">
    <!-- Main input -->
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

    <!-- Custom prompt input -->
    <v-input
      v-model="customPrompt"
      class="ai-field__prompt-input"
      placeholder="Describe what you want to generate... (leave empty to use template)"
    >
      <template #prepend>
        <v-icon name="auto_awesome" small />
      </template>
    </v-input>

    <!-- Actions row -->
    <div class="ai-field__actions">
      <AiButton :loading="loading" @click="handleGenerate" />

      <button
        v-if="history.length > 0 && !loading"
        class="ai-field__regen-btn"
        title="Regenerate"
        @click="handleGenerate"
      >
        <v-icon name="refresh" small />
        Regenerate
      </button>

      <span v-if="error" class="ai-field__error">
        <v-icon name="error_outline" small />
        {{ error }}
      </span>
    </div>

    <!-- History -->
    <div v-if="history.length > 0" class="ai-field__history">
      <div class="ai-field__history-header">
        <v-icon name="history" x-small />
        <span>Previous results</span>
      </div>
      <div
        v-for="(item, index) in history"
        :key="index"
        class="ai-field__history-item"
        :title="'Generated with ' + item.provider"
        @click="applyHistory(item.content)"
      >
        <span class="ai-field__history-provider">{{ item.provider }}</span>
        <span class="ai-field__history-preview">{{ truncate(item.content) }}</span>
        <v-icon name="keyboard_return" x-small class="ai-field__history-apply-icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AiButton from './AiButton.vue'
import { useAi } from '../composables/useAi'
import { usePrompt } from '../composables/usePrompt'
import type { AiFieldOptions, GenerationHistory } from '../types'

const props = defineProps<{
  value: string | null
  disabled: boolean
  placeholder?: string
  field: string
  collection: string
  width: string
  type: string
  primaryKey?: string | number
  values?: Record<string, any>   // other fields in the same item
  options: AiFieldOptions
}>()

const emit = defineEmits<{
  input: [value: string]
}>()

const { generate, loading, error } = useAi()
const { buildPrompt } = usePrompt()

const customPrompt = ref('')
const history = ref<GenerationHistory[]>([])
const MAX_HISTORY = 3

const isTextarea = computed(() =>
  ['text', 'string'].includes(props.type) && props.width === 'full'
)

const truncate = (text: string, max = 80) =>
  text.length > max ? text.slice(0, max) + '…' : text

const handleGenerate = async () => {
  const template = customPrompt.value || props.options?.promptTemplate || 'Write content for: {{value}}'

  const prompt = buildPrompt(
    template,
    props.value || '',
    props.options?.tone || 'default',
    props.values || {}
  )

  const result = await generate(
    prompt,
    props.options?.provider || 'claude',
    props.options?.tone || 'default',
    props.options?.maxTokens || 500
  )

  if (result) {
    // Save current value to history before replacing
    if (props.value) {
      history.value.unshift({
        content: props.value,
        provider: props.options?.provider || 'claude',
        timestamp: Date.now(),
      })
      if (history.value.length > MAX_HISTORY) {
        history.value = history.value.slice(0, MAX_HISTORY)
      }
    }
    emit('input', result)
  }
}

const applyHistory = (content: string) => {
  emit('input', content)
}
</script>

<style scoped>
.ai-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-field__prompt-input {
  --v-input-font-size: 13px;
}

.ai-field__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-field__regen-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--theme--border-color);
  background: transparent;
  color: var(--theme--foreground-subdued);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.ai-field__regen-btn:hover {
  border-color: var(--theme--primary);
  color: var(--theme--primary);
}

.ai-field__error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--theme--danger);
  font-size: 12px;
}

/* History */
.ai-field__history {
  border: 1px solid var(--theme--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.ai-field__history-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--theme--background-subdued);
  color: var(--theme--foreground-subdued);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-field__history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  border-top: 1px solid var(--theme--border-color);
  transition: background 0.1s;
}

.ai-field__history-item:hover {
  background: var(--theme--background-subdued);
}

.ai-field__history-item:hover .ai-field__history-apply-icon {
  opacity: 1;
}

.ai-field__history-provider {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--theme--primary);
  min-width: 44px;
}

.ai-field__history-preview {
  flex: 1;
  font-size: 12px;
  color: var(--theme--foreground-subdued);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-field__history-apply-icon {
  opacity: 0;
  transition: opacity 0.1s;
  color: var(--theme--foreground-subdued);
}
</style>