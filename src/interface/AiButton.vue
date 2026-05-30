<template>
    <button
      class="ai-button"
      :class="{ loading }"
      :disabled="loading"
      @click="$emit('click')"
    >
      <span v-if="loading" class="spinner" />
      <span v-else>✦ Generate</span>
    </button>
  </template>
  
  <script setup lang="ts">
  defineProps<{ loading: boolean }>()
  defineEmits<{ click: [] }>()
  </script>
  
  <style scoped>
  .ai-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid var(--theme--primary);
    background: transparent;
    color: var(--theme--primary);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .ai-button:hover:not(:disabled) {
    background: var(--theme--primary);
    color: #fff;
  }
  .ai-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  </style>