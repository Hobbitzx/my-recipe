<template>
  <div class="sticky top-0 z-20 bg-morandi-bg/95 backdrop-blur-sm px-4 h-14 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-3">
      <button 
        v-if="onBack"
        @click="onBack"
        class="p-2 -ml-2 rounded-full hover:bg-morandi-primary/10 text-morandi-text transition-colors"
      >
        <ArrowLeft :size="24" />
      </button>
      <h1 class="text-xl font-semibold text-morandi-text tracking-wide truncate max-w-[200px] sm:max-w-md">
        {{ title }}
      </h1>
    </div>
    <div>
      <slot name="rightAction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';

interface Props {
  title: string;
  onBack?: () => void;
}

defineProps<Props>();
</script>

